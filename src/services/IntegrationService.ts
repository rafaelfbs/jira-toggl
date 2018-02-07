import * as moment from "moment";

import { TogglService, MarkEntryAsLoggedCommand } from "./TogglService";
import { JiraService, LogIssueCommand } from "./JiraService";

interface JiraEntryData {
  issueKey: string;
  comment: string;
  entry: any;
}

export class IntegrationService {
  private togglService: TogglService;
  private jiraService: JiraService;

  public constructor(togglService, jiraService) {
    this.togglService = togglService;
    this.jiraService = jiraService;
  }

  public update() {
    return this.togglService
      .getUnloggedEntries()
      .then(entries =>
        entries
          .map(entry => this.parseJiraDataFromTogglEntry(entry))
          .filter(_ => _)
          .forEach(data => {
            const logIssueCommand = this.createLogIssueCommandForEntry(data.entry, data);
            this.jiraService
              .logIssue(logIssueCommand)
              .then(() => {
                const command = this.createMarkEntryAsLoggedCommand(data.entry);

                return this.togglService
                  .markEntryAsLogged(command)
                  .then(entry => console.log(`Issue "${logIssueCommand.issueKey}" updated`))
                  .catch(err => console.warn(err));
              })
              .catch(err => console.warn(err));
          })
      )
      .catch(err => console.warn(err));
  }

  private parseJiraDataFromTogglEntry(entry): JiraEntryData {
    if (!entry.description) return null;

    const match = entry.description.match(/^\[(\w+\-\d+)\](.*)/);
    return match
        ? { issueKey: match[1].trim(), comment: match[2].trim(), entry }
        : null;
  }

  private createLogIssueCommandForEntry(entry, data: JiraEntryData): LogIssueCommand {
    return {
      issueKey: data.issueKey,
      comment: data.comment,
      started: moment(entry.start).format('YYYY-MM-DD[T]HH:mm:ss.SSSZZ'),
      timeSpentSeconds: entry.duration,
    };
  }

  private createMarkEntryAsLoggedCommand(entry): MarkEntryAsLoggedCommand {
    return {
      entryId: entry.id,
      currentTags: entry.tags || [],
    };
  }
}

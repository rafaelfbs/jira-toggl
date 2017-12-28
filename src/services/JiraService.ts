import { JiraApi as JiraClient } from "jira";

export interface LogIssueCommand {
  issueKey: string;
  comment: string;
  started: string;
  timeSpentSeconds: number;
}

interface Worklog {
  comment: string;
  started: string;
  timeSpentSeconds: number;
}

export class JiraService {
  private client: JiraClient;
  private config;

  public constructor(client, config) {
    this.client = client;
    this.config = config;
  }

  public logIssue(command: LogIssueCommand) {
    const worklog = this.createWorklogDTO(command);

    return new Promise<any>((resolve, reject) => {
      this.client.addWorklog(command.issueKey, worklog, (err, issue) => {
        if (err) return reject(err);
        return resolve(issue);
      });
    });
  }

  private createWorklogDTO(command: LogIssueCommand): Worklog {
    return {
      comment: command.comment,
      started: command.started,
      timeSpentSeconds: command.timeSpentSeconds,
    };
  }
}

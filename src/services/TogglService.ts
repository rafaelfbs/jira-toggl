import * as TogglClient from "toggl-api";
import * as moment from "moment";

export interface MarkEntryAsLoggedCommand {
  entryId: number;
  currentTags: string[];
}

export class TogglService {
  private client: TogglClient;
  private config;

  public constructor(client: TogglClient, config) {
    this.client = client;
    this.config = config;
  }

  public getEntries() {
    return new Promise<any[]>((resolve, reject) =>
      this.client.getTimeEntries(moment().subtract(30, 'days').toDate(), moment().toDate(), (err, entries) => {
        if (err) return reject(err);
        return resolve(entries);
      })
    );
  }

  public getUnloggedEntries() {
    return this.getEntries()
      .then(entries =>
        entries
          .filter(entry => !this.isEntryLogged(entry))
      );
  }

  public markEntryAsLogged(command: MarkEntryAsLoggedCommand) {
    const tags = [...command.currentTags, this.config.loggedTag];
    const entryData = { tags };

    return new Promise<any>((resolve, reject) => {
      this.client.updateTimeEntry(command.entryId, entryData, (err, entry) => {
          if (err) return reject(err);
          return resolve(entry);
      });
    });
  }

  private isEntryLogged(entry) {
    return entry.tags && entry.tags.includes(this.config.loggedTag);
  }
}

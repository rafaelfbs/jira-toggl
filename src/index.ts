import * as TogglClient from "toggl-api";
import { JiraApi as JiraClient } from "jira";
import * as prompt from "prompt";

import { TogglService } from "./services/TogglService";
import { JiraService } from "./services/JiraService";
import { IntegrationService } from "./services/IntegrationService";

const promptSchema = {
  properties: {
    jiraUrl: {
      required: true,
    },
    togglApiToken: {
      required: true,
    },
    jiraUser: {
      required: true,
    },
    jiraPass: {
      required: true,
      hidden: true,
    },
    loggedTag: {
      required: true,
    }
  },
};

prompt.start();

prompt.get(promptSchema, (err, data) => {
    const toggl = new TogglClient({ apiToken: data.togglApiToken });
    const jira = new JiraClient('http', data.jiraUrl, 80, data.jiraUser, data.jiraPass, '2');
    const config = { loggedTag: data.loggedTag };

    const togglService = new TogglService(toggl, config);
    const jiraService = new JiraService(jira, config);
    const integrationService = new IntegrationService(togglService, jiraService);

    integrationService.update();
});

import * as TogglClient from "toggl-api";
import { JiraApi as JiraClient } from "jira";
import * as prompt from "prompt";
import * as Store from "data-store";
import { promptWithPersistence } from "./decorators/prompt";

import { TogglService } from "./services/TogglService";
import { JiraService } from "./services/JiraService";
import { IntegrationService } from "./services/IntegrationService";

const store = Store('jira-toggl');

promptWithPersistence(store, prompt);

const promptSchema = {
    properties: {
        jiraUrl: {
            required: true,
            persisted: true,
        },
        togglApiToken: {
            required: true,
            persisted: true,
        },
        jiraUser: {
            required: true,
            persisted: true,
        },
        jiraPass: {
            required: true,
            hidden: true,
        },
        loggedTag: {
            required: true,
            persisted: true,
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

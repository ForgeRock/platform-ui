import {
  putAMResource,
  putIDMResource,
  getIDMThemes,
  deleteAMResource,
  deleteIDMResource,
  postAMResource,
} from '../api/journeyApi.e2e';

const maxRetryCount = 5;

function createScript(id, body) {
  return putAMResource(Cypress.env('IS_FRAAS') ? '/alpha/' : '/', 'scripts', id, body);
}

function createEmailTemplate(body) {
  return putIDMResource('config', body._id, body);
}

function existTheme(themeList, themeName) {
  return themeList.some((theme) => theme.name === themeName);
}

function updateThemes(themes) {
  return putIDMResource('config/ui', 'themerealm', themes);
}

function createTheme(body, retry = 0) {
  if (retry > maxRetryCount) {
    throw new Error(`Max retries(${maxRetryCount}) for 'createTheme' reached!`);
  }

  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';

  // First need to get all Themes
  return getIDMThemes().then((response) => {
    // First we check if theme already exists in the Themes list (there is no duplicate check in place)
    if (!existTheme(response.body.realm[realm], body.name)) {
      // Now append Theme to the current Themes list
      const themes = response.body;
      themes.realm[realm].push(body);

      // Upload modified Themes list
      updateThemes(themes);

      // Make sure theme was uploaded successfully
      getIDMThemes().then((checkResponse) => {
        if (!existTheme(checkResponse.body.realm[realm], body.name)) {
          // Something went wrong, retry to add Theme
          createTheme(body, retry + 1);
        }
      });
    }
  });
}

function createNode(body) {
  return putAMResource(Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/realm-config/' : '/realms/root/realm-config/', `authentication/authenticationtrees/nodes/${body._type._id}`, body._id, body);
}

function createJourney(id, body) {
  return putAMResource(Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/realm-config/' : '/realms/root/realm-config/', 'authentication/authenticationtrees/trees', id, body);
}

function deleteAMResourceWithRetry(realm = Cypress.env('IS_FRAAS') ? '/alpha/' : '', resource = 'authentication/authenticationtrees/trees', id, retry = 0) {
  if (retry > maxRetryCount) {
    throw new Error(`Max retries(${maxRetryCount}) for 'deleteAMResource' reached!`);
  }

  return deleteAMResource(realm, resource, id).then((response) => {
    if (response.status === 200 || response.status === 404) {
      // Successfully deleted AM Resource or it was already deleted
      return response;
    }

    // Retry to create AM Social Provider Node
    return deleteAMResourceWithRetry(realm, resource, id, retry + 1);
  });
}

function deleteJourney(id) {
  return deleteAMResourceWithRetry(Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/realm-config/' : '/realms/root/realm-config/', 'authentication/authenticationtrees/trees', id);
}

function deleteNode(nodeId, id) {
  return deleteAMResourceWithRetry(Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/realm-config/' : '/realms/root/realm-config/', `authentication/authenticationtrees/nodes/${nodeId}`, id);
}

function deleteTheme(id, retry = 0) {
  if (retry > maxRetryCount) {
    throw new Error(`Max retries(${maxRetryCount}) for 'deleteTheme' reached!`);
  }

  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';

  // First need to get all Themes
  return getIDMThemes().then((response) => {
    // Now find and delete Theme
    const themes = response.body;
    themes.realm[realm] = themes.realm[realm].filter((elem) => elem.name !== id);

    // Upload modified Themes list
    updateThemes(themes);

    // Make sure theme was deleted correctly (it's no longer in the Themes list)
    getIDMThemes().then((checkResponse) => {
      checkResponse.body.realm[realm].forEach((theme) => {
        if (theme.name.includes(id)) {
          // Something went wrong, retry to delete Theme
          deleteTheme(id, retry + 1);
        }
      });
    });
  });
}

function deleteEmailTemplate(id) {
  return deleteIDMResource('config', 'emailTemplate', id);
}

function deleteSocialProviderNode(id) {
  return deleteAMResourceWithRetry(Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/realm-config/' : '/realms/root/realm-config/', 'services/SocialIdentityProviders/oidcConfig', id);
}

function createSocialProviderNode(id, body, retry = 0) {
  if (retry > maxRetryCount) {
    throw new Error(`Max retries(${maxRetryCount}) for 'createAMSocialProviderNode' reached!`);
  }

  return postAMResource(Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/realm-config/' : '/realms/root/realm-config/', 'services/SocialIdentityProviders/oidcConfig', body).then((response) => {
    if (response.status === 409) {
      // Resource already exists, so we just need to delete it first
      deleteSocialProviderNode(id);
    }

    if (response.status === 201) {
      // Successfully AM Social Provider Node
      return response;
    }

    // Retry to create AM Social Provider Node
    return createSocialProviderNode(id, body, retry + 1);
  });
}

function deleteScript(id) {
  return deleteAMResourceWithRetry(Cypress.env('IS_FRAAS') ? '/alpha/' : '/', 'scripts', id);
}

/**
 * This function goes through every fixture file parsing it and importing all Journeys ant it's dependencies using the API
 * @param {Array} fixtureArray an array containing the name of test fixture files to parse and import all dependencies
 */
export function importJourneysViaAPI(fixtureArray) {
  fixtureArray.forEach((fixtureName) => {
    const fixture = `e2e/fixtures/${fixtureName}`;
    // Read Fixture file
    cy.readFile(fixture).then((fixtureData) => {
      // Import each Journey from the fixture file
      for (const [fixtureKey, fixtureObj] of Object.entries(fixtureData.trees)) {
        // Import all Scripts
        Object.values(fixtureObj.scripts).forEach((script) => {
          const scriptContent = JSON.parse(script.script);
          script.script = btoa(scriptContent);
          createScript(script._id, script);
        });

        // Import all Social Identity Providers
        Object.values(fixtureObj.socialIdentityProviders).forEach((socialIdentityProvider) => {
          const socialIdentityProviderName = socialIdentityProvider._id.replaceAll(' ', '%20');
          createSocialProviderNode(socialIdentityProviderName, socialIdentityProvider);
        });

        // Import all Email Templates
        Object.values(fixtureObj.emailTemplates).forEach((emailTemplate) => {
          createEmailTemplate(emailTemplate);
        });

        // Import all Themes
        Object.values(fixtureObj.themes).forEach((theme) => {
          createTheme(theme);
        });

        // Import all Inner Nodes
        Object.values(fixtureObj.innerNodes).forEach((innerNode) => {
          delete innerNode._rev;
          createNode(innerNode);
        });

        // Import all Nodes
        Object.values(fixtureObj.nodes).forEach((node) => {
          delete node._rev;
          createNode(node);
        });

        // And import Journey itself
        const journeyName = fixtureKey.replaceAll(' ', '%20');
        const journey = fixtureObj.tree;
        delete journey._rev;
        createJourney(journeyName, journey);
      }
    });
  });
}

/**
 * This function goes through every fixture file parsing it and deleting all Journeys and it's dependencies using the API
 * @param {Array} fixtureArray an array containing the name of test fixture files to parse and delete all dependencies
 */
export function deleteJourneysViaAPI(fixtureArray) {
  fixtureArray.forEach((fixtureName) => {
    const fixture = `e2e/fixtures/${fixtureName}`;
    // Read Fixture file
    cy.readFile(fixture).then((fixtureData) => {
      // Import each Journey from the fixture file
      for (const [fixtureKey, fixtureObj] of Object.entries(fixtureData.trees)) {
        // Delete Journey itself first
        const journeyName = fixtureKey.replaceAll(' ', '%20');
        deleteJourney([journeyName]);

        // Then delete everything else in correct order
        // Delete all Nodes
        Object.values(fixtureObj.nodes).forEach((node) => {
          deleteNode(node._type._id, node._id);
        });

        // Delete all Inner Nodes
        Object.values(fixtureObj.innerNodes).forEach((innerNode) => {
          deleteNode(innerNode._type._id, innerNode._id);
        });

        // Delete all Themes
        Object.values(fixtureObj.themes).forEach((theme) => {
          deleteTheme(theme.name);
        });

        // Delete all Email Templates
        Object.keys(fixtureObj.emailTemplates).forEach((emailTemplate) => {
          deleteEmailTemplate(emailTemplate);
        });

        // Delete all Social Identity Providers
        Object.keys(fixtureObj.socialIdentityProviders).forEach((socialIdentityProvider) => {
          deleteSocialProviderNode(socialIdentityProvider);
        });

        // Delete all Scripts
        Object.keys(fixtureObj.scripts).forEach((scriptID) => {
          deleteScript(scriptID);
        });
      }
    });
  });
}

/**
 * Prepare the Journey template to be used in the correct Environment (Cloud or ForgeOps)
 * @param {String} templateName a Journey template location
 * @param {String} loginRealm an Environment Login Realm to be replaced in Journey template file (example 'alpha' for Cloud, '/' for ForgeOps)
 * @param {String} userRealm an Environment User Realm to be replaced in Journey template file (example 'alpha_' for Cloud, '' for ForgeOps)
 */
export function prepareJourneyTemplate(templateName, replaceDict) {
  // Prepare Journey template path
  const preparedJourneyName = templateName.replace('_template', '');
  const templatePath = `e2e/fixtures/${templateName}`;
  const preparedJourneyPath = `e2e/fixtures/${preparedJourneyName}`;

  // Read template file
  cy.readFile(templatePath).then((data) => {
    let updatedTemplate = JSON.stringify(data);

    // Replace all requested key with correct testing values
    for (const [key, value] of Object.entries(replaceDict)) {
      // console.log(`Replacing ${key} with ${value}`);
      const regex = new RegExp(key, 'g');
      const escapedValue = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      updatedTemplate = updatedTemplate.replace(regex, escapedValue);
    }
    // console.log(`Updated Template: ${updatedTemplate}`);
    // Write moditied data back to the template file
    cy.writeFile(preparedJourneyPath, JSON.parse(updatedTemplate));
  });

  return preparedJourneyName;
}

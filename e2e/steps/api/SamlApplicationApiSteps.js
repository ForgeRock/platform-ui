/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import createApplication, {
  deleteApplication,
  getApplication,
  patchApplication,
} from '@e2e/api/applicationsApi.e2e';
import {
  addToCircleOfTrust,
  buildHostedEntityPayload,
  buildMetaAlias,
  createHostedSaml2Entity,
  deleteSaml2Entity,
  getLatestSamlTemplate,
  getSaml2PrivateId,
  importRemoteSaml2Entity,
} from '@e2e/api/saml2Api.e2e';
import { random } from 'lodash';

export default class SamlApplicationApiSteps {
  static createdApplicationIds = [];

  // entityID must be unique per realm, so the checked-in fixture template's
  // placeholder is substituted with a per-run value before importing
  static SP_FIXTURE_PATH = 'saml/sp-metadata.xml';

  static SP_ENTITY_ID_TEMPLATE = '__SP_ENTITY_ID__';

  /**
   * Create a SAML custom application via API the same way the UI wizard does:
   * a managed application with templateName 'saml' and empty ssoEntities (the
   * AM entity providers are only created later via the Set Up SSO flow).
   * The templateVersion is taken from the same CDN template setupHostedEntity
   * builds the hosted IdP payload from, so the app record and the entity payload
   * can never claim different versions.
   * Tracked by deleteCreatedApplications so the AM entity providers (if the test
   * configured SSO) are deleted before the managed application.
   * @param {Object} options
   * @param {string} options.appName - Name of the managed application
   * @param {string} options.ownerId - Managed user id set as the application owner
   * @returns {Cypress.Chainable} The response from the create application request
   */
  static createApplication({ appName, ownerId }) {
    const userResource = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    return getLatestSamlTemplate().then(({ templateVersion }) => createApplication({
      name: appName,
      owners: [{ _ref: `managed/${userResource}/${ownerId}`, _refProperties: {} }],
      templateName: 'saml',
      templateVersion,
      ssoEntities: {},
    }).then((response) => {
      expect(response.status).to.equal(201);
      SamlApplicationApiSteps.createdApplicationIds.push(response.body._id);
      return response;
    }));
  }

  /**
   * Set up SSO for a SAML application the way the UI's Set Up SSO flow does:
   * create the hosted IdP entity provider in AM (from the same CDN template the
   * app was created with) and link its private id into the managed application's
   * ssoEntities.
   * @param {string} applicationId - Id of the managed application
   * @param {string} appName - Name of the managed application
   * @returns {Cypress.Chainable} Resolves to the created AM entity response
   */
  static setupHostedEntity(applicationId, appName) {
    return buildHostedEntityPayload(appName).then(({ payload }) => createHostedSaml2Entity(payload).then((entityResponse) => {
      expect(entityResponse.status, `hosted IdP entity create failed: ${JSON.stringify(entityResponse.body)}`).to.equal(201);
      const ssoEntities = {
        idpPrivateId: entityResponse.body._id,
        idpLocation: 'hosted',
        domain: Cypress.env('FQDN'),
      };
      return SamlApplicationApiSteps.mergeSsoEntities(applicationId, ssoEntities).then(() => entityResponse);
    }));
  }

  /**
   * Import a remote SP entity from a unique per-run SP metadata document and
   * complete the SSO setup the way the UI's upload step does: importEntity →
   * spPrivateId lookup → FR_COT membership → PATCH ssoEntities (spPrivateId,
   * spLocation, idpLoginUrl). The idpLoginUrl is what makes the enduser
   * Applications tile render.
   * @param {string} applicationId - Id of the managed application
   * @param {string} appName - Name of the managed application (drives the metaAlias)
   * @returns {Cypress.Chainable} Resolves to { spEntityId, importResponse } — the
   *   unique entityID substituted into the metadata and the importEntity response
   */
  static setupRemoteEntity(applicationId, appName) {
    const spEntityId = `https://e2e-sp.example.com/metadata/${random(Number.MAX_SAFE_INTEGER)}`;
    return cy.readFixtureFile(SamlApplicationApiSteps.SP_FIXTURE_PATH).then((template) => {
      const spXml = template.replace(SamlApplicationApiSteps.SP_ENTITY_ID_TEMPLATE, spEntityId);
      return importRemoteSaml2Entity(spXml).then((importResponse) => {
        expect(importResponse.status, `remote SP import failed: ${JSON.stringify(importResponse.body)}`).to.equal(200);
        const spEntityIdImported = importResponse.body.importedEntities[0];
        return getSaml2PrivateId(spEntityIdImported).then((spPrivateId) => {
          expect(spPrivateId, 'imported SP entity not found in AM').to.not.equal(null);
          return addToCircleOfTrust(spEntityIdImported).then(() => {
            const ssoEntities = {
              spPrivateId,
              spLocation: 'remote',
              idpLoginUrl: `https://${Cypress.env('FQDN')}/am/idpssoinit?metaAlias=${buildMetaAlias(appName)}&spEntityID=${encodeURIComponent(spEntityId)}`,
            };
            return SamlApplicationApiSteps.mergeSsoEntities(applicationId, ssoEntities).then(() => ({ spEntityId, importResponse }));
          });
        });
      });
    });
  }

  /**
   * Grant a managed user access to the application — mirrors the UI's Users &
   * Roles "Add Member", which appends the user to the application's members
   * relationship (the edge that drives effectiveApplications and the enduser
   * My Apps tile; owners only grants admin capability via ownerOfApp).
   * Retries on 412: the ssoEntities PATCH immediately before this one bumps the
   * revision, and IDM can briefly serve a stale _rev to the read here.
   * @param {string} applicationId - Id of the managed application
   * @param {string} userId - Managed user id to assign
   * @returns {Cypress.Chainable} The response from the members PATCH
   */
  static assignUser(applicationId, userId, attempt = 0) {
    const userResource = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    return getApplication(applicationId).then((getResponse) => {
      expect(getResponse.status).to.equal(200);
      const members = getResponse.body.members || [];
      if (members.some((member) => member._ref.endsWith(`/${userId}`))) {
        return cy.wrap(getResponse);
      }
      return patchApplication(
        applicationId,
        [{
          operation: 'add',
          field: '/members/-',
          value: { _ref: `managed/${userResource}/${userId}`, _refProperties: {} },
        }],
        getResponse.body._rev,
        { failOnStatusCode: false },
      ).then((patchResponse) => {
        // A 412 with "Duplicate relationship" means the member is already in
        // place (IDM applied a racing write) — treat as success; a plain 412
        // is a stale _rev from the preceding ssoEntities PATCH — re-read and retry
        const isDuplicate = patchResponse.status === 412
          && `${patchResponse.body?.message || ''}`.includes('Duplicate relationship');
        if (isDuplicate) return patchResponse;
        if (patchResponse.status === 412 && attempt < 5) {
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(1000);
          return SamlApplicationApiSteps.assignUser(applicationId, userId, attempt + 1);
        }
        expect(patchResponse.status, `members assignment failed: ${JSON.stringify(patchResponse.body)}`).to.equal(200);
        return patchResponse;
      });
    });
  }

  /**
   * Merge the given ssoEntities entries into the managed application's
   * ssoEntities via a guarded PATCH (read the current record for its _rev and
   * existing entries first).
   * @param {string} applicationId - Id of the managed application
   * @param {Object} ssoEntitiesToAdd - ssoEntities entries to merge in
   * @returns {Cypress.Chainable} The response from the patch request
   */
  static mergeSsoEntities(applicationId, ssoEntitiesToAdd) {
    return getApplication(applicationId).then((getResponse) => {
      expect(getResponse.status).to.equal(200);
      const ssoEntities = {
        ...(getResponse.body.ssoEntities || {}),
        ...ssoEntitiesToAdd,
      };
      return patchApplication(applicationId, [{ operation: 'add', field: '/ssoEntities', value: ssoEntities }], getResponse.body._rev);
    });
  }

  /**
   * Delete the tracked SAML applications the way the UI does: AM entity
   * providers first (hosted IdP, then remote SP), then the managed application.
   * Applications already deleted (e.g. by a UI delete in the test) and entity
   * providers already gone are treated as success, so the cleanup never fails
   * a passing test.
   */
  static deleteCreatedApplications() {
    return cy.wrap([...SamlApplicationApiSteps.createdApplicationIds]).then((ids) => {
      if (!ids.length) return cy.wrap(null);
      SamlApplicationApiSteps.createdApplicationIds = [];

      return cy.wrap(ids).each((id) => getApplication(id).then((getResponse) => {
        // App already gone (e.g. deleted through the UI) — nothing to clean up
        if (!getResponse.isOkStatusCode) return null;

        const ssoEntities = getResponse.body.ssoEntities || {};
        return cy.wrap(null)
          .then(() => {
            if (ssoEntities.idpPrivateId) {
              return deleteSaml2Entity(ssoEntities.idpPrivateId, 'hosted');
            }
            return null;
          })
          .then(() => {
            if (ssoEntities.spPrivateId) {
              return deleteSaml2Entity(ssoEntities.spPrivateId, 'remote');
            }
            return null;
          })
          .then(() => deleteApplication(id).then((deleteResponse) => {
            // 404 means the app was already deleted (e.g. through the UI)
            if (!deleteResponse.isOkStatusCode && deleteResponse.status !== 404) {
              throw new Error(`Failed to delete managed application ${id} — tenant may be in a dirty state. Status: ${deleteResponse.status}`);
            }
          }));
      }));
    });
  }
}

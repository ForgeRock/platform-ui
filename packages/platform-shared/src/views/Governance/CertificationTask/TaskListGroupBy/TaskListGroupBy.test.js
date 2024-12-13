/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createTooltipContainer, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '../../../../utils/testPiniaHelpers';
import i18n from '@/i18n';
import TaskListGroupBy from './index';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

describe('Glossary', () => {
  createTooltipContainer([
    'btnAllowException-01fec9de-a9e7-435b-8d16-2b2367714278',
    'btnRevoke-01fec9de-a9e7-435b-8d16-2b2367714278',
    'btnCertify-01fec9de-a9e7-435b-8d16-2b2367714278',
    'flags-01fec9de-a9e7-435b-8d16-2b2367714278-1',
    'flags-01fec9de-a9e7-435b-8d16-2b2367714278-0',
    'btnCertify-01fec9de-a9e7-435b-8d16-2b2367714278',
  ]);
  const setup = () => mount(TaskListGroupBy, {
    global: {
      plugins: [i18n, Notifications],
      mocks: {
        $bvModal: {
          show: jest.fn(),
        },
      },
    },
    props: {
      actorId: 'managed/user/b29d411e-987e-4f67-afc7-1c590718179b',
      campaignDetails: {
        status: 'in-progress',
        certObjectType: 'user',
        name: 'asdfasdf',
        description: 'asdfasdf',
        isEventBased: false,
        stagingEnabled: false,
        schedule: null,
        skipInactiveCertifiers: false,
        allowSelfCertification: false,
        selfCertificationRule: 'none',
        enableForward: true,
        enableReassign: true,
        reassignPermissions: {
          certify: true, comment: true, claim: true, delegate: true, exception: true, forward: true, reassign: true, reset: true, revoke: true, save: true, signoff: true,
        },
        exceptionDuration: 14,
        allowBulkCertify: true,
        allowPartialSignoff: false,
        showRemediationRule: false,
        remediationRule: 'BasicRevocation',
        showInitializeRule: false,
        initializeRule: '',
        showFinalizeRule: false,
        finalizeRule: '',
        certificationType: 'identity',
        ownerId: 'managed/user/b29d411e-987e-4f67-afc7-1c590718179b',
        stageDuration: 14,
        expirationAction: null,
        expirationActionDelay: 0,
        expirationReassignee: null,
        stages: [{
          certifierType: 'user',
          certifierId: 'managed/user/b29d411e-987e-4f67-afc7-1c590718179b',
          certifierScript: null,
          certifierInfo: {
            mail: 'igaadmin@fr.com', givenName: 'iga', id: 'b29d411e-987e-4f67-afc7-1c590718179b', sn: 'admin', userName: 'igaadmin',
          },
        }],
        defaultCertifierId: null,
        assignmentNotification: 'emailTemplate/certificationAssigned',
        assignmentNotificationIncludeManager: false,
        reassignNotification: 'emailTemplate/certificationReassigned',
        expirationNotification: null,
        reminderNotification: null,
        reminderFrequency: 0,
        escalationNotification: null,
        escalationFrequency: null,
        escalationOwner: null,
        remediationDelay: 0,
        targetFilter: {
          type: ['accountGrant', 'entitlementGrant'], user: { operator: 'ALL', operand: [] }, application: { operator: 'EQUALS', operand: { targetName: 'authoritative', targetValue: false } }, account: { operator: 'ALL', operand: [] }, entitlement: { operator: 'ALL', operand: [] }, decision: { operator: 'ALL', operand: [] },
        },
        duration: 14,
        ownerInfo: {
          mail: 'igaadmin@fr.com', givenName: 'iga', id: 'b29d411e-987e-4f67-afc7-1c590718179b', sn: 'admin', userName: 'igaadmin',
        },
        id: '3fa7d00e-543e-4b6b-8c5b-4c0cbfcd80de',
        templateId: 'ff4220bc-b2c7-484c-9466-00b1601b9e61',
        startDate: '2023-04-27T19:41:00+00:00',
        deadline: '2023-05-11T19:41:00+00:00',
        completionDate: null,
        reminderNotificationDate: null,
        escalationNotificationDate: null,
        systemMessages: { errors: [], info: [] },
        etlJobId: null,
        totals: { total: 22, 'in-progress': 13 },
        progress: 0.4090909090909091,
        statistics: {
          userCount: { new: 7 },
          usersMissingEmail: 0,
          actorsMissingEmail: 0,
          entitlementsWithoutOwner: 5,
          applications: { TargetADApp: 22, total: 22 },
          entitlements: {
            'Zoran User': 7, 'Zoran Admin': 3, 'Zoran Entitlement Owner': 3, 'Zoran Executive': 1, 'Zoran Supervisor': 1, total: 15,
          },
          previousDecision: { previouslyReviewed: 0, total: 22 },
          currentDecision: {
            revoke: 2, abstain: 0, certify: 7, exception: 0, noDecision: 13,
          },
          decisionsByApplication: { TargetADApp: 22 },
          decisionsByRole: {},
          primaryReviewer: { total: 3, 'in-progress': 2, complete: 1 },
        },
      },
      campaignId: '3fa7d00e-543e-4b6b-8c5b-4c0cbfcd80de',
      certificationGrantType: 'accounts',
      isAdmin: true,
      isEntitlementCertificationType: false,
      refreshTasks: false,
      showGroupBy: true,
    },
    stubs: {
      BTooltip: true,
    },
  });
  beforeEach(() => {
    setupTestPinia({ user: { userId: '1234' } });
    jest.spyOn(CommonsApi, 'getGlossarySchema').mockReturnValue(Promise.resolve({ data: { result: [] } }));
    jest.spyOn(CertificationApi, 'getCertificationCounts').mockReturnValue(Promise.resolve({
      data: {
        result: [],
        resultCount: 0,
        totalHits: 18,
        totals: {
          NONE: 12, certify: 5, revoke: 1, total: 18,
        },
      },
    }));
    jest.spyOn(CertificationApi, 'getCertificationTasksListByCampaign').mockReturnValue(Promise.resolve({
      data: {
        result: [{
          item: { type: 'entitlementGrant' },
          latestCreationTime: {
            user: '2023-04-27T18:43:07.88Z', account: '2023-04-27T18:43:08.454Z', entitlement: '2023-04-27T17:51:04.804Z', application: '2023-04-27T17:36:58.87Z', applicationOwner: [{ ownerId: 'b29d411e-987e-4f67-afc7-1c590718179b', created: '2023-04-27T17:07:53.707Z' }],
          },
          keys: {
            type: 'entitlementGrant', userId: '6a146b39-f45b-40f7-8e89-c473e4e553fa', applicationId: '4ab98652-0a20-4cef-bcdb-35e1edf60093', accountId: 'c7c5b4b3-e723-48a8-ad15-4176f15f82f0', entitlementId: '0fcfd73c-6c0a-4ad3-a580-95795af493c5',
          },
          compositeId: 'be2eadf289400b8a459fac28ed48f405325d9ab1503c21697b5da35c6e50c3d3d1306a3423464abd259ad640484860df327ed20343c03cf9550b3da1202b386d',
          relationship: { id: 'dd1ed03b-b42e-444f-9fcb-2912bfe1158c', properties: { grantTypes: [{ grantType: 'recon' }] } },
          relationshipId: 'b82b55d9-906e-4b6e-9770-f1eaf29caf86',
          user: {
            _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-6332',
            accountStatus: 'active',
            aliasList: [],
            assignedDashboard: [],
            city: null,
            cn: 'Perkin Reek',
            consentedMappings: [],
            country: null,
            description: null,
            displayName: null,
            effectiveApplications: [{
              _id: '4ab98652-0a20-4cef-bcdb-35e1edf60093', _ref: 'managed/alpha_application/4ab98652-0a20-4cef-bcdb-35e1edf60093', _refResourceCollection: 'managed/alpha_application', _refResourceId: '4ab98652-0a20-4cef-bcdb-35e1edf60093', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-2864', name: 'TargetADApp',
            }],
            effectiveAssignments: [{
              _id: 'ef18a55e-8113-42fb-884c-9e41c0793260', _ref: 'managed/alpha_assignment/ef18a55e-8113-42fb-884c-9e41c0793260', _refResourceCollection: 'managed/alpha_assignment', _refResourceId: 'ef18a55e-8113-42fb-884c-9e41c0793260', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-3855', attributes: [{ name: 'accountEnabled', value: false }, { name: 'mailNickname', value: 'Perkin.Reek' }], condition: null, description: '6a146b39-f45b-40f7-8e89-c473e4e553faoverride assignment', mapping: 'managedAlpha_user_systemTargetadappUser', name: '6a146b39-f45b-40f7-8e89-c473e4e553fa-overrideAssignment', type: '__OVERRIDE__',
            }, {
              _id: '2013b920-560d-4176-bab4-007c12e89309', _ref: 'managed/alpha_assignment/2013b920-560d-4176-bab4-007c12e89309', _refResourceCollection: 'managed/alpha_assignment', _refResourceId: '2013b920-560d-4176-bab4-007c12e89309', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-3582', attributes: [{ name: 'memberOf', value: ['0fcfd73c-6c0a-4ad3-a580-95795af493c5'] }], condition: null, description: 'Zoran User', mapping: 'managedAlpha_user_systemTargetadappUser', name: 'Zoran User', type: '__ENTITLEMENT__',
            }],
            effectiveGroups: [],
            effectiveRoles: [],
            fr: { realm: 'alpha' },
            frIndexedDate1: null,
            frIndexedDate2: null,
            frIndexedDate3: null,
            frIndexedDate4: null,
            frIndexedDate5: null,
            frIndexedInteger1: null,
            frIndexedInteger2: null,
            frIndexedInteger3: null,
            frIndexedInteger4: null,
            frIndexedInteger5: null,
            frIndexedMultivalued1: [],
            frIndexedMultivalued2: [],
            frIndexedMultivalued3: [],
            frIndexedMultivalued4: [],
            frIndexedMultivalued5: [],
            frIndexedString1: null,
            frIndexedString2: null,
            frIndexedString3: null,
            frIndexedString4: null,
            frIndexedString5: null,
            frUnindexedDate1: null,
            frUnindexedDate2: null,
            frUnindexedDate3: null,
            frUnindexedDate4: null,
            frUnindexedDate5: null,
            frUnindexedInteger1: null,
            frUnindexedInteger2: null,
            frUnindexedInteger3: null,
            frUnindexedInteger4: null,
            frUnindexedInteger5: null,
            frUnindexedMultivalued1: [],
            frUnindexedMultivalued2: [],
            frUnindexedMultivalued3: [],
            frUnindexedMultivalued4: [],
            frUnindexedMultivalued5: [],
            frUnindexedString1: null,
            frUnindexedString2: null,
            frUnindexedString3: null,
            frUnindexedString4: null,
            frUnindexedString5: null,
            givenName: 'Perkin',
            id: '6a146b39-f45b-40f7-8e89-c473e4e553fa',
            kbaInfo: [],
            lastSync: {
              managedAlpha_user_systemTargetadappUser: {
                effectiveAssignments: [{
                  _id: 'ef18a55e-8113-42fb-884c-9e41c0793260', _ref: 'managed/alpha_assignment/ef18a55e-8113-42fb-884c-9e41c0793260', _refResourceCollection: 'managed/alpha_assignment', _refResourceId: 'ef18a55e-8113-42fb-884c-9e41c0793260', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-3855', attributes: [{ name: 'accountEnabled', value: false }, { name: 'mailNickname', value: 'Perkin.Reek' }], condition: null, description: '6a146b39-f45b-40f7-8e89-c473e4e553faoverride assignment', mapping: 'managedAlpha_user_systemTargetadappUser', name: '6a146b39-f45b-40f7-8e89-c473e4e553fa-overrideAssignment', type: '__OVERRIDE__',
                }, {
                  _id: '2013b920-560d-4176-bab4-007c12e89309', _ref: 'managed/alpha_assignment/2013b920-560d-4176-bab4-007c12e89309', _refResourceCollection: 'managed/alpha_assignment', _refResourceId: '2013b920-560d-4176-bab4-007c12e89309', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-3582', attributes: [{ name: 'memberOf', value: ['0fcfd73c-6c0a-4ad3-a580-95795af493c5'] }], condition: null, description: 'Zoran User', mapping: 'managedAlpha_user_systemTargetadappUser', name: 'Zoran User', type: '__ENTITLEMENT__',
                }],
                timestamp: '2023-04-27T18:43:06.526625',
              },
            },
            mail: 'Perkin.Reek@autoidzoran.onmicrosoft.com',
            memberOfOrgIDs: [],
            metadata: {
              tags: {}, contextId: 'activity', entityType: '/openidm/managed/user', primaryKey: '6a146b39-f45b-40f7-8e89-c473e4e553fa', entityPath: '/openidm/managed/user/6a146b39-f45b-40f7-8e89-c473e4e553fa', entityDefinition: 'user', namespace: '/openidm/managed', branch: 'actual', created: '2023-04-27T18:43:07.88Z', tenantId: '52e83572-43bc-4437-a707-0bde21910507',
            },
            postalAddress: null,
            postalCode: null,
            preferences: null,
            profileImage: null,
            sn: 'Reek',
            stateProvince: null,
            telephoneNumber: null,
            userName: 'Perkin.Reek@autoidzoran.onmicrosoft.com',
            userMetadata: {
              _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-2683', createDate: '2023-04-27T17:34:17.645326Z', id: 'b6a8aff9-86ad-40b5-aeb5-64634eb08ff2', loginCount: 0, metadata: { entityType: '/openidm/managed/usermeta', created: '2023-04-27T17:34:23.563Z' },
            },
          },
          account: {
            _id: 'c7c5b4b3-e723-48a8-ad15-4176f15f82f0', accountEnabled: false, displayName: 'Perkin Reek', givenName: 'Perkin', mail: 'Perkin.Reek@autoidzoran.onmicrosoft.com', mailNickname: 'Perkin.Reek', manager: null, memberOf: ['a895d259-3279-45e8-b91c-ed6c8962202f', '0fcfd73c-6c0a-4ad3-a580-95795af493c5'], otherMails: [], proxyAddresses: ['SMTP:Perkin.Reek@autoidzoran.onmicrosoft.com'], surname: 'Reek', userPrincipalName: 'Perkin.Reek@autoidzoran.onmicrosoft.com', userType: 'Member', linkQualifier: 'default', metadata: { entityType: '/openidm/reconciliation', created: '2023-04-27T18:43:08.454Z' },
          },
          application: {
            mapping: 'managedAlpha_user_systemTargetadappUser', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-2864', authoritative: false, description: 'TargetADApp', fr: { realm: 'alpha' }, id: '4ab98652-0a20-4cef-bcdb-35e1edf60093', name: 'TargetADApp', templateName: 'azure.ad', templateVersion: '1.0.0', connectorId: 'TargetADApp', ssoIdentities: { oidcId: 'TargetADApp' }, metadata: { entityType: '/openidm/managed/application', created: '2023-04-27T17:36:58.87Z' },
          },
          applicationOwner: [{
            _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-1289',
            accountStatus: 'active',
            aliasList: [],
            assignedDashboard: [],
            city: null,
            cn: 'iga admin',
            consentedMappings: [],
            country: null,
            description: null,
            displayName: null,
            effectiveApplications: [],
            effectiveAssignments: [],
            effectiveGroups: [],
            effectiveRoles: [],
            fr: { realm: 'alpha' },
            frIndexedDate1: null,
            frIndexedDate2: null,
            frIndexedDate3: null,
            frIndexedDate4: null,
            frIndexedDate5: null,
            frIndexedInteger1: null,
            frIndexedInteger2: null,
            frIndexedInteger3: null,
            frIndexedInteger4: null,
            frIndexedInteger5: null,
            frIndexedMultivalued1: [],
            frIndexedMultivalued2: [],
            frIndexedMultivalued3: [],
            frIndexedMultivalued4: [],
            frIndexedMultivalued5: [],
            frIndexedString1: null,
            frIndexedString2: null,
            frIndexedString3: null,
            frIndexedString4: null,
            frIndexedString5: null,
            frUnindexedDate1: null,
            frUnindexedDate2: null,
            frUnindexedDate3: null,
            frUnindexedDate4: null,
            frUnindexedDate5: null,
            frUnindexedInteger1: null,
            frUnindexedInteger2: null,
            frUnindexedInteger3: null,
            frUnindexedInteger4: null,
            frUnindexedInteger5: null,
            frUnindexedMultivalued1: [],
            frUnindexedMultivalued2: [],
            frUnindexedMultivalued3: [],
            frUnindexedMultivalued4: [],
            frUnindexedMultivalued5: [],
            frUnindexedString1: null,
            frUnindexedString2: null,
            frUnindexedString3: null,
            frUnindexedString4: null,
            frUnindexedString5: null,
            givenName: 'iga',
            id: 'b29d411e-987e-4f67-afc7-1c590718179b',
            kbaInfo: [],
            lastSync: null,
            mail: 'igaadmin@fr.com',
            memberOfOrgIDs: [],
            metadata: {
              tags: {}, contextId: 'activity', entityType: '/openidm/managed/user', primaryKey: 'b29d411e-987e-4f67-afc7-1c590718179b', entityPath: '/openidm/managed/user/b29d411e-987e-4f67-afc7-1c590718179b', entityDefinition: 'user', namespace: '/openidm/managed', branch: 'actual', created: '2023-04-27T17:07:53.707Z', tenantId: '52e83572-43bc-4437-a707-0bde21910507',
            },
            postalAddress: null,
            postalCode: null,
            preferences: null,
            profileImage: null,
            sn: 'admin',
            stateProvince: null,
            telephoneNumber: null,
            userName: 'igaadmin',
            authzRoles: [{
              _ref: 'internal/role/openidm-admin', _refProperties: { _id: 'bd520e27-c72f-467e-b047-680a95197465', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-1278' }, _refResourceCollection: 'internal/role', _refResourceId: 'openidm-admin',
            }, {
              _ref: 'internal/role/openidm-authorized', _refProperties: { _id: '7872e2ce-8c03-4080-a272-c4a6bc5b1ab6', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-1280' }, _refResourceCollection: 'internal/role', _refResourceId: 'openidm-authorized',
            }, {
              _ref: 'internal/role/openidm-reg', _refProperties: { _id: 'cf5f920f-4297-49a8-b3ae-a0a108e87214', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-1282' }, _refResourceCollection: 'internal/role', _refResourceId: 'openidm-reg',
            }, {
              _ref: 'internal/role/openidm-tasks-manager', _refProperties: { _id: '7009cf50-f08c-44e6-b66d-b2e015ac86df', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-1284' }, _refResourceCollection: 'internal/role', _refResourceId: 'openidm-tasks-manager',
            }, {
              _ref: 'internal/role/openidm-cert', _refProperties: { _id: '62ea15ea-0a45-4804-8ba0-aa7dc5880281', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-1286' }, _refResourceCollection: 'internal/role', _refResourceId: 'openidm-cert',
            }, {
              _ref: 'internal/role/platform-provisioning', _refProperties: { _id: '5a7dbfd4-b0e7-4a6b-8ea0-07a5a232053d', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-1288' }, _refResourceCollection: 'internal/role', _refResourceId: 'platform-provisioning',
            }],
          }],
          entitlement: {
            __NAME__: 'Zoran User', _id: '0fcfd73c-6c0a-4ad3-a580-95795af493c5', description: 'Zoran User', id: '0fcfd73c-6c0a-4ad3-a580-95795af493c5', mailEnabled: false, proxyAddresses: [], securityEnabled: true, linkQualifier: 'default', metadata: { entityType: '/openidm/reconciliation', created: '2023-04-27T17:51:04.804Z' },
          },
          assignment: {
            _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-3582',
            attributes: [{ name: 'memberOf', value: ['0fcfd73c-6c0a-4ad3-a580-95795af493c5'] }],
            description: 'Zoran User',
            fr: { realm: 'alpha' },
            id: '2013b920-560d-4176-bab4-007c12e89309',
            mapping: 'managedAlpha_user_systemTargetadappUser',
            name: 'Zoran User',
            type: '__ENTITLEMENT__',
            members: [{
              _ref: 'managed/alpha_user/66f3b405-60db-42a6-8a7a-59f6470348f6', _refProperties: { _id: '4603e248-4916-4f45-b46a-76aea97c74f8', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-5536' }, _refResourceCollection: 'managed/alpha_user', _refResourceId: '66f3b405-60db-42a6-8a7a-59f6470348f6',
            }, {
              _ref: 'managed/alpha_user/c7ba0d7e-3186-4876-bb77-e2a56115e213', _refProperties: { _id: 'c5946031-2a07-4e60-bc41-7efe3325ae6c', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-6321' }, _refResourceCollection: 'managed/alpha_user', _refResourceId: 'c7ba0d7e-3186-4876-bb77-e2a56115e213',
            }, {
              _ref: 'managed/alpha_user/6a146b39-f45b-40f7-8e89-c473e4e553fa', _refProperties: { _id: 'dd1ed03b-b42e-444f-9fcb-2912bfe1158c', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-6325' }, _refResourceCollection: 'managed/alpha_user', _refResourceId: '6a146b39-f45b-40f7-8e89-c473e4e553fa',
            }, {
              _ref: 'managed/alpha_user/d9dd8939-dd60-4577-92f2-6e579a1b3659', _refProperties: { _id: 'd2e85710-5376-464e-9ed9-1c388ea2420f', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-6333' }, _refResourceCollection: 'managed/alpha_user', _refResourceId: 'd9dd8939-dd60-4577-92f2-6e579a1b3659',
            }, {
              _ref: 'managed/alpha_user/65d8a182-8229-43b7-abb4-19004d70a82d', _refProperties: { _id: '3f0f619b-d155-4757-b609-9f2d305b5f4b', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-6337' }, _refResourceCollection: 'managed/alpha_user', _refResourceId: '65d8a182-8229-43b7-abb4-19004d70a82d',
            }, {
              _ref: 'managed/alpha_user/23f95834-0789-4116-a56b-7738d6c51f06', _refProperties: { _id: '3ad93a1c-3da8-4b50-8915-83e7e46daf38', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-6342' }, _refResourceCollection: 'managed/alpha_user', _refResourceId: '23f95834-0789-4116-a56b-7738d6c51f06',
            }, {
              _ref: 'managed/alpha_user/4d901e31-3750-4d8e-a844-5b990d8ff82b', _refProperties: { _id: '5ba5b7d8-87da-4dd0-b22b-e240d4ad4d93', _rev: 'f60b29ad-f81b-421f-8358-0aef49dce5c2-6349' }, _refResourceCollection: 'managed/alpha_user', _refResourceId: '4d901e31-3750-4d8e-a844-5b990d8ff82b',
            }],
            metadata: { entityType: '/openidm/managed/assignment', created: '2023-04-27T18:43:18.413Z' },
          },
          id: '01fec9de-a9e7-435b-8d16-2b2367714278',
          decision: {
            certification: {
              status: 'in-progress',
              deadline: '2023-05-11T19:41:00+00:00',
              campaignId: '3fa7d00e-543e-4b6b-8c5b-4c0cbfcd80de',
              targetId: 'be2eadf289400b8a459fac28ed48f405325d9ab1503c21697b5da35c6e50c3d3d1306a3423464abd259ad640484860df327ed20343c03cf9550b3da1202b386d',
              remediated: false,
              confidenceScore: -1,
              stageIndex: 0,
              isExpired: false,
              actors: [{
                id: 'managed/user/b29d411e-987e-4f67-afc7-1c590718179b',
                userName: 'igaadmin',
                givenName: 'iga',
                sn: 'admin',
                mail: 'igaadmin@fr.com',
                role: 'reviewer',
                permissions: {
                  comment: true, forward: true, reassign: true, signoff: true, certify: true, exception: true, revoke: true, reset: true,
                },
              }, {
                userName: 'Kristy.Crawley@autoidzoran.onmicrosoft.com',
                givenName: 'Kristy',
                sn: 'Crawley',
                id: 'managed/user/66f3b405-60db-42a6-8a7a-59f6470348f6',
                mail: 'Kristy.Crawley@autoidzoran.onmicrosoft.com',
                permissions: {
                  comment: true, forward: true, reassign: false, signoff: true, certify: true, exception: false, revoke: false, reset: false,
                },
              }],
              primaryReviewer: {
                id: 'managed/user/b29d411e-987e-4f67-afc7-1c590718179b', userName: 'igaadmin', givenName: 'iga', sn: 'admin', mail: 'igaadmin@fr.com',
              },
              decision: null,
              decisionDate: '2023-05-01T16:13:39+00:00',
              decisionBy: {
                mail: 'kashyap.daliparthy@forgerock.com', givenName: 'Kashyap', id: 'managed/teammember/e88db9ab-fa3a-438c-864f-38b1a928eca1', sn: 'Daliparthy', userName: 'kashyap.daliparthy@forgerock.com',
              },
              exceptionDuration: null,
              comments: [{
                timeStamp: '2023-05-01T16:14:09+00:00',
                user: {
                  mail: 'kashyap.daliparthy@forgerock.com', givenName: 'Kashyap', id: 'managed/teammember/e88db9ab-fa3a-438c-864f-38b1a928eca1', sn: 'Daliparthy', userName: 'kashyap.daliparthy@forgerock.com',
                },
                comment: 'test',
                action: 'comment',
              }, {
                timeStamp: '2023-05-01T16:14:18+00:00',
                user: {
                  mail: 'kashyap.daliparthy@forgerock.com', givenName: 'Kashyap', id: 'managed/teammember/e88db9ab-fa3a-438c-864f-38b1a928eca1', sn: 'Daliparthy', userName: 'kashyap.daliparthy@forgerock.com',
                },
                comment: 'test',
                action: 'comment',
              }, {
                timeStamp: '2023-05-01T16:14:27+00:00',
                user: {
                  mail: 'kashyap.daliparthy@forgerock.com', givenName: 'Kashyap', id: 'managed/teammember/e88db9ab-fa3a-438c-864f-38b1a928eca1', sn: 'Daliparthy', userName: 'kashyap.daliparthy@forgerock.com',
                },
                comment: 'Reassigned item to Kristy Crawley (Kristy.Crawley@autoidzoran.onmicrosoft.com).',
                action: 'reassign',
              }, {
                timeStamp: '2023-05-01T16:14:32+00:00',
                user: {
                  mail: 'kashyap.daliparthy@forgerock.com', givenName: 'Kashyap', id: 'managed/teammember/e88db9ab-fa3a-438c-864f-38b1a928eca1', sn: 'Daliparthy', userName: 'kashyap.daliparthy@forgerock.com',
                },
                comment: 'Reassigned item to Kristy Crawley (Kristy.Crawley@autoidzoran.onmicrosoft.com).',
                action: 'reassign',
              }, {
                timeStamp: '2023-05-01T16:14:43+00:00',
                user: {
                  mail: 'kashyap.daliparthy@forgerock.com', givenName: 'Kashyap', id: 'managed/teammember/e88db9ab-fa3a-438c-864f-38b1a928eca1', sn: 'Daliparthy', userName: 'kashyap.daliparthy@forgerock.com',
                },
                comment: 'Reassigned item to Kristy Crawley (Kristy.Crawley@autoidzoran.onmicrosoft.com).',
                action: 'reassign',
              }, {
                timeStamp: '2023-05-01T16:14:47+00:00',
                user: {
                  mail: 'kashyap.daliparthy@forgerock.com', givenName: 'Kashyap', id: 'managed/teammember/e88db9ab-fa3a-438c-864f-38b1a928eca1', sn: 'Daliparthy', userName: 'kashyap.daliparthy@forgerock.com',
                },
                comment: 'Removed actors Kristy Crawley (Kristy.Crawley@autoidzoran.onmicrosoft.com).',
                action: 'reassign',
              }, {
                timeStamp: '2023-05-01T16:15:14+00:00',
                user: {
                  mail: 'kashyap.daliparthy@forgerock.com', givenName: 'Kashyap', id: 'managed/teammember/e88db9ab-fa3a-438c-864f-38b1a928eca1', sn: 'Daliparthy', userName: 'kashyap.daliparthy@forgerock.com',
                },
                comment: 'Reassigned item to Kristy Crawley (Kristy.Crawley@autoidzoran.onmicrosoft.com).',
                action: 'reassign',
              }],
            },
          },
          permissions: {
            comment: true, forward: true, reassign: true, signoff: true, certify: true, exception: true, revoke: true, reset: true,
          },
          descriptor: {
            idx: {
              '/entitlement': { displayName: 'entitlement name' },
              '/account': { displayName: 'account name' },
            },
          },
        }],
        searchAfterKey: ['Perkin', '01fec9de-a9e7-435b-8d16-2b2367714278'],
        totalCount: 1,
        resultCount: 1,
      },
    }));
    jest.spyOn(CertificationApi, 'getEntitlementDetails').mockReturnValue(Promise.resolve({
      data: {
        __NAME__: 'Zoran User', _id: '0fcfd73c-6c0a-4ad3-a580-95795af493c5', description: 'Zoran User', id: '0fcfd73c-6c0a-4ad3-a580-95795af493c5', linkQualifier: 'default', mailEnabled: false, metadata: { entityType: '/openidm/reconciliation', created: '2023-04-27T17:51:04.804Z' }, proxyAddresses: [], securityEnabled: true,
      },
    }));
    jest.spyOn(CertificationApi, 'certifyItems').mockReturnValue(Promise.resolve());
    jest.spyOn(CertificationApi, 'getCertificationUserFilter').mockReturnValue(Promise.resolve({
      data: [{
        userName: 'Rosamund.Sinkin@autoidzoran.onmicrosoft.com', givenName: 'Rosamund', sn: 'Sinkin', mail: 'Rosamund.Sinkin@autoidzoran.onmicrosoft.com', id: '4d901e31-3750-4d8e-a844-5b990d8ff82b', profileImage: null,
      }, {
        userName: 'Kristy.Crawley@autoidzoran.onmicrosoft.com', givenName: 'Kristy', sn: 'Crawley', mail: 'Kristy.Crawley@autoidzoran.onmicrosoft.com', id: '66f3b405-60db-42a6-8a7a-59f6470348f6', profileImage: null,
      }, {
        userName: 'matthew.kormann@forgerock.com', givenName: 'Matthew', sn: 'Kormann', mail: 'matthew.kormann@forgerock.com', id: '23f95834-0789-4116-a56b-7738d6c51f06', profileImage: null,
      }, {
        userName: 'Rasla.Wedgbrow@autoidzoran.onmicrosoft.com', givenName: 'Rasla', sn: 'Wedgbrow', mail: 'Rasla.Wedgbrow@autoidzoran.onmicrosoft.com', id: '65d8a182-8229-43b7-abb4-19004d70a82d', profileImage: null,
      }, {
        userName: 'Lew.Celiz@autoidzoran.onmicrosoft.com', givenName: 'Lew', sn: 'Celiz', mail: 'Lew.Celiz@autoidzoran.onmicrosoft.com', id: 'd9dd8939-dd60-4577-92f2-6e579a1b3659', profileImage: null,
      }, {
        userName: 'Perkin.Reek@autoidzoran.onmicrosoft.com', givenName: 'Perkin', sn: 'Reek', mail: 'Perkin.Reek@autoidzoran.onmicrosoft.com', id: '6a146b39-f45b-40f7-8e89-c473e4e553fa', profileImage: null,
      }, {
        userName: 'smore@autoidzoran.onmicrosoft.com', givenName: 'Sandesh', sn: 'More', mail: 'smore@autoidzoran.onmicrosoft.com', id: 'c7ba0d7e-3186-4876-bb77-e2a56115e213', profileImage: null,
      }],
    }));
    jest.spyOn(CertificationApi, 'getCertificationApplicationFilter').mockReturnValue(Promise.resolve({
      data: [{ name: 'TargetADApp', templateName: 'azure.ad', id: '4ab98652-0a20-4cef-bcdb-35e1edf60093' }],
    }));
  });
  describe('@renders', () => {
    it('renders both account and entitlement tables', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.find('#CertificationAccountsTaskList').exists()).toBeTruthy();
      expect(wrapper.find('#CertificationEntitlementsTaskList').exists()).toBeTruthy();
    });
    it('renders both account and entitlement tables should have one row each', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.find('#CertificationAccountsTaskList').find('table').find('tbody').findAll('tr').length).toEqual(1);
      expect(wrapper.find('#CertificationEntitlementsTaskList').find('table').find('tbody').findAll('tr').length).toEqual(1);
    });
    it('renders account details with correct data', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.find('#CertificationAccountsTaskList').find('table').find('tbody').find('tr')
        .findAll('td')[1].text()).toContain('Perkin.Reek@autoidzoran.onmicrosoft.com');
    });
    it('renders entitlement details with correct data', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.find('#CertificationEntitlementsTaskList').find('table').find('tbody').find('tr')
        .findAll('td')[1].text()).toContain('entitlement name');
    });
    it('renders chevron_right with correct data', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(findByTestId(wrapper, 'group-by-icon').exists()).toBeTruthy();
    });
  });
  describe('@actions', () => {
    it('should emit progress event on load', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.emitted()['check-progress']).toBeTruthy();
    });
    it('should open account modal on account name click', async () => {
      const wrapper = setup();
      await flushPromises();
      findByTestId(wrapper, 'account-cell').trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('CertificationTaskAccountModal');
    });
    it('should open application modal on application name click', async () => {
      const wrapper = setup();
      await flushPromises();
      findByTestId(wrapper, 'application-cell').trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('CertificationTaskApplicationModal');
    });
    it('should open entitlement modal from account table', async () => {
      const wrapper = setup();
      await flushPromises();
      findByTestId(wrapper, 'entitlement-cell').trigger('click');
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-entitlement');
    });
    it('should open add comments for account table', async () => {
      const wrapper = setup();
      await flushPromises();
      findByTestId(wrapper, 'add-comment-button-01fec9de-a9e7-435b-8d16-2b2367714278').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-add-comment');
    });
    it('should open add comments for entitlement table', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.findAll('[data-testid="add-comment-button-01fec9de-a9e7-435b-8d16-2b2367714278"]')[1].trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-add-comment');
    });
    it('should open comments modal on accounts table', async () => {
      const wrapper = setup();
      await flushPromises();
      findByTestId(wrapper, 'cert-comments-button').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-view-comments');
    });
    it('should open comments modal on entitlements table', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.findAll('[data-testid="cert-comments-button"]')[1].trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-view-comments');
    });
    it('should open reviewers modal on accounts table', async () => {
      const wrapper = setup();
      await flushPromises();
      findByTestId(wrapper, 'cert-reviewers-button-accounts').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-view-reviewers');
    });
    it('should open reviewers modal on entitlements table', async () => {
      const wrapper = setup();
      await flushPromises();
      findByTestId(wrapper, 'cert-reviewers-button-entitlements').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-view-reviewers');
    });
  });
  describe('@units', () => {
    it('should emit refresh-complete event', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.refreshComplete();
      expect(wrapper.emitted()['refresh-complete']).toBeTruthy();
    });
    it('should emit sign-off event', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.hidesignOff();
      expect(wrapper.emitted()['signed-off']).toBeTruthy();
    });
  });
});

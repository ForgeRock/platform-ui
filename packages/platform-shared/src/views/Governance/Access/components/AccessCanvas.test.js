/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import AccessCanvas from './AccessCanvas';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({}),
}));

const exampleAccess = [
  {
    account: {
      __NAME__: 'Barth@IGATestQA.onmicrosoft.com',
    },
    application: {
      _rev: 'cfcec514-ce23-4cfd-ad03-a18d7bcb7108-157400',
      authoritative: false,
      changedFields: [
        '/uiConfig',
      ],
      connectorId: 'MicrosoftTarget',
      description: 'Test',
      fr: {
        realm: 'alpha',
      },
      icon: '',
      id: '1fbe6672-780c-4226-af35-01a2546723c1',
      mappingNames: [
        'systemMicrosofttargetUser_managedAlpha_user',
        'systemMicrosofttargetDirectoryrole_managedAlpha_assignment',
        'systemMicrosofttarget__group___managedAlpha_assignment',
        'managedAlpha_user_systemMicrosofttargetUser',
        'systemMicrosofttargetServiceplan_managedAlpha_assignment',
      ],
      metadata: {
        entityType: '/openidm/managed/application',
        created: '2025-10-21T19:39:12.326Z',
      },
      name: 'Microsoft Target',
      objectTypes: [
        {
          name: '__GROUP__',
          accountAttribute: 'memberOf',
        },
        {
          name: 'User',
        },
        {
          name: 'servicePlan',
          accountAttribute: '__servicePlanIds__',
        },
        {
          name: 'directoryRole',
          accountAttribute: '__roles__',
        },
      ],
      templateName: 'azure.ad',
      templateVersion: '3.3',
    },
    compositeId: '4f744640947317847bbda1052968c8cf30ed48210af69ed1b9a43ce160853e18678adc57a79bdb02d430d76d04298a361dca51522bc9574b5c2f5934f6462907',
    descriptor: {
      idx: {
        '/account': {
          displayName: 'Barth@IGATestQA.onmicrosoft.com',
        },
      },
    },
    item: {
      decision: {
        certification: {
          campaignId: '390235cf-e5e6-41fa-8a49-c336d59f43e3',
          targetId: '4f744640947317847bbda1052968c8cf30ed48210af69ed1b9a43ce160853e18678adc57a79bdb02d430d76d04298a361dca51522bc9574b5c2f5934f6462907',
          status: 'signed-off',
          decision: 'revoke',
          decisionDate: '2025-10-02T19:56:56+00:00',
          decisionBy: {
            givenName: 'Denny',
            id: 'managed/user/0cfa7da7-8f6a-4c27-9d5c-15a49a7bc34f',
            mail: 'Denny@IGATestQA.onmicrosoft.com',
            sn: 'Jahn',
            userName: 'Denny@IGATestQA.onmicrosoft.com',
          },
          completionDate: '2025-10-14T08:05:16+00:00',
          completedBy: {
            givenName: 'Sanjay',
            id: 'managed/user/15c52f32-9c90-4587-b642-7de23a422728',
            mail: 'sanjay.rallapally@pingidentity.com',
            sn: 'Rallapally',
            userName: 'srallapa',
          },
        },
      },
      type: 'accountGrant',
    },
    keys: {
      type: 'accountGrant',
      userId: 'aa40ab45-5a9a-4bd2-92f2-56560987eedc',
      applicationId: '1fbe6672-780c-4226-af35-01a2546723c1',
      accountId: 'system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962',
    },
    relationship: {
      id: '184d70bd-6a00-4876-8312-9439e0716397-2227203',
      properties: {
        grantTypes: [
          {
            id: '184d70bd-6a00-4876-8312-9439e0716397-2227203',
            grantType: 'recon',
          },
          {
            id: '21be1211-6fc0-4367-aabb-7a78c46a5a80-4109822',
            roleId: 'aa4623ee-c880-4967-af18-b766bb8dacb0',
            grantType: 'role',
            conditional: false,
          },
          {
            id: '184d70bd-6a00-4876-8312-9439e0716397-2287282',
            roleId: 'a0e4bfbe-1f3f-4d95-b57e-1582108a75fa',
            grantType: 'role',
            conditional: false,
          },
        ],
      },
    },
    metadata: {
      modifiedDate: '2025-11-04T15:00:40.762Z',
      createdDate: '2025-09-24T13:39:45.717354237Z',
    },
  },
  {
    compositeId: 'f3348833a43749b77444323fe512d57fa2d512beb345439a1180e8dc09201fea387a41313001c54bcbc3985e62b019a44e46df219de5de000341fa1eb418d467',
    item: {
      type: 'roleMembership',
    },
    keys: {
      type: 'roleMembership',
      roleId: 'aa4623ee-c880-4967-af18-b766bb8dacb0',
      userId: 'aa40ab45-5a9a-4bd2-92f2-56560987eedc',
    },
    relationship: {
      id: '21be1211-6fc0-4367-aabb-7a78c46a5a80-4109822',
      conditional: false,
    },
    role: {
      name: 'Example Role',
    },
    metadata: {
      modifiedDate: '2025-11-03T22:44:29.43134633Z',
      createdDate: '2025-11-03T22:44:29.43134633Z',
    },
  },
  {
    account: {
      __NAME__: 'Barth@IGATestQA.onmicrosoft.com',
    },
    application: {
      _rev: 'cfcec514-ce23-4cfd-ad03-a18d7bcb7108-157400',
      authoritative: false,
      changedFields: [
        '/uiConfig',
      ],
      connectorId: 'MicrosoftTarget',
      description: 'Test',
      fr: {
        realm: 'alpha',
      },
      icon: '',
      id: '1fbe6672-780c-4226-af35-01a2546723c1',
      mappingNames: [
        'systemMicrosofttargetUser_managedAlpha_user',
        'systemMicrosofttargetDirectoryrole_managedAlpha_assignment',
        'systemMicrosofttarget__group___managedAlpha_assignment',
        'managedAlpha_user_systemMicrosofttargetUser',
        'systemMicrosofttargetServiceplan_managedAlpha_assignment',
      ],
      metadata: {
        entityType: '/openidm/managed/application',
        created: '2025-10-21T19:39:12.326Z',
      },
      name: 'Microsoft Target',
      objectTypes: [
        {
          name: '__GROUP__',
          accountAttribute: 'memberOf',
        },
        {
          name: 'User',
        },
        {
          name: 'servicePlan',
          accountAttribute: '__servicePlanIds__',
        },
        {
          name: 'directoryRole',
          accountAttribute: '__roles__',
        },
      ],
      templateName: 'azure.ad',
      templateVersion: '3.3',
    },
    compositeId: '4f5933feb0946a272b6593f4099ac9a0eafeef29912fcb88ab986b06ceea6479ecde50b3e1167cb5dc8ee07993cf1359d49e6dc1682bd1ffecf1a9720ca6e8d7',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Global Administrator',
        },
        '/account': {
          displayName: 'Barth@IGATestQA.onmicrosoft.com',
        },
      },
    },
    entitlement: {
      __NAME__: 'Global Administrator',
    },
    item: {
      type: 'entitlementGrant',
      objectType: 'directoryRole',
    },
    keys: {
      type: 'entitlementGrant',
      userId: 'aa40ab45-5a9a-4bd2-92f2-56560987eedc',
      applicationId: '1fbe6672-780c-4226-af35-01a2546723c1',
      accountId: 'system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962',
      entitlementId: 'system/MicrosoftTarget/directoryRole/31f3b01e-1786-4b33-b5bc-58a2810f6ceb',
    },
    relationship: {
      id: '21be1211-6fc0-4367-aabb-7a78c46a5a80-4108348',
      properties: {
        grantTypes: [
          {
            id: '21be1211-6fc0-4367-aabb-7a78c46a5a80-4108348',
            roleId: 'aa4623ee-c880-4967-af18-b766bb8dacb0',
            grantType: 'role',
          },
        ],
      },
    },
    metadata: {
      modifiedDate: '2025-11-03T22:44:29.43390509Z',
      createdDate: '2025-11-03T22:44:29.43390509Z',
    },
  },
  {
    account: {
      __NAME__: 'Barth@IGATestQA.onmicrosoft.com',
    },
    application: {
      _rev: 'cfcec514-ce23-4cfd-ad03-a18d7bcb7108-157400',
      authoritative: false,
      changedFields: [
        '/uiConfig',
      ],
      connectorId: 'MicrosoftTarget',
      description: 'Test',
      fr: {
        realm: 'alpha',
      },
      icon: '',
      id: '1fbe6672-780c-4226-af35-01a2546723c1',
      mappingNames: [
        'systemMicrosofttargetUser_managedAlpha_user',
        'systemMicrosofttargetDirectoryrole_managedAlpha_assignment',
        'systemMicrosofttarget__group___managedAlpha_assignment',
        'managedAlpha_user_systemMicrosofttargetUser',
        'systemMicrosofttargetServiceplan_managedAlpha_assignment',
      ],
      metadata: {
        entityType: '/openidm/managed/application',
        created: '2025-10-21T19:39:12.326Z',
      },
      name: 'Microsoft Target',
      objectTypes: [
        {
          name: '__GROUP__',
          accountAttribute: 'memberOf',
        },
        {
          name: 'User',
        },
        {
          name: 'servicePlan',
          accountAttribute: '__servicePlanIds__',
        },
        {
          name: 'directoryRole',
          accountAttribute: '__roles__',
        },
      ],
      templateName: 'azure.ad',
      templateVersion: '3.3',
    },
    compositeId: '80d5699160c5686c18d13b991c877103890625d43a8ec4688e8bd71c7d0d950a50b0ebb51e7ec4b13dc13518d97c2045027656e973622d8567c1905b76eea666',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Authentication Administrator',
        },
        '/account': {
          displayName: 'Barth@IGATestQA.onmicrosoft.com',
        },
      },
    },
    entitlement: {
      __NAME__: 'Authentication Administrator',
    },
    item: {
      type: 'entitlementGrant',
      objectType: 'directoryRole',
    },
    keys: {
      type: 'entitlementGrant',
      userId: 'aa40ab45-5a9a-4bd2-92f2-56560987eedc',
      applicationId: '1fbe6672-780c-4226-af35-01a2546723c1',
      accountId: 'system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962',
      entitlementId: 'system/MicrosoftTarget/directoryRole/d1b5bafd-3a07-4b21-9798-ca98c5f28904',
    },
    relationship: {
      id: '21be1211-6fc0-4367-aabb-7a78c46a5a80-4108357',
      properties: {
        grantTypes: [
          {
            id: '21be1211-6fc0-4367-aabb-7a78c46a5a80-4108357',
            roleId: 'aa4623ee-c880-4967-af18-b766bb8dacb0',
            grantType: 'role',
          },
        ],
      },
    },
    metadata: {
      modifiedDate: '2025-11-03T22:44:29.43349128Z',
      createdDate: '2025-11-03T22:44:29.43349128Z',
    },
  },
  {
    account: {
      __NAME__: 'Barth@IGATestQA.onmicrosoft.com',
    },
    application: {
      _rev: 'cfcec514-ce23-4cfd-ad03-a18d7bcb7108-157400',
      authoritative: false,
      changedFields: [
        '/uiConfig',
      ],
      connectorId: 'MicrosoftTarget',
      description: 'Test',
      fr: {
        realm: 'alpha',
      },
      icon: '',
      id: '1fbe6672-780c-4226-af35-01a2546723c1',
      mappingNames: [
        'systemMicrosofttargetUser_managedAlpha_user',
        'systemMicrosofttargetDirectoryrole_managedAlpha_assignment',
        'systemMicrosofttarget__group___managedAlpha_assignment',
        'managedAlpha_user_systemMicrosofttargetUser',
        'systemMicrosofttargetServiceplan_managedAlpha_assignment',
      ],
      metadata: {
        entityType: '/openidm/managed/application',
        created: '2025-10-21T19:39:12.326Z',
      },
      name: 'Microsoft Target',
      objectTypes: [
        {
          name: '__GROUP__',
          accountAttribute: 'memberOf',
        },
        {
          name: 'User',
        },
        {
          name: 'servicePlan',
          accountAttribute: '__servicePlanIds__',
        },
        {
          name: 'directoryRole',
          accountAttribute: '__roles__',
        },
      ],
      templateName: 'azure.ad',
      templateVersion: '3.3',
    },
    compositeId: '9d3a4caad06748633f8a967ade1a6fe34a2cf73569c62c198f3c61377440c239857cc89bdc3a01b5ce22b9d72b30d2a7d7148d6e6e6829c3335ca3e5f986576c',
    descriptor: {
      idx: {
        '/entitlement': {
          displayName: 'Directory Readers',
        },
        '/account': {
          displayName: 'Barth@IGATestQA.onmicrosoft.com',
        },
      },
    },
    entitlement: {
      __NAME__: 'Directory Readers',
    },
    item: {
      type: 'entitlementGrant',
      objectType: 'directoryRole',
    },
    keys: {
      type: 'entitlementGrant',
      userId: 'aa40ab45-5a9a-4bd2-92f2-56560987eedc',
      applicationId: '1fbe6672-780c-4226-af35-01a2546723c1',
      accountId: 'system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962',
      entitlementId: 'system/MicrosoftTarget/directoryRole/a03ffdf8-17da-4972-9991-d68b63c4dbe7',
    },
    relationship: {
      id: '21be1211-6fc0-4367-aabb-7a78c46a5a80-4108351',
      properties: {
        grantTypes: [
          {
            id: '21be1211-6fc0-4367-aabb-7a78c46a5a80-4108351',
            roleId: 'aa4623ee-c880-4967-af18-b766bb8dacb0',
            grantType: 'role',
          },
        ],
      },
    },
    metadata: {
      modifiedDate: '2025-11-03T22:44:35.020138497Z',
      createdDate: '2025-11-03T22:44:35.020138497Z',
    },
  },
];

async function mountComponent(additionalProps = {}) {
  const wrapper = mount(AccessCanvas, {
    global: {
      mocks: {
        $t: (string) => string,
      },
    },
    props: {
      userAccess: exampleAccess,
      activeNodeId: null,
      zoomValue: 80,
      selectedTypes: {
        accountGrant: true,
        entitlementGrant: true,
        roleMembership: true,
      },
      ...additionalProps,
    },
  });
  await flushPromises();
  return wrapper;
}

describe('AccessCanvas', () => {
  describe('Emit tests', () => {
    it('renders access cards as expected', async () => {
      const wrapper = await mountComponent();
      await flushPromises();

      const labelCards = wrapper.findAll('[type="LabelNode"]');
      expect(labelCards.length).toBe(3);

      const accessCards = wrapper.findAll('.fr-access-card');
      expect(accessCards.length).toBe(5);
    });

    it('renders connection lines as expected', async () => {
      const wrapper = await mountComponent();
      await flushPromises();

      const connectionLines = wrapper.findAll('path');
      expect(connectionLines.length).toBe(7);
    });

    it('change-selected-access emit when nodes are selected', async () => {
      const wrapper = await mountComponent();
      await flushPromises();

      const accessCards = wrapper.findAll('.fr-access-card');
      accessCards[0].trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('change-selected-access')).toBeTruthy();
    });

    it('only displays selected types', async () => {
      const wrapper = await mountComponent({
        selectedTypes: {
          accountGrant: false,
          entitlementGrant: true,
          roleMembership: false,
        },
      });
      await flushPromises();

      const labelCards = wrapper.findAll('[type="LabelNode"]');
      expect(labelCards.length).toBe(1);

      const accessCards = wrapper.findAll('.fr-access-card');
      expect(accessCards.length).toBe(3);

      const connectionLines = wrapper.findAll('path');
      expect(connectionLines.length).toBe(0);
    });
  });
});

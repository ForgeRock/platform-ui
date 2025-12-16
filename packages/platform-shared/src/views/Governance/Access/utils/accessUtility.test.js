/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  getAccessDisplayName,
  getAccessTypeDisplayName,
  getGrantNodeIdentifierFromGrant,
  parseDate,
  formatAccessGrants,
} from './accessUtility';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    enterprise: {
      AzureAD: {
        '3_3-azure-ad': { id: 'azure.ad', displayName: 'Microsoft Entra', image: 'microsoft.svg' },
      },
    },
  }),
}));

const exampleGrants = [
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
];

describe('accessUtility functions', () => {
  it('should parse date correctly', () => {
    const date1 = '2024-03-15T10:30:00Z';
    expect(parseDate(date1)).toBe('Mar 15, 2024');

    const date2 = '2025-12-31T23:59:59Z';
    expect(parseDate(date2)).toBe('Dec 31, 2025');

    const date3 = '2024-01-01T00:00:00Z';
    expect(parseDate(date3)).toBe('Jan 1, 2024');

    const date4 = null;
    expect(parseDate(date4)).toBe(blankValueIndicator);
  });

  describe('getGrantNodeIdentifierFromGrant', () => {
    it('should generate identifier for account grant', () => {
      const grant = {
        item: { type: 'accountGrant' },
        keys: { accountId: '123' },
      };
      expect(getGrantNodeIdentifierFromGrant(grant)).toBe('accountGrant-123');
    });

    it('should generate identifier for entitlement grant', () => {
      const grant = {
        item: { type: 'entitlementGrant' },
        keys: { entitlementId: '456' },
      };
      expect(getGrantNodeIdentifierFromGrant(grant)).toBe('entitlementGrant-456');
    });

    it('should generate identifier for role membership', () => {
      const grant = {
        item: { type: 'roleMembership' },
        keys: { roleId: '789' },
      };
      expect(getGrantNodeIdentifierFromGrant(grant)).toBe('roleMembership-789');
    });
  });

  describe('getAccessTypeTranslations', () => {
    it('should return display name and description for account grant type', () => {
      const displayName = getAccessTypeDisplayName('accountGrant');
      expect(displayName).toBeDefined();
    });

    it('should return display name for entitlement grant type', () => {
      const displayName = getAccessTypeDisplayName('entitlementGrant');
      expect(displayName).toBeDefined();
    });

    it('should return display name for role membership type', () => {
      const displayName = getAccessTypeDisplayName('roleMembership');
      expect(displayName).toBeDefined();
    });
  });

  describe('getAccessDisplayName', () => {
    it('should return display name for account grant from descriptor', () => {
      const grant = {
        item: { type: 'accountGrant' },
        descriptor: {
          idx: {
            '/account': { displayName: 'My Account Display' },
          },
        },
        account: { __NAME__: 'account_name' },
      };
      expect(getAccessDisplayName(grant)).toBe('My Account Display');
    });

    it('should return account __NAME__ when descriptor is missing', () => {
      const grant = {
        item: { type: 'accountGrant' },
        descriptor: {},
        account: { __NAME__: 'account_name' },
      };
      expect(getAccessDisplayName(grant)).toBe('account_name');
    });

    it('should return display name for entitlement grant from descriptor', () => {
      const grant = {
        item: { type: 'entitlementGrant' },
        descriptor: {
          idx: {
            '/entitlement': { displayName: 'My Entitlement Display' },
          },
        },
        entitlement: { __NAME__: 'entitlement_name' },
      };
      expect(getAccessDisplayName(grant)).toBe('My Entitlement Display');
    });

    it('should return entitlement __NAME__ when descriptor is missing', () => {
      const grant = {
        item: { type: 'entitlementGrant' },
        descriptor: {},
        entitlement: { __NAME__: 'entitlement_name' },
      };
      expect(getAccessDisplayName(grant)).toBe('entitlement_name');
    });

    it('should return role name for role membership', () => {
      const grant = {
        item: { type: 'roleMembership' },
        role: { name: 'Administrator Role' },
      };
      expect(getAccessDisplayName(grant)).toBe('Administrator Role');
    });

    it('should return empty string for unknown grant type', () => {
      const grant = {
        item: { type: 'unknownType' },
      };
      expect(getAccessDisplayName(grant)).toBe('');
    });
  });

  describe('formatAccessGrants', () => {
    const transformedGrants = [
      {
        id: 'roleMembership-aa4623ee-c880-4967-af18-b766bb8dacb0',
        type: 'roleMembership',
        displayName: 'Example Role',
        icon: 'assignment_ind',
        connections: {
          'accountGrant-system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962': 'accountGrant-system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962',
          'entitlementGrant-system/MicrosoftTarget/directoryRole/31f3b01e-1786-4b33-b5bc-58a2810f6ceb': 'entitlementGrant-system/MicrosoftTarget/directoryRole/31f3b01e-1786-4b33-b5bc-58a2810f6ceb',
        },
      },
      {
        id: 'accountGrant-system/MicrosoftTarget/User/82ebe3f7-463b-4301-905f-9ff7a6cc8962',
        type: 'accountGrant',
        displayName: 'Barth@IGATestQA.onmicrosoft.com',
        appName: 'Microsoft Entra',
        icon: 'https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg',
        connections: {
          'entitlementGrant-system/MicrosoftTarget/directoryRole/31f3b01e-1786-4b33-b5bc-58a2810f6ceb': 'entitlementGrant-system/MicrosoftTarget/directoryRole/31f3b01e-1786-4b33-b5bc-58a2810f6ceb',
        },
      },
      {
        id: 'entitlementGrant-system/MicrosoftTarget/directoryRole/31f3b01e-1786-4b33-b5bc-58a2810f6ceb',
        type: 'entitlementGrant',
        displayName: 'Global Administrator',
        appName: 'Microsoft Entra',
        icon: 'https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg',
        connections: {},
      },
    ];

    it('should format access grants correctly', async () => {
      const result = await formatAccessGrants(exampleGrants);
      expect(result).toEqual(transformedGrants);
    });

    it('should handle a basic role grant transformation', async () => {
      const roleGrant = {
        item: { type: 'roleMembership' },
        role: { name: 'Example Role' },
        keys: { roleId: '123' },
      };
      const transformed = {
        id: 'roleMembership-123',
        type: 'roleMembership',
        displayName: 'Example Role',
        icon: 'assignment_ind',
        connections: {},
      };
      const result = await formatAccessGrants([roleGrant]);
      expect(result).toEqual([transformed]);
    });

    it('should handle a basic account grant transformation', async () => {
      const accountGrant = {
        item: { type: 'accountGrant' },
        application: { templateName: 'azure.ad', templateVersion: '3.3' },
        descriptor: { idx: { '/account': { displayName: 'Example Account' } } },
        keys: { accountId: '123' },
      };
      const transformed = {
        id: 'accountGrant-123',
        appName: 'Microsoft Entra',
        type: 'accountGrant',
        displayName: 'Example Account',
        icon: 'https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg',
        connections: {},
      };
      const result = await formatAccessGrants([accountGrant]);
      expect(result).toEqual([transformed]);
    });

    it('should handle a basic entitlement grant transformation', async () => {
      const entitlementGrant = {
        item: { type: 'entitlementGrant' },
        application: { templateName: 'azure.ad', templateVersion: '3.3' },
        descriptor: { idx: { '/entitlement': { displayName: 'Example Entitlement' } } },
        keys: { entitlementId: '123' },
      };
      const transformed = {
        id: 'entitlementGrant-123',
        appName: 'Microsoft Entra',
        type: 'entitlementGrant',
        displayName: 'Example Entitlement',
        icon: 'https://cdn.forgerock.com/platform/app-templates/images/microsoft.svg',
        connections: {},
      };
      const result = await formatAccessGrants([entitlementGrant]);
      expect(result).toEqual([transformed]);
    });
  });
});

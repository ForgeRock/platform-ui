/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { cloneDeep } from 'lodash';
import {
  buildSavePayload,
  getCampaignDuration,
  getFormValuesFromTemplate,
} from './certification';

describe('certification', () => {
  const defaultTemplate = {
    reassignPermissions: {
      certify: true,
      claim: true,
      comment: true,
      delegate: true,
      exception: true,
      forward: true,
      reassign: true,
      reset: true,
      revoke: true,
      save: true,
      signoff: true,
    },
    stages: [
      {
        certifierId: null,
        certifierScript: null,
        certifierType: 'user',
      },
    ],
    targetFilter: {
      account: {
        operand: [],
        operator: 'ALL',
      },
      application: {
        operand: {
          targetName: 'authoritative',
          targetValue: false,
        },
        operator: 'EQUALS',
      },
      decision: {
        operand: [],
        operator: 'ALL',
      },
      type: [
        'accountGrant',
      ],
      user: {
        operand: [],
        operator: 'ALL',
      },
      role: {
        operand: [],
        operator: 'ALL',
      },
    },
  };

  it('getFormValuesFromTemplate should generate correctly form for FrWhat step by default', () => {
    const form = getFormValuesFromTemplate(defaultTemplate);
    expect(form.FrWhat).toEqual({
      accountFilter: {},
      accountSelection: 'All accounts in selected applications',
      appFilter: {},
      appSelection: 'All applications',
      decisionFilter: {},
      enableAccountGrant: true,
      enableCertDecisionFilter: false,
      enableEntitlementGrant: false,
      enableRoleGrant: false,
      enableEntitlementComposition: false,
      entitlementFilter: {},
      entitlementSelection: 'All entitlements',
      excludeConditionalAccess: false,
      excludeRoleBasedAccess: false,
      includeChildOrganizations: null,
      numAccounts: 0,
      numApplications: 0,
      numEntitlements: 0,
      numUsers: 0,
      organizationSelection: [],
      orgFilter: 'allOrgs',
      roleFilter: {},
      roleSelection: 'All roles',
      singleApp: [],
      singleUser: '',
      singleUserInfo: {},
      userFilter: {},
      userSelection: 'All users',
    });
  });

  it('getFormValuesFromTemplate should generate correctly form for FrWhat step with user filter matching', () => {
    const template = cloneDeep(defaultTemplate);
    template.certificationType = 'identity';
    template.targetFilter.user = {
      operator: 'ALL',
      operand: [
        {
          operator: 'CONTAINS',
          operand: {
            targetName: 'frIndexedString1',
            targetValue: 'test',
          },
        },
        {
          operator: 'OR',
          operand: [
            {
              operator: 'EQUALS',
              operand: {
                targetName: 'city',
                targetValue: 'test',
              },
            },
            {
              operator: 'CONTAINS',
              operand: {
                targetName: 'mail',
                targetValue: 'a',
              },
            },
            {
              operator: 'ALL',
              operand: [
                {
                  operator: 'EQUALS',
                  operand: {
                    targetName: 'country',
                    targetValue: 'test',
                  },
                },
                {
                  operator: 'CONTAINS',
                  operand: {
                    targetName: 'givenName',
                    targetValue: 'a',
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const form = getFormValuesFromTemplate(template);
    expect(form.FrWhat).toEqual({
      accountFilter: {},
      accountSelection: 'All accounts in selected applications',
      appFilter: {},
      appSelection: 'All applications',
      decisionFilter: {},
      enableAccountGrant: true,
      enableCertDecisionFilter: false,
      enableEntitlementGrant: false,
      enableRoleGrant: false,
      enableEntitlementComposition: false,
      entitlementFilter: {},
      entitlementSelection: 'All entitlements',
      excludeConditionalAccess: false,
      excludeRoleBasedAccess: false,
      includeChildOrganizations: null,
      numAccounts: 0,
      numApplications: 0,
      numEntitlements: 0,
      numUsers: 0,
      organizationSelection: [],
      orgFilter: 'allOrgs',
      roleFilter: {},
      roleSelection: 'All roles',
      singleApp: [],
      singleUser: '',
      singleUserInfo: {},
      userFilter: {
        operand: [
          {
            operand: {
              targetName: 'frIndexedString1',
              targetValue: 'test',
            },
            operator: 'CONTAINS',
          },
          {
            operand: [
              {
                operand: {
                  targetName: 'city',
                  targetValue: 'test',
                },
                operator: 'EQUALS',
              },
              {
                operand: {
                  targetName: 'mail',
                  targetValue: 'a',
                },
                operator: 'CONTAINS',
              },
              {
                operand: [
                  {
                    operand: {
                      targetName: 'country',
                      targetValue: 'test',
                    },
                    operator: 'EQUALS',
                  },
                  {
                    operand: {
                      targetName: 'givenName',
                      targetValue: 'a',
                    },
                    operator: 'CONTAINS',
                  },
                ],
                operator: 'ALL',
              },
            ],
            operator: 'OR',
          },
        ],
        operator: 'ALL',
      },
      userSelection: 'Users matching a filter',
    });
  });

  it('getFormValuesFromTemplate should generate correctly form for FrWhat step with application filter matching', () => {
    const template = cloneDeep(defaultTemplate);
    template.targetFilter.application = {
      operator: 'OR',
      operand: [
        {
          operator: 'EQUALS',
          operand: {
            targetName: 'glossary.active',
            targetValue: 'False',
          },
        },
        {
          operator: 'CONTAINS',
          operand: {
            targetName: 'name',
            targetValue: 'test',
          },
        },
        {
          operator: 'OR',
          operand: [
            {
              operator: 'EQUALS',
              operand: {
                targetName: 'glossary.customAttribute1',
                targetValue: 'test',
              },
            },
            {
              operator: 'OR',
              operand: [
                {
                  operator: 'CONTAINS',
                  operand: {
                    targetName: 'description',
                    targetValue: 'test',
                  },
                },
              ],
            },
            {
              operator: 'OR',
              operand: [
                {
                  operator: 'GTE',
                  operand: {
                    targetName: 'glossary.startDate',
                    targetValue: '2023-03-07',
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const form = getFormValuesFromTemplate(template);
    expect(form.FrWhat).toEqual({
      accountFilter: {},
      accountSelection: 'All accounts in selected applications',
      decisionFilter: {},
      enableAccountGrant: true,
      enableCertDecisionFilter: false,
      enableEntitlementGrant: false,
      enableRoleGrant: false,
      enableEntitlementComposition: false,
      entitlementFilter: {},
      entitlementSelection: 'All entitlements',
      excludeConditionalAccess: false,
      excludeRoleBasedAccess: false,
      includeChildOrganizations: null,
      numAccounts: 0,
      numApplications: 0,
      numEntitlements: 0,
      numUsers: 0,
      organizationSelection: [],
      orgFilter: 'allOrgs',
      roleFilter: {},
      roleSelection: 'All roles',
      singleApp: [],
      singleUser: '',
      singleUserInfo: {},
      userFilter: {},
      userSelection: 'All users',
      appFilter: {
        operand: [
          {
            operand: {
              targetName: 'glossary.active',
              targetValue: 'False',
            },
            operator: 'EQUALS',
          },
          {
            operand: {
              targetName: 'name',
              targetValue: 'test',
            },
            operator: 'CONTAINS',
          },
          {
            operand: [
              {
                operand: {
                  targetName: 'glossary.customAttribute1',
                  targetValue: 'test',
                },
                operator: 'EQUALS',
              },
              {
                operand: [
                  {
                    operand: {
                      targetName: 'description',
                      targetValue: 'test',
                    },
                    operator: 'CONTAINS',
                  },
                ],
                operator: 'OR',
              },
              {
                operand: [
                  {
                    operand: {
                      targetName: 'glossary.startDate',
                      targetValue: '2023-03-07',
                    },
                    operator: 'GTE',
                  },
                ],
                operator: 'OR',
              },
            ],
            operator: 'OR',
          },
        ],
        operator: 'OR',
      },
      appSelection: 'Applications matching a filter',
    });
  });

  it('getFormValuesFromTemplate should generate correctly form for FrWhat step with entitlement filter matching', () => {
    const template = {
      ...cloneDeep(defaultTemplate),
      entitlement: {
        operand: [],
        operator: 'ALL',
      },
    };
    template.targetFilter.entitlement = {
      operator: 'ALL',
      operand: [
        {
          operator: 'EQUALS',
          operand: {
            targetName: 'glossary.active',
            targetValue: 'False',
          },
        },
        {
          operator: 'CONTAINS',
          operand: {
            targetName: 'name',
            targetValue: 'test',
          },
        },
      ],
    };
    const form = getFormValuesFromTemplate(template);
    expect(form.FrWhat).toEqual({
      accountFilter: {},
      accountSelection: 'All accounts in selected applications',
      decisionFilter: {},
      enableAccountGrant: true,
      enableCertDecisionFilter: false,
      enableEntitlementGrant: false,
      enableRoleGrant: false,
      enableEntitlementComposition: false,
      entitlementFilter: {
        operand: [
          {
            operand: {
              targetName: 'glossary.active',
              targetValue: 'False',
            },
            operator: 'EQUALS',
          },
          {
            operand: {
              targetName: 'name',
              targetValue: 'test',
            },
            operator: 'CONTAINS',
          },
        ],
        operator: 'ALL',
      },
      entitlementSelection: 'Entitlements matching a filter',
      excludeConditionalAccess: false,
      excludeRoleBasedAccess: false,
      includeChildOrganizations: null,
      numAccounts: 0,
      numApplications: 0,
      numEntitlements: 0,
      numUsers: 0,
      organizationSelection: [],
      orgFilter: 'allOrgs',
      roleFilter: {},
      roleSelection: 'All roles',
      singleApp: [],
      singleUser: '',
      singleUserInfo: {},
      userFilter: {},
      userSelection: 'All users',
      appFilter: {},
      appSelection: 'All applications',
    });
  });

  it('getFormValuesFromTemplate should generate correctly form for FrWhat step with organization filter matching', () => {
    const template = cloneDeep(defaultTemplate);
    template.targetFilter.memberOfOrg = ['organization-id-1', 'organization-id-2'];
    const form = getFormValuesFromTemplate(template);
    expect(form.FrWhat).toEqual({
      accountFilter: {},
      accountSelection: 'All accounts in selected applications',
      appFilter: {},
      appSelection: 'All applications',
      decisionFilter: {},
      enableAccountGrant: true,
      enableCertDecisionFilter: false,
      enableEntitlementGrant: false,
      enableRoleGrant: false,
      enableEntitlementComposition: false,
      entitlementFilter: {},
      entitlementSelection: 'All entitlements',
      excludeConditionalAccess: false,
      excludeRoleBasedAccess: false,
      includeChildOrganizations: false,
      numAccounts: 0,
      numApplications: 0,
      numEntitlements: 0,
      numUsers: 0,
      organizationSelection: ['organization-id-1', 'organization-id-2'],
      orgFilter: 'specificOrgs',
      roleFilter: {},
      roleSelection: 'All roles',
      singleApp: [],
      singleUser: '',
      singleUserInfo: {},
      userFilter: {},
      userSelection: 'All users',
    });
  });

  describe('getFormValuesFromTemplate', () => {
    it('should determine user certifier', () => {
      const template = cloneDeep(defaultTemplate);
      template.stages = [{
        certifierType: 'user',
        certifierId: 'managed/user/testUserId',
        certifierScript: null,
      }];
      const form = getFormValuesFromTemplate(template);
      expect(form.FrWho.certType).toBe('user');
      expect(form.FrWho.certUser).toBe('managed/user/testUserId');
    });

    it('should determine manager certifier', () => {
      const template = cloneDeep(defaultTemplate);
      template.stages = [{
        certifierType: 'manager',
        certifierId: null,
        certifierScript: null,
      }];
      const form = getFormValuesFromTemplate(template);
      expect(form.FrWho.certType).toBe('manager');
    });

    it('should determine role certifier', () => {
      const template = cloneDeep(defaultTemplate);
      template.stages = [{
        certifierType: 'authzGroup',
        certifierId: 'managed/role/testRoleId',
        certifierScript: null,
      }];
      const form = getFormValuesFromTemplate(template);
      expect(form.FrWho.certType).toBe('role');
      expect(form.FrWho.certRole).toBe('managed/role/testRoleId');
    });

    it('should determine entitlment owner certifier', () => {
      const template = cloneDeep(defaultTemplate);
      template.stages = [{
        certifierType: 'entitlementOwner',
        certifierId: null,
        certifierScript: null,
      }];
      const form = getFormValuesFromTemplate(template);
      expect(form.FrWho.certType).toBe('entitlementOwner');
    });

    it('should determine organization admin certifier', () => {
      const template = cloneDeep(defaultTemplate);
      template.stages = [{
        certifierType: 'organization',
        certifierId: null,
        certifierScript: null,
      }];
      const form = getFormValuesFromTemplate(template);
      expect(form.FrWho.certType).toBe('organizationAdmin');
    });

    it('should determine custom certifier', () => {
      const template = cloneDeep(defaultTemplate);
      template.stages = [{
        certifierType: 'custom',
        certifierId: null,
        certifierScript: null,
        certifierPath: 'user.id',
      }];
      const form = getFormValuesFromTemplate(template);
      expect(form.FrWho.certType).toBe('custom');
      expect(form.FrWho.certifierPath).toBe('id');
    });

    it('should throw an error for an unrecognized certifier type', () => {
      const template = cloneDeep(defaultTemplate);
      template.stages = [{
        certifierType: 'UNRECOGNIZED',
      }];
      expect(() => getFormValuesFromTemplate(template)).toThrowError('Error reading certifier type from template');
    });

    it('should set processRemediation value correctly', () => {
      const template = cloneDeep(defaultTemplate);
      template.remediationRule = 'BasicRevocation';
      const form = getFormValuesFromTemplate(template);
      expect(form.FrAdditionalOptions.processRemediation).toBe(true);
    });

    it('should read a template with custom column configuration', () => {
      const template = cloneDeep(defaultTemplate);
      template.uiConfig = {
        columnConfig: {
          accounts: ['prop1', 'prop2', 'prop3'],
          roles: ['prop1'],
          entitlements: ['prop1', 'prop2'],
        },
      };
      const form = getFormValuesFromTemplate(template);
      expect(form.FrCustomization.columnConfig).toEqual({
        accounts: ['prop1', 'prop2', 'prop3'],
        roles: ['prop1'],
        entitlements: ['prop1', 'prop2'],
      });
    });

    it('should read a template with no column configuration', () => {
      const template = cloneDeep(defaultTemplate);
      const form = getFormValuesFromTemplate(template);
      expect(form.FrCustomization.columnConfig).toEqual({
        accounts: [],
        roles: [],
        entitlements: [],
      });
    });
  });

  describe('buildSavePayload', () => {
    const baseForms = {
      FrDetailsForm: {},
      FrWhat: {},
      FrWhen: {},
      FrWho: {},
      FrNotifications: {},
      FrAdditionalOptions: {},
    };

    it('sends null for remediationRule when process remediation is false', () => {
      const forms = cloneDeep(baseForms);
      forms.FrAdditionalOptions.processRemediation = false;

      const savePayload = buildSavePayload('identity', forms);
      expect(savePayload.remediationRule).toBe(null);
    });

    it('sends "BasicRevocation" for remediationRule when process remediation is false', () => {
      const forms = cloneDeep(baseForms);
      forms.FrAdditionalOptions.processRemediation = true;

      const savePayload = buildSavePayload('identity', forms);
      expect(savePayload.remediationRule).toBe('BasicRevocation');
    });

    it('sends "Custom" for certifierType and "id" as certifierPath', () => {
      const forms = cloneDeep(baseForms);
      forms.FrWho.certType = 'custom';
      forms.FrWho.certifierPath = 'id';

      const savePayload = buildSavePayload('identity', forms);
      expect(savePayload.stages[0].certifierType).toBe('custom');
      expect(savePayload.stages[0].certifierPath).toBe('user.id');
    });

    it('sends "EntitlementOwner" for certifierType', () => {
      const forms = cloneDeep(baseForms);
      forms.FrWho.certType = 'entitlementOwner';

      const savePayload = buildSavePayload('entitlement', forms);
      expect(savePayload.stages[0].certifierType).toBe('entitlementOwner');
    });

    it('should save a custom columnConfig for each grant type if they are all enabled', () => {
      const forms = cloneDeep(baseForms);
      forms.FrCustomization = {
        columnConfig: {
          accounts: ['prop1', 'prop2', 'prop3'],
          roles: ['prop1'],
          entitlements: ['prop1', 'prop2'],
        },
      };
      forms.FrWhat.enableAccountGrant = true;
      forms.FrWhat.enableEntitlementGrant = true;
      forms.FrWhat.enableRoleGrant = true;
      forms.FrWhat.enableEntitlementCompositionGrant = true;

      const savePayload = buildSavePayload('identity', forms);
      expect(savePayload.uiConfig.columnConfig).toEqual({
        accounts: ['prop1', 'prop2', 'prop3'],
        roles: ['prop1'],
        entitlements: ['prop1', 'prop2'],
      });
    });

    it('should save a custom columnConfig only for account grants', () => {
      const forms = cloneDeep(baseForms);
      forms.FrCustomization = {
        columnConfig: {
          accounts: ['prop1', 'prop2', 'prop3'],
          roles: ['prop1'],
          entitlements: ['prop1', 'prop2'],
        },
      };
      forms.FrWhat.enableAccountGrant = true;

      const savePayload = buildSavePayload('identity', forms);
      expect(savePayload.uiConfig.columnConfig).toEqual({
        accounts: ['prop1', 'prop2', 'prop3'],
      });
    });

    it('should save a custom columnConfig only for role grants', () => {
      const forms = cloneDeep(baseForms);
      forms.FrCustomization = {
        columnConfig: {
          accounts: ['prop1', 'prop2', 'prop3'],
          roles: ['prop1'],
          entitlements: ['prop1', 'prop2'],
        },
      };
      forms.FrWhat.enableRoleGrant = true;

      const savePayload = buildSavePayload('identity', forms);
      expect(savePayload.uiConfig.columnConfig).toEqual({
        roles: ['prop1'],
      });
    });

    it('should save a custom columnConfig only for entitlement grants', () => {
      const forms = cloneDeep(baseForms);
      forms.FrCustomization = {
        columnConfig: {
          accounts: ['prop1', 'prop2', 'prop3'],
          roles: ['prop1'],
          entitlements: ['prop1', 'prop2'],
        },
      };
      forms.FrWhat.enableEntitlementGrant = true;

      const savePayload = buildSavePayload('identity', forms);
      expect(savePayload.uiConfig.columnConfig).toEqual({
        entitlements: ['prop1', 'prop2'],
      });
    });

    it('should save a custom columnConfig only for entitlement composition grants', () => {
      const forms = cloneDeep(baseForms);
      forms.FrCustomization = {
        columnConfig: {
          accounts: ['prop1', 'prop2', 'prop3'],
          roles: ['prop1'],
          entitlements: ['prop1', 'prop2'],
        },
      };
      forms.FrWhat.enableEntitlementCompositionGrant = true;
      const savePayload = buildSavePayload('entitlementComposition', forms);

      expect(savePayload.uiConfig.columnConfig).toEqual({
        entitlements: ['prop1', 'prop2'],
      });
    });

    it('should remove excludeConditionalAccess and excludeRoleBasedAccess for entitlement composition type', () => {
      const forms = cloneDeep(baseForms);
      forms.FrWhat.enableEntitlementCompositionGrant = true;
      forms.FrCustomization = {
        columnConfig: {
          accounts: [],
          roles: [],
          entitlements: [],
        },
      };

      const savePayload = buildSavePayload('ENTITLEMENTCOMPOSITION', forms);

      expect(Object.prototype.hasOwnProperty.call(savePayload, 'excludeConditionalAccess')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(savePayload, 'excludeRoleBasedAccess')).toBe(false);
    });

    it('should keep excludeConditionalAccess and excludeRoleBasedAccess for identity type', () => {
      const forms = cloneDeep(baseForms);
      forms.FrWhat.enableAccountGrant = true;
      forms.FrWhat.excludeConditionalAccess = true;
      forms.FrWhat.excludeRoleBasedAccess = true;
      forms.FrCustomization = {
        columnConfig: {
          accounts: [],
          roles: [],
          entitlements: [],
        },
      };

      const savePayload = buildSavePayload('identity', forms);

      expect(savePayload.excludeConditionalAccess).toBe(true);
      expect(savePayload.excludeRoleBasedAccess).toBe(true);
    });
  });

  describe('getCampaignDuration', () => {
    it('should return duration in days for less than 7 days', () => {
      expect(getCampaignDuration(1)).toBe('1 day');
      expect(getCampaignDuration(3)).toBe('3 days');
    });

    it('should return duration in weeks for 7 to 27 days', () => {
      expect(getCampaignDuration(7)).toBe('1 week');
      expect(getCampaignDuration(14)).toBe('2 weeks');
    });

    it('should return duration in months for 28 to 364 days', () => {
      expect(getCampaignDuration(28)).toBe('1 month');
      expect(getCampaignDuration(56)).toBe('2 months');
    });

    it('should return duration in years for 365 days or more', () => {
      expect(getCampaignDuration(365)).toBe('1 year');
      expect(getCampaignDuration(730)).toBe('2 years');
    });
  });
});

/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import {
  buildSavePayload,
  composeAgentPlatformFilter,
  composeAgentTypeFilter,
  extractAgentPlatformFilter,
  extractAgentTypeFilter,
  getAgentPlatformFilter,
  getAgentTypeFilter,
  getCampaignDuration,
  getFormValuesFromTemplate,
  getAllFilter,
  getAllNonAuthoritativeApplications,
} from './certification';
import { EXPIRATION_TIMING } from './certificationConstants';

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
      enableEntitlementCompositionGrant: false,
      enableIdentityProfileGrant: false,
      enableRoleCompositionGrant: false,
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
      platform: 'all',
      agentType: 'all',
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
      enableEntitlementCompositionGrant: false,
      enableIdentityProfileGrant: false,
      enableRoleCompositionGrant: false,
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
      platform: 'all',
      agentType: 'all',
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
      enableEntitlementCompositionGrant: false,
      enableIdentityProfileGrant: false,
      enableRoleCompositionGrant: false,
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
      platform: 'all',
      agentType: 'all',
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
      enableEntitlementCompositionGrant: false,
      enableIdentityProfileGrant: false,
      enableRoleCompositionGrant: false,
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
      platform: 'all',
      agentType: 'all',
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
      enableEntitlementCompositionGrant: false,
      enableIdentityProfileGrant: false,
      enableRoleCompositionGrant: false,
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
      platform: 'all',
      agentType: 'all',
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
          entitlementComposition: [],
          identityProfile: [],
        },
      };
      const form = getFormValuesFromTemplate(template);
      expect(form.FrCustomization.columnConfig).toEqual({
        accounts: ['prop1', 'prop2', 'prop3'],
        roles: ['prop1'],
        entitlements: ['prop1', 'prop2'],
        entitlementComposition: [],
        identityProfile: [],
        roleComposition: [],
        agentProfile: [],
        agentAccess: [],
      });
    });

    it('should read a template with no column configuration', () => {
      const template = cloneDeep(defaultTemplate);
      const form = getFormValuesFromTemplate(template);
      expect(form.FrCustomization.columnConfig).toEqual({
        accounts: [],
        roles: [],
        entitlements: [],
        entitlementComposition: [],
        identityProfile: [],
        roleComposition: [],
        agentProfile: [],
        agentAccess: [],
      });
    });

    it('sets expirationTiming to "When campaign expires" and expirationDays to 1 when template has no day', () => {
      const template = cloneDeep(defaultTemplate);
      template.events = {
        expirationNotification: {
          notification: 'emailTemplate/certificationExpired',
          includeActor: true,
        },
      };
      const form = getFormValuesFromTemplate(template);
      expect(form.FrNotifications.expirationNotification).toBe(true);
      expect(form.FrNotifications.expirationEmail).toBe('emailTemplate/certificationExpired');
      expect(form.FrNotifications.expirationIncludeOwner).toBe(false);
      expect(form.FrNotifications.expirationIncludeCc).toBe(false);
      expect(form.FrNotifications.expirationCcUserIds).toEqual([]);
      expect(form.FrNotifications.expirationTiming).toBe(EXPIRATION_TIMING.WHEN);
      expect(form.FrNotifications.expirationDays).toBe(1);
    });

    it('hydrates expiration notification recipients from the template', () => {
      const template = cloneDeep(defaultTemplate);
      template.events = {
        expirationNotification: {
          notification: 'emailTemplate/certificationExpired',
          includeActor: true,
          includeOwner: true,
          actors: [
            { type: 'user', id: 'managed/user/user-1' },
            { type: 'user', id: 'managed/user/user-2' },
          ],
        },
      };

      const form = getFormValuesFromTemplate(template);

      expect(form.FrNotifications.expirationIncludeOwner).toBe(true);
      expect(form.FrNotifications.expirationIncludeCc).toBe(true);
      expect(form.FrNotifications.expirationCcUserIds).toEqual([
        'managed/user/user-1',
        'managed/user/user-2',
      ]);
    });

    it('hydrates reminder recipients from the template', () => {
      const template = cloneDeep(defaultTemplate);
      template.events = {
        reminder: {
          notification: 'emailTemplate/certificationReminder',
          frequency: 2,
          includeActor: true,
          includeOwner: true,
          actors: [
            { type: 'user', id: 'managed/user/user-1' },
            { type: 'user', id: 'managed/user/user-2' },
          ],
        },
      };

      const form = getFormValuesFromTemplate(template);

      expect(form.FrNotifications.reminders).toBe(true);
      expect(form.FrNotifications.remindersIncludeOwner).toBe(true);
      expect(form.FrNotifications.remindersIncludeCc).toBe(true);
      expect(form.FrNotifications.remindersCcUserIds).toEqual([
        'managed/user/user-1',
        'managed/user/user-2',
      ]);
    });

    it('skips type-only actor objects when hydrating CC users', () => {
      const template = cloneDeep(defaultTemplate);
      template.events = {
        expirationNotification: {
          notification: 'emailTemplate/certificationExpired',
          includeActor: true,
          actors: [
            { type: 'user', id: 'managed/user/user-1' },
            { type: 'manager' },
            'managed/user/legacy-user',
          ],
        },
        reminder: {
          notification: 'emailTemplate/certificationReminder',
          frequency: 2,
          includeActor: true,
          actors: [{ type: 'manager' }],
        },
      };

      const form = getFormValuesFromTemplate(template);

      expect(form.FrNotifications.expirationIncludeCc).toBe(true);
      expect(form.FrNotifications.expirationCcUserIds).toEqual([
        'managed/user/user-1',
        'managed/user/legacy-user',
      ]);
      expect(form.FrNotifications.remindersIncludeCc).toBe(true);
      expect(form.FrNotifications.remindersCcUserIds).toEqual([]);
    });

    it('defaults reminder recipients when template reminder has no recipients', () => {
      const template = cloneDeep(defaultTemplate);
      template.events = {
        reminder: {
          notification: 'emailTemplate/certificationReminder',
          frequency: 2,
          includeActor: true,
        },
      };

      const form = getFormValuesFromTemplate(template);

      expect(form.FrNotifications.reminders).toBe(true);
      expect(form.FrNotifications.remindersIncludeOwner).toBe(false);
      expect(form.FrNotifications.remindersIncludeCc).toBe(false);
      expect(form.FrNotifications.remindersCcUserIds).toEqual([]);
    });

    it('sets expirationTiming to "Before campaign expires" and expirationDays from template when day is present', () => {
      const template = cloneDeep(defaultTemplate);
      template.events = {
        expirationNotification: {
          notification: 'emailTemplate/certificationExpired',
          day: 7,
          includeActor: true,
        },
      };
      const form = getFormValuesFromTemplate(template);
      expect(form.FrNotifications.expirationNotification).toBe(true);
      expect(form.FrNotifications.expirationEmail).toBe('emailTemplate/certificationExpired');
      expect(form.FrNotifications.expirationTiming).toBe(EXPIRATION_TIMING.BEFORE);
      expect(form.FrNotifications.expirationDays).toBe(7);
    });

    it('sets expirationNotification to false when template has no expirationNotification event', () => {
      const template = cloneDeep(defaultTemplate);
      const form = getFormValuesFromTemplate(template);
      expect(form.FrNotifications.expirationNotification).toBe(false);
      expect(form.FrNotifications.expirationEmail).toBeUndefined();
      expect(form.FrNotifications.expirationTiming).toBe(EXPIRATION_TIMING.WHEN);
    });

    it('should default to all roles for a role composition template with no saved role filter', () => {
      const template = cloneDeep(defaultTemplate);
      template.certificationType = 'roleComposition';
      template.targetFilter.type = ['role'];
      delete template.targetFilter.role;

      const form = getFormValuesFromTemplate(template);
      expect(form.FrWhat.roleSelection).toBe('All roles');
      expect(form.FrWhat.roleFilter).toEqual({});
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
      forms.FrWhat.enableIdentityProfileGrant = true;
      forms.FrWhat.enableRoleCompositionGrant = true;

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
          entitlementComposition: ['prop1', 'prop2'],
          identityProfile: [],
          roleComposition: [],
        },
      };
      forms.FrWhat.enableEntitlementCompositionGrant = true;
      const savePayload = buildSavePayload('entitlementComposition', forms);

      expect(savePayload.uiConfig.columnConfig).toEqual({
        entitlementComposition: ['prop1', 'prop2'],
      });
    });

    it('should save a custom columnConfig only for role composition grants', () => {
      const forms = cloneDeep(baseForms);
      forms.FrCustomization = {
        columnConfig: {
          accounts: ['prop1', 'prop2', 'prop3'],
          roles: ['prop1'],
          entitlements: ['prop1', 'prop2'],
          entitlementComposition: [],
          roleComposition: ['prop1'],
        },
      };
      forms.FrWhat.enableRoleCompositionGrant = true;
      const savePayload = buildSavePayload('roleComposition', forms);

      expect(savePayload.uiConfig.columnConfig).toEqual({
        roleComposition: ['prop1'],
      });
    });

    it('saves the role filter for role composition templates', () => {
      const forms = cloneDeep(baseForms);
      forms.FrCustomization = {
        columnConfig: {
          roleComposition: ['role.role'],
        },
      };
      forms.FrWhat = {
        enableRoleCompositionGrant: true,
        roleSelection: 'Roles matching a filter',
        roleFilter: { operator: 'AND', subfilters: [{ field: 'name', operator: 'EQUALS', value: 'testRole' }] },
      };

      const savePayload = buildSavePayload('roleComposition', forms);
      expect(savePayload.targetFilter.role).toEqual({
        operator: 'AND',
        operand: [{ operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'testRole' } }],
      });
    });

    describe('identity profile buildSavePayload', () => {
      function makeIdentityProfileForms(overrides = {}) {
        const forms = cloneDeep(baseForms);
        forms.FrCustomization = {
          columnConfig: {
            accounts: ['prop1', 'prop2', 'prop3'],
            roles: ['prop1'],
            entitlements: ['prop1', 'prop2'],
            entitlementComposition: [],
            roleComposition: [],
            identityProfile: ['prop1', 'prop2'],
          },
        };
        forms.FrWhat = {
          enableIdentityProfileGrant: true,
          userSelection: 'All users',
          orgFilter: 'allOrgs',
          organizationSelection: [],
          enableCertDecisionFilter: false,
          decisionFilter: {},
          ...overrides,
        };
        return forms;
      }

      it('should save a custom columnConfig only for identity profile grants', () => {
        const savePayload = buildSavePayload('identityProfile', makeIdentityProfileForms());

        expect(savePayload.uiConfig.columnConfig).toEqual({
          identityProfile: ['prop1', 'prop2'],
        });
      });

      it('should set targetFilter.type to [\'user\'] for identity profile', () => {
        const savePayload = buildSavePayload('identityProfile', makeIdentityProfileForms());

        expect(savePayload.targetFilter.type).toEqual(['user']);
      });

      it('should omit targetFilter.user when all users are selected', () => {
        const savePayload = buildSavePayload('identityProfile', makeIdentityProfileForms({
          userSelection: 'All users',
        }));

        expect(Object.prototype.hasOwnProperty.call(savePayload.targetFilter, 'user')).toBe(false);
      });

      it('should include targetFilter.user when a user filter is set', () => {
        const userFilter = { operator: 'EQUALS', operand: [{ operand: { targetName: 'id', targetValue: 'user-1' } }] };
        const savePayload = buildSavePayload('identityProfile', makeIdentityProfileForms({
          userSelection: 'Users matching a filter',
          userFilter,
        }));

        expect(savePayload.targetFilter.user).toBeDefined();
      });

      it('should set targetFilter.memberOfOrg when orgFilter is specificOrgs', () => {
        const savePayload = buildSavePayload('identityProfile', makeIdentityProfileForms({
          orgFilter: 'specificOrgs',
          organizationSelection: ['org-1', 'org-2'],
          includeChildOrganizations: true,
        }));

        expect(savePayload.targetFilter.memberOfOrg).toEqual(['org-1', 'org-2']);
        expect(savePayload.includeChildOrganizations).toBe(true);
      });

      it('should omit targetFilter.memberOfOrg when orgFilter is allOrgs', () => {
        const savePayload = buildSavePayload('identityProfile', makeIdentityProfileForms({
          orgFilter: 'allOrgs',
          organizationSelection: [],
        }));

        expect(Object.prototype.hasOwnProperty.call(savePayload.targetFilter, 'memberOfOrg')).toBe(false);
      });

      it('should omit targetFilter.decision by default', () => {
        const savePayload = buildSavePayload('identityProfile', makeIdentityProfileForms({
          enableCertDecisionFilter: false,
        }));

        expect(Object.prototype.hasOwnProperty.call(savePayload.targetFilter, 'decision')).toBe(false);
      });

      it('should include targetFilter.decision when cert decision filter is enabled', () => {
        const decisionFilter = { operator: 'EQUALS', operand: [{ operand: { targetName: 'decision', targetValue: 'certify' } }] };
        const savePayload = buildSavePayload('identityProfile', makeIdentityProfileForms({
          enableCertDecisionFilter: true,
          decisionFilter,
        }));

        expect(savePayload.targetFilter.decision).toBeDefined();
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

    it('should remove excludeConditionalAccess and excludeRoleBasedAccess for identity profile type', () => {
      const forms = cloneDeep(baseForms);
      forms.FrWhat.enableIdentityProfileGrant = true;
      forms.FrCustomization = {
        columnConfig: {
          accounts: [],
          roles: [],
          entitlements: [],
        },
      };

      const savePayload = buildSavePayload('IDENTITYPROFILE', forms);

      expect(Object.prototype.hasOwnProperty.call(savePayload, 'excludeConditionalAccess')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(savePayload, 'excludeRoleBasedAccess')).toBe(false);
    });

    it('should remove excludeConditionalAccess and excludeRoleBasedAccess for role composition type', () => {
      const forms = cloneDeep(baseForms);
      forms.FrWhat.enableRoleCompositionGrant = true;
      forms.FrCustomization = {
        columnConfig: {
          accounts: [],
          roles: [],
          entitlements: [],
        },
      };

      const savePayload = buildSavePayload('ROLECOMPOSITION', forms);

      expect(Object.prototype.hasOwnProperty.call(savePayload, 'excludeConditionalAccess')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(savePayload, 'excludeRoleBasedAccess')).toBe(false);
    });

    describe('agent certification platform field', () => {
      it('agentProfile writes platform as an OR of templateName/aiAgentSource clauses in targetFilter.application', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.platform = 'aws.bedrock';

        const savePayload = buildSavePayload('AGENTPROFILE', forms);

        expect(savePayload.targetFilter.application).toEqual({
          operator: 'OR',
          operand: [
            { operator: 'EQUALS', operand: { targetName: 'templateName', targetValue: 'aws.bedrock' } },
            { operator: 'EQUALS', operand: { targetName: 'aiAgentSource', targetValue: 'aws.bedrock' } },
          ],
        });
        expect(savePayload.targetFilter.platform).toBeUndefined();
      });

      it('agentAccess composes platform as scope AND access in targetFilter.application', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.platform = 'aws.bedrock';
        forms.FrWhat.appSelection = 'Applications matching a filter';
        forms.FrWhat.appFilter = {
          operator: 'AND',
          subfilters: [{ operator: 'EQUALS', field: 'name', value: 'Billing' }],
        };

        const savePayload = buildSavePayload('AGENTACCESS', forms);

        expect(savePayload.targetFilter.application).toEqual({
          operator: 'AND',
          operand: [
            getAgentPlatformFilter('aws.bedrock'),
            { operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'Billing' } },
          ],
        });
        expect(savePayload.targetFilter.platform).toBeUndefined();
      });

      it('agentAccess composes platform alone (no access filter) as the bare scope tree', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.platform = 'aws.bedrock';
        forms.FrWhat.appSelection = 'All applications';

        const savePayload = buildSavePayload('AGENTACCESS', forms);

        expect(savePayload.targetFilter.application).toEqual(getAgentPlatformFilter('aws.bedrock'));
      });

      it('omits platform from targetFilter when "all" is selected', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.platform = 'all';
        forms.FrWhat.appSelection = 'All applications';

        const savePayload = buildSavePayload('AGENTPROFILE', forms);

        expect(savePayload.targetFilter.platform).toBeUndefined();
        // 'all' writes the standard all-baseline subtree — no scope condition
        expect(savePayload.targetFilter.application).toEqual(getAllNonAuthoritativeApplications());
      });

      it('writes "all" baseline for the account subtree when agentType is "all"', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.agentType = 'all';

        const savePayload = buildSavePayload('AGENTPROFILE', forms);

        expect(savePayload.targetFilter.account).toEqual(getAllFilter());
      });

      it('saves agentProfile with accountGrant item type (agents have no linked user)', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.enableAccountGrant = true;

        const savePayload = buildSavePayload('AGENTPROFILE', forms);

        expect(savePayload.targetFilter.type).toEqual(['accountGrant']);
      });

      it('saves agentAccess with grant item types', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.enableAccountGrant = true;
        forms.FrWhat.enableEntitlementGrant = true;
        forms.FrWhat.enableRoleGrant = true;

        const savePayload = buildSavePayload('AGENTACCESS', forms);

        expect(savePayload.targetFilter.type).toEqual(['accountGrant', 'entitlementGrant', 'roleMembership']);
      });

      it('agentProfile reads platform back from the targetFilter.application clause pair', () => {
        const template = {
          ...defaultTemplate,
          certificationType: 'agentProfile',
          targetFilter: {
            ...defaultTemplate.targetFilter,
            application: getAgentPlatformFilter('google.vertexai'),
          },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        expect(forms.FrWhat.platform).toBe('google.vertexai');
      });

      it('agentProfile treats a foreign application filter as "all" and replaces it on re-save', () => {
        const foreignFilter = {
          operator: 'EQUALS',
          operand: { targetName: 'name', targetValue: 'some app' },
        };
        const template = {
          ...defaultTemplate,
          certificationType: 'agentProfile',
          targetFilter: { ...defaultTemplate.targetFilter, application: foreignFilter },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        // not the canonical shape: the select shows "all"
        expect(forms.FrWhat.platform).toBe('all');
        // re-save: the selects own the subtree — the foreign tree is replaced by
        // the standard all-baseline, not preserved
        const savePayload = buildSavePayload('AGENTPROFILE', forms);
        expect(savePayload.targetFilter.application).toEqual(getAllNonAuthoritativeApplications());
      });

      it('reads platform from a composed agentAccess application subtree and preserves the access filter', () => {
        const accessFilter = { operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'Billing' } };
        const template = {
          ...defaultTemplate,
          certificationType: 'agentAccess',
          targetFilter: {
            ...defaultTemplate.targetFilter,
            application: composeAgentPlatformFilter(accessFilter, 'google.vertexai'),
          },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        expect(forms.FrWhat.platform).toBe('google.vertexai');
        // the peeled remainder still decodes as the user's access filter
        expect(forms.FrWhat.appSelection).toBe('Applications matching a filter');
        expect(forms.FrWhat.appFilter).toEqual(accessFilter);
      });

      it('reads platform from a bare agentAccess scope tree with no access filter', () => {
        const template = {
          ...defaultTemplate,
          certificationType: 'agentAccess',
          targetFilter: {
            ...defaultTemplate.targetFilter,
            application: getAgentPlatformFilter('aws.bedrock'),
          },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        expect(forms.FrWhat.platform).toBe('aws.bedrock');
        expect(forms.FrWhat.appSelection).toBe('All applications');
      });

      it('defaults platform to "all" when not set on targetFilter', () => {
        const template = {
          ...defaultTemplate,
          certificationType: 'agentAccess',
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        expect(forms.FrWhat.platform).toBe('all');
      });
    });

    describe('agent type field', () => {
      it('agentProfile writes agentType as an EQUALS on glossary.accountSubtype in targetFilter.account', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.agentType = 'workload';

        const savePayload = buildSavePayload('AGENTPROFILE', forms);

        expect(savePayload.targetFilter.account).toEqual(getAgentTypeFilter('workload'));
      });

      it('agentAccess composes agentType as scope AND access in targetFilter.account', () => {
        const forms = cloneDeep(baseForms);
        forms.FrWhat.agentType = 'workload';
        forms.FrWhat.accountSelection = 'Accounts matching a filter';
        forms.FrWhat.accountFilter = {
          operator: 'AND',
          subfilters: [{ operator: 'EQUALS', field: 'name', value: 'svc-*' }],
        };

        const savePayload = buildSavePayload('AGENTACCESS', forms);

        expect(savePayload.targetFilter.account).toEqual({
          operator: 'AND',
          operand: [
            { operator: 'EQUALS', operand: { targetName: 'glossary.accountSubtype', targetValue: 'workload' } },
            { operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'svc-*' } },
          ],
        });
        expect(savePayload.targetFilter.agentType).toBeUndefined();
      });

      it('agentProfile reads agentType back from the targetFilter.account clause', () => {
        const template = {
          ...defaultTemplate,
          certificationType: 'agentProfile',
          targetFilter: {
            ...defaultTemplate.targetFilter,
            account: getAgentTypeFilter('nhi'),
          },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        expect(forms.FrWhat.agentType).toBe('nhi');
      });

      it('agentProfile treats a foreign account filter as "all" and replaces it on re-save', () => {
        const foreignFilter = {
          operator: 'EQUALS',
          operand: { targetName: 'accountType', targetValue: 'agent' },
        };
        const template = {
          ...defaultTemplate,
          certificationType: 'agentProfile',
          targetFilter: { ...defaultTemplate.targetFilter, account: foreignFilter },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        // not the canonical shape: the select shows "all"
        expect(forms.FrWhat.agentType).toBe('all');
        // re-save: the selects own the subtree — replaced by the all-baseline
        const savePayload = buildSavePayload('AGENTPROFILE', forms);
        expect(savePayload.targetFilter.account).toEqual(getAllFilter());
      });

      it('reads agentType from a composed agentAccess account subtree and preserves the access filter', () => {
        const accessFilter = { operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'svc-*' } };
        const template = {
          ...defaultTemplate,
          certificationType: 'agentAccess',
          targetFilter: {
            ...defaultTemplate.targetFilter,
            account: composeAgentTypeFilter(accessFilter, 'nhi'),
          },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        expect(forms.FrWhat.agentType).toBe('nhi');
        expect(forms.FrWhat.accountSelection).toBe('Accounts matching a filter');
        expect(forms.FrWhat.accountFilter).toEqual(accessFilter);
      });

      it('defaults agentType when not set on targetFilter', () => {
        const template = {
          ...defaultTemplate,
          certificationType: 'agentAccess',
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        expect(forms.FrWhat.agentType).toBe('all');
      });

      it('round-trips a fully composed agentAccess template', () => {
        const accessFilter = { operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'Billing' } };
        const accountAccessFilter = { operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'svc-*' } };
        const forms = cloneDeep(baseForms);
        forms.FrWhat.platform = 'aws.bedrock';
        forms.FrWhat.agentType = 'workload';
        forms.FrWhat.appSelection = 'Applications matching a filter';
        forms.FrWhat.appFilter = {
          operator: 'AND',
          subfilters: [{ operator: 'EQUALS', field: 'name', value: 'Billing' }],
        };
        forms.FrWhat.accountSelection = 'Accounts matching a filter';
        forms.FrWhat.accountFilter = {
          operator: 'AND',
          subfilters: [{ operator: 'EQUALS', field: 'name', value: 'svc-*' }],
        };

        const savePayload = buildSavePayload('AGENTACCESS', forms);
        const template = {
          ...defaultTemplate,
          certificationType: 'agentAccess',
          targetFilter: { ...defaultTemplate.targetFilter, ...savePayload.targetFilter },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const loaded = getFormValuesFromTemplate(template);

        expect(loaded.FrWhat.platform).toBe('aws.bedrock');
        expect(loaded.FrWhat.agentType).toBe('workload');
        expect(loaded.FrWhat.appSelection).toBe('Applications matching a filter');
        expect(loaded.FrWhat.accountSelection).toBe('Accounts matching a filter');
        // the peeled remainders decode to IGA-format trees (the filter builders
        // parse them into rules on mount and re-emit builder format on change)
        expect(loaded.FrWhat.appFilter).toEqual(accessFilter);
        expect(loaded.FrWhat.accountFilter).toEqual(accountAccessFilter);
      });

      it('defaults platform and agentType to "all" on a legacy bespoke-property template', () => {
        const template = {
          ...defaultTemplate,
          certificationType: 'agentAccess',
          targetFilter: { ...defaultTemplate.targetFilter, platform: 'aws.bedrock', agentType: 'nhi' },
          uiConfig: { columnConfig: {}, columnSortConfig: {} },
        };

        const forms = getFormValuesFromTemplate(template);

        // the old bespoke properties are not recognized by the subtree extractors —
        // the selects fall to "all" (a re-save drops them; no legacy readers remain)
        expect(forms.FrWhat.platform).toBe('all');
        expect(forms.FrWhat.agentType).toBe('all');
      });
    });

    describe('compose/extract helpers', () => {
      it('composeAgentPlatformFilter returns the bare scope when the base is null or a baseline', () => {
        expect(composeAgentPlatformFilter(null, 'p')).toEqual(getAgentPlatformFilter('p'));
        expect(composeAgentPlatformFilter(getAllNonAuthoritativeApplications(), 'p')).toEqual(getAgentPlatformFilter('p'));
      });

      it('composeAgentTypeFilter embeds the bare EQUALS clause flat into the AND', () => {
        const base = { operator: 'EQUALS', operand: { targetName: 'a', targetValue: 'b' } };
        expect(composeAgentTypeFilter(base, 't')).toEqual({
          operator: 'AND',
          operand: [
            { operator: 'EQUALS', operand: { targetName: 'glossary.accountSubtype', targetValue: 't' } },
            base,
          ],
        });
        // null or all-baseline base keeps the canonical AND-of-one scope shape
        expect(composeAgentTypeFilter(null, 't')).toEqual(getAgentTypeFilter('t'));
        expect(composeAgentTypeFilter(getAllFilter(), 't')).toEqual(getAgentTypeFilter('t'));
      });

      it('extractAgentPlatformFilter peels the leading scope clause from a composed AND', () => {
        const base = { operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'x' } };
        const composed = composeAgentPlatformFilter(base, 'p');

        expect(extractAgentPlatformFilter(composed)).toEqual({ platform: 'p', base });
      });

      it('extractAgentTypeFilter keeps multi-clause remainders as one AND', () => {
        const base = {
          operator: 'AND',
          operand: [
            { operator: 'EQUALS', operand: { targetName: 'a', targetValue: '1' } },
            { operator: 'EQUALS', operand: { targetName: 'b', targetValue: '2' } },
          ],
        };
        const composed = composeAgentTypeFilter(base, 't');

        const { agentType, base: rest } = extractAgentTypeFilter(composed);
        expect(agentType).toBe('t');
        expect(rest).toEqual(base);
      });

      it('extract helpers pass through non-scope trees unchanged', () => {
        const foreign = { operator: 'EQUALS', operand: { targetName: 'name', targetValue: 'x' } };
        expect(extractAgentPlatformFilter(foreign)).toEqual({ platform: null, base: foreign });
        expect(extractAgentTypeFilter(foreign)).toEqual({ agentType: null, base: foreign });
      });
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

    it('excludes day from expirationNotification when timing is "when campaign expires"', () => {
      const forms = cloneDeep(baseForms);
      forms.FrNotifications = {
        expirationNotification: true,
        expirationEmail: 'emailTemplate/certificationExpired',
        expirationDays: 3,
        expirationTiming: EXPIRATION_TIMING.WHEN,
      };

      const savePayload = buildSavePayload('identity', forms);

      expect(savePayload.events.expirationNotification.notification).toBe('emailTemplate/certificationExpired');
      expect(savePayload.events.expirationNotification.includeActor).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(savePayload.events.expirationNotification, 'day')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(savePayload.events.expirationNotification, 'includeOwner')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(savePayload.events.expirationNotification, 'actors')).toBe(false);
    });

    it('maps enabled expiration notification recipients to the API payload', () => {
      const forms = cloneDeep(baseForms);
      forms.FrNotifications = {
        expirationNotification: true,
        expirationEmail: 'emailTemplate/certificationExpired',
        expirationIncludeCc: true,
        expirationIncludeOwner: true,
        expirationCcUserIds: ['managed/user/user-1', 'managed/user/user-2'],
        expirationTiming: EXPIRATION_TIMING.WHEN,
      };

      const savePayload = buildSavePayload('identity', forms);

      expect(savePayload.events.expirationNotification.includeOwner).toBe(true);
      expect(savePayload.events.expirationNotification.actors).toEqual([
        { type: 'user', id: 'managed/user/user-1' },
        { type: 'user', id: 'managed/user/user-2' },
      ]);
    });

    it('omits disabled or empty expiration notification recipients', () => {
      const forms = cloneDeep(baseForms);
      forms.FrNotifications = {
        expirationNotification: true,
        expirationEmail: 'emailTemplate/certificationExpired',
        expirationIncludeCc: true,
        expirationIncludeOwner: false,
        expirationCcUserIds: [],
        expirationTiming: EXPIRATION_TIMING.WHEN,
      };

      const savePayload = buildSavePayload('identity', forms);
      const { expirationNotification } = savePayload.events;

      expect(Object.prototype.hasOwnProperty.call(expirationNotification, 'includeOwner')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(expirationNotification, 'actors')).toBe(false);
    });

    it('omits stale expiration CC selections when CC is disabled', () => {
      const forms = cloneDeep(baseForms);
      forms.FrNotifications = {
        expirationNotification: true,
        expirationEmail: 'emailTemplate/certificationExpired',
        expirationIncludeCc: false,
        expirationCcUserIds: ['managed/user/stale-user'],
        expirationTiming: EXPIRATION_TIMING.WHEN,
      };

      const savePayload = buildSavePayload('identity', forms);

      expect(Object.prototype.hasOwnProperty.call(savePayload.events.expirationNotification, 'actors')).toBe(false);
    });

    it('includes day in expirationNotification when timing is "before campaign expires"', () => {
      const forms = cloneDeep(baseForms);
      forms.FrNotifications = {
        expirationNotification: true,
        expirationEmail: 'emailTemplate/certificationExpired',
        expirationDays: 5,
        expirationTiming: EXPIRATION_TIMING.BEFORE,
      };

      const savePayload = buildSavePayload('identity', forms);

      expect(savePayload.events.expirationNotification.notification).toBe('emailTemplate/certificationExpired');
      expect(savePayload.events.expirationNotification.day).toBe(5);
      expect(savePayload.events.expirationNotification.includeActor).toBe(true);
    });

    it('maps enabled reminder recipients to the API payload', () => {
      const forms = cloneDeep(baseForms);
      forms.FrNotifications = {
        reminders: true,
        remindersEmail: 'emailTemplate/certificationReminder',
        remindersDuration: 2,
        remindersTimespan: 'day(s)',
        remindersIncludeCc: true,
        remindersIncludeOwner: true,
        remindersCcUserIds: ['managed/user/user-1', 'managed/user/user-2'],
      };

      const savePayload = buildSavePayload('identity', forms);

      expect(savePayload.events.reminder.notification).toBe('emailTemplate/certificationReminder');
      expect(savePayload.events.reminder.frequency).toBe(2);
      expect(savePayload.events.reminder.includeActor).toBe(true);
      expect(savePayload.events.reminder.includeOwner).toBe(true);
      expect(savePayload.events.reminder.actors).toEqual([
        { type: 'user', id: 'managed/user/user-1' },
        { type: 'user', id: 'managed/user/user-2' },
      ]);
    });

    it('omits disabled or empty reminder recipients', () => {
      const forms = cloneDeep(baseForms);
      forms.FrNotifications = {
        reminders: true,
        remindersEmail: 'emailTemplate/certificationReminder',
        remindersDuration: 2,
        remindersTimespan: 'day(s)',
        remindersIncludeCc: true,
        remindersIncludeOwner: false,
        remindersCcUserIds: [],
      };

      const savePayload = buildSavePayload('identity', forms);
      const { reminder } = savePayload.events;

      expect(reminder.includeActor).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(reminder, 'includeOwner')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(reminder, 'actors')).toBe(false);
    });

    it('omits stale reminder CC selections when CC is disabled', () => {
      const forms = cloneDeep(baseForms);
      forms.FrNotifications = {
        reminders: true,
        remindersEmail: 'emailTemplate/certificationReminder',
        remindersDuration: 2,
        remindersTimespan: 'day(s)',
        remindersIncludeCc: false,
        remindersCcUserIds: ['managed/user/stale-user'],
      };

      const savePayload = buildSavePayload('identity', forms);

      expect(Object.prototype.hasOwnProperty.call(savePayload.events.reminder, 'actors')).toBe(false);
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

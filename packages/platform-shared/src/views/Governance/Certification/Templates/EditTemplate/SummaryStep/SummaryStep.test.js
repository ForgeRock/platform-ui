/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { EXPIRATION_TIMING } from '@forgerock/platform-shared/src/views/Governance/utils/certificationConstants';
import SummaryStep from './index';

const additionalOptions = {
  allowSelfCert: true,
  enableReassignmentDelegation: {
    enableForward: true,
    enableReassign: true,
  },
  allowExceptions: {
    exceptionDuration: '1',
    exceptionTimespan: 'week',
  },
  allowBulkCertify: true,
  allowPartialSignoff: true,
  processRemediationWorkFlow: true,
};

const notifications = {
  assignmentNotification: false,
  escalation: false,
  expirationDays: false,
  expirationNotification: false,
  reassignNotification: false,
  reminders: false,
  remindersDuration: false,
  remindersTimespan: false,
  escalationOwnerInfo: {
    sn: 'test sn',
    givenName: 'test name',
    profileImage: 'test profile',
    userName: 'test user name',
  },
};

const summary = {
  duration: {},
  when: {},
  onCampaignExpiration: {},
  additionalOptions,
  enableAccountGrant: true,
  enableEntitlementGrant: true,
  notifications,
  who: {
    certType: 'user',
    certUserInfo: { givenName: 'John', sn: 'Doe', userName: 'jdoe' },
    certRoleInfo: {},
    certifierPath: '',
    enableDefaultCertifier: false,
    defaultCertifierInfo: {},
  },
};

describe('SummaryStep Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(SummaryStep, {
      global: {
        mocks: {
          $t: (text) => (text),
          $store: {
            state: {
              SharedStore: {
                uiConfig: {},
              },
            },
          },
        },
      },
      props: {
        summary,
      },
    });
  });

  describe('start computed property', () => {
    it('returns empty string if no time constraint in summaryStep', () => {
      expect(wrapper.vm.start).toBe('');
    });

    it('returns a start date if constraint is present', async () => {
      await wrapper.setProps({
        summary: {
          duration: {},
          when: {
            constraint: '2023-02-01T19:43:00.000Z/2023-02-02T19:43:00.000Z',
          },
          onCampaignExpiration: {},
          additionalOptions,
          notifications,
        },
      });

      expect(wrapper.vm.start).toBe('common.daysOfWeek.wednesdayShort, common.months.february 1, 2023');
    });
  });
  describe('getYesOrNoLabel', () => {
    it('should return common.yes if the param is a true boolean', () => {
      const result = wrapper.vm.getYesOrNoLabel(true);
      expect(result).toBe('Common Yes');
    });
    it('should return common.no if the param is a true boolean', () => {
      const result = wrapper.vm.getYesOrNoLabel(false);
      expect(result).toBe('Common No');
    });
  });
  describe('end computed property', () => {
    it('returns empty string if no time constraint in summaryStep', () => {
      expect(wrapper.vm.end).toBe('');
    });

    it('returns an end date if constraint is present', async () => {
      await wrapper.setProps({
        summary: {
          duration: {},
          when: {
            constraint: '2023-02-01T19:43:00.000Z/2023-02-02T19:43:00.000Z',
          },
          onCampaignExpiration: {},
          notifications,
        },
      });

      expect(wrapper.vm.end).toBe('common.daysOfWeek.thursdayShort, common.months.february 2, 2023');
    });
  });
  describe('account count in summaryStep', () => {
    it('render correctly when accountGrant enabled', async () => {
      await wrapper.setProps({
        summary: {
          duration: {},
          when: {},
          onCampaignExpiration: {},
          enableAccountGrant: true,
          numAccounts: 2,
          notifications,
        },
      });
      expect(findByTestId(wrapper, 'summary-account').find('small').text()).toBe('common.accounts');
      expect(findByTestId(wrapper, 'summary-account-count').text()).toBe('2');
    });
    it('account count will not show when accountGrant disabled', async () => {
      await wrapper.setProps({
        summary: {
          duration: {},
          when: {},
          onCampaignExpiration: {},
          enableAccountGrant: false,
          notifications,
        },
      });
      expect(findByTestId(wrapper, 'summary-account').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'summary-account-count').exists()).toBeFalsy();
    });
  });
  describe('entitlement count in summaryStep', () => {
    it('render correctly when entitlementGrant enabled', async () => {
      await wrapper.setProps({
        summary: {
          duration: {},
          when: {},
          onCampaignExpiration: {},
          enableEntitlementGrant: true,
          numEntitlements: 2,
          notifications,
        },
      });
      expect(findByTestId(wrapper, 'summary-entitlement').find('small').text()).toBe('common.entitlements');
      expect(findByTestId(wrapper, 'summary-entitlement-count').text()).toBe('2');
    });
    it('entitlement count will not show when entitlementGrant disabled', async () => {
      await wrapper.setProps({
        summary: {
          duration: {},
          when: {},
          onCampaignExpiration: {},
          enableEntitlementGrant: false,
          notifications,
        },
      });
      expect(findByTestId(wrapper, 'summary-entitlement').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'summary-entitlement-count').exists()).toBeFalsy();
    });
  });
  describe('role count in summaryStep', () => {
    it('render correctly when roleGrant enabled', async () => {
      await wrapper.setProps({
        summary: {
          duration: {},
          when: {},
          onCampaignExpiration: {},
          enableRoleGrant: true,
          numRoles: 3,
          notifications,
        },
      });
      expect(findByTestId(wrapper, 'summary-role').find('small').text()).toBe('common.roles');
      expect(findByTestId(wrapper, 'summary-role-count').text()).toBe('3');
    });
    it('role count will not show when roleGrant is disabled', async () => {
      await wrapper.setProps({
        summary: {
          duration: {},
          when: {},
          onCampaignExpiration: {},
          enableRoleGrant: false,
          notifications,
        },
      });
      expect(findByTestId(wrapper, 'summary-role').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'summary-role-count').exists()).toBeFalsy();
    });
  });
  describe('who will certify in summaryStep', () => {
    it('renders certifier type label', () => {
      expect(findByTestId(wrapper, 'summary-who-certifier-type-value').text()).toBe('governance.editTemplate.user');
    });

    it('renders certifier name for user type', () => {
      expect(findByTestId(wrapper, 'summary-who-certifier-name').text()).toBe('common.userFullName');
    });

    it('renders certifier type label for manager type', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          who: {
            certType: 'manager',
            certUserInfo: {},
            certRoleInfo: {},
            certifierPath: '',
            enableDefaultCertifier: false,
            defaultCertifierInfo: {},
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-who-certifier-type-value').text()).toBe('governance.editTemplate.manager');
      expect(findByTestId(wrapper, 'summary-who-certifier-name').exists()).toBeFalsy();
    });

    it('renders certifier path for custom type', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          who: {
            certType: 'custom',
            certUserInfo: {},
            certRoleInfo: {},
            certifierPath: 'frEmail',
            enableDefaultCertifier: false,
            defaultCertifierInfo: {},
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-who-certifier-path').text()).toBe('frEmail');
    });

    it('renders role name for role type', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          who: {
            certType: 'role',
            certUserInfo: {},
            certRoleInfo: { name: 'Admin Role' },
            certifierPath: '',
            enableDefaultCertifier: false,
            defaultCertifierInfo: {},
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-who-certifier-name').text()).toBe('Admin Role');
    });

    it('renders default certifier when enabled', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          who: {
            certType: 'user',
            certUserInfo: { givenName: 'John', sn: 'Doe' },
            certRoleInfo: {},
            certifierPath: '',
            enableDefaultCertifier: true,
            defaultCertifierInfo: { givenName: 'Jane', sn: 'Smith' },
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-who-default-certifier').text()).toBe('common.userFullName');
    });

    it('does not render who section when summary.who is absent', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          who: undefined,
        },
      });
      expect(findByTestId(wrapper, 'summary-who-certifier-type').exists()).toBeFalsy();
    });
  });

  describe('notifications in summaryStep', () => {
    it('render correctly initial notification', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            assignmentNotification: true,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-assignmentNotification').find('span')
        .text())
        .toBe('governance.editTemplate.notificationsSummary.sendInitialNotification');
    });
    it('should not render initial notification when its property is false', () => {
      wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            assignmentNotification: false,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-assignmentNotification').exists()).toBeFalsy();
    });
    it('render correctly reassign notification', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            reassignNotification: true,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-reassignNotification').find('span')
        .text())
        .toBe('governance.editTemplate.notificationsSummary.sendReassignNotification');
    });
    it('should not render reassign notification when its property is false', () => {
      wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            reassignNotification: false,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-sendReassignNotification').exists()).toBeFalsy();
    });
    it('renders expiration notification with "when expires" text when timing is WHEN', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            expirationNotification: true,
            expirationTiming: EXPIRATION_TIMING.WHEN,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-expirationNotification').find('span')
        .text())
        .toBe('governance.editTemplate.notificationsSummary.sendExpirationNotificationWhenExpires');
    });
    it('renders expiration notification with day count text when timing is BEFORE', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            expirationNotification: true,
            expirationTiming: EXPIRATION_TIMING.BEFORE,
            expirationDays: 3,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-expirationNotification').find('span')
        .text())
        .toBe('governance.editTemplate.notificationsSummary.sendExpirationNotification');
    });
    it('should not render expiration notification when its property is false', () => {
      wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            expirationNotification: false,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-sendExpirationNotification').exists()).toBeFalsy();
    });
    it('render correctly reminder notification', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            reminders: true,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-reminders').find('span')
        .text())
        .toBe('governance.editTemplate.notificationsSummary.sendReminders');
    });
    it('should not render reminder notification when its property is false', () => {
      wrapper.setProps({
        summary: {
          ...summary,
          notifications: {
            reminders: false,
          },
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-reminders').exists()).toBeFalsy();
    });
    it('render correctly escalation notification', async () => {
      await wrapper.setProps({
        summary: {
          ...summary,
          additionalOptions: {
            ...additionalOptions,
            escalation: true,
            escalationOwnerInfo: {
              sn: 'test sn',
              givenName: 'test name',
              profileImage: 'test profile',
              userName: 'test user name',
            },
          },
          notifications: {},
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-escalation').find('span')
        .text())
        .toBe('governance.editTemplate.notificationsSummary.sendEscalation');
    });
    it('should not render escalation notification when its property is false', () => {
      wrapper.setProps({
        summary: {
          ...summary,
          additionalOptions: {
            ...additionalOptions,
            escalation: false,
            escalationOwnerInfo: {
              sn: 'test sn',
              givenName: 'test name',
              profileImage: 'test profile',
              userName: 'test user name',
            },
          },
          notifications: {},
        },
      });
      expect(findByTestId(wrapper, 'summary-notification-escalation').exists()).toBeFalsy();
    });
  });
});

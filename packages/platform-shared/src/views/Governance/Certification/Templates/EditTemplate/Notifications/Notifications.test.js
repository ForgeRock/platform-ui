/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import Notifications from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

mockValidation(['required']);
describe('Notifications View', () => {
  let wrapper;

  CommonsApi.getResource.mockReturnValue(Promise.resolve({ data: {} }));

  describe('initializes with default values', () => {
    beforeEach(() => {
      wrapper = mount(Notifications, {
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
        propsData: {
          value: {
            escalation: false,
            escalationDuration: 1,
            escalationEmail: '',
            escalationOwner: '',
            escalationOwnerInfo: {},
            escalationTimespan: '',
            expirationDays: 1,
            expirationEmail: '',
            expirationNotification: false,
            initialEmail: '',
            initialNotification: false,
            reassignEmail: '',
            reassignNotification: false,
            reminders: false,
            remindersDuration: 1,
            remindersEmail: '',
            remindersTimespan: '',
          },
        },
      });
    });

    it('enabling initial notification shows initial email', async () => {
      findByTestId(wrapper, 'initial-notification').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'initial-notification').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'initial-email').exists()).toBeTruthy();
    });

    it('enabling reassign notification shows reassign email', async () => {
      findByTestId(wrapper, 'reassign-notification').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'reassign-notification').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'reassign-email').exists()).toBeTruthy();
    });

    it('enabling expiration notification shows expiration email and days', async () => {
      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'expiration-notification').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'expiration-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-expiration-days').exists()).toBeTruthy();
    });

    it('enabling reminders notification shows reminders email, duration, and timespan', async () => {
      findByTestId(wrapper, 'expiration-reminders').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'expiration-reminders').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'reminders-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-reminders-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'reminders-timespan').exists()).toBeTruthy();
    });

    it('enabling escalation notification shows exalation email, duration, and timespan', async () => {
      findByTestId(wrapper, 'escalation').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'escalation').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'escalation-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-escalation-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'escalation-timespan').exists()).toBeTruthy();
    });
  });

  describe('handleUserInfo', () => {
    it('should set the scalationOwnerInfo with the params', () => {
      const selectedUser = {
        givenName: 'Kristy',
        profileImage: undefined,
        sn: 'sn',
        userName: 'Kristy.Crawley@autoidzoran.onmicrosoft.com',
      };
      wrapper.vm.handleUserInfo(selectedUser);
      expect(wrapper.vm.formFields.escalationOwnerInfo).toStrictEqual(selectedUser);
    });
  });

  describe('initializes with non default values', () => {
    beforeEach(() => {
      wrapper = mount(Notifications, {
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
        propsData: {
          value: {
            escalation: true,
            escalationDuration: 2,
            escalationEmail: 'temp1',
            escalationOwner: '',
            escalationOwnerInfo: {},
            escalationTimespan: 'governance.timespans.months',
            expirationDays: 5,
            expirationEmail: 'temp1',
            expirationNotification: true,
            initialEmail: 'temp1',
            initialNotification: true,
            reassignEmail: 'temp2',
            reassignNotification: true,
            reminders: true,
            remindersDuration: 3,
            remindersEmail: 'temp2',
            remindersTimespan: 'governance.timespans.weeks',
          },
          emailTemplateOptions: ['temp1', 'temp2'],
        },
      });
    });

    it('initializes form with values from value prop', () => {
      expect(findByTestId(wrapper, 'initial-notification').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'initial-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'initial-email').find('span').text()).toBe('temp1');
      expect(findByTestId(wrapper, 'reassign-notification').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'reassign-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'reassign-email').find('span').text()).toBe('temp2');
      expect(findByTestId(wrapper, 'expiration-notification').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'expiration-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'expiration-email').find('span').text()).toBe('temp1');
      expect(findByTestId(wrapper, 'input-expiration-days').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-expiration-days').element.value).toBe('5');
      expect(findByTestId(wrapper, 'expiration-reminders').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'reminders-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'reminders-email').find('span').text()).toBe('temp2');
      expect(findByTestId(wrapper, 'input-reminders-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-reminders-duration').element.value).toBe('3');
      expect(findByTestId(wrapper, 'reminders-timespan').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'reminders-timespan').find('span').text()).toBe('week(s)');
      expect(findByTestId(wrapper, 'escalation').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'escalation-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'escalation-email').find('span').text()).toBe('temp1');
      expect(findByTestId(wrapper, 'input-escalation-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-escalation-duration').element.value).toBe('2');
      expect(findByTestId(wrapper, 'escalation-timespan').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'escalation-timespan').find('span').text()).toBe('month(s)');
    });
  });
});

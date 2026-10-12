/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FormWizard from '@forgerock/platform-shared/src/components/FormWizard/FormWizard';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { EXPIRATION_TIMING } from '@forgerock/platform-shared/src/views/Governance/utils/certificationConstants';
import Notifications from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

mockValidation(['required', 'min_value', 'max_selected']);
describe('Notifications View', () => {
  let wrapper;

  CommonsApi.getResource.mockReturnValue(Promise.resolve({ data: {} }));

  describe('initializes with default values', () => {
    beforeEach(() => {
      wrapper = mount(Notifications, {
        global: {
          mocks: {
            $t: (text) => ({
              'governance.editTemplate.expirationNotificationSendToOwner': 'Send to Campaign Owner',
              'governance.editTemplate.remindersNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.remindersNotificationCcUsers': 'Specific users to notify (max 20)',
              'governance.editTemplate.expirationNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.expirationNotificationCcUsers': 'Specific users to notify (max 20)',
            }[text] || text),
            $store: {
              state: {
                SharedStore: {
                  uiConfig: {},
                  governanceDevEnabled: true,
                },
              },
            },
          },
        },
        propsData: {
          value: {
            expirationDays: 1,
            expirationEmail: '',
            expirationIncludeCc: false,
            expirationIncludeOwner: false,
            expirationCcUserIds: [],
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

    it('enabling expiration notification shows expiration email and timing dropdown', async () => {
      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'expiration-notification').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'expiration-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'expiration-timing').exists()).toBeTruthy();
    });

    it('shows the expiration CC picker only when CC recipients are enabled', async () => {
      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'expiration-cc-users').exists()).toBeFalsy();

      await findByTestId(wrapper, 'expiration-include-cc').setChecked(true);
      await flushPromises();
      expect(wrapper.text()).toContain('Send to specific users');
      expect(findByTestId(wrapper, 'expiration-cc-users').exists()).toBeTruthy();
      expect(wrapper.text()).toContain('Specific users to notify');
    });

    it('hides the recipient checkboxes for expiration and reminders when the governance dev flag is off', async () => {
      wrapper = mount(Notifications, {
        global: {
          mocks: {
            $t: (text) => ({
              'governance.editTemplate.expirationNotificationSendToOwner': 'Send to Campaign Owner',
              'governance.editTemplate.remindersNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.remindersNotificationCcUsers': 'Specific users to notify',
              'governance.editTemplate.expirationNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.expirationNotificationCcUsers': 'Specific users to notify',
            }[text] || text),
            $store: {
              state: {
                SharedStore: {
                  uiConfig: {},
                  governanceDevEnabled: false,
                },
              },
            },
          },
        },
        propsData: {
          value: {
            expirationDays: 1,
            expirationEmail: '',
            expirationIncludeCc: false,
            expirationIncludeOwner: false,
            expirationCcUserIds: [],
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

      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      await findByTestId(wrapper, 'expiration-reminders').setChecked(true);
      await flushPromises();

      expect(findByTestId(wrapper, 'expiration-include-owner').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'expiration-include-cc').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'expiration-cc-users').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'reminders-include-owner').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'reminders-include-cc').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'reminders-cc-users').exists()).toBeFalsy();
    });

    it('toggles expiration recipients and emits managed user paths', async () => {
      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'expiration-include-owner').exists()).toBeTruthy();
      await findByTestId(wrapper, 'expiration-include-cc').setChecked(true);
      await flushPromises();
      expect(wrapper.vm.formFields.expirationIncludeCc).toBe(true);
      wrapper.vm.handleExpirationCcUsersInput(['one', 'two']);
      await flushPromises();
      expect(wrapper.vm.formFields.expirationCcUserIds).toEqual([
        'managed/user/one',
        'managed/user/two',
      ]);
    });

    it('round-trips CC ids: strips any managed prefix from picker input and display values', async () => {
      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      await findByTestId(wrapper, 'expiration-include-cc').setChecked(true);
      await flushPromises();

      // Bare ids (what GovResourceMultiselect emits) become managed/user paths
      wrapper.vm.handleExpirationCcUsersInput(['bare-id', 'managed/alpha_user/legacy-id']);
      expect(wrapper.vm.formFields.expirationCcUserIds).toEqual([
        'managed/user/bare-id',
        'managed/user/legacy-id',
      ]);

      // The computed strips the full path back down for the picker display value
      expect(wrapper.vm.expirationCcUserIds).toEqual(['bare-id', 'legacy-id']);
    });

    it('does not show expiration days when timing is "when campaign expires" (default)', async () => {
      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'input-expiration-days').exists()).toBeFalsy();
    });

    it('shows expiration days when "before campaign expires" is selected', async () => {
      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      wrapper.vm.formFields.expirationTiming = EXPIRATION_TIMING.BEFORE;
      await flushPromises();
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

    it('shows the reminders owner and CC recipients only when CC is enabled', async () => {
      findByTestId(wrapper, 'expiration-reminders').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'reminders-include-owner').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'reminders-include-cc').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'reminders-cc-users').exists()).toBeFalsy();

      await findByTestId(wrapper, 'reminders-include-cc').setChecked(true);
      await flushPromises();
      expect(wrapper.text()).toContain('Send to specific users');
      expect(findByTestId(wrapper, 'reminders-cc-users').exists()).toBeTruthy();
      expect(wrapper.text()).toContain('Specific users to notify');
    });

    it('toggles reminder recipients and emits managed user paths', async () => {
      findByTestId(wrapper, 'expiration-reminders').setChecked(true);
      await flushPromises();
      await findByTestId(wrapper, 'reminders-include-cc').setChecked(true);
      await flushPromises();
      expect(wrapper.vm.formFields.remindersIncludeCc).toBe(true);
      wrapper.vm.handleRemindersCcUsersInput(['one', 'two']);
      await flushPromises();
      expect(wrapper.vm.formFields.remindersCcUserIds).toEqual([
        'managed/user/one',
        'managed/user/two',
      ]);
    });

    it('round-trips reminder CC ids: strips any managed prefix from picker input and display values', async () => {
      findByTestId(wrapper, 'expiration-reminders').setChecked(true);
      await flushPromises();
      await findByTestId(wrapper, 'reminders-include-cc').setChecked(true);
      await flushPromises();

      wrapper.vm.handleRemindersCcUsersInput(['bare-id', 'managed/alpha_user/legacy-id']);
      expect(wrapper.vm.formFields.remindersCcUserIds).toEqual([
        'managed/user/bare-id',
        'managed/user/legacy-id',
      ]);

      expect(wrapper.vm.remindersCcUserIds).toEqual(['bare-id', 'legacy-id']);
    });
  });

  describe('initializes with non default values', () => {
    beforeEach(() => {
      wrapper = mount(Notifications, {
        global: {
          mocks: {
            $t: (text) => ({
              'governance.editTemplate.expirationNotificationSendToOwner': 'Send to Campaign Owner',
              'governance.editTemplate.remindersNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.remindersNotificationCcUsers': 'Specific users to notify (max 20)',
              'governance.editTemplate.expirationNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.expirationNotificationCcUsers': 'Specific users to notify (max 20)',
            }[text] || text),
            $store: {
              state: {
                SharedStore: {
                  uiConfig: {},
                  governanceDevEnabled: true,
                },
              },
            },
          },
        },
        propsData: {
          value: {
            expirationDays: 5,
            expirationEmail: 'temp1',
            expirationIncludeCc: true,
            expirationIncludeOwner: true,
            expirationCcUserIds: ['managed/user/123'],
            expirationNotification: true,
            expirationTiming: EXPIRATION_TIMING.BEFORE,
            initialEmail: 'temp1',
            initialNotification: true,
            reassignEmail: 'temp2',
            reassignNotification: true,
            reminders: true,
            remindersDuration: 3,
            remindersEmail: 'temp2',
            remindersIncludeCc: true,
            remindersIncludeOwner: true,
            remindersCcUserIds: ['managed/user/456'],
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
      expect(findByTestId(wrapper, 'expiration-include-owner').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'expiration-include-cc').attributes('value')).toBe('true');
      expect(wrapper.vm.formFields.expirationIncludeCc).toBe(true);
      expect(findByTestId(wrapper, 'expiration-reminders').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'reminders-include-owner').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'reminders-include-cc').attributes('value')).toBe('true');
      expect(wrapper.vm.formFields.remindersIncludeCc).toBe(true);
      expect(findByTestId(wrapper, 'reminders-email').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'reminders-email').find('span').text()).toBe('temp2');
      expect(findByTestId(wrapper, 'input-reminders-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-reminders-duration').element.value).toBe('3');
      expect(findByTestId(wrapper, 'reminders-timespan').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'reminders-timespan').find('span').text()).toBe('week(s)');
    });
  });

  describe('wizard validity integration', () => {
    const WizardHarness = defineComponent({
      components: {
        FormWizard,
        FrField,
        Notifications,
      },
      data: () => ({
        requiredValue: 'satisfied',
        notificationValue: {
          expirationDays: 1,
          expirationEmail: 'emailTemplate/expiration',
          expirationIncludeCc: false,
          expirationIncludeOwner: false,
          expirationCcUserIds: [],
          expirationNotification: false,
          expirationTiming: EXPIRATION_TIMING.WHEN,
          initialEmail: '',
          initialNotification: false,
          reassignEmail: '',
          reassignNotification: false,
          reminders: false,
          remindersDuration: 1,
          remindersEmail: '',
          remindersTimespan: '',
        },
      }),
      template: `
        <FormWizard
          title="Notifications"
          :tabs="[{ title: 'Notifications', component: 'Notifications' }]">
          <template #Notifications>
            <FrField
              v-model="requiredValue"
              name="unrelated-required-field"
              type="string"
              validation="required"
              validation-immediate
              label="Unrelated required field" />
            <Notifications
              :value="notificationValue"
              :email-template-options="[{ text: 'Expiration', value: 'emailTemplate/expiration' }]" />
          </template>
        </FormWizard>
      `,
    });

    it('blocks save for empty CC and restores validity after selecting a user', async () => {
      setupTestPinia();
      const wizardWrapper = mount(WizardHarness, {
        global: {
          mocks: {
            $t: (text) => ({
              'governance.editTemplate.expirationNotificationSendToOwner': 'Send to Campaign Owner',
              'governance.editTemplate.remindersNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.remindersNotificationCcUsers': 'Specific users to notify',
              'governance.editTemplate.expirationNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.expirationNotificationCcUsers': 'Specific users to notify',
              'governance.editTemplate.expirationNotificationCcUsersDescription': 'Up to 20 users can be selected',
              'governance.editTemplate.remindersNotificationCcUsersDescription': 'Up to 20 users can be selected',
            }[text] || text),
            $store: {
              state: {
                SharedStore: { uiConfig: {}, governanceDevEnabled: true },
              },
            },
          },
        },
      });
      await flushPromises();

      const saveButton = findByTestId(wizardWrapper, 'saveButton');
      expect(saveButton.attributes('disabled')).toBeUndefined();

      const notificationWrapper = wizardWrapper.findComponent(Notifications);
      await findByTestId(notificationWrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      await findByTestId(notificationWrapper, 'expiration-include-cc').setChecked(true);
      await flushPromises();

      expect(saveButton.attributes('disabled')).toBeDefined();

      const picker = notificationWrapper.findComponent({ name: 'GovResourceMultiselect' });
      await picker.vm.$emit('input', ['user-1']);
      await flushPromises();

      expect(notificationWrapper.vm.formFields.expirationCcUserIds).toEqual(['managed/user/user-1']);
      expect(picker.props('value')).toEqual(['user-1']);
      expect(saveButton.attributes('disabled')).toBeUndefined();

      await picker.vm.$emit('input', []);
      await flushPromises();

      expect(saveButton.attributes('disabled')).toBeDefined();
    });

    it('blocks save when more than 20 CC users are selected and restores validity after trimming', async () => {
      setupTestPinia();
      const wizardWrapper = mount(WizardHarness, {
        global: {
          mocks: {
            $t: (text) => ({
              'governance.editTemplate.expirationNotificationSendToOwner': 'Send to Campaign Owner',
              'governance.editTemplate.remindersNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.remindersNotificationCcUsers': 'Specific users to notify (max 20)',
              'governance.editTemplate.expirationNotificationIncludeCc': 'Send to specific users',
              'governance.editTemplate.expirationNotificationCcUsers': 'Specific users to notify (max 20)',
              'common.policyValidationMessages.MAX_SELECTED': 'Must not have more than {max} value(s)',
            }[text] || text),
            $store: {
              state: {
                SharedStore: { uiConfig: {}, governanceDevEnabled: true },
              },
            },
          },
        },
      });
      await flushPromises();

      const saveButton = findByTestId(wizardWrapper, 'saveButton');
      expect(saveButton.attributes('disabled')).toBeUndefined();

      const notificationWrapper = wizardWrapper.findComponent(Notifications);
      await findByTestId(notificationWrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      await findByTestId(notificationWrapper, 'expiration-include-cc').setChecked(true);
      await flushPromises();

      const picker = notificationWrapper.findComponent({ name: 'GovResourceMultiselect' });

      // Selecting exactly the maximum keeps the form valid
      await picker.vm.$emit('input', new Array(20).fill(0).map((_, i) => `user-${i}`));
      await flushPromises();
      expect(saveButton.attributes('disabled')).toBeUndefined();

      // Exceeding the maximum invalidates the form and blocks save
      await picker.vm.$emit('input', new Array(21).fill(0).map((_, i) => `user-${i}`));
      await flushPromises();
      expect(saveButton.attributes('disabled')).toBeDefined();

      // Trimming back under the maximum restores validity
      await picker.vm.$emit('input', ['user-0']);
      await flushPromises();
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('binds the same required + max-20 validation to the reminders picker as the expiration picker', async () => {
      findByTestId(wrapper, 'expiration-notification').setChecked(true);
      await flushPromises();
      await findByTestId(wrapper, 'expiration-include-cc').setChecked(true);
      await flushPromises();
      await findByTestId(wrapper, 'expiration-reminders').setChecked(true);
      await flushPromises();
      await findByTestId(wrapper, 'reminders-include-cc').setChecked(true);
      await flushPromises();

      const expectedValidation = { required: true, max_selected: { max: 20 } };
      const pickers = wrapper.findAllComponents({ name: 'GovResourceMultiselect' });
      expect(pickers.length).toBe(2);
      expect(pickers[0].props('validation')).toEqual(expectedValidation);
      expect(pickers[1].props('validation')).toEqual(pickers[0].props('validation'));
      expect(pickers.every((p) => p.props('validationImmediate'))).toBe(true);
      expect(pickers.every((p) => p.props('resource') === 'user')).toBe(true);
    });
  });
});

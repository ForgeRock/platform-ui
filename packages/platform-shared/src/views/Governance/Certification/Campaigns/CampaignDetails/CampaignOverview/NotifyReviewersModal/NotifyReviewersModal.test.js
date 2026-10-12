/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BModal } from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrDateTimeTimezonePicker from '@forgerock/platform-shared/src/components/DateTimeTimezonePicker';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceMultiselect from '@forgerock/platform-shared/src/components/governance/GovResourceMultiselect';
import { getEmailNotificationTemplates } from '@forgerock/platform-shared/src/api/governance/NotificationTemplateApi';
import { getAdminCertificationItems } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import validationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import NotifyReviewersModal from './index';

dayjs.extend(utc);

jest.mock('@/i18n', () => ({
  global: {
    t: (id) => id,
  },
}));

jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/NotificationTemplateApi', () => ({
  getEmailNotificationTemplates: jest.fn(),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi', () => ({
  getAdminCertificationItems: jest.fn(),
}));

// BModal's default VTU stub does not render the named #modal-footer scoped
// slot, so the send button never mounts; this stub renders both the body and
// the footer (with the cancel function the scoped slot destructures) and
// keeps the show/hidden events emittable.
const BModalStub = {
  name: 'BModal',
  emits: ['show', 'hidden'],
  setup(_, { slots }) {
    return () => h('div', { id: 'NotifyReviewersModal', title: 'NotifyReviewersModalTitle' }, [
      slots.default?.(),
      slots['modal-footer']?.({ cancel: () => {} }),
    ]);
  },
};

const templatesResponse = {
  data: {
    result: [
      { _id: 'certificationReminder', displayName: 'Certification Reminder' },
      { _id: 'certificationAssigned', displayName: null },
    ],
  },
};

const campaignsResponse = {
  data: {
    result: [
      { id: 'camp-1', campaignName: 'Q3 Access Review' },
      { id: 'camp-2', name: 'Entitlement Review' },
    ],
  },
};

/**
 * Mounts the modal and triggers the BModal @show handler, the same wiring
 * BModal.show() uses in production.
 * @param {Object} props - props forwarded to the modal
 * @returns {Object} Vue Test Utils wrapper
 */
function mountComponent(props = {}) {
  const wrapper = shallowMount(NotifyReviewersModal, {
    global: {
      renderStubDefaultSlot: true,
      stubs: {
        BModal: BModalStub,
      },
      mocks: {
        $t: (text) => text,
      },
    },
    props: {
      isTesting: true,
      loading: false,
      ...props,
    },
  });
  // The modal loads its options when shown; drive the real @show wiring.
  wrapper.findComponent(BModal).vm.$emit('show');
  return wrapper;
}

/**
 * Fills the campaign and template selects through the FrField stubs (the
 * Vue 2-compat emit FrField listens to) and, when the campaign is editable,
 * picks the first option.
 * @param {Object} wrapper - Vue Test Utils wrapper
 * @param {String} [campaignId] - campaign id to pick; omitted picks none
 * @param {String} [template] - template id to pick
 */
function fillSelects(wrapper, campaignId = 'camp-1', template = 'emailTemplate/certificationReminder') {
  const fields = wrapper.findAllComponents(FrField);
  let index = 0;
  if (fields.length === 2) {
    fields[0].vm.$emit('modelCompat:input', campaignId);
    index = 1;
  }
  fields[index].vm.$emit('modelCompat:input', template);
}

describe('NotifyReviewersModal', () => {
  let wrapper;
  let templatesDeferred;
  let campaignsDeferred;

  beforeEach(() => {
    jest.clearAllMocks();
    templatesDeferred = {};
    templatesDeferred.promise = new Promise((resolve, reject) => {
      templatesDeferred.resolve = resolve;
      templatesDeferred.reject = reject;
    });
    campaignsDeferred = {};
    campaignsDeferred.promise = new Promise((resolve, reject) => {
      campaignsDeferred.resolve = resolve;
      campaignsDeferred.reject = reject;
    });
    getEmailNotificationTemplates.mockReturnValue(templatesDeferred.promise);
    getAdminCertificationItems.mockReturnValue(campaignsDeferred.promise);
    wrapper = mountComponent();
  });

  describe('initial state', () => {
    it('renders the modal with correct id and title', () => {
      const modal = wrapper.findComponent(BModal);
      expect(modal.exists()).toBe(true);
      expect(modal.attributes('id')).toBe('NotifyReviewersModal');
      expect(modal.attributes('title')).toBe('governance.certificationDetails.notifyReviewersModal.title');
    });

    it('renders the required send date field as a datetime picker after the template select', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve(campaignsResponse);
      await flushPromises();
      const fields = wrapper.findAllComponents(FrField);
      // Campaign select + template select; the send date renders inside the
      // combined datetime + timezone picker component.
      expect(fields).toHaveLength(2);
      // A missing type would render a plain text box instead of the datetime picker.
      const picker = wrapper.findComponent(FrDateTimeTimezonePicker);
      expect(picker.exists()).toBe(true);
      // Prepopulated with the current datetime in UTC (offset 0).
      expect(picker.props('date')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
      expect(picker.props('timezone')).toBe(0);
      expect(picker.props('label')).toBe('governance.certificationDetails.notifyReviewersModal.sendDateLabel');
      expect(picker.props('timezoneLabel')).toBe('governance.certificationDetails.notifyReviewersModal.sendTimezoneLabel');
      // The timezone picker renders as a dropdown of common zones (UTC default).
      expect(picker.props('timezoneSelect')).toBe(true);
      // The datetime is required and must be now or in the future.
      expect(picker.props('validation')).toEqual({
        required: true,
        is_after_date: {
          date: dayjs.utc().subtract(1, 'day').endOf('day').format('YYYY-MM-DDTHH:mm'),
          message: 'governance.certificationDetails.notifyReviewersModal.sendDateInPast',
        },
      });
    });

    it('marks selects loaded once both requests resolve', async () => {
      expect(wrapper.find('[data-testid="notify-reviewers-selects-loading"]').exists()).toBe(true);
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve(campaignsResponse);
      await flushPromises();
      expect(getEmailNotificationTemplates).toHaveBeenCalledWith({ context: 'certification' });
      expect(getAdminCertificationItems).toHaveBeenCalled();
      expect(wrapper.find('[data-testid="notify-reviewers-selects-loading"]').exists()).toBe(false);
    });

    it('builds campaign options from active campaigns', async () => {
      campaignsDeferred.resolve(campaignsResponse);
      templatesDeferred.resolve({ data: { result: [] } });
      await flushPromises();
      expect(wrapper.findAllComponents(FrField)[0].vm.$attrs.options).toEqual([
        { text: 'Q3 Access Review', value: 'camp-1' },
        { text: 'Entitlement Review', value: 'camp-2' },
      ]);
    });

    it('builds template options exactly like the template screen (startCase text, emailTemplate prefix, sorted)', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve({ data: { result: [] } });
      await flushPromises();
      expect(wrapper.findAllComponents(FrField)[1].vm.$attrs.options).toEqual([
        { text: 'Certification Assigned', value: 'emailTemplate/certificationAssigned' },
        { text: 'Certification Reminder', value: 'emailTemplate/certificationReminder' },
      ]);
    });

    it('disables send until a campaign, template, and send date are set', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve(campaignsResponse);
      await flushPromises();
      const sendButton = wrapper.findComponent(FrButtonWithSpinner);
      expect(sendButton.props('disabled')).toBe(true);
      fillSelects(wrapper);
      await wrapper.vm.$nextTick();
      expect(sendButton.props('disabled')).toBe(false);
    });

    it('normalizes cc user ids to managed/user paths in the save payload', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve(campaignsResponse);
      await flushPromises();
      // FrGovResourceMultiselect is stubbed; emit input on the stub.
      const multiselect = wrapper.findComponent(FrGovResourceMultiselect);
      multiselect.vm.$emit('input', ['one', 'managed/user/two']);
      fillSelects(wrapper);
      wrapper.findComponent(FrButtonWithSpinner).vm.$emit('click');
      expect(wrapper.emitted('save')[0][0].ccUserIds).toEqual([
        'managed/user/one',
        'managed/user/two',
      ]);
    });

    it('saves the prepopulated datetime as UTC when unmodified', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve(campaignsResponse);
      await flushPromises();
      const picker = wrapper.findComponent(FrDateTimeTimezonePicker);
      const prepopulated = picker.props('date');
      expect(prepopulated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
      fillSelects(wrapper);
      wrapper.findComponent(FrButtonWithSpinner).vm.$emit('click');
      // Offset 0: the prepopulated UTC-now draft converts to itself.
      expect(wrapper.emitted('save')).toEqual([[
        {
          campaignId: 'camp-1',
          template: 'emailTemplate/certificationReminder',
          date: `${prepopulated}:00.000Z`,
          ccUserIds: [],
        },
      ]]);
    });

    it('emits the UTC date when one is picked', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve(campaignsResponse);
      await flushPromises();
      fillSelects(wrapper);
      const picker = wrapper.findComponent(FrDateTimeTimezonePicker);
      picker.vm.$emit('update:date', '2026-10-01T09:00');
      picker.vm.$emit('update:timezone', -5);
      await flushPromises();
      wrapper.findComponent(FrButtonWithSpinner).vm.$emit('click');
      expect(wrapper.emitted('save')).toEqual([[
        {
          campaignId: 'camp-1',
          template: 'emailTemplate/certificationReminder',
          date: '2026-10-01T14:00:00.000Z',
          ccUserIds: [],
        },
      ]]);
    });

    it('validates the send date as now-or-future via is_after_date', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve(campaignsResponse);
      await flushPromises();
      const validation = wrapper.findComponent(FrDateTimeTimezonePicker).props('validation');
      // Directly against the registered rule, mirroring vee-validate's invocation.
      const rules = validationRules.getRules({ global: { t: (id) => id } });
      // DateTimeInput validates the DATE sub-input only, which dayjs parses
      // as midnight — so the preselected today passes (the comparison date is
      // the end of yesterday) and yesterday fails.
      const todayMidnight = dayjs.utc().format('YYYY-MM-DD');
      const yesterdayMidnight = dayjs.utc().subtract(1, 'day').format('YYYY-MM-DD');
      expect(rules.is_after_date(todayMidnight, validation.is_after_date, {})).toBe(true);
      expect(rules.is_after_date(yesterdayMidnight, validation.is_after_date, {})).toBe(
        'governance.certificationDetails.notifyReviewersModal.sendDateInPast',
      );
      // required is set so an empty field cannot pass either.
      expect(validation.required).toBe(true);
    });
  });

  describe('@actions', () => {
    it('shows an error inside the modal when either option request fails', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.reject(new Error('failure'));
      await flushPromises();
      expect(showErrorMessage).toHaveBeenCalledWith(
        expect.any(Error),
        'governance.certificationDetails.errors.errorGettingNotificationTemplates',
      );
      // The loading paragraph is cleared either way.
      expect(wrapper.find('[data-testid="notify-reviewers-selects-loading"]').exists()).toBe(false);
    });

    it('resets the drafts when the modal is hidden', async () => {
      templatesDeferred.resolve(templatesResponse);
      campaignsDeferred.resolve(campaignsResponse);
      await flushPromises();
      fillSelects(wrapper);
      await wrapper.vm.$nextTick();
      expect(wrapper.findComponent(FrButtonWithSpinner).props('disabled')).toBe(false);
      wrapper.findComponent(BModal).vm.$emit('hidden');
      await flushPromises();
      // After reset the send button is disabled again (empty drafts).
      expect(wrapper.findComponent(FrButtonWithSpinner).props('disabled')).toBe(true);
    });

    it('skips the campaign list request when initialCampaignId is provided', async () => {
      getAdminCertificationItems.mockClear();
      wrapper = mountComponent({ initialCampaignId: 'camp-9' });
      templatesDeferred.resolve(templatesResponse);
      await flushPromises();
      expect(getAdminCertificationItems).not.toHaveBeenCalled();
      // Campaign select is not rendered when the campaign is fixed.
      const fields = wrapper.findAllComponents(FrField);
      expect(fields).toHaveLength(1);
      fields[0].vm.$emit('modelCompat:input', 'emailTemplate/certificationReminder');
      await wrapper.vm.$nextTick();
      const sendButton = wrapper.findComponent(FrButtonWithSpinner);
      expect(sendButton.props('disabled')).toBe(false);
      const prepopulated = wrapper.findComponent(FrDateTimeTimezonePicker).props('date');
      sendButton.vm.$emit('click');
      expect(wrapper.emitted('save')).toEqual([[
        {
          campaignId: 'camp-9',
          template: 'emailTemplate/certificationReminder',
          date: `${prepopulated}:00.000Z`,
          ccUserIds: [],
        },
      ]]);
    });
  });
});

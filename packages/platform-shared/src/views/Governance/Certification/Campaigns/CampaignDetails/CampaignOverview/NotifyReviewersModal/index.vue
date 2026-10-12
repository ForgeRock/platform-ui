<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="NotifyReviewersModal"
    no-close-on-backdrop
    size="lg"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('governance.certificationDetails.notifyReviewersModal.title')"
    @show="onShow"
    @hidden="resetModal">
    <p
      class="mb-3"
      data-testid="notify-reviewers-description"
    >
      {{ $t('governance.certificationDetails.notifyReviewersModal.description') }}
    </p>
    <FrField
      v-if="!initialCampaignId"
      v-model="campaignIdDraft"
      class="mb-3"
      data-testid="notify-reviewers-campaign-select"
      name="campaign"
      type="select"
      validation="required"
      :label="$t('governance.certificationDetails.notifyReviewersModal.campaignLabel')"
      :options="campaignOptions"
      :searchable="false"
    />
    <FrField
      v-model="templateDraft"
      class="mb-3 notify-reviewers-modal__template"
      data-testid="notify-reviewers-template-select"
      name="emailTemplate"
      type="select"
      validation="required"
      :label="$t('governance.certificationDetails.notifyReviewersModal.templateLabel')"
      :options="templateOptions"
      :searchable="false"
    />
    <!-- Send date, between the template and cc users: pick when the
         reviewers get notified (with a time zone offset). Prepopulated with
         the current time in UTC; the chosen time is sent as UTC. -->
    <div
      class="mb-3"
      data-testid="notify-reviewers-send-date-row"
    >
      <FrDateTimeTimezonePicker
        v-model:date="sendDateDraft"
        v-model:timezone="sendTimezoneOffsetDraft"
        data-testid="notify-reviewers-send-date"
        name="sendDate"
        timezone-select
        :label="$t('governance.certificationDetails.notifyReviewersModal.sendDateLabel')"
        :timezone-label="$t('governance.certificationDetails.notifyReviewersModal.sendTimezoneLabel')"
        :validation="sendDateValidation"
        :display-help-text="false"
      />
    </div>
    <FrGovResourceMultiselect
      :value="ccUserIds"
      class="mb-2"
      name="notify-reviewers-cc-users"
      resource="user"
      :label="$t('governance.certificationDetails.notifyReviewersModal.ccUsersLabel')"
      :option-function="getDefaultGovOption"
      :validation="{ max_selected: { max: 20 } }"
      @input="handleCcUsersInput"
    />
    <p
      v-if="!selectsLoaded"
      data-testid="notify-reviewers-selects-loading"
    >
      {{ $t('common.loading') }}
    </p>
    <template #modal-footer="{ cancel }">
      <BButton
        variant="link"
        @click="cancel">
        {{ $t('common.cancel') }}
      </BButton>
      <FrButtonWithSpinner
        data-testid="notify-reviewers-send-button"
        variant="primary"
        :disabled="loading || !canSend"
        :show-spinner="loading"
        :button-text="$t('governance.certificationDetails.notifyReviewersModal.sendButtonText')"
        :spinner-text="$t('governance.certificationDetails.notifyReviewersModal.sendingButtonText')"
        @click="save"
      />
    </template>
  </BModal>
</template>

<script setup>
import { computed, ref } from 'vue';
import {
  BButton,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrDateTimeTimezonePicker from '@forgerock/platform-shared/src/components/DateTimeTimezonePicker';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceMultiselect from '@forgerock/platform-shared/src/components/governance/GovResourceMultiselect';
import { getEmailNotificationTemplates } from '@forgerock/platform-shared/src/api/governance/NotificationTemplateApi';
import { getAdminCertificationItems } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import { getDefaultGovOption } from '@forgerock/platform-shared/src/utils/governance/select';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { startCase } from 'lodash';

import i18n from '@/i18n';

dayjs.extend(utc);

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  // When set (Access Reviews tab), the campaign is fixed: pre-selected and not editable.
  initialCampaignId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['save']);

const campaignIdDraft = ref('');
const templateDraft = ref('');
// Required send datetime. The draft is the local 'YYYY-MM-DDTHH:mm' from the
// picker, compared and sent as UTC after applying the selected time zone
// offset. Prepopulated with the current time in UTC on show.
const sendDateDraft = ref('');
const sendTimezoneOffsetDraft = ref(0);
const ccUserIdsDraft = ref([]);
const campaignOptions = ref([]);
const templateOptions = ref([]);
const selectsLoaded = ref(false);

const ccUserIds = computed(() => ccUserIdsDraft.value.map((path) => path.split('/').pop()));

// The datetime is required and its date must be today or later ("now or
// future" at the picker's granularity). DateTimeInput validates the DATE
// part only — the time sub-input receives no rules — and that sub-value is
// a bare 'YYYY-MM-DD' which dayjs parses as midnight, so the comparison is
// the end of yesterday: the preselected today passes, any earlier day fails.
const sendDateValidation = computed(() => ({
  required: true,
  is_after_date: {
    date: dayjs.utc().subtract(1, 'day').endOf('day').format('YYYY-MM-DDTHH:mm'),
    message: 'governance.certificationDetails.notifyReviewersModal.sendDateInPast',
  },
}));

const canSend = computed(() => {
  const campaignReady = Boolean(props.initialCampaignId || campaignIdDraft.value);
  const sendDateReady = Boolean(sendDateDraft.value);
  return campaignReady && Boolean(templateDraft.value) && sendDateReady;
});

/**
 * Normalizes the multiselect's user ids into managed/user paths.
 * @param {Array<String>} userIds - ids from GovResourceMultiselect
 */
function handleCcUsersInput(userIds) {
  ccUserIdsDraft.value = userIds.map((id) => `managed/user/${id.split('/').pop()}`);
}

/**
 * Converts the local datetime from the pickers into a UTC ISO string, using
 * the selected GMT offset (e.g. offset -5 with '2026-10-01T09:00' local gives
 * '2026-10-01T14:00:00.000Z').
 * @returns {String} UTC ISO string with Z suffix
 */
function buildUtcSendDate() {
  return new Date(dayjs(sendDateDraft.value).subtract(sendTimezoneOffsetDraft.value, 'hour').valueOf()).toISOString();
}

/**
 * Clears all drafts; runs when the modal is hidden.
 */
function resetModal() {
  campaignIdDraft.value = props.initialCampaignId || '';
  templateDraft.value = '';
  sendDateDraft.value = '';
  sendTimezoneOffsetDraft.value = 0;
  ccUserIdsDraft.value = [];
}

/**
 * Prepopulates the send datetime with the current time in UTC. The draft is
 * stored as a UTC-based local string (offset 0), so the user can send right
 * away or adjust the zone; picking a different offset still converts
 * correctly in buildUtcSendDate.
 */
function prepopulateSendDate() {
  sendDateDraft.value = dayjs.utc().format('YYYY-MM-DDTHH:mm');
  sendTimezoneOffsetDraft.value = 0;
}

/**
 * Loads the campaign options for the campaign select. A no-op when the
 * campaign is fixed by initialCampaignId.
 */
async function loadCampaignOptions() {
  if (props.initialCampaignId) {
    return;
  }
  const { data } = await getAdminCertificationItems({ pageSize: 100 });
  campaignOptions.value = (data?.result || []).map((campaign) => ({
    text: campaign.campaignName || campaign.name,
    value: campaign.id,
  }));
}

/**
 * Loads the email notification templates, narrowed to certification
 * templates (backend IGA-4704); older servers ignore the param and this
 * shows the full list, same as the template screen.
 */
async function loadTemplateOptions() {
  const { data } = await getEmailNotificationTemplates({ context: 'certification' });
  templateOptions.value = (data?.result || []).map((template) => {
    const idParts = template._id.split('/');
    return {
      // Same formatting as the certification template screen's email template list.
      text: template.displayName ? startCase(template.displayName) : startCase(idParts[idParts.length - 1]),
      value: `emailTemplate/${template._id}`,
    };
  }).sort((a, b) => a.text.trim().toLowerCase().localeCompare(b.text.trim().toLowerCase()));
}

/**
 * Loads both option lists. On failure the error is shown right here as a
 * toast (same util and message key the parent used to handle) instead of
 * being emitted; selectsLoaded is set either way.
 */
async function loadOptions() {
  try {
    await Promise.all([loadCampaignOptions(), loadTemplateOptions()]);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.certificationDetails.errors.errorGettingNotificationTemplates'));
  } finally {
    selectsLoaded.value = true;
  }
}

/**
 * Emits the save payload: campaign id, template id, the UTC send datetime
 * and the cc user paths.
 */
function save() {
  emit('save', {
    campaignId: props.initialCampaignId || campaignIdDraft.value,
    template: templateDraft.value,
    // UTC ISO string (required, validated not-in-past).
    date: buildUtcSendDate(),
    ccUserIds: ccUserIdsDraft.value,
  });
}

/**
 * Modal show handler: resets the drafts, prepopulates the send datetime with
 * the current time in UTC and (re)loads the select options.
 */
function onShow() {
  resetModal();
  // Prepopulate the send datetime with the current time in UTC.
  prepopulateSendDate();
  loadOptions();
}
</script>

<style lang="scss" scoped>
.notify-reviewers-modal__template {
  width: 40%;
}
</style>

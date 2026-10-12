<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4 flex-grow-1 overflow-auto h-100">
    <BContainer
      fluid
      class="mt-4">
      <h4 class="mb-4">
        {{ $t('governance.editTemplate.notifications') }}
      </h4>
      <FrField
        v-model="formFields.initialNotification"
        class="mb-4"
        name="initialNotification"
        testid="initial-notification"
        type="checkbox"
        :description="$t('governance.editTemplate.initialNotificationDescription')"
        :label="$t('governance.editTemplate.initialNotification')" />
      <BCollapse
        v-if="formFields.initialNotification"
        :visible="formFields.initialNotification"
        class="position-relative">
        <div class="p-4 rounded bg-light mb-4">
          <FrField
            v-model="formFields.initialEmail"
            name="initialEmail"
            style="max-width: 280px;"
            testid="initial-email"
            type="select"
            validation="required"
            :label="$t('governance.editTemplate.emailTemplate')"
            :options="emailTemplateOptions"
            :searchable="false" />
        </div>
      </BCollapse>
      <FrField
        v-model="formFields.reassignNotification"
        class="mb-4"
        name="reassignNotification"
        testid="reassign-notification"
        type="checkbox"
        :description="$t('governance.editTemplate.reassignNotificationDescription')"
        :label="$t('governance.editTemplate.reassignNotification')" />
      <BCollapse
        v-if="formFields.reassignNotification"
        :visible="formFields.reassignNotification">
        <div class="p-4 rounded bg-light mb-4">
          <FrField
            v-model="formFields.reassignEmail"
            name="reassignEmail"
            style="max-width: 280px;"
            testid="reassign-email"
            type="select"
            validation="required"
            :label="$t('governance.editTemplate.emailTemplate')"
            :options="emailTemplateOptions"
            :searchable="false" />
        </div>
      </BCollapse>
      <FrField
        v-model="formFields.expirationNotification"
        class="mb-4"
        name="expirationNotification"
        testid="expiration-notification"
        type="checkbox"
        :description="$t('governance.editTemplate.expirationNotificationDescription')"
        :label="$t('governance.editTemplate.expirationNotification')" />
      <BCollapse
        :visible="formFields.expirationNotification"
        class="position-relative">
        <div
          v-if="formFields.expirationNotification"
          class="p-4 rounded bg-light mb-4 form-inline">
          <div class="mr-1">
            {{ $t('common.send') }}
          </div>
          <FrField
            v-model="formFields.expirationEmail"
            class="d-inline-block mr-1"
            name="expirationEmail"
            style="min-width: 200px;"
            testid="expiration-email"
            type="select"
            validation="required"
            :label="$t('governance.editTemplate.emailTemplate')"
            :options="emailTemplateOptions"
            :searchable="false" />
          <FrField
            v-model="formFields.expirationTiming"
            class="d-inline-block mr-1"
            name="expirationTiming"
            style="min-width: 200px;"
            testid="expiration-timing"
            type="select"
            :label="$t('governance.editTemplate.expirationTiming')"
            :options="expirationTimingOptions"
            :searchable="false" />
          <template v-if="formFields.expirationTiming === EXPIRATION_TIMING.BEFORE">
            <FrField
              v-model="formFields.expirationDays"
              class="mb-0 mr-1 d-inline-block"
              name="expirationDays"
              style="max-width: 70px;"
              testid="expiration-days"
              type="number"
              :min="1"
              :validation="{ required: true, min_value: { min: 1 } }" />
            <div class="mr-1 ml-3">
              {{ $t('governance.editTemplate.daysBeforeCampaign') }}
            </div>
          </template>
          <div
            v-if="formFields.expirationNotification && governanceDevEnabled"
            class="w-100 mt-3">
            <FrField
              v-model="formFields.expirationIncludeOwner"
              class="mb-1"
              name="expirationIncludeOwner"
              testid="expiration-include-owner"
              type="checkbox"
              :label="$t('governance.editTemplate.expirationNotificationSendToOwner')" />
            <FrField
              v-model="formFields.expirationIncludeCc"
              class="mb-1"
              name="expirationIncludeCc"
              testid="expiration-include-cc"
              type="checkbox"
              :label="$t('governance.editTemplate.expirationNotificationIncludeCc')" />
            <div
              v-if="formFields.expirationIncludeCc"
              data-testid="expiration-cc-users">
              <FrGovResourceMultiselect
                :value="expirationCcUserIds"
                class="mb-2"
                name="expiration-cc-users"
                resource="user"
                :label="$t('governance.editTemplate.expirationNotificationCcUsers')"
                :option-function="getDefaultGovOption"
                :validation="{ required: true, max_selected: { max: 20 } }"
                validation-immediate
                @input="handleExpirationCcUsersInput" />
            </div>
          </div>
        </div>
      </BCollapse>
      <FrField
        v-model="formFields.reminders"
        class="mb-4"
        name="reminders"
        testid="expiration-reminders"
        type="checkbox"
        :description="$t('governance.editTemplate.sendRemindersDescription')"
        :label="$t('governance.editTemplate.sendReminders')" />
      <BCollapse
        :visible="formFields.reminders"
        class="position-relative">
        <div
          v-if="formFields.reminders"
          class="p-4 rounded bg-light mb-4 form-inline">
          <div class="mr-1">
            {{ $t('common.send') }}
          </div>
          <FrField
            v-model="formFields.remindersEmail"
            class="d-inline-block mr-1"
            name="remindersEmail"
            style="min-width: 200px;"
            testid="reminders-email"
            type="select"
            validation="required"
            :label="$t('governance.editTemplate.emailTemplate')"
            :options="emailTemplateOptions"
            :searchable="false" />
          <div class="mr-1">
            {{ $t('governance.editTemplate.every') }}
          </div>
          <FrField
            v-model="formFields.remindersDuration"
            class="mb-0 mr-3 d-inline-block"
            name="remindersDuration"
            style="max-width: 70px;"
            testid="reminders-duration"
            type="number"
            validation="required" />
          <FrField
            v-model="formFields.remindersTimespan"
            class="mb-0 d-inline-block"
            name="remindersTimespan"
            style="min-width: 120px;"
            testid="reminders-timespan"
            type="select"
            validation="required"
            :options="timespanOptions"
            :searchable="false" />
          <div
            v-if="governanceDevEnabled"
            class="w-100 mt-3">
            <FrField
              v-model="formFields.remindersIncludeOwner"
              class="mb-1"
              name="remindersIncludeOwner"
              testid="reminders-include-owner"
              type="checkbox"
              :label="$t('governance.editTemplate.remindersNotificationSendToOwner')" />
            <FrField
              v-model="formFields.remindersIncludeCc"
              class="mb-1"
              name="remindersIncludeCc"
              testid="reminders-include-cc"
              type="checkbox"
              :label="$t('governance.editTemplate.remindersNotificationIncludeCc')" />
            <div
              v-if="formFields.remindersIncludeCc"
              data-testid="reminders-cc-users">
              <FrGovResourceMultiselect
                :value="remindersCcUserIds"
                class="mb-2"
                name="reminders-cc-users"
                resource="user"
                :label="$t('governance.editTemplate.remindersNotificationCcUsers')"
                :option-function="getDefaultGovOption"
                :validation="{ required: true, max_selected: { max: 20 } }"
                validation-immediate
                @input="handleRemindersCcUsersInput" />
            </div>
          </div>
        </div>
      </BCollapse>
    </BContainer>
  </div>
</template>

<script>
import {
  BCollapse,
  BContainer,
} from 'bootstrap-vue';
import {
  cloneDeep,
} from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceMultiselect from '@forgerock/platform-shared/src/components/governance/GovResourceMultiselect';
import { getDefaultGovOption } from '@forgerock/platform-shared/src/utils/governance/select';
import { EXPIRATION_TIMING } from '@forgerock/platform-shared/src/views/Governance/utils/certificationConstants';

export default {
  name: 'Notifications',
  components: {
    BCollapse,
    BContainer,
    FrField,
    FrGovResourceMultiselect,
  },
  props: {
    emailTemplateOptions: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      EXPIRATION_TIMING,
      timespanOptions: [
        this.$t('governance.timespans.years'),
        this.$t('governance.timespans.months'),
        this.$t('governance.timespans.weeks'),
        this.$t('governance.timespans.days'),
      ],
      expirationTimingOptions: [
        { text: this.$t('governance.editTemplate.whenCampaignExpiresOption'), value: EXPIRATION_TIMING.WHEN },
        { text: this.$t('governance.editTemplate.beforeCampaignExpires'), value: EXPIRATION_TIMING.BEFORE },
      ],
      formFields: {
        expirationDays: 1,
        expirationEmail: '',
        expirationIncludeCc: false,
        expirationIncludeOwner: false,
        expirationCcUserIds: [],
        expirationNotification: false,
        expirationTiming: EXPIRATION_TIMING.WHEN,
        initialEmail: 'emailTemplate/certificationAssigned',
        initialNotification: true,
        reassignEmail: 'emailTemplate/certificationReassigned',
        reassignNotification: true,
        reminders: false,
        remindersDuration: 0,
        remindersEmail: '',
        remindersIncludeCc: false,
        remindersIncludeOwner: false,
        remindersCcUserIds: [],
        remindersTimespan: '',
      },
    };
  },
  mounted() {
    Object.keys(this.value).forEach((field) => {
      this.formFields[field] = cloneDeep(this.value[field]);
    });
  },
  computed: {
    governanceDevEnabled() {
      return this.$store.state.SharedStore.governanceDevEnabled;
    },
    expirationCcUserIds() {
      return this.formFields.expirationCcUserIds.map((path) => path.split('/').pop());
    },
    remindersCcUserIds() {
      return this.formFields.remindersCcUserIds.map((path) => path.split('/').pop());
    },
  },
  methods: {
    getDefaultGovOption,
    handleExpirationCcUsersInput(userIds) {
      this.formFields.expirationCcUserIds = userIds.map((id) => `managed/user/${id.split('/').pop()}`);
    },
    handleRemindersCcUsersInput(userIds) {
      this.formFields.remindersCcUserIds = userIds.map((id) => `managed/user/${id.split('/').pop()}`);
    },
    /**
     * Adds userInfo to formFields
     * @param {Object} userInfo Data corresponding to the selected user
     */
    handleUserInfo(userInfo) {
      this.formFields.escalationOwnerInfo = userInfo;
    },
  },
  watch: {
    formFields: {
      deep: true,
      handler(newVal) {
        const payload = cloneDeep(newVal);
        this.$emit('input', {
          ...payload,
        });
      },
    },
  },
};
</script>
<style lang="scss" scoped>
:deep(.fr-field) {
  .form-control{
    width: 100%;
  }
}

:deep(.fr-validation-requirements) {
  position: absolute;
}
</style>

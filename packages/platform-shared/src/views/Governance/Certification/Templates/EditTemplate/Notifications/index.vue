<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
            v-model="formFields.expirationDays"
            class="mb-0 mr-3 d-inline-block"
            name="expirationDays"
            style="max-width: 70px;"
            testid="expiration-days"
            validation="required"
            type="number" />
          <div class="mr-1">
            {{ $t('governance.editTemplate.daysBeforeCampaign') }}
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
        </div>
      </BCollapse>
      <FrField
        v-model="formFields.escalation"
        class="mb-4"
        name="escalation"
        testid="escalation"
        type="checkbox"
        :description="$t('governance.editTemplate.enableEscalationDescription')"
        :label="$t('governance.editTemplate.enableEscalation')" />
      <BCollapse
        :visible="formFields.escalation"
        class="position-relative">
        <div
          v-if="formFields.escalation"
          class="p-4 rounded bg-light mb-4 form-inline">
          <div class="mr-1">
            {{ $t('common.send') }}
          </div>
          <FrField
            v-model="formFields.escalationEmail"
            class="d-inline-block mr-1"
            name="escalationEmail"
            style="min-width: 200px;"
            testid="escalation-email"
            type="select"
            validation="required"
            :label="$t('governance.editTemplate.emailTemplate')"
            :options="emailTemplateOptions"
            :searchable="false" />
          <div class="mr-1">
            {{ $t('governance.editTemplate.every') }}
          </div>
          <FrField
            v-model="formFields.escalationDuration"
            class="mb-0 mr-3 d-inline-block"
            name="escalationDuration"
            style="max-width: 70px;"
            testid="escalation-duration"
            type="number"
            validation="required" />
          <FrField
            v-model="formFields.escalationTimespan"
            class="mb-0 d-inline-block mr-1"
            name="escalationTimespan"
            style="min-width: 120px;"
            testid="escalation-timespan"
            type="select"
            validation="required"
            :options="timespanOptions"
            :searchable="false" />
          <div class="mr-1">
            {{ $t('governance.editTemplate.to') }}
          </div>
          <FrGovResourceSelect
            v-model="formFields.escalationOwner"
            :initial-data="formFields.escalationOwnerInfo"
            name="escalationOwner"
            @get-user-info="handleUserInfo"
            style="max-width: 400px;"
            class="d-inline-block"
            resource-path="user" />
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
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';

export default {
  name: 'Notifications',
  components: {
    BCollapse,
    BContainer,
    FrField,
    FrGovResourceSelect,
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
      timespanOptions: [
        this.$t('governance.timespans.years'),
        this.$t('governance.timespans.months'),
        this.$t('governance.timespans.weeks'),
        this.$t('governance.timespans.days'),
      ],
      formFields: {
        escalation: false,
        escalationDuration: 0,
        escalationEmail: '',
        escalationOwner: '',
        escalationOwnerInfo: {},
        escalationTimespan: '',
        expirationDays: 0,
        expirationEmail: '',
        expirationNotification: false,
        initialEmail: 'emailTemplate/certificationAssigned',
        initialNotification: true,
        reassignEmail: 'emailTemplate/certificationReassigned',
        reassignNotification: true,
        reminders: false,
        remindersDuration: 0,
        remindersEmail: '',
        remindersTimespan: '',
      },
    };
  },
  mounted() {
    Object.keys(this.value).forEach((field) => {
      this.formFields[field] = cloneDeep(this.value[field]);
    });
  },
  methods: {
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

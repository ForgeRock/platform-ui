<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="p-4 flex-grow-1 overflow-auto h-100">
    <BContainer
      fluid
      class="mt-4">
      <h4>{{ $t('governance.editTemplate.whenToCertify') }}</h4>
      <p>{{ $t('governance.editTemplate.whenToCertifyDescription') }}</p>
      <hr>
      <template v-if="!eventBased">
        <h5>{{ $t('governance.editTemplate.schedule') }}</h5>
        <p>{{ $t('governance.editTemplate.scheduleDescription') }}</p>
        <FrField
          v-model="formFields.enableSchedule"
          class="mb-4"
          name="enableSchedule"
          testid="enable-schedule"
          type="checkbox"
          :label="$t('governance.editTemplate.enableSchedule')" />
        <BCollapse
          :visible="formFields.enableSchedule">
          <div class="p-4 rounded bg-light mb-4">
            <div class="mb-3">
              <span>{{ $t('governance.editTemplate.runEvery') }}</span>
              <FrField
                v-model="formFields.scheduleDuration"
                class="mb-0 mr-3 d-inline-block"
                name="scheduleDuration"
                style="max-width: 70px;"
                testid="schedule-duration"
                type="number" />
              <FrField
                v-model="formFields.scheduleTimespan"
                class="mb-0 d-inline-block"
                name="scheduleTimespan"
                style="min-width: 120px;"
                testid="schedule-timespan"
                type="select"
                :options="timespanOptions"
                :searchable="false" />
            </div>
            <FrTimeConstraint
              v-if="formFields.enableSchedule"
              v-model="formFields.scheduleConstraint"
              :set-initial-now="!isExistingSchedule" />
          </div>
        </BCollapse>
        <hr>
      </template>
      <h5>{{ $t('governance.editTemplate.campaignDuration') }}</h5>
      <FrField
        v-model="formFields.duration"
        class="mb-0 mr-3 d-inline-block"
        name="duration"
        style="max-width: 70px;"
        testid="duration"
        type="number" />
      <FrField
        v-model="formFields.timespan"
        class="mb-0 d-inline-block"
        name="timespan"
        style="min-width: 120px;"
        testid="timespan"
        type="select"
        :options="timespanOptions"
        :searchable="false" />
      <hr>
      <h5>{{ $t('governance.editTemplate.whenCampaignExpires') }}</h5>
      <BFormRadioGroup
        v-model="formFields.expireOption"
        name="expire-options">
        <div class="d-flex align-items-center mb-3">
          <BFormRadio
            class="mr-0"
            :value="0">
            {{ $t('governance.editTemplate.closeAnd') }}
          </BFormRadio>
          <div class="d-inline ml-2">
            <FrField
              v-model="formFields.closeAction"
              class="form-control-inline width-191 w-100"
              name="closeAction"
              testid="close-action"
              type="select"
              :options="closeActionOptions"
              :searchable="false" />
          </div>
          <span class="mx-2">
            {{ $t('governance.editTemplate.openItems') }}
          </span>
          <div class="d-inline">
            <FrField
              v-model="formFields.closeActionTime"
              class="form-control-inline width-191 w-100"
              name="closeActionTime"
              testid="close-action-time"
              type="select"
              :options="closeActionTimeOptions"
              :searchable="false" />
          </div>
          <template v-if="formFields.closeActionTime === $t('governance.timespans.afterADuration')">
            <span class="mx-2">
              {{ $t('governance.editTemplate.of') }}
            </span>
            <FrField
              v-model="formFields.closeActionDuration"
              class="mb-0 mr-3 d-inline-block"
              name="closeActionDuration"
              style="max-width: 70px;"
              testid="close-action-duration"
              type="number" />
            <span>
              {{ $t('date.days') }}
            </span>
          </template>
        </div>
        <div class="d-flex w-100">
          <div class="mb-3 w-auto align-items-center pt-2">
            <BFormRadio :value="1">
              {{ $t('governance.editTemplate.reassignToCertify') }}
            </BFormRadio>
          </div>
          <div class="d-flex w-50">
            <FrField
              v-model="formFields.reassignToSelector"
              class="form-control-inline w-50 mr-2"
              name="reassignAction"
              type="select"
              :options="reassignToOptions"
              :searchable="false" />
            <FrGovResourceSelect
              v-model="formFields.reassignUser"
              :initial-data="formFields.reassignUserInfo"
              name="reassignUser"
              class="mb-5 w-100"
              :resource-path="formFields.reassignToSelector === this.$t('governance.editTemplate.user') ? 'user' : 'role'" />
          </div>
        </div>
        <div class="mb-3">
          <BFormRadio :value="2">
            {{ $t('governance.editTemplate.doNothing') }}
          </BFormRadio>
        </div>
      </BFormRadioGroup>
    </BContainer>
  </div>
</template>

<script>
import {
  BCollapse,
  BContainer,
  BFormRadio,
  BFormRadioGroup,
} from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrTimeConstraint from '@forgerock/platform-shared/src/components/TimeConstraint';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';

export default {
  name: 'When',
  components: {
    BCollapse,
    BContainer,
    BFormRadio,
    BFormRadioGroup,
    FrField,
    FrTimeConstraint,
    FrGovResourceSelect,
  },
  props: {
    value: {
      type: Object,
      default: () => {},
    },
    eventBased: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      reassignToOptions: [
        this.$t('governance.editTemplate.role'),
        this.$t('governance.editTemplate.user'),
      ],
      closeActionOptions: [
        {
          text: this.$t('governance.editTemplate.closeActions.revoke'),
          value: 'revoke',
        },
        {
          text: this.$t('governance.editTemplate.closeActions.certify'),
          value: 'certify',
        },
        {
          text: this.$t('governance.editTemplate.closeActions.allowException'),
          value: 'exception',
        },
      ],
      closeActionTimeOptions: [
        this.$t('governance.timespans.immediately'),
        this.$t('governance.timespans.afterADuration'),
      ],
      timespanOptions: [
        this.$t('governance.timespans.years'),
        this.$t('governance.timespans.months'),
        this.$t('governance.timespans.weeks'),
        this.$t('governance.timespans.days'),
      ],
      formFields: {
        closeAction: 'revoke',
        closeActionDuration: 0,
        closeActionTime: '',
        duration: 0,
        enableSchedule: false,
        expireOption: 2,
        reassignToSelector: 'Role',
        reassignUser: '',
        reassignRole: '',
        reassignUserInfo: {},
        scheduleConstraint: '',
        scheduleDuration: this.value.scheduleDuration || 0,
        scheduleTimespan: '',
        timespan: '',
      },
      isExistingSchedule: false,
    };
  },
  created() {
    if (this.value.enableSchedule && this.value.scheduleConstraint) {
      this.isExistingSchedule = true;
    }
    Object.keys(this.value).forEach((field) => {
      this.formFields[field] = cloneDeep(this.value[field]);
    });
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
:deep(.width-191) {
  min-width: 191px;

  .multiselect {
    width: 100%;
  }
}

:deep(.m) {
  width: 100%;
}
</style>

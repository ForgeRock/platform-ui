<!-- Copyright 2023 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="scheduleTemplateFormModal"
    size="lg"
    title-class="h5"
    title-tag="h2"
    :title="$t('governance.templates.scheduleModal.editSchedule')">
    <template v-if="isLoading">
      <FrSpinner class="py-5" />
    </template>
    <template v-else>
      <BFormGroup>
        <div class="d-flex align-items-center">
          <div class="mr-1">
            {{ $t('jobs.runEvery') }}
          </div>
          <div class="mr-1">
            <FrField
              v-model="interval"
              id="runInterval"
              name="runInterval"
              type="number"
              :validation="{ required: true, min_value: { min: 1 } }"
              @blur="validateRunInterval(interval)" />
          </div>
          <div class="position-relative">
            <FrField
              v-model="timeInterval"
              type="select"
              name="timeIntervalSelect"
              validation="required"
              :searchable="false"
              :options="availableTimeIntervals" />
          </div>
        </div>
      </BFormGroup>
      <div class="form-group">
        <FrTimeConstraint v-model="temporalconstraint" />
      </div>
    </template>
    <template #modal-footer="{ cancel }">
      <div class="d-flex justify-content-between w-100">
        <div>
          <BButton
            v-if="templateSchedule"
            variant="outline-danger"
            class="text-danger"
            @click="confirmDeleteSchedule()">
            {{ $t('governance.templates.scheduleModal.deleteSchedule') }}
          </BButton>
        </div>
        <div>
          <BButton
            variant="link"
            @click="cancel()">
            {{ $t('common.cancel') }}
          </BButton>
          <FrButtonWithSpinner
            :disabled="isSavingSchedule"
            :show-spinner="isSavingSchedule"
            variant="primary"
            @click="scheduleTemplate()" />
        </div>
      </div>
    </template>
    <FrDeleteModal
      :is-deleting="isSavingSchedule"
      :translated-item-type="$t('governance.templates.scheduleCampaign')"
      @delete-item="scheduleTemplate(true)" />
  </BModal>
</template>

<script>
import { cloneDeep } from 'lodash';
import { BButton, BModal, BFormGroup } from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrTimeConstraint from '@forgerock/platform-shared/src/components/TimeConstraint';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import { patchScheduleTemplate } from '@forgerock/platform-shared/src/api/governance/TemplateApi';
import scheduleIntervals from './scheduleIntervalsConstants';

export default {
  name: 'ScheduleTemplateFormModal',
  components: {
    BButton,
    BModal,
    BFormGroup,
    FrField,
    FrTimeConstraint,
    FrButtonWithSpinner,
    FrDeleteModal,
    FrSpinner,
  },
  props: {
    /**
     * this is the governance certification template Id to be able to load the schedule data
    */
    templateId: {
      type: String,
      default: null,
    },
    /**
     * this is the governance certification template Schedule info
    */
    templateSchedule: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      availableTimeIntervals: [
        { value: scheduleIntervals.HOUR, text: this.$t('jobs.hours') },
        { value: scheduleIntervals.DAY, text: this.$t('jobs.days') },
        { value: scheduleIntervals.WEEK, text: this.$t('jobs.weeks') },
        { value: scheduleIntervals.MONTH, text: this.$t('jobs.months') },
      ],
      timeInterval: scheduleIntervals.DAY,
      interval: 30,
      temporalconstraint: '',
      isSavingSchedule: false,
      isLoading: false,
      templateScheduleModel: cloneDeep(this.templateSchedule),
    };
  },
  methods: {
    setDefaultData() {
      this.intervalTime = scheduleIntervals.DAY;
      this.interval = '30';
      this.temporalconstraint = '';
    },
    setScheduleData() {
      const { repeatInterval, startTime, endTime } = this.templateScheduleModel;
      const repeatIntervalParam = repeatInterval;
      this.availableTimeIntervals.forEach((interval) => {
        const intervalMatch = (repeatIntervalParam % interval.value === 0);
        if (intervalMatch) {
          this.intervalTime = interval.text;
          this.interval = repeatIntervalParam / interval.value;
          return false;
        }
        return intervalMatch;
      });
      this.temporalconstraint = `${startTime}/${endTime}`;
    },
    onTemplateScheduleChanges() {
      if (!this.templateScheduleModel) {
        this.setDefaultData();
      } else {
        this.setScheduleData();
      }
    },
    validateRunInterval(input) {
      if (input < 1) {
        this.runInterval = 1;
      } else if (!Number.isInteger(input)) {
        this.runInterval = Math.trunc(this.input);
      }
    },
    getDateTimeValues() {
      const pattern = /^(.*)\/(.*)/;
      const matches = pattern.exec(this.temporalconstraint);
      const startTime = matches[1];
      const endTime = matches[2];

      return {
        startTime,
        endTime,
      };
    },
    getSchedulePatchParams(deleteSchedule) {
      const runInterval = this.timeInterval * this.interval;
      const scheduleId = this.templateScheduleModel?._id || null;
      const scheduleData = deleteSchedule ? null : {
        id: scheduleId,
        type: 'simple',
        repeatCount: 0,
        repeatInterval: runInterval,
        schedule: null,
        enabled: true,
        ...this.getDateTimeValues(),
      };
      return {
        schedule: scheduleData,
      };
    },
    refreshSchedule(responseData) {
      this.templateScheduleModel = responseData?.data;
    },
    confirmDeleteSchedule() {
      this.$bvModal.show('deleteModal');
    },
    scheduleTemplate(deleteSchedule) {
      this.isSavingSchedule = true;
      const params = this.getSchedulePatchParams(deleteSchedule);
      const scheduleTemplateCall = patchScheduleTemplate(this.templateId, params);

      scheduleTemplateCall.then((responseData) => this.refreshSchedule(responseData)).catch((error) => {
        this.showErrorMessage(error, this.$t('authentication.errorRetrievingTemplatesData'));
      }).finally(() => {
        this.$emit('load-template-list');
        this.$bvModal.hide('deleteModal');
        this.$bvModal.hide('scheduleTemplateFormModal');
        this.isSavingSchedule = false;
        this.rowTemplateSelectedId = null;
      });
    },
  },
  watch: {
    templateSchedule(templateSchedule) {
      this.templateScheduleModel = templateSchedule;
      this.onTemplateScheduleChanges();
    },
  },
  unmounted() {
    this.setDefaultData();
  },
};
</script>
<style lang="scss" scoped>
:deep(.fr-validation-requirements) {
  position: absolute;
}
</style>

<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <label>{{ $t('common.start') }}</label>
    <BRow class="form-row">
      <BCol
        lg
        class="form-group">
        <FrDatepicker
          v-model="startDate"
          name="startDate"
          :disabled="disabled"
          :placeholder="$t('common.date')" />
      </BCol>
      <BCol
        lg
        class="form-group">
        <FrTimepicker
          v-model="startTime"
          :disabled="disabled"
          :placeholder="$t('common.time')" />
      </BCol>
    </BRow>

    <label>{{ $t('common.end') }}</label>
    <BRow class="form-row">
      <BCol
        lg
        class="form-group">
        <FrDatepicker
          v-model="endDate"
          name="endDate"
          :disabled="disabled"
          :placeholder="$t('common.date')" />
      </BCol>
      <BCol
        lg
        class="form-group">
        <FrTimepicker
          v-model="endTime"
          :disabled="disabled"
          :placeholder="$t('common.time')" />
      </BCol>
    </BRow>

    <BRow class="form-row">
      <BCol lg>
        <FrTimezoneOffset
          v-model="offset"
          :disabled="disabled"
          :placeholder="$t('common.placeholders.timeZoneOffset')" />
      </BCol>
    </BRow>
  </div>
</template>

<script>
import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrDatepicker from '@forgerock/platform-shared/src/components/Datepicker';
import FrTimepicker from '@forgerock/platform-shared/src/components/Timepicker';
import FrTimezoneOffset from '@forgerock/platform-shared/src/components/TimezoneOffset';
import dayjs from 'dayjs';

/**
 * Input that allows selection of a start and end date/time as well as an offset.
 */
export default {
  name: 'TimeConstraint',
  components: {
    BCol,
    BRow,
    FrDatepicker,
    FrTimepicker,
    FrTimezoneOffset,
  },
  props: {
    /**
     * Set initial control values to current date, time, and local offset
     */
    setInitialNow: {
      type: Boolean,
      default: true,
    },
    /**
     * @model two ISO strings joined by a '/'
     * eg. 2020-04-25T07:00:00.000Z/2020-04-30T07:00:00.000Z
     */
    value: {
      type: String,
      default: '',
    },
    /**
     * Whether component interaction is available
     */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      endDate: '',
      endISO: '',
      endTime: '',
      offset: 0,
      startDate: '',
      startISO: '',
      startTime: '',
    };
  },
  computed: {
    /**
     * If all controls have a value, returns an ISO string range
     */
    rangeISO() {
      if (this.startISO && this.endISO) {
        return `${this.startISO}/${this.endISO}`;
      }
      return '';
    },
  },
  methods: {
    /**
     * Sets value of all subcomponents according to two ISO values and offset
     *
     * @param {String} ISORange Two ISO values separated by a '/' representing a range.
     */
    setValue(ISORange) {
      const controlValues = this.getControlValues(ISORange);
      Object.keys(controlValues).forEach((key) => {
        this[key] = controlValues[key];
      });

      /**
       * v-model event.
       *
       * @type {String} Two ISO values separated by a '/' representing a range.
       */
      this.$emit('input', this.rangeISO);
    },
    /**
     * Get an object with properties representing every child control value
     *
     * @param {String} ISORange Two ISO values separated by a '/' representing a range.
     * @returns {Object} values for child compnents
     */
    getControlValues(ISORange) {
      // separate range into two separate ISO strings
      const pattern = /^(.*)\/(.*)/;
      const matches = pattern.exec(ISORange);
      const startDateTime = dayjs(matches[1]);
      const endDateTime = dayjs(matches[2]);
      const offset = startDateTime.utcOffset() / 60;

      // remove offset because that is represented in offset variable
      const start = startDateTime.subtract(offset);
      const end = endDateTime.subtract(offset);

      return {
        startDate: `${start.year()}-${start.month() + 1}-${start.date()}`,
        startTime: `${start.hour()}:${start.minute()}:00`,
        startISO: matches[1],
        endDate: `${end.year()}-${end.month() + 1}-${end.date()}`,
        endTime: `${end.hour()}:${end.minute()}:00`,
        endISO: matches[2],
        offset,
      };
    },
    /**
     * Checks validity of ISO range. End must be equal to or after start. If not valid, adjust values accordingly
     *
     * @param {String} startDate YYYY-MM-DD
     * @param {String} startTime hh:mm:ss
     * @param {String} endDate YYYY-MM-DD
     * @param {String} endTime hh:mm:ss
     * @param {Boolean} roundUp if range is not valid, move end date/time up to match start date/time
     */
    setValidISORange(startDate, startTime, endDate, endTime, roundUp) {
      if (!(startDate && startTime && endDate && endTime)) {
        return;
      }
      // account for offset
      const date = dayjs(`${startDate}T${startTime}`).subtract(this.offset, 'hour');
      const offset = date.utcOffset();
      this.startISO = date.add(offset, 'minute').toISOString();
      this.endISO = dayjs(`${endDate}T${endTime}`).subtract(this.offset, 'hour').add(offset, 'minute').toISOString();

      // if time range is invalid (start after end), adjust all values to a valid range
      if (dayjs(`${startDate}T${startTime}`).isAfter(dayjs(`${endDate}T${endTime}`))) {
        if (roundUp) {
          this.endDate = this.startDate;
          this.endTime = this.startTime;
          this.endISO = this.startISO;
        } else {
          this.startDate = this.endDate;
          this.startTime = this.endTime;
          this.startISO = this.endISO;
        }
      }
      /**
       * v-model event.
       *
       * @type {String} Two ISO values separated by a '/' representing a range.
       */
      this.$emit('input', this.rangeISO);
    },
    /**
     * Get an ISO range string with current date/time for start and end
     * @returns {String} Two ISO values separated by a '/' representing a range.
     */
    getCurrentISORange() {
      const now = dayjs();
      return `${now.toISOString()}/${now.toISOString()}`;
    },
  },
  created() {
    // set values of all child controls
    if (this.value) {
      this.setValue(this.value);
    } else if (this.setInitialNow) {
      this.setValue(this.getCurrentISORange());
    }
  },
  watch: {
    // check for new total value whenever a child value changes, adjusting to valid date range.
    startDate() {
      this.setValidISORange(this.startDate, this.startTime, this.endDate, this.endTime, true);
    },
    startTime() {
      this.setValidISORange(this.startDate, this.startTime, this.endDate, this.endTime, true);
    },
    endDate() {
      this.setValidISORange(this.startDate, this.startTime, this.endDate, this.endTime, false);
    },
    endTime() {
      this.setValidISORange(this.startDate, this.startTime, this.endDate, this.endTime, false);
    },
    offset() {
      this.setValidISORange(this.startDate, this.startTime, this.endDate, this.endTime, false);
    },
  },
};
</script>
<style lang="scss" scoped>
.row {
  margin-left: -5px;
  margin-right: -5px;
}

.col {
  padding-right: 5px;
  padding-left: 5px;
}
</style>

<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="activity">
    <div
      class="d-flex flex-row align-items-center justify-content-between px-4"
      :class="{'activity-filters': !userId}">
      <h1
        v-if="!userId"
        class="m-0 font-weight-normal h3">
        {{ $t("autoAccess.access.activity.header") }}
      </h1>
      <div :class="{'d-flex': true, 'flex-row': true, 'activity-filters-user-detail': !!userId, 'position-absolute': !!userId}">
        <div class="ml-3">
          <DateRangePicker
            @change="handleDateChange"
          />
        </div>
        <div class="ml-3">
          <RiskRangeSliderButton
            :value="filterObject.riskRange || []"
            @change="handleRiskRangeChange"
          />
        </div>
        <div class="ml-3">
          <BButton
            pill
            variant="outline-primary"
            :disabled="features.length === 0"
            @click="handleToggleFilter(true)">
            <span class="material-icons-outlined">
              filter_list
            </span>
            {{ $t("common.filters") }}
            <BBadge
              v-if="filterCount > 0"
              variant="primary"
              pill
              class="ml-1">
              {{ filterCount }}
            </BBadge>
          </BButton>
        </div>
      </div>
    </div>
    <div class="activity-body">
      <div class="d-flex flex-row">
        <div class="event-log-container flex-grow-1">
          <span v-if="showAccessResults">
            <AccessResults
              :date-range="dateRange"
              :user-id="userId"
            />
          </span>
          <EventLog
            :filter-object="filtersAndGeoFilters"
            :user-id="userId"
          />
        </div>
        <div
          v-if="!userId"
          class="flex-grow-1">
          <RiskMap
            :filter-object="filterObject"
            @mapBoundChange="handleMapBoundsChanged"
          />
        </div>
      </div>
    </div>

    <Filters
      :show-modal="showFilters"
      :filter-object="filtersAndGeoFilters"
      @hidden="handleToggleFilter(false)"
      @ok="updateFilters"
    />
  </div>
</template>

<script>
import _ from 'lodash';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import {
  BButton, BBadge,
} from 'bootstrap-vue';
import RiskMap from './RiskMap';
import EventLog from './EventLog';
import DateRangePicker from '../Shared/DateRangePicker';
import RiskRangeSliderButton from '../Shared/RiskScoreSliderButton';
import AccessResults from '../Charts/AccessResults';
import Filters from './Filters';
import store from '@/store';

export default {
  name: 'Activity',
  components: {
    BButton,
    BBadge,
    RiskMap,
    EventLog,
    DateRangePicker,
    RiskRangeSliderButton,
    AccessResults,
    Filters,
  },
  mixins: [NotificationMixin],
  props: {
    userId: {
      default: '',
      type: String,
    },
    showAccessResults: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    dateRange() {
      return store.state.Dashboard.dates;
    },
    filterCount() {
      return this.filterObject.features.length + (this.filterObject.reasons.length > 0 ? 1 : 0);
    },
    features() {
      return store.state.Dashboard.features;
    },
    minRisk() {
      return store.state.Dashboard.config.thresholds && store.state.Dashboard.config.thresholds.high;
    },
    maxRisk() {
      return 100;
    },
    filtersAndGeoFilters() {
      return {
        ...this.filterObject,
        geoCoordinates: this.geoCoordinates,
      };
    },
  },
  data() {
    return {
      filterObject: {
        riskRange: [this.minRisk || 0, 100],
        reasons: [],
        labels: [],
        features: [],
        is_risky_event: true,
      },
      geoCoordinates: null,
      showFilters: false,
    };
  },
  watch: {
    minRisk() {
      this.resetRisk();
    },
  },
  created() {
    store.dispatch('Dashboard/initializeFeatures');
    store.dispatch('Dashboard/initializeConfig');

    this.resetRisk();
  },
  methods: {
    resetRisk() {
      const filters = { ...this.filterObject };
      filters.riskRange = [this.minRisk, this.maxRisk];

      this.filterObject = filters;
    },
    handleMapBoundsChanged(geometry) {
      if (!_.isEqual(geometry, this.geoCoordinates)) {
        this.geoCoordinates = geometry;
      }
    },
    handleDateChange(newDateRange) {
      store.commit('dateChange', { dates: newDateRange });
    },
    handleFilterChange(filterObj) {
      this.filterObject = filterObj;
    },
    handleToggleFilter(newValue) {
      this.showFilters = newValue;
    },
    handleRiskRangeChange(value) {
      this.filterObject.riskRange = value;
    },
    updateFilters(newFilters, reasons) {
      this.filterObject.features = _.uniq(newFilters).filter((f) => !!f.key && f.value.length > 0);
      this.filterObject.reasons = reasons;
    },
  },
};
</script>

<style lang="scss">
  .activity {
    background: $white;

    &-filters {
      box-shadow: 1px 0 9px rgba(0, 0, 0, 0.13);
      height: 4.75rem;
    }

    .risk-chart,
    .event-log {
      height: calc(100vh - 9.25rem);
    }

    .event-log-container {
      max-width: 500px;
    }
  }
</style>

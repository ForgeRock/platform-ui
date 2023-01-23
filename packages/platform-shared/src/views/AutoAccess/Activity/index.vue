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
      <div
        class="d-flex flex-row activity-buttons-container"
        :class="{'activity-filters-user-detail': !!userId, 'position-absolute': !!userId}">
        <div class="date-picker-container ml-3">
          <FrDateRangePicker
            v-model="pickerDateRange"
            :ranges="ranges"
            opens="left"
          />
        </div>
        <div class="ml-3">
          <RiskScoreSliderButton
            :value="activeFilters.riskRange"
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
            :filter-object="activeFilters"
            @mapBoundChange="handleMapBoundsChanged"
          />
        </div>
      </div>
    </div>

    <Filters
      :show-modal="showFilters"
      :filter-object="filtersAndGeoFilters"
      :value="activeFilters"
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
import { mapState } from 'vuex';
import FrDateRangePicker from '@forgerock/platform-shared/src/components/DateRangePicker';
import AnalyticsMixin from '@forgerock/platform-shared/src/mixins/AnalyticsMixin';
import DateRangePickerMixin from '@forgerock/platform-shared/src/mixins/DateRangePickerMixin';
import RiskMap from './RiskMap';
import EventLog from './EventLog';
import RiskScoreSliderButton from '../Shared/RiskScoreSliderButton';
import AccessResults from '../Charts/AccessResults';
import Filters from './Filters';

export default {
  name: 'Activity',
  components: {
    BButton,
    BBadge,
    RiskMap,
    EventLog,
    FrDateRangePicker,
    RiskScoreSliderButton,
    AccessResults,
    Filters,
  },
  mixins: [NotificationMixin, AnalyticsMixin, DateRangePickerMixin],
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
  data() {
    return {
      showFilters: false,
    };
  },
  computed: {
    dateRange() {
      return this.$store.state.Dashboard.dates;
    },
    filterCount() {
      return this.activeFilters.features.length + (this.activeFilters.reasons.length > 0 ? 1 : 0);
    },
    features() {
      return this.$store.state.Dashboard.features;
    },
    maxRisk() {
      return 100;
    },
    filtersAndGeoFilters() {
      return this.$store.state.Dashboard.activeFilters;
    },
    ...mapState({
      activeFilters: (state) => state.Dashboard.activeFilters,
    }),
  },
  created() {
    this.$store.dispatch('Dashboard/initializeFeatures');
    this.$store.dispatch('Dashboard/initializeConfig');
  },
  methods: {
    handleMapBoundsChanged(geometry) {
      if (!_.isEqual(geometry, this.activeFilters.geoCoordinates)) {
        this.$store.commit('Dashboard/setActiveGeoCoordinates', geometry);
      }
    },
    handleDateChange(newDateRange) {
      this.$store.commit('dateChange', { dates: newDateRange });
    },
    handleToggleFilter(newValue) {
      this.showFilters = newValue;
    },
    handleRiskRangeChange(value) {
      this.$store.commit('Dashboard/setActiveRiskRange', value);
    },
    updateFilters(newFilters, reasons) {
      this.$store.commit('Dashboard/setActiveFeatureFilters', _.uniq(newFilters).filter((f) => !!f.key && f.value.length > 0));
      this.$store.commit('Dashboard/setActiveReasonFilters', reasons);
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

    .date-picker-container {
      .form-control {
        padding: 0;
      }
    }

    .activity-buttons-container {
      .btn.btn-outline-primary, .pill-primary {
        height: 50px;
      }
    }
  }
</style>

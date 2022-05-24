<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    id="event-log"
    class="event-log">
    <div class="d-flex flex-column h-100">
      <div class="pl-4 py-1 border-bottom d-flex flex-row justify-content-between align-items-center">
        <div class="text-dark d-flex flex-row">
          <span
            class="d-flex flex-row"
            v-if="totalRecords > 0">
            <span>
              {{ 1 + (page * pageSize) }}-{{ Math.min(totalRecords, (page + 1) * pageSize) }} of {{ new Intl.NumberFormat().format(totalRecords) }} events
            </span>
            <span
              class="ml-2"
              v-if="isLoading">
              <FrSpinner size="sm" />
            </span>
          </span>
          <span v-else-if="!isLoading">
            0 events
          </span>
        </div>
        <BDropdown
          variant="link"
        >
          <template #button-content>
            Sort: {{ $t(getSortByLabelKey(sortColumn)) }}
          </template>
          <BDropdownItem
            v-for="col in sortColumns"
            :key="col"
            @click="handleSort(col)"
          >
            {{ $t(getSortByLabelKey(col)) }}
          </BDropdownItem>
        </BDropdown>
      </div>
      <div class="flex-grow-1 overflow-auto">
        <div
          class="p-4 list-group-item d-flex flex-row"
          v-for="(row, index) in eventLogData"
          :class="index !== eventLogData.length - 1 ? 'border-bottom' : ''"
          :key="row.id"
          @click="toggleEventDetailModal(row)"
        >
          <div
            v-if="userId"
            class="text-muted"
            style="flex-basis: 100px;">
            <RelativeTime
              :timestamp="row.timestamp"
            />
          </div>
          <div class="flex-grow-1">
            <div
              v-if="!userId"
              class="d-flex flex-row justify-content-between mb-2">
              <div>
                <span>
                  <span class="text-dark mr-2 font-weight-bold">
                    {{ row.userId }}
                  </span>
                  <span class="mx-2">
                    &middot;
                  </span>
                  <span>
                    <RelativeTime
                      :timestamp="row.timestamp"
                    />
                  </span>
                </span>
              </div>
            </div>
            <div class="mb-2 d-flex flex-row">
              <RiskScore
                :score="parseFloat(row.risk)"
                :small="true"
              />
              <div
                class="ml-2"
              >
                <Explainability
                  :risk-score-data="row.risk_score_data"
                  :ueba-signal="row.ueba_signal"
                />
              </div>
            </div>
            <div class="text-muted">
              <span class="text-capitalize">
                {{ getCityCountry(row) }}
              </span>
              <span v-if="row.os">
                <span class="mx-2">
                  &middot;
                </span>
                <span>
                  {{ row.os }} {{ row.osVersion }}
                </span>
              </span>
              <span v-if="row.userAgentType">
                <span class="mx-2">
                  &middot;
                </span>
                <span>
                  {{ row.userAgentType }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="d-flex justify-content-center align-items-center">
          <FrSpinner class="py-5" />
        </div>
        <div v-else-if="error">
          <div class="w-100 p-5 text-center ">
            {{ error }}
          </div>
        </div>
        <div
          v-else-if="eventLogData.length === 0"
          class="d-flex justify-content-center align-items-center">
          <div class="w-100 p-5 text-center ">
            {{ $t("common.noRecords") }}
          </div>
        </div>
      </div>

      <FrPagination
        :current-page="page"
        :last-page="lastPage"
        @pagination-change="paginationChange" />
    </div>
    <EventDetail
      :data="detail"
      @hidden="toggleEventDetailModal(null)"
    />
  </div>
</template>

<script>
import {
  BButton, BBadge, BLink, BDropdown, BDropdownItem, BModal,
} from 'bootstrap-vue';
import FrSelect from '@forgerock/platform-shared/src/components/Field/Select';
import FrTextArea from '@forgerock/platform-shared/src/components/Field/TextArea';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { getEventLogs, apiToInternalEvent } from '../api/ActivityAPI';
import FrPagination from '../../Shared/DataTable/Pagination';
import FrTreeselect from '../../Shared/TreeSelect';
import RiskScore from '../../Shared/RiskScore';
import EventDetail from '../EventDetail';
import RelativeTime from '../../Shared/RelativeTime';
import ResultBadge from '../../Shared/ResultBadge';
import Explainability from '../../Shared/Explainability';
import { getQueryFilters } from '../../Shared/utils/api';
import store from '@/store';

const ace = require('brace');
require('brace/mode/json');

export default {
  name: 'EventLog',
  components: {
    BButton,
    BBadge,
    BLink,
    BDropdown,
    BDropdownItem,
    FrSelect,
    BModal,
    FrTextArea,
    FrPagination,
    FrTreeselect,
    FrSpinner,
    RiskScore,
    EventDetail,
    RelativeTime,
    ResultBadge,
    Explainability,
  },
  props: {
    filterObject: {
      type: Object,
    },
    userId: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      filterCount: 0,
      pageMeta: [],
      pageSize: 10,
      eventLogData: [],
      totalRecords: 0,
      sortColumn: 'risk',
      page: 0,
      labelValue: [],
      selectedRow: null,
      isLoading: true,
      detail: null,
      error: null,
    };
  },
  computed: {
    lastPage() {
      if (this.pageSize * this.page + this.pageSize < this.totalRecords) {
        return false;
      }
      return true;
    },
    sortColumns() {
      const cols = ['risk', 'eventTime'];
      if (!this.userId) {
        cols.push('user');
      }
      return cols;
    },
    dateRange() {
      return store.state.Dashboard.dates;
    },
  },
  watch: {
    dateRange() {
      this.page = 0;
      this.pageMeta = [];

      this.fetchData();
    },
    filterObject: {
      immediate: false,
      deep: true,
      handler(newFilter) {
        this.page = 0;
        this.pageMeta = [];

        // this.fetchData();
      },
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    getQuery() {
      const {
        dateRange, pageSize, page, pageMeta, filterObject,
      } = this;
      const param = {
        sort: this.getQuerySort(),
        size: pageSize,
        track_total_hits: true,
        query: {
          bool: getQueryFilters(dateRange, filterObject, this.userId),
        },
      };

      if (page !== 0) {
        param.search_after = pageMeta[page - 1]?.currentPageEnd;
      }

      return param;
    },
    toggleEventDetailModal(detail) {
      this.detail = detail;
    },
    getCityCountry(row) {
      if (!row.geo_data) {
        return 'Undefined Location';
      }
      return `${row.geo_data.city}, ${row.geo_data.country}`;
    },
    getSortByLabelKey(col) {
      if (col === 'risk') {
        return 'autoAccess.access.activity.riskScore';
      } if (col === 'eventTime') {
        return 'autoAccess.access.activity.eventTime';
      } if (col === 'user') {
        return 'common.user.user';
      } if (col === 'result') {
        return 'autoAccess.access.activity.result';
      }
      return '';
    },
    fetchData() {
      const { pageMeta, page } = this;
      this.isLoading = true;
      this.error = false;
      getEventLogs(this.getQuery())
        .then(({ data }) => {
          this.eventLogData = data.hits.hits.map((row) => {
            const ev = apiToInternalEvent(row);
            return ev;
          });
          this.totalRecords = data.hits.total.value;
          if (data.hits.total.value > 0) {
            const myPageMeta = [...pageMeta];
            myPageMeta[page] = {
              prevPageEnd: myPageMeta[page - 1]?.currentPageEnd,
              currentPageEnd: data.hits.hits[data.hits.hits.length - 1].sort,
            };
            this.pageMeta = myPageMeta;
          }
        })
        .catch(() => {
          this.error = 'An error occured.';
          this.eventLogData = [];
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    paginationChange(page) {
      if (!this.isLoading) {
        this.page = page;

        this.fetchData();
      }
    },
    handleSort(column) {
      this.sortColumn = column;

      this.page = 0;
      this.pageMeta = [];

      this.fetchData();
    },
    getQuerySort() {
      const { sortColumn } = this;
      const riskSort = {
        'predictionResult.risk_score_data.risk_score': {
          order: 'desc',
        },
      };
      const timestampSort = {
        'predictionResult.features.timestamp': {
          order: 'desc',
        },
      };
      const userSort = {
        'predictionResult.features.userId.keyword': {
          order: 'desc',
        },
      };

      if (sortColumn === 'risk') {
        return [
          riskSort,
          timestampSort,
          userSort,
        ];
      } if (sortColumn === 'eventTime') {
        return [
          timestampSort,
          riskSort,
          userSort,
        ];
      } if (sortColumn === 'user') {
        return [
          userSort,
          timestampSort,
        ];
      }
    },
  },
};
</script>

<style lang="scss">
  .event-log {
    .list-group-item {
      text-decoration: none;
      color: inherit;
      border: none;
      border-radius: 0;
      margin-bottom: 0;

      &:hover {
        background: $gray-100;
      }
    }
  }
</style>
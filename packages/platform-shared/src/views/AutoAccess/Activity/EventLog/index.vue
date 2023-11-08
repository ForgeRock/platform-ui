<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

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
              {{ currentPageRecords }} - {{ totalPageRecords }} of {{ totalAllRecords }} events
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
          v-for="row in eventLogData"
          :key="row.id"
        >
          <EventItem
            :event-item-data="row"
            @show-detail="toggleEventDetailModal"
          />
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
      :event-data="detail"
      @hidden="toggleEventDetailModal(null)"
    />
  </div>
</template>

<script>
import {
  BDropdown, BDropdownItem,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { getEventLogs, apiToInternalEvent } from '../api/ActivityAPI';
import FrPagination from '../../Shared/DataTable/Pagination';
import EventDetail from '../EventDetail';
import { getQueryFilters } from '../../Shared/utils/api';
import formatNumber from '../../../../utils/formatNumber';
import EventItem from './EventItem';

export default {
  name: 'EventLog',
  components: {
    BDropdown,
    BDropdownItem,
    EventItem,
    FrPagination,
    FrSpinner,
    EventDetail,
  },
  mixins: [
    NotificationMixin,
  ],
  props: {
    filterObject: {
      type: Object,
      default: () => ({}),
    },
    userId: {
      type: String,
      default: '',
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
    currentPageRecords() {
      return formatNumber(1 + (this.page * this.pageSize), 'en-US');
    },
    totalPageRecords() {
      return formatNumber(Math.min(this.totalRecords, (this.page + 1) * this.pageSize), 'en-US');
    },
    totalAllRecords() {
      return formatNumber(this.totalRecords, 'en-US');
    },
    lastPage() {
      return !(this.pageSize * this.page + this.pageSize < this.totalRecords);
    },
    sortColumns() {
      const cols = ['risk', 'eventTime'];
      if (!this.userId) {
        cols.push('user');
      }
      return cols;
    },
    dateRange() {
      return this.$store.state.Dashboard.utcDates;
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
      handler() {
        this.page = 0;
        this.pageMeta = [];

        this.fetchData();
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
      const query = this.getQuery();
      getEventLogs(query)
        .then(({ data }) => {
          this.eventLogData = data.hits.hits.map((row) => {
            const ev = apiToInternalEvent(row);
            return { ...ev };
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
        .catch((error) => {
          this.showErrorMessage(error, this.$t('autoAccess.access.errors.retrievingActivity'));
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
      return [];
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

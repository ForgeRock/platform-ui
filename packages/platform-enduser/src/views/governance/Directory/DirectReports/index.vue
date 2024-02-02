<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      class="mb-4"
      :title="$t('governance.directReports.title')"
      :subtitle="$t('governance.directReports.subtitle')" />
    <BCard no-body>
      <BCardHeader class="p-0">
        <div
          class="btn-toolbar justify-content-end p-3 border-bottom-0"
          v-if="!isNoResultsFirstLoad"
          data-testid="search-container-directreports"
        >
          <FrSearchInput
            v-model="searchQuery"
            data-testid="search-directreports"
            :placeholder="$t('common.search')"
            @clear="clear"
            @search="$event => loadData()"
          />
        </div>
      </BCardHeader>
      <div
        v-if="isLoading"
        data-testid="spinner-directreports">
        <FrSpinner class="py-5" />
        <div class="text-center pb-4 font-bold">
          {{ $t('common.loading') }}
        </div>
      </div>
      <BCol
        v-else-if="items.length===0"
        lg="8"
        offset-lg="2">
        <FrNoData
          icon="people"
          body-class="mb-5"
          data-testid="no-results-firstload-directreports"
          :title="$t('governance.directReports.noDirectReportsFound')"
          :subtitle="isNoResultsFirstLoad ? $t('governance.directReports.noResultsUser') : $t('governance.directReports.noResultsHelp')"
          :card="false" />
      </BCol>
      <BTable
        v-else
        id="table-directreports"
        class="cursor-pointer"
        data-testid="table-directreports"
        @sort-changed="sortChanged"
        hover
        responsive
        :fields="fields"
        :items="items"
        :busy="isLoading"
        :no-local-sorting="true"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        @row-clicked="viewDirectReportDetails"
      >
        <template #cell(username)="{ item }">
          <BMedia no-body>
            <BMediaAside vertical-align="center">
              <BImg
                class="rounded-circle"
                height="36"
                width="36"
                :alt="item.givenName"
                :aria-hidden="true"
                :src="item.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
            </BMediaAside>
            <BMediaBody class="text-truncate">
              <h5 class="mb-0 text-truncate">
                {{ $t('common.userFullName', { givenName: item.givenName, sn: item.sn }) }}
              </h5>
              <small class="text-muted text-truncate">
                {{ item.userName }}
              </small>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(accountStatus)="{ item }">
          <BBadge
            v-if="item.accountStatus === 'active'"
            class="w-100px text-capitalize"
            variant="success">
            {{ $t('common.active') }}
          </BBadge>
          <BBadge
            v-else
            class="w-100px text-capitalize"
            variant="secondary">
            {{ $t('common.inactive') }}
          </BBadge>
        </template>
      </BTable>
      <FrPagination
        v-if="totalCount > 10"
        v-model="paginationPage"
        aria-controls="table-directreports"
        :per-page="paginationPageSize"
        :total-rows="totalCount"
        @input="pageChange"
        @on-page-size-change="pageSizeChange"
      />
    </BCard>
  </BContainer>
</template>

<script>
import {
  BBadge,
  BCard,
  BCardHeader,
  BCol,
  BContainer,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { getDirectReports } from '@/api/governance/DirectoryApi';
/*
 * @description view to show a list of direct reports
 */
export default {
  name: 'DirectReports',
  components: {
    BBadge,
    BCard,
    BCardHeader,
    BCol,
    BContainer,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTable,
    FrHeader,
    FrNoData,
    FrPagination,
    FrSearchInput,
    FrSpinner,
  },
  mixins: [
    NotificationMixin,
  ],
  data() {
    return {
      fields: [
        {
          key: 'userName',
          label: this.$t('common.user.user'),
          sortable: true,
          sortDirection: 'asc',
        },
        {
          key: 'accountStatus',
          label: this.$t('common.status'),
        },
      ],
      items: [],
      totalCount: 0,
      isLoading: true,
      paginationPage: 1,
      paginationPageSize: 10,
      searchQuery: '',
      sortDesc: false,
      sortBy: 'userName',
      isNoResultsFirstLoad: false,
    };
  },
  computed: {
    ...mapState(useUserStore, ['userId']),
  },
  async mounted() {
    await this.loadData();
    this.checkIfNoResultsFirstLoad();
  },
  methods: {
    async clear() {
      this.searchQuery = '';
      this.paginationPage = 1;
      await this.loadData();
    },
    /**
     * Builds url to call API to pull table data of direct reports
     */
    async loadData() {
      this.isLoading = true;
      // Page Params
      const params = {
        pageSize: this.paginationPageSize,
        pageNumber: this.paginationPage,
      };
      // Adds search to params if search query
      if (this.searchQuery) {
        params.queryString = this.searchQuery;
      }
      // Checks sort and adds to params
      if (this.sortDesc) {
        params.sortDir = 'desc';
      }
      if (!this.sortDesc) {
        params.sortDir = 'asc';
      }
      // Adds sortby to params
      params.sortBy = this.sortBy;

      await getDirectReports(this.userId, params).then(({ data }) => {
        this.items = data.result;
        this.totalCount = data.totalCount;
      }).catch((err) => {
        this.showErrorMessage(err, this.$t('governance.directReports.errorGettingDirectReports'));
      });
      this.isLoading = false;
    },
    async sortChanged() {
      this.sortDesc = !this.sortDesc;
      this.paginationPage = 1;
      await this.loadData();
    },
    async pageChange(page) {
      this.paginationPage = page;
      await this.loadData();
    },
    async pageSizeChange(pageSize) {
      this.paginationPageSize = pageSize;
      await this.loadData();
    },
    async searchDirectReports() {
      await this.loadData();
    },
    checkIfNoResultsFirstLoad() {
      if (this.totalCount === 0) {
        this.isNoResultsFirstLoad = true;
      }
    },
    viewDirectReportDetails(rowData) {
      const params = {
        grantType: 'account',
        userId: rowData._refResourceId,
      };
      this.$router.push({
        name: 'DirectReportDetail',
        params,
      });
    },
  },
};
</script>

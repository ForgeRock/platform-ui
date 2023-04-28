<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5 my-access">
    <FrHeader
      class="mb-4"
      :title="$t(`pages.myAccess.${this.routerParameters.resourceName}.title`)"
      :subtitle="$t(`pages.myAccess.${this.routerParameters.resourceName}.subtitle`)" />
    <BCard no-body>
      <BCardHeader class="p-0">
        <BButtonToolbar
          v-if="!isNoResultsFirstLoad"
          class="justify-content-end p-3 border-bottom-0"
          data-testid="search-container-my-access">
          <FrSearchInput
            v-model="searchQuery"
            data-testid="search-my-access"
            :placeholder="$t('common.search')"
            @clear="clear"
            @search="loadData()" />
        </BButtonToolbar>
      </BCardHeader>
      <div
        v-if="isLoading"
        data-testid="spinner-my-access">
        <FrSpinner class="py-5" />
        <div class="text-center pb-4 font-bold">
          {{ $t('common.loading') }}
        </div>
      </div>
      <FrNoData
        v-else-if="items.length===0"
        icon="people"
        body-class="mb-5"
        data-testid="no-results-firstload-my-access"
        :title="$t(`pages.myAccess.${this.routerParameters.resourceName}.noRecordFound`)"
        :subtitle="isNoResultsFirstLoad ? $t(`pages.myAccess.${this.routerParameters.resourceName}.noResultsUser`) : $t('governance.directReports.noResultsHelp')"
        :card="false" />
      <BTable
        v-else
        data-testid="table-my-access"
        @sort-changed="sortChanged"
        responsive
        :fields="fields"
        :items="items"
        :busy="isLoading"
        :no-local-sorting="true"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc">
        <template #cell(accountName)="{ item }">
          <BMedia
            no-body
            class="text-truncate">
            <BMediaBody class="text-truncate">
              <p class="mb-0 text-truncate text-dark">
                {{ item.account.userPrincipalName }}
              </p>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(appName)="{ item }">
          <div>
            <BMedia no-body>
              <BMediaAside
                vertical-align="center"
                class="mr-4">
                <BImg
                  :alt="$t('common.logo')"
                  :src="getApplicationLogo(item.application) || require('@forgerock/platform-shared/src/assets/images/placeholder.svg')"
                  :aria-hidden="true"
                  width="36"
                  height="36"
                />
              </BMediaAside>
              <BMediaBody class="text-truncate">
                <h5 class="mb-0 text-truncate">
                  {{ item.application.name }}
                </h5>
                <small class="text-muted text-truncate">
                  {{ getDisplayName(item) }}
                </small>
              </BMediaBody>
            </BMedia>
          </div>
        </template>
        <template #cell(entitlementName)="{ item }">
          <BMedia
            no-body
            class="text-truncate">
            <BMediaBody class="text-truncate">
              <p class="mb-0 text-truncate text-dark">
                {{ item.entitlement.__NAME__ }}
              </p>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(roleName)="{ item }">
          <BMedia
            no-body
            class="d-flex align-items-end">
            <div class="d-flex align-items-center justify-content-center rounded rounded-circle bg-light mr-3 text-dark icon">
              <BMediaAside
                vertical-align="center"
                class="ml-3">
                <FrIcon name="assignment_ind" />
              </BMediaAside>
            </div>
            <BMediaBody
              class="text-truncate"
              vertical-align="center">
              <h5 class="text-truncate">
                {{ item.role.name }}
              </h5>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(status)="{}">
        </template>
        <template #cell(timeConstraint)="{ item }">
          <BMedia
            no-body
            class="text-truncate">
            <BMediaBody class="text-truncate">
              <p class="mb-0 text-truncate">
                {{ item.relationship.temporalConstraints || blankValueIndicator }}
              </p>
            </BMediaBody>
          </BMedia>
        </template>
      </BTable>
      <FrPagination
        v-model="paginationPage"
        aria-controls="table-my-access"
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
  BButtonToolbar,
  BCard,
  BCardHeader,
  BContainer,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import * as GovernanceEnduserApi from '@/api/GovernanceEnduserApi';

export default {
  name: 'MyAccessReview',
  components: {
    BButtonToolbar,
    BCard,
    BCardHeader,
    BContainer,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTable,
    FrHeader,
    FrIcon,
    FrPagination,
    FrSearchInput,
    FrSpinner,
    FrNoData,
  },
  mixins: [
    AppSharedUtilsMixin,
    NotificationMixin,
  ],
  data() {
    return {
      blankValueIndicator,
      fields: [],
      isLoading: true,
      isNoResultsFirstLoad: false,
      items: [],
      paginationPage: 1,
      paginationPageSize: 10,
      searchQuery: '',
      sortDesc: null,
      sortBy: null,
      totalCount: 0,
    };
  },
  created() {
    const resourceName = this.$route.name?.toLowerCase();
    this.routerParameters = {
      resourceName,
    };
  },
  mounted() {
    this.getDefaultSort();
    this.getTableFields();
    this.loadData(true);
  },
  methods: {
    clear() {
      this.paginationPage = 1;
      this.searchQuery = '';
      this.loadData();
    },
    getDisplayName(item) {
      if (this.routerParameters.resourceName === 'accounts') {
        return item.account.userPrincipalName;
      }
      return this.getApplicationDisplayName(item.application);
    },
    getTableFields() {
      switch (this.routerParameters.resourceName) {
        case 'accounts':
          this.fields = [
            {
              key: 'appName',
              label: this.$t('common.name'),
              sortable: true,
            },
            {
              key: 'status',
              label: this.$t('common.status'),
              sortable: true,
            },
          ];
          break;
        case 'roles':
          this.fields = [
            {
              key: 'roleName',
              label: this.$t('common.name'),
              sortable: true,
            },
            {
              key: 'timeConstraint',
              label: this.$t('pages.myAccess.timeConstraint'),
            },
          ];
          break;
        case 'entitlements':
          this.fields = [
            {
              key: 'appName',
              label: this.$t('common.application'),
              sortable: true,
            },
            {
              key: 'entitlementName',
              label: this.$t('common.name'),
              sortable: true,
            },
            {
              key: 'accountName',
              label: this.$t('pages.myAccess.accountName'),
              sortable: true,
            },
          ];
          break;
        default:
          break;
      }
    },
    getDefaultSort() {
      switch (this.routerParameters.resourceName) {
        case 'accounts':
        case 'entitlements':
          this.sortBy = 'application.name';
          break;
        case 'roles':
          this.sortBy = 'role.name';
          break;
        default:
          break;
      }
    },
    /**
     * Loads a list for MyAccess (accounts/entitlements/roles) based on the current path
     * @param {object} params - Parameters to be plugged into query string
     * @param {Boolean} isInit - Parameter check whether the component is inital rendering, passed from loadData()
     */
    getMyAccess(params, isInit = false) {
      params.grantType = this.routerParameters.resourceName.slice(0, -1);
      GovernanceEnduserApi.getMyAccess(this.$store.state.UserStore.userId, params).then(({ data }) => {
        this.items = data.result;
        this.totalCount = data.totalCount;
        if (isInit && this.totalCount === 0) {
          this.isNoResultsFirstLoad = true;
        }
      }).catch((err) => {
        this.showErrorMessage(err, this.$t(`pages.myAccess.${this.routerParameters.resourceName}.errorGettingData`));
      }).finally(() => {
        this.isLoading = false;
      });
    },
    /**
     * Loads a list for MyAccess
     * @param {Boolean} isInit - Optional parameter check whether the component is inital rendering, default is false
     */
    loadData(isInit = false) {
      this.isLoading = true;
      const params = {
        pageSize: this.paginationPageSize,
        pageNumber: this.paginationPage - 1,
      };
      if (this.searchQuery !== '') {
        params.queryString = this.searchQuery;
      }
      params.sortDir = this.sortDesc ? 'desc' : 'asc';
      params.sortBy = this.sortBy;
      this.getMyAccess(params, isInit);
    },
    pageChange(page) {
      this.paginationPage = page;
      this.loadData();
    },
    pageSizeChange(pageSize) {
      this.paginationPageSize = pageSize;
      this.loadData();
    },
    sortChanged(event) {
      const { sortBy } = event;
      switch (sortBy) {
        case 'accountName':
          this.sortBy = 'account.userPrincipalName';
          break;
        case 'appName':
          this.sortBy = 'application.name';
          break;
        case 'entitlementName':
          this.sortBy = 'entitlement.__NAME__';
          break;
        case 'roleName':
          this.sortBy = 'role.name';
          break;
        case 'status':
          this.sortBy = '';
          break;
        default:
          this.sortBy = null;
          break;
      }
      this.sortDesc = !this.sortDesc;
      this.loadData();
    },
  },
};
</script>
<style lang="scss" scoped>
.my-access {
  .icon {
    height: 34px;
    width: 34px;
  }
  .w-100px {
    width: 100px;
  }
}
</style>

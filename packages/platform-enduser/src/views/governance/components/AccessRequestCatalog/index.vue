<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <div class="mb-4">
      <FrPageHeader
        :title="$t('governance.accessRequest.newRequest.catalogTitle')"
        :subtitle="$t('governance.accessRequest.newRequest.catalogSubtitle')" />
    </div>
    <BTabs
      v-model="selectedTab"
      class="my-4"
      content-class="mt-4"
      lazy
      @input="tabChange()">
      <template v-for="(catalogCategory, key) in catalogTabs">
        <BTab
          class="p-0"
          :key="key"
          :data-testid="`tab-${key}`"
          :title="catalogCategory.capitalizedTitle">
          <FrSpinner v-if="loading && firstQuery" />
          <FrNoData
            v-else-if="!catalogItems.length && firstQuery"
            class="mt-5 border-0 shadow-none"
            :icon="tabNoResultsIcon"
            :title="$t('governance.accessRequest.newRequest.noResults', { item: catalogTabs[tabType].capitalizedTitle })"
            :subtitle="$t('governance.accessRequest.newRequest.noResultsSubTitle', { item: catalogTabs[tabType].capitalizedTitle })" />
          <template v-else>
            <BButtonToolbar
              v-if="selectedTab === 1"
              class="pb-3 pt-0 px-0 border-0">
              <FrField
                v-model="applicationToFilterBy"
                class="w-100"
                name="filterByApplication"
                type="multiselect"
                :internal-search="false"
                :label="$t('governance.accessRequest.newRequest.filterByApplications')"
                :options="applicationFilterOptions"
                @input="filterByApplication"
                @search-change="debouncedApplicationSearch"
                @open="!applicationFilterOptions.length ? filterByApplicationSearch('') : null">
                <template #tag="{ option, remove }">
                  <span class="multiselect__tag">
                    <BMedia no-body>
                      <BImg
                        height="24"
                        width="24"
                        class="mr-2 align-self-center"
                        :src="option.icon" />
                      <BMediaBody class="pl-1">
                        <div class="mb-1 text-dark">
                          {{ option.title }}
                        </div>
                        <div class="text-muted">
                          {{ option.subtitle }}
                        </div>
                      </BMediaBody>
                    </BMedia>
                    <i
                      class="multiselect__tag-icon"
                      @click="remove(option)" />
                  </span>
                </template>
                <template #option="{ option }">
                  <BMedia no-body>
                    <BImg
                      height="24"
                      width="24"
                      class="mr-2 align-self-center"
                      :src="option.icon" />
                    <BMediaBody class="pl-1">
                      <div class="mb-1 text-dark">
                        {{ option.title }}
                      </div>
                      <div class="text-muted">
                        {{ option.subtitle }}
                      </div>
                    </BMediaBody>
                  </BMedia>
                </template>
              </FrField>
            </BButtonToolbar>
            <BButtonToolbar class="pb-3 pt-0 px-0 justify-content-between border-0">
              <FrSearchInput
                v-model="searchValue"
                class="flex-grow-1"
                :placeholder="$t('common.searchPlaceholder', { searchItem: catalogCategory.lowercaseTitle })"
                @search="searchCatalog({ page: 1 })"
                @clear="searchCatalog({ searchValue: $event, page: 1 })" />
              <BButton
                class="ml-3"
                pill
                variant="outline-primary"
                @click="showFilterModal">
                <FrIcon
                  class="mr-2"
                  name="filter_list" />
                {{ $t('governance.accessRequest.newRequest.filters') }}
                <BBadge
                  v-if="quantityFilters"
                  class="ml-1"
                  pill
                  variant="primary">
                  {{ quantityFilters }}
                </BBadge>
              </BButton>
            </BButtonToolbar>
            <div>
              <FrNoData
                v-if="!catalogItems.length"
                class="mt-5 border-0 shadow-none"
                :icon="tabNoResultsIcon"
                :title="$t('governance.accessRequest.newRequest.noFilterResults')"
                :subtitle="$t('governance.accessRequest.newRequest.noFilterResultsSubTitle')" />
              <template v-else>
                <BButtonToolbar class="p-0 mb-1 justify-content-between align-items-center border-0">
                  <div class="mb-0 text-muted">
                    {{ $tc('governance.accessRequest.newRequest.results', totalCount, { totalCount }) }}
                  </div>
                  <FrSortDropdown
                    :selected-item="sortField"
                    :sort-by-options="sortByOptions"
                    @sort-field-change="searchCatalog({ sortField: $event, page: 1 })"
                    @sort-direction-change="searchCatalog({ sortDir: $event, page: 1 })" />
                </BButtonToolbar>
                <FrSpinner v-if="loading" />
                <BRow
                  v-else
                  :id="`${key}Grid`">
                  <template v-for="(item, itemKey) in catalogItems">
                    <BCol
                      cols="12"
                      lg="6"
                      xl="4"
                      class="mb-4"
                      :key="itemKey">
                      <BCard
                        class="h-100 shadow-none cursor-pointer"
                        no-body
                        tag="a"
                        @click="toggleItemInCart(item)">
                        <BCardBody class="d-flex">
                          <BMedia
                            body-class="overflow-hidden"
                            class="overflow-hidden">
                            <BImg
                              v-if="selectedTab < 2"
                              height="28"
                              class="mb-3"
                              :alt="item.appType || $t('governance.accessRequest.newRequest.role')"
                              :src="item.icon" />
                            <div
                              v-else
                              class="rounded-circle bg-lightblue color-blue d-flex align-items-center justify-content-center mb-3"
                              style="width: 28px; height: 28px;">
                              <FrIcon name="assignment_ind" />
                            </div>
                            <h2 class="h5 text-truncate mb-1">
                              {{ item.name }}
                            </h2>
                            <p
                              v-if="item.appType"
                              class="mb-2 text-dark">
                              {{ item.appType }}
                            </p>
                            <p class="max-lines max-lines-3">
                              <small class="d-block">
                                {{ item.description }}
                              </small>
                            </p>
                          </BMedia>
                        </BCardBody>
                        <BCardFooter class="border-0 pt-0 d-flex justify-content-end">
                          <template v-if="item.requested">
                            <FrIcon
                              class="mr-2 text-success"
                              name="check" />{{ $t('governance.accessRequest.newRequest.added') }}
                          </template>
                          <span
                            v-else
                            class="hover-underline color-blue">
                            <FrIcon
                              class="mr-2"
                              name="add" />{{ $t('governance.accessRequest.newRequest.request') }}
                          </span>
                        </BCardFooter>
                      </BCard>
                    </BCol>
                  </template>
                </BRow>
                <FrPagination
                  v-if="totalCount > 10"
                  v-model="page"
                  :per-page="pageSize"
                  :total-rows="totalCount"
                  @input="searchCatalog()"
                  @on-page-size-change="searchCatalog({ pageSize: $event, page: 1 })" />
              </template>
            </div>
          </template>
        </BTab>
      </template>
    </BTabs>
    <ValidationObserver v-slot="{ invalid }">
      <BModal
        id="filterModal"
        no-close-on-backdrop
        no-close-on-esc
        size="lg"
        :title="$t('governance.accessRequest.newRequest.filters')"
        @close="resetFilter"
        @ok="filterResults">
        <FrCertificationFilter
          @filter-update="filter = getGovernanceFilter($event)"
          body-class="p-0"
          card-class="border-0 shadow-none"
          :hide-group="true"
          :resource-name="tabType"
          :properties="filterOptions"
          :filter="filter">
          <template #prefix>
            {{ $t('governance.accessRequest.newRequest.showIf') }}
          </template>
        </FrCertificationFilter>
        <template #modal-footer="{ ok }">
          <BButton
            class="mr-auto"
            variant="link"
            @click="clearAll">
            {{ $t('governance.accessRequest.newRequest.clearAll') }}
          </BButton>
          <BButton
            variant="primary"
            :disabled="invalid"
            @click="ok">
            {{ $t('common.apply') }}
          </BButton>
        </template>
      </BModal>
    </ValidationObserver>
  </BContainer>
</template>

<script>
import { capitalize, cloneDeep, debounce } from 'lodash';
import {
  BBadge,
  BButton,
  BButtonToolbar,
  BCard,
  BCardBody,
  BCardFooter,
  BCol,
  BContainer,
  BImg,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { ValidationObserver } from 'vee-validate';
import FrCertificationFilter from '@forgerock/platform-shared/src/components/filterBuilder/CertificationFilter';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrPageHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import PluralizeFilter from '@forgerock/platform-shared/src/filters/PluralizeFilter';
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import FrSortDropdown from '@/components/governance/SortDropdown';

/**
 * View housing access request catalog and request cart panel
 */
export default {
  name: 'AccessRequestCatalog',
  components: {
    BBadge,
    BButton,
    BButtonToolbar,
    BCard,
    BCardBody,
    BCardFooter,
    BCol,
    BContainer,
    BImg,
    BMedia,
    BMediaBody,
    BModal,
    BRow,
    BTab,
    BTabs,
    FrIcon,
    FrField,
    FrNoData,
    FrPageHeader,
    FrPagination,
    FrCertificationFilter,
    FrSearchInput,
    FrSortDropdown,
    FrSpinner,
    ValidationObserver,
  },
  mixins: [
    AppSharedUtilsMixin,
  ],
  props: {
    applicationSearchResults: {
      type: Array,
      default: () => [],
    },
    catalogFilterSchema: {
      type: Array,
      default: () => [],
    },
    catalogItems: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: true,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      applicationToFilterBy: '',
      catalogTabs: {
        application: {
          capitalizedTitle: PluralizeFilter(capitalize(this.$t('governance.accessRequest.newRequest.application'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequest.newRequest.application')),
          lowercaseTitle: PluralizeFilter(this.$t('governance.accessRequest.newRequest.application')),
          itemType: 'accountGrant',
        },
        entitlement: {
          capitalizedTitle: PluralizeFilter(capitalize(this.$t('governance.accessRequest.newRequest.entitlement'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequest.newRequest.entitlement')),
          lowercaseTitle: PluralizeFilter(this.$t('governance.accessRequest.newRequest.entitlement')),
          itemType: 'entitlementGrant',
        },
        role: {
          capitalizedTitle: PluralizeFilter(capitalize(this.$t('governance.accessRequest.newRequest.role'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequest.newRequest.role')),
          lowercaseTitle: PluralizeFilter(this.$t('governance.accessRequest.newRequest.role')),
          itemType: 'roleMembership',
        },
      },
      debouncedApplicationSearch: debounce(this.filterByApplicationSearch, 500),
      filter: {},
      firstQuery: true,
      page: 1,
      pageSize: 10,
      savedFilter: {},
      searchValue: '',
      selectedTab: 0,
      sortDir: 'desc',
      sortField: 'application.name',
    };
  },
  computed: {
    applicationFilterOptions() {
      return this.applicationSearchResults.map((application) => ({
        value: application.id,
        title: application.name,
        subtitle: this.getApplicationDisplayName(application),
        icon: this.getApplicationLogo(application),
      }));
    },
    filterOptions() {
      return this.catalogFilterSchema.map((option) => {
        const filterOption = {
          value: option.key,
          label: option.displayName,
          type: option.type,
        };
        if (option.type === 'managedObject') {
          filterOption.path = option.managedObjectType;
        }
        return filterOption;
      });
    },
    quantityFilters() {
      return this.filter.operand?.length || 0;
    },
    sortByOptions() {
      if (this.selectedTab === 0) {
        return [
          { text: this.$t('governance.accessRequest.newRequest.itemName', { item: this.catalogTabs.application.capitalizedSingularTitle }), value: 'application.name' },
          { text: this.$t('governance.accessRequest.newRequest.itemOwner', { item: this.catalogTabs.application.capitalizedSingularTitle }), value: 'applicationOwner.userName' },
        ];
      }
      if (this.selectedTab === 1) {
        return [
          { text: this.$t('governance.accessRequest.newRequest.itemName', { item: this.catalogTabs.entitlement.capitalizedSingularTitle }), value: 'assignment.name' },
          { text: this.catalogTabs.application.capitalizedSingularTitle, value: 'application.name' },
          { text: this.$t('governance.accessRequest.newRequest.itemOwner', { item: this.catalogTabs.application.capitalizedSingularTitle }), value: 'applicationOwner.userName' },
          { text: this.$t('governance.accessRequest.newRequest.itemOwner', { item: this.catalogTabs.entitlement.capitalizedSingularTitle }), value: 'entitlementOwner.userName' },
        ];
      }
      return [{ text: this.$t('governance.accessRequest.newRequest.itemName', { item: this.catalogTabs.role.capitalizedSingularTitle }), value: 'role.name' }];
    },
    tabNoResultsIcon() {
      const tabIconMap = {
        application: 'apps',
        entitlement: 'assignment_turned_in',
        role: 'assignment_ind',
      };
      return tabIconMap[this.tabType];
    },
    tabType() {
      return Object.keys(this.catalogTabs)[this.selectedTab];
    },
  },
  mounted() {
    this.searchCatalog();
  },
  methods: {
    /**
     * Clears filter and calls to filter results
     */
    clearAll() {
      this.filter = {};
      this.filterResults();
    },
    /**
     * Called on selecting one or more applications in entitlement view
     * @param {Array} applicationFilter Currently selected application(s)
     */
    filterByApplication(applicationFilter) {
      this.applicationFilter = applicationFilter;
      this.searchCatalog({ applicationFilter, page: 1 });
    },
    /**
     * Search for applications using the searchValue
     * @param {String} searchValue value in field at the time of debounce resolution
     */
    filterByApplicationSearch(searchValue) {
      this.$emit('search:applications', searchValue);
    },
    /**
     * Called on confirming from filter modal, hides filter modal and sends off request to search with
     * updated filter
     */
    filterResults() {
      this.$root.$emit('bv::hide::modal', 'filterModal');
      this.searchCatalog({ page: 1 });
    },
    getGovernanceFilter,
    /**
     * Sets filter back to what it was when filter modal was opened
     */
    resetFilter() {
      this.filter = cloneDeep(this.savedFilter);
    },
    /**
     * Builds search parameters and emits them out for view to query api for applications, entitlements, or roles.
     * @param {Object} updatedParams params changed in this request to add to other saved params before emiting search request
     */
    searchCatalog(updatedParams) {
      if (updatedParams) {
        const keys = Object.keys(updatedParams);
        keys.forEach((key) => {
          this[key] = updatedParams[key];
        });
      }
      const searchParams = {
        pageSize: this.pageSize,
        page: this.page,
        sortDir: this.sortDir,
        sortField: this.sortField,
        searchValue: this.searchValue,
        applicationFilter: this.applicationFilter,
        filter: this.filter,
      };
      const { itemType } = Object.values(this.catalogTabs)[this.selectedTab];
      this.$emit('search:catalog', itemType, searchParams);
    },
    /**
     * Shows filter builder modal
     */
    async showFilterModal() {
      this.savedFilter = cloneDeep(this.filter);
      this.$emit('get-catalog-filter-schema', this.tabType);
      this.$root.$emit('bv::show::modal', 'filterModal');
    },
    /**
     * Resets filter, sort field, page, sort direction, and search value and sends off search request
     */
    tabChange() {
      const sortFieldMap = {
        application: 'application',
        entitlement: 'assignment',
        role: 'role',
      };
      this.searchCatalog({
        applicationFilter: '',
        filter: {},
        page: 1,
        searchValue: '',
        sortDir: 'desc',
        sortField: `${sortFieldMap[this.tabType]}.name`,
      });
    },
    /**
     * Adds or removes selected catalog item in request cart
     * @param {Object} item metadata of item to add or remove from cart (only id is used for remove)
     */
    toggleItemInCart(item) {
      if (item.requested) {
        this.$emit('remove-item-from-cart', item.id);
      } else {
        const emitItem = {
          itemType: this.tabType,
          description: item.appType ?? '',
          templateName: item.templateName,
          icon: item.icon,
          name: item.name,
          id: item.id,
        };
        this.$emit('add-item-to-cart', emitItem);
      }
    },
  },
  watch: {
    catalogItems(items) {
      if (items?.length) {
        this.firstQuery = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
a.card:hover {
  text-decoration: none;
  border-color: $blue !important;
  background: $white;
}

.nav-tabs .nav-link:hover {
  border: none;
}

.h5 {
  font-weight: 600;
}

.rounded-pill {
  border-radius: 50rem !important;
}
</style>
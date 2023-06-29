<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <div class="mb-4">
      <FrPageHeader
        :title="$t('governance.accessRequests.newRequest.catalogTitle')"
        :subtitle="$t('governance.accessRequests.newRequest.catalogSubtitle')" />
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
          <BButtonToolbar
            v-if="selectedTab === 1"
            class="pb-3 pt-0 px-0">
            <FrField
              v-model="applicationToFilterBy"
              class="w-100"
              name="filterByApplication"
              type="multiselect"
              :internal-search="false"
              :label="$t('governance.accessRequests.newRequest.filterByApplications')"
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
              @search="searchFieldChange(searchValue)" />
            <BButton
              class="ml-3"
              pill
              variant="outline-primary"
              @click="showFilterModal">
              <FrIcon
                class="mr-2"
                name="filter_list" />
              {{ $t('governance.accessRequests.newRequest.filters') }}
            </BButton>
          </BButtonToolbar>
          <div>
            <BButtonToolbar class="p-0 mb-1 justify-content-between align-items-center border-0">
              <div class="mb-0 text-muted">
                {{ $tc('governance.accessRequests.newRequest.results', totalCount, { totalCount }) }}
              </div>
              <FrSortDropdown
                :selected-item="sortField"
                :sort-by-options="sortByOptions"
                @sort-field-change="searchCatalog({ sortField: $event })"
                @sort-direction-change="searchCatalog({ sortDir: $event })" />
            </BButtonToolbar>
            <BRow :id="`${key}Grid`">
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
                          :alt="item.appType || $t('governance.accessRequests.newRequest.role')"
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
                          name="check" />{{ $t('governance.accessRequests.newRequest.added') }}
                      </template>
                      <span
                        v-else
                        class="hover-underline color-blue">
                        <FrIcon
                          class="mr-2"
                          name="add" />{{ $t('governance.accessRequests.newRequest.request') }}
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
              @on-page-size-change="searchCatalog({ pageSize: $event })" />
          </div>
        </BTab>
      </template>
    </BTabs>
    <BModal
      id="filterModal"
      :title="$t('governance.accessRequests.newRequest.filters')">
      <!-- <FrQueryFilterBuilder
        :prefix-group-text="$t('governance.accessRequests.newRequest.showIf')"
        :resource-name="resourceName"
        :query-filter-string="filter"
        :properties="filterOptions"
        :select-property-values="selectPropertyValues"
        @change="restrictSituationFilter = $event" /> -->
    </BModal> <!-- TODO: For Application Filter Modal -->
  </BContainer>
</template>

<script>
import { capitalize, debounce } from 'lodash';
import {
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
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrPageHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
// import FrQueryFilterBuilder from '@forgerock/platform-shared/src/components/filterBuilder/QueryFilterBuilder';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import PluralizeFilter, { PluralizeSingular } from '@forgerock/platform-shared/src/filters/PluralizeFilter';
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import FrSortDropdown from '../../../../components/governance/SortDropdown';

/**
 * View housing access request catalog and request cart panel
 */
export default {
  name: 'AccessRequestCatalog',
  components: {
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
    FrPageHeader,
    FrPagination,
    // FrQueryFilterBuilder,
    FrSearchInput,
    FrSortDropdown,
  },
  mixins: [
    AppSharedUtilsMixin,
  ],
  props: {
    applicationSearchResults: {
      type: Array,
      default: () => [],
    },
    catalogItems: {
      type: Array,
      default: () => [],
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
        applications: {
          capitalizedTitle: PluralizeFilter(capitalize(this.$t('governance.accessRequests.newRequest.application'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequests.newRequest.application')),
          lowercaseTitle: PluralizeFilter(this.$t('governance.accessRequests.newRequest.application')),
          itemType: 'accountGrant',
        },
        entitlements: {
          capitalizedTitle: PluralizeFilter(capitalize(this.$t('governance.accessRequests.newRequest.entitlement'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequests.newRequest.entitlement')),
          lowercaseTitle: PluralizeFilter(this.$t('governance.accessRequests.newRequest.entitlement')),
          itemType: 'entitlementGrant',
        },
        roles: {
          capitalizedTitle: PluralizeFilter(capitalize(this.$t('governance.accessRequests.newRequest.role'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequests.newRequest.role')),
          lowercaseTitle: PluralizeFilter(this.$t('governance.accessRequests.newRequest.role')),
          itemType: 'roleMembership',
        },
      },
      debouncedApplicationSearch: debounce(this.filterByApplicationSearch, 500),
      filter: '',
      // filterOptions: [ // For Application Filter Modal
      //   Application Type
      // ],
      page: 1,
      pageSize: 10,
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
    sortByOptions() {
      // TODO: Should these values be just name and owner, need to determine this when api is available
      if (this.selectedTab === 0) {
        return [
          { text: this.$t('governance.accessRequests.newRequest.itemName', { item: this.catalogTabs.applications.capitalizedSingularTitle }), value: 'application.name' },
          { text: this.$t('governance.accessRequests.newRequest.itemOwner', { item: this.catalogTabs.applications.capitalizedSingularTitle }), value: 'application.owner' },
        ];
      }
      if (this.selectedTab === 1) {
        return [
          { text: this.$t('governance.accessRequests.newRequest.itemName', { item: this.catalogTabs.entitlements.capitalizedSingularTitle }), value: 'entitlement.name' },
          { text: this.catalogTabs.applications.capitalizedSingularTitle, value: 'application' }, // TODO: determine if this needs to be application.name
          { text: this.$t('governance.accessRequests.newRequest.itemOwner', { item: this.catalogTabs.applications.capitalizedSingularTitle }), value: 'application.owner' },
          { text: this.$t('governance.accessRequests.newRequest.itemOwner', { item: this.catalogTabs.entitlements.capitalizedSingularTitle }), value: 'entitlement.owner' },
        ];
      }
      return [
        { text: this.$t('governance.accessRequests.newRequest.itemName', { item: this.catalogTabs.roles.capitalizedSingularTitle }), value: 'role.name' },
      ];
    },
    tabType() {
      return PluralizeSingular(Object.keys(this.catalogTabs)[this.selectedTab]);
    },
  },
  mounted() {
    this.searchCatalog();
  },
  methods: {
    /**
     * Called on selecting one or more applications in entitlement view
     * @param {Array} applicationFilter Currently selected application(s)
     */
    filterByApplication(applicationFilter) {
      this.applicationFilter = applicationFilter;
      this.searchCatalog({ applicationFilter });
    },
    /**
     * Called on confirming from filter modal
     * @param {Object} filter Built filter
     */
    filterResults(filter) {
      // TODO: For Application Filter Modal
      console.log(filter);
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
      };
      const { itemType } = Object.values(this.catalogTabs)[this.selectedTab];
      this.$emit('search:catalog', itemType, searchParams);
    },
    /**
     * Search for applications using the searchValue
     * @param {String} searchValue value in field at the time of debounce resolution
     */
    filterByApplicationSearch(searchValue) {
      this.$emit('search:applications', searchValue);
    },
    /**
     * debounces every half second a search requests using the searchValue
     * @param {String} searchValue value in search field at the time of debounce resolution
     */
    searchFieldChange(searchValue) {
      debounce(this.searchCatalog({ searchValue }), 500);
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
    // TODO: create tests
    /**
     * Shows filter builder modal
     */
    showFilterModal() {
      this.$root.$emit('bv::show::modal', 'filterModal');
    },
    /**
     * Resets sort field, page, sort direction, and search value and sends off search request
     */
    tabChange() {
      this.searchCatalog({
        sortField: `${this.tabType}.name`,
        page: 1,
        sortDir: 'desc',
        searchValue: '',
      });
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
</style>

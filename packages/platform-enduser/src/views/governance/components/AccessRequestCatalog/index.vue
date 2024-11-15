<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <div class="mb-4">
      <FrPageHeader
        :title="$t('governance.accessRequest.newRequest.catalogTitle')"
        :subtitle="$t('governance.accessRequest.newRequest.catalogSubtitle')" />
      <FrSODViolationMessage
        v-if="!isEmpty(sodError)"
        @submit-with-violation="$emit('submit-with-violation')"
        :prevent-request-with-violation="preventRequestWithViolation"
        :sod-error="sodError" />
    </div>
    <BTabs
      :value="selectedTab"
      class="my-4"
      content-class="mt-4"
      lazy
      @input="selectedTab = $event; tabChange()">
      <template
        v-for="(catalogCategory, key) in catalogTabs"
        :key="key">
        <BTab
          class="p-0"
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
                      <img
                        :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: option.value })"
                        height="24"
                        width="24"
                        class="mr-2 align-self-center"
                        :onerror="onImageError"
                        :src="option.icon">
                      <BMediaBody class="pl-1">
                        <div
                          class="mb-1 text-dark"
                          tabindex="0">
                          {{ option.title }}
                        </div>
                        <div class="text-muted">
                          {{ option.subtitle }}
                        </div>
                      </BMediaBody>
                    </BMedia>
                    <span
                      class="multiselect__tag-icon"
                      tabindex="0"
                      :aria-label="$t('common.remove')"
                      @click.prevent="remove(option)"
                      @keydown.enter="remove(option)" />
                  </span>
                </template>
                <template #option="{ option }">
                  <BMedia no-body>
                    <img
                      :alt="$t('governance.resource.assignResourceModal.appLogoAltText', { appName: option.value })"
                      height="24"
                      width="24"
                      class="mr-2 align-self-center"
                      :onerror="onImageError"
                      :src="option.icon">
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
                  icon-class="mr-2"
                  name="filter_list">
                  {{ $t('governance.accessRequest.newRequest.filters') }}
                </FrIcon>
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
                    :selected-item="sortKeys"
                    :sort-by-options="sortByOptions"
                    @sort-field-change="searchCatalog({ sortKeys: $event, page: 1 })"
                    @sort-direction-change="searchCatalog({ sortDir: $event, page: 1 })" />
                </BButtonToolbar>
                <FrSpinner v-if="loading" />
                <BRow
                  v-else
                  :id="`${key}Grid`">
                  <template
                    v-for="(item, itemKey) in catalogItems"
                    :key="itemKey">
                    <BCol
                      cols="12"
                      lg="6"
                      xl="4"
                      class="mb-4">
                      <BCard
                        class="h-100 shadow-none cursor-pointer hover-blue-border"
                        no-body
                        role="button"
                        tabindex="0"
                        @keydown.enter="openItemDetails(item)"
                        @click="openItemDetails(item)"
                      >
                        <BCardBody class="d-flex">
                          <BMedia
                            body-class="overflow-hidden"
                            class="overflow-hidden">
                            <img
                              v-if="selectedTab < 2"
                              height="28"
                              class="mb-3"
                              :alt="item.appType || $t('governance.accessRequest.newRequest.role')"
                              :onerror="onImageError"
                              :src="item.icon">
                            <div
                              v-else
                              class="rounded-circle bg-lightblue color-blue d-flex align-items-center justify-content-center mb-3 size-28">
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
                              icon-class="mr-2 text-success"
                              name="check">
                              {{ $t('governance.accessRequest.newRequest.added') }}
                            </FrIcon>
                          </template>
                          <span
                            v-else
                            class="hover-underline color-blue"
                            @click="openItemDetails(item)">
                            <FrIcon
                              icon-class="mr-2"
                              name="add">
                              {{ $t('governance.accessRequest.newRequest.request') }}
                            </FrIcon>
                          </span>
                        </BCardFooter>
                      </BCard>
                    </BCol>
                  </template>
                </BRow>
                <FrPagination
                  v-if="totalCount > 10"
                  :value="page"
                  :per-page="pageSize"
                  :total-rows="totalCount"
                  @input="searchCatalog({ page: $event })"
                  @on-page-size-change="searchCatalog({ pageSize: $event, page: 1 })" />
              </template>
            </div>
          </template>
        </BTab>
      </template>
    </BTabs>
    <VeeForm
      v-slot="{ meta: { valid } }"
      as="span">
      <BModal
        id="filterModal"
        no-close-on-backdrop
        no-close-on-esc
        size="lg"
        title-class="h5"
        title-tag="h2"
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
            :disabled="!valid"
            @click="ok">
            {{ $t('common.apply') }}
          </BButton>
        </template>
      </BModal>
    </VeeForm>

    <FrItemDetailsModal
      :glossary-schema="currentGlossarySchema"
      :item="selectedItem"
      :item-type="tabType"
      @modal-closed="selectedItem = {}"
      @toggle-item="toggleItemInCart"
    />
  </BContainer>
</template>

<script>
import {
  capitalize,
  cloneDeep,
  debounce,
  isEmpty,
} from 'lodash';
import {
  BBadge,
  BButton,
  BButtonToolbar,
  BCard,
  BCardBody,
  BCardFooter,
  BCol,
  BContainer,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { Form as VeeForm } from 'vee-validate';
import FrCertificationFilter from '@forgerock/platform-shared/src/components/filterBuilder/CertificationFilter';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrPageHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrSortDropdown from '@forgerock/platform-shared/src/components/governance/SortDropdown';
import FrItemDetailsModal from './modals/ItemDetailsModal/ItemDetailsModal';
import FrSODViolationMessage from './modals/SODViolationMessage';

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
    BMedia,
    BMediaBody,
    BModal,
    BRow,
    BTab,
    BTabs,
    FrCertificationFilter,
    FrField,
    FrIcon,
    FrItemDetailsModal,
    FrNoData,
    FrPageHeader,
    FrPagination,
    FrSearchInput,
    FrSODViolationMessage,
    FrSortDropdown,
    FrSpinner,
    VeeForm,
  },
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
    glossarySchema: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: true,
    },
    preventRequestWithViolation: {
      type: Boolean,
      default: false,
    },
    sodError: {
      type: Object,
      default: () => ({}),
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
          capitalizedTitle: pluralizeValue(capitalize(this.$t('governance.accessRequest.newRequest.application'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequest.newRequest.application')),
          lowercaseTitle: pluralizeValue(this.$t('governance.accessRequest.newRequest.application')),
          itemType: 'accountGrant',
        },
        entitlement: {
          capitalizedTitle: pluralizeValue(capitalize(this.$t('governance.accessRequest.newRequest.entitlement'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequest.newRequest.entitlement')),
          lowercaseTitle: pluralizeValue(this.$t('governance.accessRequest.newRequest.entitlement')),
          itemType: 'entitlementGrant',
        },
        role: {
          capitalizedTitle: pluralizeValue(capitalize(this.$t('governance.accessRequest.newRequest.role'))),
          capitalizedSingularTitle: capitalize(this.$t('governance.accessRequest.newRequest.role')),
          lowercaseTitle: pluralizeValue(this.$t('governance.accessRequest.newRequest.role')),
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
      selectedItem: {},
      selectedTab: 0,
      sortDir: 'desc',
      sortKeys: 'application.name',
    };
  },
  computed: {
    applicationFilterOptions() {
      return this.applicationSearchResults.map((application) => ({
        value: application.id,
        title: application.name,
        subtitle: getApplicationDisplayName(application),
        icon: getApplicationLogo(application),
      }));
    },
    currentGlossarySchema() {
      return this.glossarySchema[this.tabType];
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
    isEmpty,
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
    onImageError,
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
        sortKeys: this.sortKeys,
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
        sortKeys: `${sortFieldMap[this.tabType]}.name`,
      });
    },
    /**
     * Adds or removes selected catalog item in request cart
     * @param {Object} item metadata of item to add or remove from cart (only id is used for remove)
     */
    toggleItemInCart(item, requestData) {
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
          assignmentId: item.assignmentId,
          requestData,
        };
        this.$emit('add-item-to-cart', emitItem);
      }
    },
    /**
     * Open details for current item
     * @param {Object} item metadata of item
     */
    openItemDetails(item) {
      this.selectedItem = item;
      this.$bvModal.show('accessRequestItemModal');
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

<!-- Copyright (c) 2019-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div :class="['p-3 d-flex justify-content-between flex-column flex-lg-row card-header', { 'flex-lg-row-reverse': reverseToolbar }]">
      <div class="btn-group mb-3 mb-lg-0 mr-lg-1">
        <slot name="listToolbar" />
      </div>
      <div
        v-if="showDivider"
        class="toolbar-divider mx-lg-3 d-none d-lg-block" />
      <FrSearchInput
        :value="filter"
        v-if="searchEnabled"
        :placeholder="$t('common.search')"
        @clear="clear"
        @search="search"
        @input="filterChange"
        @search-input-focus="setHelpTextFromSearchLength"
        @search-input-blur="removeHelpText"
        class="w-50"
        :class="{'fr-search-focus': hasFocus, 'flex-grow-1': showDivider}">
        <template #append>
          <BInputGroupText>
            <small
              role="searchbox"
              class="d-none d-md-block text-muted"
              :class="{'pr-3': filter.length > 0, 'mr-3': filter.length > 0}">
              <div :class="{'text-danger': submitBeforeLengthValid, shake: submitBeforeLengthValid}">
                {{ searchHelpText }}
              </div>
            </small>
          </BInputGroupText>
        </template>
      </FrSearchInput>
    </div>
    <div
      v-if="isLoading"
      data-testid="loading-resources-spinner">
      <FrSpinner class="py-5" />
      <div class="text-center pb-4">
        {{ $t('listResource.loadingResource', { resourceName: pluralizeValue(this.resourceTitle || resourceName) }) }}
      </div>
    </div>
    <div
      v-else-if="!tableData.length && !(queryThreshold > 0 && !noData && !tableData.length)"
      class="col-lg-8 offset-lg-2"
      data-testid="no-resources-found">
      <slot name="noResourcesFound">
        <div class="text-center mt-2 mb-5 py-5">
          <FrIcon
            icon-class="fr-no-data-icon md-48 text-secondary opacity-20 mt-4 mb-2"
            :name="managedIcon" />
          <h5>{{ $t('listResource.noManaged', { capitalizedResourceName: getTranslation(capitalizedResourceName) }) }}</h5>
          <p class="mb-4">
            {{ $t('listResource.noResultsHelp') }}
          </p>
        </div>
      </slot>
    </div>
    <BTable
      v-show="tableData.length && !isLoading"
      class="mb-0"
      hover
      id="list-resource-table"
      responsive
      show-empty
      :empty-text="$t('common.noRecordsToShow')"
      :fields="columns"
      :items="tableData"
      :no-local-sorting="true"
      v-model:sort-by="sortBy"
      v-model:sort-desc="sortDesc"
      :sort-direction="sortDirection"
      :data-testid="testid"
      @row-clicked="$emit('row-clicked', $event)"
      @sort-changed="sortingChanged">
      <template #cell(actions)="{ item }">
        <template v-if="editAccess || deleteAccess || hasClearSessionAccess(item)">
          <FrActionsCell
            :delete-option="deleteAccess"
            :divider="editAccess || hasClearSessionAccess(item)"
            :edit-option="editAccess"
            @delete-clicked="showDeleteResourceModal(item._id)"
            @edit-clicked="$emit('row-clicked', item)">
            <template
              v-if="hasClearSessionAccess(item)"
              #custom-top-actions>
              <BDropdownItem @click="setResourceToClearSessionsFor(item)">
                <FrIcon
                  icon-class="mr-3"
                  name="clear_all">
                  {{ $t('common.endSessions') }}
                </FrIcon>
              </BDropdownItem>
            </template>
          </FrActionsCell>
        </template>
      </template>
      <template
        v-for="(key, slotName) in $slots"
        #[slotName]="slotData">
        <!-- @slot Custom cell slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </BTable>

    <FrPagination
      v-if="tableData && tableData.length > 0 && !isLoading"
      :value="paginationPage"
      aria-controls="list-resource-table"
      :page-sizes="pageSizes"
      :hide-page-size-selector="hidePageSizeSelector"
      :hide-go-to-first-page-button="hideGoToFirstPageButton"
      :per-page="paginationPageSize"
      :prev-class="prevClass"
      :last-page="lastPage"
      :total-rows="tableDataTotalRows"
      :dataset-size="datasetSize"
      @input="paginationChange"
      @on-page-size-change="pageSizeChange"
    />

    <slot name="deleteResourceModal">
      <FrDeleteModal
        :translated-item-type="getTranslation(resourceTitle || resourceName)"
        @delete-item="deleteResource" />
    </slot>

    <slot name="clearSessionsModal">
      <FrClearResourceSessions
        :show="showClearSessionsModal"
        :resource-name="resourceToClearSessionsForName"
        @clear-sessions="clearSessionsAndCloseModal"
        @close-modal="closeClearSessionsModal" />
    </slot>
  </div>
</template>

<script>
import {
  capitalize,
  isNull,
  isUndefined,
} from 'lodash';
import {
  BDropdownItem,
  BInputGroupText,
  BTable,
  VBModal,
} from 'bootstrap-vue';
import pluralize from 'pluralize';
import Vue from 'vue';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrDeleteModal from '@forgerock/platform-shared/src/components/DeleteModal';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { generateSearchQuery } from '@forgerock/platform-shared/src/utils/queryFilterUtils';
import { DatasetSize } from '@forgerock/platform-shared/src/components/Pagination/types';
import FrClearResourceSessions from '../ClearResourceSessions';

Vue.directive('b-modal', VBModal);
/**
 * @description Controlling component for delegated admin, allows for listing available resources and connects to the create, delete and edit features.
 *
 * @fires GET resourceType/resourceName?_queryFilter=filter&_pageSize=10&_totalPagedResultsPolicy=EXACT (e.g. managed/user?_queryFilter=true&_pageSize=10&_totalPagedResultsPolicy=EXACT) -
 * List resource items, limited to 10 returned items and makes use of a query filter search if provided (defaults to queryFilter = true if none provided by the user).
 */
export default {
  name: 'ListResource',
  mixins: [
    NotificationMixin,
    ResourceMixin,
    TranslationMixin,
  ],
  components: {
    BDropdownItem,
    BInputGroupText,
    BTable,
    FrActionsCell,
    FrDeleteModal,
    FrIcon,
    FrSearchInput,
    FrSpinner,
    FrClearResourceSessions,
    FrPagination,
  },
  directives: {
    'b-modal': VBModal,
  },
  props: {
    actionsEnabled: {
      default: true,
      type: Boolean,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    /**
     * Determines the size of the dataset to change the pagination style, small by default, posible values
     * 'sm' for small, 'lg' for large, 'cm' for custom. See {@link @forgerock/platform-shared/src/components/Pagination}
     */
    canClearSessions: {
      type: Boolean,
      default: false,
    },
    datasetSize: {
      type: String,
      default: DatasetSize.LARGE,
    },
    deleteAccess: {
      type: Boolean,
      default: true,
    },
    editAccess: {
      type: Boolean,
      default: true,
    },
    hideGoToFirstPageButton: {
      type: Boolean,
      default: true,
    },
    hidePageSizeSelector: {
      type: Boolean,
      default: false,
    },
    routerParameters: {
      type: Object,
      default: () => ({}),
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    /*
     * specifies the total number of rows of the list resource, 0 by default, this value determines how
     * the pagination component is displayed, if falsey loads the on demand pagination
     */
    tableDataTotalRows: {
      type: Number,
      default: 0,
    },
    propColumns: {
      type: Array,
      default: () => [],
    },
    lastPage: {
      type: Boolean,
      default: true,
    },
    queryThreshold: {
      type: Number,
      default: 0,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    resourceTitle: {
      type: String,
      default: '',
    },
    managedIcon: {
      type: String,
      default: '',
    },
    /**
     * Minimum page size for table
     */
    minimumPageSize: {
      type: Number,
      default: 10,
    },
    showDivider: {
      type: Boolean,
      default: false,
    },
    noData: {
      type: Boolean,
      default: false,
    },
    reverseToolbar: {
      type: Boolean,
      default: false,
    },
    searchEnabled: {
      default: true,
      type: Boolean,
    },
    testid: {
      type: String,
      default: '',
    },
    prevClass: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      resourceName: this.routerParameters.resourceName,
      isRowSelected: false,
      columns: [],
      displayFields: [],
      sortBy: null,
      sortDesc: false,
      filter: '',
      paginationPage: 1,
      paginationPageSize: this.minimumPageSize,
      resourceToDeleteId: '',
      sortDirection: 'asc',
      showClearSessionsModal: false,
      resourceToClearSessionsForId: '',
      resourceToClearSessionsForName: '',
      searchHasFocus: true,
    };
  },
  computed: {
    defaultSort() {
      // queryThreshold means we do not want to sort desc on the first grid column when there is no filter
      if (this.queryThreshold && this.filter === '') {
        return '';
      }
      // sort on first grid column if available
      return this.columns[0] ? this.columns[0].key : '';
    },
    capitalizedResourceName() {
      return pluralize(capitalize(this.resourceTitle || this.resourceName));
    },
    pageSizes() {
      return [...new Set([this.minimumPageSize, ...[10, 20, 50, 100]])].filter((pageSize) => pageSize >= this.minimumPageSize);
    },
  },
  mounted() {
    this.resourceName = this.getResourceName(this.routerParameters.resourceName);
    if (this.propColumns.length) {
      this.displayFields = this.propColumns.map((obj) => obj.key);
      this.columns = this.propColumns;
    } else {
      this.loadTableDefs();
    }
    if (this.actionsEnabled) {
      /*
        * Push a final column for the "actions" menu.
        * Empty label is intended.
        */
      this.columns.push({
        key: 'actions',
        label: '',
      });
    }
    this.loadData('true', this.displayFields, this.defaultSort, 1, this.paginationPageSize);
  },
  watch: {
    currentPage(value) {
      this.paginationPage = value;
    },
    tableData() {
      // if there is a queryThreshold and there is a filter we want to allow sorting
      this.columns = this.columns.map((col) => {
        if (col.key !== 'actions' && this.queryThreshold) {
          col.sortable = this.filter.length >= this.queryThreshold;
        }

        return col;
      });
    },
    /**
     * Regenerates which columns are shown and queries data using these fields
     */
    propColumns(newVal, oldVal) {
      if (newVal.length) {
        this.displayFields = newVal.map((obj) => obj.key);
        this.columns = newVal;
        if (oldVal.length) {
          this.loadData(generateSearchQuery(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.defaultSort, this.paginationPage, this.paginationPageSize);
        }
      }
    },
  },
  methods: {
    pluralizeValue,
    filterChange(filter) {
      this.filter = filter;
      this.setHelpTextFromSearchLength();
    },
    getResourceName(resourceName) {
      if (isUndefined(resourceName)) {
        return this.$route?.params?.resourceName;
      }
      return resourceName;
    },
    /**
     * Sets up sorting for API call URL, considering ascending/descending
     *
     * @param {boolean} sortDesc - Required toggle on if we are sorting in descending order
     * @param {string} sortBy - Required name of field to sort table on
     */
    calculateSort(sortDesc, sortBy) {
      let sortUrl = null;

      if (!isNull(sortBy)) {
        if (sortDesc) {
          sortUrl = `${sortBy}`;
        } else {
          sortUrl = `-${sortBy}`;
        }
      }
      return sortUrl;
    },
    /**
     * Reloads data after search box filter text is cleared
     */
    clear() {
      this.filter = '';
      this.sortBy = null;
      this.sortDesc = false;
      this.paginationPage = 1;
      this.paginationPageSize = 10;

      this.$emit('clear-table');
      this.loadData('true', this.displayFields, this.defaultSort, this.paginationPage, this.paginationPageSize);
    },
    /**
     * Emits out request to obtain data based on current query parameters
     * @param {string} filter the query filter we want to use (defaults to true)
     * @param {array} fields List of fields to query for
     * @param {string} sortField field to sort results on
     * @param {number} page The current table page for results offset
     * @param {number} pageSize The current page size for limit the number of results
     */
    loadData(filter, fields, sortField, page, pageSize) {
      // only emit `get-table-data` event when either there is not queryThreshold or the filter has met the threshold
      if (!this.queryThreshold || (this.queryThreshold && this.filter === '') || (this.queryThreshold && this.filter.length >= this.queryThreshold)) {
        const params = {
          filter,
          fields,
          page,
          pageSize,
        };
        if (!this.queryThreshold || sortField) {
          params.sortField = (sortField && sortField !== '-') ? sortField : fields[0];
        }
        this.$emit('get-table-data', params);
      }
    },
    /**
     * Builds table column definitions using menu item parameters
     */
    loadTableDefs() {
      this.displayFields = [];
      this.columns = [];
      if (this.routerParameters && this.routerParameters.order) {
        this.routerParameters.order.forEach((columnName) => {
          const column = this.routerParameters.managedProperties[columnName];
          if (column
            && ['string', 'boolean', 'number'].includes(column.type)
            && this.displayFields.length < 4
            && column.searchable
          ) {
            this.displayFields.push(columnName);
            this.columns.push({
              key: columnName,
              label: this.getTranslation(column.title),
              sortable: true,
              sortDirection: 'desc',
            });
          }
        });
      }
    },
    /*
     * @description listener of the on-page-size-change event emmited by the pagination component when the size of
     * results is changed
     */
    pageSizeChange(pageSize) {
      this.paginationPage = 1;
      this.paginationPageSize = pageSize;
      this.paginationChange(1);
    },
    /**
     * Repulls data based on new table page
     */
    paginationChange(page) {
      this.paginationPage = page;
      this.loadData(generateSearchQuery(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.calculateSort(this.sortDesc, this.sortBy), this.paginationPage, this.paginationPageSize);
    },
    cancelDelete() {
      this.resourceToDeleteId = '';
    },
    showDeleteResourceModal(id) {
      this.resourceToDeleteId = id;
      this.$root.$emit('bv::show::modal', 'deleteModal');
    },
    deleteResource() {
      this.$emit('delete-resource', this.resourceToDeleteId);
      this.$root.$emit('bv::hide::modal', 'deleteModal');
      this.resourceToDeleteId = '';
    },
    /**
     * Repulls data based on input search box text
     */
    search() {
      if (this.filter === '') {
        this.submitBeforeLengthValid = false;
        this.clear();
        return;
      }
      this.paginationPage = 1;
      if (this.filter.length >= this.queryThreshold) {
        this.submitBeforeLengthValid = false;
        this.loadData(generateSearchQuery(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.calculateSort(this.sortDesc, this.sortBy), this.paginationPage, this.paginationPageSize);
      } else {
        this.submitBeforeLengthValid = true;
      }
    },
    /**
     * Repulls data based on new sort, and returns table to first page
     *
     * @param {object} sort - Required object containing sort metadata
     */
    sortingChanged(sort) {
      this.paginationPage = 1;
      const sortUrl = this.calculateSort(sort.sortDesc, sort.sortBy);
      this.$emit('sort', sortUrl);

      this.loadData(generateSearchQuery(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, sortUrl, this.paginationPage, this.paginationPageSize);
    },
    hasClearSessionAccess(item) {
      return this.canClearSessions && item.hasActiveSessions === true;
    },
    /**
     * Uses a resource to populate and show the clear sessions modal
     *
     * @param {Object} resource the resource to show the clear sessions modal for
     */
    setResourceToClearSessionsFor(resource) {
      this.resourceToClearSessionsForId = resource._id;
      this.resourceToClearSessionsForName = `${resource.givenName} ${resource.sn}`;
      this.showClearSessionsModal = true;
    },
    /**
     * Hides the clear sessions modal
     */
    closeClearSessionsModal() {
      this.resourceToClearSessionsForId = '';
      this.resourceToClearSessionsForName = '';
      this.showClearSessionsModal = false;
    },
    /**
     * Triggers clearing sessions for the selected resource,
     * closes the modal and refreshes the table data
     */
    clearSessionsAndCloseModal() {
      this.$emit('clear-resource-sessions', this.resourceToClearSessionsForId);
      this.closeClearSessionsModal();
      this.loadData(generateSearchQuery(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.defaultSort, this.paginationPage, this.paginationPageSize);
    },
  },
};
</script>
<style lang="scss" scoped>
  :deep(.table tr:not(.b-table-empty-row) td) {
    cursor: pointer;
  }

  .toolbar-divider {
    background-color: $gray-200;
    width: 1px;
  }

  .fr-icon-input-right {
    margin-top: 5px;
  }

  .input-group-text {
    border: none;
  }

  .shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }
</style>

<!-- Copyright (c) 2019-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="p-3 d-flex justify-content-between flex-column flex-lg-row card-header">
      <div class="btn-group mb-3 mb-lg-0 mr-lg-1">
        <slot name="listToolbar" />
      </div>
      <div
        v-if="showDivider"
        class="toolbar-divider mx-lg-3 d-none d-lg-block" />
      <FrSearchInput
        v-model="filter"
        :placeholder="$t('common.search')"
        @clear="clear"
        @search="search"
        @input="setHelpTextFromSearchLength"
        @search-input-focus="setHelpTextFromSearchLength"
        @search-input-blur="removeHelpText"
        class="w-50"
        :class="{'fr-managed-search-focus': hasFocus, 'flex-grow-1': showDivider}">
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
    <div v-if="isLoading">
      <FrSpinner class="py-5" />
      <div class="text-center pb-4">
        Loading {{ this.resourceTitle || resourceName | pluralizeFilter }}...
      </div>
    </div>
    <div
      v-else-if="!tableData.length & !(queryThreshold > 0 && !noData && !tableData.length)"
      class="col-lg-8 offset-lg-2">
      <div
        class="text-center mt-2 mb-5 py-5">
        <FrIcon
          class="fr-no-data-icon material-icons material-icons-outlined md-48 text-secondary opacity-20 mt-4 mb-2"
          :name="managedIcon"
          aria-hidden="true" />
        <h5>{{ $t('listResource.noManaged', { capitalizedResourceName }) }}</h5>
        <p class="mb-4">
          {{ $t('listResource.noResultsHelp') }}
        </p>
        <slot />
      </div>
    </div>
    <BTable
      v-show="tableData.length && !isLoading"
      class="mb-0"
      show-empty
      :fields="columns"
      :hover="tableHover"
      :items="tableData"
      :no-local-sorting="true"
      :per-page="0"
      :responsive="true"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :sort-direction="sortDirection"
      @row-clicked="$emit('row-clicked', $event)"
      @sort-changed="sortingChanged">
      <template v-slot:cell(actions)="data">
        <slot
          name="actions"
          :item="data">
          <div
            class="text-right"
            v-if="editAccess || deleteAccess || hasClearSessionAccess(data)">
            <BDropdown
              variant="link"
              no-caret
              boundary="window"
              right
              toggle-class="text-decoration-none p-0">
              <template v-slot:button-content>
                <i class="material-icons-outlined text-muted md-24">
                  more_horiz
                </i>
              </template>
              <BDropdownItem
                v-if="editAccess"
                @click="$emit('row-clicked', data.item)">
                <i
                  class="material-icons-outlined mr-3"
                  aria-hidden="true">
                  edit
                </i> {{ $t('common.edit') }}
              </BDropdownItem>
              <BDropdownItem
                v-if="hasClearSessionAccess(data)"
                @click="setResourceToClearSessionsFor(data.item)">
                <i
                  class="material-icons-outlined mr-3"
                  aria-hidden="true">
                  clear_all
                </i> {{ $t('common.endSessions') }}
              </BDropdownItem>
              <template v-if="deleteAccess">
                <template v-if="editAccess || hasClearSessionAccess(data)">
                  <BDropdownDivider />
                </template>
                <BDropdownItem @click="confirmDeleteResource(data.item._id)">
                  <i
                    class="material-icons-outlined mr-3"
                    aria-hidden="true">
                    delete
                  </i> {{ $t('common.delete') }}
                </BDropdownItem>
              </template>
            </BDropdown>
          </div>
        </slot>
      </template>
      <template
        v-for="(key, slotName) in $scopedSlots"
        v-slot:[slotName]="slotData">
        <!-- @slot Custom cell slot. -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </BTable>
    <FrPagination
      v-if="tableData && tableData.length > 0 && !isLoading"
      :current-page="currentPage"
      :last-page="lastPage"
      @pagination-change="paginationChange" />

    <slot name="deleteResourceModal">
      <FrDeleteResource
        :resource-to-delete-id="resourceToDeleteId"
        :resource-display-name="resourceTitle || resourceName"
        @delete-resource="deleteResource"
        @cancel-resource-deletion="cancelDelete" />
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
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
  BInputGroupText,
  BTable,
  VBModal,
} from 'bootstrap-vue';
import pluralize from 'pluralize';
import Vue from 'vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import FrPagination from '@forgerock/platform-shared/src/components/DataTable/Pagination';
import PluralizeFilter from '@forgerock/platform-shared/src/filters/PluralizeFilter';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrDeleteResource from '../DeleteResource';
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
  ],
  components: {
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    BInputGroupText,
    BTable,
    FrIcon,
    FrPagination,
    FrSearchInput,
    FrSpinner,
    FrClearResourceSessions,
    FrDeleteResource,
  },
  directives: {
    'b-modal': VBModal,
  },
  props: {
    deleteAccess: {
      type: Boolean,
      default: true,
    },
    editAccess: {
      type: Boolean,
      default: true,
    },
    canClearSessions: {
      type: Boolean,
      default: false,
    },
    routerParameters: {
      type: Object,
      default: () => {},
    },
    tableData: {
      type: Array,
      default: () => [],
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
    showDivider: {
      type: Boolean,
      default: false,
    },
    noData: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resourceName: this.routerParameters.resourceName,
      isRowSelected: false,
      tableHover: true,
      columns: [],
      displayFields: [],
      currentPage: 0,
      sortBy: null,
      sortDesc: false,
      filter: '',
      resourceToDeleteId: '',
      sortDirection: 'asc',
      showClearSessionsModal: false,
      resourceToClearSessionsForId: '',
      resourceToClearSessionsForName: '',
      searchHasFocus: true,
      searchHelpText: '',
      submitBeforeLengthValid: false,
      hasFocus: false,
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
  },
  filters: {
    PluralizeFilter,
  },
  mounted() {
    this.resourceName = this.getResourceName(this.routerParameters.resourceName);
    if (this.propColumns.length) {
      this.displayFields = this.propColumns.map((obj) => obj.key);
      this.columns = [
        ...this.propColumns,
        {
          key: 'actions',
          label: '',
        },
      ];
    } else {
      this.loadTableDefs();
    }
    this.loadData('true', this.displayFields, this.defaultSort, 0);
  },
  watch: {
    tableData() {
      // if there is a queryThreshold and there is a filter we want to allow sorting
      this.columns = this.columns.map((col) => {
        if (col.key !== 'actions') {
          col.sortable = !this.queryThreshold || (this.filter.length >= this.queryThreshold);
        }

        return col;
      });
    },
  },
  methods: {
    getResourceName(resourceName) {
      if (isUndefined(resourceName)) {
        return this.$route.params.resourceName;
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
      this.currentPage = 0;

      this.$emit('clear-table');
      this.loadData('true', this.displayFields, this.defaultSort, this.currentPage);
    },
    /**
     * Emits out request to obtain data based on current query parameters
     * @param {string} filter the query filter we want to use (defaults to true)
     * @param {array} fields List of fields to query for
     * @param {string} sortField field to sort results on
     * @param {number} page The current table page for results offset
     */
    loadData(filter, fields, sortField, page) {
      // only emit `get-table-data` event when either there is not queryThreshold or the filter has met the threshold
      if (!this.queryThreshold || (this.queryThreshold && this.filter === '') || (this.queryThreshold && this.filter.length >= this.queryThreshold)) {
        this.$emit('get-table-data', {
          filter,
          fields,
          sortField,
          page,
        });
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
              label: column.title,
              sortable: true,
              sortDirection: 'desc',
            });
          }
        });

        /*
         * Push a final column for the "actions" menu.
         * Empty label is intended.
         */
        this.columns.push({
          key: 'actions',
          label: '',
        });
      }
    },
    /**
     * Repulls data based on new table page
     *
     * @param {number} page - Required integer number specifying which table page we are viewing
     */
    paginationChange(page) {
      this.currentPage = page;
      this.loadData(this.generateSearch(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.calculateSort(this.sortDesc, this.sortBy), page);
    },
    cancelDelete() {
      this.resourceToDeleteId = '';
    },
    confirmDeleteResource(id) {
      this.resourceToDeleteId = id;
    },
    deleteResource() {
      this.$emit('delete-resource', this.resourceToDeleteId);
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
      this.sortBy = null;
      this.sortDesc = false;
      this.currentPage = 0;

      if (this.filter.length >= this.queryThreshold) {
        this.submitBeforeLengthValid = false;
        this.loadData(this.generateSearch(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.defaultSort, this.currentPage);
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
      this.currentPage = 0;

      this.loadData(this.generateSearch(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.calculateSort(sort.sortDesc, sort.sortBy), this.currentPage);
    },
    hasClearSessionAccess(rowData) {
      return this.canClearSessions && rowData.item.hasActiveSessions === true;
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
      this.loadData(this.generateSearch(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.defaultSort, this.currentPage);
    },
    /**
     * Change help text based on query threshold value and the current search text length
     */
    setHelpTextFromSearchLength() {
      this.hasFocus = true;

      if (!this.queryThreshold && this.filter.length === 0) {
        this.searchHelpText = '';
      } else if (this.filter.length < this.queryThreshold) {
        this.searchHelpText = this.$t('listResource.searchInProgressText', { queryThreshold: this.queryThreshold });
      } else {
        this.searchHelpText = this.$t('listResource.searchActiveText');
      }

      if (this.filter.length === 0) {
        this.submitBeforeLengthValid = false;
      } else if (this.filter.length >= this.queryThreshold) {
        this.submitBeforeLengthValid = false;
      }
    },
    removeHelpText() {
      this.hasFocus = false;
      this.searchHelpText = '';
    },
  },
};
</script>
<style lang="scss" scoped>
  /deep/ .table tr:not(.b-table-empty-row) td {
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

  .fr-managed-search-focus {
    box-shadow: 0 0 0 1pt $blue;
    outline: 0;
    border-radius: 5px;
  }
</style>

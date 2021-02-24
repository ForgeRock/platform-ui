<!-- Copyright (c) 2019-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="p-3 d-flex justify-content-between flex-column flex-lg-row card-header">
      <div class="btn-group mb-3 mb-lg-0 mr-lg-1">
        <slot name="listToolbar" />
      </div>
      <FrSearchInput
        v-model="filter"
        :placeholder="$t('common.search')"
        @clear="clear"
        @search="search" />
    </div>
    <BTable
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
      :current-page="currentPage"
      :last-page="lastPage"
      @pagination-change="paginationChange" />

    <slot name="deleteResourceModal">
      <FrDeleteResource
        modal-id="deleteResource"
        @resource-deleted="loadData('true', displayFields, defaultSort, currentPage)"
        @cancel-resource-deletion="clearSelection()"
        :resource-name="resourceName"
        :resource-type="resourceType"
        :resource-to-delete-id="resourceToDeleteId"
        :delete-managed-resource="deleteManagedResource"
        :delete-internal-resource="deleteInternalResource" />
    </slot>

    <slot name="clearSessionsModal">
      <FrClearResourceSessions
        :show="showClearSessionsModal"
        :resource-id="resourceToClearSessionsForId"
        :resource-name="resourceToClearSessionsForName"
        :clear-sessions="clearSessions"
        :close-modal="closeClearSessionsModal" />
    </slot>
  </div>
</template>

<script>
import {
  isNull,
  isUndefined,
} from 'lodash';
import {
  BDropdown,
  BDropdownDivider,
  BDropdownItem,
  BTable,
  VBModal,
} from 'bootstrap-vue';
import Vue from 'vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import SearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrPagination from '@forgerock/platform-shared/src/components/DataTable/Pagination';
import DeleteResource from '../DeleteResource';
import ClearResourceSessions from '../ClearResourceSessions';

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
    BTable,
    FrClearResourceSessions: ClearResourceSessions,
    FrDeleteResource: DeleteResource,
    FrPagination,
    FrSearchInput: SearchInput,
  },
  directives: {
    'b-modal': VBModal,
  },
  props: {
    deleteManagedResource: {
      type: Function,
      default: () => {
        const retv = {
          then: () => {},
        };
        return retv;
      },
    },
    deleteInternalResource: {
      type: Function,
      default: () => {
        const retv = {
          then: () => {},
        };
        return retv;
      },
    },
    clearSessions: {
      type: Function,
      default: () => {
        const retv = {
          then: () => {},
        };
        return retv;
      },
    },
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
  },
  data() {
    return {
      resourceName: this.routerParameters.resourceName,
      resourceType: this.routerParameters.resourceType,
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
    };
  },
  computed: {
    defaultSort() {
      return '';
    },
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

      this.loadData('true', this.displayFields, this.defaultSort, this.currentPage);
    },
    loadData(filter, fields, sortField, page) {
      this.$emit('getTableData', {
        filter,
        fields,
        sortField,
        page,
      });
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
    clearSelection() {
      this.resourceToDeleteId = '';
    },
    confirmDeleteResource(id) {
      this.resourceToDeleteId = id;
    },
    /**
     * Repulls data based on input search box text
     */
    search() {
      if (this.filter === '') {
        this.clear();
        return;
      }
      this.sortBy = null;
      this.sortDesc = false;
      this.currentPage = 0;

      this.loadData(this.generateSearch(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.defaultSort, this.currentPage);
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
     * Hides the clear sessions modal and refreshes the table data
     */
    closeClearSessionsModal() {
      this.resourceToClearSessionsForId = '';
      this.resourceToClearSessionsForName = '';
      this.showClearSessionsModal = false;
      this.loadData('true', this.displayFields, this.defaultSort, this.currentPage);
    },
  },
};
</script>
<style lang="scss" scoped>
  /deep/ .table tr:not(.b-table-empty-row) td {
    cursor: pointer;
  }
</style>

<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <div class="card">
      <div class="card-header py-2">
        <BRow>
          <BCol
            md="7"
            class="my-1">
            <slot
              name="listToolbar" />
          </BCol>
          <BCol
            md="5"
            class="my-1">
            <FrSearchInput
              @search="search"
              @clear="clear"
              :placeholder="$t('common.search')"
              v-model="filter"
            />
          </BCol>
        </BRow>
      </div>
      <BTable
        show-empty
        table-responsive
        stacked="lg"
        :items="tableData"
        :fields="columns"
        :per-page="0"
        :hover="tableHover"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :no-local-sorting="true"
        class="mb-0"
        sort-direction="asc"
        @row-clicked="$emit('rowClicked', $event)"
        @sort-changed="sortingChanged">
        <template v-slot:cell(actions)="data">
          <slot
            name="actions"
            :item="data">
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
              <BDropdownItem @click="editResource(data.item)">
                <i class="material-icons-outlined mr-3">
                  edit
                </i> {{ $t('common.edit') }}
              </BDropdownItem>
              <BDropdownItem
                @click="confirmDeleteResource(data.item._id)">
                <i class="material-icons-outlined mr-3">
                  delete
                </i> {{ $t('common.delete') }}
              </BDropdownItem>
            </BDropdown>
          </slot>
        </template>
      </BTable>
      <div class="card-footer py-2">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center mb-0">
            <li
              @click.prevent="currentPage === 1 ? '' : paginationChange(1)"
              :class="[{ disabled: currentPage === 1 }, 'page-item']">
              <a
                class="page-link"
                href="#">
                <i class="material-icons material-icons-outlined mr-2">
                  first_page
                </i>
              </a>
            </li>
            <li
              @click.prevent="currentPage === 1 ? '' : paginationChange(currentPage - 1)"
              :class="[{ disabled: currentPage === 1 }, 'page-item']">
              <a
                class="page-link"
                href="#">
                <i class="material-icons material-icons-outlined mr-2">
                  keyboard_arrow_left
                </i>
              </a>
            </li>
            <li
              @click.prevent="lastPage ? '' : paginationChange(currentPage + 1)"
              :class="[{ disabled: lastPage }, 'page-item']">
              <a
                class="page-link"
                href="#">
                <i class="material-icons material-icons-outlined mr-2">
                  keyboard_arrow_right
                </i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <slot name="deleteResourceModal">
      <FrDeleteResource
        modal-id="deleteResource"
        @resource-deleted="loadData('true', displayFields, null, 1)"
        @cancel-resource-deletion="clearSelection()"
        :resource-name="resourceName"
        :resource-type="resourceType"
        :resource-to-delete-id="resourceToDeleteId"
        :delete-managed-resource="deleteManagedResource"
        :delete-internal-resource="deleteInternalResource" />
    </slot>
  </div>
</template>

<script>
import {
  includes,
  isNull,
  each,
  isUndefined,
  isNaN,
  toNumber,
} from 'lodash';
import {
  BCol,
  BDropdown,
  BDropdownItem,
  BRow,
  BTable,
  VBModal,
} from 'bootstrap-vue';
import Vue from 'vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import SearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import DeleteResource from '../DeleteResource';

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
  ],
  components: {
    BCol,
    BDropdown,
    BDropdownItem,
    BRow,
    BTable,
    FrDeleteResource: DeleteResource,
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
    routerParameters: {
      type: Object,
      default: () => {},
    },
    tableData: {
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
      resourceName: this.$route.params.resourceName,
      resourceType: this.$route.params.resourceType,
      isRowSelected: false,
      tableHover: true,
      columns: [],
      displayFields: [],
      currentPage: 1,
      sortBy: null,
      sortDesc: false,
      filter: '',
      resourceToDeleteId: '',
    };
  },
  mounted() {
    this.resourceName = this.getResourceName(this.routerParameters.resourceName);
    this.loadTableDefs();
    this.loadData('true', this.displayFields, '', 1);
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
      this.currentPage = 1;

      this.loadData('true', this.displayFields, null, 1);
    },
    /**
     * Builds API URL using value in search box
     *
     * @param {string} filter - Required current value of search box
     * @param {array} displayFields - Required array of field names that we want to query on
     * @param {object} schemaProps - Required metadata of current schema
     */
    generateSearch(filter, displayFields, schemaProps) {
      let filterUrl = '';

      if (filter.length > 0) {
        each(displayFields, (field, index) => {
          let type = 'string';

          if (!isUndefined(schemaProps) && !isUndefined(schemaProps[field])) {
            // eslint-disable-next-line prefer-destructuring
            type = schemaProps[field].type;
          }

          if (type === 'number' && !isNaN(toNumber(filter))) {
            // Search based on number and proper number value
            if ((index + 1) < displayFields.length) {
              filterUrl = `${filterUrl}${field}+eq+ ${filter}+OR+`;
            } else {
              filterUrl = `${filterUrl}${field}+eq+ ${filter}`;
            }
          } else if (type === 'boolean' && (filter === 'true' || filter === 'false')) {
            // Search based on boolean and proper boolean true/false
            if ((index + 1) < displayFields.length) {
              filterUrl = `${filterUrl}${field}+eq+ ${filter}+OR+`;
            } else {
              filterUrl = `${filterUrl}${field}+eq+ ${filter}`;
            }
          } else if ((index + 1) < displayFields.length) {
            // Fallback to general string search if all other criteria fails
            filterUrl = `${filterUrl}${field}+sw+"${filter}"+OR+`;
          } else {
            filterUrl = `${filterUrl}${field}+sw+"${filter}"`;
          }
        });
      } else {
        filterUrl = 'true';
      }

      return filterUrl;
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
          if (includes(['string', 'boolean', 'number'], column.type)) {
            if (this.displayFields.length < 4 && column.viewable) {
              this.displayFields.push(columnName);
              this.columns.push({
                key: columnName,
                label: column.title,
                sortable: column.sortable,
                sortDirection: 'desc',
              });
            }
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
    /**
     * Attempts to pull up edit resource page for selected row if user has access
     *
     * @param {object} item - Required metaData of row clicked
     */
    editResource(item) {
      if (this.userCanUpdate) {
        this.$router.push({
          name: 'EditResource',
          params: {
            resourceName: this.resourceName,
            resourceType: this.resourceType,
            // eslint-disable-next-line no-underscore-dangle
            resourceId: item._id,
          },
        });
      } else {
        this.displayNotification('IDMMessages', 'error', this.$t('userflow.unableToEditResource', { resource: this.resourceName }));
      }
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
      this.currentPage = 1;

      this.loadData(this.generateSearch(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, null, 1);
    },
    /**
     * Repulls data based on new sort, and returns table to first page
     *
     * @param {object} sort - Required object containing sort metadata
     */
    sortingChanged(sort) {
      this.currentPage = 1;

      this.loadData(this.generateSearch(this.filter, this.displayFields, this.routerParameters.managedProperties), this.displayFields, this.calculateSort(sort.sortDesc, sort.sortBy), 1);
    },
  },
};
</script>

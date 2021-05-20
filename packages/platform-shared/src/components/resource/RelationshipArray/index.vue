<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="px-4 py-2 card-header">
      <BRow>
        <BCol
          v-show="!relationshipArrayProperty.readOnly || isOpenidmAdmin"
          class="my-1">
          <BButton
            variant="primary"
            class="mr-1"
            @click="openCreateModal"
            :id="'add_' + relationshipArrayProperty.key">
            <i
              class="material-icons mr-2"
              aria-hidden="true">
              add
            </i>
            {{ $t("common.addObject", {object: relationshipArrayProperty.title}) }}
          </BButton>
          <BButton
            v-show="selected.length > 0"
            variant="outline-primary"
            @click="$refs[removeModalId].show()"
            :id="'delete_' + relationshipArrayProperty.key">
            {{ $t("common.remove") }}
          </BButton>
        </BCol>
        <FrSearchInput
          v-if="showFilter && !disableSortAndSearch"
          v-model="filter"
          :placeholder="$t('common.search')"
          @clear="clear"
          @search="search" />
      </BRow>
    </div>

    <BTable
      show-empty
      ref="relationshipArrayGrid"
      table-responsive
      stacked="lg"
      :fields="columns"
      :items="gridData"
      :per-page="0"
      :hover="tableHover"
      :no-local-sorting="true"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :sort-direction="sortDirection"
      class="mb-0"
      :selectable="!relationshipArrayProperty.readOnly || isOpenidmAdmin"
      selected-variant="transparent"
      @row-clicked="resourceClicked"
      @row-selected="onRowSelected"
      @sort-changed="sortingChanged">
      <template v-slot:head(selected)>
        <div
          v-show="gridData.length > 0"
          class="cursor-pointer"
          @click="toggleSelectAll">
          <BFormCheckbox
            class="pl-3"
            disabled
            v-model="allRowsSelected">
            <span class="sr-only">
              {{ $t('common.select') }}
            </span>
          </BFormCheckbox>
        </div>
      </template>
      <template v-slot:cell(selected)="data">
        <BFormCheckbox
          class="pl-3"
          :id="'rowSelectCheckbox_' + relationshipArrayProperty.key + data.index"
          @change="onCheckboxClicked(data)"
          v-model="data.rowSelected">
          <span class="sr-only">
            {{ $t('common.selectSelection', { selection: data.item.name ? data.item.name: data.item._relationshipDetails.join(' ') }) }}
          </span>
        </BFormCheckbox>
      </template>
      <template v-slot:cell(_relationshipDetails)="data">
        <div
          class="media cursor-pointer"
          @click="resourceClicked(data.item)">
          <div class="media-body">
            <div class="text-bold">
              {{ data.value[0] }}
            </div>
            <div>
              <span
                v-for="(display, index) in data.value"
                :key="`displayField_${display}_${index}`"
                v-show="index !== 0"
                class="pr-1 text-muted">
                {{ display }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </BTable>
    <FrPagination
      v-if="gridData.length && gridData.length === gridPageSize || currentPage > 0"
      :current-page="currentPage"
      :last-page="lastPage"
      @pagination-change="paginationChange" />

    <BModal
      :id="createModalId"
      :ref="createModalId"
      :title="'Add ' + relationshipArrayProperty.title"
      size="lg">
      <FrRelationshipEdit
        :parent-resource="parentResource"
        :relationship-property="relationshipArrayProperty"
        :index="0"
        @setValue="addNewRelationship" />

      <div
        slot="modal-footer"
        class="w-100">
        <div class="float-right">
          <BButton
            variant="link"
            class="text-danger"
            @click="$refs[createModalId].hide()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            variant="primary"
            :id="`save_new_${relationshipArrayProperty.key}`"
            @click="saveNewRelationships"
            :disabled="newRelationships.length === 0">
            {{ $t('common.save') }}
          </BButton>
        </div>
      </div>
    </BModal>

    <BModal
      :id="removeModalId"
      :ref="removeModalId"
      :title="$t('pages.access.removeModalTitle')">
      <div>
        {{ $t('pages.access.removeConfirm') }} {{ relationshipArrayProperty.title }}?
      </div>
      <div
        slot="modal-footer"
        class="w-100">
        <div class="float-right">
          <BButton
            variant="btn-link text-danger mr-2"
            @click="$refs[removeModalId].hide()">
            {{ $t('common.cancel') }}
          </BButton>
          <BButton
            variant="danger"
            @click="removeRelationships">
            {{ $t('common.remove') }}
          </BButton>
        </div>
      </div>
    </BModal>
  </div>
</template>

<script>
import {
  find,
  has,
  isNull,
  last,
  toArray,
  pick,
  map,
} from 'lodash';
import {
  BRow,
  BCol,
  BButton,
  BTable,
  BFormCheckbox,
  BModal,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import pluralize from 'pluralize';
import RelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrPagination from '@forgerock/platform-shared/src/components/DataTable/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';

export default {
  name: 'RelationshipArray',
  components: {
    FrRelationshipEdit: RelationshipEdit,
    FrPagination,
    BRow,
    BCol,
    BButton,
    BTable,
    BFormCheckbox,
    BModal,
    FrSearchInput,
  },
  mixins: [
    NotificationMixin,
    RestMixin,
    ResourceMixin,
  ],
  props: {
    revision: {
      type: String,
      default: '',
    },
    parentId: {
      type: String,
      required: true,
    },
    relationshipArrayProperty: {
      type: Object,
      required: true,
    },
    parentResource: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      gridPageSize: 10,
      allRowsSelected: false,
      tableHover: true,
      gridData: [],
      columns: [],
      currentPage: 0,
      sortBy: null,
      sortDesc: false,
      filter: '',
      lastPage: false,
      sortDirection: 'asc',
      createModalId: `create_${this.relationshipArrayProperty.propName}_modal`,
      removeModalId: `delete_${this.relationshipArrayProperty.propName}_modal`,
      newRelationships: [],
      selected: [],
      isOpenidmAdmin: this.$store.state.UserStore.adminUser,
      showFilter: false,
      disableSortAndSearch: false,
    };
  },
  mounted() {
    this.loadGrid(0);
  },
  watch: {
    gridData() {
      this.columns = this.columns.map((col) => {
        if (col.key !== 'selected') {
          col.sortable = !this.disableSortAndSearch;
        }

        return col;
      });
    },
  },
  methods: {
    stringify(a) {
      return JSON.stringify(a);
    },
    loadGrid(page) {
      const doLoad = (resourceCollectionSchema) => {
        this.getRequestService().get(this.buildGridUrl(page, resourceCollectionSchema)).then((resourceData) => {
          if (resourceData.data.pagedResultsCookie) {
            this.lastPage = false;
          } else {
            this.lastPage = true;
          }

          this.gridData = [];
          this.setColumns(resourceCollectionSchema);
          this.setGridData(resourceData.data.result, this.relationshipArrayProperty);
        }).catch((error) => {
          this.showErrorMessage(error, this.$t('errors.errorRetrievingRelationships'));
        });
      };

      if (has(this.relationshipArrayProperty, 'items.resourceCollection') && this.relationshipArrayProperty.items.resourceCollection.length === 1) {
        const resourceCollection = this.relationshipArrayProperty.items.resourceCollection[0];
        this.setDisableSortAndSearch(resourceCollection);

        getSchema(resourceCollection.path).then((response) => {
          this.showFilter = true;
          doLoad(response.data);
        });
      } else {
        doLoad();
      }
    },
    setDisableSortAndSearch(resourceCollection) {
      const { uiConfig } = this.$store.state.SharedStore;
      const resourceType = resourceCollection.path.split('/')[0];
      let resourceName = resourceCollection.path.split('/')[1];
      // special case for internal/role
      if (resourceName === 'role' && resourceType === 'internal') {
        resourceName = 'internalrole';
      }
      const configDisableRelationshipSortAndSearch = has(uiConfig, `configuration.platformSettings.managedObjectsSettings.${resourceName}`) ? uiConfig.configuration.platformSettings.managedObjectsSettings[resourceName].disableRelationshipSortAndSearch : false;
      this.disableSortAndSearch = !this.isOpenidmAdmin && configDisableRelationshipSortAndSearch;
    },
    setColumns(resourceCollectionSchema) {
      if (!this.relationshipArrayProperty.readOnly || this.isOpenidmAdmin) {
        this.columns.push({
          key: 'selected',
          label: '',
          class: 'checkbox-column',
        });
      }

      if (resourceCollectionSchema) {
        this.relationshipArrayProperty.items.resourceCollection[0].query.fields.forEach((fieldName) => {
          this.columns.push({
            key: fieldName,
            label: resourceCollectionSchema.properties[fieldName].title || pluralize.singular(fieldName),
            sortable: true,
            sortDirection: 'desc',
          });
        });
      } else {
        this.columns.push({
          key: '_relationshipDetails',
          label: pluralize.singular(this.relationshipArrayProperty.title),
        });
      }

      if (this.relationshipArrayProperty.relationshipGrantTemporalConstraintsEnforced) {
        this.columns.push({
          key: '_refProperties.temporalConstraints[0].duration',
          label: this.$t('pages.access.timeConstraint'),
          formatter: (value) => {
            if (value) {
              const dates = map(value.split('/'), (date) => {
                const retVal = dayjs(date).format('MMMM D, YYYY h:mm A');

                return retVal;
              });

              return `${dates[0]} to ${dates[1]}`;
            }

            return value;
          },
        });
      }
    },
    setGridData(relationships, schema) {
      const addRows = () => {
        relationships.forEach((relationship) => {
          // eslint-disable-next-line no-underscore-dangle
          const resourceCollectionSchema = find(schema.items.resourceCollection, { path: relationship._refResourceCollection });
          // special display logic for internal user
          if (resourceCollectionSchema && has(resourceCollectionSchema, 'path') && resourceCollectionSchema.path === 'internal/user') {
            // _ref looks "internal/user/openidm-admin"
            // here we are grabbing the last part of the path to display "userName" which is also the internal user's "_id"
            // eslint-disable-next-line no-underscore-dangle
            relationship._relationshipDetails = [last(relationship._ref.split('/'))];
          } else if (resourceCollectionSchema) {
            // eslint-disable-next-line no-underscore-dangle
            relationship._relationshipDetails = toArray(pick(relationship, resourceCollectionSchema.query.fields));
          } else {
            // if no schema information for resourceCollection just show the object's _id
            // eslint-disable-next-line no-underscore-dangle
            relationship._relationshipDetails = [relationship._id];
          }

          this.gridData.push(relationship);
        });
      };

      if (this.disableSortAndSearch) {
        const promises = [];
        // When we disable sort and search the list of relationships does not include the related object's data.
        // In this case to retrieve the data needed to fill in grid columns we need to loop over each relationship
        // record and do a get on the _ref ('managed/user/USER_GUUID').
        relationships.forEach((relationship, index) => {
          // eslint-disable-next-line no-underscore-dangle
          const resourceCollectionSchema = find(schema.items.resourceCollection, { path: relationship._refResourceCollection });
          promises.push(
            this.getRelationshipFieldsData(relationship, resourceCollectionSchema.query.fields).then((fieldsData) => {
              // once we get fields data merge it with the existing relationship data
              relationships[index] = { ...relationship, ...fieldsData };
            }),
          );
        });

        Promise.all(promises).then(() => {
          addRows();
        });
      } else {
        addRows();
      }
    },
    getRelationshipFieldsData(relationship, fields) {
      return this.getRequestService().get(`${relationship._ref}?_fields=${fields}`).then((response) => pick(response.data, fields));
    },
    buildGridUrl(page, resourceCollectionSchema) {
      const currentResourceCollection = find(this.relationshipArrayProperty.items.resourceCollection, { path: resourceCollectionSchema ? resourceCollectionSchema.resourceCollection : null });
      let resourceUrl = `${this.parentResource}/${this.parentId}/${this.relationshipArrayProperty.propName}?_pageSize=${this.gridPageSize}&_totalPagedResultsPolicy=ESTIMATE`;

      if (this.filter) {
        resourceUrl = `${resourceUrl}&_queryFilter=${this.generateSearch(this.filter, currentResourceCollection.query.fields, resourceCollectionSchema.properties)}`;
      } else {
        resourceUrl = `${resourceUrl}&_queryFilter=true`;
      }

      if (!this.disableSortAndSearch && currentResourceCollection) {
        resourceUrl = `${resourceUrl}&_fields=${currentResourceCollection.query.fields.join(',')}`;
      }

      if (page > 0) {
        const offsetCalc = (page) * this.gridPageSize;

        resourceUrl = `${resourceUrl}&_pagedResultsOffset=${offsetCalc}`;
      }

      if (this.sortBy) {
        let sortUrl = null;

        if (!isNull(this.sortBy)) {
          if (this.sortDesc) {
            sortUrl = `${this.sortBy}`;
          } else {
            sortUrl = `-${this.sortBy}`;
          }
        }
        resourceUrl = `${resourceUrl}&_sortKeys=${sortUrl}`;
      }

      return resourceUrl;
    },
    paginationChange(page) {
      this.currentPage = page;
      this.loadGrid(page);
    },
    resourceClicked(item, index, event) {
      if (!event || !event.target.classList.value || event.target.classList.value.indexOf('checkbox') === -1) {
        this.$router.push({
          name: 'EditResource',
          params: {
            // eslint-disable-next-line no-underscore-dangle
            resourceType: item._refResourceCollection.split('/')[0],
            // eslint-disable-next-line no-underscore-dangle
            resourceName: item._refResourceCollection.split('/')[1],
            // eslint-disable-next-line no-underscore-dangle
            resourceId: item._refResourceId,
          },
        });
      }
    },
    openCreateModal() {
      this.$refs[this.createModalId].show();
      this.newRelationships = [];
    },
    addNewRelationship(data) {
      if (data) {
        this.newRelationships = data;
      }
    },
    onCheckboxClicked(row) {
      if (!row.rowSelected) {
        this.$refs.relationshipArrayGrid.selectRow(row.index);
      } else {
        this.$refs.relationshipArrayGrid.unselectRow(row.index);
      }
    },
    onRowSelected(items) {
      this.selected = items;

      this.allRowsSelected = items.length === Math.min(this.gridData.length, this.gridPageSize);
    },
    toggleSelectAll() {
      const grid = this.$refs.relationshipArrayGrid;

      if (!this.allRowsSelected) {
        grid.selectAllRows();
      } else {
        grid.clearSelected();
      }
    },
    saveNewRelationships() {
      this.updateRelationship('add', this.newRelationships);
    },
    removeRelationships() {
      const relationshipsToRemove = [];
      const requiredProps = ['_ref', '_refResourceCollection', '_refResourceId', '_refProperties'];

      this.selected.forEach((relationship) => {
        if (relationship) {
          relationshipsToRemove.push(pick(relationship, requiredProps));
        }
      });

      this.updateRelationship('remove', relationshipsToRemove);
    },
    updateRelationship(operation, items) {
      const patchArray = map(items, (item) => {
        if (operation === 'remove') {
          return {
            operation: 'remove',
            field: `/${this.relationshipArrayProperty.propName}`,
            value: item,
          };
        }
        return {
          operation: 'add',
          field: `/${this.relationshipArrayProperty.propName}/-`,
          value: item,
        };
      });
      const loadAndCloseModal = () => {
        const modal = operation === 'remove' ? this.removeModalId : this.createModalId;
        this.loadGrid(0);
        this.$refs[modal].hide();
      };

      this.getRequestService({
        headers: {
          'if-match': this.revision,
        },
      }).patch(`${this.parentResource}/${this.parentId}`, patchArray).then(() => {
        const translation = operation === 'remove' ? 'pages.access.successRemoved' : 'pages.access.successAdded';
        loadAndCloseModal();
        this.displayNotification('IDMMessages', 'success', this.$t(translation, { resource: this.relationshipArrayProperty.title }));
        this.$emit('refreshData');
      })
        .catch((error) => {
          loadAndCloseModal();
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    /**
     * Repulls data based on new sort, and returns table to first page
     *
     * @param {object} sort - Required object containing sort metadata
     */
    sortingChanged(sort) {
      this.currentPage = 0;
      this.sortBy = sort.sortBy;
      this.sortDesc = sort.sortDesc;

      this.loadGrid(0);
    },
    /**
     * Reloads data after search box filter text is cleared
     */
    clear() {
      this.filter = '';
      this.sortBy = null;
      this.sortDesc = false;
      this.currentPage = 0;

      this.loadGrid(0);
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

      this.loadGrid(0);
    },
  },
};
</script>

<style lang="scss" scoped>
    /deep/ {
      .fr-resource-paginator {
        a[role='menuitemradio'] {
          display: none !important;
        }
      }

      .checkbox-column {
        width: 15px;
        padding-right: 0;
        vertical-align: middle;
      }

      .cursor-pointer {
        cursor: pointer;
      }

      .modal-body {
        overflow: visible;
      }
    }
</style>

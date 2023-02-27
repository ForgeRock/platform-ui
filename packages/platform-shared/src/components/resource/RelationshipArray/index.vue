<!-- Copyright (c) 2020-2022 ForgeRock. All rights reserved.

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
            <FrIcon
              class="mr-2"
              :outlined="false"
              name="add"
            />{{ addButtonText }}
          </BButton>
          <BButton
            v-show="selected.length > 0"
            variant="outline-primary"
            @click="$refs[removeModalId].show()"
            :id="'delete_' + relationshipArrayProperty.key">
            {{ removeRelationshipButtonText }}
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
      hover
      ref="relationshipArrayGrid"
      responsive
      show-empty
      :fields="columns"
      :items="gridData"
      :per-page="0"
      :no-local-sorting="true"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :sort-direction="sortDirection"
      class="mb-0"
      :selectable="(!relationshipArrayProperty.readOnly || isOpenidmAdmin) && rowSelect"
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
      <template #cell(assignment)="data">
        <slot
          name="assignment"
          :data="data" />
      </template>
      <template #cell(actions)="data">
        <slot
          name="actions"
          :data="data"
          :on-relationship-delete="onRelationshipDelete" />
      </template>
    </BTable>
    <FrPagination
      v-if="gridData.length && gridData.length === gridPageSize || currentPage > 0"
      v-model="currentPage"
      align="center"
      hide-page-size-selector
      :dataset-size="DatasetSize.CUSTOM"
      :last-page="lastPage"
      @input="loadGrid(currentPage)"
    />

    <BModal
      cancel-variant="link"
      :id="createModalId"
      :ok-disabled="newRelationships.length === 0"
      :ok-title="$t('common.save')"
      :ref="createModalId"
      :title="addRelationshipModalTitle"
      size="lg"
      @ok="saveNewRelationships">
      <template #modal-header>
        <slot name="create-modal-header" />
      </template>
      <slot
        name="create-modal-body"
        :add-new-relationship="addNewRelationship"
      >
        <FrRelationshipEdit
          :parent-resource="parentResource"
          :relationship-property="relationshipArrayProperty"
          :index="0"
          @setValue="addNewRelationship" />
      </slot>
      <template #modal-footer>
        <slot
          name="create-modal-footer"
          :createModalId="createModalId"
          :updateRelationship="updateRelationship" />
      </template>
    </BModal>

    <BModal
      :id="removeModalId"
      :ref="removeModalId"
      :title="$t('pages.access.removeModalTitle')">
      <div>
        {{ removeModalMessage }}
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="float-right">
            <BButton
              variant="btn-link text-danger mr-2"
              @click="$refs[removeModalId].hide()">
              {{ $t('common.cancel') }}
            </BButton>
            <FrButtonWithSpinner
              variant="danger"
              :button-text="removeModalButtonText || $t('common.remove')"
              :disabled="dataIsUpdating"
              :show-spinner="dataIsUpdating"
              :spinner-text="removeModalButtonText || $t('common.remove')"
              @click="removeRelationships" />
          </div>
        </div>
      </template>
    </BModal>
    <slot name="modal" />
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
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';

import dayjs from 'dayjs';
import pluralize from 'pluralize';

import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import RelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { DatasetSize } from '@forgerock/platform-shared/src/components/Pagination/types';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';

export default {
  name: 'RelationshipArray',
  components: {
    BRow,
    BCol,
    BButton,
    BTable,
    BFormCheckbox,
    BModal,
    FrButtonWithSpinner,
    FrIcon,
    FrPagination,
    FrRelationshipEdit: RelationshipEdit,
    FrSearchInput,
  },
  mixins: [
    NotificationMixin,
    RestMixin,
    ResourceMixin,
    TranslationMixin,
  ],
  props: {
    additionalColumns: {
      type: Array,
      default: () => [],
    },
    addRelationshipButtonText: {
      type: String,
      default: '',
    },
    additionalQueryFilter: {
      type: String,
      default: '',
    },
    incomingFields: {
      type: Array,
      default: () => [],
    },
    modalTitle: {
      type: String,
      default: '',
    },
    overrideResourceEvent: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: String,
      required: true,
    },
    parentResource: {
      type: String,
      required: true,
    },
    parentResourceOverride: {
      type: String,
      default: '',
    },
    removeModalButtonText: {
      type: String,
      default: '',
    },
    removeRelationshipButtonText: {
      type: String,
      default() {
        return this.$t('common.remove');
      },
    },
    revision: {
      type: String,
      default: '',
    },
    relationshipArrayProperty: {
      type: Object,
      required: true,
    },
    rowSelect: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      addButtonText: this.addRelationshipButtonText || this.$t('common.addObject', { object: this.getTranslation(this.relationshipArrayProperty.title) }),
      gridPageSize: 10,
      allRowsSelected: false,
      dataIsUpdating: false,
      gridData: [],
      columns: [],
      currentPage: 1,
      sortBy: null,
      sortDesc: false,
      filter: '',
      lastPage: false,
      sortDirection: 'asc',
      createModalId: `create_${this.relationshipArrayProperty.propName}_modal`,
      addRelationshipModalTitle: this.modalTitle ? this.modalTitle : `Add ${this.relationshipArrayProperty.title}`,
      removeModalId: `delete_${this.relationshipArrayProperty.propName}_modal`,
      removeModalMessage: this.$t('pages.access.removeConfirm', { type: this.relationshipArrayProperty.title }),
      newRelationships: [],
      relationshipToDelete: {},
      selected: [],
      isOpenidmAdmin: this.$store.state.UserStore.adminUser,
      showFilter: false,
      disableSortAndSearch: false,
      requiredProps: [
        '_ref',
        '_refResourceCollection',
        '_refResourceId',
        '_refProperties',
      ],
      DatasetSize,
    };
  },
  mounted() {
    this.loadGrid(1);
  },
  watch: {
    gridData() {
      this.columns = this.columns.map((col) => {
        if (col.sortable !== false) {
          col.sortable = !this.disableSortAndSearch;
        }

        return col;
      });
    },
  },
  methods: {
    loadGrid(page) {
      this.currentPage = page;
      const doLoad = (resourceCollectionSchema) => {
        const buildGridUrl = this.buildGridUrl(page - 1, resourceCollectionSchema);
        this.getRequestService().get(buildGridUrl).then((resourceData) => {
          this.lastPage = !resourceData.data.pagedResultsCookie;
          this.gridData = [];
          this.$emit('resource-data', resourceData.data.result);
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
      if ((!this.relationshipArrayProperty.readOnly || this.isOpenidmAdmin) && this.rowSelect) {
        this.columns.push({
          key: 'selected',
          label: '',
          sortable: false,
          class: 'checkbox-column',
        });
      }

      if (resourceCollectionSchema) {
        this.relationshipArrayProperty.items.resourceCollection[0].query.fields.forEach((fieldName) => {
          this.columns.push({
            key: fieldName,
            label: this.getTranslation(resourceCollectionSchema.properties[fieldName].title || pluralize.singular(fieldName)),
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

      if (this.additionalColumns.length) {
        /*
         * Inject additional column data from prop
         */
        this.additionalColumns.forEach((columnData) => {
          this.columns.push(columnData);
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
      const resourcePath = this.additionalQueryFilter
        ? this.parentResource
        : `${this.parentResource}/${this.parentId}/${this.relationshipArrayProperty.propName}`;
      const filter = this.filter
        ? this.generateSearch(this.filter, currentResourceCollection.query.fields, resourceCollectionSchema.properties)
        : '';
      let resourceUrl = `${resourcePath}?_pageSize=${this.gridPageSize}&_totalPagedResultsPolicy=ESTIMATE`;

      if (filter && this.additionalQueryFilter) {
        resourceUrl = `${resourceUrl}&_queryFilter=${this.additionalQueryFilter} and (${filter})`;
      } else if (filter && !this.additionalQueryFilter) {
        resourceUrl = `${resourceUrl}&_queryFilter=${filter}`;
      } else if (!filter && this.additionalQueryFilter) {
        resourceUrl = `${resourceUrl}&_queryFilter=${this.additionalQueryFilter}`;
      } else {
        resourceUrl = `${resourceUrl}&_queryFilter=true`;
      }

      // Add required fields, query fields, and prop-passed fields to grid query
      if (!this.disableSortAndSearch && currentResourceCollection) {
        const requiredProps = this.requiredProps.join(',');
        const resourceCollectionFields = currentResourceCollection.query.fields.join(',');
        const incomingFields = this.incomingFields.length
          ? `,${this.incomingFields.join(',')}`
          : '';
        resourceUrl = `${resourceUrl}&_fields=${requiredProps},${resourceCollectionFields}${incomingFields}`;
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
    resourceClicked(item, index, event) {
      const noEvent = !event;
      const noClassList = event ? !event.target.classList.value : false;
      const noCheckboxClass = event
        ? event.target.classList.value.indexOf('checkbox') === -1
        : false;

      if (this.overrideResourceEvent) {
        this.$emit('resource-event', item);
      } else if (noEvent || noClassList || noCheckboxClass) {
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
      if (row.rowSelected) {
        this.$refs.relationshipArrayGrid.selectRow(row.index);
      } else {
        this.$refs.relationshipArrayGrid.unselectRow(row.index);
      }
    },
    onRowSelected(items) {
      this.selected = items;

      this.allRowsSelected = items.length === Math.min(this.gridData.length, this.gridPageSize);
    },
    onRelationshipDelete(data) {
      this.relationshipToDelete = data;
      this.$refs[this.removeModalId].show();
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

      this.dataIsUpdating = true;
      // If ellipses menu => delete option was selected on row,
      // push that row data up to the relationshipsToRemove array only,
      // otherwise push all selected rows.
      if (Object.keys(this.relationshipToDelete).length) {
        relationshipsToRemove.push(pick(this.relationshipToDelete, this.requiredProps));
      } else {
        this.selected.forEach((relationship) => {
          if (relationship) {
            relationshipsToRemove.push(pick(relationship, this.requiredProps));
          }
        });
      }

      this.updateRelationship('remove', relationshipsToRemove);
    },
    /**
     * Adds or removes relationships from array
     * @param {String} operation operation type
     * @param {Array} items resource
     * @fires patch#revision-update emits new _rev ID
     */
    updateRelationship(operation, items) {
      const resourcePath = this.parentResourceOverride ? this.parentResourceOverride : this.parentResource;
      const fieldProp = this.relationshipArrayProperty.propName;
      const patchArray = map(items, (item) => {
        if (operation === 'remove') {
          return {
            operation: 'remove',
            field: `/${fieldProp}`,
            value: item,
          };
        }
        return {
          operation: 'add',
          field: `/${fieldProp}/-`,
          value: item,
        };
      });
      const loadAndCloseModal = () => {
        const modal = operation === 'remove' ? this.removeModalId : this.createModalId;
        this.loadGrid(1);
        this.relationshipToDelete = {};
        this.$refs[modal].hide();
      };

      this.getRequestService({
        headers: {
          'if-match': this.revision,
        },
      })
        .patch(`${resourcePath}/${this.parentId}`, patchArray).then((response) => {
          const translation = operation === 'remove' ? 'pages.access.successRemoved' : 'pages.access.successAdded';
          loadAndCloseModal();
          this.displayNotification('success', this.$t(translation, { resource: this.relationshipArrayProperty.title }));
          // _rev property needs updating in the parent component
          // in order for the headers if-match property to work
          // correctly on any subsequent call.
          this.$emit('revision-update', response.data._rev);
          if (operation === 'remove') this.$emit('relationship-removed');
        })
        .catch((error) => {
          loadAndCloseModal();
          this.showErrorMessage(error, this.$t('errors.errorRetrievingRelationships'));
        })
        .finally(() => {
          this.dataIsUpdating = false;
        });
    },
    /**
     * Repulls data based on new sort, and returns table to first page
     *
     * @param {object} sort - Required object containing sort metadata
     */
    sortingChanged(sort) {
      this.sortBy = sort.sortBy;
      this.sortDesc = sort.sortDesc;

      this.loadGrid(1);
    },
    /**
     * Reloads data after search box filter text is cleared
     */
    clear() {
      this.filter = '';
      this.sortBy = null;
      this.sortDesc = false;

      this.loadGrid(1);
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

      this.loadGrid(1);
    },
  },
};
</script>

<style lang="scss" scoped>
    ::v-deep {
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

<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="px-4 py-3 card-header ">
      <BRow>
        <BCol
          md="6"
          v-show="!relationshipArrayProperty.readOnly || isOpenidmAdmin">
          <div class="d-md-inline-block mb-3 mb-md-0">
            <BButton
              variant="primary"
              class="mr-1 text-nowrap flex-shrink-0"
              @click="openCreateModal"
              :id="'add_' + relationshipArrayProperty.key"
              block>
              <FrIcon
                icon-class="mr-2"
                :outlined="false"
                name="add">
                {{ addButtonText }}
              </FrIcon>
            </BButton>
          </div>
          <div class="d-md-inline-block mb-3 ml-md-3 mb-md-0">
            <BButton
              class="text-nowrap flex-shrink-0"
              v-show="selected.length > 0"
              variant="outline-primary"
              @click="$refs[removeModalId].show()"
              :id="'delete_' + relationshipArrayProperty.key"
              block>
              {{ removeRelationshipButtonTextFallback }}
            </BButton>
          </div>
        </BCol>
        <BCol
          md="6"
          class="d-md-inline-block">
          <FrSearchInput
            v-if="showFilter && !disableSortAndSearch"
            :value="filter"
            :placeholder="$t('common.search')"
            @clear="clear"
            @search="search"
            @input="filterChange"
            @search-input-focus="setHelpTextFromSearchLength"
            @search-input-blur="removeHelpText"
            class="w-100"
            :class="{'fr-search-focus': hasFocus}">
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
        </BCol>
      </BRow>
    </div>
    <BTable
      hover
      ref="relationshipArrayGrid"
      responsive
      show-empty
      :empty-text="$t('common.noRecordsToShow')"
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
      <template #head(selected)>
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
      <template #cell(selected)="data">
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
      <template #cell(_relationshipDetails)="data">
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
      :value="currentPage"
      align="center"
      hide-page-size-selector
      :dataset-size="DatasetSize.CUSTOM"
      :last-page="lastPage"
      @input="loadGrid($event)"
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
      <FrRelationshipEdit
        :query-filter-extension="additionalQueryFilter"
        :parent-resource="parentResource"
        :relationship-property="relationshipArrayProperty"
        :index="0"
        @setValue="addNewRelationship" />
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
  BInputGroupText,
  BTable,
  BFormCheckbox,
  BModal,
} from 'bootstrap-vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';

import dayjs from 'dayjs';
import { pluralizeSingular } from '@forgerock/platform-shared/src/utils/PluralizeUtils';

import { generateSearchQuery } from '@forgerock/platform-shared/src/utils/queryFilterUtils';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrRelationshipEdit from '@forgerock/platform-shared/src/components/resource/RelationshipEdit';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import ResourceMixin from '@forgerock/platform-shared/src/mixins/ResourceMixin';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';

import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { DatasetSize } from '@forgerock/platform-shared/src/components/Pagination/types';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import i18n from '@/i18n';

export default {
  name: 'RelationshipArray',
  components: {
    BRow,
    BCol,
    BButton,
    BInputGroupText,
    BTable,
    BFormCheckbox,
    BModal,
    FrButtonWithSpinner,
    FrIcon,
    FrPagination,
    FrRelationshipEdit,
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
      default: '',
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
    const userStore = useUserStore();
    return {
      addButtonText: this.addRelationshipButtonText || i18n.global.t('common.addObject', { object: this.getTranslation(this.relationshipArrayProperty.title) }),
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
      removeModalMessage: i18n.global.t('pages.access.removeConfirm', { type: this.relationshipArrayProperty.title }),
      newRelationships: [],
      relationshipToDelete: {},
      selected: [],
      isOpenidmAdmin: userStore.adminUser,
      showFilter: false,
      disableSortAndSearch: false,
      queryThreshold: null,
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
      this.setColumnSorting();
    },
    filter() {
      this.setColumnSorting();
    },
  },
  computed: {
    removeRelationshipButtonTextFallback() {
      return this.removeRelationshipButtonText || i18n.global.t('common.remove');
    },
  },
  methods: {
    filterChange(filter) {
      this.filter = filter;
      this.setHelpTextFromSearchLength();
    },
    async loadGrid(page) {
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
          this.showErrorMessage(error, i18n.global.t('errors.errorRetrievingRelationships'));
        });
      };

      if (has(this.relationshipArrayProperty, 'items.resourceCollection') && this.relationshipArrayProperty.items.resourceCollection.length === 1) {
        const resourceCollection = this.relationshipArrayProperty.items.resourceCollection[0];
        const resourceType = resourceCollection.path.split('/')[0];
        let resourceName = resourceCollection.path.split('/')[1];
        // special case for internal/role
        if (resourceName === 'role' && resourceType === 'internal') {
          resourceName = 'internalrole';
        }

        await this.setDisableSortAndSearchOrQueryThreshold(resourceName);

        getSchema(resourceCollection.path).then((response) => {
          this.showFilter = true;
          doLoad(response.data);
        });
      } else {
        doLoad();
      }
    },
    async setDisableSortAndSearchOrQueryThreshold(resourceName) {
      const { uiConfig } = this.$store.state.SharedStore;
      const configDisableRelationshipSortAndSearch = has(uiConfig, `configuration.platformSettings.managedObjectsSettings.${resourceName}.disableRelationshipSortAndSearch`) ? uiConfig.configuration.platformSettings.managedObjectsSettings[resourceName].disableRelationshipSortAndSearch : false;
      this.disableSortAndSearch = !this.isOpenidmAdmin && configDisableRelationshipSortAndSearch;
      // set query threshold for search
      this.queryThreshold = await this.getMinimumUIFilterLength(resourceName);
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
            label: this.getTranslation(resourceCollectionSchema.properties[fieldName].title || pluralizeSingular(fieldName)),
            sortable: true,
            sortDirection: 'desc',
          });
        });
      } else {
        this.columns.push({
          key: '_relationshipDetails',
          label: pluralizeSingular(this.relationshipArrayProperty.title),
        });
      }

      if (this.relationshipArrayProperty.relationshipGrantTemporalConstraintsEnforced) {
        this.columns.push({
          key: '_refProperties.temporalConstraints[0].duration',
          label: i18n.global.t('pages.access.timeConstraint'),
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
          const resourceCollectionSchema = find(schema.items.resourceCollection, { path: relationship._refResourceCollection });
          // special display logic for internal user
          if (resourceCollectionSchema && has(resourceCollectionSchema, 'path') && resourceCollectionSchema.path === 'internal/user') {
            // _ref looks "internal/user/openidm-admin"
            // here we are grabbing the last part of the path to display "userName" which is also the internal user's "_id"
            relationship._relationshipDetails = [last(relationship._ref.split('/'))];
          } else if (resourceCollectionSchema) {
            relationship._relationshipDetails = toArray(pick(relationship, resourceCollectionSchema.query.fields));
          } else {
            // if no schema information for resourceCollection just show the object's _id
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
        ? generateSearchQuery(this.filter, currentResourceCollection.query.fields, resourceCollectionSchema.properties)
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
      if (!this.disableSortAndSearch) {
        if (currentResourceCollection) {
          const requiredProps = this.requiredProps.join(',');
          const resourceCollectionFields = currentResourceCollection.query.fields.join(',');
          const incomingFields = this.incomingFields.length
            ? `,${this.incomingFields.join(',')}`
            : '';
          resourceUrl = `${resourceUrl}&_fields=${requiredProps},${resourceCollectionFields}${incomingFields}`;
        } else {
          resourceUrl = `${resourceUrl}&_fields=*`;
        }
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
            resourceType: item._refResourceCollection.split('/')[0],
            resourceName: item._refResourceCollection.split('/')[1],
            resourceId: item._refResourceId,
          },
        });
      }
    },
    openCreateModal() {
      if (this.overrideResourceEvent) {
        this.$emit('relationship-new-event');
      } else {
        this.$refs[this.createModalId].show();
        this.newRelationships = [];
      }
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
      const resourcePath = this.parentResourceOverride || this.parentResource;
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
        if (this.$refs[modal]) {
          this.$refs[modal].hide();
        }
      };

      this.getRequestService({
        headers: {
          'if-match': this.revision,
        },
      })
        .patch(`${resourcePath}/${this.parentId}`, patchArray).then((response) => {
          const translation = operation === 'remove' ? 'pages.access.successRemoved' : 'pages.access.successAdded';
          loadAndCloseModal();
          this.displayNotification('success', i18n.global.t(translation, { resource: this.relationshipArrayProperty.title }));
          // _rev property needs updating in the parent component
          // in order for the headers if-match property to work
          // correctly on any subsequent call.
          this.$emit('revision-update', response.data._rev);
          if (operation === 'remove') this.$emit('relationship-removed');
        })
        .catch((error) => {
          loadAndCloseModal();
          this.showErrorMessage(error, i18n.global.t('errors.errorRetrievingRelationships'));
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
        this.submitBeforeLengthValid = false;
        this.clear();
        return;
      }
      this.sortBy = null;
      this.sortDesc = false;

      // only send search request if no queryThreshold is defined or the filter is empty or the filter has at least the same number of chars as queryThreshold
      if (!this.queryThreshold || !this.filter.length || this.filter.length >= this.queryThreshold) {
        this.submitBeforeLengthValid = false;
        this.loadGrid(1);
      } else if (this.queryThreshold) {
        this.submitBeforeLengthValid = true;
      }
    },
    setColumnSorting() {
      // disallow sorting if there is a queryThreshold and the filter doesn't have at least the same number of chars as queryThreshold
      this.columns = this.columns.map((col) => {
        if (col.key !== 'selected') {
          col.sortable = (!this.disableSortAndSearch && !this.queryThreshold) || (this.filter.length >= this.queryThreshold);
        }

        return col;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
    :deep {
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

      .fr-icon-input-right {
        margin-top: 5px;
      }

      .input-group-text {
        border: none;
      }

      .fr-search-focus {
        height: 50px;
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
    }
</style>

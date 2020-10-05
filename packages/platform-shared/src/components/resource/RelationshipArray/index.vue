<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <div
      v-show="!relationshipArrayProperty.readOnly || isOpenidmAdmin"
      class="px-4 py-2 card-header">
      <BRow>
        <BCol class="my-1">
          <BButton
            variant="primary"
            class="mr-1"
            @click="openCreateModal"
            :id="'add_' + relationshipArrayProperty.key">
            <i class="material-icons mr-2">
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
      class="mb-0"
      :selectable="!relationshipArrayProperty.readOnly || isOpenidmAdmin"
      selected-variant="transparent"
      @row-clicked="resourceClicked"
      @row-selected="onRowSelected">
      <template v-slot:head(selected)>
        <div
          v-show="gridData.length > 0"
          class="cursor-pointer"
          @click="toggleSelectAll">
          <BFormCheckbox
            class="pl-4"
            disabled
            v-model="allRowsSelected" />
        </div>
      </template>
      <template v-slot:cell(selected)="data">
        <BFormCheckbox
          class="pl-4"
          :id="'rowSelectCheckbox_' + relationshipArrayProperty.key + data.index"
          @change="onCheckboxClicked(data)"
          v-model="data.rowSelected" />
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
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import FrPagination from '@forgerock/platform-shared/src/components/DataTable/Pagination';

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
  },
  mixins: [
    NotificationMixin,
    RestMixin,
  ],
  props: {
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
      lastPage: false,
      createModalId: `create_${this.relationshipArrayProperty.propName}_modal`,
      removeModalId: `delete_${this.relationshipArrayProperty.propName}_modal`,
      newRelationships: [],
      selected: [],
      isOpenidmAdmin: this.$store.state.UserStore.adminUser,
    };
  },
  mounted() {
    this.loadGrid(0);
  },
  methods: {
    loadGrid(page) {
      const idmInstance = this.getRequestService();

      idmInstance.get(this.buildGridUrl(page)).then((resourceData) => {
        if (resourceData.data.pagedResultsCookie) {
          this.lastPage = false;
        } else {
          this.lastPage = true;
        }

        if (!this.relationshipArrayProperty.readOnly || this.isOpenidmAdmin) {
          this.columns.push({
            key: 'selected',
            label: '',
            class: 'checkbox-column',
          });
        }

        this.columns.push({
          key: '_relationshipDetails',
          label: pluralize.singular(this.relationshipArrayProperty.title),
        });

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

        this.gridData = [];
        this.setGridData(resourceData.data.result, this.relationshipArrayProperty);
      }).catch((error) => {
        this.displayNotification('IDMMessages', 'error', error.response.data.message);
      });
    },
    setGridData(relationships, schema) {
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
    },
    buildGridUrl(page) {
      let resourceUrl = `${this.parentResource}/${this.parentId}/${this.relationshipArrayProperty.propName}?_queryFilter=true&_pageSize=${this.gridPageSize}&_totalPagedResultsPolicy=ESTIMATE&_fields=`;

      if (page > 0) {
        const offsetCalc = (page) * this.gridPageSize;

        resourceUrl = `${resourceUrl}&_pagedResultsOffset=${offsetCalc}`;
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
      const translation = operation === 'remove' ? 'pages.access.successRemoved' : 'pages.access.successAdded';
      const idmInstance = this.getRequestService();
      const loadAndCloseModal = () => {
        const modal = operation === 'remove' ? this.removeModalId : this.createModalId;
        this.loadGrid(0);
        this.$refs[modal].hide();
      };

      /* istanbul ignore next */
      idmInstance.patch(`${this.parentResource}/${this.parentId}`, patchArray).then(() => {
        loadAndCloseModal();
        this.displayNotification('IDMMessages', 'success', this.$t(translation, { resource: this.relationshipArrayProperty.title }));
      })
        .catch((error) => {
          loadAndCloseModal();
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
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
        width: 1px;
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

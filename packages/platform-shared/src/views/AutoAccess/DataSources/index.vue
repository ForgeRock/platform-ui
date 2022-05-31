<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="container data-sources">
    <div class="my-5">
      <div>
        <h1>
          {{ $t('autoAccess.access.dataSources.title') }}
        </h1>
        <p class="text-muted mb-4">
          {{ $t('autoAccess.access.dataSources.subtitle') }}
        </p>
      </div>
      <div class="card">
        <FrTable
          fixed
          :items="dataSources"
          :show-empty="dataSources.length === 0"
          :busy="!init"
          :sort-by.sync="sort.sortBy"
          :sort-desc.sync="sort.sortDesc"
          :no-local-sorting="true"
          @sort-changed="handleSort"
          :fields="fields">
          <template #empty>
            <div
              v-if="hasError"
              class="text-dark text-center my-4">
              <span class="material-icons-outlined ">
                error_outline
              </span>
              Data source entity definition not defined
            </div>
            <div
              v-else
              class="text-dark text-center">
              {{ $t("autoAccess.access.dataSources.emptyTable") }}
            </div>
          </template>
          <template #table-busy>
            <div class="text-center my-4">
              <FrSpinner
                size="md"
                class="align-middle" />
            </div>
          </template>
          <template #cell(datasource_created)="data">
            <span v-html="`${formatDate(data.item.datasource_created)}`" />
          </template>
          <template #cell(updated)="data">
            <span v-html="`${formatDate(data.item.metadata.created)}`" />
          </template>
          <template #cell(isActive)="data">
            <span v-if="pendingActivate === data.item.datasource_id">
              <FrSpinner
                size="xs"
                class="align-middle" />
            </span>
            <BBadge
              v-else-if="!hasValidMapping(data.item)"
              pill
              variant="secondary">
              <span
                aria-hidden="true"
                class="material-icons-outlined">
                report_problem
              </span>
              Needs Mapping
            </BBadge>
            <BBadge
              v-else
              pill
              :variant="data.item.isActive ? 'success' : 'warning'">
              {{ data.item.isActive ? 'Active' : 'Inactive' }}
            </BBadge>
          </template>
          <template #toolbar>
            <div class="card-header p-3">
              <div class="d-flex flex-row justify-content-between">
                <BButton
                  variant="primary"
                  @click="toggleShowModal('add', true)"
                >
                  <span
                    aria-hidden="true"
                    class="mr-2 material-icons-outlined">
                    add
                  </span>
                  {{ $t('autoAccess.access.dataSources.buttons.addDataSource') }}
                </BButton>
                <FrSearchInput
                  placeholder="Search"
                  v-model="searchQuery"
                />
              </div>
            </div>
          </template>
        </FrTable>
        <FrPagination
          :current-page="page"
          :last-page="isLastPage"
          @pagination-change="pageChange" />
      </div>
    </div>
    <AddDataSourceModal
      :show-modal="showModal.add"
      @hidden="toggleShowModal('add', false)"
      @saved="addDataSource"
    />
    <EditDataSourceModal
      :show-modal="showModal.edit"
      :data-source="showModal.dataSource"
      @hidden="toggleShowModal('edit', false)"
      @saved="updateDataSource"
    />
    <CreateMappingModal
      :show-modal="showModal.mapping"
      :data-source="showModal.dataSource"
      @hidden="toggleShowModal('mapping', false)"
      @saved="updateMapping"
    />
    <DeleteDataSourceModal
      :show-modal="showModal.delete"
      :data-source="showModal.dataSource"
      @hidden="toggleShowModal('delete', false)"
      @deleted="deleteDataSource"
    />
  </div>
</template>
<script>
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import {
  BBadge, BCard, BCardHeader, BButton,
} from 'bootstrap-vue';
import FrPagination from '../Shared/DataTable/Pagination';
import FrTable from '../Shared/DataTable';
import AddDataSourceModal from './AddDataSourceModal/index';
import EditDataSourceModal from './EditDataSourceModal/index';
import CreateMappingModal from './CreateMappingModal/index';
import DeleteDataSourceModal from './DeleteDataSourceModal';
import store from '@/store';
import { getDataSources, updateDataSource } from './api/DataSourcesAPI';
import { getFormattedDateTime } from '../Shared/utils/util-functions';

export default {
  name: 'DataSources',
  components: {
    AddDataSourceModal,
    BBadge,
    BCard,
    BCardHeader,
    BButton,
    CreateMappingModal,
    EditDataSourceModal,
    FrIcon,
    FrPagination,
    FrSearchInput,
    FrSpinner,
    FrTable,
    DeleteDataSourceModal,
    // FrPagination,
  },
  data: () => ({
    init: false,
    pendingActivate: null,
    showModal: {
      add: false,
      edit: false,
      mapping: false,
      delete: false,
      dataSource: null,
    },
    sort: {
      sortBy: 'name',
      sortDesc: false,
      perPage: 10,
    },
    searchQuery: '',
    dataSources: [],
    totalRecords: 0,
    page: 0,
    searchAfter: [],
    fields: [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
      },
      {
        key: 'input',
        label: 'Location',
      },
      {
        key: 'datasource_created',
        label: 'Created',
        sortable: true,
      },
      {
        key: 'updated',
        label: 'Updated',
        sortable: true,
      },
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
      },
      {
        key: 'dropdown',
        label: '',
      },
    ],
  }),
  watch: {
    searchQuery() {
      this.searchAfter = [[]];
      if (this.page !== 0) {
        this.page = 0;
      } else {
        this.setDataSources();
      }
    },
    sort: {
      deep: true,
      handler() {
        this.searchAfter = [[]];
        if (this.page !== 0) {
          this.page = 0;
        } else {
          this.setDataSources();
        }
      },
    },
    page() {
      this.setDataSources();
    },
    entityDef: {
      immediate: true,
      handler(val) {
        if (val) {
          this.setDataSources();
        } else {
          store.dispatch('DataSources/initializeDataSources');
        }
      },
    },
    hasError: {
      immediate: true,
      handler(val) {
        if (val) {
          this.init = true;
        }
      },
    },
  },
  computed: {
    entityDef() {
      return store.state.DataSources.ds_definition;
    },
    hasError() {
      return store.state.DataSources.errors.ds_def_undefined;
    },
    isLastPage() {
      if (this.sort.perPage * (this.page + 1) < this.totalRecords) {
        return false;
      }
      return true;
    },
  },
  methods: {
    setDataSources() {
      const searchAfter = this.searchAfter[this.page - 1] || [];
      getDataSources(this.sort, this.searchQuery, searchAfter)
        .then((response) => {
          this.pendingActivate = false;
          this.dataSources = response.items.map((row) => (
            {
              ...row,
              dropdown: this.getDropdown(row),
            }
          ));
          if (this.dataSources.length > 0) {
            this.searchAfter[this.page] = this.dataSources[this.dataSources.length - 1]._sort;
          }
          this.totalRecords = response.total;
          setTimeout(() => {
            this.init = true;
          }, 500);
        })
        .catch(() => {
          this.init = true;
        });
    },
    handleSort(sort) {
      this.sort = sort;
    },
    formatDate(date) {
      return getFormattedDateTime(date);
    },
    toggleShowModal(type, newValue, ds = null) {
      this.showModal = {
        add: false,
        edit: false,
        mapping: false,
        delete: false,
        [type]: newValue,
        dataSource: ds || this.showModal.dataSource,
      };
    },
    getDropdown(dataSource) {
      return [
        {
          action: () => {
            this.toggleShowModal('edit', true, dataSource);
          },
          text: this.$t('autoAccess.access.dataSources.table.dropdown.edit'),
          icon: 'edit',
        },
        dataSource.is_ootb
          ? {
            action: () => {
              this.toggleShowModal('mapping', true, dataSource);
            },
            text: this.$t('autoAccess.access.dataSources.table.dropdown.viewMapping'),
            icon: 'edit_off',
          }
          : {
            action: () => {
              this.toggleShowModal('mapping', true, dataSource);
            },
            text: this.$t('autoAccess.access.dataSources.table.dropdown.createMapping'),
            icon: 'multiple_stop',
          },
        this.hasValidMapping(dataSource)
          ? {
            action: () => {
              this.pendingActivate = dataSource.datasource_id;
              updateDataSource({ ...dataSource, isActive: !dataSource.isActive })
                .then((response) => {
                  this.setDataSources();
                });
            },
            text: dataSource.isActive ? 'Deactivate' : 'Activate',
            icon: dataSource.isActive ? 'stop_circle' : 'play_circle',
          }
          : null,
        {
          action: () => {
            this.toggleShowModal('delete', true, dataSource);
          },
          text: 'Delete',
          icon: 'delete',
        },
      ].filter((item) => item !== null);
    },
    addDataSource() {
      this.toggleShowModal('add', false);
      this.setDataSources();
    },
    updateDataSource() {
      this.toggleShowModal('edit', false);
      this.setDataSources();
    },
    updateMapping() {
      this.toggleShowModal('mapping', false);
      this.setDataSources();
    },
    deleteDataSource() {
      this.toggleShowModal('delete', false);
      this.setDataSources();
    },
    pageChange(page) {
      this.page = page;
    },
    hasValidMapping(dataSource) {
      return Object.keys(dataSource.feature_mapping).length > 0;
    },
  },
  mounted() {
    // this.setDataSources();
  },
};
</script>
<style lang="scss" scoped>
    .data-sources {
        ::v-deep {
            .fr-datatable {
                .table-responsive {
                    overflow: visible;
                }
                th, td {
                    &:nth-child(2) {
                        width: 28%;
                    }
                    &:nth-last-child(2) {
                        width: 150px;
                    }
                    &:last-child {
                        width: 90px;
                    }
                }
            }
        }
    }
</style>

Comments can only be added within 10 lines of a change

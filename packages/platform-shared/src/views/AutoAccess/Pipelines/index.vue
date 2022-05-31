<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="container pipelines">
    <div class="my-5">
      <div>
        <h1>
          {{ $t('autoAccess.access.pipelines.title') }}
        </h1>
        <p class="text-muted mb-4">
          {{ $t('autoAccess.access.pipelines.subtitle') }}
        </p>
      </div>
      <div class="card">
        <FrTable
          :items="table"
          :show-empty="table.length === 0"
          :busy="!init"
          :sort-by.sync="sort.sortBy"
          :sort-desc.sync="sort.sortDesc"
          :no-local-sorting="true"
          @sort-changed="handleSort"
          :fields="fields">
          <template #empty>
            <div
              v-if="!hasError"
              class="text-dark text-center my-4">
              {{ $t("autoAccess.access.pipelines.emptyTable") }}
            </div>
            <div
              v-else
              class="text-dark text-center my-4">
              <span class="material-icons-outlined ">
                error_outline
              </span>
              Pipeline entity definition not defined
            </div>
          </template>
          <template #table-busy>
            <div class="text-center my-4">
              <FrSpinner
                size="md"
                class="align-middle" />
            </div>
          </template>
          <template #cell(status)="data">
            <TableExecutionStatusBadge
              :execution="latestExecution(data.item.pipeline_executions)"
              :loading="pendingStatus.indexOf(latestExecution(data.item.pipeline_executions).execution_id) > -1"
            />
          </template>
          <template #cell(is_published)="data">
            <div
              style="width: 30px;"
            >
              <span v-if="pendingPublish.indexOf(data.item.pipeline_definition_id) > -1">
                <FrSpinner size="sm" />
              </span>
              <span v-else-if="publishedPipeline.pipeline_definition_id === data.item.pipeline_definition_id">
                <BTooltip
                  :target="`published-icon-${data.item.pipelined_definition_id}`"
                  triggers="click hover"
                >
                  This pipeline is published.
                </BTooltip>
                <div
                  :id="`published-icon-${data.item.pipelined_definition_id}`"
                  class="p-2">
                  <span class="material-icons text-success">
                    check_circle
                  </span>
                </div>
              </span>
            </div>
          </template>
          <template #cell(pipeline_type)="data">
            <span style="white-space: nowrap;">
              <span
                aria-hidden="true"
                class="mr-2 md-24 material-icons-outlined">
                {{ typeIcons[data.item.pipeline_type] }}
              </span>
              <span>
                {{ data.item.pipeline_type }}
              </span>
            </span>
          </template>
          <template #cell(updated)="data">
            <span v-html="`${formatDate(data.item.metadata.created)}`" />
          </template>
          <template #cell(pipeline_created)="data">
            <span v-html="`${formatDate(data.item.pipeline_created)}`" />
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
                  {{ $t('autoAccess.access.pipelines.buttons.addPipeline') }}
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

    <AddPipelineModal
      :show-modal="showModal.add || showModal.edit"
      @hidden="() => {toggleShowModal('add', false); toggleShowModal('edit', false)}"
      @saved="resetModalAndRefreshPipelines"
      :initial-pipeline="showModal.edit ? modalPipeline : null"
    />
    <DeletePipelineModal
      :show-modal="showModal.delete"
      @hidden="toggleShowModal('delete', false)"
      @deleted="resetModalAndRefreshPipelines"
      :pipeline="showModal.delete ? modalPipeline : null"
    />
    <RunPipelineModal
      :show-modal="showModal.run"
      @hidden="toggleShowModal('run', false)"
      @refresh="(pipeline, execution_id) => checkPipelineStatus({pipeline, execution_id})"
      :pending-status="pendingStatus"
      @updatePipelines="setPipelines(true)"
      @error="() => setPendingStatus('reset')"
      @evaluate="toggleShowModal('evaluate', true, showModal.pipelineId, true)"
      :pipeline="showModal.run ? modalPipeline : null"
    />
    <ExecutionDetailsModal
      :show-modal="showModal.executions"
      @hidden="toggleShowModal('executions', false, null)"
      @refresh="(pipeline, execution_id) => checkPipelineStatus({pipeline, execution_id})"
      @refreshPublish="handlePipelinePublished"
      :pending-status="pendingStatus"
      :pipeline="showModal.executions ? modalPipeline : null"
      :published-pipeline="publishedPipeline"
      :show-results="showModal.showResults"
      @togglePublish="(pipeline) => { toggleShowModal('executions', false); toggleShowModal('publish', true, pipeline.pipeline_definition_id)}"
    />
    <PublishPipelineModal
      :show-modal="showModal.publish"
      :published-pipeline="publishedPipeline"
      @refresh="handlePipelinePublished"
      @hidden="toggleShowModal('publish', false, null)"
      :pipeline="modalPipeline"
    />
  </div>
</template>
<script>
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import {
  BButton, BTooltip,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrTable from '../Shared/DataTable';
import FrPagination from '../Shared/DataTable/Pagination';
import AddPipelineModal from './AddPipelineModal';
import DeletePipelineModal from './DeletePipelineModal';
import RunPipelineModal from './RunPipelineModal';
import store from '@/store';
import {
  checkStatusAndUpdate, getPipelines, trainingTypes, getLatestExecution, getIncompleteExecutions, isPipelineSuccess, getPublishedTrainingPipeline,
} from './api/PipelineApi';
import TableExecutionStatusBadge from './Table/TableExecutionStatusBadge';
import ExecutionDetailsModal from './ExecutionDetailsModal';
import { getFormattedDateTime } from '../Shared/utils/util-functions';
import PublishPipelineModal from './PublishPipelineModal';

export default {
  name: 'Pipelines',
  components: {
    FrSearchInput,
    BButton,
    BTooltip,
    FrTable,
    FrPagination,
    AddPipelineModal,
    FrSpinner,
    DeletePipelineModal,
    RunPipelineModal,
    TableExecutionStatusBadge,
    ExecutionDetailsModal,
    PublishPipelineModal,
  },
  data() {
    return {
      init: false,
      showModal: {
        add: false,
        edit: false,
        run: false,
        executions: false,
        results: false,
        pipelineID: null,
      },
      pipelines: [],
      publishedPipeline: {},
      table: [],
      searchQuery: '',
      page: 0,
      totalRecords: 0,
      searchAfter: [],
      pendingStatus: [],
      pendingPublish: [],
      sort: {
        sortBy: 'pipeline_created',
        sortDesc: false,
        perPage: 10,
      },
      fields: [
        {
          key: 'is_published',
          label: '',
          sortable: false,
        },
        {
          key: 'pipeline_name',
          label: 'Name',
          sortable: true,
        },
        {
          key: 'pipeline_type',
          label: 'Type',
          sortable: true,
        },
        {
          key: 'pipeline_created',
          label: 'Created',
          sortable: true,
        },
        {
          key: 'updated',
          label: 'Updated',
          sortable: true,
        },
        {
          key: 'status',
          label: 'Latest Run',
          sortable: true,
        },
        {
          key: 'dropdown',
          label: '',
        },
      ],
    };
  },
  watch: {
    searchQuery() {
      this.searchAfter = [[]];
      if (this.page !== 0) {
        this.page = 0;
      } else {
        this.setPipelines();
      }
    },
    sort: {
      deep: true,
      handler() {
        this.searchAfter = [[]];
        if (this.page !== 0) {
          this.page = 0;
        } else {
          this.setPipelines();
        }
      },
    },
    page() {
      this.setPipelines();
    },
    entityDef: {
      immediate: true,
      handler(val) {
        if (val) {
          this.setPublishedPipeline();
          this.setPipelines(true);
        } else {
          store.dispatch('Pipelines/initializePipelines');
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
    typeIcons() {
      const icons = {};
      trainingTypes.forEach((type) => {
        icons[type.name] = type.icon;
      });

      return icons;
    },
    entityDef() {
      return store.state.Pipelines.pipeline_definition;
    },
    hasError() {
      return store.state.Pipelines.errors.pipeline_def_undefined;
    },
    isLastPage() {
      if (this.sort.perPage * (this.page + 1) < this.totalRecords) {
        return false;
      }
      return true;
    },
    modalPipeline() {
      return this.showModal.pipelineID
        ? { ...this.pipelines.find((pipeline) => pipeline.pipeline_definition_id === this.showModal.pipelineID) }
        : null;
    },
  },
  methods: {
    formatDate(date) {
      return getFormattedDateTime(date);
    },
    handlePipelinePublished() {
      this.setPublishedPipeline(this.modalPipeline.pipeline_definition_id || {});
    },
    setPublishedPipeline(newId = null) {
      this.pendingPublish = [this.publishedPipeline.pipeline_definition_id, newId];

      getPublishedTrainingPipeline()
        .then((response) => {
          this.publishedPipeline = response;
        })
        .catch(() => {

        })
        .finally(() => {
          this.pendingPublish = [];
        });
    },
    setPipelines(checkStatusAll = false) {
      const searchAfter = this.searchAfter[this.page - 1] || [];

      getPipelines(this.sort, this.searchQuery, searchAfter)
        .then((response) => {
          this.table = response.items.map((row) => (
            {
              ...row,
              dropdown: this.getDropdown(row),
            }
          ));
          this.pipelines = response.items;
          if (this.table.length > 0) {
            this.searchAfter[this.page] = this.table[this.table.length - 1]._sort;
          }

          this.totalRecords = response.total;
          this.init = true;

          if (checkStatusAll) {
            this.checkPipelineStatus();
          } else {
            this.pendingStatus = [];
          }
        })
        .catch(() => {
          this.init = true;
        });
    },
    checkPipelineStatus(item = {}) {
      const incomplete = item.pipeline
        ? item.execution_id ? [item]
          : getIncompleteExecutions([item.pipeline])
        : getIncompleteExecutions(this.pipelines);
      this.pendingStatus = incomplete.map((execution) => execution.execution_id);

      checkStatusAndUpdate(incomplete.filter((execution) => execution.execution_id !== 'temp_execution'))
        .then((result) => {
          if (result.length > 0) {
            // execution status has updated, refresh pipelines
            this.setPipelines(false);
          } else {
            this.setPendingStatus('reset');
          }
        });
    },
    setPendingStatus(status, id) {
      if (status === 'reset') {
        this.pendingStatus = [];
      } else if (this.pendingStatus.indexOf(id) === -1 && status) {
        this.pendingStatus = [...this.pendingStatus, id];
      } else {
        this.pendingStatus = [...this.pendingStatus.filter((exec_id) => exec_id !== id)];
      }
    },
    handleSort(sort) {
      this.sort = sort;
    },
    getDropdown(pipeline) {
      return [
        (this.canBePublished(pipeline)
          ? {
            action: () => {
              this.toggleShowModal('publish', true, pipeline.pipeline_definition_id);
            },
            text: 'Publish',
            icon: 'publish',
          }
          : null
        ),
        (pipeline.pipeline_executions.length === 0
          ? {
            action: () => {
              this.toggleShowModal('run', true, pipeline.pipeline_definition_id);
            },
            text: 'Run Pipeline',
            icon: 'play_circle',
          }
          : {
            action: () => {
              this.toggleShowModal('executions', true, pipeline.pipeline_definition_id);
            },
            text: 'View Run Details',
            icon: 'rule',
          }
        ),
        {
          action: () => {
            this.toggleShowModal('edit', true, pipeline.pipeline_definition_id);
          },
          text: this.$t('autoAccess.access.dataSources.table.dropdown.edit'),
          icon: 'edit',
        },
        {
          action: () => {
            this.toggleShowModal('delete', true, pipeline.pipeline_definition_id);
          },
          text: this.$t('autoAccess.access.dataSources.table.dropdown.delete'),
          icon: 'delete',
        },
      ].filter((field) => !!field);
    },
    toggleShowModal(type, newValue, pipelineID = null, showResults = false) {
      this.showModal = {
        ...this.showModal,
        [type]: newValue,
        showResults,
        pipelineID: pipelineID || this.showModal.pipelineID,
      };
    },
    pageChange(page) {
      this.page = page;
    },
    resetModalAndRefreshPipelines() {
      this.showModal = {
        add: false,
        edit: false,
        run: false,
        publish: false,
        executions: false,
        pipelineID: null,
      };
      this.setPipelines(true);
    },
    handleGetDetails(pipeline, cb) {
      this.checkPipelineStatus({ pipeline });
      cb();
    },
    latestExecution(pipeline) {
      return getLatestExecution(pipeline);
    },
    canBePublished(pipeline) {
      if (pipeline.pipeline_type === 'Training') {
        if (pipeline.pipeline_executions.length > 0) {
          return isPipelineSuccess(pipeline.pipeline_executions[0].status);
        }
      }
      return false;
    },
  },
};
</script>
<style lang="scss" scoped>
    .pipelines {
      ::v-deep {
        .fr-datatable {
          .table-responsive {
            overflow: visible;
          }

          td:first-child {
            padding: 0 0 0 0.5rem;
          }
        }
      }
    }
</style>

<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="modalTitle"
    v-model="show"
    :size="evaluateExecution && !publish ? 'xl' : 'lg'"
    centered
    @hidden="$emit('hidden')"
  >
    <PublishDialog
      v-if="publish"
      :pipeline="pipeline"
      :published-pipeline="publishedPipeline"
    />
    <div v-else-if="evaluateExecution">
      <BAlert
        v-if="isPublished"
        show
        variant="success">
        <span class="material-icons">
          check
        </span>
        <span class="ml-2 font-weight-bold">
          {{ name }}
        </span> is currently published.
      </BAlert>
      <Models
        :pipeline-id="pipeline.pipeline_definition_id"
      />
    </div>
    <div v-else-if="viewLogs">
      <PipelineLogs :pipeline-id="pipeline.pipeline_definition_id" />
    </div>
    <TableExecutionDetails
      v-else
      :pipeline-executions="executions"
      :pending-status="pendingStatus"
      :is-training="pipeline ? pipeline.pipeline_type === 'Training' : false"
      @viewLogs="setLogs"
      @refresh="(execution_id) => $emit('refresh', pipeline, execution_id)"
      @evaluate="setEvaluating"
    />
    <template #modal-footer="{ ok, cancel }">
      <div class="d-flex flex-row w-100">
        <BButton
          size="md"
          variant="link"
          class="pl-0"
          v-if="publish"
          @click="() => publish = false">
          <i class="material-icons-outlined mr-2">
            arrow_back
          </i>
          <span>
            Back
          </span>
        </BButton>
        <BButton
          size="md"
          variant="link"
          class="pl-0"
          v-else-if="evaluateExecution || viewLogs"
          @click="() => { evaluateExecution = false; viewLogs = false; }">
          <i class="material-icons-outlined mr-2">
            arrow_back
          </i>
          <span>
            Back
          </span>
        </BButton>
        <div class="d-flex flex-row ml-auto">
          <BButton
            size="md"
            variant="link"
            @click="cancel()">
            Cancel
          </BButton>
          <LoadingButton
            size="md"
            v-if="publish"
            variant="primary"
            label="Publish"
            :loading="loading"
            @click="handlePublish(ok)" />
          <BButton
            size="md"
            v-else-if="!evaluateExecution || isPublished"
            variant="primary"
            @click="ok()"
          >
            {{ 'OK' }}
          </BButton>
          <BButton
            size="md"
            v-else
            variant="primary"
            @click="setPublish()"
          >
            {{ `Publish...` }}
          </BButton>
        </div>
      </div>
    </template>
  </BModal>
</template>
<script>
import { BModal, BButton, BAlert } from 'bootstrap-vue';
import LoadingButton from '../../Shared/LoadingButton';
import PipelineLogs from '../PipelineLogs/index';
import TableExecutionDetails from '../Table/TableExecutionDetails';
import Models from '../../Models';
import PublishDialog from '../PublishPipelineModal/PublishDialog';
import { publishTrainingPipeline } from '../api/PipelineApi';

export default {
  name: 'ExecutionDetailsModal',
  components: {
    BModal,
    BButton,
    TableExecutionDetails,
    Models,
    BAlert,
    PublishDialog,
    LoadingButton,
    PipelineLogs,
  },
  props: {
    pipeline: {
      type: Object,
      default: () => ({}),
    },
    pendingStatus: {
      type: Array,
      default: () => [],
    },
    showModal: {
      type: Boolean,
    },
    showResults: {
      type: Boolean,
    },
    publishedPipeline: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      show: false,
      evaluateExecution: false,
      viewLogs: false,
      publish: false,
      loading: false,
    };
  },
  watch: {
    showModal(val) {
      this.show = val;
      this.evaluateExecution = false;
      this.viewLogs = false;
      this.publish = false;
      this.loading = false;
      if (val) {
        this.$emit('refresh', this.pipeline, null);
        if (this.showResults && this.executions.length > 0) {
          this.setEvaluating(this.executions[0]);
        }
      }
    },
  },
  computed: {
    name() {
      return this.pipeline ? this.pipeline.pipeline_name : '';
    },
    executions() {
      const { pipeline, evaluateExecution } = this;
      if (pipeline) {
        if (evaluateExecution) {
          return [evaluateExecution];
        }
        return pipeline.pipeline_executions;
      }
      return [];
    },
    isPublished() {
      if (!this.pipeline || !this.publishedPipeline) {
        return false;
      }

      return this.pipeline.pipeline_definition_id === this.publishedPipeline.pipeline_definition_id;
    },
    modalTitle() {
      if (this.publish) {
        return `Publish ${this.pipeline.pipeline_name}?`;
      } if (this.viewLogs) {
        return `${this.pipeline.pipeline_name} Logs`;
      }
      return `${this.name} ${this.evaluateExecution ? 'Results' : 'Execution Details'}`;
    },
  },
  methods: {
    setEvaluating(execution) {
      this.evaluateExecution = execution;
    },
    setLogs() {
      this.viewLogs = true;
    },
    setPublish() {
      this.publish = true;
    },
    handlePublish(ok) {
      this.loading = true;
      publishTrainingPipeline(this.pipeline.pipeline_definition_id)
        .then(() => {
          this.$emit('refreshPublish');
          ok();
        })
        .catch(() => {
          this.error = 'An error occured.';
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

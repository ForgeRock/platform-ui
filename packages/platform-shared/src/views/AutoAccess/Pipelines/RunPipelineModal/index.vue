<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="`Run ${name}`"
    v-model="show"
    size="lg"
    centered
    @hidden="$emit('hidden')"
  >
    <div
      v-if="loading"
      class="d-flex flex-row justify-content-center">
      <FrSpinner size="md" />
    </div>
    <div v-else-if="error">
      <BAlert
        show
        variant="warning">
        <i class="material-icons-outlined">
          warning_amber
        </i>
        <span v-html="error" />
      </BAlert>

      <div v-if="activePredictions.length > 0">
        <TableExecutionDetails
          :pipeline-executions="activePredictions"
          :pending-status="pendingStatus"
          :show-pipeline-name="true"
          @evaluate="$emit('evaluate', execution)"
          @refresh="(execution_id) => $emit('refresh', pipeline, execution_id)" />
      </div>
    </div>
    <div v-else-if="status">
      <BAlert
        show
        variant="info">
        <i class="material-icons-outlined">
          info
        </i>
        <span v-html="status" />
      </BAlert>
      <span v-if="pipeline">
        <TableExecutionDetails
          :pipeline-executions="activeExecution"
          :pending-status="pendingStatus"
          @refresh="(execution_id) => $emit('refresh', pipeline, execution_id)" />
      </span>
    </div>
    <p
      v-else
      class="m-0">
      Run {{ type }} Pipeline {{ name }}?
    </p>
    <template #modal-footer="{ ok, cancel }">
      <BButton
        size="md"
        variant="link"
        @click="cancel()">
        Cancel
      </BButton>
      <LoadingButton
        size="md"
        v-if="!status && !error"
        variant="primary"
        :label="$t('common.run')"
        :disabled="!init"
        :loading="loading && init"
        @click="handleRun" />
      <BButton
        size="md"
        variant="primary"
        v-else
        @click="ok()"
      >
        OK
      </BButton>
    </template>
  </BModal>
</template>
<script>
import { get } from 'lodash';
import { BModal, BButton, BAlert } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import LoadingButton from '../../Shared/LoadingButton';
import {
  runPipeline, savePipeline, getPipelineStatus, getPipelines, getPipelineById, isPipelineSuccess,
} from '../api/PipelineApi';
import TableExecutionDetails from '../Table/TableExecutionDetails';
import { getDataSourceById } from '../../DataSources/api/DataSourcesAPI';

export default {
  name: 'RunPipelineModal',
  components: {
    BModal,
    BButton,
    LoadingButton,
    FrSpinner,
    TableExecutionDetails,
    BAlert,
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
  },
  data() {
    return {
      show: false,
      loading: false,
      init: false,
      status: null,
      url: null,
      error: null,
      activePredictions: [],
      tempExecution: null,
    };
  },
  watch: {
    showModal(val) {
      this.show = val;
      if (val) {
        this.loading = false;
        this.init = false;
        this.error = null;
        this.status = null;
        this.url = null;
        this.activePredictions = [];
        this.tempExecution = null;

        this.validate();
      }
    },
    pendingStatus() {
      if (this.showModal) {
        if (this.activePredictions.length === 0 && !this.tempExecution) {
          this.validate();
        }
      }
    },
  },
  computed: {
    name() {
      return this.pipeline ? this.pipeline.pipeline_name : '';
    },
    type() {
      return this.pipeline ? this.pipeline.pipeline_type : '';
    },
    activeExecution() {
      let execution = null;
      if (this.pipeline && this.tempExecution) {
        execution = this.pipeline.pipeline_executions.find((ex) => ex.execution_id === this.tempExecution.execution_id);
      }
      return [execution || this.tempExecution];
    },
  },
  methods: {
    validate() {
      this.loading = true;
      this.checkValidDataSource().then((hasActiveDataSource) => {
        if (hasActiveDataSource) {
          this.checkForActivePredictionRun();
        } else {
          this.loading = false;
          this.init = true;
          this.error = 'Pipeline data source must be active.';
        }
      })
        .catch(() => {
          this.loading = false;
          this.error = 'Pipeline data source must be active.';
        });
    },
    checkValidDataSource() {
      return new Promise((resolve, reject) => {
        if (this.pipeline.pipeline_parameters.datasourceId) {
          getDataSourceById(this.pipeline.pipeline_parameters.datasourceId).then((response) => {
            if (response.items.length > 0) {
              resolve(response.items[0].isActive);
            } else {
              resolve(false);
            }
          });
        } else {
          reject(new Error(false));
        }
      });
    },
    checkValidTrainingPipeline() {
      return new Promise((resolve, reject) => {
        getPipelineById(this.pipeline.training_pipeline_definition_id)
          .then((result) => {
            const latestRunStatus = get(result.items[0], 'pipeline_executions[0].status', false);
            if (result.items.length === 0) {
              this.error = 'Prediction pipeline must have training pipeline defined.';
              reject(new Error(false));
            } else if (!isPipelineSuccess(latestRunStatus)) {
              this.error = `Training pipeline <span class="font-weight-bold">${get(result.items[0], 'pipeline_name', '')}</span> must complete successfully before prediction can run.`;
              reject(new Error(false));
            } else {
              resolve(true);
            }
          }).catch(() => {
            this.error = 'Prediction pipeline must have training pipeline defined.';
            reject(new Error(false));
          });
      });
    },
    checkForActivePredictionRun() {
      if (this.pipeline.pipeline_type === 'Prediction') {
        if (this.pipeline.training_pipeline_definition_id) {
          this.loading = true;
          this.checkValidTrainingPipeline()
            .then(() => {
              const filters = {
                must: [
                  {
                    term: {
                      'pipeline_type.keyword': 'Prediction',
                    },
                  },
                  {
                    term: {
                      'pipeline_executions.status': 'ACTIVE',
                    },
                  },
                ],
                must_not: [
                  {
                    term: {
                      pipeline_definition_id: this.pipeline.pipeline_definition_id,
                    },
                  },
                ],
              };
              getPipelines({}, '', [], filters).then((result) => {
                if (result.items.length > 0) {
                  this.activePredictions = result.items[0].pipeline_executions.map((execution) => ({ ...execution, pipeline_name: result.items[0].pipeline_name }));
                  this.error = `Cannot execute multiple prediction pipelines concurrently. Prediction pipeline <span class="font-weight-bold">${result.items[0].pipeline_name}</span> is in progress.`;
                }
              }).catch(() => {
                // No other predictions running
              }).finally(() => {
                this.loading = false;
                this.init = true;
              });
            })
            .catch(() => {
              //
            })
            .finally(() => {
              this.loading = false;
              this.init = true;
            });
        } else {
          this.loading = false;
          this.init = true;
          this.error = 'Prediction pipeline must have training pipeline defined.';
        }
      } else {
        this.loading = false;
        this.init = true;
      }
    },
    handleRun() {
      this.loading = true;
      this.error = null;
      this.status = null;
      this.url = null;

      runPipeline(this.pipeline.pipeline_definition_id, this.pipeline.ueba_risk_threshold)
        .then((response) => {
          this.loading = false;
          if (response.error) {
            this.error = response.error;
            this.$emit('error');
          } else {
            this.status = response.message;
            this.url = response.gcp_url;

            this.$emit('refresh', this.pipeline, 'temp_execution');
            this.$emit('refresh', this.pipeline, response.executionID);

            const time = Date.now().toString();
            this.tempExecution = {
              execution_id: response.executionID,
              start_time: parseInt(time.substring(0, time.length - 3), 10),
              status: 'ACTIVE',
            };

            getPipelineStatus(response.executionID)
              .then((reply) => {
                const newExecution = {
                  execution_id: reply.name,
                  status: reply.state,
                  start_time: parseInt(reply.startTime.seconds, 10),
                  end_time: null,
                };
                savePipeline({
                  ...this.pipeline,
                  pipeline_executions: [newExecution, ...this.pipeline.pipeline_executions],
                }).then(() => {
                  this.$emit('updatePipelines');
                });
              })
              .catch(() => {
                this.loading = false;
              });
          }
        })
        .catch((err) => {
          this.loading = false;
          this.$emit('error');
          this.error = err;
        });
    },
  },
};
</script>

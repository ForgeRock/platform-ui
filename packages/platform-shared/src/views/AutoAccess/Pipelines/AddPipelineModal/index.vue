<!-- Copyright (c) 2022-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="title"
    v-model="show"
    size="lg"
    centered
    @hidden="$emit('hidden')"
  >
    <div class="add-pipeline-modal">
      <div>
        <p v-if="!initialPipeline">
          {{ $t('autoAccess.access.pipelines.addPipelineModal.helpTextDefault') }}
        </p>
        <p v-else>
          {{ $t(`autoAccess.access.pipelines.addPipelineModal.helpText${type.name}`) }}
        </p>
        <div class="mb-4">
          <FrBasicInput
            label="Name"
            autocomplete="false"
            :value="pipelineName"
            @input="updateName"
            id="new-pipeline-name"
          />
        </div>
      </div>
      <div class="mt-3">
        <DataSourceSelect
          @value-change="(id) => selectDataSource(id)"
          :datasource-id="datasourceId"
        />
      </div>
      <div
        class="mt-3"
      >
        <BDropdown
          variant="none"
          boundary="window"
          :class="`border mr-2 ${initialPipeline ? 'bg-light' : ''}`"
          :disabled="!!initialPipeline"
        >
          <template #button-content>
            <span class="text-dark">
              <span
                v-if="type"
                aria-hidden="true"
                class="mr-2 md-24 material-icons-outlined">
                {{ type.icon }}
              </span>
              <span class="mr-6">
                {{ type ? $t(`autoAccess.access.pipelines.types["${type.name}"]`) : $t(`autoAccess.access.pipelines.buttons.selectType`) }}
              </span>
            </span>
          </template>
          <BDropdownItem
            v-for="dropdownItemType in types"
            :key="dropdownItemType.name"
            @click="selectType(dropdownItemType)"
          >
            <span
              aria-hidden="true"
              class="mr-2 md-24 material-icons-outlined">
              {{ dropdownItemType.icon }}
            </span>
            <span>
              {{ $t(`autoAccess.access.pipelines.types["${dropdownItemType.name}"]`) }}
            </span>
          </BDropdownItem>
        </BDropdown>
      </div>
      <div
        class="mt-3"
        v-if="type ? type.name === 'Training' : false">
        <PipelineParametersForm
          :parameters="parameters"
          @parameter-change="({value, parameter, field}) => updateParameterValue(value, parameter, field)"
          :parameter-validation="parameterValidation"
        />
      </div>

      <div v-else-if="type ? type.name === 'Prediction' : false">
        <div class="mt-3">
          <TrainingPipelineSelect
            @value-change="(id) => selectTrainingPipeline(id)"
            :training-pipeline-id="trainingId"
            :pipeline-id="initialPipeline ? initialPipeline.pipeline_definition_id : null"
          />
        </div>
        <div class="mt-3">
          <FrField
            :field="uebaRiskField"
            :failed-policies="uebaRiskValidation"
            @valueChange="(value) => updateUebaRiskThreshold(value)"
          />
        </div>
      </div>
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        size="md"
        variant="link"
        @click="cancel()">
        {{ $t("autoAccess.access.pipelines.addPipelineModal.buttons.cancel") }}
      </BButton>
      <LoadingButton
        size="md"
        variant="primary"
        :label="$t('autoAccess.access.pipelines.addPipelineModal.buttons.save')"
        :loading="loading"
        :disabled="!validForm"
        @click="save" />
    </template>
  </BModal>
</template>
<script>
import {
  BModal, BButton, BDropdown, BDropdownItem,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import _ from 'lodash';
import FrField from '../../Shared/Field';
import FrBasicInput from '../../Shared/Field/Basic';
import LoadingButton from '../../Shared/LoadingButton';
import { defaultPipelineParameters, savePipeline, trainingTypes } from '../api/PipelineApi';
import DataSourceSelect from './DataSourceSelect';
import TrainingPipelineSelect from './TrainingPipelineSelect';
import PipelineParametersForm from './PipelineParametersForm';

export default {
  name: 'AddPipelineModal',
  components: {
    BModal,
    BButton,
    FrBasicInput,
    BDropdown,
    LoadingButton,
    BDropdownItem,
    DataSourceSelect,
    TrainingPipelineSelect,
    PipelineParametersForm,
    FrField,
  },
  props: {
    showModal: {
      type: Boolean,
    },
    initialPipeline: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      pipelineName: '',
      type: null,
      loading: false,
      datasourceId: '',
      trainingId: '',
      parameters: defaultPipelineParameters(),
      uebaRiskThreshold: 50,
      executions: [],
      show: false,
      parameterValidation: {},
      uebaRiskValidation: [],
    };
  },
  watch: {
    showModal(val) {
      this.show = val;
      if (val) {
        if (this.initialPipeline) {
          const initialParameters = _.cloneDeep(this.initialPipeline.pipeline_parameters);

          this.pipelineName = this.initialPipeline.pipeline_name;
          this.type = this.types.find((type) => type.name === this.initialPipeline.pipeline_type) || {};
          this.datasourceId = initialParameters.datasourceId || '';
          this.trainingId = this.initialPipeline.training_pipeline_definition_id || '';
          this.executions = this.initialPipeline.pipeline_executions;
          this.uebaRiskThreshold = this.initialPipeline.ueba_risk_threshold || 50;

          delete initialParameters.datasourceId;
          this.parameters = initialParameters;
        } else {
          this.pipelineName = '';
          this.type = null;
          this.datasourceId = '';
          this.trainingId = '';
          this.parameters = defaultPipelineParameters();
          this.executions = [];
          this.uebaRiskThreshold = 50;
        }
      }
    },
    parameters: {
      deep: true,
      immediate: true,
      handler() {
        const v = {
          total: 0,
        };
        Object.keys(this.parameters)
          .forEach((key) => {
            v[key] = {
              total: 0,
              errors: {},
            };
            Object.keys(this.parameters[key])
              .forEach((pKey) => {
                v[key].errors[pKey] = this.validateParameterField(pKey, this.parameters[key][pKey]);
                v[key].total += v[key].errors[pKey].length;
              });
            v.total += v[key].total;
          });

        this.parameterValidation = v;
      },
    },
    uebaRiskThreshold: {
      handler(val) {
        this.uebaRiskValidation = this.validateParameterField('ueba_risk', val);
      },
    },
  },
  computed: {
    title() {
      if (this.initialPipeline) {
        return 'Edit Pipeline';
      }
      return this.$t('autoAccess.access.pipelines.addPipelineModal.header');
    },
    types() {
      return trainingTypes;
    },
    validForm() {
      if (this.type) {
        if (!this.pipelineName || !this.datasourceId) {
          return false;
        }
        if (this.type.name === 'Training') {
          return this.parameterValidation.total === 0;
        }
        if (this.type.name === 'Prediction') {
          return this.uebaRiskValidation.length === 0 && !!this.trainingId;
        }
        return true;
      }
      return false;
    },
    uebaRiskField() {
      return {
        type: 'integer',
        value: this.uebaRiskThreshold,
        title: 'Risk Threshold',
      };
    },
  },
  methods: {
    updateName(val) {
      this.pipelineName = val.trim();
    },
    selectType(type) {
      this.type = type;
    },
    save() {
      const {
        // eslint-disable-next-line camelcase
        pipelineName, type, parameters, datasourceId, trainingId, executions,
      } = this;
      const pipelineType = type.name;
      const trainingPipelineId = pipelineType === 'Prediction' ? trainingId : null;
      const trainingParameters = pipelineType === 'Training' ? parameters : {};
      const id = this.initialPipeline ? this.initialPipeline.pipeline_definition_id : null;
      const uebaRiskThreshold = pipelineType === 'Prediction' ? this.uebaRiskThreshold : null;
      this.loading = true;
      savePipeline({
        pipeline_definition_id: id,
        pipeline_name: pipelineName,
        pipeline_type: pipelineType,
        pipeline_parameters: {
          ...trainingParameters,
          datasourceId,
        },
        training_pipeline_definition_id: trainingPipelineId,
        pipeline_executions: executions,
        pipeline_created: dayjs().utc().format(),
        ueba_risk_threshold: uebaRiskThreshold,
      })
        .then((result) => {
          this.$emit('saved', result);
          this.loading = false;
        })
        .catch(() => {
          // todo error handling
          this.loading = true;
        });
    },
    selectDataSource(value) {
      this.datasourceId = value;
    },
    selectTrainingPipeline(value) {
      this.trainingId = value;
    },
    updateParameterValue(value, parameter, field) {
      this.parameters[parameter][field] = value;
    },
    updateUebaRiskThreshold(value) {
      this.uebaRiskThreshold = value;
    },
    validateParameterField(field, value) {
      if (value === '' || value === null) {
        return ['Must be defined.'];
      }
      if (field === 'ueba_risk') {
        if (value < 0) {
          return ['Must be greater than or equal to zero.'];
        } if (value > 100) {
          return ['Must be less than or equal to 100.'];
        }
      } else if (value <= 0) {
        return ['Must be greater than zero.'];
      }
      if (field !== 'learning_rate' && !Number.isInteger(value)) {
        return ['Must be an integer.'];
      }

      let errors = [];

      switch (field) {
        case 'batch_size':
          if (value % 8 !== 0) {
            return ['Must be multiple of 8.'];
          }
          if (value > 10000) {
            return ['Must be less than 10,000.'];
          }
          break;
        case 'epochs':
          if (value < 300) {
            return ['Must be greater than or equal to 300.'];
          }
          if (value > 10000) {
            return ['Must be less than or equal to 10,000.'];
          }
          break;
        case 'learning_rate':
          if (value <= 0 || value >= 1) {
            return ['Must be greater than 0 and less than 1.'];
          }
          break;
        case 'window':
          if (value !== 3 && value !== 5 && value !== 7 && value !== 9 && value !== 11) {
            return ['Must be 3, 5, 7, 9, or 11.'];
          }
          break;
        case 'embedding_dimension':
          if (value < 5) {
            return ['Must be greater than or equal to 5.'];
          }
          if (value > 100) {
            return ['Must be less than or equal to 100.'];
          }
          break;
        case 'min_number_of_clusters':
          if (value < 3) {
            errors = ['Must be greater than or equal to 3.'];
          }
          if (value > 100) {
            errors = ['Must be less than or equal to 100.'];
          }
          if (this.parameters['Model C'].max_number_of_clusters <= value) {
            errors.push(' Must be less than Max Number of Clusters.');
          }
          return errors;
        case 'max_number_of_clusters':
          if (value < 10) {
            errors = ['Must be greater than or equal to 10.'];
          }
          if (value > 1000) {
            errors = ['Must be less than or equal to 1000.'];
          }
          if (this.parameters['Model C'].min_number_of_clusters >= value) {
            errors.push(' Must be greater than Min Number of Clusters.');
          }
          return errors;
        default:
          return [];
      }

      return [];
    },
  },
};
</script>

<style lang="scss">
  .add-pipeline-modal {
    .dropdown {
      border: 1px solid #c0c9d5 !important;
      border-radius: 0.25rem;
    }
  }
</style>

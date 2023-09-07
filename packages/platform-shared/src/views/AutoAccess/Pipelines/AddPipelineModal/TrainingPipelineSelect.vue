<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="data-source-select">
    <FrField
      :field="dataSourceField"
      @valueChange="(value) => selectPipeline(value)"
      @search-change="value => updateSearch(value)"
    >
      <template #option="{ option }">
        {{ option.text }}
      </template>
      <template #singleLabel="{ option }">
        {{ option.text }}
      </template>
    </FrField>
  </div>
</template>
<script>
import FrField from '../../Shared/Field';
import { getPipelines } from '../api/PipelineApi';

export default {
  name: 'TrainingPipelineSelect',
  components: {
    FrField,
  },
  props: {
    trainingPipelineId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      options: [],
      searchTerm: '',
    };
  },
  computed: {
    dataSourceField() {
      return {
        type: 'select',
        value: this.trainingPipelineId,
        options: this.options.map((pipeline) => (
          {
            text: pipeline.pipeline_name,
            value: pipeline.pipeline_definition_id,
          }
        )),
        title: 'Training Pipeline',
      };
    },
  },
  watch: {
    searchTerm: {
      immediate: true,
      handler() {
        this.setOptions();
      },
    },
  },
  methods: {
    updateSearch(val) {
      this.searchTerm = val;
    },
    setOptions() {
      const filters = {
        must: [
          {
            term: {
              'pipeline_type.keyword': 'Training',
            },
          },
        ],
      };
      getPipelines({}, this.searchTerm, '', filters).then((result) => {
        this.options = result.items;
      });
    },
    selectPipeline(val) {
      this.$emit('value-change', val);
    },
  },
};
</script>

<style lang="scss">
</style>

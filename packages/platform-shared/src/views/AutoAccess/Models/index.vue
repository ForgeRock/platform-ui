<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BAlert
      variant="info"
      show>
      <div class="d-flex flex-row align-items-center">
        <i class="material-icons-outlined">
          info
        </i>
        <div class="ml-2">
          {{ $t('autoAccess.access.info.professionalUseOnly') }}
        </div>
      </div>
    </BAlert>
    <div class="d-flex align-items-center mb-3">
      <div class="w-75" />
      <div class="w-25">
        <FrField
          :field="field"
        />
      </div>
    </div>
    <RocPR
      :model-id="field.value"
      :pipeline-id="pipelineId"
      @update="(data) => setOptions(data)"
    />
  </div>
</template>

<script>
import { BAlert } from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrField from '../Shared/Field';
import RocPR from './RocPR';

export default {
  name: 'Settings',
  components: {
    FrField,
    RocPR,
    BAlert,
  },
  props: {
    pipelineId: {
      type: String,
      default: '',
    },
  },
  mixins: [NotificationMixin],
  data() {
    return {
      field: {
        type: 'select',
        title: 'Model',
        value: null,
        allowEmpty: true,
        options: [],
      },
    };
  },
  methods: {
    setOptions(data) {
      const titles = [
        { key: 'ensemble_curves', title: 'Ensemble' },
        { key: 'modelA', title: 'Model A' },
        { key: 'modelB', title: 'Model B' },
        { key: 'cluster_curves', title: 'Model C' },
      ];
      this.field.options = titles.map((option) => {
        if (data[option.key]) {
          return {
            value: option.key,
            text: option.title,
          };
        }
        return null;
      }).filter((option) => !!option);

      if (!this.field.value) {
        this.field.value = this.field.options[0].value;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>

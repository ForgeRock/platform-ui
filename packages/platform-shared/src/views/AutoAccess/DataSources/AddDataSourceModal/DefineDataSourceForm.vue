<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div v-if="error">
      <InvalidFileAlert />
    </div>
    <p>
      {{ helpText }}
    </p>
    <div class="mb-4">
      <FrBasicInput
        label="Name"
        @input="updateDataSourceName"
        :value="name"
        id="define-data-source-name"
      />
    </div>
    <div class="mb-4">
      <FrBasicInput
        label="Bucket Name"
        :value="dataSource.bucket"
        id="define-data-source-bucket-name"
        :readonly="true"
      />
    </div>
    <div class="mb-4">
      <FrBasicInput
        :label="dataSource.isPrefix ? 'Prefix' : dataSource.isFolder ? 'Directory' : 'Object'"
        :value="dataSource.prefix"
        id="define-data-source-object-name"
        :readonly="true"
      />
    </div>
    <div
      class="px-2 mb-4"
      v-if="dataSource.size_formatted">
      <h5>
        Size
      </h5>
      <div class="text-dark">
        {{ dataSource.size_formatted }}
      </div>
    </div>
    <div class="px-2">
      <PreviewFileJSON
        :bucket="dataSource.bucket"
        :prefix="dataSource.prefix"
        :collapsible="true"
      />
    </div>
  </div>
</template>
<script>

import FrBasicInput from '../../Shared/Field/Basic';
import InvalidFileAlert from '../InvalidFileAlert';
import PreviewFileJSON from '../PreviewFileJSON';

export default {
  name: 'DefineDataSourceForm',
  components: {
    FrBasicInput,
    InvalidFileAlert,
    PreviewFileJSON,
  },
  props: {
    error: {
      type: Boolean,
    },
    dataSource: {
      type: Object,
      default: () => ({}),
    },
    initialName: {
      type: String,
      default: '',
    },
    helpText: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      name: '',
    };
  },
  mounted() {
    if (this.initialName) {
      this.name = this.initialName;
    }
  },
  methods: {
    updateDataSourceName(val) {
      this.$emit('updateName', val.trim());
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

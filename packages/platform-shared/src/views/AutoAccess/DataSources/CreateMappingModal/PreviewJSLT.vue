<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="preview-jslt">
    <h5 class="mb-0">
      {{ label }}
    </h5>
    <div class="mt-2">
      <div v-if="loading">
        <FrSpinner
          size="md"
          class="py-3" />
      </div>
      <div v-else-if="error">
        error
      </div>
      <div
        v-else
        class="preview-jslt-container">
        <pre
          style="background: var(--light);"
          class="p-3 my-0">{{ jslt }}</pre>
      </div>
    </div>
  </div>
</template>
<script>
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { getJSLTPreview } from '../api/DataSourcesAPI';

export default {
  name: 'PreviewJSLT',
  components: {
    FrSpinner,
  },
  props: {
    previewJSON: {
      type: Object,
      default: () => ({}),
    },
    mapping: {
      type: Object,
      default: () => ({}),
    },
    label: {
      required: false,
      default: 'Feature Mapping Preview',
      type: String,
    },
  },
  data() {
    return {
      jslt: null,
      loading: false,
      error: null,
    };
  },
  mounted() {
    this.getPreview();
  },
  methods: {
    getPreview() {
      this.loading = true;
      const jsltMapping = {};

      Object.keys(this.mapping).forEach((key) => {
        const item = this.mapping[key];
        jsltMapping[item.key] = item.value;
      });
      getJSLTPreview(this.previewJSON, jsltMapping).then((result) => {
        this.jslt = JSON.stringify(result.result, null, 2);
        this.loading = false;
      });
    },
  },
};
</script>
<style lang="scss">
  .preview-jslt {
    &-container {
      max-height: calc(100vh - 32rem);
      overflow: auto;
    }
  }
</style>

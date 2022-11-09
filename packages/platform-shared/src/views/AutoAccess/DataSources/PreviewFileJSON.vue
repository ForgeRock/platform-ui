<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="data-source-preview">
    <BButton
      v-if="collapsible"
      variant="link"
      class="p-0"
      :aria-controls="id"
      :aria-expanded="visible ? 'true' : 'false'"
      @click="visible = !visible"
    >
      <h5 class="mb-0">
        {{ label }}
        <span
          v-if="!visible"
          class="material-icons-outlined">
          expand_more
        </span>
        <span
          v-else
          class="material-icons-outlined">
          expand_less
        </span>
      </h5>
    </BButton>
    <h5
      v-else
      class="mb-0">
      {{ label }}
    </h5>
    <BCollapse
      v-model="visible"
      :id="id"
    >
      <div class="mt-2">
        <div v-if="loading">
          <FrSpinner
            size="md"
            class="py-3" />
        </div>
        <div v-else-if="error">
          <InvalidFileAlert />
        </div>
        <div
          v-else
          class="data-source-preview-container">
          <pre
            style="background: var(--light);"
            class="p-3 my-0">{{ json }}</pre>
        </div>
      </div>
    </BCollapse>
  </div>
</template>
<script>
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { BCollapse, BButton } from 'bootstrap-vue';
import { v4 as uuidv4 } from 'uuid';
import InvalidFileAlert from './InvalidFileAlert';
import { getFilePreview, getFirstFile } from './api/DataSourcesAPI';

export default {
  name: 'PreviewFileJSON',
  components: {
    FrSpinner,
    BCollapse,
    BButton,
    InvalidFileAlert,
  },
  props: {
    bucket: {
      type: String,
      default: '',
    },
    prefix: {
      type: String,
      default: '',
    },
    collapsible: Boolean,
    label: {
      required: false,
      default: 'Data Source Preview',
      type: String,
    },
  },
  data() {
    return {
      id: `collapse-${uuidv4()}`,
      json: null,
      loading: false,
      error: null,
      visible: !this.collapsible || false,
    };
  },
  watch: {
    bucket() {
      this.getPreview();
    },
    prefix() {
      this.getPreview();
    },
    visible(val) {
      if (val && !this.json) {
        this.getPreview();
      }
    },
  },
  mounted() {
    this.getPreview();
  },
  methods: {
    getPreview() {
      if (this.bucket && this.prefix) {
        this.loading = true;
        this.error = null;
        getFirstFile(this.bucket, this.prefix)
          .then((response) => {
            const file = response;
            this.previewFile = file;

            getFilePreview(file.bucket, file.name)
              .then((result) => {
                if (result.previewContent) {
                  this.$emit('update-preview', result.previewContent);
                  this.json = JSON.stringify(result.previewContent, null, 2);
                }
                this.loading = false;
              })
              .catch((err) => {
                this.error = err;
                this.$emit('error');
                this.loading = false;
              });
          })
          .catch((err) => err);
      }
    },
  },
};
</script>
<style lang="scss">
  .data-source-preview {
    .btn-link {
      &:hover,
      &:focus,
      &.focus {
        text-decoration: none;
      }
    }

    &-container {
      max-height: calc(100vh - 32rem);
      overflow: auto;
    }
  }
</style>

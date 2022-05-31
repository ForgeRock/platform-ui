<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="`${dataSource ? dataSource.name + ' ' : ''}` + $t('autoAccess.access.dataSources.createMappingModal.header')"
    v-model="show"
    size="lg"
    body-class="create-mapping-modal"
    centered
    @hidden="$emit('hidden')"
  >
    <div
      class="p-3 border-bottom"
      v-if="error"
    >
      <BAlert
        class="m-0"
        show
        variant="danger">
        <i class="material-icons-outlined">
          error_outline
        </i>
        {{ error }}
      </BAlert>
    </div>
    <div v-if="dataSource">
      <div
        class="p-3 border-bottom"
        v-if="!readOnly"
      >
        <PreviewFileJSON
          :collapsible="true"
          :bucket="location.bucket"
          :prefix="location.prefix"
          @update-preview="updatePreviewJSON"
        />
      </div>
      <div v-if="view === 'mapping'">
        <Mapping
          :data-source="dataSource"
          :mapping="mapping"
          :read-only="readOnly"
          @updateMapping="updateMapping"
        />
      </div>
      <div
        v-else
        class="p-3">
        <PreviewJSLT
          :data-source="dataSource"
          :mapping="mapping"
          :preview-j-s-o-n="previewJSON"
        />
      </div>
      <div
        v-if="!init"
        class="position-absolute h-100 w-100 d-flex flex-column justify-content-center bg-light opacity-70"
        style="top: 0; left: 0;">
        <FrSpinner
          size="md"
          variant="primary"
        />
      </div>
    </div>
    <template #modal-footer="{ cancel }">
      <div class="d-flex flex-row w-100">
        <BButton
          size="md"
          variant="link"
          class="pl-0"
          v-if="view === 'previewJSLT'"
          @click="changeView('mapping')">
          <i class="material-icons-outlined mr-2">
            arrow_back
          </i>
          <span>
            Edit Mapping
          </span>
        </BButton>
        <div class="d-flex flex-row ml-auto">
          <BButton
            size="md"
            variant="link"
            @click="cancel()">
            {{ $t("common.cancel") }}
          </BButton>
          <LoadingButton
            size="md"
            v-if="view === 'previewJSLT'"
            variant="primary"
            :label="$t(&quot;common.save&quot;)"
            :loading="loading"
            @click="save" />
          <BButton
            v-else-if="view === 'mapping' && !readOnly"
            size="md"
            variant="primary"
            @click="changeView('previewJSLT')"
          >
            Preview Feature Mapping
          </BButton>
          <BButton
            v-else-if="view === 'mapping' && readOnly"
            size="md"
            variant="primary"
            @click="cancel()">
            OK
          </BButton>
        </div>
      </div>
    </template>
  </BModal>
</template>
<script>
import { BModal, BButton, BAlert } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import LoadingButton from '../../Shared/LoadingButton';
import PreviewFileJSON from '../PreviewFileJSON';
import {
  updateDataSource, getFirstFile, getFilePreview, getFlattenedJSON, getBucketAndPrefixFromLocation,
} from '../api/DataSourcesAPI';
import store from '@/store';
import Mapping from './Mapping';
import PreviewJSLT from './PreviewJSLT';

export default {
  name: 'CreateMappingModal',
  components: {
    BModal,
    BButton,
    BAlert,
    LoadingButton,
    Mapping,
    PreviewJSLT,
    FrSpinner,
    PreviewFileJSON,
  },
  props: {
    dataSource: {
      type: Object,
    },
    showModal: {
      type: Boolean,
    },
  },
  data() {
    return {
      init: false,
      show: false,
      loading: false,
      readOnly: false,
      error: false,
      view: 'mapping',
      previewJSON: {},
      mapping: {},
    };
  },
  computed: {
    features() {
      return store.state.DataSources.auth_properties;
    },
    location() {
      return getBucketAndPrefixFromLocation(this.dataSource.input);
    },
  },
  watch: {
    showModal(val) {
      this.show = val;
      if (val) {
        this.init = false;
        this.error = false;
        this.view = 'mapping';
        const ds = this.dataSource;
        this.readOnly = ds.is_ootb;
        const location = getBucketAndPrefixFromLocation(this.dataSource.input);

        this.initializeMap();

        getFirstFile(location.bucket, location.prefix)
          .then((response) => {
            const file = response;

            if (!this.readOnly) {
              getFilePreview(file.bucket, file.name)
                .then((res) => {
                  const options = getFlattenedJSON(res.previewContent);

                  this.mapFeatures(options);
                });
            } else {
              this.mapFeatures();
            }
          })
          .catch((err) => {
            // no file in bucket; streaming data source
            this.readOnly = true;

            this.mapFeatures();
          });
      }
    },
  },
  methods: {
    mapFeatures(options = []) {
      const map = this.mapping;
      const ds = this.dataSource;

      this.features.forEach((feature) => {
        map[feature.key].value = ds.feature_mapping[feature.key];
        map[feature.key].options = options;
      });

      this.mapping = map;
      this.init = true;
    },
    changeView(view) {
      this.view = view;
      this.error = false;
    },
    updatePreviewJSON(json) {
      this.previewJSON = json;
    },
    updateMapping(map) {
      this.mapping = map;
    },
    initializeMap() {
      const map = {};

      this.features.forEach((feature) => {
        map[feature.key] = {
          value: '',
          key: feature.key,
          type: 'select',
          title: feature.display,
          options: [],
        };
      });

      this.mapping = map;
    },
    save() {
      const map = {};
      Object.keys(this.mapping).forEach((key) => {
        map[key] = this.mapping[key].value;
      });
      this.loading = true;
      this.error = false;

      updateDataSource({ ...this.dataSource, feature_mapping: map })
        .then(() => {
          this.loading = false;
          this.$emit('saved', {});
        })
        .catch((err) => {
          this.loading = false;
          this.error = 'An error occured saving mapping.';
        });
    },
  },
};
</script>

<style lang="scss" scoped>
  ::v-deep
  .create-mapping-modal {
    &.modal-body {
      padding: 0;
    }
  }
</style>

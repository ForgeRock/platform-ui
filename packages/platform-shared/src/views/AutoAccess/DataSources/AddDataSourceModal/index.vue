<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="$t(`${dictionaryPath}.header`)"
    v-model="show"
    size="xl"
    centered
    @hidden="$emit('hidden')"
  >
    <div
      class="add-data-source-modal"
    >
      <BAlert
        v-if="error"
        show
        variant="danger">
        <i class="material-icons-outlined">
          error_outline
        </i>
        {{ error }}
      </BAlert>
      <div :class="{'d-none': preview || define || previewConfigObj}">
        <p>
          {{ $t(`${dictionaryPath}.helpText`) }}
        </p>
        <div
          class="position-relative"
          style="z-index: 2;"
        >
          <BucketSelect
            @select="updateBucket"
          />
        </div>
        <div
          class="d-flex flex-row justify-content-between mt-3 position-relative"
          style="z-index: 1;"
        >
          <div class="flex-grow-1">
            <FrSearchInput
              placeholder="Object Prefix"
              class="flex-grow-1"
              :readonly="!bucket"
              :value="objectSearchTerm"
              @input="updateObjectSearchTerm"
            />
          </div>
          <BButton
            v-if="type !== 'risk-config'"
            size="md"
            class="ml-2"
            variant="primary"
            :disabled="!bucket"
            @click="defineFromPrefix">
            {{ "Define from Prefix" }}
          </BButton>
        </div>
      </div>
      <div
        v-if="define"
        class="add-data-source-modal-define-form">
        <DefineDataSourceForm
          :help-text="$t(`${dictionaryPath}.helpTextDefine`)"
          :data-source="define.row"
          :error="errorCache[define.row.id]"
          @updateName="updateDataSourceName"
        />
      </div>
      <div v-else-if="preview">
        <p>
          {{ $t(`autoAccess.access.dataSources.addDataSourceModal.helpTextPreview`) }}
        </p>
        <div class="mb-4">
          <FrBasicInput
            label="Bucket Name"
            :value="preview.bucket"
            id="new-data-source-bucket-prefix-preview"
            :readonly="true"
          />
        </div>
        <div class="mb-4">
          <FrBasicInput
            :label="preview.isFolder ? 'Object Prefix' : 'Object'"
            :value="preview.prefix"
            id="new-data-source-bucket-prefix-preview"
            :readonly="true"
          />
        </div>
        <PreviewFileJSON
          :prefix="preview.prefix"
          :bucket="preview.bucket"
          @error="setError(preview.id)"
        />
      </div>
      <div v-else-if="previewConfigObj">
        <RiskConfigEvaluationPreview
          :data-source="previewConfigObj"
          :process-j-s-o-n="processJSON"
        />
      </div>
      <div
        class="mt-3"
        style="margin: 0 0 -1rem 0;"
        v-if="!preview && !define && !previewConfigObj && bucket"
      >
        <FrTable
          small
          :items="tablePage"
          :show-empty="objects.length === 0"
          :fields="fields">
          <template #empty>
            <div v-if="loading">
              <FrSpinner
                size="md"
                class="p-3" />
            </div>
            <div
              v-else
              class="text-dark text-center">
              {{ $t("autoAccess.access.dataSources.emptyTableObjects") }}
            </div>
          </template>
        </FrTable>
        <FrPagination
          :current-page="page"
          :last-page="isLastPage"
          @pagination-change="pageChange" />
      </div>
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        size="md"
        variant="link"
        v-if="preview || define || previewConfigObj"
        class="mr-auto pl-0"
        @click="backToList()">
        <i class="material-icons-outlined mr-2">
          arrow_back
        </i>
        <span>
          {{ $t(`common.back`) }}
        </span>
      </BButton>

      <span v-if="preview">
        <LoadingButton
          size="md"
          variant="primary"
          :label="$t(`${dictionaryPath}.buttons.define`)"
          :loading="loading"
          :disabled="errorCache[preview.id]"
          @click="type === 'risk-config' ? getConfigurationPreview(preview) : defineDataSource(preview)" />
      </span>
      <BButton
        size="md"
        variant="link"
        v-else-if="!preview"
        @click="cancel()">
        {{ $t(`common.cancel`) }}
      </BButton>
      <LoadingButton
        size="md"
        variant="primary"
        :label="$t(`common.save`)"
        :loading="loading"
        v-if="define"
        :disabled="define.name === '' || errorCache[define.row.id]"
        @click="save" />

      <LoadingButton
        size="md"
        variant="primary"
        :label="&quot;Save Config&quot;"
        :loading="loading"
        v-else-if="previewConfigObj"
        @click="save" />
    </template>
  </BModal>
</template>
<script>
import {
  BButton, BModal, BAlert,
} from 'bootstrap-vue';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import { v4 as uuidv4 } from 'uuid';
import FrBasicInput from '../../Shared/Field/Basic';
import FrPagination from '../../Shared/DataTable/Pagination';
import LoadingButton from '../../Shared/LoadingButton';
import {
  searchObjects, isValidFile, saveDataSource, apiToInternalGCSObject, defaultDataSourceFromBucket,
} from '../api/DataSourcesAPI';
import BucketSelect from './BucketSelect';
import PreviewFileJSON from '../PreviewFileJSON';
import DefineDataSourceForm from './DefineDataSourceForm';
import RiskConfigEvaluationPreview from '../../RiskConfig/RiskConfigEvaluationPreview';
import { saveRiskConfig } from '../../RiskConfig/api/RiskConfigAPI';
import FrTable from '../../Shared/DataTable';

export default {
  name: 'AddDataSourceModal',
  components: {
    BModal,
    BButton,
    BAlert,
    BucketSelect,
    FrSearchInput,
    FrTable,
    LoadingButton,
    FrPagination,
    FrBasicInput,
    FrSpinner,
    PreviewFileJSON,
    DefineDataSourceForm,
    RiskConfigEvaluationPreview,
  },
  props: {
    showModal: {
      type: Boolean,
    },
    type: {
      default: '',
      type: String,
    },
    processJSON: {
      default: () => {},
      type: [Object, Array],
    },
    processID: {
      default: '',
      type: String,
    },
  },
  data() {
    const dictionaryPath = this.type === 'risk-config' ? 'autoAccess.access.riskConfig.riskConfigPreviewModal' : 'autoAccess.access.dataSources.addDataSourceModal';
    return {
      show: false,
      objectSearchTerm: '',
      bucket: null,
      loading: false,
      error: false,
      objects: [],
      page: 0,
      recordsPerPage: 6,
      totalRecords: 0,
      preview: null,
      define: null,
      previewConfigObj: null,
      dictionaryPath,
      fields: [
        {
          key: 'material_icon',
          label: '',
        },
        {
          key: 'prefix',
          label: this.$t('autoAccess.access.dataSources.addDataSourceModal.table.headers.name'),
        },
        {
          key: 'size_formatted',
          label: this.$t('autoAccess.access.dataSources.addDataSourceModal.table.headers.size'),
        },
        {
          key: 'created_formatted',
          label: this.$t('autoAccess.access.dataSources.addDataSourceModal.table.headers.created'),
        },
        {
          key: 'dropdown',
          label: '',
        },
      ],
      errorCache: {},
    };
  },
  watch: {
    showModal(val) {
      this.show = val;
      if (val) {
        this.objects = [];
        this.objectSearchTerm = '';
        this.bucket = null;
        this.page = 0;
        this.totalRecords = 0;
        this.preview = null;
        this.define = null;
        this.previewConfigObj = null;
        this.loading = false;
        this.error = false;
      }
    },
    objectSearchTerm() {
      this.getObjectData();
    },
    page(val) {
      this.getObjectData(val);
    },
    define(val) {
      if (val) {
        if (!val.row.isPrefix && !val.row.isFolder) {
          if (!this.errorCache[val.row.id]) {
            isValidFile(val.row.bucket, val.row.prefix)
              .then((result) => {
                // do nothing
              })
              .catch((err) => {
                this.setError(val.row.id);
              });
          }
        }
      }
    },
  },
  computed: {
    isLastPage() {
      if (this.recordsPerPage * (this.page + 1) < this.totalRecords) {
        return false;
      }
      return true;
    },
    tablePage() {
      return this.objects.map((row) => {
        const dropdown = [];

        if (!row.isFolder || this.type === 'risk-config') {
          dropdown.push({
            action: () => {
              this.preview = row;
            },
            text: this.$t(`${this.dictionaryPath}.table.dropdown.preview`),
            icon: 'find_in_page',
          });
        }

        if (this.type !== 'risk-config') {
          dropdown.push(
            {
              action: () => this.defineDataSource(row),
              text: this.$t(`${this.dictionaryPath}.table.dropdown.define`),
              icon: 'playlist_add',
            },
          );
        } else {
          dropdown.push(
            {
              action: () => this.getConfigurationPreview(row),
              text: this.$t(`${this.dictionaryPath}.table.dropdown.previewConfiguration`),
              icon: 'input',
            },
          );
        }

        return {
          ...row,
          material_icon: this.errorCache[row.id] ? 'error_outline' : row.isFolder ? 'folder_open' : 'article',
          dropdown,
        };
      });
    },
  },
  methods: {
    defineDataSource(row) {
      this.define = {
        row,
        name: '',
      };
      this.preview = null;
    },
    getConfigurationPreview(row) {
      this.previewConfigObj = row;
      this.preview = null;
      this.objectPreview = null;
    },
    backToList() {
      this.preview = null;
      this.define = null;
      this.previewConfigObj = null;
    },
    getObjectData(newPage) {
      if (this.loading || !this.bucket) return;

      const page = newPage || 0;
      this.loading = true;
      searchObjects(this.bucket, this.objectSearchTerm, page * this.recordsPerPage, this.recordsPerPage)
        .then((result) => {
          this.loading = false;
          this.objects = result.objects.map((item) => apiToInternalGCSObject(item));
          this.totalRecords = result.total;
          this.page = page;
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    updateBucket(val) {
      this.bucket = val;
      if (!val) {
        this.objects = [];
      }
      this.getObjectData();
    },
    updateObjectSearchTerm(val) {
      this.objectSearchTerm = val.trim();
    },
    pageChange(page) {
      this.page = page;
    },
    updateDataSourceName(val) {
      this.define.name = val.trim();
    },
    setError(id) {
      this.errorCache = {
        ...this.errorCache,
        [id]: true,
      };
    },
    defineFromPrefix() {
      this.defineDataSource({
        prefix: `${this.objectSearchTerm}*`,
        bucket: this.bucket,
        isPrefix: true,
        size_formatted: `${this.totalRecords} items`,
        id: `prefix_${uuidv4()}`,
      });
    },
    save() {
      this.loading = true;
      this.error = false;

      if (this.type === 'risk-config') {
        saveRiskConfig(this.processJSON)
          .then((response) => {
            this.$emit('saved');
          })
          .catch((err) => {
            this.error = 'An error occured.';
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        saveDataSource(defaultDataSourceFromBucket({ ...this.define }))
          .then((response) => {
            this.$emit('saved');
          })
          .catch((err) => {
            this.error = 'An error occured.';
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  /* stylelint-disable */
  .add-data-source-modal {
    ::v-deep {
      .fr-datatable {
        td {
          &:nth-child(2) {
            word-break: break-word;
          }

          &:nth-child(3) {
            width: 150px;
          }

          &:last-child {
            width: 40px;
          }
        }

        th,
        td {
          &:first-child {
            width: 40px;
          }

          &:nth-child(2) {
            width: 40%;
          }

          &:nth-child(3) {
            width: 150px;
          }

          &:last-child {
            width: 40px;
          }
        }
      }
    }

    ::v-deep
    &-define-form {
      .data-source-preview-container {
        max-height: calc(100vh - 42rem);
      }
    }
  }
</style>

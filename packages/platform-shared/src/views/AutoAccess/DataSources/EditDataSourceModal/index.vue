<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="$t('autoAccess.access.dataSources.editDataSourceModal.header')"
    v-model="show"
    size="xl"
    centered
    @hidden="$emit('hidden')"
  >
    <div
      class="edit-data-source-modal"
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
      <DefineDataSourceForm
        :help-text="$t('autoAccess.access.dataSources.editDataSourceModal.helpText')"
        :data-source="gcsDatasource"
        :initial-name="name"
        @updateName="updateDataSourceName"
      />
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        size="md"
        variant="link"
        @click="cancel()">
        {{ $t("common.cancel") }}
      </BButton>
      <LoadingButton
        size="md"
        variant="primary"
        :label="$t('common.save')"
        :loading="loading"
        :disabled="name === ''"
        @click="save" />
    </template>
  </BModal>
</template>
<script>
import { BModal, BButton, BAlert } from 'bootstrap-vue';
// import FrBasicInput from '@forgerock/platform-shared/src/components/Field/Basic';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import LoadingButton from '../../Shared/LoadingButton';
import DefineDataSourceForm from '../AddDataSourceModal/DefineDataSourceForm';
import { getBucketAndPrefixFromLocation, updateDataSource } from '../api/DataSourcesAPI';

export default {
  name: 'EditDataSourceModal',
  components: {
    BModal,
    BButton,
    BAlert,
    // FrBasicInput,
    FrSpinner,
    DefineDataSourceForm,
    LoadingButton,
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
      show: false,
      name: '',
      gcsDatasource: {},
      loading: false,
      error: false,
    };
  },
  watch: {
    showModal(val) {
      this.show = val;
      if (val && this.dataSource) {
        this.error = false;
        this.name = this.dataSource.name || '';
        this.gcsDatasource = getBucketAndPrefixFromLocation(this.dataSource.input);
      }
    },
  },
  methods: {
    updateDataSourceName(val) {
      this.name = val.trim();
    },
    save() {
      this.loading = true;
      this.error = false;
      updateDataSource({ ...this.dataSource, name: this.name })
        .then((response) => {
          this.loading = false;
          this.$emit('saved');
        })
        .catch(() => {
          this.loading = false;
          this.error = 'An error occured saving data source.';
        });
    },
  },
};
</script>

<style lang="scss" scoped>
  ::v-deep
  .edit-data-source-modal {
    .data-source-preview-container {
      max-height: calc(100vh - 42rem);
    }
  }
</style>

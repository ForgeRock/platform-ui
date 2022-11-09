<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="`Delete ${name}?`"
    v-model="show"
    size="md"
    centered
    @hidden="$emit('hidden')"
  >
    <p class="m-0">
      Are you sure you want to delete {{ name }}?
    </p>
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
        label="Delete"
        :loading="loading"
        :disabled="name === ''"
        @click="handleDelete" />
    </template>
  </BModal>
</template>
<script>
import { BModal, BButton } from 'bootstrap-vue';
import LoadingButton from '../../Shared/LoadingButton';
import { deleteDataSource } from '../api/DataSourcesAPI';

export default {
  name: 'DeleteDataSourceModal',
  components: {
    BModal,
    BButton,
    LoadingButton,
  },
  props: {
    dataSource: {
      default: () => {},
      type: Object,
    },
    showModal: {
      type: Boolean,
    },
  },
  data() {
    return {
      show: false,
      loading: false,
    };
  },
  watch: {
    showModal(val) {
      this.show = val;
    },
  },
  computed: {
    name() {
      return this.dataSource ? this.dataSource.name : '';
    },
  },
  methods: {
    handleDelete() {
      this.loading = true;
      deleteDataSource(this.dataSource)
        .then(() => {
          this.loading = false;
          this.$emit('deleted');
        });
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

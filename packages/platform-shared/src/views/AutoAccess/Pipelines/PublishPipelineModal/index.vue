<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :title="isPublished ? pipelineName : `Publish ${pipelineName}?`"
    v-model="show"
    size="lg"
    centered
    @hidden="$emit('hidden')"
  >
    <BAlert
      v-if="isPublished"
      show
      variant="success">
      <span class="material-icons mr-1">
        check
      </span>
      <span>
        <span class="font-weight-bold">
          {{ pipelineName }}
        </span> is published.
      </span>
    </BAlert>
    <div v-else>
      <BAlert
        v-if="error"
        show
        variant="danger">
        <i class="material-icons-outlined">
          error_outline
        </i>
        {{ error }}
      </BAlert>
      <PublishDialog
        :published-pipeline="publishedPipeline"
        :pipeline="pipeline"
      />
    </div>
    <template #modal-footer="{ cancel, ok }">
      <div class="d-flex flex-row w-100">
        <div class="d-flex flex-row ml-auto">
          <BButton
            size="md"
            variant="link"
            @click="cancel()">
            Cancel
          </BButton>
          <BButton
            size="md"
            v-if="isPublished"
            variant="primary"
            @click="ok()">
            OK
          </BButton>
          <LoadingButton
            size="md"
            v-else
            variant="primary"
            label="Publish"
            :loading="loading"
            @click="handlePublish(ok)" />
        </div>
      </div>
    </template>
  </BModal>
</template>
<script>
import { BModal, BButton, BAlert } from 'bootstrap-vue';
import LoadingButton from '../../Shared/LoadingButton';
import { publishTrainingPipeline } from '../api/PipelineApi';
import PublishDialog from './PublishDialog';

export default {
  name: 'PublishPipelineModal',
  components: {
    BModal,
    BButton,
    BAlert,
    LoadingButton,
    PublishDialog,
  },
  props: {
    pipeline: {
      type: Object,
      default: () => ({}),
    },
    showModal: {
      type: Boolean,
    },
    publishedPipeline: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      show: false,
      loading: false,
      error: false,
    };
  },
  watch: {
    showModal(val) {
      this.show = val;
      this.loading = false;
      this.error = false;
    },
  },
  computed: {
    pipelineName() {
      return this.pipeline ? this.pipeline.pipeline_name : '';
    },
    isPublished() {
      if (!this.pipeline || !this.publishedPipeline) {
        return false;
      }

      return this.pipeline.pipeline_definition_id === this.publishedPipeline.pipeline_definition_id;
    },
  },
  methods: {
    handlePublish(ok) {
      this.loading = true;
      this.error = false;
      publishTrainingPipeline(this.pipeline.pipeline_definition_id)
        .then(() => {
          this.$emit('refresh');
          ok();
        })
        .catch(() => {
          this.error = 'An error occured.';
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

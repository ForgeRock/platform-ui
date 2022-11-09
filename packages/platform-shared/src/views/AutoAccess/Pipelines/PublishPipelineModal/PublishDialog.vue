<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div v-if="pipeline">
    <p v-if="publishedPipeline.pipeline_name && !isPublished">
      Unpublish <span class="font-weight-bold">
        {{ publishedPipeline.pipeline_name }}
      </span> and publish <span class="font-weight-bold">
        {{ pipeline.pipeline_name }}
      </span>?
    </p>
    <p v-else>
      Publish training pipeline <span class="font-weight-bold">
        {{ pipeline.pipeline_name }}
      </span>?
    </p>
  </div>
</template>
<script>
export default {
  name: 'PublishDialog',
  props: {
    pipeline: {
      type: Object,
      default: () => ({}),
    },
    publishedPipeline: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    isPublished() {
      if (!this.pipeline || !this.publishedPipeline) {
        return false;
      }

      return this.pipeline.pipeline_definition_id === this.publishedPipeline.pipeline_definition_id;
    },
  },
};
</script>

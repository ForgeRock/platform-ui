<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="mt-5 models-centroids p-3"
    style="background: var(--light);">
    <BButton
      variant="link"
      class="p-0 w-100 text-left"
      :aria-controls="id"
      :aria-expanded="visible ? 'true' : 'false'"
      @click="visible = !visible"
    >
      <h5 class="mb-0">
        Centroids
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
    <BCollapse
      v-model="visible"
      :id="id"
    >
      <div
        v-for="centroid in centroidData.centroids"
        :key="centroid.cluster_name"
        class="d-flex flex-row mt-3"
      >
        <div
          style="flexbasis: 50px;"
          class="font-weight-bold text-dark p-1">
          {{ centroid.cluster_name }}
        </div>
        <div class="d-flex flex-row flex-wrap">
          <div
            v-for="key in centroidData.feature_choices"
            :key="key"
            class="py-1 px-2 border mb-1 mr-1 small rounded"
            style="background: #fff;"
          >
            <span v-if="centroid[key]">
              <span>
                {{ key }}:
              </span>
              <span class="text-dark">
                {{ centroid[key] }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </BCollapse>
  </div>
</template>
<script>
import { BCollapse, BButton } from 'bootstrap-vue';
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'Centroids',
  components: {
    BCollapse,
    BButton,
  },
  props: {
    centroidData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      id: `collapse-${uuidv4()}`,
      visible: false,
    };
  },
};
</script>
<style lang="scss">
  .models-centroids {
    .btn-link {
      &:hover,
      &:focus,
      &.focus {
        text-decoration: none;
      }
    }
  }
</style>

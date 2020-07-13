<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <button
    :class="['btn btn-primary d-flex align-items-center', {'disabled': loading}]"
    type="button"
    @click="$emit('click')">
    <span :class="[{'align-self-start': !large, 'm-auto': large}]">
      {{ label }}
    </span>
    <span :class="['fr-grow', {'fr-grow-in': loading}]">
      <Transition name="fr-fade">
        <ClipLoader
          v-if="loading"
          :color="'white'"
          :size="'1rem'"
          class="position-relative fr-clip-loader ml-3" />
      </Transition>
    </span>
  </button>
</template>
<script>
import { ClipLoader } from 'vue-spinner/dist/vue-spinner.min';
/**
 * @description Button with built in loading spinner that can be used to show users something is loading
 *
 * */
export default {
  name: 'LoadingButton',
  components: { ClipLoader },
  props: {
    label: {
      type: String,
      default: () => '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-grow {
  width: 0;
  transition: all 0.25s ease;
}

.fr-grow-in {
  width: 3rem;
}

.fr-fade-enter-active {
  transition: all 0.125s ease;
}

.fr-fade-leave {
  transition: all 0.125s ease;
}

.fr-fade-enter,
.fr-fade-leave-to {
  opacity: 0;
}

.fr-fade-enter-to {
  opacity: 1;
}

.fr-clip-loader {
  top: 0.15rem;
}
</style>

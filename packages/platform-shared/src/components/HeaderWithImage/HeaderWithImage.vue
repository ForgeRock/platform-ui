<!-- Copyright 2025-2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BMedia
    no-body
    class="mb-4 align-items-center">
    <div class="d-flex align-items-center justify-content-center p-3 mr-4 rounded border border-darkened header-image">
      <slot name="header-image">
        <img
          alt=""
          height="54"
          :onerror="onImageError"
          :src="imageSource"
          width="54">
      </slot>
    </div>
    <BMediaBody class="align-self-center text-truncate">
      <h1 class="h5 text-muted mb-2">
        {{ getTranslation(subtitle) }}
      </h1>
      <h1 class="pb-1 text-truncate">
        {{ title }}
      </h1>
      <slot />
    </BMediaBody>
  </BMedia>
</template>

<script setup>
import {
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import { getTranslation } from '@forgerock/platform-shared/src/utils/translations';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  imageSource: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped>
.header-image {
  width: 104px;
  height: 104px;
  background-color: $white;
}
</style>

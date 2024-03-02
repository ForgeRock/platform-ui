<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BMedia
      v-if="!isLoading"
      class="align-items-center"
      no-body>
      <BImg
        v-if="profileImage"
        class="mr-4"
        width="104"
        :src="profileImage" />
      <div
        v-else
        class="icon-container rounded-circle d-flex align-items-center justify-content-center mr-4 bg-lightyellow text-warning">
        <FrIcon
          icon-class="md-48"
          name="cloud" />
      </div>
      <BMediaBody class="align-self-center">
        <h5
          class="text-muted"
          data-testid="header-toptitle">
          {{ toptitle }}
        </h5>
        <h1 data-testid="header-title">
          {{ title }}
        </h1>
        <span
          class="text-muted"
          data-testid="header-subtitle">
          {{ subtitle }}
        </span>
      </BMediaBody>
    </BMedia>
    <BMedia
      v-if="isLoading"
      no-body>
      <BSkeleton
        type="avatar"
        animation="fade"
        width="104px"
        height="104px"
      />
      <BMediaBody class="ml-4 align-self-center">
        <BSkeleton
          animation="wave"
          width="35%" />
        <BSkeleton
          animation="wave"
          height="50px"
          width="55%" />
        <BSkeleton
          animation="wave"
          width="20%" />
      </BMediaBody>
    </BMedia>
  </div>
</template>

<script setup>
import {
  BImg, BMedia, BMediaBody, BSkeleton,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

defineProps({
  isLoading: {
    type: Boolean,
    default: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  toptitle: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
});
</script>
<style lang="scss" scoped>
.icon-container {
  height: 104px;
  width: 104px;
}
</style>

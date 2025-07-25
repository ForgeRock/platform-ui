<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BMedia>
    <template #aside>
      <BImg
        class="mt-2"
        height="24"
        width="24"
        :alt="$t('common.userFullName', { givenName: userObject?.givenName, sn: userObject?.sn })"
        :aria-hidden="true"
        :src="userObject?.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
    </template>
    <div
      v-if="userObject.id !== 'SYSTEM'"
      class="media-body">
      <h3 class="h5 mb-0 text-dark text-truncate">
        {{ $t('common.userFullName', { givenName: userObject?.givenName, sn: userObject?.sn }) }}
      </h3>
      <small class="text-truncate">
        {{ userObject?.userName }}
      </small>
    </div>
    <div
      v-else
      class="media-body">
      <h3 class="h5 mb-0 text-dark text-truncate">
        {{ $t('common.system') }}
      </h3>
    </div>
  </BMedia>
</template>

<script setup>

defineProps({
  userObject: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

</script>

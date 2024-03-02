<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BMedia class="mb-3">
    <template #aside>
      <BImg
        v-if="!isRole"
        class="rounded-circle"
        height="36"
        width="36"
        data-testid="profile-picture"
        :alt="$t('common.profilePicture')"
        :aria-hidden="true"
        :src="user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
      <div
        v-else
        data-testid="role-icon"
        class="rounded-circle d-flex align-items-center justify-content-center bg-lightblue color-blue font-weight-bold"
        style="width: 36px; height: 36px;">
        <FrIcon name="assignment_ind" />
      </div>
    </template>
    <BMediaBody>
      <p class="h5 m-0">
        {{ userTranslate.title }}
      </p>
      <small class="mb-0">
        {{ userTranslate.subTitle }}
      </small>
    </BMediaBody>
  </BMedia>
</template>

<script setup>
/**
 * Component for displaying user information within a media object.
 * @component UserBasicInfo
 * @prop {Boolean} isRole - Determines if the user is a role or a regular user.
 * @prop {Object} user - The user object containing information to display.
 */
import { computed } from 'vue';
import {
  BImg,
  BMedia,
  BMediaBody,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import i18n from '@/i18n';

const prop = defineProps({
  isRole: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    required: true,
  },
});

const userTranslate = computed(() => ({
  title: prop.isRole
    ? prop.user.name
    : i18n.global.t('common.userFullName', { givenName: prop.user.givenName, sn: prop.user.sn }),
  subTitle: prop.isRole
    ? i18n.global.t('common.role')
    : prop.user.userName,
}));
</script>

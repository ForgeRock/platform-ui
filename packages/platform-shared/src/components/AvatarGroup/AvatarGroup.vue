<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="singleUser"
    class="text-truncate">
    <FrUserBasicInfo
      data-testid="single-user-item"
      :is-role="users[0].id?.includes('role')"
      :pic-dimension="28"
      :user="users[0]" />
  </div>
  <div
    v-else
    class="d-flex ml-2">
    <div
      v-for="user in usersToShow"
      :key="`user-${user.id}`"
      class="cursor-pointer">
      <div class="avatar-item rounded-circle bg-lightblue color-blue font-weight-bold">
        <BImg
          v-if="!isItemRole(user.id)"
          class="size-28"
          data-testid="avatar-item"
          :alt="$t('common.profilePicture')"
          :id="`user-${user.id}`"
          :aria-hidden="true"
          :src="user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
        <FrIcon
          v-else
          :id="`user-${user.id}`"
          class="d-flex align-items-center justify-content-center size-28"
          name="assignment_ind" />
      </div>
      <BTooltip
        :target="`user-${user.id}`"
        boundary="window"
        triggers="hover">
        <h2 class="h5 mb-0 text-white">
          {{ tooltipTitle(isItemRole(user.id), user) }}
        </h2>
        <small>{{ user.userName || $t('common.role') }}</small>
      </BTooltip>
    </div>
    <template v-if="users.length > avatarLimit">
      <div
        id="`${id}-overflow-badge`"
        data-testid="overflow-badge"
        class="avatar-item overflow-badge bg-white border border-primary text-primary rounded-circle d-flex align-items-center justify-content-center font-weight-bold size-28">
        +{{ remainingUsers }}
      </div>
      <BTooltip
        target="`${id}-overflow-badge`"
        boundary="window"
        triggers="hover">
        {{ $t('common.viewMore', { count: remainingUsers }) }}
      </BTooltip>
    </template>
  </div>
</template>

<script setup>
/**
 * Component for displaying a list of users with avatars and tooltips.
 * @component AvatarGroup
 * @prop {Number} avatarLimit - The maximum number of avatars to display before showing overflow badge.
 * @prop {String} id - The unique identifier for the component instance.
 * @prop {Array} users - The array of user objects to display.
 */
import {
  BImg,
  BTooltip,
} from 'bootstrap-vue';
import { computed, ref, watch } from 'vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import i18n from '@/i18n';

const prop = defineProps({
  avatarLimit: {
    type: Number,
    default: 3,
  },
  id: {
    type: String,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
});

const usersToShow = ref([]);
const remainingUsers = ref(0);

const singleUser = computed(() => prop.users.length === 1);

watch(
  () => prop.users,
  (newVal) => {
    if (newVal.length > prop.avatarLimit) {
      usersToShow.value = newVal.slice(0, prop.avatarLimit);
      remainingUsers.value = newVal.slice(prop.avatarLimit).length;
    } else {
      usersToShow.value = newVal;
    }
  }, { immediate: true },
);

/**
 * Checks if the given ID contains the substring 'role'.
 * @param {string} id - The ID to check.
 * @returns {boolean} Returns true if the ID contains 'role', otherwise false.
 */
function isItemRole(id) {
  return id.includes('role');
}

/**
 * Returns proper tooltip title
 * @param {Boolean} isRole determine if the item is role or user
 * @param {Object} item all item info
 */
function tooltipTitle(isRole, item) {
  return isRole
    ? item.name
    : i18n.global.t('common.userFullName', { givenName: item.givenName, sn: item.sn });
}
</script>

<style scoped>
.avatar-item {
  margin-left: -8px;
}

.overflow-badge {
  font-size: 13px;
}
</style>

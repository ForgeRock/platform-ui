<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    class="shadow-none h-100 text-truncate"
    header-class="p-3 text-truncate">
    <template #header>
      <div class="d-flex align-items-center">
        <FrIcon
          name="person"
          class="mr-2" />
        <span class="font-weight-bold">
          {{ $t('governance.accessRequest.requestedFor') }}
        </span>
      </div>
    </template>
    <small class="d-block mb-2">
      {{ $t('common.user.user') }}
    </small>
    <BButton
      class="text-dark btn-unstyled p-0"
      variant="link"
      @click="openUserModal">
      <BMedia>
        <template #aside>
          <BImg
            class="mt-2"
            height="24"
            width="24"
            :alt="`${user.givenName} ${user.sn}`"
            :aria-hidden="true"
            :src="user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
        </template>
        <div class="media-body">
          <h3 class="h5 mb-0 text-dark text-truncate">
            {{ $t('common.userFullName', { givenName: user.givenName, sn: user.sn }) }}
          </h3>
          <small class="text-truncate">
            {{ user.userName }}
          </small>
        </div>
      </BMedia>
    </BButton>
    <template v-if="manager">
      <small class="d-block mt-3 mb-2">
        {{ $t('common.user.manager') }}
      </small>
      <BButton
        class="text-dark btn-unstyled p-0"
        variant="link"
        @click="openManagerModal">
        <BMedia>
          <template #aside>
            <BImg
              class="mt-2"
              height="24"
              width="24"
              :alt="`${manager.givenName} ${manager.sn}`"
              :aria-hidden="true"
              :src="manager.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          </template>
          <div class="media-body">
            <h3 class="h5 mb-0 text-dark text-truncate">
              {{ $t('common.userFullName', { givenName: manager.givenName, sn: manager.sn }) }}
            </h3>
            <small class="text-truncate">
              {{ manager.userName }}
            </small>
          </div>
        </BMedia>
      </BButton>
      <FrGovernanceUserDetailsModal
        only-details
        modal-id="GovernanceManagerDetailsModal"
        :display-properties="displayProperties"
        :user="manager"
        :user-details="userDetails" />
    </template>
    <FrGovernanceUserDetailsModal
      only-details
      :display-properties="displayProperties"
      :user="user"
      :user-details="userDetails" />
  </BCard>
</template>

<script setup>
/**
 * Card displaying user info from a request's rawData.user object.
 * Clicking the user fetches and opens GovernanceUserDetailsModal with full details tabs.
 * @component UserInfoCard
 * @prop {Object} user - User object from rawData (givenName, sn, userName, mail, profileImage, id)
 * @prop {Object} manager - Optional manager object; renders a manager section when present
 */
import { onMounted, ref } from 'vue';
import {
  BButton,
  BCard,
  BImg,
  BMedia,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrGovernanceUserDetailsModal from '@forgerock/platform-shared/src/components/governance/UserDetailsModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getIgaUiConfig } from '@forgerock/platform-shared/src/api/governance/CommonsApi';

defineProps({
  manager: {
    type: Object,
    default: null,
  },
  user: {
    type: Object,
    default: () => ({}),
  },
});

const { bvModal } = useBvModal();

const displayProperties = ref([]);
const emptyGrants = { result: [] };
const userDetails = ref({
  userRoles: emptyGrants,
  userAccounts: emptyGrants,
  userEntitlements: emptyGrants,
});

/** Opens the user details modal. */
function openUserModal() {
  bvModal.value.show('GovernanceUserDetailsModal');
}

/** Opens the manager details modal. */
function openManagerModal() {
  bvModal.value.show('GovernanceManagerDetailsModal');
}

const defaultDisplayProperties = ['userName', 'givenName', 'sn', 'mail', 'accountStatus'];

onMounted(async () => {
  try {
    const { data } = await getIgaUiConfig();
    displayProperties.value = data?.user?.displayProperties || defaultDisplayProperties;
  } catch {
    displayProperties.value = defaultDisplayProperties;
  }
});
</script>

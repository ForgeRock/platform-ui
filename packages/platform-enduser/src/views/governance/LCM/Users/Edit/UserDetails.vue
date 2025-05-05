<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5 p-3">
    <FrSpinner
      v-if="isEmpty(user)"
      class="py-5" />
    <template v-else>
      <BMedia
        class="align-items-center mb-4"
        no-body>
        <BMediaAside class="align-self-center">
          <BImg
            class="mr-3 rounded-circle"
            :height="104"
            :width="104"
            :alt="$t('common.profilePicture')"
            :aria-hidden="true"
            :src="user.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
        </BMediaAside>
        <BMediaBody class="align-self-center overflow-hidden text-nowrap">
          <h3 class="h5 text-muted">
            {{ $t('common.user.user') }}
          </h3>
          <h2 class="h1 mb-2">
            {{ $t('common.userFullName', {
              givenName: user.givenName,
              sn: user.sn,
            }) }}
          </h2>
          <span class="text-muted">
            {{ user.userName }}
          </span>
        </BMediaBody>
      </BMedia>
      <BCard no-body>
        <BTabs
          class="card-tabs-vertical"
          nav-class="w-200px"
          pills
          vertical
          lazy>
          <BTab :title="$t('governance.user.profile')">
            <FrProfile :user="user" />
          </BTab>
        </BTabs>
      </BCard>
    </template>
  </BContainer>
</template>

<script setup>
import { isEmpty } from 'lodash';
import { ref, onMounted } from 'vue';
import {
  BContainer,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import { useRoute } from 'vue-router';
import { getManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrProfile from './Tabs/Profile';
import i18n from '@/i18n';

// Composables
const route = useRoute();
const { setBreadcrumb } = useBreadcrumb();

const userId = ref(route.params.userId);
const user = ref({});

/**
 * Get the user details by ID.
 */
async function loadUser() {
  try {
    const { data } = await getManagedResource('alpha_user', userId.value, { fields: '*,manager/*' });
    user.value = data;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.user.errorGettingSchema'));
  }
}

onMounted(() => {
  setBreadcrumb('/administer/users', i18n.global.t('pageTitles.AdministerUsers'));
  loadUser();
});

</script>

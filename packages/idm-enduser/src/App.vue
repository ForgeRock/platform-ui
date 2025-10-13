<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template v-if="$route.meta.hideLayout">
      <notifications
        class="ml-3"
        position="bottom left"
        width="320"
        :duration="4000">
        <template #body="props">
          <FrAlert
            :variant="props.item.type"
            :title="props.item.text"
            show>
            {{ props.item.text }}
          </FrAlert>
        </template>
      </notifications>
      <FrRouterView />
    </template>
    <FrLayout
      v-else
      is-enduser
      :key="$route.fullPath"
      :menu-items="menuItems">
      <FrRouterView />
    </FrLayout>
  </div>
</template>

<script setup>
import FrLayout from '@forgerock/platform-shared/src/components/Layout';
import FrAlert from '@forgerock/platform-shared/src/components/Alert/';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { computed } from 'vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getDelegatedAdminMenuItems } from '@forgerock/platform-shared/src/enduser/utils/enduserPrivileges';
import i18n from '@/i18n';
import '@/scss/main.scss';
import FrRouterView from './components/RouterView';

// Initialize vee-validate rules
const rules = ValidationRules.getRules(i18n);
ValidationRules.extendRules(rules);

const userStore = useUserStore();

// Static menu items
const baseMenuItems = [
  {
    routeTo: { name: 'Dashboard' },
    displayName: 'sideMenu.dashboard',
    icon: 'dashboard',
  },
  {
    routeTo: { name: 'Profile' },
    displayName: 'sideMenu.profile',
    icon: 'account_circle',
  },
];

// Calculated value of menu items that adds the ones related with enduser admin permissions
const menuItems = computed(() => {
  // It is possible that the userStore.privileges is not an array, it is an empty object by default
  const privileges = !Array.isArray(userStore.privileges) ? [] : userStore.privileges;
  return [
    ...baseMenuItems,
    ...getDelegatedAdminMenuItems(privileges),
  ];
});
</script>

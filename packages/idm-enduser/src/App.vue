<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrRouterView v-if="$route.meta.hideLayout" />
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
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { computed } from 'vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { getDelegatedAdminMenuItems } from '@forgerock/platform-shared/src/utils/enduserPrivileges';
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

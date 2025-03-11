<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrLayout
      is-enduser
      :menu-items="menuItems">
      <router-view v-slot="{ Component }">
        <transition
          name="fade"
          mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </FrLayout>
  </div>
</template>

<script setup>
import FrLayout from '@forgerock/platform-shared/src/components/Layout';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import '@/scss/main.scss';

// Initialize vee-validate rules
const rules = ValidationRules.getRules(i18n);
ValidationRules.extendRules(rules);

const menuItems = [
  {
    routeTo: { name: 'Dashboard' },
    displayName: 'sideMenu.dashboard',
    icon: 'dashboard',
  },
];
</script>

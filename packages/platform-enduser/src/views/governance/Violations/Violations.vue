<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      :title="$t('governance.violations.title')"
      :subtitle="$t('governance.violations.subtitle')" />
    <BTabs
      content-class="mt-4"
      lazy
      nav-class="fr-tabs">
      <BTab :title="$t('governance.violations.tabs.violations')">
        <ViolationsTab />
      </BTab>
      <BTab :title="$t('governance.violations.tabs.exceptions')">
        <ExceptionsTab />
      </BTab>
    </BTabs>
  </BContainer>
</template>

<script setup>
import {
  BContainer,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import ExceptionsTab from './ExceptionsTab';
import ViolationsTab from './ViolationsTab';

/**
 * Displays the violations and exceptions assigned to the end user
 */
</script>

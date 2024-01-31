<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTab :title="i18n.global.t('pages.profile.trustedDevices.title')">
    <FrListViewTrustedDevices
      ref="listViewTrustedDevices"
      v-bind="attrs" />
  </BTab>
</template>

<script setup>
/**
 * @description Tab item to show Trusted Devices for a Managed User
*/
import {
  BTab,
} from 'bootstrap-vue';
import i18n from '@forgerock/platform-shared/src/i18n';
import { useAttrs } from 'vue';
import FrListViewTrustedDevices from '@forgerock/platform-shared/src/components/profile/TrustedDevices/ListViewTrustedDevices';

const attrs = useAttrs();
</script>

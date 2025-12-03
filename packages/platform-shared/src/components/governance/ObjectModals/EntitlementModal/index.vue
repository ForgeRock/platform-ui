<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    content-class="border-0"
    scrollable
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    size="xl"
    :ok-title="$t('common.done')"
    :static="isTest">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <img
          class="mr-3 mw-100 h-auto"
          height="36"
          width="36"
          :alt="displayNameHeader"
          :onerror="onImageError"
          :src="logo">
        <div class="media-body">
          <small class="mb-1 d-block">
            {{ displayNameHeader }}
          </small>
          <p
            v-if="entitlement"
            class="mb-0 h5">
            {{ displayName }}
          </p>
        </div>
      </BMedia>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>
    <div class="p-4">
      <BCard>
        <div
          class="d-flex justify-content-between section-header"
          :class="{ 'mb-4': isVisible.glossary }"
          @click="isVisible.glossary = !isVisible.glossary">
          <h1
            class="h5 mb-0">
            {{ $t(`governance.entitlementDetails`) }}
          </h1>
          <FrIcon
            :name="isVisible.glossary ? 'keyboard_arrow_down' : 'chevron_right'"
            class="ml-2" />
        </div>
        <FrGlossaryDisplayForm
          v-if="isVisible.glossary"
          :glossary-schema="glossarySchema"
          :glossary-values="glossaryValues" />
      </BCard>
    </div>
    <div class="pt-0 pb-4 px-4">
      <FrObjectProperties
        @toggle-collapse="isVisible.properties = !isVisible.properties"
        enable-collapse
        :is-collapsed="!isVisible.properties"
        :object-properties="entitlement?.entitlement || {}"
        object="entitlements" />
    </div>
  </BModal>
</template>

<script>
import {
  BButtonClose,
  BCard,
  BMedia,
  BModal,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrGlossaryDisplayForm from '@forgerock/platform-shared/src/components/governance/GlossaryDisplayForm';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import FrObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';

/**
 * @description  modal component to show entitlement details, this modal is opened when the user clicks the entitlement
 * column of the access reviews table, this component receives the selected line item object
 *
 * @param {object} entitlement - object with the entitlement data
 *
 * @param {object} application - object with the application data, this info is used to show the application icon and
 * entitlement type
 */
export default {
  name: 'EntitlementModal',
  components: {
    BButtonClose,
    BCard,
    BMedia,
    BModal,
    FrGlossaryDisplayForm,
    FrObjectProperties,
    FrIcon,
  },
  props: {
    entitlement: {
      type: Object,
      default: () => {},
    },
    glossarySchema: {
      type: Array,
      default: () => [],
    },
    modalId: {
      type: String,
      default: 'CertificationTaskEntAccountModal',
    },
  },
  data() {
    return {
      isVisible: {
        glossary: true,
        properties: true,
      },
      isTest: false, // only for test purposes, to make the modal static
    };
  },
  computed: {
    logo() {
      return getApplicationLogo(this.entitlement.application);
    },
    displayName() {
      return this.entitlement.descriptor?.idx?.['/entitlement']?.displayName || this.entitlement.entitlement?.__NAME__;
    },
    displayNameHeader() {
      return this.$t('governance.certificationTask.entitlementModal.name', { entitlementName: getApplicationDisplayName(this.entitlement.application) });
    },
    glossaryValues() {
      return this.entitlement?.glossary?.idx?.['/entitlement'] || {};
    },
  },
  methods: {
    onImageError,
  },
};
</script>

<style lang="scss" scoped>
.section-header {
  cursor: pointer;
}
</style>

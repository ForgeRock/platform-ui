<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

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
        <div class="size-48 fr-app-logo-bg d-flex align-items-center justify-content-center mr-3">
          <img
            height="36"
            width="36"
            :alt="displayNameHeader"
            :onerror="onImageError"
            :src="logo">
        </div>
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
      <FrSpinner
        v-if="isLoadingSchema"
        class="py-5" />
      <FrObjectProperties
        v-else
        @toggle-collapse="isVisible.properties = !isVisible.properties"
        enable-collapse
        :is-collapsed="!isVisible.properties"
        :object-properties="entitlement?.entitlement || {}"
        object="entitlements"
        v-bind="objectTypeSchema ? { schema: objectTypeSchema } : {}" />
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
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import FrObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';
import { getObjectTypeSchema } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';

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
    FrSpinner,
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
      isLoadingSchema: false,
      objectTypeSchema: null,
    };
  },
  watch: {
    entitlement: {
      immediate: true,
      async handler(entitlement) {
        this.objectTypeSchema = null;
        this.isLoadingSchema = false;
        if (!entitlement) return;
        const applicationId = entitlement.application?.id;
        const objectType = entitlement.item?.objectType;
        if (!applicationId || !objectType) return;
        try {
          this.isLoadingSchema = true;
          const { data } = await getObjectTypeSchema(applicationId, objectType);
          if (entitlement !== this.entitlement) return;
          const properties = data?.properties || {};
          this.objectTypeSchema = Object.fromEntries(
            Object.entries(properties).map(([key, val]) => [key, val.displayName || key]),
          );
        } catch {
          // schema is optional — fall back to raw keys
        } finally {
          this.isLoadingSchema = false;
        }
      },
    },
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

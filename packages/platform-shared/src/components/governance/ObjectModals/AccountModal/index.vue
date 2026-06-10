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
    ok-only
    ok-variant="outline-primary"
    size="xl"
    :ok-title="$t('common.done')">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <div class="media-body">
          <small class="text-muted">
            {{ $t('governance.accounts.accountDetails') }}
          </small>
          <h2 class="h5 m-0">
            {{ accountDisplayName }}
          </h2>
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
      <FrAccountDetailsTab
        @toggle-collapse="isVisible.glossary = !isVisible.glossary"
        enable-collapse
        :is-collapsed="!isVisible.glossary"
        :account="grant"
        :use-existing-glossary="true" />
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
        :object-properties="grant?.account || {}"
        object="accounts"
        v-bind="objectTypeSchema ? { schema: objectTypeSchema } : {}" />
    </div>
  </BModal>
</template>

<script>
import {
  BButtonClose,
  BModal,
  BMedia,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrAccountDetailsTab from '@forgerock/platform-shared/src/views/Governance/Accounts/AccountsDetails/DetailsTab';
import FrObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';
import { getObjectTypeSchema } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { getObjectTypeFromAccountId } from '@forgerock/platform-shared/src/utils/governance/entitlements';

export default {
  name: 'AccountModal',
  components: {
    BButtonClose,
    BModal,
    FrAccountDetailsTab,
    FrObjectProperties,
    FrSpinner,
    FrIcon,
    BMedia,
  },
  props: {
    grant: {
      type: Object,
      required: true,
    },
    modalId: {
      type: String,
      default: 'CertificationTaskAccountModal',
    },
  },
  data() {
    return {
      isVisible: {
        glossary: true,
        properties: true,
      },
      isLoadingSchema: false,
      objectTypeSchema: null,
    };
  },
  computed: {
    accountDisplayName() {
      return this.grant?.descriptor?.idx?.['/account']?.displayName || '';
    },
  },
  watch: {
    grant: {
      immediate: true,
      async handler(grant) {
        this.objectTypeSchema = null;
        this.isLoadingSchema = false;
        if (!grant) return;
        const applicationId = grant.application?.id;
        const objectType = getObjectTypeFromAccountId(grant.item, grant.keys, grant.application?.isDisconnected);
        if (!applicationId || !objectType) return;
        try {
          this.isLoadingSchema = true;
          const { data } = await getObjectTypeSchema(applicationId, objectType);
          if (grant !== this.grant) return;
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
};
</script>

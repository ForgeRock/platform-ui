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
    :ok-title="$t('common.done')">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <div class="media-body">
          <small class="text-muted">
            {{ $t('governance.accountDetails') }}
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
      <FrObjectProperties
        @toggle-collapse="isVisible.properties = !isVisible.properties"
        enable-collapse
        :is-collapsed="!isVisible.properties"
        :object-properties="grant?.account || {}"
        object="accounts" />
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
import FrAccountDetailsTab from '@forgerock/platform-shared/src/views/Governance/Accounts/AccountsDetails/DetailsTab';
import FrObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';

export default {
  name: 'AccountModal',
  components: {
    BButtonClose,
    BModal,
    FrAccountDetailsTab,
    FrObjectProperties,
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
    };
  },
  computed: {
    accountDisplayName() {
      return this.grant?.descriptor?.idx?.['/account']?.displayName || '';
    },
  },
};
</script>

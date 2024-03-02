<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    content-class="border-0"
    scrollable
    id="CertificationTaskAccountModal"
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
    <BTabs
      class="card-tabs-vertical"
      pills
      vertical>
      <BTab
        active
        :title="$t('governance.accountDetails')">
        <FrAccountDetailsTab :grant="grant" />
      </BTab>
      <BTab
        :title="$t('governance.certificationTask.lineItemDetailsModal.contentDetailsTabText')">
        <FrContentDetailsTab :content="grant.account" />
      </BTab>
    </BTabs>
  </BModal>
</template>

<script>
import {
  BButtonClose,
  BModal,
  BTab,
  BTabs,
  BMedia,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrAccountDetailsTab from './AccountDetailsTab';
import FrContentDetailsTab from './ContentDetailsTab';

export default {
  name: 'AccountModal',
  components: {
    BButtonClose,
    BModal,
    BTab,
    BTabs,
    FrAccountDetailsTab,
    FrContentDetailsTab,
    FrIcon,
    BMedia,
  },
  props: {
    grant: {
      type: Object,
      required: true,
    },
  },
  computed: {
    accountDisplayName() {
      return this.grant?.descriptor?.idx?.['/account']?.displayName || '';
    },
  },
};
</script>

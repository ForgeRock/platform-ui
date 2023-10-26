<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

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
            {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTabText') }}
          </small>
          <h5 class="m-0">
            {{ account.mailNickname }}
          </h5>
        </div>
      </BMedia>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          class="md-24"
        />
      </BButtonClose>
    </template>
    <BTabs
      class="card-tabs-vertical"
      pills
      vertical>
      <BTab
        active
        :title="$t('governance.certificationTask.lineItemDetailsModal.accountDetailsTabText')">
        <FrAccountDetailsTab :account="account" />
      </BTab>
      <BTab
        :title="$t('governance.certificationTask.lineItemDetailsModal.contentDetailsTabText')">
        <FrContentDetailsTab :content="content" />
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
    account: {
      type: Object,
      required: true,
    },
    content: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

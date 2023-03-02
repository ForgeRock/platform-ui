<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-4">
    <dl class="row">
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.ownerLabel') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        <BMedia
          class="align-items-center"
          no-body>
          <BImg
            class="mr-3 rounded-circle"
            height="36"
            width="36"
            :alt="account.displayName"
            :src="account.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
            fluid />
          <div class="media-body">
            <h5 class="m-0">
              {{ account.displayName }}
            </h5>
            <small class="text-muted">
              {{ account.userPrincipalName }}
            </small>
          </div>
        </BMedia>
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.typeLabel') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ account.accountType }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('common.status') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ blankValueIndicator }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.lastCertifiedLabel') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ account.lastCertified }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.lastCertifiedByLabel') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ blankValueIndicator }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.lastUsedLabel') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ blankValueIndicator }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.riskScoreLabel') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ blankValueIndicator }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.provisioningMethodLabel') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ blankValueIndicator }}
      </dd>
    </dl>
  </div>
</template>

<script>
import {
  BImg,
  BMedia,
} from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

export default {
  name: 'AccountDetailsTab',
  components: {
    BImg,
    BMedia,
  },
  props: {
    account: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      blankValueIndicator,
    };
  },
};
</script>

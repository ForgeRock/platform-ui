<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

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
            :alt="details.displayName"
            :src="details.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
            fluid />
          <div class="media-body">
            <h5
              class="m-0"
              data-testid="displayName">
              {{ details.displayName }}
            </h5>
            <small
              class="text-muted"
              data-testid="userPrincipalName">
              {{ details.userPrincipalName }}
            </small>
          </div>
        </BMedia>
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.lastDecisionLabel') }}
      </dt>
      <dd
        class="col-lg-8 mb-4"
        data-testid="lastDecision">
        {{ decision }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.lastCertifiedLabel') }}
      </dt>
      <dd
        class="col-lg-8 mb-4"
        data-testid="decisionDate">
        {{ decisionDate }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.lastCertifiedByLabel') }}
      </dt>
      <dd
        class="col-lg-8 mb-4"
        data-testid="decisionBy">
        {{ decisionBy }}
      </dd>
      <dt class="col-lg-4">
        {{ $t('governance.certificationTask.lineItemDetailsModal.accountDetailsTab.provisioningMethodLabel') }}
      </dt>
      <dd class="col-lg-8 mb-4">
        {{ grantType }}
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
import dayjs from 'dayjs';

export default {
  name: 'AccountDetailsTab',
  components: {
    BImg,
    BMedia,
  },
  props: {
    grant: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      blankValueIndicator,
      details: this.grant?.account,
    };
  },
  computed: {
    decision() {
      return this.grant?.item?.decision?.certification?.decision || blankValueIndicator;
    },
    decisionDate() {
      return this.formatDate(this.grant?.item?.decision?.certification?.decisionDate);
    },
    decisionBy() {
      const user = this.grant?.item?.decision?.certification?.decisionBy;
      return user ? user.userName : blankValueIndicator;
    },
    grantType() {
      return this.grant?.grantTypes || blankValueIndicator;
    },
  },
  methods: {
    formatDate(date) {
      if (date) return dayjs(date).format('MMMM D, YYYY h:mm A');
      return blankValueIndicator;
    },
  },
};
</script>

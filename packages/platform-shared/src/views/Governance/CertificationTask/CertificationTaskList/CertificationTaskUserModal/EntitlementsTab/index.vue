<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BTable
      :fields="entitlementsFields"
      :items="entitlements.result"
      show-empty
      responsive>
      <template #cell(application)="{ item }">
        <BMedia
          class="align-items-center"
          no-body>
          <BImg
            class="mr-3"
            height="28"
            width="28"
            :alt="item.application.name"
            :src="getApplicationLogo(item.application)"
            fluid />
          <div class="media-body align-self-center overflow-hidden text-nowrap">
            <span class="text-dark">
              {{ item.application.name }}
            </span>
          </div>
        </BMedia>
      </template>
      <template #cell(name)="{ item }">
        <p>{{ nameValue(item.descriptor) }}</p>
      </template>
      <template #cell(account)="{ item }">
        <p>{{ accountValue(item.descriptor) }}</p>
      </template>
    </BTable>
  </div>
</template>

<script>
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { get } from 'lodash';
import {
  BImg,
  BMedia,
  BTable,
} from 'bootstrap-vue';

export default {
  name: 'EntitlementsTab',
  components: {
    BImg,
    BMedia,
    BTable,
  },
  props: {
    entitlements: {
      type: Object,
      required: true,
    },
  },
  mixins: [
    AppSharedUtilsMixin,
  ],
  data() {
    return {
      blankValueIndicator,
      entitlementsFields: [
        {
          key: 'application',
          label: this.$t('governance.certificationTask.lineItemDetailsModal.entitlementsTab.fields.application'),
          sortable: true,
          class: 'text-truncate',
          show: true,
        },
        {
          key: 'name',
          label: this.$t('governance.certificationTask.lineItemDetailsModal.entitlementsTab.fields.name'),
          class: 'text-truncate',
          show: true,
        },
        {
          key: 'account',
          label: this.$t('governance.certificationTask.lineItemDetailsModal.entitlementsTab.fields.account'),
          class: 'text-truncate',
          show: true,
        },
      ],
    };
  },
  methods: {
    nameValue(descriptor) {
      return get(descriptor, 'idx./entitlement.displayName', this.blankValueIndicator);
    },
    accountValue(descriptor) {
      return get(descriptor, 'idx./account.displayName', this.blankValueIndicator);
    },
  },
};
</script>

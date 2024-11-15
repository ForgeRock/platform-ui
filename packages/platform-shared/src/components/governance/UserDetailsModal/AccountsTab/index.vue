<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template v-if="totalRows">
      <BTable
        :fields="accountsFields"
        :items="accounts.result"
        :per-page="pageSize"
        :current-page="paginationPage"
        data-testid="accounts-table"
        show-empty
        :empty-text="$t('common.noRecordsToShow')"
        responsive>
        <template #cell(application)="{ item }">
          <BMedia
            class="align-items-center"
            no-body>
            <img
              class="mr-3 mw-100 h-auto size-28"
              :alt="item.application.name"
              :onerror="onImageError"
              :src="getLogo(item.application)">
            <BMediaBody>
              <span class="text-dark">
                {{ item.application.name }}
              </span>
            </BMediaBody>
          </BMedia>
        </template>
        <template #cell(name)="{ item }">
          <p>{{ nameValue(item.descriptor) }}</p>
        </template>
      </BTable>
      <BPagination
        v-model="paginationPage"
        class="py-3 justify-content-center pagination-material-buttons"
        :per-page="pageSize"
        :total-rows="totalRows" />
    </template>
    <FrNoData
      v-else
      :card="false"
      class="mb-4"
      icon="inbox"
      :subtitle="$t('governance.certificationTask.lineItemDetailsModal.accountsTab.noItems')" />
  </div>
</template>

<script>
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { get } from 'lodash';
import {
  BMedia,
  BMediaBody,
  BPagination,
  BTable,
} from 'bootstrap-vue';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';

/**
 * Tab that allows to visualize the accounts of the selected user
 */
export default {
  name: 'AccountsTab',
  components: {
    BMedia,
    BMediaBody,
    BPagination,
    BTable,
    FrNoData,
  },
  props: {
    accounts: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      accountsFields: [
        {
          key: 'application',
          label: this.$t('common.application'),
          class: 'text-truncate',
          show: true,
        },
        {
          key: 'name',
          label: this.$t('common.name'),
          class: 'text-truncate',
          show: true,
        },
      ],
      blankValueIndicator,
      paginationPage: 1,
      pageSize: 5,
    };
  },
  methods: {
    getLogo(item) {
      return getApplicationLogo(item);
    },
    /**
     * Return name value for list item
     * @param {Object} descriptor - information object returned from API
     * @returns {String} name value
     */
    nameValue(descriptor) {
      return get(descriptor, 'idx./account.displayName', this.blankValueIndicator);
    },
    onImageError,
  },
  computed: {
    totalRows() {
      return this.accounts.result.length;
    },
  },
};
</script>

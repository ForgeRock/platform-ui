<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template v-if="totalRows">
      <BTable
        v-resizable-table="{ persistKey: 'user-details-modal-roles' }"
        :fields="rolesFields"
        :items="roles.result"
        :per-page="pageSize"
        :current-page="paginationPage"
        data-testid="roles-table"
        show-empty
        :empty-text="$t('common.noRecordsToShow')"
        responsive>
        <template #cell(name)="{ item }">
          <p>{{ nameValue(item.role) }}</p>
        </template>
        <template #cell(timeConstraint)="{ item }">
          <p class="mb-0">
            {{ formatConstraintDate(item.relationship.temporalConstraints) || blankValueIndicator }}
          </p>
        </template>
      </BTable>
      <FrPagination
        v-model="paginationPage"
        :per-page="pageSize"
        :total-rows="totalRows"
        @on-page-size-change="pageSizeChange" />
    </template>
    <FrNoData
      v-else
      :card="false"
      class="mb-4"
      icon="inbox"
      :subtitle="$t('governance.certificationTask.lineItemDetailsModal.rolesTab.noItems')" />
  </div>
</template>

<script>
import { get } from 'lodash';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import formatConstraintDate from '@forgerock/platform-shared/src/utils/governance/temporalConstraints';
import { BTable } from 'bootstrap-vue';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';

/**
 * Tab that allows to visualize the roles of the selected user
 */
export default {
  name: 'RolesTab',
  components: {
    BTable,
    FrNoData,
    FrPagination,
  },
  props: {
    roles: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      blankValueIndicator,
      paginationPage: 1,
      pageSize: 5,
      rolesFields: [
        {
          key: 'name',
          label: this.$t('common.name'),
          class: 'text-truncate',
        },
        {
          key: 'timeConstraint',
          label: this.$t('pages.access.timeConstraint'),
        },
      ],
    };
  },
  methods: {
    formatConstraintDate,
    /**
     * Return name value for list item
     * @param {Object} roleObject - information object returned from API
     * @returns {String} name value
     */
    nameValue(roleObject) {
      return get(roleObject, 'name', this.blankValueIndicator);
    },
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
    },
  },
  computed: {
    totalRows() {
      return this.roles.result.length;
    },
  },
};
</script>

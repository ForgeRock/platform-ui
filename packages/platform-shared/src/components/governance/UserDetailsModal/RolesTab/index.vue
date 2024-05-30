<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template v-if="totalRows">
      <BTable
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
      :subtitle="$t('governance.certificationTask.lineItemDetailsModal.rolesTab.noItems')" />
  </div>
</template>

<script>
import { get } from 'lodash';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import formatConstraintDate from '@forgerock/platform-shared/src/utils/governance/temporalConstraints';
import { BPagination, BTable } from 'bootstrap-vue';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';

/**
 * Tab that allows to visualize the roles of the selected user
 */
export default {
  name: 'RolesTab',
  components: {
    BPagination,
    BTable,
    FrNoData,
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
  },
  computed: {
    totalRows() {
      return this.roles.result.length;
    },
  },
};
</script>

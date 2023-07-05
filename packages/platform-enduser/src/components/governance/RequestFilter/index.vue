<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BRow>
      <BCol lg="12">
        <div class="mb-4 mt-2">
          <div class="d-inline-block border rounded-pill px-3 py-2 mr-2 mb-2">
            <FrField
              v-model="formFields.highPriority"
              inline
              class="d-inline"
              :label="$t('governance.accessRequest.priorities.highPriority')"
              name="highPriority"
              testid="priority-high"
              type="checkbox">
              <template #prepend>
                <BImg
                  height="24"
                  :src="getPriorityImageSrc('high')" />
              </template>
            </FrField>
          </div>
          <div class="d-inline-block border rounded-pill px-3 py-2 mr-2 mb-2">
            <FrField
              v-model="formFields.mediumPriority"
              inline
              class="d-inline"
              :label="$t('governance.accessRequest.priorities.mediumPriority')"
              name="mediumPriority"
              testid="priority-medium"
              type="checkbox">
              <template #prepend>
                <BImg
                  height="24"
                  :src="getPriorityImageSrc('medium')" />
              </template>
            </FrField>
          </div>
          <div class="d-inline-block border rounded-pill px-3 py-2 mr-2 mb-2">
            <FrField
              v-model="formFields.lowPriority"
              inline
              class="d-inline"
              :label="$t('governance.accessRequest.priorities.lowPriority')"
              name="lowPriority"
              testid="priority-low"
              type="checkbox">
              <template #prepend>
                <BImg
                  height="24"
                  :src="getPriorityImageSrc('low')" />
              </template>
            </FrField>
          </div>
        </div>
      </BCol>
      <BCol lg="6">
        <FrField
          v-model="formFields.requestType"
          class="mb-4"
          :label="$t('governance.accessRequest.requestType')"
          :options="requestTypeOptions"
          testid="request-type"
          type="select" />
      </BCol>
      <BCol lg="6">
        <FrGovResourceSelect
          v-model="formFields.requestedFor"
          class="mb-4"
          :first-option="allRequestersOption"
          :initial-data="{ id: 'all' }"
          :label="$t('governance.accessRequest.requestedFor')"
          resource-path="user"
          data-testid="requested-for" />
      </BCol>
      <BCol lg="6">
        <FrGovResourceSelect
          v-model="formFields.requester"
          class="mb-4"
          :first-option="allRequestersOption"
          :initial-data="{ id: 'all' }"
          :label="$t('governance.accessRequest.requester')"
          resource-path="user"
          data-testid="requester" />
      </BCol>
      <BCol lg="6">
        <FrField
          v-model="formFields.requestId"
          class="mb-4"
          :label="$t('governance.accessRequest.requestId')"
          testid="request-id" />
      </BCol>
    </BRow>
  </div>
</template>

<script>
import {
  BCol,
  BImg,
  BRow,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import getPriorityImageSrc, { requestTypes } from '@/components/utils/governance/AccessRequestUtils';
/**
 * Component used to filter access requests
 */
export default {
  name: 'RequestFilter',
  components: {
    BCol,
    BImg,
    BRow,
    FrField,
    FrGovResourceSelect,
  },
  data() {
    return {
      formFields: {
        highPriority: true,
        mediumPriority: true,
        lowPriority: true,
        requester: 'all',
        requestedFor: 'all',
        requestId: '',
        requestType: 'all',
      },
      allRequestersOption: {
        label: this.$t('governance.accessRequest.allRequesters'),
        value: 'all',
      },
      requestTypeOptions: [
        {
          text: this.$t('governance.accessRequest.requestTypes.all'),
          value: 'all',
        },
        {
          text: this.$t(requestTypes.ACCOUNT_GRANT.label),
          value: requestTypes.ACCOUNT_GRANT.value,
        },
        {
          text: this.$t(requestTypes.ACCOUNT_REVOKE.label),
          value: requestTypes.ACCOUNT_REVOKE.value,
        },
        {
          text: this.$t(requestTypes.ENTITLEMENT_GRANT.label),
          value: requestTypes.ENTITLEMENT_GRANT.value,
        },
        {
          text: this.$t(requestTypes.ENTITLEMENT_REVOKE.label),
          value: requestTypes.ENTITLEMENT_REVOKE.value,
        },
        {
          text: this.$t(requestTypes.ROLE_GRANT.label),
          value: requestTypes.ROLE_GRANT.value,
        },
        {
          text: this.$t(requestTypes.ROLE_REVOKE.label),
          value: requestTypes.ROLE_REVOKE.value,
        },
      ],
    };
  },
  computed: {
    /**
     * Calculates the number of filters active
     */
    numFilters() {
      let numFilters = 0;
      if (!this.formFields.highPriority) numFilters += 1;
      if (!this.formFields.mediumPriority) numFilters += 1;
      if (!this.formFields.lowPriority) numFilters += 1;
      if (this.formFields.requestType !== 'all') numFilters += 1;
      if (this.formFields.requestedFor !== 'managed/user/all') numFilters += 1;
      if (this.formFields.requester !== 'managed/user/all') numFilters += 1;
      if (this.formFields.requestId.length) numFilters += 1;

      return numFilters;
    },
  },
  methods: {
    getPriorityImageSrc,
    /**
     * Get an object representing the current filter properties
     */
    getFilterPayload() {
      const priorities = {
        high: this.formFields.highPriority,
        medium: this.formFields.mediumPriority,
        low: this.formFields.lowPriority,
      };
      const requestType = this.formFields.requestType === 'all'
        ? null
        : this.formFields.requestType;
      const requestedFor = this.formFields.requestedFor === 'managed/user/all'
        ? null
        : this.formFields.requestedFor;
      const requester = this.formFields.requester === 'managed/user/all'
        ? null
        : this.formFields.requester;
      const requestId = this.formFields.requestId.length
        ? this.formFields.requestId
        : null;

      return {
        priorities,
        requestType,
        requestedFor,
        requester,
        requestId,
      };
    },
  },
  watch: {
    formFields: {
      deep: true,
      handler() {
        this.$emit('filter-change', { filter: this.getFilterPayload(), count: this.numFilters });
      },
    },
  },
};
</script>

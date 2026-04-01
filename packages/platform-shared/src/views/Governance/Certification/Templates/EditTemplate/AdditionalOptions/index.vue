<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="p-4 flex-grow-1 overflow-auto h-100">
    <BContainer
      fluid
      class="mt-4">
      <h4 class="mb-4">
        {{ $t('governance.editTemplate.additionalOptions') }}
      </h4>
      <FrField
        v-model="formFields.allowSelfCert"
        v-if="!isEntitlementComposition"
        class="mb-4"
        name="allowSelfCert"
        testid="allow-self-cert"
        type="checkbox"
        :description="$t('governance.editTemplate.allowSelfCertDescription')"
        :label="$t('governance.editTemplate.allowSelfCert')" />
      <BCollapse :visible="formFields.allowSelfCert">
        <div class="p-4 rounded bg-light mb-4">
          <FrField
            v-model="formFields.selfCertFilter"
            name="selfCertFilter"
            class="maxWidth280"
            testid="self-cert-filter"
            type="select"
            :label="$t('governance.editTemplate.selfCertFilter')"
            :options="certFilterOptions"
            :searchable="false" />
        </div>
      </BCollapse>
      <FrField
        v-model="formFields.enableReassignmentDelegation"
        class="mb-4"
        name="enableReassignmentDelegation"
        testid="enable-reassignment-delegation"
        type="checkbox"
        :description="$t('governance.editTemplate.enableReassignmentDelegationDescription')"
        :label="$t('governance.editTemplate.enableReassignmentDelegation')" />
      <BCollapse :visible="formFields.enableReassignmentDelegation">
        <div class="p-4 rounded bg-light mb-4">
          <FrField
            v-model="formFields.enableForward"
            name="enableForward"
            testid="enable-forward"
            type="checkbox"
            :label="$t('governance.editTemplate.forward')" />
          <FrField
            v-model="formFields.enableReassign"
            class="mb-1"
            name="enableReassign"
            testid="enable-reassign"
            type="checkbox"
            :label="$t('governance.editTemplate.reassign')" />
          <BCollapse :visible="formFields.enableReassign">
            <div class="p-4 bg-light">
              <span>{{ $t('governance.editTemplate.enableReassignmentDelegationPermissions') }}</span>
              <div class="mt-2 d-flex flex-row">
                <FrField
                  v-model="formFields.reassignPermissions.comment"
                  class="mr-4"
                  name="comment"
                  testid="enable-addComment"
                  type="checkbox"
                  :label="$t('governance.editTemplate.addComment')" />
                <FrField
                  v-model="formFields.reassignPermissions.makeDecision"
                  class="mr-4"
                  name="certify"
                  testid="enable-makeDecision"
                  type="checkbox"
                  :label="$t('governance.editTemplate.makeDecision')" />
                <FrField
                  v-model="formFields.reassignPermissions.reassign"
                  class="mr-4"
                  name="reassign"
                  testid="enable-enableReassignForward"
                  type="checkbox"
                  :label="$t('governance.editTemplate.reassignForward')" />
                <FrField
                  v-model="formFields.reassignPermissions.signoff"
                  class="mr-4"
                  name="signoff"
                  testid="enable-signOff"
                  type="checkbox"
                  :label="$t('governance.editTemplate.signOff')" />
              </div>
            </div>
          </BCollapse>
        </div>
      </BCollapse>
      <FrField
        v-model="formFields.requireJustification.revoke"
        name="requireJustificationRevoke"
        class="mb-4"
        type="checkbox"
        :label="$t('governance.editTemplate.requireJustificationOnRevoke')" />
      <FrField
        v-model="formFields.requireJustification.exceptionAllowed"
        name="requireJustificationOnExceptionAllowException"
        class="mb-4"
        type="checkbox"
        :label="$t('governance.editTemplate.requireJustificationOnException')" />
      <FrField
        v-model="formFields.allowExceptions"
        name="allowExceptions"
        class="mb-4"
        testid="allow-exceptions"
        type="checkbox"
        :description="$t('governance.editTemplate.allowExceptionsDescription')"
        :label="$t('governance.editTemplate.allowExceptions')" />
      <BCollapse :visible="formFields.allowExceptions">
        <div class="p-4 rounded bg-light mb-4">
          <span>{{ $t('governance.editTemplate.allowExceptionsFor') }}</span>
          <FrField
            v-model="formFields.exceptionDuration"
            class="mb-0 mr-3 d-inline-block maxWidth70"
            name="exceptionDuration"
            testid="exception-duration"
            type="number" />
          <FrField
            v-model="formFields.exceptionTimespan"
            class="mb-0 d-inline-block minWidth120"
            name="exceptionTimespan"
            testid="exception-timespan"
            type="select"
            :options="timespanOptions"
            :searchable="false" />
        </div>
      </BCollapse>
      <FrField
        v-model="formFields.allowBulkCertify"
        class="mb-4"
        name="allowBulkCertify"
        testid="allow-bulk-certify"
        type="checkbox"
        :description="$t('governance.editTemplate.allowBulkCertifyDescription')"
        :label="$t('governance.editTemplate.allowBulkCertify')" />
      <FrField
        v-model="formFields.allowPartialSignoff"
        class="mb-4"
        name="allowPartialSignoff"
        testid="allow-partial-signoff"
        type="checkbox"
        :description="$t('governance.editTemplate.allowPartialSignoffDescription')"
        :label="$t('governance.editTemplate.allowPartialSignoff')" />
      <FrField
        v-model="formFields.processRemediation"
        name="processRemediation"
        class="mb-4"
        testid="process-remediation"
        type="checkbox"
        :description="$t('governance.editTemplate.processRemediationDescription')"
        :label="$t('governance.editTemplate.processRemediation')" />
      <BCollapse :visible="formFields.processRemediation">
        <div class="p-4 rounded bg-light mb-4">
          <span>{{ $t('governance.editTemplate.afterRevocation') }}</span>
          <FrField
            v-model="formFields.remediationTime"
            class="mb-0 d-inline-block minWidth120"
            name="remediationTime"
            testid="remediation-time"
            type="select"
            :options="remediationTimeOptions"
            :searchable="false" />
          <template v-if="formFields.remediationTime === $t('governance.timespans.afterADuration')">
            <span class="mx-2">
              {{ $t('governance.editTemplate.of') }}
            </span>
            <FrField
              v-model="formFields.remediationDuration"
              class="mb-0 mr-3 d-inline-block maxWidth70"
              name="remediationDuration"
              testid="remediation-duration"
              type="number" />
            <FrField
              v-model="formFields.remediationTimespan"
              class="mb-0 d-inline-block minWidth120"
              name="remediationTimespan"
              testid="remediation-timespan"
              type="select"
              :searchable="false"
              :options="timespanOptions" />
          </template>
        </div>
      </BCollapse>
    </BContainer>
  </div>
</template>

<script>
import {
  BCollapse,
  BContainer,
} from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import { types } from '../../templateTypes';

export default {
  name: 'AdditionalOptions',
  components: {
    BCollapse,
    BContainer,
    FrField,
  },
  props: {
    value: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      default: types.IDENTITY,
    },
  },
  data() {
    return {
      certFilterOptions: [
        this.$t('governance.editTemplate.allCertifiers'),
        this.$t('governance.editTemplate.ownersAdministrators'),
      ],
      remediationTimeOptions: [
        this.$t('governance.timespans.immediately'),
        this.$t('governance.timespans.afterADuration'),
      ],
      timespanOptions: [
        this.$t('governance.timespans.years'),
        this.$t('governance.timespans.months'),
        this.$t('governance.timespans.weeks'),
        this.$t('governance.timespans.days'),
      ],
      formFields: {
        allowBulkCertify: true,
        allowExceptions: true,
        allowPartialSignoff: false,
        allowSelfCert: false,
        enableReassign: true,
        enableForward: true,
        reassignPermissions: {
          comment: true,
          makeDecision: true,
          certify: true,
          reassign: true,
          signoff: true,
        },
        requireJustification: {
          revoke: true,
          exceptionAllowed: true,
        },
        enableReassignmentDelegation: true,
        exceptionDuration: this.value.exceptionDuration || 2,
        exceptionTimespan: '',
        processRemediation: false,
        remediationDuration: 0,
        remediationTime: '',
        remediationTimespan: '',
        selfCertFilter: '',
      },
    };
  },
  mounted() {
    Object.keys(this.value).forEach((field) => {
      this.formFields[field] = cloneDeep(this.value[field]);
    });
  },
  computed: {
    isEntitlementComposition() {
      return this.type === types.ENTITLEMENTCOMPOSITION;
    },
  },
  watch: {
    formFields: {
      deep: true,
      handler(newVal) {
        const payload = cloneDeep(newVal);
        this.$emit('input', {
          ...payload,
        });
      },
    },
  },
};
</script>
<style lang="scss" scoped>

.maxWidth70 {
  max-width: 70px;
}

.maxWidth280 {
  max-width: 280px;
}

.minWidth120 {
  min-width: 120px;
}

</style>

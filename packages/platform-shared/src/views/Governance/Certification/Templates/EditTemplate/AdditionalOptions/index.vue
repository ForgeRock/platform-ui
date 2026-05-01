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
      <FrField
        v-model="formFields.escalation"
        class="mb-4"
        name="escalation"
        testid="escalation"
        type="checkbox"
        :description="$t('governance.editTemplate.enableEscalationDescription')"
        :label="$t('governance.editTemplate.enableEscalation')" />
      <BCollapse
        :visible="formFields.escalation"
        class="position-relative">
        <div class="p-4 rounded bg-light mb-4">
          <div class="d-flex w-100 mb-4 align-items-center">
            <div class="mr-1">
              {{ $t('governance.editTemplate.escalateEvery') }}
            </div>
            <FrField
              v-model="formFields.escalationFrequency"
              class="mb-0 mr-3 pr-2 d-inline-block"
              name="escalationFrequency"
              :min="1"
              style="max-width: 70px;"
              testid="escalation-frequency"
              type="number"
              :validation="formFields.escalation ? { required: true, min_value: { min: 1 } } : {}" />
            <div class="mr-1">
              {{ $t('date.days') }}
            </div>
          </div>
          <div class="d-flex w-100 mb-4 align-items-center">
            <div class="mb-3 mr-1 w-auto pt-2 align-items-center">
              {{ $t('governance.editTemplate.escalateTo') }}
            </div>
            <div class="d-flex w-50 align-items-center">
              <FrField
                v-model="formFields.escalateToSelector"
                class="d-flex form-control-inline w-50 mr-2 align-items-center"
                name="formFields.escalateToSelector"
                type="select"
                :options="escalateToOptions"
                :searchable="false" />
              <FrGovResourceSelect
                v-if="formFields.escalateToSelector !== 'manager'"
                v-model="formFields.escalationOwner"
                :initial-data="formFields.escalationOwnerInfo"
                name="escalationOwner"
                class="w-100 align-items-center"
                @get-user-info="handleUserInfo"
                :resource-path="formFields.escalateToSelector" />
            </div>
          </div>
          <div class="d-flex w-100 mb-4 align-items-center">
            <div class="mr-1">
              {{ $t('governance.editTemplate.onEscalation') }}
            </div>
            <FrField
              v-model="formFields.escalationAction"
              class="d-inline-block mr-1"
              name="escalationAction"
              style="min-width: 200px;"
              testid="escalation-action"
              type="select"
              validation="required"
              :options="escalationActionOptions"
              :searchable="false" />
            <FrField
              v-model="formFields.escalationEmail"
              class="d-inline-block mr-1"
              name="escalationEmail"
              style="min-width: 200px;"
              testid="escalation-email"
              type="select"
              validation="required"
              :label="$t('governance.editTemplate.emailTemplate')"
              :options="emailTemplateOptions"
              :searchable="false" />
          </div>
        </div>
      </BCollapse>
      <div class="mb-1 text-secondary">
        {{ $t('governance.editTemplate.whenCampaignExpires') }}
      </div>
      <small class="mb-4 form-text text-muted">{{ $t('governance.editTemplate.whenCampaignExpiresDescription') }}</small>
      <div class="p-4 rounded bg-light mb-4">
        <BFormRadioGroup
          v-model="formFields.expireOption"
          name="expire-options">
          <div class="d-flex align-items-center mb-3">
            <BFormRadio
              class="mr-0"
              :value="0">
              {{ $t('governance.editTemplate.closeAnd') }}
            </BFormRadio>
            <div class="d-inline ml-2">
              <FrField
                v-model="formFields.closeAction"
                class="form-control-inline width-191 w-100"
                name="closeAction"
                testid="close-action"
                type="select"
                :options="closeActionOptions"
                :searchable="false" />
            </div>
            <span class="mx-2">
              {{ $t('governance.editTemplate.openItems') }}
            </span>
            <div class="d-inline">
              <FrField
                v-model="formFields.closeActionTime"
                class="form-control-inline width-191 w-100"
                name="closeActionTime"
                testid="close-action-time"
                type="select"
                :options="closeActionTimeOptions"
                :searchable="false" />
            </div>
            <template v-if="formFields.closeActionTime === $t('governance.timespans.afterADuration')">
              <span class="mx-2">
                {{ $t('governance.editTemplate.of') }}
              </span>
              <FrField
                v-model="formFields.closeActionDuration"
                class="mb-0 mr-3 d-inline-block"
                name="closeActionDuration"
                style="max-width: 70px;"
                testid="close-action-duration"
                type="number" />
              <span>
                {{ $t('date.days') }}
              </span>
            </template>
          </div>
          <div class="d-flex w-100 align-items-center mb-3">
            <div class="w-auto align-items-center pt-2">
              <BFormRadio :value="1">
                {{ $t('governance.editTemplate.reassignToCertify') }}
              </BFormRadio>
            </div>
            <div class="d-flex w-50 align-items-center">
              <FrField
                v-model="reassignToSelector"
                class="form-control-inline w-50 mr-2"
                name="reassignAction"
                type="select"
                :options="reassignToOptions"
                :searchable="false" />
              <FrGovResourceSelect
                v-model="formFields.reassignUser"
                :initial-data="formFields.reassignUserInfo"
                name="reassignUser"
                class="w-100"
                :resource-path="reassignToSelector === this.$t('governance.editTemplate.user') ? 'user' : 'role'" />
            </div>
          </div>
          <div class="mb-3">
            <BFormRadio :value="2">
              {{ $t('governance.editTemplate.doNothing') }}
            </BFormRadio>
          </div>
        </BFormRadioGroup>
      </div>
    </BContainer>
  </div>
</template>

<script>
import {
  BCollapse,
  BContainer,
  BFormRadio,
  BFormRadioGroup,
} from 'bootstrap-vue';
import { cloneDeep, find } from 'lodash';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import { types } from '../../templateTypes';

export default {
  name: 'AdditionalOptions',
  components: {
    BCollapse,
    BContainer,
    BFormRadio,
    BFormRadioGroup,
    FrField,
    FrGovResourceSelect,
  },
  props: {
    emailTemplateOptions: {
      type: Array,
      default: () => [],
    },
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
      closeActionOptions: [
        {
          text: this.$t('governance.editTemplate.closeActions.revoke'),
          value: 'revoke',
        },
        {
          text: this.$t('governance.editTemplate.closeActions.certify'),
          value: 'certify',
        },
        {
          text: this.$t('governance.editTemplate.closeActions.allowException'),
          value: 'exception',
        },
      ],
      escalationActionOptions: [
        {
          text: this.$t('governance.editTemplate.notify'),
          value: 'notification',
        },
        {
          text: this.$t('governance.editTemplate.reassign'),
          value: 'reassign',
        },
      ],
      closeActionTimeOptions: [
        this.$t('governance.timespans.immediately'),
        this.$t('governance.timespans.afterADuration'),
      ],
      escalateToOptions: [
        {
          text: this.$t('governance.editTemplate.role'),
          value: 'role',
        },
        {
          text: this.$t('governance.editTemplate.user'),
          value: 'user',
        },
        {
          text: this.$t('governance.editTemplate.manager'),
          value: 'manager',
        },
      ],
      reassignToOptions: [
        this.$t('governance.editTemplate.role'),
        this.$t('governance.editTemplate.user'),
      ],
      reassignToSelector: this.$t('governance.editTemplate.role'),
      formFields: {
        allowBulkCertify: true,
        allowExceptions: true,
        allowPartialSignoff: false,
        allowSelfCert: false,
        escalateToSelector: 'role',
        escalation: false,
        escalationAction: 'notification',
        escalationFrequency: this.value.escalationFrequency || 7,
        escalationEmail: 'emailTemplate/certificationEscalated',
        escalationOwner: '',
        escalationOwnerInfo: {},
        escalationTimespan: '',
        closeAction: 'revoke',
        closeActionDuration: 0,
        closeActionTime: '',
        expireOption: 2,
        enableReassign: true,
        enableForward: true,
        reassignUser: '',
        reassignRole: '',
        reassignUserInfo: {},
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
  methods: {
    /**
     * Adds userInfo to formFields
     * @param {Object} userInfo Data corresponding to the selected user
     */
    handleUserInfo(userInfo) {
      this.formFields.escalationOwnerInfo = userInfo;
    },
  },
  mounted() {
    Object.keys(this.value).forEach((field) => {
      this.formFields[field] = cloneDeep(this.value[field]);
    });
    if (!this.formFields.escalationEmail) {
      this.formFields.escalationEmail = find(this.emailTemplateOptions, { value: 'emailTemplate/certificationEscalated' });
    }
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
:deep(.fr-field) {
  .form-control{
    width: 100%;
  }
}

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

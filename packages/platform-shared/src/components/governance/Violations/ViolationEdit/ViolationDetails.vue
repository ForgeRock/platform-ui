<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BRow
    v-for="(column, key) in columns"
    :key="column.title"
    class="mb-4">
    <BCol lg="4">
      {{ column.title }}
    </BCol>
    <BCol lg="8">
      <template v-if="!column.custom">
        {{ column.value }}
      </template>
      <template v-if="key === 'user' || key === 'ruleOwner'">
        <BMedia>
          <template #aside>
            <BImg
              alt=""
              class="rounded-circle size-28"
              :aria-hidden="true"
              :src="column.value.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          </template>
          <BMediaBody>
            <p class="h5 m-0">
              {{ $t('common.userFullName', { givenName: column.value.givenName, sn: column.value.sn }) }}
            </p>
            <small class="mb-0">
              {{ column.value.userName }}
            </small>
          </BMediaBody>
        </BMedia>
      </template>
      <template v-if="key === 'status'">
        <BBadge
          :variant="statusVariant">
          {{ column.value }}
        </BBadge>
      </template>
      <template v-if="key === 'conflicts'">
        <BButton
          @click="$emit('view-conflicts')"
          class="px-0"
          variant="link">
          {{ $t('governance.violations.viewConflicts') }}
        </BButton>
      </template>
    </BCol>
  </BRow>
</template>

<script setup>
/**
 * Shows generic details about a violation
 */
import { ref, watch } from 'vue';
import { isEmpty } from 'lodash';
import {
  BBadge,
  BButton,
  BCol,
  BImg,
  BMedia,
  BMediaBody,
  BRow,
} from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';

defineEmits(['view-conflicts']);

const props = defineProps({
  violation: {
    type: Object,
    default: () => {},
  },
});

const columns = ref({
  user: {
    title: i18n.global.t('common.user.user'),
    custom: true,
  },
  ruleName: {
    title: i18n.global.t('governance.violations.ruleName'),
  },
  ruleDescription: {
    title: i18n.global.t('governance.violations.ruleDescription'),
  },
  ruleOwner: {
    title: i18n.global.t('governance.violations.ruleOwner'),
    custom: true,
  },
  status: {
    title: i18n.global.t('common.status'),
    custom: true,
  },
  conflicts: {
    title: i18n.global.t('governance.violations.conflicts'),
    custom: true,
  },
  riskLevel: {
    title: i18n.global.t('governance.violations.riskLevel'),
  },
  mitigatingControl: {
    title: i18n.global.t('governance.violations.mitigatingControl'),
  },
  controlUrl: {
    title: i18n.global.t('governance.violations.controlUrl'),
  },
  correctionAdvice: {
    title: i18n.global.t('governance.violations.correctionAdvice'),
  },
});

const statusVariant = ref('light');

function getStatus(violation) {
  const status = violation.decision?.status;
  switch (status) {
    case 'complete':
      if (violation.decision.outcome === 'allow') return i18n.global.t('governance.violations.status.allow');
      if (violation.decision.outcome === 'remediate') return i18n.global.t('governance.violations.status.remediate');
      return i18n.global.t('governance.violations.status.complete');
    case 'exception':
      return i18n.global.t('governance.violations.status.exception');
    case 'pending':
      return i18n.global.t('governance.violations.status.pending');
    case 'in-progress':
      return i18n.global.t('governance.violations.status.inProgress');
    default:
      return blankValueIndicator;
  }
}

function getStatusVariant(violation) {
  const status = violation.decision?.status;
  switch (status) {
    case 'complete':
      return 'success';
    case 'exception':
      return 'warning';
    case 'in-progress':
    case 'pending':
    default:
      return 'light';
  }
}

/**
 * Sets the data that is shown based on the violation object
 * @param {Object} violation violation
 */
function setColumnData(violation) {
  columns.value.user.value = {
    userName: violation.user.userName,
    givenName: violation.user.givenName,
    sn: violation.user.sn,
  };
  columns.value.ruleName.value = violation.policyRule.name || blankValueIndicator;
  columns.value.ruleDescription.value = violation.policyRule.description || blankValueIndicator;
  columns.value.ruleOwner.value = {
    userName: violation.policyRule.policyRuleOwner.userName,
    givenName: violation.policyRule.policyRuleOwner.givenName,
    sn: violation.policyRule.policyRuleOwner.sn,
  };
  columns.value.status.value = getStatus(violation);
  statusVariant.value = getStatusVariant(violation);
  columns.value.riskLevel.value = violation.policyRule.riskScore || 0;
  columns.value.mitigatingControl.value = violation.policyRule.mitigatingControl || blankValueIndicator;
  columns.value.controlUrl.value = violation.policyRule.documentationUrl || blankValueIndicator;
  columns.value.correctionAdvice.value = violation.policyRule.correctionAdvice || blankValueIndicator;
}

watch(
  () => props.violation,
  (val) => {
    if (!isEmpty(val)) setColumnData(val);
  },
  { immediate: true, deep: true },
);

</script>

<!-- Copyright 2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="campaign-details-modal"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    size="lg"
    title-class="h5"
    title-tag="h2"
    :ok-title="$t('common.done')"
    :static="isTesting"
    :title="$t('governance.certificationDetails.campaingDetailsCardTitle')"
    @hidden="emit('close')">
    <BRow class="mb-3">
      <BCol>
        <small class="d-block mb-1">
          {{ $t('common.status') }}
        </small>
        <BBadge variant="light">
          {{ $t('governance.status.creating') }}
        </BBadge>
      </BCol>
      <BCol>
        <small class="d-block mb-2">
          {{ $t('governance.certificationDetails.campaignOwnerLabel') }}
        </small>
        <FrUserBasicInfo
          :pic-dimension="28"
          :user="campaign.ownerInfo" />
      </BCol>
      <BCol>
        <small class="d-block mb-1">
          {{ $t('governance.certificationDetails.campaignDurationLabel') }}
        </small>
        <p>
          {{ getCampaignDuration(campaign.stageDuration) }}
        </p>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <small class="mb-1">
          {{ $t('governance.certificationDetails.campaignDescriptionLabel') }}
        </small>
        <p>{{ campaign.description || blankValueIndicator }}</p>
      </BCol>
    </BRow>
  </BModal>
</template>

<script setup>
import {
  BModal,
  BRow,
  BCol,
} from 'bootstrap-vue';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getCampaignDuration } from '@forgerock/platform-shared/src/views/Governance/utils/certification';

const emit = defineEmits(['close']);

defineProps({
  campaign: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});
</script>

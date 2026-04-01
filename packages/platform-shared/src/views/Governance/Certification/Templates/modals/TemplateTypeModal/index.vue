<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BModal
    id="CampaignTemplateTypeModal"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :ok-title="$t('common.next')"
    :ok-disabled="!selectedCampaignTemplateType"
    :title="$t('governance.campaignTemplateTypeModal.newCertificationCampaignTemplate')"
    @ok="nextStep()">
    <div class="modal-step">
      <BRow>
        <BCol lg="4">
          <h5>
            {{ $t('governance.campaignTemplateTypeModal.campaignType') }}
          </h5>
          <p class="mb-4">
            {{ $t('governance.campaignTemplateTypeModal.chooseType') }}
          </p>
        </BCol>
        <BCol lg="8">
          <div class="pl-lg-4">
            <FrCardRadioInput
              class="mb-3"
              :radio-value="types.IDENTITY"
              name="selectCampaignTemplateType"
              v-model="selectedCampaignTemplateType">
              <BMedia no-body>
                <FrIcon
                  name="person"
                  icon-class="d-flex fr-realm-stamp align-items-center justify-content-center p-3 mr-4 rounded border mr-4 color-green border-green" />
                <BMediaBody>
                  <h3
                    class="h5"
                    :aria-label="$t('governance.editTemplate.templateType.identity')">
                    {{ $t('governance.editTemplate.templateType.identity') }}
                  </h3>
                  <div class="d-block">
                    {{ $t('governance.campaignTemplateTypeModal.identityCertificationMessage') }}
                  </div>
                </BMediaBody>
              </BMedia>
            </FrCardRadioInput>
            <FrCardRadioInput
              class="mb-3"
              :radio-value="types.ENTITLEMENT"
              name="selectedCampaignTemplateType"
              v-model="selectedCampaignTemplateType">
              <BMedia no-body>
                <FrIcon
                  name="assignment_turned_in"
                  icon-class="d-flex fr-realm-stamp align-items-center justify-content-center p-3 mr-4 rounded border mr-4 border-pink color-pink" />
                <BMediaBody>
                  <h3
                    class="h5"
                    :aria-label="$t('governance.campaignTemplateTypeModal.entitlementAssignmentCertification')">
                    {{ $t('governance.campaignTemplateTypeModal.entitlementAssignmentCertification') }}
                  </h3>
                  <div class="d-block">
                    {{ $t('governance.campaignTemplateTypeModal.entitlementAssignmentCertificationMessage') }}
                  </div>
                </BMediaBody>
              </BMedia>
            </FrCardRadioInput>
            <FrCardRadioInput
              class="mb-3"
              :radio-value="types.ROLEMEMBERSHIP"
              name="selectedCampaignTemplateType"
              v-model="selectedCampaignTemplateType">
              <BMedia no-body>
                <FrIcon
                  name="assignment_ind"
                  icon-class="d-flex fr-realm-stamp align-items-center justify-content-center p-3 mr-4 rounded border mr-4 border-yellow color-yellow" />
                <BMediaBody>
                  <h3
                    class="h5"
                    :aria-label="$t('governance.campaignTemplateTypeModal.roleMembershipCertification')">
                    {{ $t('governance.campaignTemplateTypeModal.roleMembershipCertification') }}
                  </h3>
                  <div class="d-block">
                    {{ $t('governance.campaignTemplateTypeModal.roleMembershipCertificationMessage') }}
                  </div>
                </BMediaBody>
              </BMedia>
            </FrCardRadioInput>
            <FrCardRadioInput
              class="mb-3"
              :radio-value="types.ENTITLEMENTCOMPOSITION"
              name="selectedCampaignTemplateType"
              v-model="selectedCampaignTemplateType">
              <BMedia no-body>
                <FrIcon
                  name="assignment_turned_in"
                  icon-class="d-flex fr-realm-stamp align-items-center justify-content-center p-3 mr-4 rounded border mr-4 border-blue color-blue" />
                <BMediaBody>
                  <h3
                    class="h5"
                    :aria-label="$t('governance.campaignTemplateTypeModal.entitlementCompositionCertification')">
                    {{ $t('governance.campaignTemplateTypeModal.entitlementCompositionCertification') }}
                  </h3>
                  <div class="d-block">
                    {{ $t('governance.campaignTemplateTypeModal.entitlementCompositionCertificationMessage') }}
                  </div>
                </BMediaBody>
              </BMedia>
            </FrCardRadioInput>
          </div>
        </BCol>
      </BRow>
    </div>
  </BModal>
</template>

<script>
import {
  BCol,
  BMedia,
  BMediaBody,
  BModal,
  BRow,
} from 'bootstrap-vue';
import FrCardRadioInput from '@forgerock/platform-shared/src/components/CardRadioInput';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import useCertification from '@forgerock/platform-shared/src/composables/certification';
import { types } from '@forgerock/platform-shared/src/views/Governance/Certification/Templates/templateTypes';

export default {
  name: 'TemplateTypeModal',
  components: {
    BCol,
    BMedia,
    BMediaBody,
    BModal,
    BRow,
    FrCardRadioInput,
    FrIcon,
  },
  setup() {
    const { setTemplate } = useCertification();
    return { setTemplate };
  },
  data() {
    return {
      selectedCampaignTemplateType: null,
      types,
    };
  },
  methods: {
    nextStep() {
      this.setTemplate({});
      this.$router.push({
        name: 'CertificationTemplate',
        params: {
          type: this.selectedCampaignTemplateType,
        },
      });
    },
  },
};
</script>

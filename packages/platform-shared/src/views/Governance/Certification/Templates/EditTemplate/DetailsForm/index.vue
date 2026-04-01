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
        {{ $t('governance.editTemplate.campaignDetails') }}
      </h4>
      <FrField
        v-model="formFields.name"
        class="mb-4"
        name="name"
        testid="name"
        type="string"
        :validation="{ required: !eventBased, unique: currentTemplateNamesList }"
        :label="$t('common.name')" />
      <FrField
        v-model="formFields.description"
        class="mb-4"
        name="description"
        show-length-count
        testid="description"
        type="textarea"
        :label="$t('common.description')"
        :max-length="descriptionMaxLength"
        :validation="{ max: descriptionMaxLength }" />
      <FrGovResourceSelect
        v-model="formFields.owner"
        :initial-data="formFields.ownerInfo"
        name="owner"
        :label="$t('governance.editTemplate.campaignOwner')"
        @get-user-info="handleUserInfo"
        class="mb-5"
        resource-path="user" />
      <FrField
        v-if="!eventBased"
        v-model="formFields.stagingEnabled"
        class="mb-4"
        name="test"
        testid="staging-enabled"
        type="checkbox"
        :description="$t('governance.editTemplate.enableStagingDescription')"
        :label="$t('governance.editTemplate.enableStaging')" />
    </BContainer>
  </div>
</template>

<script>
import { BContainer } from 'bootstrap-vue';
import { cloneDeep } from 'lodash';
import { getCertificationTemplates } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';

export default {
  name: 'DetailsForm',
  components: {
    BContainer,
    FrField,
    FrGovResourceSelect,
  },
  props: {
    eventBased: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      currentTemplateNamesList: [],
      descriptionMaxLength: 1000,
      formFields: {
        description: '',
        name: '',
        owner: '',
        ownerInfo: {},
        stagingEnabled: false,
      },
    };
  },
  created() {
    Object.keys(this.value).forEach((field) => {
      this.formFields[field] = cloneDeep(this.value[field]);
    });

    // get template names list
    getCertificationTemplates('', { fields: 'name', pageSize: 10000 }).then(({ data }) => {
      this.currentTemplateNamesList = data.result.map((item) => item.name).filter((item) => item !== this.value?.name);
    }).catch((error) => {
      this.showErrorMessage(error, this.$t('tenantSettings.details.errorSearchingTemplates'));
    });
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
  methods: {
    /**
     * Adds userInfo to formFields
     * @param {Object} userInfo Data corresponding to the selected user
     */
    handleUserInfo(userInfo) {
      this.formFields.ownerInfo = userInfo;
    },
  },
};
</script>

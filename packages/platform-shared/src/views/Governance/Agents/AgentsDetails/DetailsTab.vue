<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSpinner
    v-if="isLoading.all || isLoadingForm"
    class="py-5" />
  <template v-else>
    <BRow>
      <BCol>
        <BCard class="mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              {{ $t('governance.agents.details.detailsTab.aboutThisAgent') }}
            </h5>
            <BButton
              v-if="!props.readOnly"
              variant="link"
              :disabled="isLoading.all"
              @click="editAgentDetails">
              <FrIcon
                icon-class="mr-2 text-nowrap"
                name="edit">
                {{ $t('governance.agents.editAgent') }}
              </FrIcon>
            </BButton>
          </div>
          <p class="mb-0 text-secondary mt-2">
            {{ props.agent.account?.description || $t('governance.agents.details.detailsTab.noDescription') }}
          </p>
        </BCard>
        <BCard
          v-if="props.agent.user"
          class="mb-3"
          data-testid="linked-agent-identity-card">
          <BRow>
            <BCol
              sm="6"
              class="mb-3 h5">
              {{ $t('governance.agents.details.detailsTab.linkedAgentIdentity') }}
            </BCol>
          </BRow>
          <BRow>
            <BCol
              class="mb-2"
              sm="3">
              <FrUserDetails :user-object="props.agent.user" />
            </BCol>
          </BRow>
        </BCard>
        <FrCustodiansTab
          :agent-id="props.agent.id"
          :account-id="props.agent.keys?.accountId"
          :read-only="props.readOnly" />
      </BCol>
      <BCol>
        <BCard
          v-if="governanceDevEnabled && !props.readOnly && form && form.form && form.form.fields && form.form.fields.length"
          class="mb-3">
          <FrFormBuilder
            v-model:model-value="formValue"
            :form="form.form"
            :read-only="props.readOnly"
            @is-valid="isValidForm = $event" />
          <div class="p-4 border-top">
            <FrButtonWithSpinner
              class="d-block ml-auto"
              variant="primary"
              :disabled="isFormSaving || !isValidForm"
              :show-spinner="isFormSaving"
              @click="submitRequest" />
          </div>
        </BCard>
        <FrAccountObjectProperties
          v-else
          @toggle-collapse="isVisible.properties = !isVisible.properties"
          enable-collapse
          preserve-order
          :is-collapsed="!isVisible.properties"
          :object-properties="agentData"
          :schema="accountSchema"
          class="mb-3"
          object="agents" />
        <BCard class="mb-3">
          <h5 class="mb-0">
            <BButton
              class="w-100 d-flex justify-content-between align-items-center p-0 text-left cursor-pointer"
              variant="link"
              aria-controls="agent-technical-details"
              :aria-expanded="isVisible.technical ? 'true' : 'false'"
              @click="isVisible.technical = !isVisible.technical">
              {{ $t('governance.agents.details.objectPropertiesTab.technicalDetails') }}
              <FrIcon :name="isVisible.technical ? 'keyboard_arrow_down' : 'chevron_right'" />
            </BButton>
          </h5>
          <BCollapse
            id="agent-technical-details"
            :visible="isVisible.technical">
            <pre class="mt-3 mb-0 fr-technical-details">{{ JSON.stringify(props.agent.account || {}, null, 2) }}</pre>
          </BCollapse>
        </BCard>
      </BCol>
    </BRow>
  </template>
  <BModal
    id="modify-agent-form-success"
    size="lg"
    no-close-on-backdrop
    no-close-on-esc
    title-class="h5"
    title-tag="h2"
    header-class="p-3"
    :title="$t('common.success')"
    @hidden="navigateAfterSuccess">
    <FrRequestSubmitSuccess
      :request-id="formRequestId"
      :success-text="$t('governance.agents.details.modifyFormTab.modifySuccess')" />
    <template #modal-footer="{ hide }">
      <BButton
        class="ml-auto"
        variant="link"
        @click="hide">
        {{ $t('common.close') }}
      </BButton>
    </template>
  </BModal>
  <BModal
    id="UpdateAgentModal"
    no-close-on-backdrop
    size="lg"
    title-class="h5"
    title-tag="h2"
    :title="$t('governance.agents.modal.title')">
    <div class="mb-4 d-block">
      {{ $t('governance.agents.modal.updateDescription') }}
    </div>
    <FrGlossaryEditForm
      :display-data="displayData"
      :glossary-schema="updateSchema"
      :model-value="glossaryValues"
      user-resource-name="alpha_user"
      @update:modelValue="updateGlossaryValues" />
    <template #modal-footer>
      <div class="d-flex justify-content-end">
        <BButton
          variant="link"
          @click="closeModal()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          class="d-block ml-auto"
          :show-spinner="isSaving"
          :disabled="isLoading.all"
          @click="save()" />
      </div>
    </template>
  </BModal>
</template>

<script setup>
import {
  onMounted, ref, computed,
} from 'vue';
import { cloneDeep } from 'lodash';
import {
  BButton,
  BCard,
  BCol,
  BCollapse,
  BModal,
  BRow,
} from 'bootstrap-vue';
import { useRouter } from 'vue-router';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import useForm from '@forgerock/platform-shared/src/composables/governance/forms';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { requestTypes } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
import FrRequestSubmitSuccess from '@forgerock/platform-shared/src/components/governance/LCM/RequestSubmitSuccess';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { getAgentGlossaryAttributesData, saveAgentGlossaryAttributesData } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrUserDetails from '@forgerock/platform-shared/src/components/governance/UserDetails';
import FrAccountObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrCustodiansTab from './CustodiansTab';
import i18n from '@/i18n';
import agentConstants from '../utils/agentConstants';
import { useAgentConfig, resolveTemplateId } from '../utils/useAgentConfig';
import {
  buildAgentPropertiesDisplay, buildAgentPropertiesSchema, resolveAgentSchema,
} from '../utils/agentUtility';
import { adjustAccountGlossaryForDisplay } from '../../Accounts/utils/accountUtility';

const props = defineProps({
  agent: {
    type: Object,
    required: true,
  },
  governanceDevEnabled: {
    type: Boolean,
    default: false,
  },
  isEndUser: {
    type: Boolean,
    default: true,
  },
  readOnly: {
    type: Boolean,
    default: true,
  },
});

const { bvModal } = useBvModal();
const router = useRouter();

const {
  isLoadingForm,
  isValidForm,
  form,
  formTypes,
  formValue,
  getFormDefinitionByType,
} = useForm();
const isFormSaving = ref(false);
const formRequestId = ref('');

function navigateAfterSuccess() {
  router.push({ name: props.isEndUser ? 'AdministerAgents' : 'Agents' });
}

async function submitRequest() {
  isFormSaving.value = true;
  try {
    const payload = {
      common: formValue.value?.common || {},
      custom: formValue.value?.custom || {},
      agent: {
        agentId: props.agent.id,
        object: formValue.value?.account || formValue.value?.user || {},
      },
    };
    const { data } = await submitCustomRequest(requestTypes.MODIFY_AGENT.value, payload);
    formRequestId.value = data.id;
    bvModal.value.show('modify-agent-form-success');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.requestForm.errorSubmittingRequest'));
  } finally {
    isFormSaving.value = false;
  }
}

const glossarySchema = ref([]);
const glossaryValues = ref({});
const displayData = ref({});

async function initializeForm() {
  formValue.value = {
    account: { ...(props.agent?.account || {}) },
    user: { ...glossaryValues.value },
  };
  await getFormDefinitionByType(formTypes.LCM, {
    lcmType: 'agent',
    operation: 'update',
    setInitialModel: false,
  });
  isLoadingForm.value = false;
}
const updateSchema = computed(() => adjustAccountGlossaryForDisplay(glossaryValues.value.accountType, glossarySchema.value).filter((field) => field.name !== 'actors'));
const isVisible = ref({ properties: true, technical: false });
const isSaving = ref(false);
const isLoading = ref({ all: false });
const {
  agentSchema: configSchema, agentMappings: configMappings, agentTemplateSources: configTemplateSources, loadConfig,
} = useAgentConfig();
// The properties card renders from the resolved schema; each schema key joins
// to the account attribute via the template's mapping (see getMappingSystemKey).
const agentPropertiesSchema = computed(() => resolveAgentSchema(configSchema.value));
const templateName = computed(() => resolveTemplateId(props.agent.application, configTemplateSources.value));
const agentMapping = computed(() => configMappings.value[templateName.value]
  || configMappings.value.default || []);
const agentData = computed(() => buildAgentPropertiesDisplay(
  props.agent?.account || {},
  agentPropertiesSchema.value,
  agentMapping.value,
  props.agent.application,
));
const accountSchema = computed(() => buildAgentPropertiesSchema(agentPropertiesSchema.value));

async function getGlossaryValues() {
  try {
    const { data } = await getAgentGlossaryAttributesData(props.agent?.keys?.accountId);
    const { _displayData, ...glossaryData } = data;
    displayData.value = _displayData || {};
    return glossaryData;
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: i18n.global.t('common.agent') }));
    }
    return props.agent?.glossary?.idx?.['/account'] || {};
  }
}

async function getGlossary() {
  try {
    const [glossaryValuesResult, glossarySchemaResult] = await Promise.all([
      getGlossaryValues(),
      getGlossarySchema(),
    ]);
    glossaryValues.value = glossaryValuesResult;
    glossarySchema.value = glossarySchemaResult.data['/iga/governance/account'];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: i18n.global.t('common.agent') }));
  }
}

function updateGlossaryValues(value) {
  glossaryValues.value = value;
}

function editAgentDetails() {
  bvModal.value.show('UpdateAgentModal');
}

function closeModal() {
  bvModal.value.hide('UpdateAgentModal');
}

async function save() {
  isSaving.value = true;
  try {
    const payload = cloneDeep(glossaryValues.value);
    if (payload.accountType !== agentConstants.ACCOUNT_TYPES.MACHINE) {
      delete payload.accountSubtype;
    }
    await saveAgentGlossaryAttributesData(props.agent?.keys?.accountId, payload);
    displayNotification('success', i18n.global.t('governance.agents.details.detailsTab.agentSaved'));
    closeModal();
    isLoading.value.all = true;
    try {
      await getGlossary();
    } finally {
      isLoading.value.all = false;
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.details.detailsTab.agentSaveErrorMessage'));
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  try {
    isLoading.value.all = true;
    await Promise.all([getGlossary(), loadConfig()]);
    if (props.governanceDevEnabled && !props.readOnly) {
      await initializeForm();
    } else {
      isLoadingForm.value = false;
    }
  } finally {
    isLoading.value.all = false;
  }
});
</script>

<style lang="scss" scoped>
.fr-technical-details {
  font-size: 0.8rem;
  background-color: $gray-100;
  border-radius: 4px;
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

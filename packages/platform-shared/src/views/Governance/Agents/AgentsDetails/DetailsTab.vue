<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSpinner
    v-if="isLoading.all"
    class="py-5" />
  <template v-else>
    <div
      class="d-flex">
      <BButton
        v-if="!props.readOnly"
        variant="primary"
        class="mb-4 mr-2"
        :disabled="isLoading.all"
        @click="editAgentDetails">
        <FrIcon
          icon-class="mr-2 text-nowrap"
          name="edit">
          {{ $t('governance.agents.editAgent') }}
        </FrIcon>
      </BButton>
    </div>
    <FrAccountObjectProperties
      @toggle-collapse="isVisible.properties = !isVisible.properties"
      enable-collapse
      :is-collapsed="!isVisible.properties"
      :object-properties="agentData"
      class="mb-3"
      object="agents" />
    <BCard
      class="mb-3">
      <div
        class="d-flex justify-content-between section-header"
        @click="isVisible.custodians = !isVisible.custodians">
        <h1 class="h5">
          {{ $t('governance.agents.custodians') }}
        </h1>
        <FrIcon
          :name="isVisible.custodians ? 'keyboard_arrow_down' : 'chevron_right'"
          class="ml-2" />
      </div>
      <BCollapse :visible="isVisible.custodians">
        <BRow>
          <BCol
            v-for="actor in actors"
            class="mb-2"
            :key="actor._id"
            sm="3">
            <FrUserDetails :user-object="actor" />
          </BCol>
        </BRow>
      </BCollapse>
    </BCard>
    <template
      v-if="!props.isEndUser">
      <BCard
        v-for="agentProp in Object.keys(agentApplicationProps)"
        :key="agentApplicationProps[agentProp].accountAttribute"
        class="mb-3">
        <div
          class="d-flex justify-content-between section-header"
          @click="isVisible[agentProp] = !isVisible[agentProp]">
          <h1 class="h5">
            {{ i18n.global.t(`governance.agents.${agentProp}`) }}
          </h1>
          <FrIcon
            :name="isVisible[agentProp] ? 'keyboard_arrow_down' : 'chevron_right'"
            class="ml-2" />
        </div>
        <BCollapse :visible="isVisible[agentProp]">
          <FrEntityList
            :entities="resourceData[agentProp]?.result || []"
            :total-entities="getAgentPropList(agentProp)?.length"
            :agent-property="agentApplicationProps[agentProp]"
            :is-loading="isLoading[agentProp]"
            :type="agentProp"
            :icon="agentConstants.AGENT_ICONS[agentProp]"
            @pagination-change="handleEntityPaginationChange" />
        </BCollapse>
      </BCard>
    </template>
  </template>
  <BModal
    id="UpdateAgentModal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :title="$t('governance.agents.modal.title')">
    <div class="mb-4 d-block">
      {{ $t('governance.agents.modal.updateDescription') }}
    </div>
    <FrGlossaryEditForm
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
  onMounted, ref, computed, watch,
} from 'vue';
import { isArray, map, cloneDeep } from 'lodash';
import {
  BButton, BCard, BCollapse, BModal, BRow, BCol,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrUserDetails from '@forgerock/platform-shared/src/components/governance/UserDetails';
import { getAccountGlossaryAttributesData, saveAccountGlossaryAttributesData } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getAgentResourcesByIds } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrAccountObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrEntityList from './AgentEntityList';

import i18n from '@/i18n';
import agentConstants from '../utils/agentConstants';
import { adjustAccountGlossaryForDisplay } from '../../Accounts/utils/accountUtility';

const props = defineProps({
  agent: {
    type: Object,
    required: true,
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
const glossarySchema = ref([]);
const glossaryValues = ref({});
const updateSchema = computed(() => adjustAccountGlossaryForDisplay(glossaryValues.value.accountType, glossarySchema.value));
const actors = ref([]);
const isVisible = ref({
  ...Object.keys(agentConstants.AGENT_APPLICATION_PROPS.default || {}).reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {}),
  custodians: true,
  properties: true,
});
const resourceData = ref({});
const isSaving = ref(false);
const isLoading = ref({
  ...Object.keys(agentConstants.AGENT_APPLICATION_PROPS.default || {}).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {}),
  all: false,
});
const templateName = computed(() => props.agent.application?.templateName?.replace(/-override$/, ''));
const agentApplicationProps = computed(() => agentConstants.AGENT_APPLICATION_PROPS[templateName.value] || agentConstants.AGENT_APPLICATION_PROPS.default);
const agentData = computed(() => {
  // Converts agents to a standardized object across all template types
  const data = props.agent?.account || {};

  // Filter out unwanted keys based on agentApplicationProps values
  const keysToRemove = map(agentApplicationProps.value, 'accountAttribute');

  const filteredData = Object.keys(data).reduce((acc, key) => {
    if (!keysToRemove.includes(key)) {
      acc[key] = data[key];
    }
    return acc;
  }, {});

  return filteredData;
});

/**
 * Return a list of the values found at a given property name
 * @param propName Key of property
 */
function getAgentPropList(propName) {
  const propKey = agentApplicationProps.value[propName]?.accountAttribute;
  const val = props.agent?.account?.[propKey];
  if (!val) { return []; }
  return isArray(val) ? val : [val];
}

async function getActorsInfo() {
  let actorsList = [];
  try {
    if (glossaryValues.value?.actors && glossaryValues.value?.actors.length > 0) {
      const userFilter = glossaryValues.value.actors.map((actor) => `_id eq '${actor.split('/').pop()}'`).join(' or ');
      const params = {
        _queryFilter: userFilter,
        fields: 'userName,sn,givenName,profileImage,_id',
        sortKeys: 'userName',
      };
      const { data } = await getManagedResourceList('alpha_user', params);
      actorsList = data.result.map((user) => {
        const fullName = i18n.global.t('common.userFullName', {
          givenName: user.givenName,
          sn: user.sn,
        }).trim();
        if (fullName) user.fullName = fullName;
        return user;
      });
    }
  } catch (e) {
    actorsList = glossaryValues.value?.actors?.map((actor) => ({
      userName: actor,
      _id: actor,
    })) || [];
  }
  return actorsList;
}

async function getGlossaryValues() {
  try {
    const { data } = await getAccountGlossaryAttributesData(props.agent?.keys?.accountId);
    return data;
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: i18n.global.t('common.agent') }));
    }
    return props.agent?.glossary?.idx?.['/account'] || {};
  }
}

/**
 * Get glossary information for the agent
 */
async function getGlossary() {
  try {
    isLoading.value.all = true;
    const [glossaryValuesResult, glossarySchemaResult] = await Promise.all([
      getGlossaryValues(),
      getGlossarySchema(),
    ]);
    glossaryValues.value = glossaryValuesResult;
    glossarySchema.value = glossarySchemaResult.data['/iga/governance/account'];
    actors.value = await getActorsInfo();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: i18n.global.t('common.agent') }));
  } finally {
    isLoading.value.all = false;
  }
}

async function queryResourceInformation(resources = []) {
  try {
    const promises = resources.map((key) => {
      isLoading.value[key] = true;
      // Since we are using an array of ids on the source object to make the queryFilter, we are paginating here in the event of a large lists of ids
      const { pageNumber, pageSize } = resourceData.value[key];
      const agentApplicationProp = agentApplicationProps.value[key];
      const allIds = getAgentPropList(key);
      const startIndex = pageNumber * pageSize;
      const endIndex = startIndex + pageSize;
      const ids = allIds.slice(startIndex, endIndex);
      if (ids.length === 0) return null;
      return getAgentResourcesByIds({}, props.agent.application, agentApplicationProp.objectType, ids);
    });
    const results = await Promise.all(promises);
    results.forEach((response, index) => {
      const key = resources[index];
      if (response) {
        resourceData.value[key].result = response.data.result;
      }
    });
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.errors.errorLoadingResources'));
  } finally {
    resources.forEach((key) => {
      isLoading.value[key] = false;
    });
  }
}

/**
 * Updates the pagination parameters for a given resource, then queries for the display data
 * @param params Object containing pagination parameters for a given resource
 */
function handleEntityPaginationChange(params) {
  resourceData.value[params.resource].pageNumber = params.pageNumber;
  resourceData.value[params.resource].pageSize = params.pageSize;
  queryResourceInformation([params.resource]);
}

/**
 * Updates glossary values from form
 * @param value New glossary values
 */
function updateGlossaryValues(value) {
  glossaryValues.value = value;
}

function editAgentDetails() {
  bvModal.value.show('UpdateAgentModal');
}

function closeModal() {
  bvModal.value.hide('UpdateAgentModal');
}

/**
 * Save agent details to glossary
 */
async function save() {
  isSaving.value = true;
  try {
    const payload = cloneDeep(glossaryValues.value);
    if (payload.accountType !== agentConstants.ACCOUNT_TYPES.MACHINE) {
      // Currently subtype should only be persisted for machine accounts
      delete payload.accountSubtype;
    }
    await saveAccountGlossaryAttributesData(props.agent?.keys?.accountId, payload);
    displayNotification('success', i18n.global.t('governance.agents.details.detailsTab.agentSaved'));
    await getGlossary();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.agents.details.detailsTab.agentSaveErrorMessage'));
  } finally {
    closeModal();
    isSaving.value = false;
  }
}

onMounted(() => {
  getGlossary();
});

watch(() => agentApplicationProps.value, async () => {
  if (props.isEndUser) return;
  const resources = Object.keys(agentApplicationProps.value);
  resources.forEach((key) => {
    resourceData.value[key] = { pageNumber: 0, pageSize: 10, result: [] };
  });
  await queryResourceInformation(resources);
}, { immediate: true });
</script>
<style lang="scss" scoped>

.section-header {
  cursor: pointer;
}
</style>

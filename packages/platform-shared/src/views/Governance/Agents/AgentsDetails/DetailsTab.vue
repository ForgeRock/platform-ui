<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSpinner
    v-if="loading"
    class="py-5" />
  <template v-else>
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
            :key="actor._id"
            sm="3">
            <FrUserDetails :user-object="actor" />
          </BCol>
        </BRow>
      </BCollapse>
    </BCard>
    <BCard
      class="mb-3">
      <div
        class="d-flex justify-content-between section-header"
        @click="isVisible.guardrails = !isVisible.guardrails">
        <h1 class="h5">
          {{ i18n.global.t('governance.agents.guardrails') }}
        </h1>
        <FrIcon
          :name="isVisible.guardrails ? 'keyboard_arrow_down' : 'chevron_right'"
          class="ml-2" />
      </div>
      <BCollapse :visible="isVisible.guardrails">
        <FrEntityList
          :entities="getAgentPropList('guardrails')"
          :type="i18n.global.t('governance.agents.guardrails')"
          :icon="agentConstants.AGENT_ICONS.guardrails" />
      </BCollapse>
    </BCard>
    <BCard
      class="mb-3">
      <div
        class="d-flex justify-content-between section-header"
        @click="isVisible.tools = !isVisible.tools">
        <h1 class="h5">
          {{ i18n.global.t('governance.agents.tools') }}
        </h1>
        <FrIcon
          :name="isVisible.tools ? 'keyboard_arrow_down' : 'chevron_right'"
          class="ml-2" />
      </div>
      <BCollapse :visible="isVisible.tools">
        <FrEntityList
          :entities="getAgentPropList('tools')"
          :type="i18n.global.t('governance.agents.tools')"
          :icon="agentConstants.AGENT_ICONS.tools" />
      </BCollapse>
    </BCard>
    <BCard
      class="mb-3">
      <div
        class="d-flex justify-content-between section-header"
        @click="isVisible.knowledge = !isVisible.knowledge">
        <h1 class="h5">
          {{ i18n.global.t('governance.agents.knowledge') }}
        </h1>
        <FrIcon
          :name="isVisible.knowledge ? 'keyboard_arrow_down' : 'chevron_right'"
          class="ml-2" />
      </div>
      <BCollapse :visible="isVisible.knowledge">
        <FrEntityList
          :entities="getAgentPropList('knowledge')"
          :type="i18n.global.t('governance.agents.knowledge')"
          :icon="agentConstants.AGENT_ICONS.knowledge" />
      </BCollapse>
    </BCard>
    <BCard
      class="mb-3">
      <div
        class="d-flex justify-content-between section-header"
        @click="isVisible.identity = !isVisible.identity">
        <h1 class="h5">
          {{ i18n.global.t('governance.agents.identity') }}
        </h1>
        <FrIcon
          :name="isVisible.identity ? 'keyboard_arrow_down' : 'chevron_right'"
          class="ml-2" />
      </div>
      <BCollapse :visible="isVisible.identity">
        <FrEntityList
          :entities="getAgentPropList('identity')"
          :type="i18n.global.t('governance.agents.identity')"
          :icon="agentConstants.AGENT_ICONS.identity" />
      </BCollapse>
    </BCard>
  </template>
</template>

<script setup>
import {
  onMounted, ref, computed,
} from 'vue';
import { isArray } from 'lodash';
import {
  BCard, BCollapse, BRow, BCol,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrUserDetails from '@forgerock/platform-shared/src/components/governance/UserDetails';
import { getAccountGlossaryAttributesData } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrAccountObjectProperties from '@forgerock/platform-shared/src/views/Governance/ObjectProperties/ObjectProperties';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrEntityList from './AgentEntityList';

import i18n from '@/i18n';
import agentConstants from '../utils/agentConstants';

const props = defineProps({
  agent: {
    type: Object,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: true,
  },
});

const glossarySchema = ref([]);
const glossaryValues = ref({});
const actors = ref([]);
const loading = ref(true);
const isVisible = ref({
  custodians: true,
  guardrails: true,
  identity: true,
  knowledge: true,
  tools: true,
  properties: true,
});
const templateName = computed(() => props.agent.application?.templateName?.replace(/-override$/, ''));
const agentApplicationProps = computed(() => agentConstants.AGENT_APPLICATION_PROPS[templateName.value] || agentConstants.AGENT_APPLICATION_PROPS.default);
const agentData = computed(() => {
  // Converts agents to a standardized object across all template types
  const data = props.agent?.account || {};

  // Filter out unwanted keys based on agentApplicationProps values
  const keysToRemove = Object.values(agentApplicationProps.value);

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
  const propKey = agentApplicationProps.value[propName];
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
    const [glossaryValuesResult, glossarySchemaResult] = await Promise.all([
      getGlossaryValues(),
      getGlossarySchema(),
    ]);
    glossaryValues.value = glossaryValuesResult;
    glossarySchema.value = glossarySchemaResult.data['/iga/governance/account'];
    actors.value = await getActorsInfo();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: i18n.global.t('common.agent') }));
  }
  loading.value = false;
}

onMounted(() => {
  getGlossary();
});
</script>
<style lang="scss" scoped>

.section-header {
  cursor: pointer;
}
</style>

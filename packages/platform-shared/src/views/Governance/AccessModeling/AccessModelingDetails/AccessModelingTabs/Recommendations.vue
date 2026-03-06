<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    no-body
    class="m-0">
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <div
      v-else>
      <BTabs
        class="card-tabs-vertical"
        nav-class="fr-tabs"
        v-model="tabIndex"
        content-class="mt-3"
        pills
        vertical
        @activate-tab="tabActivated">
        <BTab
          :title="i18n.global.t('governance.accessModeling.patterns.title')"
          key="access-patterns"
          class="pb-2"
          :active="tabIndex === 0"
          lazy>
          <BRow>
            <div class="w-100 d-flex justify-content-between align-items-center">
              <h3 class="h5 mt-2 ml-4 pl-4 py-2">
                {{ $t('governance.accessModeling.patterns.title') }}
              </h3>
              <div>
                <BButton
                  v-if="showPatternButton"
                  variant="outline-primary"
                  class="mr-4"
                  @click="updateRecommendations('justifications')">
                  {{ $t('governance.accessModeling.recommendations.updatePatterns') }}
                </BButton>
              </div>
            </div>
          </BRow>
          <div
            class="ml-4"
            v-if="patternRecommendations.length === 0">
            {{ $t('governance.accessModeling.roleDetails.tabs.noRecommendations') }}
          </div>
          <BTable
            v-else
            class="m-0"
            table-class="table-width"
            :items="patternRecommendations"
            hover
            :fields="patternFields">
            <template #cell(pattern)="{ item }">
              <div class="d-inline-flex align-items-center">
                <FrField
                  name="columnSelected"
                  type="checkbox"
                  v-model="patternRecommendationsSelected[item.id]" />
                <FrIcon
                  class="ml-2 mr-2"
                  :icon-class="`ml-1 text-${item.icon === 'add' ? 'success' : 'danger'}`"
                  :outlined="true"
                  :name="`${item.icon}_circle_outline`" />
                <BBadge
                  v-for="(p, i) in item.pattern"
                  :key="i"
                  variant="light"
                  class="p-2 font-weight-normal">
                  <span class="text-uppercase">{{ p.displayName || p.key }}: </span>
                  <span>{{ p.value }}</span>
                </BBadge>
              </div>
            </template>
          </BTable>
        </BTab>
        <BTab
          class="pb-2"
          :title="$t('common.entitlements')"
          key="entitlements"
          :active="tabIndex === 1"
          lazy>
          <BRow>
            <div class="w-100 d-flex justify-content-between align-items-center">
              <h3 class="h5 mt-2 ml-4 pl-4 py-2">
                {{ $t('common.entitlements') }}
              </h3>
              <div>
                <BButton
                  v-if="showEntitlementButton"
                  variant="outline-primary"
                  class="mr-4"
                  @click="updateRecommendations('entitlements')">
                  {{ $t('governance.accessModeling.recommendations.updateEntitlements') }}
                </BButton>
              </div>
            </div>
          </BRow>
          <div
            class="ml-4"
            v-if="entitlementRecommendations.length === 0">
            {{ $t('governance.accessModeling.roleDetails.tabs.noRecommendations') }}
          </div>
          <BTable
            v-else
            class="m-0"
            :table-class="table-width"
            :items="entitlementRecommendations"
            hover
            no-select-on-click
            :fields="entitlementFields">
            <template #cell(entitlement)="{ item }">
              <div class="d-inline-flex align-items-center">
                <FrField
                  name="columnSelected"
                  type="checkbox"
                  v-model="entitlementRecommendationsSelected[item.id]" />
                <FrIcon
                  class="ml-2 mr-2"
                  :icon-class="`ml-1 text-${item.icon === 'add' ? 'success' : 'danger'}`"
                  :outlined="true"
                  :name="`${item.icon}_circle_outline`" />
                {{ item.entitlement }}
              </div>
            </template>
          </BTable>
        </BTab>
      </BTabs>
    </div>
  </BCard>
</template>

<script setup>
import {
  BBadge,
  BButton,
  BCard,
  BRow,
  BTab,
  BTabs,
  BTable,
} from 'bootstrap-vue';
import { ref, computed, watch } from 'vue';
import { map } from 'lodash';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { convertRulesToDisplay } from '@forgerock/platform-shared/src/utils/governance/prediction';
import i18n from '@/i18n';

const emit = defineEmits(['save-recommendations']);
const props = defineProps({
  entitlements: {
    type: Array,
    default: () => ([]),
  },
  role: {
    type: Object,
    default: () => ({}),
  },
  candidateRole: {
    type: Object,
    default: () => ({}),
  },
  roleId: {
    type: String,
    default: '',
  },
  userSchema: {
    type: Object,
    default: () => ({}),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const tabIndex = ref(0);
const tabs = ['access-patterns', 'entitlements'];
const patternRecommendations = ref([]);
const entitlementRecommendations = ref([]);
const patternRecommendationsSelected = ref({});
const entitlementRecommendationsSelected = ref({});
const showPatternButton = computed(() => patternRecommendations.value.length > 0 && Object.values(patternRecommendationsSelected.value).some((selected) => selected));
const showEntitlementButton = computed(() => entitlementRecommendations.value.length > 0 && Object.values(entitlementRecommendationsSelected.value).some((selected) => selected));
const patternFields = [
  {
    key: 'pattern',
    label: '',
  },
];

const entitlementFields = [
  {
    key: 'entitlement',
    label: '',
  },
];

/**
 * Sets the active tab
 * @param {number} index - currently selected tab index
 */
function tabActivated(index) {
  tabIndex.value = index;
  const recommendationsTab = tabs[index];
  if (recommendationsTab === 'access-patterns') {
    entitlementRecommendationsSelected.value = {};
  } else if (recommendationsTab === 'entitlements') {
    patternRecommendationsSelected.value = {};
  }
}

/**
 * Find the display name for the given entitlement
 * @param {string} id - The entitlement ID to find
 */
function findEntitlementDisplayName(id) {
  const entitlement = props.entitlements.find((ent) => ent.id === id);
  return entitlement ? entitlement.descriptor.idx['/entitlement'].displayName : id;
}

/**
 * Emits the selected recommendations to be saved
 * @param {string} type - The type of recommendation being saved (patterns or entitlements)
 */
function updateRecommendations(type) {
  const objs = type === 'justifications' ? patternRecommendations.value : entitlementRecommendations.value;
  const selectedObj = type === 'justifications' ? patternRecommendationsSelected.value : entitlementRecommendationsSelected.value;
  const data = map(objs, (obj) => {
    if (selectedObj[obj.id]) {
      return {
        id: obj.id,
        operation: obj.operation,
      };
    }
    return null;
  }).filter((item) => item !== null);

  emit('save-recommendations', type, '', data);
  entitlementRecommendationsSelected.value = {};
  patternRecommendationsSelected.value = {};
}

/**
 * Gets the formatted list of access patterns
 */
async function getPatternList() {
  const roleValues = new Set(props.role.role?.justifications ?? []);
  const candidateRoleValues = new Set(props.candidateRole.role?.justifications ?? []);
  const onlyInRole = [...roleValues].filter((v) => !candidateRoleValues.has(v));
  const onlyInCandidate = [...candidateRoleValues].filter((v) => !roleValues.has(v));
  const recommendedAddPatterns = convertRulesToDisplay(onlyInCandidate || [], props.userSchema, true);
  const recommendedRemovePatterns = convertRulesToDisplay(onlyInRole || [], props.userSchema, true);
  const newPatternRecommendations = [];
  map(recommendedAddPatterns, (pattern, index) => {
    newPatternRecommendations.push({
      pattern,
      icon: 'add',
      operation: 'add',
      id: onlyInCandidate[index],
    });
  });
  map(recommendedRemovePatterns, (pattern, index) => {
    newPatternRecommendations.push({
      pattern,
      icon: 'remove',
      operation: 'remove',
      id: onlyInRole[index],
    });
  });
  patternRecommendations.value = newPatternRecommendations;

  const recommendedAddEntitlements = props.candidateRole.role?.entitlements?.filter((entitlement) => !props.role.role?.entitlements?.includes(entitlement)) || [];
  const recommendedRemoveEntitlements = props.role.role?.entitlements?.filter((entitlement) => !props.candidateRole.role?.entitlements?.includes(entitlement)) || [];
  const newEntitlementRecommendations = [];
  map(recommendedAddEntitlements, (entitlement) => {
    const displayName = findEntitlementDisplayName(entitlement);
    newEntitlementRecommendations.push({
      entitlement: displayName,
      id: entitlement,
      icon: 'add',
      operation: 'add',
    });
  });
  map(recommendedRemoveEntitlements, (entitlement) => {
    const displayName = findEntitlementDisplayName(entitlement);
    newEntitlementRecommendations.push({
      entitlement: displayName,
      id: entitlement,
      icon: 'remove',
      operation: 'remove',
    });
  });
  entitlementRecommendations.value = newEntitlementRecommendations;
}

getPatternList();

watch(() => props.role, () => {
  getPatternList();
}, { deep: true });
</script>

<style lang="scss" scoped>
.access-card {
  height: 325px;
}

.badge-col {
  text-align: center;
}

.icon-column {
  width: 40px;
  text-align: center;
}

.table-width {
  th {
    padding: 0;
    width: 25px !important;
  }
  td {
    width: 25px important;
  }
}

.users-badge {
  background-color: $blue !important;
}
</style>

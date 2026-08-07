<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCardBody data-testid="obj-agent-classification">
    <FrSpinner
      v-if="isLoading"
      class="py-5" />

    <!-- List view -->
    <template v-else-if="view === 'list'">
      <div class="d-flex mb-4">
        <BButton
          variant="primary"
          @click="openCreateForm">
          <FrIcon
            icon-class="mr-2"
            name="add" />
          {{ $t('governance.applications.edit.objectTypesTab.agentClassification.createNew') }}
        </BButton>
      </div>
      <BTable
        v-if="taskList.length"
        class="mb-0"
        hover
        responsive
        tbody-tr-class="cursor-pointer"
        :fields="tableFields"
        :items="taskList"
        @row-clicked="openEditForm">
        <template #cell(date)="{ item }">
          {{ item.date ? formatDate(item.date) : '—' }}
        </template>
        <template #cell(status)="{ item }">
          <BBadge
            class="text-capitalize font-weight-normal"
            :variant="statusVariant(item.status)">
            {{ item.status }}
          </BBadge>
        </template>
      </BTable>
      <FrNoData
        v-else
        icon="assignment"
        :title="$t('governance.applications.edit.objectTypesTab.agentClassification.noTasks')"
        :subtitle="$t('governance.applications.edit.objectTypesTab.agentClassification.noTasksSubtitle')" />
    </template>

    <!-- Form view -->
    <template v-else>
      <div class="d-flex align-items-center mb-4">
        <BButton
          class="p-0 mr-3"
          variant="link"
          :aria-label="$t('common.back')"
          @click="view = 'list'">
          <FrIcon
            icon-class="text-dark md-24"
            name="arrow_back" />
        </BButton>
        <h2 class="h5 mb-0">
          {{ task ? $t('governance.applications.edit.objectTypesTab.agentClassification.editTitle') : $t('governance.applications.edit.objectTypesTab.agentClassification.createTitle') }}
        </h2>
      </div>
      <p class="text-muted">
        {{ $t('governance.applications.edit.objectTypesTab.agentClassification.description') }}
      </p>
      <BFormRow class="mt-3 mb-4">
        <BCol md="6">
          <FrField
            v-model="ruleName"
            name="ruleName"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.ruleName')" />
        </BCol>
      </BFormRow>
      <h3 class="h6 mt-4">
        {{ $t('governance.applications.edit.objectTypesTab.agentClassification.targetFilter.title') }}
      </h3>
      <p class="text-muted small">
        {{ $t('governance.applications.edit.objectTypesTab.agentClassification.targetFilter.description') }}
      </p>
      <FrCertificationFilter
        :key="filterKey"
        resource-name="account"
        :condition-options="agentConditionOptions"
        :filter="filterState"
        :properties="filterProperties"
        @filter-update="onFilterUpdate" />

      <hr>

      <h3 class="h6 mt-4">
        {{ $t('governance.applications.edit.objectTypesTab.agentClassification.action.title') }}
      </h3>
      <p class="text-muted small">
        {{ $t('governance.applications.edit.objectTypesTab.agentClassification.action.description') }}
      </p>
      <BFormRow
        v-for="(mapping, index) in mappings"
        :key="mapping.id"
        class="align-items-end mb-2 flex-nowrap">
        <BCol>
          <FrField
            v-model="mapping.targetAttribute"
            type="select"
            :name="`actionTargetAttribute_${index}`"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.action.targetAttribute')"
            :options="attributeOptions" />
        </BCol>
        <BCol>
          <FrField
            v-model="mapping.sourceType"
            type="select"
            :name="`actionSourceType_${index}`"
            :searchable="false"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.action.source')"
            :options="sourceTypeOptions" />
        </BCol>
        <BCol>
          <FrGovObjectSelect
            v-if="mapping.sourceType === 'static' && staticValueFieldProps(mapping.targetAttribute).type === 'managedObject'"
            :property="{
              label: $t('governance.applications.edit.objectTypesTab.agentClassification.action.value'),
              model: `actionValue_${index}`,
              value: mapping.value,
              options: staticValueFieldProps(mapping.targetAttribute).options,
            }"
            @update:model="mapping.value = $event.value" />
          <FrField
            v-else-if="mapping.sourceType === 'static'"
            v-model="mapping.value"
            :name="`actionValue_${index}`"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.action.value')"
            :type="staticValueFieldProps(mapping.targetAttribute).type"
            :options="staticValueFieldProps(mapping.targetAttribute).options" />
          <FrField
            v-else
            v-model="mapping.value"
            type="select"
            :name="`actionValue_${index}`"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.action.value')"
            :options="objectAttributeOptions" />
        </BCol>
        <BCol
          class="d-flex align-items-center flex-shrink-0 pb-1"
          cols="auto">
          <BButton
            v-if="index > 0"
            class="hover-gray mr-1 p-0"
            variant="link"
            :aria-label="$t('common.remove')"
            @click="removeMapping(index)">
            <FrIcon
              icon-class="text-dark md-24"
              name="remove" />
          </BButton>
          <BButton
            class="hover-gray p-0"
            variant="link"
            :aria-label="$t('common.add')"
            @click="addMapping">
            <FrIcon
              icon-class="text-dark md-24"
              name="add" />
          </BButton>
        </BCol>
      </BFormRow>

      <hr>

      <BFormRow class="mb-3">
        <BCol md="6">
          <FrField
            v-model="form.conditionalUpdates"
            type="checkbox"
            name="conditionalUpdates"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.conditionalUpdates')" />
        </BCol>
      </BFormRow>

      <template v-if="form.conditionalUpdates">
        <FrCertificationFilter
          :key="conditionFilterKey"
          resource-name="account"
          :condition-options="agentConditionOptions"
          :filter="conditionFilterState"
          :properties="conditionFilterProperties"
          @filter-update="onConditionFilterUpdate" />
        <hr>
      </template>

      <BFormRow class="mb-3">
        <BCol md="6">
          <FrField
            v-model="form.overwrite"
            type="checkbox"
            name="overwrite"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.overwrite')"
            :description="$t('governance.applications.edit.objectTypesTab.agentClassification.overwriteDescription')" />
        </BCol>
      </BFormRow>

      <BFormRow class="mb-3">
        <BCol md="6">
          <FrField
            v-model="form.recurring"
            type="checkbox"
            name="recurring"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.recurring')"
            :description="$t('governance.applications.edit.objectTypesTab.agentClassification.recurringDescription')" />
        </BCol>
        <BCol
          v-if="form.recurring"
          md="6">
          <FrField
            v-model="form.intervalMs"
            type="select"
            name="intervalMs"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.interval')"
            :options="intervalOptions" />
          <FrField
            v-if="isCustomInterval"
            v-model="customIntervalMs"
            class="mt-3"
            type="integer"
            name="customIntervalMs"
            :label="$t('governance.applications.edit.objectTypesTab.agentClassification.customInterval')"
            :description="$t('governance.applications.edit.objectTypesTab.agentClassification.customIntervalDescription')" />
        </BCol>
      </BFormRow>

      <BFormRow class="mt-2">
        <BCol class="d-flex justify-content-end">
          <BButton
            v-if="task"
            class="mr-2"
            variant="outline-primary"
            :disabled="task.status === 'in-progress' || isTriggeringRun"
            @click="runNow">
            <FrIcon
              icon-class="mr-2"
              name="play_arrow" />
            {{ $t('governance.applications.edit.objectTypesTab.agentClassification.runNow') }}
          </BButton>
          <FrButtonWithSpinner
            variant="primary"
            :button-text="$t('common.save')"
            :disabled="!isFormValid || isSaving"
            :show-spinner="isSaving"
            :spinner-text="$t('common.saving')"
            @click="save" />
        </BCol>
      </BFormRow>
    </template>
  </BCardBody>
</template>

<script setup>
import {
  computed,
  ref,
} from 'vue';
import {
  BBadge,
  BButton,
  BCardBody,
  BCol,
  BFormRow,
  BTable,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import {
  getApplicationTask,
  getApplicationTasks,
  saveApplicationTask,
  triggerApplicationTask,
} from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import {
  convertTargetFilterToQueryFilter,
  getGovernanceFilter,
} from '@forgerock/platform-shared/src/utils/governance/filters';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrCertificationFilter from '@forgerock/platform-shared/src/components/filterBuilder/CertificationFilter';
import { defaultConditionOptions } from '@forgerock/platform-shared/src/components/filterBuilder/CertificationFilter/CertFilterDefaults';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrGovObjectSelect from '@forgerock/platform-shared/src/components/FormEditor/components/governance/GovObjectSelect';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { v4 as uuid } from 'uuid';
import i18n from '@/i18n';

const PRESET_INTERVALS = [3600000, 86400000, 604800000];

const DEFAULT_FILTER_STATE = {
  operator: 'AND',
  operand: [
    { operator: 'NOT EQUALS', operand: { targetName: 'accountType', targetValue: 'agent' } },
  ],
};

const emptyMapping = () => ({
  id: uuid(),
  targetAttribute: '',
  sourceType: 'static',
  value: '',
});

const STATUS_VARIANTS = {
  success: 'success',
  'in-progress': 'info',
  failed: 'danger',
  pending: 'warning',
};

const props = defineProps({
  applicationId: {
    type: String,
    default: '',
  },
  objectType: {
    type: Object,
    default: null,
  },
});

// reactive state
const view = ref('list');
const isLoading = ref(false);
const isSaving = ref(false);
const taskList = ref([]);
const attributeOptions = ref([]);
const targetObjectType = ref('account');
const task = ref(null);
const isTriggeringRun = ref(false);
const filterKey = ref(0);
const ruleName = ref('');
const filterState = ref({ ...DEFAULT_FILTER_STATE });
const filterString = ref('');
const internalFilter = ref(null);
const customIntervalMs = ref('');
const mappings = ref([emptyMapping()]);
const conditionFilterKey = ref(0);
const conditionFilterState = ref({});
const conditionInternalFilter = ref(null);
const form = ref({
  conditionalUpdates: false,
  overwrite: true,
  recurring: false,
  intervalMs: 86400000,
});

// computed
const agentConditionOptions = computed(() => ({
  ...defaultConditionOptions,
  IsNot: { label: i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.isNot'), value: 'NOT EQUALS', type: ['string'] },
}));

const tableFields = computed(() => [
  { key: 'name', label: i18n.global.t('common.name'), sortable: true },
  { key: 'date', label: i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.runDate'), sortable: true },
  { key: 'status', label: i18n.global.t('common.status'), sortable: true },
]);

const filterProperties = computed(() => attributeOptions.value.map((opt) => ({
  value: opt.value,
  label: opt.text,
  type: 'string',
})));

const sourceTypeOptions = computed(() => [
  { text: i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.action.sourceTypes.static'), value: 'static' },
  { text: i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.action.sourceTypes.sourcePath'), value: 'sourcePath' },
]);

const conditionFilterProperties = computed(() => {
  if (!props.objectType?.properties) return [];
  return Object.entries(props.objectType.properties).map(([key, prop]) => ({
    value: key,
    label: prop.displayName || key,
    type: 'string',
  }));
});

const objectAttributeOptions = computed(() => {
  if (!props.objectType?.properties) return [];
  return Object.entries(props.objectType.properties).map(([key, prop]) => ({
    text: prop.displayName || key,
    value: key,
  }));
});

const intervalOptions = computed(() => [
  { text: i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.intervals.hourly'), value: 3600000 },
  { text: i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.intervals.daily'), value: 86400000 },
  { text: i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.intervals.weekly'), value: 604800000 },
  { text: i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.intervals.custom'), value: 'custom' },
]);

const isCustomInterval = computed(() => form.value.intervalMs === 'custom');

const resolvedIntervalMs = computed(() => {
  if (isCustomInterval.value) return Number(customIntervalMs.value) || undefined;
  return form.value.intervalMs;
});

// Returns the FrField type and options for the static-value input of a mapping row,
// driven by the glossary schema type of the selected targetAttribute.
const staticValueFieldProps = computed(() => {
  const attrMap = Object.fromEntries(attributeOptions.value.map((a) => [a.value, a]));
  return (attrName) => {
    const attr = attrMap[attrName];
    if (!attr) return { type: 'string', options: [] };
    if (attr.enumeratedValues.length) {
      const options = attr.enumeratedValues.map((v) => ({ text: v, value: v }));
      return { type: 'select', options };
    }
    if (attr.attrType === 'boolean') {
      return {
        type: 'select',
        options: [
          { text: 'true', value: 'true' },
          { text: 'false', value: 'false' },
        ],
      };
    }
    if (attr.attrType === 'int' || attr.attrType === 'integer') {
      return { type: 'integer', options: [] };
    }
    if (attr.attrType === 'date') {
      return { type: 'date', options: [] };
    }
    if (attr.attrType === 'managedObject' && attr.managedObjectType) {
      return { type: 'managedObject', options: { object: attr.managedObjectType.split('/').pop() } };
    }
    return { type: 'string', options: [] };
  };
});

function filterIsValid(filter) {
  if (!filter) return false;
  const check = (node) => {
    if (node.subfilters) return node.subfilters.length > 0 && node.subfilters.every(check);
    return node.field !== '' && node.field !== null && node.field !== undefined
      && (node.operator === 'EXISTS' || (node.value !== '' && node.value !== null && node.value !== undefined));
  };
  return check(filter);
}

const isFormValid = computed(() => {
  if (!ruleName.value.trim()) return false;
  if (!filterIsValid(internalFilter.value)) return false;
  if (mappings.value.some((m) => !m.targetAttribute || !m.value)) return false;
  if (form.value.conditionalUpdates && !filterIsValid(conditionInternalFilter.value)) return false;
  if (form.value.recurring && isCustomInterval.value) {
    const ms = Number(customIntervalMs.value);
    return Number.isInteger(ms) && ms >= 3600000;
  }
  return true;
});

// methods
function statusVariant(status) {
  return STATUS_VARIANTS[status] || 'secondary';
}

function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

function resetForm() {
  task.value = null;
  ruleName.value = '';
  filterState.value = { ...DEFAULT_FILTER_STATE };
  filterString.value = '';
  internalFilter.value = null;
  filterKey.value += 1;
  conditionFilterState.value = {};
  conditionInternalFilter.value = null;
  conditionFilterKey.value += 1;
  customIntervalMs.value = '';
  mappings.value = [emptyMapping()];
  form.value = {
    conditionalUpdates: false,
    overwrite: true,
    recurring: false,
    intervalMs: 86400000,
  };
}

function openCreateForm() {
  resetForm();
  view.value = 'form';
}

function scimToTargetFilter(scim) {
  if (!scim || scim === 'true') return null;
  const SCIM_OP_MAP = {
    eq: 'EQUALS', ne: 'NOT EQUALS', co: 'CONTAINS', sw: 'STARTS_WITH', pr: 'EXISTS',
  };
  // Accept both single-quoted SCIM values and double-quoted legacy values
  const parseAtom = (str) => {
    const notMatch = str.match(/^!\((.+)\)$/);
    if (notMatch) {
      const inner = parseAtom(notMatch[1]);
      if (!inner) return null;
      return { operator: 'NOT', operand: [inner] };
    }
    // pr (presence) — no value follows the operator
    const prMatch = str.match(/^(\S+)\s+pr$/);
    if (prMatch) {
      return { operator: 'EXISTS', operand: { targetName: prMatch[1], targetValue: '' } };
    }
    const leafMatch = str.match(/^(\S+)\s+(eq|ne|co|sw)\s+(?:'(.*)'|"(.*)")$/);
    if (leafMatch) {
      const op = SCIM_OP_MAP[leafMatch[2]];
      const value = leafMatch[3] !== undefined ? leafMatch[3] : leafMatch[4];
      return op ? { operator: op, operand: { targetName: leafMatch[1], targetValue: value } } : null;
    }
    return null;
  };
  const parseGroup = (str) => {
    const trimmed = str.trim();
    // SCIM format: each clause wrapped in parens, joined by and/or
    const andParts = trimmed.split(/(?<=\))\s+and\s+(?=\()/);
    if (andParts.length > 1) {
      const operand = andParts.map((p) => parseAtom(p.trim().replace(/^\(/, '').replace(/\)$/, ''))).filter(Boolean);
      return operand.length ? { operator: 'AND', operand } : null;
    }
    const orParts = trimmed.split(/(?<=\))\s+or\s+(?=\()/);
    if (orParts.length > 1) {
      const operand = orParts.map((p) => parseAtom(p.trim().replace(/^\(/, '').replace(/\)$/, ''))).filter(Boolean);
      return operand.length ? { operator: 'OR', operand } : null;
    }
    // Single SCIM atom (may have outer parens)
    const atom = parseAtom(trimmed.replace(/^\(/, '').replace(/\)$/, ''));
    if (atom) return { operator: 'AND', operand: [atom] };
    // Legacy format: no parens, joined by and/or
    const legacyAndParts = trimmed.split(/ and (?=(?:attributes\.)?\w)/);
    if (legacyAndParts.length > 1) {
      const operand = legacyAndParts.map((p) => parseAtom(p.trim())).filter(Boolean);
      return operand.length ? { operator: 'AND', operand } : null;
    }
    const legacyOrParts = trimmed.split(/ or (?=(?:attributes\.)?\w)/);
    if (legacyOrParts.length > 1) {
      const operand = legacyOrParts.map((p) => parseAtom(p.trim())).filter(Boolean);
      return operand.length ? { operator: 'OR', operand } : null;
    }
    // Single legacy atom with no parens
    const legacyAtom = parseAtom(trimmed);
    return legacyAtom ? { operator: 'AND', operand: [legacyAtom] } : null;
  };
  return parseGroup(scim);
}

function populateFromTask(taskData) {
  const intervalMs = taskData.intervalMs || 86400000;
  const isPreset = PRESET_INTERVALS.includes(intervalMs);
  ruleName.value = taskData.name || '';
  const savedCondition = taskData.taskData?.action?.condition;
  form.value = {
    conditionalUpdates: !!savedCondition,
    overwrite: taskData.taskData?.action?.overwrite ?? true,
    recurring: taskData.recurring ?? false,
    intervalMs: isPreset ? intervalMs : 'custom',
  };
  customIntervalMs.value = isPreset ? '' : String(intervalMs);
  const savedFilter = taskData.taskData?.targets?.[0]?.filter;
  if (savedFilter) {
    const parsed = scimToTargetFilter(savedFilter);
    filterState.value = parsed || { ...DEFAULT_FILTER_STATE };
    filterString.value = savedFilter;
  } else {
    filterState.value = { ...DEFAULT_FILTER_STATE };
    filterString.value = '';
  }
  const savedMappings = taskData.taskData?.action?.mappings;
  if (savedMappings?.length) {
    mappings.value = savedMappings.map((m) => ({
      id: uuid(),
      targetAttribute: m.target || '',
      sourceType: m.source?.type || 'static',
      value: m.source?.value || '',
    }));
  }
  if (savedCondition) {
    const parsed = scimToTargetFilter(savedCondition);
    conditionFilterState.value = parsed || {};
  } else {
    conditionFilterState.value = {};
  }
  filterKey.value += 1;
  conditionFilterKey.value += 1;
}

async function openEditForm(selectedTask) {
  resetForm();
  isLoading.value = true;
  try {
    const { data } = await getApplicationTask(props.applicationId, selectedTask.name);
    task.value = data;
    populateFromTask(data);
    view.value = 'form';
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.errorLoadingTask'));
  } finally {
    isLoading.value = false;
  }
}

function onFilterUpdate(filter) {
  internalFilter.value = filter;
  const targetFilter = getGovernanceFilter(filter);
  const scim = convertTargetFilterToQueryFilter(targetFilter);
  filterString.value = scim === 'true' ? undefined : scim;
}

function onConditionFilterUpdate(filter) {
  conditionInternalFilter.value = filter;
}

function addMapping() {
  mappings.value.push(emptyMapping());
}

function removeMapping(index) {
  mappings.value.splice(index, 1);
}

function buildConditionString() {
  if (!form.value.conditionalUpdates || !conditionInternalFilter.value) return undefined;
  const targetFilter = getGovernanceFilter(conditionInternalFilter.value);
  const scim = convertTargetFilterToQueryFilter(targetFilter);
  return !scim || scim === 'true' ? undefined : scim;
}

async function runNow() {
  isTriggeringRun.value = true;
  try {
    await triggerApplicationTask(props.applicationId, task.value.name, true);
    displayNotification('success', i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.runSuccess'));
    const { data } = await getApplicationTask(props.applicationId, task.value.name);
    task.value = data;
    const idx = taskList.value.findIndex((t) => t.name === data.name);
    if (idx !== -1) taskList.value.splice(idx, 1, data);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.runError'));
  } finally {
    isTriggeringRun.value = false;
  }
}

async function save() {
  isSaving.value = true;
  try {
    const payload = {
      type: 'applicationBulkOperation',
      name: ruleName.value,
      options: { readBatchSize: 500 },
      recurring: form.value.recurring,
      intervalMs: form.value.recurring ? resolvedIntervalMs.value : undefined,
      taskData: {
        targets: [{ objectType: targetObjectType.value, filter: filterString.value || undefined }],
        action: {
          type: 'updateGlossary',
          overwrite: form.value.overwrite,
          ...(form.value.conditionalUpdates && { condition: buildConditionString() }),
          mappings: mappings.value.map((m) => ({
            target: m.targetAttribute,
            source: { type: m.sourceType, value: m.value },
          })),
        },
      },
    };
    // saveApplicationTask always POSTs with ?_action=create. The backend deduplicates
    // by name, so this acts as an upsert for both create and edit flows.
    const { data } = await saveApplicationTask(props.applicationId, payload);
    task.value = data;
    const idx = taskList.value.findIndex((t) => t.name === data.name);
    if (idx !== -1) {
      taskList.value.splice(idx, 1, data);
    } else {
      taskList.value.push(data);
    }
    displayNotification('success', i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.saveSuccess'));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.saveError'));
  } finally {
    isSaving.value = false;
  }
}

// initialise on setup
isLoading.value = true;
Promise.allSettled([
  getGlossarySchema('account'),
  props.applicationId ? getApplicationTasks(props.applicationId) : Promise.reject(new Error('no id')),
]).then(([attributesResult, tasksResult]) => {
  if (attributesResult.status === 'fulfilled') {
    attributeOptions.value = attributesResult.value.map((attr) => ({
      text: attr.displayName,
      value: attr.name,
      attrType: attr.type || 'string',
      isMultiValue: !!attr.isMultiValue,
      enumeratedValues: attr.enumeratedValues || [],
      managedObjectType: attr.managedObjectType || '',
    }));
  } else {
    showErrorMessage(attributesResult.reason, i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.errorLoadingAttributes'));
  }
  if (tasksResult.status === 'fulfilled') {
    taskList.value = (tasksResult.value.data?.result || []).filter((t) => t.taskData?.action?.type === 'updateGlossary');
  } else {
    showErrorMessage(tasksResult.reason, i18n.global.t('governance.applications.edit.objectTypesTab.agentClassification.errorLoadingTask'));
  }
}).finally(() => {
  isLoading.value = false;
});
</script>

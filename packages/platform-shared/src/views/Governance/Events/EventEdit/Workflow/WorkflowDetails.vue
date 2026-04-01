<!-- Copyright 2024-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    class="p-4 flex-grow-1 overflow-auto h-100"
    data-testid="workflow-details">
    <BContainer
      fluid
      class="mt-4">
      <h2 class="h4">
        {{ $t('governance.events.edit.workflowDetails') }}
      </h2>
      <p class="mb-4">
        {{ $t('governance.events.edit.workflowDescription') }}
      </p>
      <FrField
        v-model="formFields.workflow"
        class="mb-4"
        :description="$t('governance.events.edit.workflowHelp')"
        :label="$t('governance.events.newEventModal.workflow')"
        name="workflow"
        :options="workflowOptions"
        type="select"
        validation="required" />
      <div class="border-top pt-4">
        <h3 class="h5">
          {{ $t('common.optionalFieldTitle', { fieldTitle: $t('governance.events.edit.workflowVariables') }) }}
        </h3>
        <p class="">
          {{ $t('governance.events.edit.workflowVariablesDescription') }}
        </p>
        <FrListField
          v-model="formFields.workflowVariables"
          button-class="btn-link text-dark"
          class="mb-4"
          column-width="6"
          :items="variablesSchema"
          :show-borders="false"
          :show-title="false" />
      </div>
    </BContainer>
  </div>
</template>

<script setup>
import {
  BContainer,
} from 'bootstrap-vue';
import { isEqual } from 'lodash';
import {
  onMounted,
  ref,
  watch,
} from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrListField from '@forgerock/platform-shared/src/components/ListField';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getWorkflowList } from '@forgerock/platform-shared/src/api/governance/WorkflowApi';
import { WORKFLOW_STATUS } from '@forgerock/platform-shared/src/utils/workflowUtils';
import i18n from '@/i18n';

const emit = defineEmits(['input']);

// data
const workflowOptions = ref([]);
const variablesSchema = {
  type: 'object',
  properties: {
    variable: {
      title: i18n.global.t('common.variable'),
      type: 'string',
    },
    value: {
      title: i18n.global.t('common.value'),
      type: 'string',
    },
  },
  order: [
    'variable',
    'value',
  ],
};
const formFields = ref({
  workflow: '',
  workflowVariables: [{ variable: '', value: '' }],
});

// props
const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
});

onMounted(async () => {
  try {
    // get workflow list
    const { data } = await getWorkflowList();
    workflowOptions.value = data.result
      .map((workflow) => (workflow.status === WORKFLOW_STATUS.PUBLISHED ? { value: workflow.id, text: workflow.displayName } : null))
      .filter((workflow) => workflow !== null);

    // set initial value if there is none
    if (workflowOptions.value.length && !formFields.value.workflow.length) {
      formFields.value.workflow = workflowOptions.value[0].value;
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.workflows.messages.getError'));
  }
});

// watchers
watch(
  () => props.value,
  (val, oldVal) => {
    if (isEqual(val, oldVal)) return;
    const forms = {};
    Object.keys(val).forEach((field) => {
      forms[field] = val[field];
    });
    formFields.value = forms;
  },
  { immediate: true, deep: true },
);

watch(
  () => formFields.value,
  (val) => emit('input', val),
  { deep: true },
);

</script>

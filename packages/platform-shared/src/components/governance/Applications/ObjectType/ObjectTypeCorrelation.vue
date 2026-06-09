<!-- Copyright 2026 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div class="p-4">
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <template v-else-if="!task && !showForm">
      <FrNoData
        icon="link_off"
        :title="$t('governance.unmanagedApplications.correlationTab.emptyTitle')"
        :subtitle="$t('governance.unmanagedApplications.correlationTab.emptyDescription')">
        <BButton
          variant="primary"
          @click="showForm = true">
          {{ $t('governance.unmanagedApplications.correlationTab.configureButton') }}
        </BButton>
      </FrNoData>
    </template>
    <template v-else>
      <BCard no-body>
        <BCardBody>
          <h5>{{ $t('governance.unmanagedApplications.correlationTab.title') }}</h5>
          <p class="mb-3">
            {{ $t('settings.accountCorrelation.subTitle', {
              sourceObjectTypeName: objectType?.name ?? '',
              sourceApplication: $t('governance.unmanagedApplications.correlationTab.thisApplication'),
              targetObjectTypeName: $t('governance.unmanagedApplications.correlationTab.userNoun'),
              targetApplication: $t('common.pingIdentity'),
            }) }}
          </p>
          <div class="d-flex align-items-center mb-3">
            <div class="flex-grow-1">
              <FrField
                v-model="form.accountAttribute"
                type="select"
                name="accountAttribute"
                :label="$t('governance.unmanagedApplications.correlationTab.accountAttribute')"
                :description="$t('governance.unmanagedApplications.correlationTab.accountAttributeDescription', { objectTypeName: objectType.name })"
                :options="accountAttributeOptions"
                :placeholder="$t('common.select')" />
            </div>
            <div class="fr-correlation-arrow mx-2 flex-shrink-0 d-flex align-items-center">
              <FrIcon
                class="text-muted"
                name="swap_horiz" />
            </div>
            <div class="flex-grow-1">
              <FrField
                v-model="form.userAttribute"
                type="select"
                name="userAttribute"
                :label="$t('governance.unmanagedApplications.correlationTab.userAttribute')"
                :description="$t('governance.unmanagedApplications.correlationTab.userAttributeDescription')"
                :options="userAttributeOptions"
                :placeholder="$t('common.select')" />
            </div>
          </div>

          <hr>

          <BFormRow class="mb-3">
            <BCol md="6">
              <FrField
                v-model="form.overwrite"
                type="checkbox"
                name="overwrite"
                :label="$t('governance.unmanagedApplications.correlationTab.overwrite')"
                :description="$t('governance.unmanagedApplications.correlationTab.overwriteDescription')" />
            </BCol>
          </BFormRow>

          <BFormRow class="mb-3">
            <BCol md="6">
              <FrField
                v-model="form.recurring"
                type="checkbox"
                name="recurring"
                :label="$t('governance.unmanagedApplications.correlationTab.recurring')"
                :description="$t('governance.unmanagedApplications.correlationTab.recurringDescription')" />
            </BCol>
            <BCol
              v-if="form.recurring"
              md="6">
              <FrField
                v-model="form.intervalMs"
                type="select"
                name="intervalMs"
                :label="$t('governance.unmanagedApplications.correlationTab.interval')"
                :options="intervalOptions" />
              <FrField
                v-if="isCustomInterval"
                v-model="customIntervalMs"
                class="mt-3"
                type="number"
                name="customIntervalMs"
                :label="$t('governance.unmanagedApplications.correlationTab.customInterval')"
                :description="$t('governance.unmanagedApplications.correlationTab.customIntervalDescription')" />
            </BCol>
          </BFormRow>

          <template v-if="task">
            <div class="d-flex align-items-center">
              <BBadge
                :variant="statusVariant"
                class="mr-3">
                {{ $t(`governance.unmanagedApplications.correlationTab.status.${task.status}`) }}
              </BBadge>
              <span
                v-if="task.status === 'in-progress'"
                class="text-muted small">
                {{ $t('governance.unmanagedApplications.correlationTab.currentlyRunning') }}
              </span>
              <template v-else>
                <span class="text-muted small mr-2">
                  {{ dateLabel }}: {{ formattedDate }}
                </span>
                <BButton
                  variant="link"
                  size="sm"
                  class="p-0"
                  @click="editingDate = !editingDate">
                  <FrIcon
                    :name="editingDate ? 'close' : 'edit'"
                    class="small" />
                </BButton>
              </template>
            </div>
            <FrField
              v-if="editingDate"
              v-model="form.date"
              class="mt-3"
              type="datetime"
              name="date"
              :label="$t('governance.unmanagedApplications.correlationTab.setRunDate')"
              :adjust-for-timezone="false"
              :show-seconds="false" />
          </template>

          <hr>

          <div class="d-flex justify-content-end">
            <BButton
              v-if="!task"
              class="mr-2"
              variant="link"
              @click="cancelForm">
              {{ $t('common.cancel') }}
            </BButton>
            <BButton
              v-if="task"
              class="mr-2"
              variant="outline-primary"
              :disabled="task.status === 'in-progress' || isTriggeringRun"
              @click="runNow">
              <FrIcon
                icon-class="mr-2"
                name="play_arrow" />
              {{ $t('governance.unmanagedApplications.correlationTab.runNow') }}
            </BButton>
            <FrButtonWithSpinner
              variant="primary"
              :button-text="$t('common.save')"
              :disabled="!isFormValid || isSaving"
              :show-spinner="isSaving"
              :spinner-text="$t('common.saving')"
              @click="save" />
          </div>
        </BCardBody>
      </BCard>
    </template>
  </div>
</template>

<script setup>
import {
  computed, onMounted, ref, watch,
} from 'vue';
import dayjs from 'dayjs';
import {
  BBadge,
  BButton,
  BCard,
  BCardBody,
  BCol,
  BFormRow,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { getFilterSchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import {
  getApplicationTask,
  saveApplicationTask,
  triggerApplicationTask,
} from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const TASK_NAME = 'Account Correlation';

const PRESET_INTERVALS = [3600000, 86400000, 604800000];

const intervalOptions = [
  { text: i18n.global.t('governance.unmanagedApplications.correlationTab.intervals.hourly'), value: 3600000 },
  { text: i18n.global.t('governance.unmanagedApplications.correlationTab.intervals.daily'), value: 86400000 },
  { text: i18n.global.t('governance.unmanagedApplications.correlationTab.intervals.weekly'), value: 604800000 },
  { text: i18n.global.t('governance.unmanagedApplications.correlationTab.intervals.custom'), value: 'custom' },
];

const statusVariantMap = {
  pending: 'secondary',
  'in-progress': 'warning',
  complete: 'success',
  failed: 'danger',
};

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  objectType: {
    type: Object,
    default: null,
  },
});

const isLoading = ref(false);
const isSaving = ref(false);
const isTriggeringRun = ref(false);
const showForm = ref(false);
const editingDate = ref(false);
const task = ref(null);
const userAttributeOptions = ref([]);
const customIntervalMs = ref('');

const emptyForm = () => ({
  accountAttribute: '',
  userAttribute: '',
  overwrite: false,
  recurring: false,
  intervalMs: 86400000,
  date: '',
});

const form = ref(emptyForm());

const accountAttributeOptions = computed(() => {
  if (!props.objectType?.properties) return [];
  return Object.entries(props.objectType.properties)
    .filter(([, prop]) => (prop.type || '') === 'string')
    .map(([key, prop]) => ({ text: prop.displayName || key, value: key }));
});

const statusVariant = computed(() => statusVariantMap[task.value?.status] || 'secondary');

const isCustomInterval = computed(() => form.value.intervalMs === 'custom');

const isFormValid = computed(() => {
  if (!form.value.accountAttribute || !form.value.userAttribute) return false;
  if (form.value.recurring && isCustomInterval.value) {
    const ms = Number(customIntervalMs.value);
    return Number.isInteger(ms) && ms >= 3600000;
  }
  return true;
});

const dateLabel = computed(() => {
  const status = task.value?.status;
  if (status === 'complete' || status === 'failed') {
    return i18n.global.t('governance.unmanagedApplications.correlationTab.lastRan');
  }
  return i18n.global.t('governance.unmanagedApplications.correlationTab.nextRun');
});

const formattedDate = computed(() => {
  if (!form.value.date) return i18n.global.t('governance.unmanagedApplications.correlationTab.noDate');
  return dayjs(form.value.date).format('MMM D, YYYY h:mm A');
});

function populateForm(t) {
  const rule = t.taskData?.action?.correlationRule || {};
  const intervalMs = t.intervalMs || 86400000;
  const isPreset = PRESET_INTERVALS.includes(intervalMs);
  form.value = {
    accountAttribute: rule.accountAttribute || '',
    userAttribute: rule.userAttribute || '',
    overwrite: t.taskData?.action?.overwrite ?? false,
    recurring: t.recurring ?? false,
    intervalMs: isPreset ? intervalMs : 'custom',
    date: t.date || '',
  };
  customIntervalMs.value = isPreset ? '' : String(intervalMs);
}

function resolvedIntervalMs() {
  if (isCustomInterval.value) return Number(customIntervalMs.value);
  return form.value.intervalMs;
}

function buildPayload() {
  const payload = {
    type: 'applicationBulkOperation',
    name: TASK_NAME,
    context: { application: props.applicationId },
    recurring: form.value.recurring,
    intervalMs: form.value.recurring ? resolvedIntervalMs() : undefined,
    taskData: {
      targets: [{ objectType: 'account' }],
      action: {
        type: 'createLink',
        overwrite: form.value.overwrite,
        correlationRule: {
          type: 'attributeMatch',
          userAttribute: form.value.userAttribute,
          accountAttribute: form.value.accountAttribute,
        },
      },
    },
  };
  if (form.value.date) payload.date = form.value.date;
  return payload;
}

async function fetchTask() {
  isLoading.value = true;
  try {
    const { data } = await getApplicationTask(props.applicationId, TASK_NAME);
    task.value = data;
    populateForm(data);
  } catch (err) {
    if (err?.response?.status !== 404) {
      showErrorMessage(err, i18n.global.t('governance.unmanagedApplications.correlationTab.loadError'));
    }
    task.value = null;
  } finally {
    isLoading.value = false;
  }
}

async function save() {
  isSaving.value = true;
  try {
    const { data } = await saveApplicationTask(props.applicationId, buildPayload());
    task.value = data;
    showForm.value = false;
    editingDate.value = false;
    displayNotification('success', i18n.global.t('governance.unmanagedApplications.correlationTab.saveSuccess'));
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.unmanagedApplications.correlationTab.saveError'));
  } finally {
    isSaving.value = false;
  }
}

async function runNow() {
  isTriggeringRun.value = true;
  try {
    await triggerApplicationTask(props.applicationId, TASK_NAME, true);
    displayNotification('success', i18n.global.t('governance.unmanagedApplications.correlationTab.runSuccess'));
    await fetchTask();
  } catch (err) {
    showErrorMessage(err, i18n.global.t('governance.unmanagedApplications.correlationTab.runError'));
  } finally {
    isTriggeringRun.value = false;
  }
}

function cancelForm() {
  showForm.value = false;
  editingDate.value = false;
  form.value = emptyForm();
}

async function loadUserAttributes() {
  try {
    const { data } = await getFilterSchema();
    userAttributeOptions.value = (data.user || [])
      .filter((field) => field.type === 'string' && !field.isMultiValue)
      .map((field) => ({ text: field.displayName, value: field.name }));
  } catch {
    userAttributeOptions.value = [];
  }
}

watch(() => props.applicationId, fetchTask);

onMounted(() => {
  fetchTask();
  loadUserAttributes();
});

defineExpose({
  accountAttributeOptions,
  userAttributeOptions,
  form,
  save,
  runNow,
});
</script>

<style lang="scss" scoped>
.fr-correlation-arrow {
  margin-bottom: 1rem;
  :deep(.material-icons) {
    font-size: 1.75rem;
  }
}
</style>

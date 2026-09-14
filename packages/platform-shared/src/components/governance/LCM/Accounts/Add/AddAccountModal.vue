<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      id="newAccountModal"
      size="lg"
      no-close-on-backdrop
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="modalProperties.title"
      @hidden="resetModal">
      <FrRequestSubmitSuccess
        v-if="step === 2"
        :request-id="requestId"
        :success-text="$t('governance.accounts.newAccount.success')" />
      <template v-else-if="step === 1">
        <FrFormBuilder
          v-if="form"
          v-model:model-value="formValue"
          :form="form.form"
          :read-only="false"
          @is-valid="isValidForm = $event" />
        <template v-else>
          <FrAccountOwnerFields
            class="mb-4"
            :model-value="accountOwnerValues"
            @update:modelValue="accountOwnerValues = $event" />
          <BCard class="mb-4 form-section">
            <h3 class="h5 mb-4">
              {{ $t('governance.accounts.editAccount.accountAttributes') }}
            </h3>
            <FrEntitlementEditForm
              v-if="accountSchema && Object.keys(accountSchema).length"
              :entitlement-schema="accountSchema"
              :model-value="accountValues"
              @update:modelValue="accountValues = $event" />
          </BCard>
          <BCard
            v-if="glossarySchema.length"
            class="mb-4 form-section">
            <h3 class="h5 mb-4">
              {{ $t('governance.entitlements.glossaryAttributes') }}
            </h3>
            <FrGlossaryEditForm
              :glossary-schema="glossarySchema"
              :model-value="glossaryValues"
              :read-only="false"
              @update:modelValue="glossaryValues = $event" />
          </BCard>
        </template>
      </template>
      <template v-else>
        <FrAppAndObjectType
          application-only
          override-scope-permission
          :filter-by-account-attribute="false"
          :label-text="$t('governance.accounts.newAccount.chooseApplication')"
          @selected:application="application = $event"
          @input="updateApplication" />
      </template>
      <template #modal-footer="{ cancel, ok }">
        <BButton
          v-if="step === 1"
          class="mr-auto"
          variant="link"
          :disabled="isSaving || isLoadingForm"
          @click="resetModal">
          {{ $t('common.previous') }}
        </BButton>
        <BButton
          v-if="step !== 2"
          class="ml-auto"
          variant="link"
          :disabled="isSaving || isLoadingForm"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          v-if="step !== 2"
          :button-text="modalProperties.buttonText"
          :disabled="!valid || isLoadingForm || isSaving || (step === 0 && !applicationId) || (step === 1 && form && !isValidForm)"
          :show-spinner="isLoadingForm || isSaving"
          :spinner-text="step === 0 ? modalProperties.buttonText : $t('common.submitting')"
          @click="nextStep(ok)" />
        <BButton
          v-else
          class="ml-auto"
          variant="outline-primary"
          @click="ok()">
          {{ $t('common.done') }}
        </BButton>
      </template>
    </BModal>
  </VeeForm>
</template>

<script setup>
import { computed, ref } from 'vue';
import { Form as VeeForm } from 'vee-validate';
import { intersection, omit, pickBy } from 'lodash';
import {
  BButton,
  BCard,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrAccountOwnerFields from '@forgerock/platform-shared/src/components/governance/LCM/Accounts/AccountOwnerFields';
import FrEntitlementEditForm from '@forgerock/platform-shared/src/components/governance/EntitlementEditForm';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrAppAndObjectType from '@forgerock/platform-shared/src/components/governance/LCM/Entitlements/Add/Steps/AppAndObjectType';
import FrRequestSubmitSuccess from '@forgerock/platform-shared/src/components/governance/LCM/RequestSubmitSuccess';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getObjectTypeSchema } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getAccountObjectTypeNameFromApp } from '@forgerock/platform-shared/src/utils/governance/entitlements';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import useForm from '@forgerock/platform-shared/src/composables/governance/forms';
import i18n from '@/i18n';

defineProps({
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['account-saved']);

const application = ref({});
const applicationId = ref('');
const accountSchema = ref({});
const accountValues = ref({});
const accountOwnerValues = ref({});
const formValue = ref({});
const glossarySchema = ref([]);
const glossaryValues = ref({});
const isLoadingForm = ref(false);
const isSaving = ref(false);
const isValidForm = ref(false);
const requestId = ref('');
const step = ref(0);

const {
  form,
  formTypes,
  getFormDefinitionByType,
  setDefaultFormValues,
} = useForm();

const modalProperties = computed(() => ({
  // step 1 shows the account fields to submit; step 0 only selects the application
  buttonText: step.value === 0 ? i18n.global.t('common.next') : i18n.global.t('common.submit'),
  title: i18n.global.t('governance.accounts.newAccount.title'),
}));

// The account-capable object type for the selected application: derived from its inbound
// user mapping when connected; disconnected applications have no mappings, so fall back to
// their own account object type — preferring the conventional '__ACCOUNT__' name so the
// choice stays deterministic when several types lack an accountAttribute — then to the
// assigned form's recorded object type.
const accountObjectType = computed(() => getAccountObjectTypeNameFromApp(application.value)
  || application.value.objectTypes?.find((type) => type.name === '__ACCOUNT__')?.name
  || application.value.objectTypes?.find((type) => !type.accountAttribute)?.name
  || form.value?.categories?.objectType
  || '');

function resetModal() {
  application.value = {};
  applicationId.value = '';
  accountSchema.value = {};
  accountValues.value = {};
  accountOwnerValues.value = {};
  formValue.value = {};
  glossarySchema.value = [];
  glossaryValues.value = {};
  isLoadingForm.value = false;
  isSaving.value = false;
  isValidForm.value = false;
  requestId.value = '';
  step.value = 0;
  setDefaultFormValues();
}

async function updateApplication(value) {
  applicationId.value = value?.applicationId || '';
}

/**
 * Loads the account object-type schema so a default set of attribute fields can
 * be shown when no form is assigned. Non-creatable properties are hidden — this
 * is a create flow (same convention as DefaultEntitlementForm).
 */
async function loadAccountSchema() {
  const objectType = accountObjectType.value;
  if (!applicationId.value || !objectType) return;
  try {
    const { data } = await getObjectTypeSchema(applicationId.value, objectType);
    accountSchema.value = pickBy(data?.properties, (value, key) => {
      const flags = value.flags || [];
      value.displayName = value.displayName || key;
      value.readOnly = intersection(flags, ['NOT_CREATABLE']).length > 0;
      return !value.readOnly;
    });
  } catch {
    // schema is optional — fall back to the glossary fields only
    accountSchema.value = {};
  }
}

async function initializeForm() {
  isLoadingForm.value = true;
  await getFormDefinitionByType(formTypes.APPLICATION, {
    application: application.value,
    applicationId: applicationId.value,
    // pass the derived account object type so the form assignment lookup uses the
    // exact "application/<id>/<objectType>/create" query; without it, disconnected
    // applications (no inbound user mapping) degrade to a partial-match query
    objectType: accountObjectType.value,
    operation: 'create',
    setInitialModel: true,
  });
  if (!form.value) {
    // no assigned form — fall back to the account's own attribute fields.
    // The two schema requests are independent, so load them concurrently.
    await Promise.all([
      loadAccountSchema(),
      getGlossarySchema('account')
        .then((schema) => { glossarySchema.value = schema; })
        .catch(() => {
          // glossary attributes are optional — show only the attribute fields
          glossarySchema.value = [];
        }),
    ]);
  }
  isLoadingForm.value = false;
}

async function nextStep(ok) {
  if (step.value === 0) {
    await initializeForm();
    step.value = 1;
    isValidForm.value = Boolean(form.value);
    return;
  }
  if (step.value === 1) {
    isSaving.value = true;
    try {
      // With an assigned form it is the sole source of values; its glossary.*
      // fields land in the form model's glossary object. Without one, the
      // account owner/type fields, account attribute fields, and the standalone
      // glossary editor are used.
      const glossary = form.value
        ? formValue.value.glossary
        : glossaryValues.value;
      const { data } = await submitCustomRequest('createAccount', {
        common: {
          context: {
            type: 'admin',
          },
        },
        custom: {},
        account: {
          applicationId: applicationId.value,
          objectType: accountObjectType.value,
          ...(form.value ? omit(formValue.value, ['glossary']) : {
            ...accountOwnerValues.value,
            object: accountValues.value,
          }),
          ...(Object.keys(glossary || {}).length ? { glossary } : {}),
        },
      });
      requestId.value = data.id;
      step.value = 2;
      emit('account-saved');
    } catch (error) {
      showErrorMessage(error, i18n.global.t('governance.request.requestError'));
    } finally {
      isSaving.value = false;
    }
    return;
  }
  ok();
}
</script>

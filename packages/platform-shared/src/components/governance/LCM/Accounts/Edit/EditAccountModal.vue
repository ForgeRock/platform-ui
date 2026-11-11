<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VeeForm
    v-slot="{ meta: { valid } }"
    as="span">
    <BModal
      id="editAccountModal"
      size="lg"
      no-close-on-backdrop
      title-class="h5"
      title-tag="h2"
      :static="isTesting"
      :title="$t('governance.accounts.editAccount.title')"
      @show="onModalShow"
      @hidden="resetModal">
      <FrSpinner
        v-if="isLoading"
        class="py-5" />
      <template v-else>
        <template v-if="form">
          <FrFormBuilder
            v-model:model-value="formValue"
            :form="form.form"
            :read-only="false"
            @is-valid="isValidForm = $event" />
        </template>
        <template v-else>
          <BCard
            v-if="Object.keys(accountSchema).length"
            class="mb-4 form-section">
            <h3 class="h5 mb-4">
              {{ $t('governance.accounts.editAccount.accountAttributes') }}
            </h3>
            <FrEntitlementEditForm
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
              :glossary-schema="glossarySchema.filter((attribute) => attribute.name !== 'accountType')"
              :model-value="glossaryValues"
              :read-only="false"
              @update:modelValue="glossaryValues = $event" />
          </BCard>
          <p
            v-if="!Object.keys(accountSchema).length && !glossarySchema.length"
            class="text-center text-muted"
            data-testid="edit-account-no-properties">
            {{ $t('governance.accounts.editAccount.noPropertiesAvailable') }}
          </p>
        </template>
      </template>
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          :disabled="isSaving"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          :button-text="$t('common.save')"
          :disabled="isLoading || isSaving || !valid || (form && !isValidForm)"
          :show-spinner="isSaving"
          :spinner-text="$t('common.saving')"
          @click="saveAccountEdits" />
      </template>
    </BModal>
    <FrRequestSubmitSuccessModal
      :request-id="requestId"
      :success-text="$t('governance.accounts.editAccount.success')"
      :is-testing="isTesting" />
  </VeeForm>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue';
import { Form as VeeForm } from 'vee-validate';
import { intersection, omit, pickBy } from 'lodash';
import {
  BButton,
  BCard,
  BModal,
} from 'bootstrap-vue';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner';
import FrEntitlementEditForm from '@forgerock/platform-shared/src/components/governance/EntitlementEditForm';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrRequestSubmitSuccessModal from '@forgerock/platform-shared/src/components/governance/LCM/RequestSubmitSuccessModal';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import useForm from '@forgerock/platform-shared/src/composables/governance/forms';
import { getAccountById } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { getObjectTypeSchema } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { submitCustomRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getObjectTypeFromAccountId } from '@forgerock/platform-shared/src/utils/governance/entitlements';
import { getGlossarySchema } from '@forgerock/platform-shared/src/utils/governance/glossary';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import i18n from '@/i18n';

const props = defineProps({
  currentItem: {
    type: Object,
    default: null,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['account-saved']);

const { bvModal } = useBvModal();
const {
  form,
  formTypes,
  formValue,
  isValidForm,
  getFormDefinitionByType,
  setDefaultFormValues,
} = useForm();

const account = ref(null);
const accountSchema = ref({});
const accountValues = ref({});
const accountOwnerValues = ref({});
const applicationId = ref('');
const objectType = ref('');
const glossarySchema = ref([]);
const glossaryValues = ref({});
const requestId = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const userStore = useUserStore();
// matches the delete flows: only an admin submission is marked for auto-approval
const isAdmin = computed(() => userStore.adminUser);

function resetModal() {
  account.value = null;
  accountSchema.value = {};
  accountValues.value = {};
  accountOwnerValues.value = {};
  applicationId.value = '';
  objectType.value = '';
  glossarySchema.value = [];
  glossaryValues.value = {};
  isSaving.value = false;
  // requestId survives the reset: the success modal is shown after this modal
  // hides and still needs it — it is cleared when the edit modal next opens
  setDefaultFormValues();
}

/**
 * Loads the account's editable object-type schema, marking non-updateable
 * properties as read-only while keeping them visible.
 */
async function loadAccountSchema() {
  try {
    const { data } = await getObjectTypeSchema(applicationId.value, objectType.value);
    accountSchema.value = pickBy(data?.properties, (value, key) => {
      const flags = value.flags || [];
      value.displayName = value.displayName || key;
      value.readOnly = intersection(flags, ['NOT_UPDATEABLE']).length > 0;
      return true;
    });
  } catch {
    // schema is optional — fall back to no base editable properties
    accountSchema.value = {};
  }
}

/**
 * Loads the account glossary attribute schema, so defined glossary fields can
 * be edited alongside the account's base properties.
 */
async function loadGlossarySchema() {
  try {
    glossarySchema.value = await getGlossarySchema('account');
  } catch {
    // glossary attributes are optional — show only the base properties
    glossarySchema.value = [];
  }
}

/**
 * Checks for an assigned "update" form for this application/object type and,
 * if found, seeds it with the account's current property and glossary values.
 */
async function loadAssignedForm() {
  await getFormDefinitionByType(formTypes.APPLICATION, {
    application: account.value.application,
    applicationId: applicationId.value,
    objectType: objectType.value,
    operation: 'update',
    setInitialModel: true,
  });
  if (form.value) {
    // Seed the form's blank initial model with the account's stored values. The
    // initial model must be the base of the merge — applying it after would let
    // its empty per-field defaults clobber the account data (owner keys sit at
    // the top level, attributes under object, glossary nested, mirroring the
    // submitted account block shape).
    formValue.value = {
      ...formValue.value,
      ...accountOwnerValues.value,
      object: {
        ...formValue.value.object,
        ...account.value.account,
      },
      glossary: {
        ...formValue.value.glossary,
        ...glossaryValues.value,
      },
    };
  }
}

/**
 * Loads the full account record and initializes the base schema, glossary
 * attributes, and any assigned update form.
 */
async function initializeModal(item) {
  if (!item) return;
  // the previous submission's request id is stale — clear it before the new load
  requestId.value = '';
  isLoading.value = true;
  try {
    const { data } = await getAccountById(item.id);
    account.value = data;
    applicationId.value = data.application?.id;
    objectType.value = getObjectTypeFromAccountId(data.item, data.keys, data.application?.isDisconnected);
    accountValues.value = data.account || {};
    glossaryValues.value = data.glossary?.idx?.['/account'] || {};
    // owner/type are not shown in the edit modal, but are still seeded — the
    // owner from the account's user, the type from its glossary entry — so the
    // submitted payload round-trips their stored values
    accountOwnerValues.value = {
      ...(data.user?.id ? { userId: data.user.id } : {}),
      ...(glossaryValues.value.accountType ? { accountType: glossaryValues.value.accountType } : {}),
    };
    await Promise.all([loadAccountSchema(), loadGlossarySchema(), loadAssignedForm()]);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accounts.failedToLoad'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Opens the modal: waits one tick so a parent that sets `currentItem` and
 * calls bvModal.show() in the same handler (e.g. Accounts.vue) has its prop
 * update flushed before it is read.
 */
async function onModalShow() {
  await nextTick();
  initializeModal(props.currentItem);
}

/**
 * Submits a request to modify the account. When an assigned form exists it is
 * the sole source of field values (its glossary.* fields land in the model's
 * glossary object); otherwise the stored owner/type values, base properties,
 * and standalone glossary editor are used. On success the confirmation modal
 * links to the created request, mirroring the createAccount flow.
 */
async function saveAccountEdits() {
  isSaving.value = true;
  try {
    // admin context marks the request for auto-approval by the backend workflow
    const common = {
      ...(isAdmin.value ? { context: { type: 'admin' } } : {}),
    };
    if (!form.value) {
      common.justification = i18n.global.t('governance.lcm.justification.modifyAccount');
    }
    const glossary = form.value
      ? formValue.value.glossary
      : glossaryValues.value;
    const { data } = await submitCustomRequest('modifyAccount', {
      common,
      custom: {},
      account: {
        accountId: props.currentItem?.keys?.accountId,
        applicationId: applicationId.value,
        objectType: objectType.value,
        ...(form.value ? omit(formValue.value, ['glossary']) : {
          ...accountOwnerValues.value,
          object: accountValues.value,
        }),
        ...(Object.keys(glossary || {}).length ? { glossary } : {}),
      },
    });
    requestId.value = data.id;
    emit('account-saved');
    bvModal.value.hide('editAccountModal');
    bvModal.value.show('successful-submit');
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.request.requestError'));
  } finally {
    isSaving.value = false;
  }
}

</script>

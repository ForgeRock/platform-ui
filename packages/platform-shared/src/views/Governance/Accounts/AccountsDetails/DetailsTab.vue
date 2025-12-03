<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrSpinner
    v-if="loading"
    class="py-5" />
  <template v-else>
    <BCard class="mb-3">
      <BRow
        class="w-100 align-items-center mb-2">
        <BCol sm="4">
          <p class="h5 mb-0">
            {{ $t('governance.accounts.accountType') }}
          </p>
        </BCol>
        <BCol sm="4">
          <BBadge
            class="w-100px"
            :variant="getAccountTypeVariant(accountType)">
            {{ accountType }}
          </BBadge>
        </BCol>
        <BCol
          v-if="!isCorrelated && !readOnly"
          class="d-flex justify-content-end"
          sm="4">
          <BButton
            variant="link"
            @click="editAccountDetails">
            {{ accountTypeText.button }}
          </BButton>
        </BCol>
      </BRow>
      <BRow
        v-if="isMachine"
        class="w-100 align-items-center mb-2">
        <BCol sm="4">
          <p class="h5 mb-0">
            {{ $t('governance.accounts.accountSubType') }}
          </p>
        </BCol>
        <BCol
          sm="4"
          class="text-gray-900 d-flex">
          <FrIcon
            :icon-class="`size-28 rounded-circle d-flex align-items-center justify-content-center mr-3 color-dark${accountSubTypeObject?.iconColor} bg-light${accountSubTypeObject?.iconColor} mt-n25`"
            :name="accountSubTypeObject?.icon" />
          {{ accountSubType }}
        </BCol>
      </BRow>
    </BCard>
    <BCard
      v-if="isCorrelated || isMachine"
      class="mb-3">
      <BRow>
        <BCol
          v-if="!isMachine"
          sm="6"
          class="mb-2 h5">
          {{ i18n.global.t('governance.accounts.owner') }}
        </BCol>
        <BCol
          v-else
          sm="6"
          class="mb-2 h5">
          {{ i18n.global.t('governance.accounts.custodians') }}
        </BCol>
      </BRow>
      <BRow>
        <BCol
          v-for="actor in actors"
          :key="actor._id"
          sm="3">
          <FrUserDetails :user-object="actor" />
        </BCol>
      </BRow>
    </BCard>
    <BCard>
      <div
        class="d-flex justify-content-between"
        :class="{ 'section-header': enableCollapse }"
        @click="emit('toggle-collapse')">
        <h1 class="h5">
          {{ i18n.global.t('governance.accounts.details.detailsTab.title') }}
        </h1>
        <FrIcon
          v-if="enableCollapse"
          :name="!isCollapsed ? 'keyboard_arrow_down' : 'chevron_right'"
          class="ml-2" />
      </div>
      <BCollapse :visible="!isCollapsed">
        <div class="mt-4">
          <BRow
            v-for="([leftColumnAttribute, rightColumnAttribute], index) in displayPairs"
            :key="index">
            <BCol
              sm="3"
              class="weight-600">
              {{ leftColumnAttribute.key }}
            </BCol>
            <BCol
              sm="3"
              class="mb-3 text-gray-900">
              {{ leftColumnAttribute.value ?? blankValueIndicator }}
            </BCol>
            <template v-if="rightColumnAttribute">
              <BCol
                sm="3"
                class="weight-600">
                {{ rightColumnAttribute.key }}
              </BCol>
              <BCol
                sm="3"
                class="mb-3 text-gray-900">
                {{ rightColumnAttribute.value ?? blankValueIndicator }}
              </BCol>
            </template>
          </BRow>
        </div>
      </BCollapse>
    </BCard>
  </template>
  <BModal
    id="UpdateAccountModal"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :static="isTesting"
    :title="$t('governance.accounts.modal.title', { action: accountTypeText.action })">
    <div class="mb-4 d-block">
      {{ accountTypeText.description }}
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
          :show-spinner="saving"
          :disabled="loading"
          @click="save()" />
      </div>
    </template>
  </BModal>
</template>

<script setup>
import {
  onMounted, ref, computed,
} from 'vue';
import { capitalize, find } from 'lodash';
import {
  BButton, BCard, BCollapse, BModal, BRow, BCol, BBadge,
} from 'bootstrap-vue';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrUserDetails from '@forgerock/platform-shared/src/components/governance/UserDetails';
import { saveAccountGlossaryAttributesData, getAccountGlossaryAttributesData } from '@forgerock/platform-shared/src/api/governance/AccountApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import dayjs from 'dayjs';
import FrGlossaryEditForm from '@forgerock/platform-shared/src/components/governance/GlossaryEditForm';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getAccountTypeVariant } from '../utils/accountUtility';

import i18n from '@/i18n';
import accountConstants from '../utils/accountConstants';

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: true,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  useExistingGlossary: {
    type: Boolean,
    default: false,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  enableCollapse: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle-collapse']);
const { bvModal } = useBvModal();
const glossarySchema = ref([]);
const glossaryValues = ref({});
const accountType = ref('Default');
const accountSubType = ref(null);
const actors = ref([]);
const displayPairs = ref([]);
const loading = ref(true);
const saving = ref(false);
const accountSubTypeObject = ref({});

const isCorrelated = computed(() => props.account?.user);
const isMachine = computed(() => accountType.value.toLowerCase() === accountConstants.ACCOUNT_TYPES.MACHINE);
const updateSchema = computed(() => glossarySchema.value.filter((entry) => {
  // Convert existing glossary property to be used as custodians with typeahead
  if (entry.name === 'actors') {
    entry.displayName = i18n.global.t('governance.accounts.custodians');
    entry.type = 'managedObject';
    entry.managedObjectType = '/openidm/managed/user';
    return true;
  }
  if (entry.name === 'accountSubtype') {
    entry.displayName = i18n.global.t('governance.accounts.accountSubType');
    entry.type = 'string';
    entry.enumeratedValues = accountConstants.ACCOUNT_SUBTYPES;
    return true;
  }
  return false;
}));

const accountTypeText = computed(() => {
  if (accountType.value.toLowerCase() === accountConstants.ACCOUNT_TYPES.MACHINE) {
    return {
      action: i18n.global.t('governance.accounts.modal.update'),
      button: i18n.global.t('governance.accounts.editMachine'),
      description: i18n.global.t('governance.accounts.modal.updateMachineDescription'),
    };
  }
  return {
    action: i18n.global.t('governance.accounts.modal.set'),
    button: i18n.global.t('governance.accounts.changeMachine'),
    description: i18n.global.t('governance.accounts.modal.setMachineDescription'),
  };
});

/**
 * Returns display friendly values for glossary attributes
 * @param val Value to be shown
 * @param type Type of data
 */
function getGlossaryDisplayValue(val, type) {
  if (val === null || val === undefined) {
    return null;
  }
  if (type === 'date') {
    return dayjs(val).format('MMM D, YYYY');
  }
  return val;
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
    })) || [];
  }
  return actorsList;
}

async function getGlossaryValues() {
  try {
    // If glossary data is passed in and should be used, e.g. on a certification decision item, use that instead of querying
    if (props.useExistingGlossary) {
      return props.account?.glossary?.idx?.['/account'] || {};
    }
    const { data } = await getAccountGlossaryAttributesData(props.account?.keys?.accountId);
    return data;
  } catch (error) {
    if (error.response && error.response.status !== 404) {
      showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: i18n.global.t('common.account') }));
    }
    return props.account?.glossary?.idx?.['/account'] || {};
  }
}

/**
 * Get glossary information for the account
 */
async function getGlossary() {
  try {
    const [glossaryValuesResult, glossarySchemaResult] = await Promise.all([
      getGlossaryValues(),
      getGlossarySchema(),
    ]);

    glossaryValues.value = glossaryValuesResult;
    glossarySchema.value = glossarySchemaResult.data['/iga/governance/account'];

    accountType.value = capitalize(glossaryValues.value?.accountType || accountConstants.ACCOUNT_TYPES.DEFAULT);
    accountSubTypeObject.value = find(accountConstants.ACCOUNT_SUBTYPES, { value: glossaryValues.value?.accountSubtype });
    accountSubType.value = accountSubTypeObject.value?.text || capitalize(glossaryValues.value?.accountSubtype) || blankValueIndicator;

    if (isCorrelated.value) {
      actors.value = [
        {
          _id: props.account.user._id,
          userName: props.account.user.userName,
          sn: props.account.user.sn,
          givenName: props.account.user.givenName,
          profileImage: props.account.user.profileImage,
          fullName: i18n.global.t('common.userFullName', {
            givenName: props.account.user.givenName,
            sn: props.account.user.sn,
          }).trim(),
        },
      ];
    } else {
      actors.value = await getActorsInfo();
    }

    const displayArray = glossarySchema.value.map((entry) => {
      if (['actors', 'accountType', 'accountSubtype'].includes(entry.name)) {
        // These are displayed elsewhere on the page
        return null;
      }
      return {
        key: entry.displayName,
        value: getGlossaryDisplayValue(glossaryValues.value[entry.name], entry.type),
      };
    }).filter((item) => !!item).sort((a, b) => a.key.localeCompare(b.key));
    for (let i = 0; i < displayArray.length; i += 2) {
      displayPairs.value.push([displayArray[i], displayArray[i + 1]]);
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.glossary.queryAttrError', { resourceType: i18n.global.t('common.account') }));
  }
  loading.value = false;
}

/**
 * Updates glossary values from form
 * @param value New glossary values
 */
function updateGlossaryValues(value) {
  glossaryValues.value = value;
}

function editAccountDetails() {
  // Currently editing account details will always be saving the account as a machine account, so adjustment is made here
  glossaryValues.value.accountType = accountConstants.ACCOUNT_TYPES.MACHINE;
  bvModal.value.show('UpdateAccountModal');
}

function closeModal() {
  bvModal.value.hide('UpdateAccountModal');
}

async function save() {
  saving.value = true;
  try {
    await saveAccountGlossaryAttributesData(props.account?.keys?.accountId, glossaryValues.value);
    displayNotification('success', i18n.global.t('governance.accounts.details.detailsTab.accountSaved'));
    await getGlossary();
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accounts.details.detailsTab.accountSaveErrorMessage'));
  } finally {
    closeModal();
    saving.value = false;
  }
}

onMounted(() => {
  getGlossary();
});
</script>
<style lang="scss" scoped>

.weight-600 {
  font-weight: 600;
}

.text-gray-900 {
  color: $gray-900
}

.section-header {
  cursor: pointer;
}
</style>

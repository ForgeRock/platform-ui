<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <BTableSimple
      v-else-if="allGrantNames.length"
      hover
      class="mb-0">
      <BThead>
        <BTr>
          <BTh class="fr-grants-tab__col-name">
            {{ columnLabel }}
          </BTh>
          <BTh
            v-if="showAppColumn"
            class="fr-grants-tab__col-name">
            {{ $t('common.application') }}
          </BTh>
          <BTh class="fr-grants-tab__col-user">
            {{ userAName }}
          </BTh>
          <BTh class="fr-grants-tab__col-user">
            {{ userBName }}
          </BTh>
          <BTh class="fr-grants-tab__col-actions" />
        </BTr>
      </BThead>
      <BTbody>
        <BTr
          v-for="name in allGrantNames"
          :key="name">
          <BTd class="fr-grants-tab__col-name">
            <BMedia
              v-if="grantType === 'accountGrant'"
              class="align-items-center"
              no-body>
              <div class="size-36 fr-app-logo-bg d-flex align-items-center justify-content-center mr-3 flex-shrink-0">
                <img
                  class="size-28"
                  alt=""
                  :src="getApplicationLogo(getAnyGrantByName(name)?.application)"
                  :onerror="onImageError">
              </div>
              <BMediaBody class="align-self-center">
                <BButton
                  variant="link"
                  class="p-0 text-left"
                  @click="emit('open-details', { grant: getAnyGrantByName(name), userId: userASet.has(name) ? userAId : userBId })">
                  {{ name }}
                </BButton>
              </BMediaBody>
            </BMedia>
            <template v-else>
              <BButton
                variant="link"
                class="p-0 text-left"
                @click="emit('open-details', { grant: getAnyGrantByName(name), userId: userASet.has(name) ? userAId : userBId })">
                {{ name }}
              </BButton>
            </template>
          </BTd>
          <BTd
            v-if="showAppColumn && grantType === 'entitlementGrant'"
            class="fr-grants-tab__col-name">
            <BMedia
              class="align-items-center"
              no-body>
              <div class="size-36 fr-app-logo-bg d-flex align-items-center justify-content-center mr-3 flex-shrink-0">
                <img
                  class="size-28"
                  alt=""
                  :src="getApplicationLogo(getAnyGrantByName(name)?.application)"
                  :onerror="onImageError">
              </div>
              <BMediaBody class="align-self-center">
                {{ getAnyGrantByName(name)?.application?.name }}
              </BMediaBody>
            </BMedia>
          </BTd>
          <BTd>
            <div class="d-flex align-items-center">
              <template v-if="userASet.has(name)">
                <FrIcon
                  name="check"
                  class="text-success mr-1" />
                <span class="text-success">{{ $t('governance.accessAnalysis.grants.granted') }}</span>
              </template>
              <template v-else>
                <FrIcon
                  name="block"
                  class="text-danger mr-1" />
                <span class="text-danger">{{ $t('governance.accessAnalysis.grants.notGranted') }}</span>
              </template>
            </div>
          </BTd>
          <BTd>
            <div class="d-flex align-items-center">
              <template v-if="userBSet.has(name)">
                <FrIcon
                  name="check"
                  class="text-success mr-1" />
                <span class="text-success">{{ $t('governance.accessAnalysis.grants.granted') }}</span>
              </template>
              <template v-else>
                <FrIcon
                  name="block"
                  class="text-danger mr-1" />
                <span class="text-danger">{{ $t('governance.accessAnalysis.grants.notGranted') }}</span>
              </template>
            </div>
          </BTd>
          <BTd class="fr-grants-tab__col-actions">
            <FrActionsCell
              :divider="false"
              :delete-option="false"
              :edit-option="false">
              <template #custom-bottom-actions>
                <BDropdownItem
                  :disabled="!!submitting[`${userAId}:${name}`]"
                  @click="userASet.has(name) ? submitRevoke(userAId, getUserGrantByName(userAGrants, name)) : submitRequest(userAId, name)">
                  <FrIcon
                    icon-class="mr-2"
                    :name="userASet.has(name) ? 'remove_circle' : 'add_circle'">
                    {{ userASet.has(name) ? $t('governance.accessAnalysis.grants.revokeFrom', { name: userAName }) : $t('governance.accessAnalysis.grants.grantTo', { name: userAName }) }}
                  </FrIcon>
                </BDropdownItem>
                <BDropdownItem
                  :disabled="!!submitting[`${userBId}:${name}`]"
                  @click="userBSet.has(name) ? submitRevoke(userBId, getUserGrantByName(userBGrants, name)) : submitRequest(userBId, name)">
                  <FrIcon
                    icon-class="mr-2"
                    :name="userBSet.has(name) ? 'remove_circle' : 'add_circle'">
                    {{ userBSet.has(name) ? $t('governance.accessAnalysis.grants.revokeFrom', { name: userBName }) : $t('governance.accessAnalysis.grants.grantTo', { name: userBName }) }}
                  </FrIcon>
                </BDropdownItem>
              </template>
            </FrActionsCell>
          </BTd>
        </BTr>
      </BTbody>
    </BTableSimple>
    <FrNoData
      v-else
      :card="false"
      icon="inbox"
      :subtitle="$t('governance.accessAnalysis.grants.noGrants')" />
    <FrRequestSubmitSuccessModal
      :id="`grants-tab-request-success-${grantType}`"
      :request-id="successRequestId" />
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
  watchEffect,
} from 'vue';
import {
  BButton,
  BDropdownItem,
  BMedia,
  BMediaBody,
  BTableSimple,
  BTbody,
  BTd,
  BTh,
  BThead,
  BTr,
} from 'bootstrap-vue';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import { get } from 'lodash';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getUserGrants } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { requestAction } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrRequestSubmitSuccessModal from '@forgerock/platform-shared/src/components/governance/LCM/RequestSubmitSuccessModal';
import i18n from '@/i18n';

const REQUEST_TYPES = {
  roleMembership: { grant: 'roleGrant', revoke: 'roleRemove' },
  accountGrant: { grant: 'applicationGrant', revoke: 'applicationRemove' },
  entitlementGrant: { grant: 'entitlementGrant', revoke: 'entitlementRemove' },
};

// For both grant and revoke, entitlement/application requests use the catalog assignment id
const ID_PATH = {
  roleMembership: 'role.id',
  accountGrant: 'assignment.id',
  entitlementGrant: 'assignment.id',
};

const LODASH_PATH = {
  accountGrant: 'application.name',
  roleMembership: 'role.name',
  entitlementGrant: 'descriptor.idx["/entitlement"].displayName',
};

// Minimum _fields needed for each grant type to support display and request payload construction
const FETCH_FIELDS = {
  roleMembership: 'role.id,role.name,item',
  accountGrant: 'application,item,assignment.id',
  entitlementGrant: 'application,descriptor,item,assignment.id',
};

const props = defineProps({
  userAId: { type: String, required: true },
  userBId: { type: String, required: true },
  userAName: { type: String, default: '' },
  userBName: { type: String, default: '' },
  grantType: {
    type: String,
    required: true,
    validator: (v) => ['accountGrant', 'roleMembership', 'entitlementGrant'].includes(v),
  },
  columnLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:count', 'open-details']);

const { bvModal } = useBvModal();

const isLoading = ref(false);
const userAGrants = ref([]);
const userBGrants = ref([]);
const submitting = ref({});
const successRequestId = ref('');

function extractName(grant) {
  return get(grant, LODASH_PATH[props.grantType]) || '';
}

const userASet = computed(() => new Set(userAGrants.value.map(extractName).filter(Boolean)));
const userBSet = computed(() => new Set(userBGrants.value.map(extractName).filter(Boolean)));

const allGrantNames = computed(() => {
  const combined = new Set([...userASet.value, ...userBSet.value]);
  return [...combined].sort();
});

const showAppColumn = computed(() => props.grantType === 'entitlementGrant');

function getAnyGrantByName(name) {
  return [...userAGrants.value, ...userBGrants.value]
    .find((g) => extractName(g) === name);
}

// grants is a plain array (template auto-unwraps the ref before passing it here)
function getUserGrantByName(grants, name) {
  return grants.find((g) => extractName(g) === name);
}

async function fetchGrants(userId) {
  const { data } = await getUserGrants(userId, {
    _queryFilter: `item.type eq '${props.grantType}'`,
    _pageSize: 100,
    _fields: FETCH_FIELDS[props.grantType],
  });
  return data?.result || [];
}

// Module-level sequence counter prevents stale responses from overwriting newer data
let loadSeq = 0;

async function loadGrants() {
  isLoading.value = true;
  loadSeq += 1;
  const seq = loadSeq;
  userAGrants.value = [];
  userBGrants.value = [];
  const [aResult, bResult] = await Promise.allSettled([
    fetchGrants(props.userAId),
    fetchGrants(props.userBId),
  ]);
  if (seq !== loadSeq) return;
  if (aResult.status === 'rejected') {
    showErrorMessage(aResult.reason, i18n.global.t('governance.accessAnalysis.grants.errorLoading'));
  }
  if (bResult.status === 'rejected') {
    showErrorMessage(bResult.reason, i18n.global.t('governance.accessAnalysis.grants.errorLoading'));
  }
  userAGrants.value = aResult.status === 'fulfilled' ? aResult.value : [];
  userBGrants.value = bResult.status === 'fulfilled' ? bResult.value : [];
  isLoading.value = false;
}

async function submitRequest(userId, name) {
  const key = `${userId}:${name}`;
  submitting.value = { ...submitting.value, [key]: true };
  try {
    const types = REQUEST_TYPES[props.grantType];
    const anyGrant = getAnyGrantByName(name);
    const grantId = get(anyGrant, ID_PATH[props.grantType]) || '';
    const common = {
      context: { type: 'admin' },
      entitlementId: grantId,
      userId,
      ...(props.grantType === 'roleMembership' && { roleId: grantId }),
      ...(props.grantType === 'accountGrant' && { applicationId: anyGrant?.application?.id }),
    };
    const { data } = await requestAction(types.grant, 'publish', null, { common });
    if (data?.errors?.length) {
      showErrorMessage(null, data.errors[0].message);
    } else {
      successRequestId.value = data?.id || '';
      bvModal.value.show(`grants-tab-request-success-${props.grantType}`);
      loadGrants();
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessAnalysis.grants.errorSubmitting'));
  } finally {
    const next = { ...submitting.value };
    delete next[key];
    submitting.value = next;
  }
}

async function submitRevoke(userId, grant) {
  if (!grant) return;
  const name = extractName(grant);
  const key = `${userId}:${name}`;
  submitting.value = { ...submitting.value, [key]: true };
  try {
    const types = REQUEST_TYPES[props.grantType];
    const grantId = get(grant, ID_PATH[props.grantType]) || '';
    const common = {
      context: { type: 'admin' },
      entitlementId: grantId,
      userId,
      ...(props.grantType === 'roleMembership' && { roleId: grantId }),
      ...(props.grantType === 'accountGrant' && { applicationId: grant.application?.id }),
    };
    const { data } = await requestAction(types.revoke, 'publish', null, { common });
    if (data?.errors?.length) {
      showErrorMessage(null, data.errors[0].message);
    } else {
      successRequestId.value = data?.id || '';
      bvModal.value.show(`grants-tab-request-success-${props.grantType}`);
      loadGrants();
    }
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessAnalysis.grants.errorSubmitting'));
  } finally {
    const next = { ...submitting.value };
    delete next[key];
    submitting.value = next;
  }
}

onMounted(loadGrants);
watch(() => [props.userAId, props.userBId, props.grantType], loadGrants);
watchEffect(() => emit('update:count', allGrantNames.value.length));
</script>

<style lang="scss" scoped>
.fr-grants-tab {
  &__col-name {
    width: 30%;
    font-weight: 600;
  }

  &__col-user {
    width: 30%;
  }

  &__col-actions {
    width: 40px;
  }
}
</style>

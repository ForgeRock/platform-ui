<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <FrSpinner
        v-if="isLoading"
        class="py-5" />
      <template v-else-if="role">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h1 class="mb-0">
            {{ roleDisplayName }}
          </h1>
          <BButton
            v-if="canPublishRole"
            variant="primary"
            data-testid="move-to-draft-button"
            :disabled="isSaving"
            @click="moveToDraft">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t(`${roleDetailsPage}.createDraftRole`) }}
            </FrIcon>
          </BButton>
        </div>
        <div class="d-flex align-items-center mb-4">
          <BBadge class="role-type-badge text-uppercase pl-2 pr-2 mr-3">
            {{ roleTypeBadge }}
          </BBadge>
          <BBadge
            class="text-capitalize pl-2 pr-2 font-weight-normal"
            :variant="statusBadgeVariant">
            {{ $t(`governance.accessModeling.populationRoleMining.status.${role.status}`) }}
          </BBadge>
        </div>

        <BCard
          class="mb-4"
          body-class="py-3"
          data-testid="session-context-card">
          <h2 class="h5 mb-0">
            <button
              type="button"
              class="btn btn-link p-0 w-100 d-flex justify-content-between align-items-center text-body session-context__toggle"
              :aria-expanded="showSessionContext ? 'true' : 'false'"
              aria-controls="session-context-collapse"
              data-testid="session-context-toggle"
              @click="showSessionContext = !showSessionContext">
              <span>{{ $t(`${roleDetailsPage}.sessionContext`) }}</span>
              <FrIcon :name="showSessionContext ? 'keyboard_arrow_down' : 'chevron_right'" />
            </button>
          </h2>
          <BCollapse
            id="session-context-collapse"
            :visible="showSessionContext">
            <dl class="row mb-0 mt-4">
              <template
                v-for="(contextItem, index) in sessionContextItems"
                :key="contextItem.key">
                <dt
                  class="col-md-2 pr-0 text-muted small"
                  :class="{ 'offset-md-1': index % 2 === 1 }">
                  {{ contextItem.label }}
                </dt>
                <dd class="col-md-3 pl-2 mb-2">
                  {{ contextItem.value }}
                </dd>
              </template>
            </dl>
          </BCollapse>
        </BCard>

        <BTabs
          content-class="mt-3"
          nav-class="fr-tabs">
          <BTab lazy>
            <template #title>
              <div class="d-flex align-items-center">
                <span class="mr-2">{{ $t(`${roleDetailsPage}.compositionTab`) }}</span>
                <span class="badge badge-primary badge-pill align-self-center">
                  {{ compositionEntitlements.length }}
                </span>
              </div>
            </template>
            <RoleEntitlementsTable
              :entitlements="compositionEntitlements"
              testid="composition-entitlements" />
          </BTab>
          <BTab lazy>
            <template #title>
              <div class="d-flex align-items-center">
                <span
                  :id="`${tabIdPrefix}-supporting`"
                  class="mr-2"
                  tabindex="0">
                  {{ $t(`${roleDetailsPage}.supportingAccessTab`) }}
                </span>
                <span class="badge badge-primary badge-pill align-self-center">
                  {{ supportingEntitlements.length }}
                </span>
                <FrIcon
                  icon-class="ml-1 size-18"
                  name="info" />
                <BTooltip
                  :target="`${tabIdPrefix}-supporting`"
                  triggers="focus hover"
                  placement="top">
                  {{ $t(`${roleDetailsPage}.supportingAccessTooltip`) }}
                </BTooltip>
              </div>
            </template>
            <RoleEntitlementsTable
              :entitlements="supportingEntitlements"
              testid="supporting-entitlements" />
          </BTab>
          <BTab lazy>
            <template #title>
              <div class="d-flex align-items-center">
                <span class="mr-2">{{ $t(`${roleDetailsPage}.membersTab`) }}</span>
                <span class="badge badge-primary badge-pill align-self-center">
                  {{ role.memberCount ?? 0 }}
                </span>
              </div>
            </template>
            <RoleIdentityOverview :role-id="route.params.roleId" />
          </BTab>
        </BTabs>
      </template>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BBadge,
  BButton,
  BCard,
  BContainer,
  BCollapse,
  BTooltip,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  createRole,
} from '@forgerock/platform-shared/src/api/governance/RoleApi';
import {
  getRoleMiningSession,
  getRoleMiningSessionRoles,
} from '@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi';
import { showErrorMessage, displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import { getRoleStatusVariant } from '@forgerock/platform-shared/src/utils/governance/accessModeling';
import { v4 as uuid } from 'uuid';
import RoleEntitlementsTable from './RoleEntitlementsTable';
import RoleIdentityOverview from './RoleIdentityOverview';
import i18n from '@/i18n';

/**
 * Detail view for a single role mined by a population-based role mining session: its
 * composition and supporting-access entitlements by tier, its member identities, and the
 * mining session context that produced it. Offers the same candidate-to-draft flow as
 * cluster role modeling, gated by the row's permissions.
 * @component PopulationRoleMiningRoleDetails
 */

const roleDetailsPage = 'governance.accessModeling.populationRoleMining.roleDetailsPage';

const route = useRoute();
const router = useRouter();
const { setBreadcrumb } = useBreadcrumb();

const role = ref(null);
const session = ref(null);
const isLoading = ref(false);
const isSaving = ref(false);
const permissions = ref({});
// Session Context sits above the role name, collapsed by default
const showSessionContext = ref(false);
// unique tooltip target id for the Shared by Some tab label
const tabIdPrefix = `role-details-tab-${uuid()}`;

// Session lifecycle statuses (session results pages); role statuses fall through to
// getRoleStatusVariant so 'candidate' renders the same neutral badge as everywhere else.
const statusVariants = {
  pending: 'light',
  running: 'warning',
  complete: 'success',
  failed: 'danger',
};

const statusBadgeVariant = computed(() => (
  statusVariants[role.value?.status] || getRoleStatusVariant(role.value?.status ?? '')
));

const roleDisplayName = computed(() => role.value?.name || blankValueIndicator);

const roleTypeBadge = computed(() => (role.value?.roleType === 'layer1_universal'
  ? i18n.global.t('governance.accessModeling.populationRoleMining.mode.birthright')
  : i18n.global.t(`${roleDetailsPage}.specialized`)));

/**
 * Whether this is a layer-1 (birthright) role. Layer-1 entitlement metadata carries
 * tier 'universal' rather than 'role_defining', so the tier split puts nothing in
 * Composition — for these roles every entitlement is composition access.
 */
const isLayer1Universal = computed(() => role.value?.roleType === 'layer1_universal');

/**
 * Split the role's entitlementMetadata into a tier bucket. Layer-2 metadata carries
 * exactly 'role_defining' and 'common_not_universal'; layer-1 carries 'universal'
 * (handled by the composition override above), which strict matching keeps out of
 * Supporting so nothing appears in both tabs.
 * @param {String} tier the tier to collect ('role_defining' or 'common_not_universal')
 * @returns {Array} the entitlements in that tier
 */
function roleEntitlementsByTier(tier) {
  return (role.value?.entitlementMetadata || []).filter((entitlement) => entitlement.tier === tier);
}

const compositionEntitlements = computed(() => (isLayer1Universal.value
  ? (role.value?.entitlementMetadata || [])
  : roleEntitlementsByTier('role_defining')));

const supportingEntitlements = computed(() => roleEntitlementsByTier('common_not_universal'));

/**
 * Normalize the role's entitlements field to an ID list. The API now returns an
 * array of entitlement IDs; older sessions returned a single space-joined string,
 * which is split as a fallback.
 * @param {String|Array} entitlements the raw entitlements field from the role document
 * @returns {Array} entitlement IDs
 */
function parseRoleEntitlements(entitlements) {
  if (Array.isArray(entitlements)) return entitlements.filter(Boolean);
  return (entitlements ?? '').split(' ').filter(Boolean);
}

const groupId = computed(() => role.value?.popBasedJustificationMetadata?.communityId ?? blankValueIndicator);

const filterDescription = computed(() => role.value?.popBasedJustificationMetadata?.filterDescription
  || session.value?.populationSummary?.filterDescription
  || '');

// Key/value pairs for the Session Context card, rendered two pairs per row
const sessionContextItems = computed(() => [
  {
    key: 'session',
    label: i18n.global.t(`${roleDetailsPage}.session`),
    value: session.value?.id || blankValueIndicator,
  },
  {
    key: 'population',
    label: i18n.global.t(`${roleDetailsPage}.population`),
    value: i18n.global.t('governance.accessModeling.populationRoleMining.sessionResultsPage.identitiesAnalysed', { count: session.value?.populationSize ?? 0 }),
  },
  {
    key: 'filter',
    label: i18n.global.t(`${roleDetailsPage}.filter`),
    value: filterDescription.value || blankValueIndicator,
  },
  {
    key: 'groupId',
    label: i18n.global.t(`${roleDetailsPage}.groupId`),
    value: groupId.value,
  },
]);

const canPublishRole = computed(() => !!permissions.value.publishRole && role.value?.status === 'candidate');

/**
 * Load the role and the session that produced it
 */
async function loadRole() {
  isLoading.value = true;
  try {
    const { data } = await getRoleMiningSessionRoles(route.params.sessionId);
    const rows = data?.result ?? (Array.isArray(data) ? data : []);
    const match = rows.map((row) => row.role ?? row).find((candidate) => candidate.id === route.params.roleId);
    if (!match) {
      showErrorMessage(new Error('role not found'), i18n.global.t('governance.accessModeling.failedGettingRoles'));
      return;
    }
    role.value = match;
    permissions.value = rows.find((row) => (row.role ?? row).id === route.params.roleId)?.permissions ?? {};
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.failedGettingRoles'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Load the producing session for the Session Context card
 */
async function loadSession() {
  try {
    const { data } = await getRoleMiningSession(route.params.sessionId);
    session.value = data;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.failedGettingSession'));
  }
}

/**
 * Create a draft governance role from this mined role, then navigate to it. The cluster
 * flow's candidateRoleId shortcut is avoided deliberately: the backend copies the whole
 * candidate onto the new draft and then rejects the population-mining fields it carries
 * (roleType, sessionId, popBasedJustificationMetadata, memberIds are not in the
 * GovernanceRoleBody schema) along with the mined entitlements string and null confidence.
 * Sending schema-conformant fields explicitly creates the draft without that copy step.
 */
async function moveToDraft() {
  isSaving.value = true;
  try {
    // Only role-defining (composition) entitlements define the draft; supporting-access
    // entitlements are informational and stay out. entitlementMetadata carries the IDs in
    // structured form; the entitlements field (an array of IDs, or a space-joined string
    // on older sessions) is the fallback.
    const compositionEntitlementIds = compositionEntitlements.value.length
      ? compositionEntitlements.value.map((entitlement) => entitlement.entId)
      : parseRoleEntitlements(role.value.entitlements);
    const { data } = await createRole({
      role: {
        name: role.value.name,
        entitlements: compositionEntitlementIds,
        // Draft members are stored as addedRoleMembers; the mined memberIds are user ids.
        // memberCount is recomputed server-side from this list, so it must not be sent.
        addedRoleMembers: role.value.memberIds ?? [],
        // confidence is optional but must be a number when present (null fails validation)
        ...(typeof role.value.confidence === 'number' ? { confidence: role.value.confidence } : {}),
      },
    });
    displayNotification('success', i18n.global.t('governance.accessModeling.draftSuccess'));
    router.push({
      name: 'AccessModelingDetails',
      params: { status: 'draft', roleId: data.role.id, tab: 'details' },
      // The draft's members came from the mined memberIds list — the members tab's
      // attribute-distribution card (computed from the justification-based distribution
      // endpoint) would show wrong/empty data for it, so the details page hides it.
      state: { hideAttributeDistribution: true },
    });
  } catch (error) {
    showErrorMessage(error, i18n.global.t('errors.savingObject', { object: i18n.global.t('common.role') }));
  } finally {
    isSaving.value = false;
  }
}

onMounted(() => {
  setBreadcrumb(
    `/access-modeling/population-role-mining/${route.params.sessionId}`,
    i18n.global.t('governance.accessModeling.populationRoleMining.sessionResultsPage.title'),
  );
  loadRole();
  loadSession();
});
</script>

<style lang="scss" scoped>
.role-type-badge {
  background-color: $gray-100;
  color: #8e248e;
}

.session-context__toggle {
  // match the ObjectProperties section header: bold dark title, no link chrome.
  // !important is required to beat .btn-link's link-color rule.
  color: $body-color !important;
  font-weight: 600;

  &:hover,
  &:focus {
    color: $body-color !important;
    text-decoration: none;
  }
}
</style>

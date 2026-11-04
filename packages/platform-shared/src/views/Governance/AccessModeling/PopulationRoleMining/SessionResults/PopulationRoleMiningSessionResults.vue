<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer fluid>
    <div class="mt-5">
      <FrSpinner
        v-if="isLoading"
        class="py-5" />
      <template v-else-if="session">
        <div class="d-flex justify-content-between align-items-start mb-4">
          <FrHeader
            :title="$t('governance.accessModeling.populationRoleMining.sessionResultsPage.title')"
            :subtitle="sessionSubtitle" />
          <BButton
            v-if="discardedRoles.length"
            variant="link"
            class="view-discarded-link p-0"
            data-testid="view-discarded-button"
            @click="showDiscarded = !showDiscarded">
            {{ showDiscarded ? $t('governance.accessModeling.populationRoleMining.sessionResultsPage.viewCandidates') : $t('governance.accessModeling.populationRoleMining.sessionResultsPage.viewDiscarded') }}
          </BButton>
        </div>
        <FrSpinner
          v-if="areRolesLoading"
          class="py-5" />
        <template v-else>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="d-flex align-items-center">
              <BBadge class="role-type-badge text-uppercase pl-2 pr-2 mr-3">
                {{ showDiscarded ? $t('governance.accessModeling.populationRoleMining.sessionResultsPage.discarded') : $t('governance.status.candidate') }}
              </BBadge>
              <h2 class="h5 mb-0">
                {{ showDiscarded ? $t('governance.accessModeling.populationRoleMining.sessionResultsPage.discardedRolesHeading') : rolesHeading }}
              </h2>
            </div>
            <span
              v-if="visibleRoles.length"
              class="text-muted"
              data-testid="roles-count">
              {{ $t('governance.accessModeling.populationRoleMining.sessionResultsPage.rolesCount', { count: visibleRoles.length }) }}
            </span>
          </div>
          <BRow v-if="visibleRoles.length">
            <BCol
              v-for="role in visibleRoles"
              :key="role.id"
              cols="12"
              md="6"
              xl="3"
              class="mb-3">
              <BCard
                class="h-100 role-card cursor-pointer hover-blue-border"
                role="button"
                tabindex="0"
                :aria-label="$t('governance.accessModeling.populationRoleMining.sessionResultsPage.viewRole', { name: roleDisplayName(role) })"
                :data-testid="`role-card-${role.id}`"
                @click="viewRole(role)"
                @keydown.enter="viewRole(role)"
                @keydown.space.prevent="viewRole(role)">
                <div class="d-flex align-items-center flex-wrap mb-2">
                  <h3 class="h6 mb-0 mr-2">
                    {{ roleDisplayName(role) }}
                  </h3>
                  <BBadge
                    v-if="confidenceLabel(role)"
                    class="pl-2 pr-2 font-weight-normal"
                    :variant="confidenceVariant(role)">
                    {{ confidenceLabel(role) }}
                  </BBadge>
                </div>
                <small class="text-muted">{{ memberText(role) }} · {{ entitlementText(role) }}</small>
              </BCard>
            </BCol>
          </BRow>
          <FrNoData
            v-else
            icon="search_off"
            :subtitle="$t('governance.accessModeling.populationRoleMining.sessionResultsPage.noRoles')" />
        </template>
      </template>
    </div>
  </BContainer>
</template>

<script setup>
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BContainer,
  BRow,
} from 'bootstrap-vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  getRoleMiningSession,
  getRoleMiningSessionRoles,
} from '@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

/**
 * Results view for a completed population-based role mining session: a card per mined role
 * showing its grouped identities, entitlement count, and confidence, plus a toggle for the
 * roles the engine discarded. Role-level review (per-role members, entitlements,
 * submit-for-creation) is a future story.
 * @component PopulationRoleMiningSessionResults
 */

const sessionResultsPage = 'governance.accessModeling.populationRoleMining.sessionResultsPage';

const route = useRoute();
const router = useRouter();
const { setBreadcrumb } = useBreadcrumb();

const session = ref(null);
const isLoading = ref(false);
const roles = ref([]);
const areRolesLoading = ref(false);
const showDiscarded = ref(false);

const sessionSubtitle = computed(() => `${i18n.global.t(`${sessionResultsPage}.identitiesAnalysed`, { count: session.value?.populationSize ?? 0 })} · ${i18n.global.t(`${sessionResultsPage}.couldNotBeGrouped`, { count: session.value?.singletonCount ?? 0 })}`);

/**
 * Whether the mining engine discarded this role instead of proposing it as a candidate.
 * Only 'candidate' has been observed so far - discarded roles are expected to arrive with a
 * 'discarded' status (the session's populationSummary.suppressedCommunities is the other
 * likely source, but its shape has not been observed yet).
 * @param {Object} role a role produced by the session
 * @returns {Boolean} true when the role was discarded
 */
function isDiscarded(role) {
  return role.status === 'discarded';
}

const discardedRoles = computed(() => roles.value.filter((role) => isDiscarded(role)));

const visibleRoles = computed(() => (showDiscarded.value
  ? discardedRoles.value
  : roles.value.filter((role) => !isDiscarded(role))));

const rolesHeading = computed(() => (session.value?.parameters?.roleType === 'birthright'
  ? i18n.global.t(`${sessionResultsPage}.birthrightRolesHeading`)
  : i18n.global.t(`${sessionResultsPage}.specializedRolesHeading`)));

/**
 * Display name for a mined role. The backend includes the member count in the name
 * itself, e.g. "Community 0 (n=10)".
 * @param {Object} role a role produced by the session
 * @returns {String} the role's name, or the blank value indicator when missing
 */
function roleDisplayName(role) {
  return role.name || blankValueIndicator;
}

/**
 * Number of identities grouped into a role
 * @param {Object} role a role produced by the session
 * @returns {Number} the role's member count
 */
function memberCount(role) {
  return role.memberCount ?? 0;
}

/**
 * Number of entitlements that make up a role
 * @param {Object} role a role produced by the session
 * @returns {Number} the role's entitlement count
 */
function entitlementCount(role) {
  return role.entitlementCount ?? 0;
}

/**
 * Confidence level ('high', 'medium', or 'low') for a role, following the backend's own
 * cohesionInterpretation bands: >= 0.7 high, >= 0.4 medium, else low.
 * @param {Object} role a role produced by the session
 * @returns {String} the level, or '' when the role has no confidence
 */
function confidenceLevel(role) {
  const { confidence } = role;
  if (confidence === null || confidence === undefined || confidence === '') return '';
  if (typeof confidence === 'number') {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  }
  return String(confidence).toLowerCase();
}

/**
 * Translated confidence label for a role.
 * @param {Object} role a role produced by the session
 * @returns {String} the translated confidence label, or '' when the role has none
 */
function confidenceLabel(role) {
  const level = confidenceLevel(role);
  const labelKeys = {
    high: `${sessionResultsPage}.highConfidence`,
    medium: `${sessionResultsPage}.mediumConfidence`,
    low: `${sessionResultsPage}.lowConfidence`,
  };
  return labelKeys[level] ? i18n.global.t(labelKeys[level]) : '';
}

/**
 * Bootstrap badge variant for a role's confidence level, matching the app's prediction
 * confidence colors: green (high), yellow (medium), red (low).
 * @param {Object} role a role produced by the session
 * @returns {String} the variant, or 'light' when the role has no confidence
 */
function confidenceVariant(role) {
  const variants = { high: 'success', medium: 'warning', low: 'danger' };
  return variants[confidenceLevel(role)] || 'light';
}

/**
 * Formatted member count for a role card's meta line
 * @param {Object} role a role produced by the session
 * @returns {String} e.g. "44 members"
 */
function memberText(role) {
  return i18n.global.t(`${sessionResultsPage}.members`, { count: memberCount(role) });
}

/**
 * Formatted entitlement count for a role card's meta line
 * @param {Object} role a role produced by the session
 * @returns {String} e.g. "1 entitlements"
 */
function entitlementText(role) {
  return i18n.global.t(`${sessionResultsPage}.entitlements`, { count: entitlementCount(role) });
}

/**
 * Navigate to a mined role's detail page
 * @param {Object} role the role whose details to open
 */
function viewRole(role) {
  router.push({
    name: 'PopulationRoleMiningRoleDetails',
    params: { sessionId: route.params.sessionId, roleId: role.id },
  });
}

/**
 * Load the session for its summary counts
 */
async function loadSession() {
  isLoading.value = true;
  try {
    const { data } = await getRoleMiningSession(route.params.sessionId);
    session.value = data;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessModeling.populationRoleMining.failedGettingSession'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Load the roles the session produced. Each result row is { role, permissions } - the
 * permissions (modifyRole/publishRole/deleteRole) will matter for the role-review story,
 * so the unwrap point is kept in one place. The backend responds 404 when a completed
 * session produced zero roles (see getRolesForSession), which is the legitimate empty
 * state, not a failure - show the empty state without an error toast.
 */
async function loadRoles() {
  areRolesLoading.value = true;
  try {
    const { data } = await getRoleMiningSessionRoles(route.params.sessionId);
    const rows = data?.result ?? (Array.isArray(data) ? data : []);
    roles.value = rows.map((row) => row.role ?? row);
  } catch (error) {
    if (error?.response?.status === 404) {
      roles.value = [];
    } else {
      showErrorMessage(error, i18n.global.t(`${sessionResultsPage}.failedGettingRoles`));
      roles.value = [];
    }
  } finally {
    areRolesLoading.value = false;
  }
}

onMounted(() => {
  setBreadcrumb('/access-modeling/population-role-mining', i18n.global.t('governance.accessModeling.populationRoleMining.title'));
  loadSession();
  loadRoles();
});
</script>

<style lang="scss" scoped>
.view-discarded-link {
  text-decoration: underline;
}

.role-card {
  border-radius: 0.75rem;
}

.role-type-badge {
  background-color: $gray-100;
  color: #8e248e;
}
</style>

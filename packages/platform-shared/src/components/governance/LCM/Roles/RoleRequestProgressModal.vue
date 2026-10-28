<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="role-request-progress-modal"
    size="lg"
    :no-close-on-backdrop="isSubmitting"
    :no-close-on-esc="isSubmitting"
    :hide-header-close="isSubmitting"
    title-class="h5"
    title-tag="h2"
    header-class="p-3"
    :static="isTesting"
    :title="$t('governance.administer.roles.requestProgress.title')"
    @hidden="$emit('close')">
    <!-- aria-live announces each step transition to screen readers -->
    <p
      class="sr-only"
      aria-live="polite"
      data-testid="progress-modal-live-region">
      {{ liveAnnouncement }}
    </p>
    <ol class="fr-request-progress list-unstyled mb-0">
      <li
        v-for="step in steps"
        :key="step.key"
        class="fr-request-progress__step"
        :class="`fr-request-progress__step--${step.state}`">
        <span class="fr-request-progress__badge">
          <FrSpinner
            v-if="step.state === 'active'"
            size="sm"
            button-spinner
            :testid="`progress-modal-spinner-${step.key}`" />
          <FrIcon
            v-else-if="step.state === 'done'"
            name="check_circle"
            icon-class="fr-request-progress__icon fr-request-progress__icon--done md-24" />
          <FrIcon
            v-else-if="step.state === 'error'"
            name="cancel"
            icon-class="fr-request-progress__icon fr-request-progress__icon--error md-24" />
          <span
            v-else
            class="fr-request-progress__circle" />
        </span>
        <span class="fr-request-progress__body">
          <span class="fr-request-progress__label">
            {{ step.label }}
            <span
              v-if="step.note"
              class="fr-request-progress__note"
              :class="{ 'fr-request-progress__note--error': step.state === 'error' }"
              :data-testid="`progress-modal-note-${step.key}`">
              — {{ step.note }}
            </span>
          </span>
        </span>
      </li>
    </ol>
    <!-- Similar-roles review card, shown after the check finds matches -->
    <BCard
      v-if="similarRoles.length"
      class="fr-request-progress__review-card"
      no-body
      data-testid="progress-modal-similar-roles-card">
      <BCardHeader class="fr-request-progress__review-header">
        <span class="fr-request-progress__review-title">
          {{ $t('governance.administer.roles.requestProgress.similarRolesCount', { count: similarRoles.length }) }}
        </span>
        <BButton
          variant="link"
          class="p-0"
          :aria-expanded="showSimilarRoles ? 'true' : 'false'"
          aria-controls="progress-modal-similar-roles-body"
          data-testid="progress-modal-toggle-similar-button"
          @click="toggleSimilarRoles">
          {{ showSimilarRoles
            ? $t('governance.administer.roles.requestProgress.hideSimilarRoles')
            : $t('governance.administer.roles.requestProgress.viewSimilarRoles') }}
        </BButton>
      </BCardHeader>
      <BCardBody
        v-if="showSimilarRoles"
        id="progress-modal-similar-roles-body">
        <BTable
          :items="rolesToDisplay"
          :fields="similarRolesFields"
          hover
          responsive>
          <template #cell(name)="{ item }">
            <div class="h5 mb-0">
              {{ item.name || blankValueIndicator }}
            </div>
          </template>
          <template #cell(status)="{ item }">
            <BBadge :variant="item.status ? getRoleStatusVariant(item.status) : 'light'">
              {{ item.status || blankValueIndicator }}
            </BBadge>
          </template>
          <template #cell(similarity)="{ item }">
            {{ $t('governance.administer.roles.similarRoles.similarityPercent', { percent: round((item.jaccard ?? 0) * 100, 0) }) }}
          </template>
          <template #cell(sharedEntitlements)="{ item }">
            {{ $t('governance.administer.roles.similarRoles.sharedEntitlements', { count: item.totalShared || 0 }) }}
          </template>
        </BTable>
        <div
          v-if="similarRoles.length > initialResultsLimit"
          class="d-flex justify-content-end">
          <BButton
            variant="link"
            class="p-0"
            :aria-expanded="showAllResults ? 'true' : 'false'"
            aria-controls="progress-modal-similar-rows-extra"
            data-testid="progress-modal-show-more-button"
            @click="showAllResults = !showAllResults">
            {{ showAllResults
              ? $t('governance.administer.roles.similarRoles.showLess')
              : $t('governance.administer.roles.similarRoles.showMore', { count: similarRoles.length - initialResultsLimit }) }}
          </BButton>
        </div>
      </BCardBody>
    </BCard>
    <p
      v-if="outcome"
      class="mt-3 mb-0 p-3 rounded"
      :class="outcome === 'success' ? 'fr-request-progress__banner--success' : 'fr-request-progress__banner--error'"
      data-testid="progress-modal-banner">
      {{ outcomeMessage }}
    </p>
    <template #modal-footer>
      <template v-if="outcome === 'success'">
        <BButton
          variant="primary"
          data-testid="progress-modal-done-button"
          @click="$emit('close')">
          {{ $t('common.done') }}
        </BButton>
      </template>
      <template v-else-if="outcome === 'error'">
        <BButton
          variant="outline-secondary"
          data-testid="progress-modal-cancel-button"
          @click="$emit('close')">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          data-testid="progress-modal-retry-button"
          @click="$emit('retry')">
          {{ $t('governance.administer.roles.requestProgress.retry') }}
        </BButton>
      </template>
      <template v-else-if="canContinue">
        <BButton
          variant="outline-secondary"
          :disabled="isSubmitting"
          data-testid="progress-modal-cancel-button"
          @click="$emit('close')">
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          variant="primary"
          :disabled="isSubmitting"
          data-testid="progress-modal-continue-button"
          @click="$emit('continue')">
          {{ $t('common.submit') }}
        </BButton>
      </template>
      <template v-else>
        <!-- Steps running: a cancel path while no submission is in flight, so a
        hung similarity call can't trap the user in the modal -->
        <BButton
          variant="outline-secondary"
          data-testid="progress-modal-cancel-button"
          @click="$emit('close')">
          {{ $t('common.cancel') }}
        </BButton>
      </template>
    </template>
  </BModal>
</template>

<script setup>
/**
 * Progress modal shown while a role save runs its steps: the similarity check
 * followed by the request submission. Each step shows a live state
 * (pending/active/done/error) with a result note. When the check finds similar
 * roles, a review table is shown expanded by default (collapsible via the
 * card header toggle) with the Submit button in the footer. On success the
 * parent proceeds to the request-submitted modal; on error the user can retry
 * the failed step.
 * @component RoleRequestProgressModal
 * @prop {Object} stepState - State machine for the two steps:
 *   { similarity: { state: 'pending'|'active'|'done'|'error', note: String },
 *     submit: { state: 'pending'|'active'|'done'|'error', note: String } }
 * @prop {Array} similarRoles - Roles found by the similarity check, shown in the
 *   expandable review table under the similarity step.
 * @prop {String} outcome - '' while running, 'success' or 'error' when finished.
 * @prop {Boolean} isSubmitting - Whether the request submission call is in
 *   flight; disables the footer buttons and the modal's Esc/backdrop/header
 *   close to prevent dismissing a half-submitted request.
 * @prop {Boolean} canContinue - Whether to show the Submit footer button
 *   (similarity check passed and the request is waiting to be submitted).
 * @prop {Boolean} isTesting - Renders the modal statically for unit testing.
 * @emits close - The user dismissed the modal (Done or Cancel).
 * @emits retry - The user asked to retry the failed step.
 * @emits continue - The user reviewed the similar roles and wants to submit.
 */
import {
  computed,
  ref,
} from 'vue';
import {
  BBadge,
  BButton,
  BCard,
  BCardBody,
  BCardHeader,
  BModal,
  BTable,
} from 'bootstrap-vue';
import { round } from 'lodash';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getRoleStatusVariant } from '@forgerock/platform-shared/src/utils/governance/accessModeling';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import i18n from '@/i18n';

const props = defineProps({
  stepState: {
    type: Object,
    default: () => ({
      similarity: { state: 'pending', note: '' },
      submit: { state: 'pending', note: '' },
    }),
  },
  similarRoles: {
    type: Array,
    default: () => [],
  },
  outcome: {
    type: String,
    default: '',
  },
  canContinue: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['close', 'retry', 'continue']);

// Number of similar roles shown in the review table before the "Show x additional roles" toggle appears
const initialResultsLimit = 5;
const showAllResults = ref(false);
// The review table is expanded by default so the similar roles are visible
// immediately; the user can collapse it via the header toggle
const showSimilarRoles = ref(true);
const rolesToDisplay = computed(() => (showAllResults.value
  ? props.similarRoles
  : props.similarRoles.slice(0, initialResultsLimit)));

/**
 * Expand/collapse the similar-roles review table.
 */
function toggleSimilarRoles() {
  showSimilarRoles.value = !showSimilarRoles.value;
}

const steps = computed(() => [
  {
    key: 'similarity',
    label: i18n.global.t('governance.administer.roles.requestProgress.stepSimilarity'),
    state: props.stepState.similarity.state,
    note: props.stepState.similarity.note,
  },
  {
    key: 'submit',
    label: i18n.global.t('governance.administer.roles.requestProgress.stepSubmit'),
    state: props.stepState.submit.state,
    note: props.stepState.submit.note,
  },
]);

const liveAnnouncement = computed(() => {
  const { similarity, submit } = props.stepState;
  if (props.outcome === 'success') {
    return i18n.global.t('governance.administer.roles.requestProgress.announceSubmitted');
  }
  if (similarity.state === 'active') {
    return i18n.global.t('governance.administer.roles.requestProgress.stepSimilarity');
  }
  if (similarity.state === 'done' && submit.state === 'active') {
    return i18n.global.t('governance.administer.roles.requestProgress.announceSubmitting');
  }
  if (props.outcome === 'error') {
    return i18n.global.t('governance.administer.roles.requestProgress.announceError');
  }
  return '';
});

const outcomeMessage = computed(() => {
  if (props.outcome === 'success') {
    return i18n.global.t('governance.administer.roles.requestProgress.successBanner');
  }
  if (props.stepState.similarity.state === 'error') {
    return i18n.global.t('governance.administer.roles.requestProgress.errorSimilarityBanner');
  }
  return i18n.global.t('governance.administer.roles.requestProgress.errorSubmitBanner');
});

const similarRolesFields = [
  {
    key: 'name',
    label: i18n.global.t('common.name'),
    sortable: true,
  },
  {
    key: 'status',
    label: i18n.global.t('common.status'),
  },
  {
    key: 'similarity',
    label: i18n.global.t('governance.administer.roles.similarRoles.similarity'),
  },
  {
    key: 'sharedEntitlements',
    label: i18n.global.t('governance.administer.roles.similarRoles.sharedEntitlementsLabel'),
  },
];
</script>

<style lang="scss" scoped>
.fr-request-progress {
  &__step {
    display: flex;
    align-items: flex-start;
    padding: 0.5rem 0;

    // Vertical connector rail between consecutive step badges
    &:not(:last-child) .fr-request-progress__badge {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        width: 2px;
        height: 1rem;
        transform: translateX(-50%);
        background-color: $gray-300;
      }
    }
  }

  &__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  &__circle {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px dashed $gray-500;
    border-radius: 50%;
  }

  &__icon {
    &--done {
      color: $success;
    }

    &--error {
      color: $danger;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-weight: 500;
  }

  // Pending steps are muted until they activate
  &__step--pending &__label {
    color: $gray-600;
    font-weight: 400;
  }

  // Success/danger text uses Bootstrap's alert text mechanism (theme-color-level
  // 6, mixed toward black): the raw theme colors fail WCAG AA on white and on
  // their 10% tint backgrounds (green ~1.9:1, red ~3.0:1).
  &__note {
    font-size: 0.875rem;
    font-weight: 400;
    color: theme-color-level('success', 6);

    &--error {
      color: theme-color-level('danger', 6);
    }
  }

  // Similar-roles review card below the step list
  &__review-card {
    margin-top: 0.75rem;
  }

  &__review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background-color: $gray-100;
  }

  &__review-title {
    font-weight: 500;
  }

  &__banner--success {
    background-color: rgba($success, 0.1);
    color: theme-color-level('success', 6);
  }

  &__banner--error {
    background-color: rgba($danger, 0.1);
    color: theme-color-level('danger', 6);
  }
}
</style>

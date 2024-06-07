<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <template v-if="!isLoading">
      <!-- Header -->
      <h2 class="h5 text-muted mb-2">
        {{ $t('governance.violations.violation') }}
      </h2>
      <h1 :class="[hideActions ? 'mb-4' : 'mb-2']">
        {{ violation.policyRule.name }}
      </h1>

      <!-- Actions -->
      <div
        v-if="!hideActions"
        class="mb-4">
        <template v-if="!isAdmin">
          <BButton
            @click="bvModal.show('ExceptionModal')"
            class="mr-1"
            variant="outline-secondary">
            <FrIcon
              icon-class="mr-2 text-success"
              :name="componentActions.allowIcon">
              {{ componentActions.allowTitle }}
            </FrIcon>
          </BButton>
          <BButton
            @click="componentActions.revokeAction"
            class="mr-1"
            variant="outline-secondary">
            <FrIcon
              icon-class="mr-2 text-danger"
              name="block">
              {{ componentActions.revokeTitle }}
            </FrIcon>
          </BButton>
        </template>
        <BButton
          v-if="violation?.decision?.status !== 'pending'"
          @click="openForwardModal"
          class="mr-1"
          variant="outline-secondary">
          <FrIcon
            icon-class="mr-2"
            name="redo">
            {{ $t('common.forward') }}
          </FrIcon>
        </BButton>
      </div>

      <!-- Details -->
      <BCard no-body>
        <div class="card-tabs-vertical">
          <BTabs
            v-model="tabIndex"
            class="w-100"
            pills
            vertical>
            <BTab :title="$t('common.details')">
              <BCardBody>
                <FrViolationDetails
                  @view-conflicts="(isAdmin || hideActions) ? openConflictModal() : $emit('revoke-violation', violation)"
                  :violation="violation" />
              </BCardBody>
            </BTab>
            <BTab :title="$t('common.activity')">
              <FrViolationActivity
                :violation="violation" />
            </BTab>
            <BTab :title="$t('common.comments')">
              <FrComments
                @add-comment="openCommentModal"
                :hide-actions="hideActions"
                :item="item" />
            </BTab>
          </BTabs>
        </div>
      </BCard>
    </template>

    <!-- Comment Modal -->
    <VeeForm
      v-slot="{ meta: { valid } }"
      as="span">
      <BModal
        cancel-variant="link"
        id="add-comment-modal"
        no-close-on-backdrop
        no-close-on-esc
        ok-variant="primary"
        size="lg"
        title-class="h5"
        title-tag="h2"
        @ok="addComment"
        :ok-disabled="!valid"
        :ok-title="$t('governance.violations.addComment')"
        :title="$t('governance.violations.addComment')">
        <FrField
          v-model="comment"
          :label="$t('common.comment')"
          name="comment"
          type="textarea"
          validation="required" />
      </BModal>
    </VeeForm>

    <!-- Forward Modal -->
    <FrViolationForwardModal
      :is-testing="isTesting"
      @forward-item="forwardItem" />

    <!-- Conflict modal -->
    <FrViolationConflictModal
      :violation="violation" />

    <ExceptionModal
      hide-details
      :violation="{...violation, phaseId}"
      :extend-exception="isEnduserException"
      @action="extendException" />

    <FrRevokeExceptionModal
      @revoke="revoke"
      :violation-id="violationId" />
  </BContainer>
</template>

<script setup>
/**
 * View that shows the details of a single violation contains three tabs
 * one for general details, one for the activity history, and one for comments.
 * Can also perform actions on the violation
 */
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Form as VeeForm } from 'vee-validate';
import {
  BButton,
  BCard,
  BCardBody,
  BContainer,
  BModal,
  BTab,
  BTabs,
} from 'bootstrap-vue';
import {
  allowException,
  commentViolation,
  forwardViolation,
  getViolation,
  revokeException,
} from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrComments from '@forgerock/platform-shared/src/components/governance/RequestDetails/Comments';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import ExceptionModal from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionModal';
import FrRevokeExceptionModal from '@forgerock/platform-shared/src/components/governance/Exceptions/RevokeExceptionModal';
import FrViolationActivity from './ViolationActivity';
import FrViolationConflictModal from '../ViolationConflictModal';
import FrViolationDetails from './ViolationDetails';
import FrViolationForwardModal from '../ViolationForwardModal';
import i18n from '@/i18n';
import store from '@/store';

// composables
const route = useRoute();
const router = useRouter();
const { bvModal } = useBvModal();
const { setBreadcrumb } = useBreadcrumb();

// props
const props = defineProps({
  breadcrumbPath: {
    type: String,
    required: true,
  },
  breadcrumbTitle: {
    type: String,
    required: true,
  },
  isEnduserException: {
    type: Boolean,
    default: false,
  },
  isException: {
    type: Boolean,
    default: false,
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(['view-conflicts', 'revoke-violation']);

// data
const { violationId } = route.params;
const violation = ref({});
const comment = ref('');
const isLoading = ref(true);
const tabIndex = ref(0);

const item = computed(() => ({ rawData: { decision: { comments: violation?.value?.decision?.comments || [] } } }));

// Actions should be hidden for complete violations and violations with no phase
const hideActions = computed(() => {
  if (
    !violation?.value?.decision?.phases?.length
    || violation?.value?.decision?.status === 'complete'
  ) return true;
  return false;
});
const phaseId = computed(() => {
  if (!violation?.value?.decision?.phases?.length) return '';
  return violation.value.decision.phases[0].name;
});

const actionPermissions = computed(() => {
  let permissions = violation?.value?.decision?.actors?.active?.[0]?.permissions || null;
  if (!permissions) {
    permissions = {
      allow: false,
      comment: false,
      exception: false,
      reassign: false,
      remediate: false,
    };
  }
  return permissions;
});

function showRevokeExceptionModal() {
  bvModal.value.show('RevokeExceptionModal');
}

const componentActions = computed(() => {
  if (props.isAdmin) {
    return {};
  }

  const violationActionsObject = {
    allowTitle: i18n.global.t('common.allow'),
    allowIcon: 'check',
    revokeTitle: i18n.global.t('common.revoke'),
    revokeAction: () => emit('revoke-violation', violation.value),
  };
  const exceptionActionsObject = {
    allowTitle: i18n.global.t('governance.certificationTask.actions.extendException'),
    allowIcon: 'update',
    revokeTitle: i18n.global.t('governance.certificationTask.actions.revokeException'),
    revokeAction: showRevokeExceptionModal,
  };

  return props.isEnduserException ? exceptionActionsObject : violationActionsObject;
});

/**
 * Get data of a single violation
 */
async function getViolationData() {
  isLoading.value = true;
  try {
    const { data } = await getViolation(violationId);
    violation.value = data;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorGettingViolation'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Add a comment on a violation
 */
async function addComment() {
  try {
    const { data } = await commentViolation(violationId, phaseId.value, comment.value);
    violation.value = data;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorCommentingViolation'));
  }
}

/**
 * Forward a violation to a new user, with an optional comment
 * @param {String} actorId actor to forward to
 * @param {String} comment comment
 */
async function forwardItem({ actorId, comment: forwardComment }) {
  try {
    await forwardViolation(violationId, phaseId.value, actorId, actionPermissions.value, forwardComment);
    store.commit('setViolationsCount', store.state.violationsCount - 1);
    displayNotification('success', i18n.global.t('governance.violations.successForwardingViolation'));
    router.push({ path: props.breadcrumbPath });
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorForwardingViolation'));
  }
}

/**
 * Open the comment modal
 */
function openCommentModal() {
  bvModal.value.show('add-comment-modal');
}

/**
 * Open the forward modal
 */
function openForwardModal() {
  bvModal.value.show('violation-forward-modal');
}

/**
 * Open the conflict modal
 */
function openConflictModal() {
  if (props.isAdmin || hideActions.value) {
    bvModal.value.show('violation-conflicts-modal');
  } else {
    emit('view-conflicts');
  }
}

/**
 * Update the page size and call to get updated data
 * @param {Object} actionObject Object with call data
 * @param {String} actionObject.violationId violation id
 * @param {String} actionObject.phaseId phase id
 * @param {Object} payload Request payload
 */
async function extendException({ violationId: exceptionViolationId, phaseId: exceptionPhaseId, payload }) {
  const translates = props.isEnduserException
    ? {
      success: 'successExtendingException',
      error: 'errorExtendingException',
    }
    : {
      success: 'successAllowingException',
      error: 'errorAllowingException',
    };
  try {
    await allowException(exceptionViolationId, exceptionPhaseId, payload);
    // if the violation is allowed forever, it will be removed from the list
    if (!payload.exceptionExpirationDate) {
      store.commit('setViolationsCount', store.state.violationsCount - 1);
    }
    displayNotification('success', i18n.global.t(`governance.violations.${translates.success}`));
    router.push({ path: props.breadcrumbPath });
  } catch (error) {
    showErrorMessage(error, i18n.global.t(`governance.violations.${translates.error}`));
  }
}

/**
 * Revoke the Exception and redirect to the previous view
 * @param {Object} revokeObject exception object that is being revoked
 * @param {String[]} revokeObject.ids ids to be revoked
 * @param {String} revokeObject.comment comment on the revocation
 */
async function revoke(revokeObject) {
  try {
    await revokeException(revokeObject);
    displayNotification('success', i18n.global.t('governance.violations.successRevokingException'));
    router.push({ path: props.breadcrumbPath });
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorRevokingException'));
  }
}

onMounted(async () => {
  setBreadcrumb(props.breadcrumbPath, props.breadcrumbTitle);
  await getViolationData();
});

</script>

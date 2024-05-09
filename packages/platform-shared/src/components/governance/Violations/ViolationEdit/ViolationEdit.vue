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
              name="check">
              {{ $t('common.allow') }}
            </FrIcon>
          </BButton>
          <BButton
            @click="() => {}"
            class="mr-1"
            variant="outline-secondary">
            <FrIcon
              icon-class="mr-2 text-danger"
              name="block">
              {{ $t('common.revoke') }}
            </FrIcon>
          </BButton>
        </template>
        <BButton
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
                  @view-conflicts="openConflictModal"
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
      @action="extendException" />
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
  commentViolation,
  forwardViolation,
  getViolation,
  allowException,
} from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import FrComments from '@forgerock/platform-shared/src/components/governance/RequestDetails/Comments';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import ExceptionModal from '@forgerock/platform-shared/src/components/governance/Exceptions/ExceptionModal';
import FrViolationActivity from './ViolationActivity';
import FrViolationConflictModal from '../ViolationConflictModal';
import FrViolationDetails from './ViolationDetails';
import FrViolationForwardModal from '../ViolationForwardModal';
import i18n from '@/i18n';

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
const emit = defineEmits(['view-conflicts']);

// data
const { violationId } = route.params;
const violation = ref({});
const comment = ref('');
const isLoading = ref(true);
const tabIndex = ref(0);

const item = computed(() => ({ rawData: { decision: { comments: violation?.value?.decision?.comments || [] } } }));
const hideActions = computed(() => {
  if (!violation?.value?.decision?.phases?.length || props.isException) return true;
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
async function forwardItem({ actorId, forwardComment }) {
  try {
    await forwardViolation(violationId, phaseId.value, actorId, actionPermissions.value, forwardComment);
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
  if (props.isAdmin) {
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
  try {
    await allowException(exceptionViolationId, exceptionPhaseId, payload);
    displayNotification('success', i18n.global.t('governance.violations.successAllowingException'));
    router.push({ path: props.breadcrumbPath });
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.violations.errorAllowingException'));
  }
}

onMounted(async () => {
  setBreadcrumb(props.breadcrumbPath, props.breadcrumbTitle);
  await getViolationData();
});

</script>
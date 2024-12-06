<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    :footer-class="footerClass"
    content-class="border-0"
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    scrollable
    size="lg"
    @hidden="reset">
    <template #modal-header="{ close }">
      <BButton
        variant="link"
        class="p-0 pt-1"
        @click="closeModal">
        <FrIcon
          icon-class="md-24 mr-3 text-muted"
          name="arrow_back" />
      </BButton>
      <h5 class="modal-title">
        {{ $t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.title') }}
      </h5>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>
    <div class="p-4">
      <div v-if="reviewer">
        <p class="mb-2">
          {{ $t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.reviewerLabel') }}
        </p>
        <BCard
          class="shadow-none mb-4"
          no-body>
          <BCardBody class="p-3">
            <BMedia
              v-if="reviewerType === ResourceType.USER"
              no-body>
              <BMediaAside vertical-align="center">
                <BImg
                  class="rounded-circle"
                  height="36"
                  width="36"
                  :alt="reviewer.givenName"
                  :aria-hidden="true"
                  :src="reviewer.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
              </BMediaAside>
              <BMediaBody class="text-truncate">
                <h5 class="mb-0 text-truncate">
                  {{ reviewer.givenName + ' ' + reviewer.sn }}
                </h5>
                <small class="text-muted text-truncate">
                  {{ reviewer.userName }}
                </small>
              </BMediaBody>
            </BMedia>
            <BMedia
              v-else
              no-body>
              <BMediaAside vertical-align="center">
                <div class="rounded-circle d-flex align-items-center justify-content-center bg-lightblue text-primary wh-36px">
                  <FrIcon
                    name="assignment_ind"
                    icon-class="md-15" />
                </div>
              </BMediaAside>
              <BMediaBody class="text-truncate">
                <h5 class="mb-0 text-truncate">
                  {{ reviewer.name }}
                </h5>
                <small class="text-muted text-truncate">
                  {{ $t('governance.certificationTask.lineItemReviewersModal.role') }}
                </small>
              </BMediaBody>
            </BMedia>
          </BCardBody>
        </BCard>
      </div>
      <div v-else>
        <FrForwardModalContent
          :description-text="$t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.description')"
          :show-comment-field="false"
          @resource-info="selectedReviewer = $event"
          @request-update-actors="reviewerIdSelected = $event" />
      </div>
      <p class="mb-2">
        {{ $t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.permissionsLabel') }}
      </p>
      <FrField
        v-for="([key], index) in Object.entries(permissions)"
        :key="index"
        class="mb-3"
        v-model="permissions[key]"
        type="checkbox"
        :disabled="disabledField(key)"
        :label="$t(`governance.certificationTask.lineItemReviewersModal.editReviewerModal.permissionLabels.${key}`)" />
    </div>
    <template #modal-footer>
      <FrButtonWithSpinner
        v-if="isAllowedDeletion && !permissionOwnedByCurrentUser"
        :button-text="$t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.removeReviewerButtonText')"
        :disabled="isDeleting"
        :show-spinner="isDeleting"
        :spinner-text="$t('common.deleting')"
        :icon="'delete'"
        :icon-class="'md-15 mr-2'"
        variant="outline-danger"
        @click="deleteReviewer" />
      <div>
        <BButton
          variant="link"
          @click="closeModal">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          v-if="!permissionOwnedByCurrentUser"
          :button-text="!reviewer ? $t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.addReviewerButtonText') : $t('common.save')"
          :disabled="(!reviewer && !reviewerIdSelected) || isSaving"
          :show-spinner="isSaving"
          :spinner-text="$t('common.saving')"
          variant="primary"
          @click="editReviewer" />
      </div>
    </template>
  </BModal>
</template>

<script>
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import {
  BButton,
  BButtonClose,
  BCard,
  BCardBody,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BModal,
} from 'bootstrap-vue';
import {
  includes,
} from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrForwardModalContent from '@forgerock/platform-shared/src/views/Governance/ForwardModalContent';
import { ResourceType } from '@forgerock/platform-shared/src/utils/governance/types';
import FrField from '@forgerock/platform-shared/src/components/Field';

const DEFAULT_PERMISSIONS = {
  decide: true,
  comment: true,
  forward: true,
  signoff: true,
};
const PERMISSIONS_MAP = {
  decide: ['certify', 'revoke', 'exception', 'reset'],
  comment: ['comment'],
  forward: ['reassign', 'forward'],
  signoff: ['signoff'],
};

export default {
  name: 'EditReviewerModal',
  components: {
    BButton,
    BButtonClose,
    BCard,
    BCardBody,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BModal,
    FrButtonWithSpinner,
    FrIcon,
    FrField,
    FrForwardModalContent,
  },
  props: {
    reviewer: {
      type: Object,
      default: null,
    },
    isSaving: {
      type: Boolean,
      defaul: false,
    },
    isAllowedDeletion: {
      type: Boolean,
      default: false,
    },
    isDeleting: {
      type: Boolean,
      default: false,
    },
    modalId: {
      type: String,
      default: 'CertificationTaskEditReviewerAccountModal',
    },
    currentUserPermissions: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      reviewerType: ResourceType.USER,
      reviewerIdSelected: null,
      ResourceType,
      permissions: { ...DEFAULT_PERMISSIONS },
      selectedReviewer: null,
      currentUserMappedPermissions: {},
    };
  },
  methods: {
    closeModal() {
      this.$emit('close-modal');
    },
    editReviewer() {
      if (this.permissionOwnedByCurrentUser) return;
      const mappedPermissions = Object.entries(this.permissions).reduce((acc, [key, value]) => ({
        ...acc,
        ...Object.fromEntries(PERMISSIONS_MAP[key].map((permission) => [permission, value])),
      }), this.reviewer ? this.reviewer.permissions : {});
      this.$emit('edit-reviewer', this.reviewer ? this.reviewer.id : this.reviewerIdSelected, mappedPermissions, this.selectedReviewer);
    },
    deleteReviewer() {
      if (this.permissionOwnedByCurrentUser) return;
      this.$emit('delete-reviewer', this.reviewer.id, true);
    },
    reset() {
      this.reviewerType = ResourceType.USER;
      this.reviewerIdSelected = null;
      this.permissions = { ...DEFAULT_PERMISSIONS };
      this.selectedReviewer = null;
    },
    disabledField(key) {
      return (this.reviewer && !this.isAllowedDeletion && key === 'signoff') || this.permissionOwnedByCurrentUser || !this.currentUserMappedPermissions[key];
    },
    /**
     * maps the permissions received as parameter to decide, comment, forward, signoff permissions according with the
     * PERMISSIONS_MAP constant.
     * This method reduces the PERMISSIONS_MAP constant according to the permissions passed as parameter to obtain
     * a permission object to show in the view just with four attributes (decide, comment, forward, signoff ).
     * The callback function passed to the reduce iterates each item in the PERMISSIONS_MAP an assign the
     * permission to an accumulator object (permissionsAccumulator) that finally contains the new object
     * @param {Object} permissions - object with the permissions, each attribute represents a permission with value true or false
     */
    getMappedPermissions(permissions) {
      return Object.entries(PERMISSIONS_MAP).reduce((permissionsAccumulator, [permissionGroup, permissionsInGroup]) => {
        // just validate the first permission in the group, it is not possible to assign permissions in the group separately at this time.
        permissionsAccumulator[permissionGroup] = !!permissions[permissionsInGroup[0]];
        return permissionsAccumulator;
      }, {});
    },
  },
  watch: {
    reviewer(newReviewer) {
      if (!newReviewer) {
        // if is creating a new reviewer returns the permissions allowed according the current user permissions
        this.permissions = this.getMappedPermissions(this.currentUserPermissions);
        this.reviewerType = ResourceType.USER;
      } else {
        // if is editing a reviewer return the permissions related to that reviewer
        this.permissions = this.getMappedPermissions(newReviewer.permissions);
        [, this.reviewerType] = newReviewer.id.split('/');
      }
    },
    currentUserPermissions(permissions) {
      if (!this.reviewer) {
        // if no reviewer is selected that means that is a reviewer creation, the permissions shown for this case are
        // the same permissions of the current user logged in
        this.permissions = this.getMappedPermissions(permissions);
      }
      this.currentUserMappedPermissions = this.getMappedPermissions(permissions);
    },
  },
  computed: {
    footerClass() {
      return this.isAllowedDeletion ? 'justify-content-between' : '';
    },
    ...mapState(useUserStore, ['userId']),
    /**
     * returns true if the logged in user is editing his own permissions
     */
    permissionOwnedByCurrentUser() {
      return includes(this.reviewer?.id, this.userId);
    },
  },
};
</script>

<style lang="scss" scoped>
.wh-36px {
  width: 36px;
  height: 36px;
}
.nav-link {
  color: $gray-800;
}
</style>

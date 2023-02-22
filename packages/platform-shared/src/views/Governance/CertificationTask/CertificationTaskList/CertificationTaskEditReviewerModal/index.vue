<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    :footer-class="footerClass"
    content-class="border-0"
    id="CertificationTaskEditReviewerModal"
    no-close-on-backdrop
    no-close-on-esc
    scrollable
    size="lg"
    @hidden="reset">
    <template #modal-header="{ close }">
      <a
        href="#"
        class="nav-link pl-0"
        @click="closeModal">
        <FrIcon
          class="md-24 mr-3"
          name="arrow_back" />
      </a>
      <h5 class="modal-title">
        {{ $t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.title') }}
      </h5>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          class="md-24" />
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
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center bg-lightblue text-primary wh-36px">
                  <FrIcon
                    name="assignment_ind"
                    class="md-15" />
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
        <p class="mb-4">
          {{ $t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.description') }}
        </p>
        <BFormRadioGroup
          class="mb-4"
          v-model="reviewerType"
          :options="reviewerOptions" />
        <FrGovResourceSelect
          class="mb-5"
          v-model="reviewerIdSelected"
          :resource-path="reviewerType"
          :label="resourceSelectLabel"
          :description="resourceSelectDescription"
          validation="required"
          @get-user-info="setSelectedReviewer"
          @get-role-info="setSelectedReviewer" />
      </div>
      <p class="mb-2">
        {{ $t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.permissionsLabel') }}
      </p>
      <FrField
        v-for="([key, value], index) in Object.entries(permissions)"
        :key="index"
        class="mb-3"
        v-model="permissions[key]"
        type="checkbox"
        :disabled="reviewer && !isAllowedDeletion && key === 'signoff'"
        :label="$t(`governance.certificationTask.lineItemReviewersModal.editReviewerModal.permissionLabels.${key}`)" />
    </div>
    <template #modal-footer>
      <FrButtonWithSpinner
        v-if="isAllowedDeletion"
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
import {
  BButtonClose,
  BModal,
  BButton,
  BFormRadioGroup,
  BCard,
  BCardBody,
  BMedia,
  BMediaAside,
  BMediaBody,
  BImg,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import { ResourceType } from '@forgerock/platform-shared/src/utils/governanceTypes';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/filterBuilder/components/GovResourceSelect';
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
    BButtonClose,
    BModal,
    FrIcon,
    BButton,
    FrButtonWithSpinner,
    BFormRadioGroup,
    FrGovResourceSelect,
    FrField,
    BCard,
    BCardBody,
    BMedia,
    BMediaAside,
    BMediaBody,
    BImg,
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
  },
  data() {
    return {
      reviewerType: ResourceType.USER,
      reviewerOptions: [
        { text: this.$t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.addUserLabel'), value: ResourceType.USER },
        { text: this.$t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.addRoleLabel'), value: ResourceType.ROLE },
      ],
      reviewerIdSelected: null,
      ResourceType,
      permissions: { ...DEFAULT_PERMISSIONS },
      selectedReviewer: null,
      resourceSelectLabel: this.$t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.chooseUserLabel'),
      resourceSelectDescription: this.$t('governance.certificationTask.lineItemReviewersModal.editReviewerModal.chooseUserDescription'),
    };
  },
  methods: {
    closeModal() {
      this.$emit('close-modal');
    },
    editReviewer() {
      const mappedPermissions = Object.entries(this.permissions).reduce((acc, [key, value]) => ({
        ...acc,
        ...Object.fromEntries(PERMISSIONS_MAP[key].map((permission) => [permission, value])),
      }), this.reviewer ? this.reviewer.permissions : {});
      this.$emit('edit-reviewer', this.reviewer ? this.reviewer.id : this.reviewerIdSelected, mappedPermissions, this.selectedReviewer);
    },
    deleteReviewer() {
      this.$emit('delete-reviewer', this.reviewer.id, true);
    },
    setSelectedReviewer(resource) {
      this.selectedReviewer = resource;
    },
    reset() {
      this.reviewerType = ResourceType.USER;
      this.reviewerIdSelected = null;
      this.permissions = { ...DEFAULT_PERMISSIONS };
      this.selectedReviewer = null;
    },
  },
  watch: {
    reviewer(newReviewer) {
      if (!newReviewer) {
        this.permissions = {
          ...DEFAULT_PERMISSIONS,
        };
        this.reviewerType = ResourceType.USER;
      } else {
        this.permissions = Object.entries(PERMISSIONS_MAP).reduce((acc, [key, value]) => {
          for (let i = 0; i < value.length; i += 1) {
            acc[key] = !!newReviewer.permissions[value[i]];
            break;
          }
          return acc;
        }, {});
        [, this.reviewerType] = newReviewer.id.split('/');
      }
    },
    reviewerType(newReviewerType) {
      this.resourceSelectLabel = this.$t(`governance.certificationTask.lineItemReviewersModal.editReviewerModal.${newReviewerType === ResourceType.USER ? 'chooseUserLabel' : 'chooseRoleLabel'}`);
      this.resourceSelectDescription = this.$t(`governance.certificationTask.lineItemReviewersModal.editReviewerModal.${newReviewerType === ResourceType.USER ? 'chooseUserDescription' : 'chooseRoleDescription'}`);
    },
  },
  computed: {
    footerClass() {
      return this.isAllowedDeletion ? 'justify-content-between' : '';
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

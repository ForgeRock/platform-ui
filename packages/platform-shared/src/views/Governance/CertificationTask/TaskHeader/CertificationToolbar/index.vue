<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrNavbar
      hide-dropdown
      hide-toggle
      :show-docs-link="false"
      :show-help-link="false"
      :show-profile-link="false">
      <template #center-content>
        <h4>
          <span>{{ campaignDetails.name }}</span>
        </h4>
      </template>
      <template
        v-if="!hideSignOff"
        #right-content>
        <div
          v-if="!isSaving && !firstLoad"
          class="d-flex m-2">
          <FrIcon
            icon-class="mr-2 color-green"
            name="check">
            <span class="text-muted">
              {{ $t('governance.certificationTask.allChangesSaved') }}
            </span>
          </FrIcon>
        </div>
        <FrSpinner
          v-if="isSaving"
          :button-spinner="isSaving"
          :name="$t('governance.certificationTask.isSaving')"
          class="mr-3 text-primary"
          size="sm" />
        <div
          v-if="isSaving"
          class="media-body mr-3"
          v-html="$t('governance.certificationTask.isSaving')" />
        <BButton
          data-testid="signoff-button"
          variant="primary"
          :disabled="disableSignoff"
          @click="$emit('sign-off')">
          {{ $t('governance.certificationTask.signOff') }}
        </BButton>
        <BDropdown
          v-if="campaignDetails.enableForward && campaignDetails.allowBulkCertify"
          class="ml-2"
          menu-class="position-absolute"
          right
          variant="link"
          no-caret
          :disabled="isSaving">
          <template #button-content>
            <FrIcon
              icon-class="text-dark md-24"
              name="more_horiz" />
          </template>
          <BDropdownItem
            data-testid="forward-review-button"
            @click="$bvModal.show('task-header-forward');">
            <FrIcon
              icon-class="mr-2"
              name="redo">
              {{ $t('governance.certificationTask.actions.forward') }}
            </FrIcon>
          </BDropdownItem>
        </BDropdown>
        <FrForwardModal
          bulk
          data-testid="forward-modal"
          modal-id="task-header-forward"
          @forward-bulk="onForwardAllTasks" />
      </template>
    </FrNavbar>
  </div>
</template>

<script>
import {
  BButton,
  BDropdown,
  BDropdownItem,
} from 'bootstrap-vue';
import FrNavbar from '@forgerock/platform-shared/src/components/Navbar/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrForwardModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/ForwardModal';
import { forwardCertification } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';

export default {
  name: 'CertificationToolbar',
  components: {
    FrForwardModal,
    FrIcon,
    FrSpinner,
    FrNavbar,
    BDropdown,
    BDropdownItem,
    BButton,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      firstLoad: true,
    };
  },
  props: {
    actorId: {
      type: String,
      default: '',
    },
    campaignDetails: {
      type: Object,
      default: () => {},
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    hideSignOff: {
      type: Boolean,
      default: true,
    },
    isSaving: {
      type: Boolean,
      default: null,
    },
  },
  computed: {
    disableSignoff() {
      // disable while saving
      if (this.isSaving) return true;

      // disable if campaign does not allow partial signoff and access review is not complete
      if (!this.campaignDetails.allowPartialSignoff && !this.isComplete) return true;

      return false;
    },
  },
  methods: {
    onForwardAllTasks({ comment = '', newActorId }) {
      this.$emit('change-saving');
      forwardCertification(this.actorId, this.campaignDetails.id, newActorId, comment)
        .then(() => {
          this.$emit('change-saving');
          this.$emit('review-forwarded');
        })
        .catch((error) => {
          this.$emit('change-saving');
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.onForwardError'));
        });
    },
  },
  watch: {
    isSaving() {
      this.firstLoad = false;
    },
  },
};
</script>

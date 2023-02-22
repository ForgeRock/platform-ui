<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
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
          class="mr-2 color-green"
          name="check" />
        <span class="text-muted">
          {{ $t('governance.certificationTask.allChangesSaved') }}
        </span>
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
        variant="primary"
        :disabled="disableSignoff"
        @click="$emit('sign-off')">
        {{ $t('governance.certificationTask.signOff') }}
      </BButton>
      <BDropdown
        v-if="campaignDetails.enableForward && campaignDetails.allowBulkCertify"
        class="ml-2"
        variant="link"
        boundary="window"
        no-caret
        :disabled="isSaving">
        <template #button-content>
          <FrIcon
            class="text-dark md-24"
            name="more_horiz" />
        </template>
        <BDropdownItem
          @click="onForwardAllTasks">
          <FrIcon
            class="mr-2"
            name="redo" />
          {{ $t('governance.certificationTask.actions.forward') }}
        </BDropdownItem>
      </BDropdown>
    </template>
  </FrNavbar>
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
import { forwardCertificationTasks } from '@forgerock/platform-shared/src/api/governance/CertificationApi';

export default {
  name: 'CertificationTaskHeader',
  components: {
    FrIcon,
    FrSpinner,
    FrNavbar,
    BDropdown,
    BDropdownItem,
    BButton,
  },
  data() {
    return {
      firstLoad: true,
    };
  },
  props: {
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
      default: false,
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
    onForwardAllTasks() {
      this.$emit('change-saving');
      forwardCertificationTasks(this.campaignDetails.id)
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.onForwardError'));
        }).finally(() => {
          this.$emit('change-saving');
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

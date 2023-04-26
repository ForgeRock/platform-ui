<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    body-class="p-0"
    content-class="border-0"
    scrollable
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    size="xl"
    :ok-title="$t('common.done')"
    :static="isTest">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <BImg
          class="mr-3"
          height="36"
          width="36"
          :alt="displayName"
          :src="logo"
          fluid />
        <div class="media-body">
          <small class="mb-1 d-block">
            {{ displayName }}
          </small>
          <p
            v-if="entitlement"
            class="mb-0 h5">
            {{ entitlement.__NAME__ }}
          </p>
        </div>
      </BMedia>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          class="md-24"
        />
      </BButtonClose>
    </template>
    <BTabs
      class="card-tabs-vertical"
      pills
      vertical>
      <BTab
        active
        :title="$t('common.details')">
        <FrEntitlementDetailsTab :entitlement="entitlement" />
      </BTab>
    </BTabs>
  </BModal>
</template>

<script>
import {
  BButtonClose,
  BModal,
  BTab,
  BTabs,
  BMedia,
  BImg,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import AppSharedUtilsMixin from '@forgerock/platform-shared/src/mixins/AppSharedUtilsMixin';
import FrEntitlementDetailsTab from './EntitlementDetailsTab';

/**
 * @description  modal component to show entitlement details, this modal is opened when the user clicks the entitlement
 * column of the access reviews table, this component receives the selected line item object
 *
 * @param {object} entitlement - object with the entitlement data
 *
 * @param {object} application - object with the application data, this info is used to show the application icon and
 * entitlement type
 */
export default {
  name: 'CertificationTaskEntitlementModal',
  components: {
    BButtonClose,
    BModal,
    BTab,
    BTabs,
    FrEntitlementDetailsTab,
    FrIcon,
    BMedia,
    BImg,
  },
  mixins: [AppSharedUtilsMixin],
  props: {
    entitlement: {
      type: Object,
      default: () => {},
    },
    application: {
      type: Object,
      default: () => {},
    },
    modalId: {
      type: String,
      default: 'CertificationTaskEntAccountModal',
    },
  },
  data() {
    return {
      isTest: false, // only for test purposes, to make the modal static
    };
  },
  computed: {
    logo() {
      return this.getApplicationLogo(this.application);
    },
    displayName() {
      return this.$t('governance.certificationTask.entitlementModal.name', { entitlementName: this.getApplicationDisplayName(this.application) });
    },
  },
};
</script>

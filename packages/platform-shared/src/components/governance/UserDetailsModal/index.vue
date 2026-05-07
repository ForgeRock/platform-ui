<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    :ok-title="$t('common.done')"
    body-class="p-0"
    content-class="border-0"
    :id="modalId"
    no-close-on-backdrop
    no-close-on-esc
    ok-only
    ok-variant="outline-primary"
    scrollable
    size="xl">
    <template #modal-header="{ close }">
      <BMedia
        class="align-items-center"
        no-body>
        <BImg
          class="mr-3 rounded-circle"
          height="36"
          width="36"
          alt=""
          :src="(user && user.profileImage) || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
          fluid />
        <div class="media-body">
          <h5 class="m-0">
            {{ userFullName }}
          </h5>
          <small class="text-muted">
            {{ user && user.userName }}
          </small>
        </div>
      </BMedia>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="close">
        <FrIcon
          name="close"
          icon-class="md-24" />
      </BButtonClose>
    </template>
    <BTabs
      class="card-tabs-vertical"
      pills
      vertical>
      <BTab
        active
        :title="$t('governance.certificationTask.lineItemDetailsModal.userDetailsTabText')">
        <FrUserDetailsTab
          v-if="user"
          :display-properties="displayProperties"
          :manager="manager"
          :user="user" />
      </BTab>
      <template v-if="!onlyDetails">
        <BTab :title="$t('common.roles')">
          <FrRolesTab :roles="userDetails.userRoles" />
        </BTab>
        <BTab :title="$t('common.accounts')">
          <FrAccountsTab :accounts="userDetails.userAccounts" />
        </BTab>
        <BTab :title="$t('common.entitlements')">
          <FrEntitlementsTab :entitlements="userDetails.userEntitlements" />
        </BTab>
      </template>
    </BTabs>
  </BModal>
</template>

<script>
/**
 * Modal displaying user details with optional roles, accounts, and entitlements tabs.
 * @component GovernanceUserDetailsModal
 * @prop {Array} displayProperties - User attribute keys to display in the details tab
 * @prop {Object} manager - Optional manager object passed to the user details tab
 * @prop {Object} user - User object (givenName, sn, userName, profileImage)
 * @prop {Object} userDetails - Object containing userRoles, userAccounts, userEntitlements result sets
 * @prop {String} modalId - BModal id used to programmatically show/hide the modal
 * @prop {Boolean} onlyDetails - When true, hides the roles, accounts, and entitlements tabs
 */
import {
  BButtonClose,
  BModal,
  BTab,
  BTabs,
  BMedia,
  BImg,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrUserDetailsTab from './UserDetailsTab';
import FrEntitlementsTab from './EntitlementsTab';
import FrRolesTab from './RolesTab';
import FrAccountsTab from './AccountsTab';

export default {
  name: 'GovernanceUserDetailsModal',
  components: {
    BButtonClose,
    BImg,
    BMedia,
    BModal,
    BTab,
    BTabs,
    FrAccountsTab,
    FrEntitlementsTab,
    FrIcon,
    FrRolesTab,
    FrUserDetailsTab,
  },
  props: {
    displayProperties: {
      type: Array,
      default: () => [],
    },
    manager: {
      type: Object,
      default: () => ({}),
    },
    user: {
      type: Object,
      required: true,
    },
    userDetails: {
      type: Object,
      required: true,
      default: () => ({
        userAccounts: {},
        userEntitlements: {},
        userRoles: {},
      }),
    },
    modalId: {
      type: String,
      default: 'GovernanceUserDetailsModal',
    },
    onlyDetails: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    userFullName() {
      return this.$t('common.userFullName', {
        givenName: this.user?.givenName,
        sn: this.user?.sn,
      });
    },
  },
};
</script>

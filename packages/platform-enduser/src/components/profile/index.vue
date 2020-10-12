<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <BContainer>
    <BRow class="my-5">
      <BCol
        class="profileCol mb-4"
        lg="4">
        <BCard class="text-center mb-4">
          <BImg
            :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
            rounded="circle"
            width="112"
            height="112"
            alt="img"
            class="m-1 mb-3" />
          <h4 class="text-truncate">
            {{ fullName }}
          </h4>
          <div class="text-muted text-truncate">
            {{ email }}
          </div>
          <BButton
            v-if="internalUser === false"
            ref="editProfileButton"
            variant="primary"
            block
            class="mt-4"
            v-b-modal.userDetailsModal>
            {{ $t('pages.profile.editPersonalInfo') }}
          </BButton>
        </BCard>

        <FrEditPersonalInfo
          v-if="profile._id"
          @updateProfile="updateProfile"
          :schema="schema"
          :profile="profile" />
      </BCol>
      <BCol lg="8">
        <FrAccountSecurity
          class="mb-5"
          v-if="internalUser === false"
          @updateKBA="updateKBA" />
        <FrSocial class="mb-5" />
        <FrTrustedDevices />
        <FrAuthorizedApplications
          class="mb-5"
          v-if="internalUser === false"
        />
        <FrPreferences
          class="mb-5"
          v-if="internalUser === false"
          @updateProfile="updateProfile" />
        <FrConsent
          class="mb-5"
          v-if="internalUser === false"
          :consented-mappings="profile.consentedMappings"
          @updateProfile="updateProfile" />
        <FrAccountControls class="mb-5" />
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import { startCase } from 'lodash';
import { mapState } from 'vuex';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import AccountControls from '@/components/profile/AccountControls';
import AccountSecurity from '@/components/profile/AccountSecurity';
import AuthorizedApplications from '@/components/profile/AuthorizedApplications';
import EditPersonalInfo from '@/components/profile/EditPersonalInfo';
import Preferences from '@/components/profile/Preferences';
import TrustedDevices from '@/components/profile/TrustedDevices';
import Consent from '@/components/profile/Consent';
import Social from '@/components/profile/Social/';

/**
 * @description Controlling component for profile management
 *
 * @fires PATCH type/name/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */
export default {
  name: 'Profile',
  mixins: [
    RestMixin,
    NotificationMixin,
  ],
  props: {
    clientToken: {
      type: String,
      default: '',
    },
    linkedProvider: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      profile: {},
    };
  },
  components: {
    FrAccountControls: AccountControls,
    FrAccountSecurity: AccountSecurity,
    FrAuthorizedApplications: AuthorizedApplications,
    FrEditPersonalInfo: EditPersonalInfo,
    FrPreferences: Preferences,
    FrTrustedDevices: TrustedDevices,
    FrConsent: Consent,
    FrSocial: Social,
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
      userSearchAttribute: (state) => state.UserStore.userSearchAttribute,
      email: (state) => state.UserStore.email,
      schema: (state) => state.UserStore.schema,
      sirName: (state) => state.UserStore.sn,
      givenName: (state) => state.UserStore.givenName,
      managedResource: (state) => state.UserStore.managedResource,
      internalUser: (state) => state.UserStore.internalUser,
    }),
    fullName() {
      let fullName = '';

      if (this.givenName.length > 0 || this.sirName.length > 0) {
        fullName = startCase(`${this.givenName} ${this.sirName}`);
      } else {
        fullName = this.userId;
      }

      return fullName;
    },
  },
  mounted() {
    this.getUserProfile();
  },
  methods: {
    getUserProfile() {
      this.getRequestService().get(`${this.managedResource}/${this.userSearchAttribute}`)
        .then((results) => {
          this.profile = results.data;
        })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    updateProfile(payload, config = {}) {
      this.makeUpdateRequest(this.managedResource, payload, config);
    },
    updateKBA(payload, config) {
      this.makeUpdateRequest('selfservice/user', payload, config);
    },
    makeUpdateRequest(endpoint, payload, config = {}) {
      const successMsg = config.successMsg || this.$t('user.profile.updateSuccess');
      const selfServiceInstance = this.getRequestService({
        headers: config.headers,
      });

      selfServiceInstance.patch(`${endpoint}/${this.userSearchAttribute}`, payload).then((response) => {
        this.$store.commit('UserStore/setProfile', response.data);
        this.displayNotification('IDMMessages', 'success', successMsg);

        this.profile = response.data;

        if (config.onSuccess) {
          config.onSuccess();
        }
      }).catch((error) => {
        const errorMsg = config.errorMsg || error.response.data.message;
        this.displayNotification('IDMMessages', 'error', errorMsg);

        if (config.onError) {
          config.onError(error);
        }
      });
    },
  },
};
</script>

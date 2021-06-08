<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <BRow class="my-5">
      <BCol
        class="profileCol mb-4"
        lg="4">
        <FrEditProfile
          @updateProfile="updateProfile"
          :header="fullName"
          :profile-image="profileImage"
          :secondary-header="profile.mail"
          :schema="schema"
          :profile="profile"
          :show-edit="profile._id !== undefined && internalUser === false"
          :show-image-upload="schema.properties && schema.properties.profileImage !== undefined" />
      </BCol>
      <BCol lg="8">
        <FrAccountSecurity
          class="mb-5"
          v-if="internalUser === false"
          @updateKBA="updateKBA"
          :processing-request="processingRequest"
        />
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
import AccountSecurity from '@forgerock/platform-shared/src/components/profile/AccountSecurity';
import TrustedDevices from '@forgerock/platform-shared/src/components/profile/TrustedDevices';
import EditProfile from '@forgerock/platform-shared/src/components/profile/EditProfile';
import AccountControls from '@/components/profile/AccountControls';
import AuthorizedApplications from '@/components/profile/AuthorizedApplications';
import Preferences from '@/components/profile/Preferences';
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
  data() {
    return {
      profile: {
        givenName: '',
        sn: '',
      },
      processingRequest: false,
    };
  },
  components: {
    FrAccountControls: AccountControls,
    FrAccountSecurity: AccountSecurity,
    FrAuthorizedApplications: AuthorizedApplications,
    FrEditProfile: EditProfile,
    FrPreferences: Preferences,
    FrTrustedDevices: TrustedDevices,
    FrConsent: Consent,
    FrSocial: Social,
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
      internalUser: (state) => state.UserStore.internalUser,
      managedResource: (state) => state.UserStore.managedResource,
      schema: (state) => state.UserStore.schema,
    }),
    fullName() {
      let fullName = '';

      if (this.profile.givenName.length > 0 || this.profile.sn.length > 0) {
        fullName = startCase(`${this.profile.givenName} ${this.profile.sn}`);
      } else {
        fullName = this.userId;
      }

      return fullName;
    },
    profileImage() {
      let profileImage = '';

      if (this.profile.profileImage && this.profile.profileImage.length > 0) {
        profileImage = this.profile.profileImage;
      }

      return profileImage;
    },
  },
  mounted() {
    this.getUserProfile();
  },
  methods: {
    getUserProfile() {
      this.getRequestService().get(`${this.managedResource}/${this.userId}`)
        .then((results) => {
          this.profile = results.data;
        })
        .catch((error) => {
          this.displayNotification('IDMMessages', 'error', error.response.data.message);
        });
    },
    updateProfile(payload, config) {
      this.makeUpdateRequest(this.managedResource, payload, config);
    },
    updateKBA(payload, config) {
      this.processingRequest = true;
      this.makeUpdateRequest('selfservice/user', payload, config);
    },
    makeUpdateRequest(endpoint, payload, config = {}) {
      const successMsg = config.successMsg || this.$t('user.profile.updateSuccess');
      const selfServiceInstance = this.getRequestService({
        headers: config.headers,
      });

      selfServiceInstance.patch(`${endpoint}/${this.userId}`, payload).then((response) => {
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
      }).finally(() => {
        this.processingRequest = false;
      });
    },
  },
};
</script>

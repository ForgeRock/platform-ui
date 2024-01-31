<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <BRow
      v-if="theme"
      class="my-5">
      <BCol
        v-if="!theme?.accountPageSections || theme?.accountPageSections.personalInformation.enabled"
        class="profileCol mb-4"
        lg="4">
        <FrEditProfile
          @updateProfile="updateProfile"
          :header="fullName"
          :profile-image="profileImage"
          :secondary-header="profile.mail"
          :schema="managedResourceSchema"
          :profile="profile"
          :show-edit="profile._id !== undefined && isInternalUser === false"
          :show-image-upload="managedResourceSchema.properties && managedResourceSchema.properties.profileImage !== undefined" />
      </BCol>
      <BCol :lg="(!theme?.accountPageSections || theme?.accountPageSections.personalInformation.enabled) ? 8 : 12">
        <FrAccountSecurity
          v-if="(!theme?.accountPageSections || theme?.accountPageSections.accountSecurity.enabled) && isInternalUser === false"
          class="mb-5"
          :processing-request="processingRequest"
          :theme-sections="theme?.accountPageSections ? theme?.accountPageSections.accountSecurity.subsections : {}"
          @updateKBA="updateKBA" />
        <FrSocial
          v-if="!theme?.accountPageSections || theme?.accountPageSections.social.enabled"
          class="mb-5" />
        <FrAccordionTrustedDevices
          v-if="!theme?.accountPageSections || theme?.accountPageSections.trustedDevices.enabled"
          class="mb-5" />
        <FrAuthorizedApplications
          v-if="(!theme?.accountPageSections || theme?.accountPageSections.oauthApplications.enabled) && isInternalUser === false"
          class="mb-5" />
        <FrPreferences
          v-if="(!theme?.accountPageSections || theme?.accountPageSections.preferences.enabled) && isInternalUser === false"
          class="mb-5"
          @updateProfile="updateProfile" />
        <FrConsent
          v-if="!theme?.accountPageSections || theme?.accountPageSections.consent.enabled"
          class="mb-5"
          :consented-mappings="profile.consentedMappings"
          @updateProfile="updateProfile" />
        <FrAccountControls
          v-if="!theme?.accountPageSections || theme?.accountPageSections.accountControls.enabled"
          class="mb-5" />
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import FrAccordionTrustedDevices from '@forgerock/platform-shared/src/components/profile/TrustedDevices/AccordionTrustedDevices';
import { BCol, BContainer, BRow } from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrAccountSecurity from '@forgerock/platform-shared/src/components/profile/AccountSecurity';
import FrEditProfile from '@forgerock/platform-shared/src/components/profile/EditProfile';
import FrAccountControls from '@/components/profile/AccountControls';
import FrAuthorizedApplications from '@/components/profile/AuthorizedApplications';
import FrPreferences from '@/components/profile/Preferences';
import FrConsent from '@/components/profile/Consent';
import FrSocial from '@/components/profile/Social/';

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
    BCol,
    BContainer,
    BRow,
    FrAccountControls,
    FrAccountSecurity,
    FrAuthorizedApplications,
    FrEditProfile,
    FrPreferences,
    FrAccordionTrustedDevices,
    FrConsent,
    FrSocial,
  },
  props: {
    theme: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    ...mapState(useUserStore, ['userId', 'managedResource']),
    ...mapState(useEnduserStore, ['isInternalUser', 'managedResourceSchema']),
    fullName() {
      let fullName = '';

      if (this.profile.givenName?.length > 0 || this.profile.sn?.length > 0) {
        const givenName = this.profile.givenName || '';
        const sn = this.profile.sn || '';
        fullName = this.$t('common.userFullName', { givenName, sn });
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
          this.showErrorMessage(error, this.$t('user.profile.getManagedResourceError'));
        });
    },
    updateProfile(payload, config) {
      this.makeUpdateRequest(this.managedResource, payload, config);
    },
    updateKBA(payload, config) {
      this.processingRequest = true;
      this.makeUpdateRequest(this.managedResource, payload, config);
    },
    makeUpdateRequest(endpoint, payload, config = {}) {
      const successMsg = config.successMsg || this.$t('user.profile.updateSuccess');
      const selfServiceInstance = this.getRequestService({
        headers: config.headers,
      });

      selfServiceInstance.patch(`${endpoint}/${this.userId}`, payload).then((response) => {
        const enduserStore = useEnduserStore();
        enduserStore.setProfile(response.data);
        this.displayNotification('success', successMsg);
        this.profile = response.data;

        if (config.onSuccess) {
          config.onSuccess();
        }
      }).catch((error) => {
        this.showErrorMessage(error, config.errorMsg);

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

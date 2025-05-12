<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <BRow
      class="my-5">
      <BCol
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
      <slot
        name="settings"
        :profile="profile"
        :processing-request="processingRequest"
        :update-profile="updateProfile" />
    </BRow>
  </BContainer>
</template>

<script>
import { BCol, BContainer, BRow } from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import RestMixin from '@forgerock/platform-shared/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrEditProfile from '@forgerock/platform-shared/src/components/profile/EditProfile';

/**
 * @description Controlling component for profile management
 *
 * @fires PATCH type/name/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */
export default {
  name: 'ProfileContainer',
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
    FrEditProfile,
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
    makeUpdateRequest(endpoint, payload, config = {}) {
      this.processingRequest = true;
      const successMsg = config.successMsg || this.$t('common.profile.updateSuccess');
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

<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer>
    <BRow class="my-5">
      <BCol
        class="profileCol mb-4"
        lg="4">
        <BCard class="text-center mb-4">
          <BImg
            :src="require('@/assets/images/profile-default.png')"
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
          :auto-open="openProfile"
          @updateProfile="updateProfile"
          :schema="schema"
          :profile="profile" />
      </BCol>
      <BCol lg="8">
        <BTabs content-class="mt-4">
          <BTab
            :title="$t('pages.profile.settings')"
            active>
            <FrAccountSecurity
              v-if="internalUser === false"
              @updateProfile="updateProfile"
              @updateKBA="updateKBA" />
            <!-- TODO we need to update these to not rely on the old way of getting AM data endpoints -->
            <!-- <FrAuthorizedApplications v-if="amDataEndpoints && internalUser === false" /> -->
            <!-- <FrTrustedDevices v-if="amDataEndpoints && internalUser === false" /> -->
            <FrPreferences
              v-if="internalUser === false"
              @updateProfile="updateProfile" />
            <FrConsent
              v-if="internalUser === false"
              :consented-mappings="profile.consentedMappings"
              @updateProfile="updateProfile" />
            <FrAccountControls />
          </BTab>
        </BTabs>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script>
import { startCase } from 'lodash';
import { mapState } from 'vuex';
import RestMixin from '@forgerock/platform-components/src/mixins/RestMixin';
import NotificationMixin from '@forgerock/platform-components/src/mixins/NotificationMixin';
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
    openProfile: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      profile: {},
    };
  },
  components: {
    FrAccountControls: () => import('@/components/profile/AccountControls'),
    FrAccountSecurity: () => import('@/components/profile/AccountSecurity'),
    FrEditPersonalInfo: () => import('@/components/profile/EditPersonalInfo'),
    FrPreferences: () => import('@/components/profile/Preferences'),
    // FrTrustedDevices: () => import('@/components/profile/TrustedDevices'),
    // FrAuthorizedApplications: () => import('@/components/profile/AuthorizedApplications'),
    FrConsent: () => import('@/components/profile/Consent'),
  },
  computed: {
    ...mapState({
      userId: (state) => state.UserStore.userId,
      email: (state) => state.UserStore.email,
      schema: (state) => state.UserStore.schema,
      sirName: (state) => state.UserStore.sn,
      givenName: (state) => state.UserStore.givenName,
      managedResource: (state) => state.UserStore.managedResource,
      internalUser: (state) => state.UserStore.internalUser,
      passwordReset: (state) => state.ApplicationStore.passwordReset,
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
      this.getRequestService().get(`${this.managedResource}/${this.userId}`)
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
      const successMsg = config.successMsg || this.$t('common.user.profile.updateSuccess');
      const selfServiceInstance = this.getRequestService({
        headers: config.headers,
      });

      selfServiceInstance.patch(`${endpoint}/${this.userId}`, payload).then((response) => {
        this.$store.dispatch('UserStore/setProfileAction', response.data);
        this.displayNotification('IDMMessages', 'success', successMsg);

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
<style type="scss" scoped>
/deep/ .nav-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}
</style>

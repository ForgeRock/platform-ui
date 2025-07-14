<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrProfileContainer :show-personal-info="!theme?.accountPageSections || theme?.accountPageSections.personalInformation.enabled">
    <template #settings="{ profile, updateProfile, processingRequest }">
      <BCol :lg="(!theme?.accountPageSections || theme?.accountPageSections.personalInformation.enabled) ? 8 : 12">
        <FrAccountSecurity
          v-if="(!theme?.accountPageSections || theme?.accountPageSections.accountSecurity.enabled) && isInternalUser === false"
          class="mb-5"
          :processing-request="processingRequest"
          :theme-sections="theme?.accountPageSections ? theme?.accountPageSections.accountSecurity.subsections : {}"
          @updateKBA="updateProfile" />
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
    </template>
  </FrProfileContainer>
</template>

<script>
import FrAccordionTrustedDevices from '@forgerock/platform-shared/src/components/profile/TrustedDevices/AccordionTrustedDevices';
import { BCol } from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import FrAccountSecurity from '@forgerock/platform-shared/src/components/profile/AccountSecurity';
import FrProfileContainer from '@forgerock/platform-shared/src/enduser/components/profile/ProfileContainer';
import FrAccountControls from '@forgerock/platform-shared/src/enduser/components/profile/AccountControls';
import FrPreferences from '@forgerock/platform-shared/src/enduser/components/profile/Preferences';
import FrAuthorizedApplications from '@/components/profile/AuthorizedApplications';
import FrConsent from '@/components/profile/Consent';
import FrSocial from '@/components/profile/Social/';

/**
 * @description Controlling component for profile management
 *
 * @fires PATCH type/name/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */
export default {
  name: 'Profile',
  components: {
    BCol,
    FrAccountControls,
    FrAccountSecurity,
    FrAuthorizedApplications,
    FrPreferences,
    FrAccordionTrustedDevices,
    FrProfileContainer,
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
  },
};
</script>

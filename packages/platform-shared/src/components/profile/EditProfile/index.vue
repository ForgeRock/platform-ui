<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard class="text-center mb-4">
      <div
        class="d-flex justify-content-center">
        <div class="fr-profile-image position-relative mb-3 p-0 within-input-button">
          <BAvatar
            @click="$bvModal.show('frProfileImageModal')"
            :button="showImageUpload"
            size="112px"
            :src="profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
            :aria-label="showImageUpload ? $t('pages.profile.editProfile.profileImageModal.title') : $t('pages.profile.editProfile.profilePicture')" />
          <BButton
            v-if="showImageUpload"
            class="fr-edit-icon"
            variant="dark"
            @click="$bvModal.show('frProfileImageModal')">
            <FrIcon
              icon-class="md-18"
              name="camera_alt" />
          </BButton>
        </div>
      </div>
      <h1 class="text-truncate h4">
        {{ header }}
      </h1>
      <div class="text-muted text-truncate">
        {{ secondaryHeader }}
      </div>
      <BButton
        v-if="showEdit"
        ref="editProfileButton"
        variant="primary"
        block
        class="mt-4"
        @click="$root.$emit('bv::show::modal', 'userDetailsModal')">
        {{ $t('pages.profile.editPersonalInfo') }}
      </BButton>
    </BCard>

    <FrEditPersonalInfo
      v-if="showEdit"
      @updateProfile="updateProfile"
      :schema="schema"
      :profile="profile" />

    <FrImageModal
      v-if="showImageUpload"
      @updateProfileImage="updateProfile"
      :profile-image="profileImage" />
  </div>
</template>

<script>
import {
  BAvatar,
  BButton,
  BCard,
} from 'bootstrap-vue';
import FrEditPersonalInfo from '@forgerock/platform-shared/src/components/profile/EditPersonalInfo';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrImageModal from './ImageModal';

/**
 * Edit profile card that handles image updating and profile management based on proper configuration
 */
export default {
  name: 'EditProfile',
  components: {
    BAvatar,
    BButton,
    BCard,
    FrEditPersonalInfo,
    FrIcon,
    FrImageModal,
  },
  props: {
    /**
     * Main header below profile image
     */
    header: {
      type: String,
      default: '',
    },
    /**
     * Profile information
     */
    profile: {
      type: Object,
      default: () => {},
    },
    /**
     * Schema data for profile
     */
    schema: {
      type: Object,
      default: () => {},
    },
    /**
     * Secondary header below profile image
     */
    secondaryHeader: {
      type: String,
      default: '',
    },
    /**
     * Show button that opens modal to edit profile information
     */
    showEdit: {
      type: Boolean,
      default: true,
    },
    /**
     * Show button to upload profile image
     */
    showImageUpload: {
      type: Boolean,
      default: false,
    },
    /**
     * Profile image source
     */
    profileImage: {
      type: String,
      default: '',
    },
  },
  methods: {
    updateProfile(payload, config = {}) {
      this.$emit('updateProfile', payload, config);
    },
  },
};
</script>

<style lang="scss" scoped>
:deep {
  .fr-profile-image {
    .fr-edit-icon {
      position: absolute;
      bottom: 0;
      right: 0;
      height: 2rem;
      width: 2rem;
      border-radius: 1rem;
    }

    .btn.b-avatar {
      overflow: hidden;

      img {
        height: 100%;
        width: 100%;
        transition: transform 0.15s ease-in-out;
      }

      &:hover {
        img {
          transform: scale(1.15);
        }
      }

      .b-avatar-badge {
        width: 2rem;
        height: 2rem;
        padding: 0 0 4px 0;
        min-height: inherit;
        min-width: inherit;
      }
    }
  }
}
</style>

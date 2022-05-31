<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard class="text-center mb-4">
      <div
        class="d-flex justify-content-center">
        <div class="fr-profile-image position-relative mb-3 p-0">
          <BAvatar
            @click="$root.$emit('bv::show::modal', 'frProfileImageModal')"
            variant="link"
            :button="showImageUpload"
            size="112px"
            :src="profileImage.length > 0 ? profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          <BAvatar
            v-if="showImageUpload"
            button
            @click="$root.$emit('bv::show::modal', 'frProfileImageModal')"
            class="fr-edit-icon"
            size="2em"
            variant="dark">
            <FrIcon
              class="md-18"
              name="camera_alt"
            />
          </BAvatar>
        </div>
      </div>
      <h4 class="text-truncate">
        {{ header }}
      </h4>
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
::v-deep {
  .fr-profile-image {
    .fr-edit-icon {
      position: absolute;
      cursor: pointer;
      bottom: 0;
      right: 0;
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

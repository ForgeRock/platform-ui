<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="frProfileImageModal"
    cancel-variant="link"
    no-close-on-backdrop
    no-close-on-esc
    size="lg"
    title-class="h5"
    title-tag="h2"
    :ok-disabled="imageError"
    :ok-title="$t('common.save')"
    :title="$t('pages.profile.editProfile.profileImageModal.title')"
    @ok="saveProfileImage">
    <div class="mb-3">
      <div class="d-flex align-items-center justify-content-center py-4 mb-4">
        <BAvatar
          size="180px"
          :variant="imageError ? 'light' : ''"
          :src="imageURL || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
          @img-error="updateImageError(true)">
          <template
            v-if="imageError"
            #default>
            <FrIcon
              icon-class="md-72 opacity-30"
              name="camera_alt" />
          </template>
        </BAvatar>
      </div>
      <BFormGroup
        class="mb-0"
        :label-for="`floatingLabelInput${_uid}`"
        :state="!imageError">
        <FrField
          v-model="imageURL"
          name="profileImage"
          :label="$t('pages.profile.editProfile.profileImageModal.profileImageUrl')"
          @input="updateImageError(false)"
          :errors="errors"
        />
      </BFormGroup>
      <small class="text-muted">
        {{ $t('pages.profile.editProfile.profileImageModal.formHelp') }}
      </small>
      <div
        id="profile-image-tips"
        class="p-4 mt-4 bg-light">
        <h2 class="h6">
          {{ $t('pages.profile.editProfile.profileImageModal.tips') }}
        </h2>
        <BRow>
          <BCol lg="6">
            <BMedia>
              <template #aside>
                <FrIcon
                  icon-class="md-24"
                  name="fullscreen" />
              </template>
              <small class="form-text">
                {{ $t('pages.profile.editProfile.profileImageModal.imageHelp') }}
              </small>
            </BMedia>
          </BCol>
          <BCol lg="6">
            <BMedia>
              <template #aside>
                <FrIcon
                  icon-class="md-24"
                  name="aspect_ratio" />
              </template>
              <small class="form-text">
                {{ $t('pages.profile.editProfile.profileImageModal.aspectHelp') }}
              </small>
            </BMedia>
          </BCol>
        </BRow>
      </div>
    </div>
  </BModal>
</template>

<script>
import {
  BAvatar,
  BCol,
  BFormGroup,
  BMedia,
  BModal,
  BRow,
} from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 * A modal which shows the current profile picture and provides an input to update or remove the image
 * Also contains tips on the suggested aspect ratio
 */
export default {
  name: 'ImageModal',
  components: {
    BAvatar,
    BCol,
    BFormGroup,
    BMedia,
    BModal,
    BRow,
    FrField,
    FrIcon,
  },
  props: {
    /**
     * URL of profile image
     */
    profileImage: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      errors: [],
      imageURL: this.profileImage,
      imageError: false,
    };
  },
  methods: {
    /**
     * Update or remove a profile image
     */
    saveProfileImage() {
      if (this.imageURL.length === 0) {
        this.$emit('updateProfileImage', [{
          operation: 'remove',
          field: '/profileImage',
        }]);
      } else {
        this.$emit('updateProfileImage', [{
          operation: 'replace',
          field: '/profileImage',
          value: this.imageURL,
        }]);
      }

      this.$bvModal.hide('frProfileImageModal');
    },
    updateImageError(currentValue) {
      this.imageError = currentValue;
      this.errors = [];
      if (this.imageError) {
        this.errors = [this.$t('pages.profile.editProfile.profileImageModal.validUrl')];
      }
    },
  },
  watch: {
    profileImage(newProfileImage) {
      this.imageURL = newProfileImage;
    },
  },
};
</script>

<style lang="scss" scoped>
:deep {
  .b-avatar {
    img {
      height: 100%;
      width: 100%;
    }
  }

  .is-invalid {
    .form-control {
      border-color: $danger;
    }
  }
}
</style>

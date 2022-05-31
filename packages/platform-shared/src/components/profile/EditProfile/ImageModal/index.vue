<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    size="lg"
    ref="profileImageModal"
    :title="$t('pages.profile.editProfile.profileImageModal.title')"
    id="frProfileImageModal">
    <div class="mb-3">
      <div class="d-flex align-items-center justify-content-center py-4 mb-4">
        <BAvatar
          size="180px"
          :variant="imageError ? 'light' : ''"
          :src="imageURL.length > 0 ? imageURL : require('@forgerock/platform-shared/src/assets/images/avatar.png')"
          @img-error="imageError = true">
          <FrIcon
            v-if="imageError"
            class="md-72 opacity-30"
            name="camera_alt"
          />
        </BAvatar>
      </div>
      <BFormGroup
        class="mb-0"
        :invalid-feedback="$t('pages.profile.editProfile.profileImageModal.validUrl')"
        :state="!imageError">
        <FrField
          v-model="imageURL"
          debounce="300"
          name="profileImage"
          :label="$t('pages.profile.editProfile.profileImageModal.profileImageUrl')"
          @input="imageError = false" />
      </BFormGroup>
      <small class="text-muted">
        {{ $t('pages.profile.editProfile.profileImageModal.formHelp') }}
      </small>
      <div class="p-4 mt-4 bg-light">
        <h6 class="text-muted">
          {{ $t('pages.profile.editProfile.profileImageModal.tips') }}
        </h6>
        <BRow>
          <BCol lg="6">
            <BMedia>
              <template #aside>
                <FrIcon
                  class="md-24"
                  name="fullscreen"
                />
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
                  class="md-24"
                  name="aspect_ratio"
                />
              </template>
              <small class="form-text">
                {{ $t('pages.profile.editProfile.profileImageModal.aspectHelp') }}
              </small>
            </BMedia>
          </BCol>
        </BRow>
      </div>
    </div>
    <template #modal-footer="{ cancel }">
      <BButton
        size="md"
        variant="link"
        @click="cancel()">
        {{ $t('common.cancel') }}
      </BButton>
      <BButton
        size="md"
        variant="primary"
        :disabled="imageError"
        @click="saveProfileImage">
        {{ $t('common.save') }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import {
  BAvatar,
  BButton,
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
    BButton,
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
  mixins: [],
  data() {
    return {
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

      this.hideModal();
    },
    /**
     * Hide profile image modal
     */
    hideModal() {
      this.$refs.profileImageModal.hide();
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
::v-deep {
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

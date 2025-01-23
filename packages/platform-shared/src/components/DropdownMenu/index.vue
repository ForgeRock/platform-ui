<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    :right="right"
    variant="link"
    toggle-class="text-decoration-none p-0">
    <slot name="tenant-header" />
    <template #button-content>
      <!-- @slot Button content -->
      <slot name="button-content" />
    </template>
    <!-- @slot Dropdown header -->
    <slot name="dropdown-header" />
    <template
      v-for="(item, index) in dropdownItems"
      :key="`sideDropdownItems_${index}`">
      <template>
        <FrMenuItem v-bind="item" />
      </template>
    </template>
    <template v-if="showProfileLink">
      <BDropdownDivider v-if="enableLogout && dropdownItems.length" />
      <BDropdownItem @click="$router.push({ name: 'Profile' })">
        <BMedia class="text-left">
          <template #aside>
            <BAvatar
              size="34"
              variant="light"
              :src="profileImage.length ? profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
          </template>
          <div class="h5 my-0 text-truncate">
            {{ userDetails.name }}
          </div>
          <div
            class="text-truncate"
            :class="isEndUser ? 'text-muted' : 'text-gray'">
            <template v-if="userDetails.email.length === 0">
              {{ $t('common.notAvailable') }}
            </template>
            <template v-else>
              {{ userDetails.email }}
            </template>
          </div>
        </BMedia>
      </BDropdownItem>
      <BDropdownDivider v-if="enableLogout" />
    </template>
    <BDropdownItem
      v-if="enableLogout"
      class="mb-2"
      @click="logoutUser()">
      <FrIcon
        icon-class="mr-2"
        name="exit_to_app">
        {{ $t('common.signOut') }}
      </FrIcon>
    </BDropdownItem>
  </BDropdown>
</template>

<script>
import {
  BAvatar,
  BDropdown,
  BDropdownItem,
  BDropdownDivider,
  BMedia,
} from 'bootstrap-vue';
import MenuItem from '@forgerock/platform-shared/src/components/MenuItem';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
/**
 * Bootstrap dropdown menu used in navbar and sidemenu
 */
export default {
  name: 'DropdownMenu',
  components: {
    BAvatar,
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    BMedia,
    FrMenuItem: MenuItem,
    FrIcon,
  },
  mixins: [
    LoginMixin,
  ],
  props: {
    /**
     * Items contained in dropdown.
     */
    dropdownItems: {
      type: Array,
      default: () => [],
    },
    /**
     * Enable logout link in dropdown.
     */
    enableLogout: {
      type: Boolean,
      default: false,
    },
    /**
     * Link to profile.
     */
    showProfileLink: {
      type: Boolean,
      default: false,
    },
    /**
     * Align dropdown menu with right edge of dropdown button.
     */
    right: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(useUserStore, ['userDetails']),
    ...mapState(useEnduserStore, ['profileImage']),
    isEndUser() {
      return this.$store.state?.SharedStore?.currentPackage === 'enduser';
    },
  },
};
</script>

<style lang="scss" scoped>
:deep {
  .b-dropdown {
    width: 100%;
  }

  .dropdown-menu.show {
    position: absolute;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
    padding: 0;
    min-width: 243px;
    max-width: 270px;

    li:first-child {
      margin-top: 0.5rem;
    }

    li:last-child {
      margin-bottom: 0.5rem;
    }
  }

  .dropdown-toggle {
    color: $fr-sidemenu-font-color;
  }

  .dropdown-item {
    .text-gray {
      color: $text-muted;
    }
    &:focus-visible, &:hover {
      .text-gray {
        color: $gray-700;
      }
    }
    h5,
    span:not(.material-icons-outlined) {
      font-size: 0.875rem;
    }
    .media-body {
      overflow: hidden;
    }
  }

  .dropdown-toggle::after {
    right: 0.6875rem;
  }

  @include media-breakpoint-down(md) {
    .dropdown-toggle::after {
      right: 0;
    }
  }
}
</style>

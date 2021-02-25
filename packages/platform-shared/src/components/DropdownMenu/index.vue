<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BDropdown
    :right="right"
    variant="link"
    toggle-class="text-decoration-none p-0">
    <template #button-content>
      <slot name="button-content" />
    </template>
    <slot name="dropdown-header" />
    <template v-for="(item, index) in dropdownItems">
      <template>
        <BDropdownItem
          :key="`sideDropdownItems_${index}`"
          :class="{'hidden': item.showForRoles && !userHasRole(item.showForRoles)}"
          @click="item.action">
          <i
            class="material-icons mr-2"
            aria-hidden="true">
            {{ item.icon }}
          </i>
          <span>
            {{ item.displayName }}
          </span>
        </BDropdownItem>
      </template>
      <BDropdownDivider
        :key="`sideDropdownItemsDivider_${index}`"
        v-if="dropdownItems.length == (index + 1) && enableLogout" />
    </template>
    <template v-if="showProfileLink">
      <BDropdownItem>
        <RouterLink :to="{ name: 'Profile' }">
          <BMedia class="text-left">
            <template #aside>
              <img
                :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                alt="Avatar"
                width="34"
                height="34">
            </template>
            <h5 class="my-0 text-truncate">
              {{ userDetails.name }}
            </h5>
            <div class="text-muted text-truncate">
              <template v-if="userDetails.email.length === 0">
                n/a
              </template>
              <template v-else>
                {{ userDetails.email }}
              </template>
            </div>
          </BMedia>
        </RouterLink>
      </BDropdownItem>
      <BDropdownDivider />
    </template>
    <BDropdownItem
      v-if="enableLogout"
      class="mb-2"
      @click="logoutUser()">
      <i class="material-icons material-icons-outlined mr-2">
        exit_to_app
      </i>
      {{ $t('sideMenu.signOut') }}
    </BDropdownItem>
  </BDropdown>
</template>
<script>
import {
  BDropdown,
  BDropdownItem,
  BDropdownDivider,
  BMedia,
} from 'bootstrap-vue';
import LoginMixin from '@forgerock/platform-shared/src/mixins/LoginMixin';

export default {
  name: 'DropdownMenu',
  components: {
    BDropdown,
    BDropdownDivider,
    BDropdownItem,
    BMedia,
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
    /**
     * Details about the current user. Displayed with admin and profile links.
     */
    userDetails: {
      type: Object,
      default: () => ({
        name: 'Fake Name',
        company: '',
        email: 'email@fake.com',
        adminURL: 'wwwfakecom',
        roles: [],
      }),
    },
  },
  methods: {
    userHasRole(roles) {
      if (roles) {
        const matchingRoles = this.userDetails.roles.filter((element) => roles.includes(element));
        return matchingRoles.length > 0;
      }
      return false;
    },
  },
};
</script>
<style lang="scss" scoped>
/deep/ {
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
    h5,
    span {
      font-size: 0.875rem;
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

.media-body {
  overflow: hidden;
}
</style>

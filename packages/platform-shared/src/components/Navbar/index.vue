<!-- Copyright (c) 2019-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <header class="sticky-top">
    <BNavbar
      class="fr-main-navbar align-content-center"
      data-testid="fr-main-navbar"
      toggleable>
      <button
        v-show="!hideToggle"
        @click="toggleMenu"
        class="navbar-toggler expand-sidebar"
        type="button"
        aria-controls="#fr-sidebar-nav"
        :aria-expanded="(menuIsExpanded).toString()"
        :aria-label="$t('sideMenu.toggleSidebar')">
        <FrIcon
          class="md-24 m-0"
          name="menu"
        />
      </button>
      <BNavbarNav class="flex-row align-items-center justify-content-between flex-grow-1">
        <div @click="$emit('clicked')">
          <RouterLink
            :aria-label="$t('common.breadcrumb')"
            class="fr-back-link overflow-hidden p-1 pl-4 pl-lg-0 mt-1"
            role="navigation"
            v-show="getBreadcrumbRoute().length > 0"
            :to="!checkChangesOnNavigate ? getBreadcrumbRoute() : ''">
            <h1 class="text-truncate h4">
              <FrIcon
                class="md-24 mr-3"
                name="arrow_back"
              />
              <span class="align-middle">
                {{ getBreadcrumbRouteText() }}
              </span>
            </h1>
          </RouterLink>
        </div>
        <div>
          <!-- Content displayed in center of navbar -->
          <slot name="center-content" />
        </div>
        <div class="flex-row d-flex">
          <slot name="right-content">
            <FrNotification v-if="showNotifications" />
            <li
              v-if="showHelpLink"
              class="mr-4 d-none d-sm-block nav-item">
              <a
                class="nav-link text-dark"
                :href="helpUrl"
                target="_blank">
                {{ $t('navbar.helpSupport') }}
              </a>
            </li>
            <li
              v-if="showDocsLink"
              class="d-none d-sm-block nav-item">
              <a
                class="nav-link text-dark"
                :href="docsLink"
                target="_blank">
                {{ $t('navbar.docs') }}
              </a>
            </li>
            <li v-if="!hideDropdown">
              <FrDropdownMenu
                :user-details="userDetails"
                :dropdown-items="tenantMenuItems"
                :show-profile-link="showProfileLink"
                enable-logout
                right
                class="pl-sm-4">
                <template #tenant-header>
                  <BDropdownHeader
                    v-if="$store.state.isFraas && $store.state.tenantInfo"
                    id="tenant-dropdown-header-label">
                    <h6 class="text-muted">
                      {{ $t('tenantSettings.details.tenant') }}
                    </h6>
                    <BMedia
                      class="text-left">
                      <template #aside>
                        <img
                          v-if="tenantRegionInfo"
                          :src="tenantRegionInfo.flag && require(`@forgerock/platform-admin/src/assets/images/flags/${tenantRegionInfo.flag}.svg`)"
                          :alt="$t('tenantSettings.details.flagAltText')"
                          class="mr-0"
                          width="18"
                          height="21">
                      </template>
                      <small class="text-muted my-auto">
                        {{ $store.state.tenantInfo.region }}
                      </small>
                    </BMedia>
                  </BDropdownHeader>
                </template>
                <template #button-content>
                  <BMedia
                    vertical-align="center"
                    class="text-left">
                    <template #aside>
                      <img
                        :src="profileImage ? profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                        :alt="$t('common.avatar')"
                        width="34"
                        height="34">
                    </template>
                    <div class="d-none d-lg-block sidebar-item-text fr-dropdown-button-content">
                      <h5 class="my-0 text-truncate">
                        {{ userDetails.company || userDetailsName }}
                      </h5>
                      <div class="text-muted text-truncate">
                        {{ userDetails.company ? userDetailsName : userDetails.email }}
                      </div>
                    </div>
                  </BMedia>
                </template>
                <template
                  #dropdown-header
                  v-if="userDetails.company || userDetails.subscription">
                  <BDropdownHeader
                    class="py-1 fr-dropdown-header">
                    <div class="mt-1">
                      <h6 v-if="tenantMenuItems.length">
                        {{ $t('common.tenant').toUpperCase() }}
                      </h6>
                      <h5 class="my-0">
                        {{ userDetails.company }}
                      </h5>
                      <span class="text-muted">
                        {{ userDetails.subscription }}
                      </span>
                    </div>
                  </BDropdownHeader>
                  <BDropdownDivider />
                </template>
              </FrDropdownMenu>
            </li>
          </slot>
        </div>
      </BNavbarNav>
    </BNavbar>
  </header>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import {
  BDropdownDivider,
  BDropdownHeader,
  BMedia,
  BNavbar,
  BNavbarNav,
} from 'bootstrap-vue';
import DropdownMenu from '@forgerock/platform-shared/src/components/DropdownMenu';
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import startCase from '@forgerock/platform-shared/src/utils/stringUtils';
import ToolbarNotification from '../ToolbarNotification';

/**
 * Application top navbar built upon bootstrap-vue navbar.
 * Contains a toggle button to toggle visibility of SideMenu component, breadcrumb navigation, and built in notifications
 */
export default {
  name: 'Navbar',
  mixins: [
    BreadcrumbMixin,
  ],
  components: {
    FrNotification: ToolbarNotification,
    FrDropdownMenu: DropdownMenu,
    FrIcon,
    BDropdownDivider,
    BDropdownHeader,
    BMedia,
    BNavbar,
    BNavbarNav,
  },
  props: {
    /**
     * State from Layout about if the menu is open (true) or closed (false)
     */
    menuIsExpanded: {
      default: () => false,
      type: Boolean,
    },
    /**
     * Allows view using this component to check for changes and prevents navigation
     */
    checkChangesOnNavigate: {
      default: false,
      type: Boolean,
    },
    /**
     * route of docs
     */
    docsLink: {
      type: String,
      default: '#',
    },
    /**
     * URL of help
     */
    helpUrl: {
      type: String,
      default: '#',
    },
    /**
     * Hide the dropdown button and menu.
     */
    hideDropdown: {
      type: Boolean,
      default: false,
    },
    /**
     * Hide button that emits toggle event to toggle the sidebar. Only visible on mobile.
     */
    hideToggle: {
      type: Boolean,
      default: false,
    },
    /**
     * Show link to Docs
     */
    showDocsLink: {
      type: Boolean,
      default: true,
    },
    /**
     * Show link to Help & Support
     */
    showHelpLink: {
      type: Boolean,
      default: true,
    },
    /**
     * Show notifications icon.
     */
    showNotifications: {
      type: Boolean,
      default: false,
    },
    /**
     * Show link to view profile
     */
    showProfileLink: {
      type: Boolean,
      default: true,
    },
    /**
     * Menu items displayed in dropdown
     */
    tenantMenuItems: {
      type: Array,
      default: () => [],
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
        adminUser: false,
        adminURL: 'wwwfakecom',
      }),
    },
  },
  computed: {
    ...mapState({
      userStore: (state) => state.UserStore,
    }),
    ...mapGetters({
      tenantRegionInfo: 'tenantRegionInfo',
    }),
    profileImage() {
      const { profileImage } = this.userStore;
      return profileImage && profileImage.length ? profileImage : null;
    },
    userDetailsName() {
      return startCase(this.userDetails.name);
    },
  },
  methods: {
    /**
     * From the navbar button toggling is possible with keyboard but not mouse or touch.
     * */
    toggleMenu() {
      /**
       * Triggered when the toggle button is clicked
       */
      this.$emit('toggle-menu');
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-main-navbar {
  background-color: $fr-navbar-bg;
  border-bottom: 1px solid $fr-navbar-border;
  height: 4.5rem;

  .fr-back-link {
    display: inline-block;
    height: 100%;

    &:hover {
      text-decoration: none;
    }

    h4 {
      margin-bottom: 0;
      font-weight: 400;
      font-size: 1rem;
    }
  }

  .navbar-nav .nav-link {
    padding: 0.5rem;
  }

  .navbar-toggler {
    padding: 0;
    border-width: 0;
    position: relative;

    &:focus {
      outline: 0;
    }
  }

  .fr-dropdown-button-content {
    max-width: 150px;
    padding-right: 2.25rem;
  }

  .fr-dropdown-header {
    h6 {
      color: $gray-500;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  }

  @media (any-hover: hover), all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    @include media-breakpoint-up(md) {
      .navbar-toggler {
        display: none;
      }
    }
  }

  @media (any-hover: none) {
    @include media-breakpoint-up(lg) {
      .navbar-toggler {
        display: none;
      }
    }
  }
}
</style>

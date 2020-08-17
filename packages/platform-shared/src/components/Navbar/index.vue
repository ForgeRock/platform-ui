<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BNavbar
    class="fr-main-navbar"
    sticky
    toggleable>
    <button
      v-show="!hideToggle"
      @click="toggleMenu"
      class="navbar-toggler expand-sidebar mt-2"
      type="button"
      aria-controls="#fr-sidebar-nav"
      :aria-expanded="(menuIsToggled).toString()"
      :aria-label="$t('sideMenu.toggleSidebar')">
      <span
        aria-hidden="true"
        class="material-icons-outlined md-24 m-0">
        menu
      </span>
    </button>
    <BNavbarNav class="flex-row align-items-center justify-content-between flex-grow-1">
      <div>
        <RouterLink
          class="fr-back-link overflow-hidden nav-link"
          v-show="getBreadcrumbRoute().length > 0"
          :to="getBreadcrumbRoute()">
          <h4 class="text-truncate">
            <i class="material-icons material-icons-outlined md-24 mr-3">
              arrow_back
            </i><span>{{ getBreadcrumbRouteText() }}</span>
          </h4>
        </RouterLink>
      </div>
      <div>
        <slot name="center-content" />
      </div>
      <div class="flex-row d-none d-sm-flex">
        <FrNotification v-if="showNotifications" />
        <!--TODO: This html list is invalid when rendered - wont fix today-->
        <li
          v-if="showHelpLink"
          class="mr-4 nav-item">
          <a
            class="nav-link text-dark"
            :href="helpURL"
            target="_blank">
            {{ $t('navbar.helpSupport') }}
          </a>
        </li>
        <li
          v-if="showDocsLink"
          class="nav-item">
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
            :enduser-link="enduserLink"
            enable-logout
            right
            class="pl-sm-4">
            <template #button-content>
              <BMedia
                vertical-align="center"
                class="text-left">
                <template #aside>
                  <img
                    :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                    alt="Avatar"
                    width="34"
                    height="34">
                </template>
                <div class="d-none d-lg-block sidebar-item-text fr-dropdown-button-content">
                  <h5 class="my-0 text-truncate">
                    {{ userDetails.company }}
                  </h5>
                  <span class="text-muted text-truncate">
                    {{ userDetails.name }}
                  </span>
                </div>
              </BMedia>
            </template>
            <template #dropdown-header>
              <BDropdownHeader
                class="pt-3 pb-1 fr-dropdown-header"
                v-if="userDetails.company || userDetails.subscription">
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
            </template>
          </FrDropdownMenu>
        </li>
      </div>
    </BNavbarNav>
  </BNavbar>
</template>

<script>
import {
  BDropdownHeader,
  BMedia,
  BNavbar,
  BNavbarNav,
} from 'bootstrap-vue';
import DropdownMenu from '@forgerock/platform-shared/src/components/DropdownMenu';
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
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
    BDropdownHeader,
    BMedia,
    BNavbar,
    BNavbarNav,
  },
  props: {
    /**
     * State from Layout about if the menu is open (true) or closed (false)
     */
    menuIsToggled: {
      default: () => false,
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
    helpURL: {
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
     * Show link to Enduser in dropdown menu
     */
    enduserLink: {
      type: String,
      default: '',
    },
    /**
     * Show notifications icon.
     */
    showNotifications: {
      type: Boolean,
      default: false,
    },
    /**
     * Menu items displayed in dropdown
     */
    tenantMenuItems: {
      type: Array,
      default: () => [],
    },
    /**
     * Details about the current user. Displayed with admin and enduser links.
     */
    userDetails: {
      type: Object,
      default: () => ({
        name: 'Fake Name',
        company: 'ForgeRock',
        email: 'email@fake.com',
        adminUser: false,
        adminURL: 'wwwfakecom',
      }),
    },
  },
  methods: {
    /**
     * From the navbar button toggling is possible with keyboard but not mouse or touch.
     * */
    toggleMenu() {
      this.$emit('toggle-menu');
    },
  },
};
</script>

<style lang="scss" scoped>
.fr-main-navbar {
  background-color: $white;
  border-bottom: 1px solid $gray-200;
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
    bottom: 10px;

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
      font-size: 0.6875rem;
    }
  }

  @media (any-hover: hover) {
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

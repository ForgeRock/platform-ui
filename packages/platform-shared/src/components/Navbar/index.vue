<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BNavbar
    class="fr-main-navbar"
    :toggleable="true"
    :sticky="true">
    <button
      v-show="!hideToggle"
      @click="toggleMenuMobile"
      class="navbar-toggler expand-sidebar mt-2"
      type="button"
      aria-controls="#fr-sidebar-nav"
      :aria-expanded="(menuMobileIsToggled).toString()"
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
            href="#">
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
      </div>
    </BNavbarNav>
  </BNavbar>
</template>

<script>
import {
  BNavbar,
  BNavbarNav,
} from 'bootstrap-vue';
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
    BNavbar,
    BNavbarNav,
  },
  props: {
    /**
     * State from Layout about if the mobile menu is open (true) or closed (false)
     */
    menuMobileIsToggled: {
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
  },
  methods: {
    /**
     * From the navbar button toggling is possible with keyboard but not mouse or touch.
     * */
    toggleMenuMobile() {
      this.$emit('toggle-menu-mobile');
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

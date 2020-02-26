<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BNavbar
    :toggleable="true"
    class="fr-main-navbar fixed-top">
    <button
      v-show="!hideToggle"
      @click="collapse"
      class="navbar-toggler expand-sidebar mt-2"
      type="button"
      aria-label="Toggle side navigation">
      <i class="material-icons-outlined md-24 m-0">
        menu
      </i>
    </button>
    <RouterLink
      class="fr-back-link mt-2 overflow-hidden"
      v-show="getBreadcrumbRoute().length > 0"
      :to="getBreadcrumbRoute()">
      <h4 class="text-truncate">
        <i class="material-icons material-icons-outlined mr-2 mb-1">
          arrow_back
        </i><span>{{ getBreadcrumbRouteText() }}</span>
      </h4>
    </RouterLink>
    <BNavbarNav class="ml-auto flex-row">
      <FrNotification v-if="showNotifications" />
      <li
        v-if="showHelpLink"
        class="mr-4 nav-item">
        <a
          class="nav-link"
          href="#">
          Help & Support
        </a>
      </li>
      <li
        v-if="showDocsLink"
        class="nav-item">
        <a
          class="nav-link"
          :href="docsLink"
          target="_blank">
          Docs
        </a>
      </li>
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
     * Hide button that emits toggle event to toggle the sidebar. Only visible on mobile.
     */
    hideToggle: {
      type: Boolean,
      default: false,
    },
    /**
     * Show notifications icon.
     */
    showNotifications: {
      type: Boolean,
      default: false,
    },
    /**
     * Show link to Help & Support
     */
    showHelpLink: {
      type: Boolean,
      default: true,
    },
    /**
     * URL of help
     */
    helpURL: {
      type: String,
      default: '#',
    },
    /**
     * Show link to Docs
     */
    showDocsLink: {
      type: Boolean,
      default: true,
    },
    /**
     * route of docs
     */
    docsLink: {
      type: String,
      default: '#',
    },
  },
  data() {
    return {};
  },
  methods: {
    collapse() {
      /**
       * Emitted when clicking the toggle button to expand/collapse sidenav.
       * @event toggle-mobile
       */
      this.$emit('toggle-mobile', true);
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

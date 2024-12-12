<!-- Copyright (c) 2019-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <header class="sticky-top">
    <BNavbar
      class="fr-main-navbar align-content-center"
      data-testid="fr-main-navbar"
      toggleable
      :aria-label="$t('sideMenu.headerNavigation')">
      <button
        v-show="showToggle"
        @click="toggleMenu"
        class="navbar-toggler expand-sidebar"
        type="button"
        aria-controls="#fr-sidebar-nav"
        :aria-expanded="(menuIsExpanded).toString()"
        :aria-label="$t('sideMenu.toggleSidebar')">
        <FrIcon
          icon-class="md-24 m-0"
          name="menu"
        />
      </button>
      <BNavbarNav class="flex-row align-items-center justify-content-between flex-grow-1">
        <li
          v-if="tenantLockedMode"
          class="d-flex align-items-center px-3">
          <FrIcon
            icon-class="locked-icon md-24 mr-2"
            name="locked" />
          <p class="mb-0">
            {{ $t('promotions.tenantLocked') }}
          </p>
          <BLink
            href="#"
            id="infopopover-promotion"
            class="text-body ml-2"
            :title="lockedPopoverMessage"
            v-b-tooltip.hover.focus>
            <FrIcon name="info" />
          </BLink>
        </li>
        <li
          v-else
          class="d-flex align-items-center"
          @click="$emit('clicked')">
          <RouterLink
            :aria-label="$t('common.breadcrumb')"
            active-class=""
            class="fr-back-link overflow-hidden pl-4 pl-lg-0 mt-0"
            role="navigation"
            v-show="hasBreadcrumb"
            :to="!checkChangesOnNavigate ? returnRoute : ''">
            <div class="text-truncate h5 d-flex align-items-center font-weight-normal mb-0">
              <FrIcon
                icon-class="md-24 mr-3"
                name="arrow_back">
                <span class="align-middle">
                  {{ returnRouteText }}
                </span>
              </FrIcon>
            </div>
          </RouterLink>
        </li>
        <li class="d-flex align-items-center">
          <!-- Content displayed in center of navbar -->
          <slot name="center-content" />
        </li>
        <li class="flex-row d-flex">
          <slot name="right-content">
            <FrNotification v-if="showNotifications" />
            <div
              v-if="showHelpLink"
              class="mr-4 d-none d-sm-block nav-item">
              <a
                class="nav-link text-dark"
                :href="helpUrl"
                target="_blank">
                {{ $t('navbar.helpSupport') }}
              </a>
            </div>
            <div
              v-if="showDocsLink"
              class="d-none d-sm-block nav-item">
              <a
                class="nav-link text-dark"
                :href="docsLink"
                target="_blank">
                {{ $t('navbar.docs') }}
              </a>
            </div>
            <div v-if="showDropdown">
              <FrDropdownMenu
                :dropdown-items="tenantMenuItems"
                :show-profile-link="showProfileLink"
                enable-logout
                right
                class="pl-sm-4">
                <template #tenant-header>
                  <BDropdownHeader
                    v-if="$store.state.isFraas && hasTenantInfo"
                    id="tenant-dropdown-header-label">
                    <div class="h6 text-muted">
                      {{ $t('tenantSettings.details.tenant') }}
                    </div>
                    <BMedia>
                      <FrTenantTierBadge :tenant-tier="$store.state.promotionTenantInfo.currentTier" />
                      <template>
                        <img
                          v-if="tenantRegionInfo"
                          :src="tenantRegionInfo.flag && require(`@forgerock/platform-shared/src/assets/images/flags/${tenantRegionInfo.flag}.svg`)"
                          :alt="$t('tenantSettings.details.flagAltText')"
                          class="mr-2"
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
                      <BAvatar
                        size="34"
                        variant="light"
                        :src="profileImage.length ? profileImage : require('@forgerock/platform-shared/src/assets/images/avatar.png')" />
                    </template>
                    <div class="d-none d-lg-block sidebar-item-text fr-dropdown-button-content">
                      <div class="h5 my-0 text-truncate">
                        {{ userDetails.company || userDetails.name }}
                      </div>
                      <div class="text-muted text-truncate">
                        {{ userDetails.company ? userDetails.name : userDetails.email }}
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
                      <div
                        v-if="tenantMenuItems.length"
                        class="h6">
                        {{ $t('common.tenant').toUpperCase() }}
                      </div>
                      <div class="h5 my-0">
                        {{ userDetails.company }}
                      </div>
                      <span class="text-muted">
                        {{ userDetails.subscription }}
                      </span>
                    </div>
                  </BDropdownHeader>
                  <BDropdownDivider />
                </template>
              </FrDropdownMenu>
            </div>
          </slot>
        </li>
      </BNavbarNav>
    </BNavbar>
  </header>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  BAvatar,
  BDropdownDivider,
  BDropdownHeader,
  BLink,
  BMedia,
  BNavbar,
  BNavbarNav,
  VBTooltip,
} from 'bootstrap-vue';
import DropdownMenu from '@forgerock/platform-shared/src/components/DropdownMenu';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrTenantTierBadge from '@forgerock/platform-shared/src/components/TenantTierBadge';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import ToolbarNotification from '../ToolbarNotification';

/**
 * Application top navbar built upon bootstrap-vue navbar.
 * Contains a toggle button to toggle visibility of SideMenu component, breadcrumb navigation, and built in notifications
 */
export default {
  name: 'Navbar',
  components: {
    FrNotification: ToolbarNotification,
    FrDropdownMenu: DropdownMenu,
    FrIcon,
    BAvatar,
    BDropdownDivider,
    BDropdownHeader,
    BLink,
    BMedia,
    BNavbar,
    BNavbarNav,
    FrTenantTierBadge,
  },
  directives: {
    'b-tooltip': VBTooltip,
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
     * Show the dropdown button and menu.
     */
    showDropdown: {
      type: Boolean,
      default: false,
    },
    /**
     * Show button that emits toggle event to toggle the sidebar. Only visible on mobile.
     */
    showToggle: {
      type: Boolean,
      default: false,
    },
    /**
     * Show this message in the tenant-locked popover.
     */
    lockedPopoverMessage: {
      type: String,
      default: '',
    },
    /**
     * Show link to Docs
     */
    showDocsLink: {
      type: Boolean,
      default: false,
    },
    /**
     * Show link to Help & Support
     */
    showHelpLink: {
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
     * Show link to view profile
     */
    showProfileLink: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to show the navbar as it should appear when locked for promotion
     */
    tenantLockedMode: {
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
  },
  setup() {
    const { returnRoute, returnRouteText, hasBreadcrumb } = useBreadcrumb(false);
    return {
      returnRoute,
      returnRouteText,
      hasBreadcrumb,
    };
  },
  computed: {
    ...mapState(useUserStore, ['userDetails']),
    ...mapState(useEnduserStore, ['profileImage']),
    ...mapGetters({
      hasTenantInfo: 'hasTenantInfo',
      tenantRegionInfo: 'tenantRegionInfo',
    }),
  },
  methods: {
    /**
     * From the navbar button toggling is possible with keyboard but not mouse or touch.
     */
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
  height: $fr-navbar-height;

  .fr-back-link {
    display: inline-block;
    height: 100%;

    &:hover {
      text-decoration: none;
    }

    .h4 {
      margin-bottom: 0;
      font-weight: 400;
      font-size: 1rem;
      color: $gray-800;
    }
  }

  :deep(.locked-icon) {
    max-width: 24px;
    width: 100%
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

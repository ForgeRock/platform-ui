<!-- Copyright (c) 2019-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    id="app"
    :class="[{
      'fr-menu-mobile': useMobileStyleMenu,
      'fr-menu-expanded': menuExpanded === true && !hideSideMenu,
      'fr-menu-collapsed': menuExpanded === false && !hideSideMenu,
      'fr-menu-hidden': hideSideMenu,
      'fr-system-notification-active': systemNotificationActive && !hideNavBar,
      'fr-hover-disabled': disableHoveredStyling,
    }, 'h-100']">
    <FrSystemNotification
      v-if="(systemNotification && !hideNavBar)"
      :data="systemNotification"
      :active="systemNotificationActive"
      @hide-system-notification="$emit('hide-system-notification')" />
    <FrSideMenu
      @toggle-menu="toggleMenu"
      @mouse-leave="onMouseLeave"
      :menu-is-expanded="menuExpanded"
      :menu-items="menuItems"
      :dropdown-items="realmMenuItems"
      :realm="realm"
      :realm-aliases="realmAliases"
      v-show="!hideSideMenu" />
    <div class="content">
      <FrNavBar
        @toggle-menu="toggleMenu"
        :menu-is-expanded="menuExpanded"
        :show-notifications="false"
        show-toggle
        show-dropdown
        :show-help-link="!isFraas && !isEnduser"
        :show-docs-link="!isFraas && !isEnduser"
        :show-profile-link="!isInternalUser"
        :tenant-menu-items="tenantMenuItems"
        :docs-link="docsLink"
        help-url="https://backstage.forgerock.com/"
        v-show="!hideNavBar" />
      <div
        id="appContent"
        :class="{'show-navbar': !hideNavBar}">
        <!-- slot for router -->
        <slot />
        <notifications
          class="ml-3"
          position="bottom left"
          width="320"
          :duration="4000">
          <template #body="props">
            <FrAlert
              :variant="props.item.type"
              :title="props.item.text"
              show>
              {{ props.item.text }}
            </FrAlert>
          </template>
        </notifications>
      </div>
      <footer
        v-if="showFooter"
        class="app-footer">
        <div
          v-if="footer"
          v-html="footer" />
        <div
          v-else
          class="d-flex flex-column flex-md-row justify-content-center align-items-center py-4">
          <div class="ping-logo-container mr-3 opacity-20 mb-2 mb-md-0 d-flex">
            <div class="ping-logo ping-logo-square-footer" />
          </div>
          <div
            class="mr-4 opacity-70">
            <span class="pr-1">
              © {{ currentYear }}
            </span>
            <a
              href="http://www.pingidentity.com"
              target="_blank"
              class="text-body">
              Ping Identity Corporation
            </a>
          </div>
          <div
            v-if="releaseInfo"
            class="mr-4 opacity-70"
            data-testid="release-info">
            <RouterLink
              class="text-body"
              :to="{
                name: 'TenantSettings',
                params: {
                  resourceName: 'details',
                }
              }">
              {{ $t('common.releaseInfo', { version: releaseInfo.currentVersion }) }}
            </RouterLink>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import Alert from '@forgerock/platform-shared/src/components/Alert/';
import Navbar from '@forgerock/platform-shared/src/components/Navbar/';
import SideMenu from '@forgerock/platform-shared/src/components/SideMenu/';
import SystemNotification from '@forgerock/platform-shared/src/components/SystemNotification/';
import MediaMixin from '@forgerock/platform-shared/src/mixins/MediaMixin';

/**
 * Layout component for any packages that use the same sidemenu, navbar, and app content UX
 */
export default {
  name: 'Layout',
  components: {
    FrNavBar: Navbar,
    FrSideMenu: SideMenu,
    FrAlert: Alert,
    FrSystemNotification: SystemNotification,
  },
  mixins: [MediaMixin],
  props: {
    /**
     * Footer strip that can be shown at the bottom of both enduser and admin. Can be fed from theme.
     */
    footer: {
      type: String,
      default: '',
    },
    /**
     * Is this component being used in enduser
     */
    isEnduser: {
      type: Boolean,
      default: false,
    },
    /**
     * Indicates if we are running in cloud
     */
    isFraas: {
      type: Boolean,
      default: false,
    },
    /**
     * Is the current user internal or external
     */
    isInternalUser: {
      type: Boolean,
      default: false,
    },
    /**
     * Menu items to display for primary navigation (SideMenu)
     */
    menuItems: {
      type: Array,
      default: () => [],
    },
    /**
     * Realm name (SideMenu)
     */
    realm: {
      type: String,
      default: '',
    },
    /**
     * Realm alias (SideMenu)
     */
    realmAliases: {
      type: String,
      default: '',
    },
    /**
     * Menu items to display in realm dropdown (SideMenu)
     */
    realmMenuItems: {
      type: Array,
      default: () => [],
    },
    /**
     * Menu items to display in tenant dropdown (Navbar)
     */
    tenantMenuItems: {
      type: Array,
      default: () => [],
    },
    /**
     * Tenant Release info displayed in footer
     */
    releaseInfo: {
      type: Object,
      default: null,
    },
    systemNotification: {
      type: Object,
      default: () => {},
    },
    systemNotificationActive: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentYear: new Date().getFullYear(),
      menuExpanded: true,
      useMobileStyleMenu: false,
      hideNavBar: false,
      hideSideMenu: false,
      disableHoveredStyling: false,
    };
  },
  watch: {
    $route: {
      handler(to) {
        this.hideNavBar = to.meta.hideNavBar;
        this.hideSideMenu = to.meta.hideSideMenu;
      },
      immediate: true,
    },
  },
  computed: {
    docsLink() {
      if (this.isFraas) {
        return 'https://backstage.forgerock.com/docs/idcloud/latest/index.html';
      }
      return 'https://backstage.forgerock.com/docs/index.html';
    },
    showFooter() {
      return !this.hideNavBar && (!this.isEnduser || (this.isEnduser && this.footer));
    },
  },
  mounted() {
    this.determineMobileStyleMenu();
    window.addEventListener('resize', this.determineMobileStyleMenu);

    if (this.media('lt-lg').matches) {
      this.menuExpanded = false;
    }

    // fires only once media breakpoint is changed.
    this.media('md').addListener((e) => {
      if (e.matches) {
        this.menuExpanded = false;
      }
    });
  },
  methods: {
    /**
     * Define whether to use the mobile style menu based on screen size and if hover is available
     */
    determineMobileStyleMenu() {
      if (this.media('any-hover').matches) {
        if (this.media('lt-md').matches) {
          this.useMobileStyleMenu = true;
        } else {
          this.useMobileStyleMenu = false;
        }
      } else if (this.media('lt-lg').matches) {
        this.useMobileStyleMenu = true;
      } else {
        this.useMobileStyleMenu = false;
      }
    },
    /**
     * Toggle the expanded state of the menu
     * after toggle, if the menu state is collapsed, setting disableHoveredStyling to true to avoid applying hovered styling
     */
    toggleMenu() {
      this.menuExpanded = !this.menuExpanded;
      if (!this.menuExpanded) {
        this.disableHoveredStyling = true;
      }
    },
    /**
     * Captures the mouse leave event from the sidebar
     * resets disableHoveredStyling to false, for re-applying hover styling whenever user hover over the element.
     */
    onMouseLeave() {
      if (this.disableHoveredStyling) {
        this.disableHoveredStyling = false;
      }
    },
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.determineMobileStyleMenu);
  },
};
</script>

<style lang="scss">
body {
  overflow-x: hidden;
}

#app.fr-menu-collapsed {
  @media (any-hover: hover), all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    @include media-breakpoint-up(sm) {
      .content {
        padding-left: $fr-sidemenu-width-sm;
      }
    }

    @include media-breakpoint-down(sm) {
      .content {
        padding-left: 0;
      }
    }
  }
}

#app.fr-menu-expanded:not(.fr-menu-mobile) {
  .content {
    padding-left: $fr-sidemenu-width-lg;
  }
}

#app.fr-menu-hidden {
  .content {
    padding-left: 0;
    height: 100%;
  }

  .app-footer {
    width: 100%;
  }
}

#app {
  .content {
    min-height: 100vh;
    position: relative;
    transition: padding-left 0.2s ease-out;

    @media (any-hover: hover), all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
      @include media-breakpoint-up(md) {
        padding-left: $fr-sidemenu-width-lg;
      }

      @include media-breakpoint-between(sm, md) {
        padding-left: $fr-sidemenu-width-sm;
      }

      @include media-breakpoint-down(sm) {
        padding-left: 0 !important;
      }
    }

    @media (any-hover: none) {
      @include media-breakpoint-down(md) {
        padding-left: 0;
      }
    }
  }
}

#appContent {
  height: 100%;

  &.show-navbar {
    padding-bottom: 124px;
    height: calc(100% - 141px);
  }

  .container,
  .container-fluid {
    padding-left: 3.5rem;
    padding-right: 3.5rem;
  }
}

.app-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .app-footer {
    width: calc(100% - 4em);
  }

  .fr-menu-expanded .app-footer {
    width: calc(100% - 15.25em);
  }
}

.ping-logo-container {
  width: 21px;
  height: 21px;
}

.fr-system-notification-active #appContent {
  padding-top: $fr-system-notification-height;
}

.fr-system-notification-active .fr-main-navbar{
  top: $fr-system-notification-height;
}

.fr-system-notification-active .fr-sidebar-wrapper {
  top: $fr-system-notification-height !important;
}
</style>

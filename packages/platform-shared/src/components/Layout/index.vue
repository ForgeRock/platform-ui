<!-- Copyright (c) 2019-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    id="app"
    :class="[{
      'fr-menu-mobile': useMobileStyleMenu,
      'fr-menu-expanded': menuExpanded === true && !hideNav,
      'fr-menu-collapsed': menuExpanded === false,
      'fr-navbar-hidden': hideNav,
    }, 'h-100']">
    <FrSideMenu
      @toggle-menu="toggleMenu"
      :menu-is-expanded="menuExpanded"
      :menu-items="menuItems"
      :dropdown-items="realmMenuItems"
      :realm="realm"
      :realm-aliases="realmAliases"
      :user-details="userDetails"
      v-show="!hideNav" />
    <div class="content">
      <FrNavBar
        @toggle-menu="toggleMenu"
        :menu-is-expanded="menuExpanded"
        :show-notifications="false"
        :show-help-link="!$store.state.isFraas || !isEnduser"
        :show-docs-link="!$store.state.isFraas || !isEnduser"
        :tenant-menu-items="tenantMenuItems"
        :user-details="userDetails"
        :docs-link="docsLink"
        help-url="https://backstage.forgerock.com/"
        v-show="!hideNav" />
      <div
        id="appContent"
        :class="[{'show-navbar': !hideNav}, 'app-content']">
        <Transition
          name="fade"
          mode="out-in">
          <slot />
        </Transition>
        <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
        <notifications
          class="ml-3"
          position="bottom left"
          width="320"
          animation-type="velocity"
          :animation="animation"
          :duration="4000">
          <template v-slot:body="props">
            <FrAlert
              :variant="props.item.type"
              :title="props.item.text"
              show>
              {{ props.item.text }}
            </FrAlert>
          </template>
        </notifications>
      </div>
      <div
        v-if="!hideNav && !isEnduser"
        id="appFooter">
        <div class="d-flex flex-column flex-md-row justify-content-center align-items-center py-4">
          <div class="fr-logo-container mr-3 opacity-20 mb-2 mb-md-0 d-flex">
            <div class="fr-logo fr-logo-vertical-black" />
          </div>
          <div class="mr-4 opacity-70">
            <span class="pr-1">
              © {{ currentYear }}
            </span>
            <a
              href="http://www.forgerock.com"
              target="_blank"
              class="notranslate text-body">
              ForgeRock, Inc
            </a>
          </div>
          <div
            v-if="buildNumber && buildDateTime"
            class="mr-4 opacity-70">
            {{ $t('common.buildNumber', {buildNumber, buildDateTime: $d(buildDateTime, 'buildDateTime')}) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Alert from '@forgerock/platform-shared/src/components/Alert/';
import Navbar from '@forgerock/platform-shared/src/components/Navbar/';
import SideMenu from '@forgerock/platform-shared/src/components/SideMenu/';
import Media from '@forgerock/platform-shared/src/mixins/Media';
/**
 * @description Layout component for any packages that use the same sidemenu, navbar, and app content UX
 */
export default {
  name: 'Layout',
  components: {
    FrNavBar: Navbar,
    FrSideMenu: SideMenu,
    FrAlert: Alert,
  },
  mixins: [
    Media,
  ],
  props: {
    isEnduser: {
      type: Boolean,
      default: false,
    },
    menuItems: {
      type: Array,
      default: () => [],
    },
    realm: {
      type: String,
      default: '',
    },
    realmAliases: {
      type: String,
      default: '',
    },
    realmMenuItems: {
      type: Array,
      default: () => [],
    },
    tenantMenuItems: {
      type: Array,
      default: () => [],
    },
    buildNumber: {
      type: String,
      default: '',
    },
    buildDateTime: {
      type: Date,
      default: () => new Date(0),
    },
  },
  data() {
    return {
      currentYear: new Date().getFullYear(),
      menuExpanded: true,
      useMobileStyleMenu: false,
      hideNav: true,
    };
  },
  watch: {
    $route(to) {
      this.hideNav = to.meta.hideNav;
    },
  },
  computed: {
    ...mapGetters({
      userDetails: 'UserStore/userDetails',
    }),
    docsLink() {
      if (this.$store.state.isFraas === true) {
        return 'https://backstage.forgerock.com/docs/idcloud/latest/index.html';
      }
      return 'https://backstage.forgerock.com/docs/index.html';
    },
    animation() {
      return {
        enter(element) {
          /*
          *  "element" - is a notification element
          *    (before animation, meaning that you can take it's initial height, width, color, etc)
          */
          const height = element.clientHeight;

          return {
            // Animates from 0px to "height"
            height: [height, 0],
            // Animates from 0 to 1
            opacity: [1, 0],
          };
        },
        leave: {
          height: 0,
          opacity: 0,
        },
      };
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
    toggleMenu() {
      this.menuExpanded = !this.menuExpanded;
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.determineMobileStyleMenu);
  },
};
</script>

<style lang="scss">
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

#app.fr-navbar-hidden {
  .content {
    padding-left: 0;
    height: 100%;
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

#appFooter {
  position: absolute;
  bottom: 0;
  width: 100%;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  #appFooter {
    width: calc(100% - 4em);
  }

  .fr-menu-expanded #appFooter {
    width: calc(100% - 15.25em);
  }
}

.fr-logo-container {
  width: 21px;
  height: 21px;
}
</style>

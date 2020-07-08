<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    id="app"
    :class="[{
      'fr-menu-mobile': toggledMenuMobile,
      'fr-menu-expanded': toggled === true,
      'fr-menu-collapsed': toggled === false,
      'fr-navbar-hidden': hideNav,
    }, 'h-100']">
    <FrSideMenu
      @toggle-menu="toggleMenu"
      @toggle-menu-mobile="toggleMenuMobileHandler"
      @logout="$emit('logout')"
      :menu-mobile-is-toggled="toggledMenuMobile"
      :user-details="userDetails"
      :menu-items="menuItems"
      :enduser-link="$store.state.enduserURL"
      v-show="!hideNav" />
    <div class="content">
      <FrNavBar
        @toggle-menu-mobile="toggleMenuMobileHandler"
        :menu-mobile-is-toggled="toggledMenuMobile"
        :show-notifications="false"
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
          position="bottom left"
          width="320"
          :duration="4000">
          <template v-slot:body="props">
            <FrAlert
              :variant="props.item.type"
              show>
              {{ props.item.text }}
            </FrAlert>
          </template>
        </notifications>
      </div>
      <div
        v-if="!hideNav"
        id="appFooter">
        <div class="d-flex flex-column flex-md-row justify-content-center align-items-center py-4">
          <div class="mr-3 opacity-20 mb-2 mb-md-0 d-flex">
            <img
              src="../../assets/images/vertical-logo-black.svg"
              alt="ForgeRock"
              height="21">
          </div>
          <div class="mr-4 opacity-70">
            <span class="pr-1">
              © 2020
            </span>
            <a
              href="http://www.forgerock.com"
              target="_blank"
              class="notranslate text-body">
              ForgeRock, Inc
            </a>
          </div>
          <div
            v-if="version"
            class="mr-4 opacity-70">
            {{ $t('common.version', {version}) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  props: {
    menuItems: {
      type: Array,
      default: () => [],
    },
    userDetails: {
      type: Object,
      default: () => ({
        name: 'Company Name',
        company: 'Company',
        email: 'email@company.com',
        adminUser: false,
        adminURL: 'www.company.com',
      }),
    },
    version: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      toggled: true,
      toggledMenuMobile: false,
      hideNav: true,
    };
  },
  watch: {
    $route(to) {
      this.hideNav = to.meta.hideNav;
    },
  },
  mounted() {
    // fires only once media breakpoint is changed.
    this.media('md').addListener((e) => {
      if (e.matches) {
        this.toggledMenuMobile = false;
      }
    });
  },
  methods: {
    toggleMenu() {
      if (this.media('lt-lg').matches && this.toggled === null) {
        this.toggled = true;
      } else if (this.media('lg').matches && this.toggled === null) {
        this.toggled = false;
      } else {
        this.toggled = this.toggled === null ? false : !this.toggled;
      }
    },
    toggleMenuMobileHandler() {
      this.toggledMenuMobile = !this.toggledMenuMobile;
    },
  },
  mixins: [
    Media,
  ],
};
</script>

<style lang="scss">
#app.fr-menu-collapsed {
  @media (any-hover: hover) {
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

#app.fr-menu-expanded {
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
    min-height: 100%;
    position: relative;
    transition: padding-left 0.2s ease-out;

    @media (any-hover: hover) {
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
</style>

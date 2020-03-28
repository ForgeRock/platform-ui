<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    id="app"
    :class="{
      'fr-menu-mobile': toggledMobile,
      'fr-menu-expanded': toggled === true,
      'fr-menu-collapsed': toggled === false,
      'fr-menu-hidden': hideNav,
    }">
    <FrSideMenu
      @toggle-menu="toggleMenu"
      @toggle-menu-mobile="toggleMenuMobile"
      @logout="$emit('logout')"
      :open-menu="toggled"
      :user-details="userDetails"
      :menu-items="menuItems"
      :enduser-link="$store.state.enduserURL"
      v-show="!hideNav" />
    <div class="content h-100">
      <FrNavBar
        @toggle-mobile="toggleMenuMobile"
        :show-notifications="false"
        v-show="!hideNav" />
      <div
        id="appContent"
        class="app-content">
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
    </div>
  </div>
</template>

<script>
import Alert from '@forgerock/platform-shared/src/components/Alert/';
import Navbar from '@forgerock/platform-shared/src/components/Navbar/';
import SideMenu from '@forgerock/platform-shared/src/components/SideMenu/';

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
  },
  data() {
    return {
      toggled: undefined,
      toggledMobile: false,
      hideNav: true,
    };
  },
  watch: {
    $route(to) {
      this.hideNav = to.meta.hideNav;
    },
  },
  methods: {
    toggleMenu() {
      if (window.innerWidth < 992 && this.toggled === undefined) {
        this.toggled = true;
      } else if (window.innerWidth > 992 && this.toggled === undefined) {
        this.toggled = false;
      } else {
        this.toggled = this.toggled === undefined ? false : !this.toggled;
      }
    },
    toggleMenuMobile() {
      this.toggledMobile = !this.toggledMobile;
    },
  },
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

#app.fr-menu-hidden {
  .content {
    padding-left: 0;
  }
}

#app {
  .content {
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

</style>

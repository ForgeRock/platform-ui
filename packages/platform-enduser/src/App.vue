<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    id="app"
    :class="{ 'fr-menu-locked': toolbarToggled, 'fr-menu-unlocked': !hideNav && !toolbarToggled }">
    <div
      id="wrapper"
      :class="[{'toggled': toolbarToggled && !this.$route.meta.hideToolbar}]">
      <FrSideMenu
        @locked="lockMenu"
        @logout="logoutUser"
        :open-menu="toolbarToggled"
        :user-details="userDetails"
        :enduser-link="$store.state.enduserURL"
        :menu-items="menuItems"
        v-show="!hideNav" />
      <div
        id="appContent"
        :class="[{'fr-no-toolbar': this.$route.meta.hideToolbar}]">
        <!-- Navigation Bar using Vue Route + Bootstrap Toolbar -->
        <FrNavBar
          class="fr-main-navbar"
          @toggle="onToggle"
          :show-notifications="true"
          v-show="!hideNav" />
        <Transition
          name="fade"
          mode="out-in">
          <RouterView :key="this.$route.fullPath" />
        </Transition>
      </div>
    </div>
    <!-- Application View -->
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
    <notifications
      group="IDMMessages"
      position="bottom left"
      width="320"
      :duration="4000">
      <template
        slot="body"
        slot-scope="props">
        <div
          :class="[{ 'alert-success': (props.item.type == 'success'), 'alert-warning': (props.item.type == 'warning'), 'alert-danger': (props.item.type == 'error'), 'alert-info': (props.item.type == 'info')}, 'alert', 'alert-dismissible', 'd-flex', 'p-3', 'pr-5', 'position-relative']"
          role="alert">
          <div
            :class="[{ 'text-success': (props.item.type == 'success'), 'text-warning': (props.item.type == 'warning'), 'text-danger': (props.item.type == 'error'), 'text-info': (props.item.type == 'info')}, 'alert-icon', 'mr-3', 'align-self-top']">
            <i class="material-icons-outlined md-24 m-0">
              {{ getMaterialIcon(props.item.type) }}
            </i>
          </div>
          <div class="fr-alert-content align-self-center">
            <p
              class="mb-0 text-left"
              v-html="props.item.text" />
          </div>
          <a
            class="close"
            @click="props.close">
            <i class="material-icons-outlined md-16 m-0 font-weight-bolder cursor-pointer">
              close
            </i>
          </a>
        </div>
      </template>
    </notifications>
  </div>
</template>

<script>
import {
  capitalize,
} from 'lodash';
import { mapState } from 'vuex';
import SideMenu from '@forgerock/platform-components/src/components/sidemenu/';
import NavBar from '@forgerock/platform-components/src/components/navbar/';
import LoginMixin from '@forgerock/platform-components/src/mixins/LoginMixin';

export default {
  name: 'App',
  mixins: [
    LoginMixin,
  ],
  components: {
    FrSideMenu: SideMenu,
    FrNavBar: NavBar,
  },
  data() {
    return {
      toolbarToggled: false,
      locked: false,
      hideNav: true,
      menuItems: [{
        routeName: 'Dashboard',
        displayName: this.$t('sideMenu.dashboard'),
        icon: 'dashboard',
      }, {
        routeName: 'Profile',
        displayName: 'Profile',
        icon: 'account_circle',
      }],
    };
  },
  mounted() {
  },
  computed: {
    /**
     * Sets initial variable values from userstore-saved information
     */
    ...mapState({
      internalUser: (state) => state.UserStore.internalUser,
      userId: (state) => state.UserStore.userId,
      adminUser: (state) => state.UserStore.adminUser,
      accessObj: (state) => state.UserStore.access,
      adminURL: (state) => state.ApplicationStore.adminURL,
      amDataEndpoints: (state) => state.ApplicationStore.amDataEndpoints,
      userDetails: (state) => {
        let userFullName;
        const {
          givenName,
          sn,
          userName,
          company,
          email,
          adminUser,
          userId,
        } = state.UserStore;
        if (givenName || sn) {
          userFullName = `${givenName} ${sn}`;
        } else {
          userFullName = userName || userId;
        }
        return {
          name: userFullName,
          company: company || 'ForgeRock',
          email,
          adminUser,
          adminURL: state.ApplicationStore.adminURL,
        };
      },
    }),
  },
  watch: {
    $route(to) {
      this.hideNav = to.meta.hideNav;
    },
    amDataEndpoints(value) {
      if (value && this.internalUser === false) {
        this.menuItems.push({
          displayName: 'Sharing',
          icon: 'share',
          routeName: 'Sharing',
        });
      }
    },
    /**
     * when we receive user-saved data of managed resources,
     * add them to iterated selectable menu items
     */
    accessObj() {
      this.accessObj.forEach((obj) => {
        const splitObj = obj.privilegePath.split('/');
        this.menuItems.push({
          displayName: capitalize(obj.title),
          icon: this.accessIcon(obj.icon),
          routeName: 'ListResource',
          resourceName: splitObj[1],
          resourceType: splitObj[0],
        });
      });
    },
  },
  methods: {
    onToggle() {
      this.toolbarToggled = !this.toolbarToggled;
    },
    /**
     * Sets locked variables when sidemenu is changed to allow
     * css hooks to change widths
     * @param {Boolean} locked Required state that we are setting locked state to
     */
    lockMenu(locked) {
      this.locked = locked;
      this.toolbarToggled = locked;
    },
    /**
     * Determines if icon string is a font awesome or material icon
     * @param {String} icon Required name of icon
     */
    accessIcon(icon) {
      let matIcon = 'check_box_outline_blank';
      if (icon && icon.length && icon.substring(0, 3) !== 'fa-') {
        matIcon = icon;
      }

      return matIcon;
    },
    /**
     * Retrieves material icon for notification modal based on type
     * @param {String} notificationType Required severity type of notification
     */
    getMaterialIcon(notificationType) {
      const typeMap = {
        success: 'check_circle',
        warning: 'warning',
        error: 'error',
        info: 'info',
      };
      return typeMap[notificationType];
    },
  },
  filters: {
    capitalize(value) {
      return capitalize(value);
    },
  },
};
</script>

<!--
  Main Application CSS

  lang="scss" to turn on LESS CSS
-->
<style lang="scss">
// For theming please see https://getbootstrap.com/docs/4.0/getting-started/theming/
// Variable must come before bootstrap (to override them)
// Currently variable and theming loaded through node
@import "~bootstrap/scss/bootstrap.scss";
@import "scss/main.scss";
@import "~bootstrap-vue/dist/bootstrap-vue.css";
@import "~@fortawesome/fontawesome-free/css/all.css";

#app {
  -webkit-transition: all 0.2s ease;
  -moz-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;

  .container,
  .container-fluid {
    @media (min-width: 768px) {
      padding-left: $grid-gutter-width;
      padding-right: $grid-gutter-width;
    }
  }

  .fr-main-dropdown {
    .dropdown-menu {
      padding-top: 0;
      padding-bottom: 0;
    }
  }

  #wrapper {
    height: 100%;

    #appSidebarWrapper {
      position: fixed;
      top: 0;
      width: 0;
      height: 100%;
      z-index: 2;
      margin-left: -$fr-sidebar-nav-width;
      overflow: hidden;
      background: $fr-sidebar-nav-background-color;

      -webkit-transition: all 0.2s ease;
      -moz-transition: all 0.2s ease;
      -o-transition: all 0.2s ease;
      transition: all 0.2s ease;

      a {
        text-align: left;
      }

      .sidebar-brand-logo {
        display: block;
      }

      .sidebar-brand-mark {
        display: none;
      }

      @media (min-width: 768px) {
        width: $fr-sidebar-nav-minimized-width;
        margin-left: 0;

        .sidebar-brand-logo {
          display: none;
        }

        .sidebar-brand-mark {
          display: block;
        }

        .sidebar-item-text {
          display: none;
        }
      }
    }

    #appContent {
      height: 100%;
      -webkit-transition: all 0.2s ease;
      -moz-transition: all 0.2s ease;
      -o-transition: all 0.2s ease;
      transition: all 0.2s ease;
      padding-left: 0;

      @media (min-width: 768px) {
        padding-left: $fr-sidebar-nav-minimized-width;
      }

      &.fr-no-toolbar {
        @media (min-width: 768px) {
          padding-left: 0;
        }
      }

      .fr-main-nav-toggle {
        color: $fr-toolbar-color;
      }

      .navbar-nav {
        .dropdown-menu {
          position: absolute;
          float: left;
        }

        .nav-link {
          color: $fr-toolbar-color;
        }
      }
      > .container {
        padding-top: $grid-gutter-width;
        padding-bottom: $grid-gutter-width * 2;
      }
    }

    &.toolbarToggled {
      #appSidebarWrapper {
        width: $fr-sidebar-nav-width;
        margin-left: 0;

        .sidebar-brand-logo {
          display: block;
        }

        .sidebar-brand-mark {
          display: none;
        }

        @media (min-width: 768px) {
          .sidebar-brand-logo {
            display: block;
          }

          .sidebar-brand-mark {
            display: none;
          }

          .sidebar-item-text {
            display: inline;
          }
        }
      }

      #appContent {
        z-index: 1;
        padding-left: $fr-sidebar-nav-width;
        margin-right: -$fr-sidebar-nav-width;

        @media (min-width: 768px) {
          position: relative;
          padding-left: $fr-sidebar-nav-width;
          margin-right: 0;
        }
      }
    }
  }

  /* Sidebar Styles */
  .sidebar-nav {
    position: absolute;
    top: 0;
    width: $fr-sidebar-nav-width;
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      a {
        color: $fr-sidebar-nav-link-color;
        display: block;
        border-left: 3px solid $fr-sidebar-nav-link-border-color;
        text-decoration: none;
        padding: 10px 20px 10px 17px;
        -webkit-transition: all 0.2s ease;
        -moz-transition: all 0.2s ease;
        -o-transition: all 0.2s ease;
        transition: all 0.2s ease;

        &.router-link-active {
          color: $fr-sidebar-nav-link-hover-color;
          background: $fr-sidebar-nav-link-active-color;
          border-left-color: $fr-sidebar-nav-link-active-border-color;
        }

        &:hover {
          color: $fr-sidebar-nav-link-hover-color;
          background: darken($fr-sidebar-nav-link-active-color, 3%);
        }
      }
    }

    > .sidebar-brand {
      height: $navbar-height;
      font-size: 18px;
      line-height: 72px;
      background-color: $fr-sidebar-nav-brand-color;
      width: 100%;
      top: 0;
      -webkit-transition: all 0.2s ease;
      -moz-transition: all 0.2s ease;
      -o-transition: all 0.2s ease;
      transition: all 0.2s ease;

      a {
        color: $fr-sidebar-nav-link-color;
        width: 100%;
        height: 100%;
        padding: 0 20px 0 17px;

        &:hover {
          color: $fr-sidebar-nav-link-hover-color;
          background: $fr-sidebar-nav-background-color;
        }
      }
    }
  }
}

.modal-open {
  #app {
    #wrapper {
      #appSidebarWrapper {
        z-index: 0;
      }
    }
  }
}

@media (min-width: 768px) {
  .fr-menu-locked {
    #appContent {
      margin-left: 170px;
      margin-right: 0;
    }
  }
}
</style>

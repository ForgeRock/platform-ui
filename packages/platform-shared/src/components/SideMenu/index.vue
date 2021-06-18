<!-- Copyright (c) 2019-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <nav
      id="fr-sidebar-nav"
      data-testid="fr-sidebar-nav"
      class="fr-sidebar-wrapper">
      <div class="fr-sidebar-nav h-100 d-flex flex-column">
        <div class="fr-sidebar-brand">
          <FrDropdownMenu
            v-if="dropdownItems.length"
            :dropdown-items="dropdownItems"
            :user-details="userDetails"
            class="mt-3">
            <template #button-content>
              <BMedia
                vertical-align="center"
                no-body
                class="text-left fr-dropdown-button">
                <BMediaAside>
                  <div
                    :class="`letter-${getFirstLetter(false)}`"
                    class="fr-realm-stamp mr-3 rounded-circle p-2 d-flex align-items-center justify-content-center">
                    <i
                      class="material-icons-outlined text-white d-none"
                      aria-hidden="true">
                      cloud
                    </i>
                    <span
                      class="text-white"
                      style="font-size: 1rem;">
                      {{ getFirstLetter(true) }}
                    </span>
                  </div>
                </BMediaAside>
                <BMediaBody class="sidebar-item-text overflow-hidden">
                  <h5
                    class="my-0 text-truncate"
                    data-testid="realm-name">
                    {{ realm }}
                  </h5>
                  <div class="text-truncate">
                    <small class="text-muted">
                      {{ realmAliases }}
                    </small>
                  </div>
                </BMediaBody>
              </BMedia>
            </template>
            <template #dropdown-header>
              <BDropdownHeader class="pt-2 pb-3">
                <h6>
                  {{ $t('realm.title') }}
                </h6>
                <BMedia
                  vertical-align="center"
                  no-body
                  class="text-left">
                  <BMediaAside>
                    <div
                      :class="`letter-${getFirstLetter(false)}`"
                      class="fr-realm-stamp mr-3 rounded-circle p-2 d-flex align-items-center justify-content-center">
                      <i
                        class="material-icons-outlined text-white d-none"
                        aria-hidden="true">
                        cloud
                      </i>
                      <span
                        class="text-white"
                        style="font-size: 1rem;">
                        {{ getFirstLetter(true) }}
                      </span>
                    </div>
                  </BMediaAside>
                  <BMediaBody class="overflow-hidden">
                    <h5 class="my-0 text-truncate">
                      {{ realm }}
                    </h5>
                    <div class="text-truncate">
                      <small class="text-muted">
                        {{ realmAliases }}
                      </small>
                    </div>
                  </BMediaBody>
                </BMedia>
              </BDropdownHeader>
            </template>
          </FrDropdownMenu>
          <div
            v-else
            class="d-flex align-items-center p-3 h-100">
            <div class="fr-logo fr-logo-horizontal" />
            <div class="fr-logo fr-logo-vertical" />
          </div>
        </div>
        <ul class="fr-sidebar-menuitems flex-grow-1">
          <template v-for="(item, index) in menuItems">
            <FrMenuItem
              :key="`sidebarNav_${index}`"
              v-bind="item"
              :user-roles="userDetails.roles"
              is-nav />
          </template>
        </ul>

        <div class="fr-sidebar-bottom">
          <ul class="fr-sidebar-menuitems flex-grow-1 border-top">
            <li>
              <BButton
                @click="toggleMenu"
                class="d-flex align-items-center">
                <i
                  class="material-icons material-icons-outlined icon-flipped mr-3"
                  aria-hidden="true">
                  chrome_reader_mode
                </i>
                <span class="sidebar-item-text">
                  {{ $t('sideMenu.toggleSidebar') }}
                </span>
              </BButton>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div
      @click="toggleMenu"
      class="w-100 h-100 fixed-top fr-sidebar-shim" />
  </div>
</template>

<script>
import {
  BButton,
  BDropdownHeader,
  BMedia,
  BMediaAside,
  BMediaBody,
} from 'bootstrap-vue';
import DropdownMenu from '@forgerock/platform-shared/src/components/DropdownMenu';
import MenuItem from '@forgerock/platform-shared/src/components/MenuItem';
import {
  capitalize,
  lowerCase,
} from 'lodash';

/**
 * SideMenu is an expandable menu which contains navigation icons to navigate to different routes.
 * Contains a toggle button to toggle between collapsed and expanded states.
 * When the number of menu items exceeds the vertical space, the area becomes scrollable.
 * If the active route is in a submenu, the menugroup starts expanded. Menu groups are collapsed when SideMenu is collapsed.
 */
export default {
  name: 'SideMenu',
  components: {
    BButton,
    BDropdownHeader,
    BMedia,
    BMediaAside,
    BMediaBody,
    FrDropdownMenu: DropdownMenu,
    FrMenuItem: MenuItem,
  },
  props: {
    /**
     * Items contained in dropdown when clicking on user details.
     */
    dropdownItems: {
      type: Array,
      default: () => [],
    },
    /**
     * Links in the main navigation area.
     */
    menuItems: {
      type: Array,
      default: () => [],
    },
    /**
     * Realm name.
     */
    realm: {
      type: String,
      default: '',
    },
    realmAliases: {
      type: String,
      default: '',
    },
    userDetails: {
      type: Object,
      default: () => ({
        name: 'Company Name',
        company: 'Company',
        email: 'email@company.com',
        adminURL: 'www.company.com',
        roles: [],
      }),
    },
  },
  methods: {
    /**
     * @description Toggles the menu
     * @triggers toggle-menu
     */
    getFirstLetter(isCaps) {
      const firstLetter = this.realm[0];
      return isCaps ? capitalize(firstLetter) : lowerCase(firstLetter);
    },
    /**
     * @description Toggles the menu
     * @triggers toggle-menu
     */
    toggleMenu() {
      this.$emit('toggle-menu');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './SideMenu.scss';
</style>

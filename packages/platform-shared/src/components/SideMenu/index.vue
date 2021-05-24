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
            <BDropdownDivider
              :key="`sidebarNavBreak_${index}`"
              v-if="item.break" />
            <li
              v-else-if="!item.menuGroup"
              :key="`sidebarNav_${index}`">
              <RouterLink
                class="d-flex align-items-center"
                :ref="`${index === 0 ? 'firstItem' : ''}`"
                v-if="item.routeName"
                :class="{'hidden': item.showForRoles && !userHasRole(item.showForRoles)}"
                :to="{ name: item.routeName, params: { resourceType: item.resourceType, resourceName: item.resourceName} }">
                <i
                  class="material-icons material-icons-outlined mr-3"
                  aria-hidden="true">
                  {{ item.icon }}
                </i>
                <span class="sidebar-item-text">
                  {{ item.displayName }}
                </span>
              </RouterLink>
              <a
                v-else-if="item.url"
                :ref="`${index === 0 ? 'firstItem' : ''}`"
                :href="item.url"
                :class="{'hidden': item.showForRoles && !userHasRole(item.showForRoles)}"
                target="_blank">
                {{ item.displayName }}
              </a>
            </li>
            <li
              v-else
              class="fr-sidebar-menugroup"
              :key="`sidebarNav_${index}`">
              <ul class="fr-sidebar-submenuitems">
                <BButton
                  v-b-toggle="`collapse-${index}`"
                  :class="{'hidden': item.showForRoles && !userHasRole(item.showForRoles)}"
                  class="d-flex align-items-center border-0 rounded-0 p-0">
                  <span
                    tabindex="-1"
                    class="dropdown-toggle"
                    :aria-expanded="expandedMenus[index]">
                    <i
                      class="material-icons material-icons-outlined mr-3"
                      aria-hidden="true">
                      {{ item.icon }}
                    </i>
                    <span class="sidebar-item-text">
                      {{ item.displayName }}
                    </span>
                  </span>
                </BButton>
                <BCollapse
                  :id="`collapse-${index}`"
                  class="fr-sidebar-subitem"
                  tag="li"
                  v-model="expandedMenus[index]">
                  <ul>
                    <template v-for="(subItem, subIndex) in item.menus">
                      <li :key="`sidebarNav_${index}_${subIndex}`">
                        <RouterLink
                          class="d-flex align-items-center"
                          v-if="subItem.routeName"
                          :class="{'hidden': subItem.showForRoles && !userHasRole(subItem.showForRoles)}"
                          :to="{ name: subItem.routeName, params: subItem.params }">
                          <span class="sidebar-item-text">
                            {{ subItem.displayName }}
                          </span>
                        </RouterLink>
                        <a
                          v-else-if="subItem.url"
                          :href="subItem.url"
                          :class="{'hidden': subItem.showForRoles && !userHasRole(subItem.showForRoles)}"
                          target="_blank">
                          {{ subItem.displayName }}
                        </a>
                      </li>
                    </template>
                  </ul>
                </BCollapse>
              </ul>
            </li>
          </template>
        </ul>

        <div class="fr-sidebar-bottom">
          <ul class="fr-sidebar-menuitems flex-grow-1">
            <li>
              <a
                class="d-flex align-items-center"
                @click="toggleMenu">
                <i
                  class="material-icons material-icons-outlined icon-flipped mr-3"
                  aria-hidden="true">
                  chrome_reader_mode
                </i>
                <span class="sidebar-item-text">
                  {{ $t('sideMenu.toggleSidebar') }}
                </span>
              </a>
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
  BCollapse,
  BDropdownHeader,
  BDropdownDivider,
  BMedia,
  BMediaAside,
  BMediaBody,
  VBToggle,
} from 'bootstrap-vue';
import Vue from 'vue';
import DropdownMenu from '@forgerock/platform-shared/src/components/DropdownMenu';
import {
  capitalize,
  lowerCase,
} from 'lodash';

Vue.directive('b-toggle', VBToggle);
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
    BCollapse,
    BDropdownHeader,
    BDropdownDivider,
    BMedia,
    BMediaAside,
    BMediaBody,
    FrDropdownMenu: DropdownMenu,
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
     * State from Layout about if the menu is open (true) or closed (false)
     */
    menuIsExpanded: {
      default: () => false,
      type: Boolean,
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
  data() {
    return {
      expandedMenus: [],
    };
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
    /**
     * @description Allow keyboard users to use the navigation sidebar
     * */
    focusFirstItem() {
      this.$refs.firstItem[0].$el.focus();
    },
    userHasRole(roles) {
      if (roles) {
        const matchingRoles = this.userDetails.roles.filter((element) => roles.includes(element));
        return matchingRoles.length > 0;
      }
      return false;
    },
  },
  watch: {
    '$route.path': function expandMenu(path) {
      const regex = /\/(.*)\//;
      const match = regex.exec(path);
      // ensure menugroup is expanded for current route
      if (match) {
        const menuGroup = match[1];
        this.menuItems.forEach((menuItem, index) => {
          if (menuItem.displayName && menuItem.displayName.toLowerCase() === menuGroup.toLowerCase()) {
            this.expandedMenus.splice(index, 1, true);
          }
        });
      }
    },
    /**
     * @description Watch for menu open and focus on the first element
     * @param isOpen boolean true means the menu is open
     */
    menuIsExpanded(isOpen) {
      if (isOpen) {
        this.focusFirstItem();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import './SideMenu.scss';
</style>

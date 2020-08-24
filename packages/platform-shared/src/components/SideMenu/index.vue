<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <nav
      id="fr-sidebar-nav"
      class="fr-sidebar-wrapper">
      <div class="fr-sidebar-nav h-100 d-flex flex-column">
        <div class="fr-sidebar-brand">
          <FrDropdownMenu
            v-if="dropdownItems.length"
            :dropdown-items="dropdownItems"
            class="mt-3">
            <template #button-content>
              <BMedia
                vertical-align="center"
                class="text-left fr-dropdown-button">
                <template #aside>
                  <img
                    :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                    alt="Avatar"
                    width="34"
                    height="34">
                </template>
                <div class="sidebar-item-text fr-dropdown-button-content">
                  <h5 class="my-0 text-truncate">
                    {{ realm }}
                  </h5>
                  <span class="text-muted text-truncate">
                    {{ realm }}
                  </span>
                </div>
              </BMedia>
            </template>
            <template #dropdown-header>
              <BDropdownHeader class="py-3 fr-dropdown-header">
                <div class="mt-1">
                  <h6>
                    {{ $t('realm.title').toUpperCase() }}
                  </h6>
                  <h5 class="my-0">
                    {{ realm }}
                  </h5>
                </div>
              </BDropdownHeader>
            </template>
          </FrDropdownMenu>
          <div
            v-else
            class="d-flex align-items-center p-3 h-100">
            <BImg
              class="fr-logo-vertical"
              :height="28"
              :width="25"
              :src="require('@forgerock/platform-shared/src/assets/images/vertical-logo.svg')"
              alt="ForgeRock" />
            <BImg
              class="fr-logo-horizontal"
              :height="28"
              :src="require('@forgerock/platform-shared/src/assets/images/horizontal-logo.svg')"
              alt="ForgeRock" />
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
                v-if="item.routeName"
                :to="{ name: item.routeName, params: { resourceType: item.resourceType, resourceName: item.resourceName} }">
                <i
                  class="material-icons material-icons-outlined mr-3">
                  {{ item.icon }}
                </i>
                <span class="sidebar-item-text">
                  {{ item.displayName }}
                </span>
              </RouterLink>
              <a
                v-else-if="item.url"
                :href="item.url"
                target="_blank">
                {{ item.displayName }}
              </a>
            </li>
            <li
              v-else
              :class="[{'expanded': expandedMenus[index]}, 'fr-sidebar-menugroup']"
              :key="`sidebarNav_${index}`">
              <ul class="fr-sidebar-submenuitems">
                <li
                  v-b-toggle="`collapse-`+index"
                  class="dropdown-toggle d-flex align-items-center">
                  <i
                    class="material-icons material-icons-outlined mr-3">
                    {{ item.icon }}
                  </i>
                  <span class="sidebar-item-text">
                    {{ item.displayName }}
                  </span>
                </li>
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
                          :to="{ name: subItem.routeName, params: { resourceType: item.resourceType, resourceName: item.resourceName} }">
                          <span class="sidebar-item-text">
                            {{ subItem.displayName }}
                          </span>
                        </RouterLink>
                        <a
                          v-else-if="subItem.url"
                          :href="subItem.url"
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
                <i class="material-icons material-icons-outlined icon-flipped mr-3">
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
  BCollapse,
  BDropdownHeader,
  BDropdownDivider,
  BImg,
  BMedia,
  VBToggle,
} from 'bootstrap-vue';
import Vue from 'vue';
import DropdownMenu from '@forgerock/platform-shared/src/components/DropdownMenu';

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
    BCollapse,
    BDropdownHeader,
    BDropdownDivider,
    BImg,
    BMedia,
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
    menuIsToggled: {
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
    toggleMenu() {
      this.$emit('toggle-menu');
    },
    /**
     * @description Allow keyboard users to use the navigation sidebar
     * */
    focusFirstItem() {
      this.$refs.firstItem.$el.querySelector('button').focus();
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
    menuIsToggled(isOpen) {
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

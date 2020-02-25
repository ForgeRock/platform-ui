<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div :class="[{ 'fr-sidebar-toggled': menuStaticOpen }]">
    <div class="fr-sidebar-wrapper">
      <ul class="fr-sidebar-nav h-100 d-flex flex-column">
        <li class="fr-sidebar-brand">
          <BDropdown
            class="h-100"
            id="dropdown-left"
            variant="link"
            toggle-class="text-decoration-none p-0">
            <BDropdownHeader
              class="py-2"
              v-if="userDetails.company || userDetails.subscription">
              <div class="mt-1">
                <h5 class="my-0">
                  {{ userDetails.company }}
                </h5>
                <span class="text-muted">
                  {{ userDetails.subscription }}
                </span>
              </div>
            </BDropdownHeader>
            <BDropdownItem
              v-if="userDetails.adminUser && userDetails.adminURL"
              :href="userDetails.adminURL">
              <i class="material-icons material-icons-outlined mr-2">
                build
              </i>
              {{ $t('pages.app.admin') }}
            </BDropdownItem>
            <template slot="button-content">
              <div class="media fr-dropdown-button text-left">
                <img
                  :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                  alt="Avatar"
                  class="mr-3"
                  width="34"
                  height="34">
                <div
                  class="media-body sidebar-item-text"
                  :class="{'mt-1': !userDetails.company}">
                  <h5 class="my-0">
                    {{ userDetails.company }}
                  </h5>
                  <span class="text-muted">
                    {{ userDetails.name }}
                  </span>
                </div>
              </div>
            </template>
            <BDropdownDivider />
            <template v-for="(item, index) in dropdownItems">
              <BDropdownItem
                class="my-2"
                :key="`sideDropdownItems_${index}`"
                :to="{ name: item.routeName}">
                <i class="material-icons mr-2">
                  {{ item.icon }}
                </i>
                <span>
                  {{ item.displayName }}
                </span>
              </BDropdownItem>
            </template>
            <BDropdownItem
              v-if="showEnduserLink"
              :href="enduserLink"
              rel="noopener"
              target="_blank">
              <div class="media">
                <img
                  :src="require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                  alt="Avatar"
                  class="mr-3"
                  width="34"
                  height="34">
                <div class="media-body">
                  <h5 class="my-0">
                    {{ userDetails.name }}
                  </h5>
                  <span class="text-muted">
                    <template v-if="userDetails.email.length === 0">
                      n/a
                    </template>
                    <template v-else>
                      {{ userDetails.email }}
                    </template>
                  </span>
                </div>
              </div>
            </BDropdownItem>
            <BDropdownDivider />
            <BDropdownItem @click="$emit('logout')">
              <i class="material-icons material-icons-outlined mr-2">
                exit_to_app
              </i>
              {{ $t('sideMenu.signOut') }}
            </BDropdownItem>
          </BDropdown>
        </li>
        <div class="fr-sidebar-menuitems flex-grow-1">
          <template v-for="(item, index) in menuItems">
            <BDropdownDivider
              :key="`sidebarNavBreak_${index}`"
              v-if="item.break" />
            <li
              v-else-if="!item.menuGroup"
              :key="`sidebarNav_${index}`">
              <RouterLink
                v-if="item.routeName"
                :to="{ name: item.routeName, params: { resourceType: item.resourceType, resourceName: item.resourceName} }">
                <i
                  class="material-icons material-icons-outlined mr-2 mb-1">
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
                <i
                  class="material-icons material-icons-outlined mr-2 mb-1">
                  {{ item.icon }}
                </i>
                <span class="sidebar-item-text">
                  {{ item.displayName }}
                </span>
              </a>
            </li>
            <div
              v-else
              :class="[{'expanded': expandedMenus[index]}, 'fr-sidebar-menugroup']"
              :key="`sidebarNav_${index}`">
              <li
                v-b-toggle="`collapse-`+index"
                class="dropdown-toggle">
                <i
                  class="material-icons material-icons-outlined mr-2 mb-1">
                  {{ item.icon }}
                </i>
                <span class="sidebar-item-text">
                  {{ item.displayName }}
                </span>
              </li>
              <BCollapse
                class="fr-sidebar-subitem"
                :id="`collapse-${index}`"
                v-model="expandedMenus[index]">
                <template v-for="(subItem, subIndex) in item.menus">
                  <li :key="`sidebarNav_${index}_${subIndex}`">
                    <RouterLink
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
              </BCollapse>
            </div>
          </template>
        </div>
        <div
          class="fr-sidebar-bottom d-none d-md-block"
          @click="toggleMenu()">
          <i class="material-icons material-icons-outlined icon-flipped mr-2">
            chrome_reader_mode
          </i>
          <span class="sidebar-item-text">
            {{ $t('sideMenu.toggleSidebar') }}
          </span>
        </div>
      </ul>
    </div>
    <div
      @click="toggleMenu()"
      class="w-100 h-100 fixed-top fr-sidebar-shim" />
  </div>
</template>

<script>
import {
  BCollapse,
  BDropdown,
  BDropdownItem,
  BDropdownDivider,
  BDropdownHeader,
  VBToggle,
} from 'bootstrap-vue';
import Vue from 'vue';

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
    BDropdown,
    BDropdownDivider,
    BDropdownHeader,
    BDropdownItem,
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
     * Force menu to remain open even when not hovering.
     */
    openMenu: {
      type: Boolean,
      default: true,
    },
    /**
     * Show link to Enduser in dropdown menu
     */
    showEnduserLink: {
      type: Boolean,
      default: true,
    },
    /**
     * Link to enduser ui for user management.
     */
    enduserLink: {
      type: String,
      default: '/',
    },
    /**
     * Details about the current user. Dislplayed at top of SideNav and in dropdown menu
     */
    userDetails: {
      type: Object,
      default: () => ({
        name: 'Fake Name',
        company: 'ForgeRock',
        email: 'email@fake.com',
        adminUser: false,
        adminURL: 'wwwfakecom',
      }),
    },
  },
  data() {
    return {
      menuStaticOpen: this.openMenu,
      expandedMenus: [],
    };
  },
  methods: {
    /**
     * Toggles the menu to stay open or only open on hover
     */
    toggleMenu() {
      this.menuStaticOpen = !this.menuStaticOpen;

      this.$emit('locked', this.menuStaticOpen);
    },
  },
  watch: {
    openMenu() {
      this.menuStaticOpen = this.openMenu;
    },
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
  },
};
</script>

<style lang="scss" scoped>
@import './SideMenu.scss';
</style>

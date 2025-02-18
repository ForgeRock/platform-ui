<!-- Copyright (c) 2019-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <nav
      id="fr-sidebar-nav"
      class="fr-sidebar-wrapper"
      data-testid="fr-sidebar-nav"
      :aria-label="$t('sideMenu.sidebarNavigation')">
      <div class="fr-sidebar-nav h-100 d-flex flex-column">
        <div class="fr-sidebar-brand">
          <FrDropdownMenu
            v-if="dropdownItems.length"
            :dropdown-items="dropdownItems"
            class="mt-3">
            <template #button-content>
              <BMedia
                vertical-align="center"
                no-body
                class="text-left fr-dropdown-button">
                <BMediaAside>
                  <div :class="`letter-${realmInitial} fr-realm-stamp`">
                    <span
                      class="text-white"
                      style="font-size: 1rem;">
                      {{ realmInitial.toUpperCase() }}
                    </span>
                  </div>
                </BMediaAside>
                <BMediaBody class="sidebar-item-text overflow-hidden">
                  <h5
                    class="my-0 text-truncate"
                    data-testid="realm-name">
                    {{ realmFormalName }}
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
                    <div :class="`letter-${realmInitial} fr-realm-stamp`">
                      <span
                        class="text-white"
                        style="font-size: 1rem;">
                        {{ realmInitial.toUpperCase() }}
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
            <div class="ping-logo ping-logo-horizontal" />
            <div class="ping-logo ping-logo-square" />
          </div>
        </div>
        <ul class="fr-sidebar-menuitems flex-grow-1">
          <template
            v-for="(item, index) in menuItems"
            :key="`sidebarNav_${index}`">
            <FrMenuItem
              v-bind="item"
              is-nav />
          </template>
        </ul>

        <div class="fr-sidebar-bottom">
          <ul class="fr-sidebar-menuitems flex-grow-1 border-top">
            <li>
              <button
                @click="toggleMenu"
                @mouseleave="onMouseLeave"
                class="d-flex align-items-center"
                :aria-expanded="(menuIsExpanded).toString()"
                :aria-label="$t('sideMenu.toggleSidebar')">
                <FrIcon
                  icon-class="icon-flipped mr-3 toggle-side-menu"
                  name="chrome_reader_mode">
                  <span class="sidebar-item-text">
                    {{ $t('sideMenu.toggleSidebar') }}
                  </span>
                </FrIcon>
              </button>
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
  BDropdownHeader,
  BMedia,
  BMediaAside,
  BMediaBody,
} from 'bootstrap-vue';
import FrDropdownMenu from '@forgerock/platform-shared/src/components/DropdownMenu';
import FrMenuItem from '@forgerock/platform-shared/src/components/MenuItem';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import RealmMixin from '@forgerock/platform-shared/src/mixins/RealmMixin';

/**
 * SideMenu is an expandable menu which contains navigation icons to navigate to different routes.
 * Contains a toggle button to toggle between collapsed and expanded states.
 * When the number of menu items exceeds the vertical space, the area becomes scrollable.
 * If the active route is in a submenu, the menugroup starts expanded. Menu groups are collapsed when SideMenu is collapsed.
 */
export default {
  name: 'SideMenu',
  components: {
    BDropdownHeader,
    BMedia,
    BMediaAside,
    BMediaBody,
    FrDropdownMenu,
    FrMenuItem,
    FrIcon,
  },
  mixins: [
    RealmMixin,
  ],
  props: {
    /**
     * Items contained in dropdown when clicking on user details.
     */
    dropdownItems: {
      type: Array,
      default: () => [],
    },
    /**
     * State from Layout about if the menu is open (true) or closed (false)
     */
    menuIsExpanded: {
      default: false,
      type: Boolean,
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
    /**
     * Realm aliases
     */
    realmAliases: {
      type: String,
      default: '',
    },
  },
  methods: {
    /**
     * Triggered whenever the toggle button is clicked.
     * emit custom event 'toggle-menu' to its parent component
     */
    toggleMenu() {
      this.$emit('toggle-menu');
    },
    /**
     * Triggered whenever the user comes out from the toggle button element
     * emit custom event 'mouse-leave' to its parent component
     */
    onMouseLeave() {
      this.$emit('mouse-leave');
    },
  },
};
</script>

<style lang="scss" scoped>
@import './SideMenu.scss';

.toggle-side-menu {
  line-height: 1.4rem;
}
</style>

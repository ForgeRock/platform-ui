<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <template v-if="showItemForUser && showItemForStoreValues">
    <!-- Item is a divider -->
    <BDropdownDivider v-if="isDivider" />
    <!-- Item opens a modal -->
    <li
      v-else-if="modal && showItemForPrivileges"
      :role="isNav ? '' : 'presentation'">
      <BButton
        :aria-label="$t(displayName)"
        :class="[{ 'nav-link': isNav, 'dropdown-item': !isNav }, 'd-flex align-items-center rounded-0']"
        :role="isNav ? '' : 'menuitem'"
        @click="$root.$emit('bv::show::modal', modal)">
        <FrIcon
          :icon-class="icon ? 'mr-2' : ''"
          :name="icon || ''">
          <span class="menu-item-text">
            {{ $t(displayName) }}
          </span>
        </FrIcon>
      </BButton>
    </li>
    <!-- Item will change route or open a new tab -->
    <Component
      v-else-if="(url || routeTo && routeTo.name)"
      :aria-label="$t(displayName)"
      :href="url"
      :is="bootstrapComponent"
      :link-attrs="isNav ? {'aria-label': $t(displayName)} : null"
      :link-class="'d-flex align-items-center'"
      :link-classes="'d-flex align-items-center'"
      :target="url ? '_blank' : ''"
      :to="routeTo">
      <div class="d-flex justify-content-between align-items-center pr-4">
        <FrIcon
          :icon-class="isNav && icon ? 'mr-3' : 'mr-2'"
          :name="icon || ''">
          <span class="menu-item-text">
            {{ $t(displayName) }}
          </span>
        </FrIcon>
        <BBadge
          v-if="showBadgeWithContentFromStore && badgeContent(showBadgeWithContentFromStore)"
          class="ml-1"
          variant="light"
          pill>
          {{ badgeContent(showBadgeWithContentFromStore) }}
        </BBadge>
      </div>
    </Component>
    <!-- Basic menu item that just emits event -->
    <Component
      v-else-if="event"
      :is="bootstrapComponent"
      :active="active"
      @click="$emit('item-click', event)"
      :link-class="'d-flex align-items-center'">
      <FrIcon
        :icon-class="icon ? 'mr-3' : ''"
        :name="icon || ''">
        <span class="menu-item-text">
          {{ $t(displayName) }}
        </span>
      </FrIcon>
    </Component>
    <!-- Item is an expandable menu with a submenu -->
    <li
      v-else-if="subItems.length"
      class="fr-menu-item-group"
      :role="isNav ? '' : 'presentation'">
      <BButton
        @click="isExpanded = !isExpanded"
        class="dropdown-toggle d-flex align-items-center rounded-0"
        :aria-expanded="isExpanded"
        :aria-label="$t(displayName)"
        :role="isNav ? '' : 'menuitem'">
        <div class="w-100 d-flex justify-content-between align-items-center pr-3">
          <FrIcon
            :icon-class="icon ? 'mr-3' : ''"
            :name="icon || ''">
            <span class="menu-item-text">
              {{ $t(displayName) }}
            </span>
          </FrIcon>
          <BBadge
            v-if="showBadgeWithContentFromStore && !isExpanded"
            class="ml-1"
            variant="light"
            pill>
            {{ badgeContent(showBadgeWithContentFromStore) }}
          </BBadge>
        </div>
      </BButton>
      <BCollapse
        :id="`collapse-${displayName.split(' ').join('-')}`"
        class="fr-menu-item-submenuitems"
        tag="ul"
        v-model="isExpanded">
        <template v-for="(subItem, subIndex) in subItems">
          <Component
            v-if="subItem.event"
            :active="subItem.active"
            :key="`menu_item_event_${displayName}_${subIndex}`"
            :is="bootstrapComponent"
            @click="$emit('item-click', subItem.event)">
            <FrIcon
              :icon-class="subItem.icon ? 'mr-3' : ''"
              :name="subItem.icon || ''">
              <span class="menu-item-text">
                {{ $t(subItem.displayName) }}
              </span>
            </FrIcon>
          </Component>
          <Component
            v-else-if="showSubItemForUser(subItem.showForRoles) && showSubItemForStoreValues(subItem.showForStoreValues)"
            :key="`menu_item_${displayName}_${subIndex}`"
            :is="bootstrapComponent"
            :href="subItem.url"
            :target="subItem.url ? '_blank' : ''"
            :to="subItem.routeTo">
            <div class="d-flex justify-content-between align-items-center pr-4">
              <FrIcon
                :icon-class="subItem.icon ? 'mr-3' : ''"
                :name="subItem.icon || ''">
                <span class="menu-item-text">
                  {{ $t(subItem.displayName) }}
                </span>
              </FrIcon>
              <BBadge
                v-if="badgeContent(subItem.showBadgeWithContentFromStore)"
                class="ml-1"
                variant="light"
                pill>
                {{ badgeContent(subItem.showBadgeWithContentFromStore) }}
              </BBadge>
            </div>
          </Component>
        </template>
      </BCollapse>
    </li>
  </template>
</template>

<script>
import {
  BBadge,
  BButton,
  BCollapse,
  BNavItem,
  BDropdownItem,
  BDropdownDivider,
  VBToggle,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import Vue from 'vue';
import { get } from 'lodash';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';

Vue.directive('b-toggle', VBToggle);

/**
 * MenuItem - a component which contains the logic used to render menu items
 * displayed in the SideMenu and DropdownMenu components
 */
export default {
  name: 'MenuItem',
  components: {
    BBadge,
    BButton,
    BCollapse,
    BNavItem,
    BDropdownItem,
    BDropdownDivider,
    FrIcon,
  },
  props: {
    /**
     * The name to render for the item.
     * Not used if the item is a divider.
     */
    displayName: {
      type: String,
      default: '',
    },
    /**
     * The (optional) icon to render for the item.
     * Not shown if the item is a divider.
     */
    icon: {
      type: String,
      default: '',
    },
    /**
     * The list of privileges for which this item should be displayed.
     */
    showForPrivileges: {
      type: Array,
      default: () => [],
    },
    /**
     * The list of roles for which this item should be displayed.
     */
    showForRoles: {
      type: Array,
      default: () => [],
    },
    /**
     * The list of store-values for which this item should be displayed.
     */
    showForStoreValues: {
      type: Array,
      default: () => [],
    },
    /**
     * The url users are directed to when clicking the item. Opens in a new tab.
     */
    url: {
      type: String,
      default: '',
    },
    /**
     * The vue-router object which is set when users click the item. Should not be used together with the url prop.
     */
    routeTo: {
      type: Object,
      default: () => {},
    },
    /**
     * A list of collapsible sub menu items to display with this item.
     */
    subItems: {
      type: Array,
      default: () => [],
    },
    /**
     * The id of a bootstrap vue modal to show when users click the item.
     */
    modal: {
      type: String,
      default: '',
    },
    /**
     * Indicates that the item should render as a BDropdownDivider
     */
    isDivider: {
      type: Boolean,
      default: false,
    },
    /**
     * Indicates if this item is being shown in a nav. If false, the component assumes it is being used in a dropdown.
     */
    isNav: {
      type: Boolean,
      default: false,
    },
    /**
     * Event that item should emit when clicked. Used when menu is not used for routing
     */
    event: {
      type: String,
      default: '',
    },
    /**
     * Is menu item active
     */
    active: {
      type: Boolean,
      default: false,
    },
    /**
     * If menu item is a dropdown, should it be expanded
     */
    expand: {
      type: Boolean,
      default: false,
    },
    /**
     * Shows a badge next to the dropdown option text which displays content from the store
     */
    showBadgeWithContentFromStore: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      bootstrapComponent: this.isNav ? BNavItem : BDropdownItem,
      isExpanded: !!this.shouldBeExpanded(this.$route.name),
    };
  },
  computed: {
    ...mapState(useUserStore, ['allRoles', 'privileges', 'amAdmin']),
    showItemForPrivileges() {
      const emptyShowForPrivilegesProp = !this.showForPrivileges.length;
      const showForPrivilegesInUserStore = this.showForPrivileges.some((userPrivilege) => !!get(this.privileges, userPrivilege, false));
      const isAmAdmin = this.amAdmin;
      return emptyShowForPrivilegesProp || showForPrivilegesInUserStore || isAmAdmin;
    },
    // If the item is restricted by roles, only display it to users who have at least one of the required roles
    showItemForUser() {
      return !this.showForRoles.length || this.allRoles.some((userRole) => this.showForRoles.includes(userRole));
    },
    // If the item is restricted by store values, only display it when all of those exist and are truthy
    showItemForStoreValues() {
      return !this.showForStoreValues.length || this.showForStoreValues.every((storeValue) => !!get(this.$store.state, storeValue, false));
    },
  },
  watch: {
    // Use the route name to ensure the this item is expanded if a child item is the current route
    '$route.name': function expandMenu(newRouteName) {
      if (!this.isExpanded && this.shouldBeExpanded(newRouteName)) {
        this.isExpanded = true;
      }
    },
  },
  methods: {
    badgeContent(showBadgeWithContentFromStore) {
      return showBadgeWithContentFromStore ? this.$store.state[showBadgeWithContentFromStore] : '';
    },
    /**
     * If the item is restricted by roles, only display it to users who have at least one of the required roles
     * @param {Array} showForRoles list of roles allowed to view subItem
     */
    showSubItemForUser(showForRoles) {
      return !showForRoles?.length || this.allRoles.some((userRole) => showForRoles.includes(userRole));
    },
    /**
     * If the item is restricted by store values, only display it in environments that have the required environment variable set
     * @param {Array} showForStoreValues list of environment variables subItem is permitted to appear for
     */
    showSubItemForStoreValues(showForStoreValues) {
      return !showForStoreValues?.length || showForStoreValues.every((storeValue) => !!get(this.$store.state, storeValue, false));
    },
    /**
     * Determine whether or not the current item should be expanded if it is a menu, based on the route name
     * @param {String} routeName the name of the current route
     * @returns {Boolean} whether or not the current item should be expanded
     */
    shouldBeExpanded(routeName) {
      return this.subItems?.length && (this.subItems.some((subMenuItem) => subMenuItem?.routeTo?.name === routeName) || this.expand);
    },
  },
};
</script>

<style lang="scss" scoped>
ul,
li {
  list-style: none;
  margin: 0;
  padding: 0;

  .material-icons-outlined {
    line-height: 1.35rem;
  }
}

:deep(a.nav-link),
button.btn.btn-secondary.nav-link,
button.btn.btn-secondary.dropdown-toggle {
  color: $fr-sidemenu-font-color;
  background-color: inherit;
  border-color: $white;
  width: 100%;
  position: relative;
  border-width: 0;
  border-left: 3px solid transparent;
  cursor: pointer;
  display: block;
  padding: 15px 20px 15px 16px;
  text-decoration: none;
  line-height: 1.5;
  font-size: 0.875rem;

  &.router-link-active {
    background-color: $fr-sidemenu-hover;
    border-left-color: $primary;
    .badge {
      background-color: $primary;
      color: $white;
    }
  }

  &.hidden {
    display: none !important;
  }

  &:focus-visible {
    outline: 2px auto -webkit-focus-ring-color;
  }

  &:focus {
    box-shadow: none;
  }

  &:hover {
    background-color: $fr-sidemenu-hover;
  }
}

.fr-menu-item-group {
  .btn {
    padding: 15px 60px 15px 19px;
  }

  :deep(a) {
    padding: 10px 5px 10px 49px;
    height: 41px;
  }
}

ul.fr-menu-item-submenuitems {
  font-size: 0.875rem;
  overflow-x: hidden;
  overflow-y: hidden;
  white-space: nowrap;
}
</style>

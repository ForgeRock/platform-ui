<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="menu-container">
    <button
      aria-haspopup="true"
      :class="buttonClasses"
      ref="menuButtonRef"
      :aria-controls="menuListId"
      :aria-expanded="isOpen.toString()"
      :id="menuButtonId"
      @click="openMenu"
      @keydown.enter.prevent="openMenu"
      @keydown.space.prevent="openMenu"
      @keydown.up.prevent="openMenu"
      @keydown.down.prevent="openMenu">
      <slot name="button-content" />
    </button>
    <teleport
      to="#app"
      :disabled="!useFloatingMenu">
      <ul
        v-if="isOpen"
        ref="menuListRef"
        role="menu"
        :aria-labelledby="menuButtonId"
        :id="menuListId"
        :class="menuClasses"
        :style="floatingStyle"
        @click="toggleMenu"
        @keydown.prevent="handleKeydown">
        <slot />
      </ul>
    </teleport>
  </div>
</template>

<script setup>
/**
 * ActionsMenu component: Fully accessible menu.
 * Menu items must have role="menuitem" or use BDropdownItem component.
 * NOTE: There is an issue with NVDA where keyboard events are replaced by click events in focus mode,
 * because of that, we need to allow click events to open the menu.
 * To be aligned with application design and having click events trigger focus lifecycle,
 * css focus state must not have styles and focus-visible and hover states must have theme values.
 */
import {
  ref, nextTick, onMounted, onBeforeUnmount, computed, defineEmits,
} from 'vue';
import floatingElementPosition from '@forgerock/platform-shared/src/composables/floatingElementPosition';

const props = defineProps({
  // Index of the item to be focused when menu is opened
  selectedItemIndex: {
    type: Number,
    default: -1,
  },
  // Align menu to the bottom right of the button
  right: {
    type: Boolean,
    default: false,
  },
  // Teleport to #app to avoid overflow issues when used in complex layouts
  useFloatingMenu: {
    type: Boolean,
    default: false,
  },
  noCaret: {
    type: Boolean,
    default: false,
  },
  toggleClass: {
    type: [String, Object, Array],
    default: '',
  },
});

const emit = defineEmits(['show', 'hide']);

const uid = Math.random().toString(36).slice(2);
const menuButtonId = `menu-button-${uid}`;
const menuListId = `menu-list-${uid}`;

const isOpen = ref(false);
const menuButtonRef = ref(null);
const menuListRef = ref(null);
const menuItems = ref([]);
const focusedIndex = ref(-1);
const typeBuffer = ref('');
let typeAheadTimeout = null;

const { floatingStyle } = floatingElementPosition({
  alignRight: props.right,
  targetRef: menuButtonRef,
  enabled: props.useFloatingMenu,
  isVisible: isOpen,
  floatingRef: menuListRef,
  floatingElementStyles: { width: 'fit-content', zIndex: 1000 },
});

/**
 * Focus a specific item in the menu
 * @param index index of the item to focus
 */
function focusItem(index) {
  if (!menuItems.value?.[index]) return;
  focusedIndex.value = index;
  menuItems.value[index].focus({ preventScroll: true });
}

/**
 * Move focus to the next or previous item in the menu
 * @param direction -1 for up, 1 for down
 */
function moveFocus(direction) {
  const count = menuItems.value.length;
  if (!count) return;

  const nextIndex = (focusedIndex.value + direction + count) % count;
  focusItem(nextIndex);
}

/**
 * Close the menu and reset focused index
 */
function closeMenu() {
  focusedIndex.value = -1;
  if (menuButtonRef?.value) {
    menuButtonRef.value.focus({ preventScroll: true });
  }
  isOpen.value = false;
  emit('hide');
}

/**
 * open menu and focus the first item based on keyboard input
 * @param event keydown event
 */
async function openMenu(event) {
  if (isOpen.value) {
    closeMenu();
    return;
  }

  isOpen.value = true;
  await nextTick();
  emit('show');

  menuItems.value = Array.from(menuListRef.value?.querySelectorAll('[role="menuitem"]') || []);

  if (!menuItems.value.length) return;

  if (event.key === 'ArrowUp') {
    focusItem(menuItems.value.length - 1);
  } else if (event.key === 'ArrowDown') {
    focusItem(0);
  } else if (props.selectedItemIndex > -1) {
    focusItem(props.selectedItemIndex);
  } else {
    focusItem(0);
  }
}

/**
 * Open or close the menu
 * @param event click event
 */
function toggleMenu(event) {
  isOpen.value ? closeMenu() : openMenu(event);
}

/**
 * Focus items based on users keyboard input
 * @param event keydown
 */
function handleTypeAhead(event) {
  const { key } = event;
  if (key.length === 1 && /\S/.test(key)) {
    typeBuffer.value += key.toLowerCase();
    clearTimeout(typeAheadTimeout);
    typeAheadTimeout = setTimeout(() => { typeBuffer.value = ''; }, 500);

    const matchesTypeAhead = (item) => item.textContent.trim().toLowerCase().startsWith(typeBuffer.value);
    const index = menuItems.value.findIndex(matchesTypeAhead);

    if (index !== -1) focusItem(index);
  }
}

/**
 * Handle menu items keydown events
 * @param event keydown
 */
function handleKeydown(event) {
  switch (event.key) {
    case 'Enter':
      menuItems.value[focusedIndex.value].click();
      closeMenu();
      break;
    case 'Escape':
    case 'Tab':
      closeMenu();
      break;
    case 'Home':
      focusItem(0);
      break;
    case 'End':
      focusItem(menuItems.value.length - 1);
      break;
    case 'ArrowUp':
      moveFocus(-1);
      break;
    case 'ArrowDown':
      moveFocus(1);
      break;
    default:
      handleTypeAhead(event);
      break;
  }
}

/**
 * Handle pointerdown events outside menu component
 * @param event pointerdown
 */
function handleClickOutside(event) {
  if (!isOpen.value) return;
  const path = event.composedPath();
  if (!path.includes(menuListRef.value) && !path.includes(menuButtonRef.value)) {
    closeMenu();
  }
}

const buttonClasses = computed(() => ([
  'btn btn-link dropdown-toggle text-dark px-0 d-flex',
  { 'no-caret': props.noCaret },
  typeof props.toggleClass === 'string' ? props.toggleClass : [props.toggleClass],
]));

const menuClasses = computed(() => ({
  menu: true,
  'menu--right': props.right,
}));

onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleClickOutside);
});
</script>

<style scoped>
.menu-container {
  position: relative;
  display: inline-flex;
  button {
    position: relative;
    overflow: hidden;
    width: 100%;
  }
}

.menu {
  list-style: none;
  padding-left: 0;
  margin: 0;
  position: absolute;
  min-width: 12rem;
  top: 100%;
  left: 0;
  background-color: white;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.13);
  z-index: 10;
  border: 1px solid #e7eef4;
  border-radius: 4px;
  padding: 4px 0px;
}

.menu--right {
  right: 0;
  left: unset;
}

.no-caret::after {
  display: none !important;
}
</style>

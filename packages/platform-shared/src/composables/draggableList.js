/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import i18n from '@/i18n';

/**
 * Default keyboard controls for the draggable list
 * @type {Object<string, string[]>}
 * */
const defaultKeyboardControls = {
  moveUp: ['ArrowUp'],
  moveDown: ['ArrowDown'],
};

const CONSTANTS = {
  LIST_ITEM_ID: 'list-item-id',
};

/**
 * A composable for managing a keyboard-accessible, draggable list.
 *
 * ## Accessibility Features
 * - **Keyboard Navigation:**
 *   Users can move list items up or down using keyboard controls (default: ArrowUp and ArrowDown). These controls can be customized via the `keyboardControls` option.
 * - **ARIA Roles and Attributes:**
 *   Each list item receives `role="listitem"` and a unique attribute (`list-item-id`) for identification and focus management.
 * - **Tab Navigation:**
 *   Each item is focusable via `tabindex=0`, allowing keyboard users to tab through items.
 * - **Live Region Announcements:**
 *   Movement actions (e.g., moving an item up or down) trigger updates to a live announcement string (`liveAnnouncement`), which can be rendered in a visually hidden live region to provide screen reader feedback.
 * - **ARIA Label:**
 *   The list receives an ARIA label (`listAriaLabel`) for context, customizable via options.
 *
 * @param {Array} initialDraggableList - The initial array of items for the draggable list.
 * @param {Object} options - Configuration options.
 * @param {Object} [options.keyboardControls={}] - Custom keyboard controls for moving items. Should contain `moveUp` and `moveDown` arrays of keys.
 * @param {string} [options.listAriaLabel='Draggable list'] - ARIA label for the list for accessibility.
 * @param {Function} [options.getItemId=(item) => item.id] - Function to extract a unique ID from each item.
 * @returns {Object} An object containing:
 *   - {Ref<Array>} draggableList: Reactive list of items.
 *   - {Function} getItemProps: Function to get props for each list item (for accessibility and keyboard handling).
 *   - {string} listAriaLabel: The ARIA label for the list.
 */
export default function useDraggableList(initialDraggableList, {
  keyboardControls = {},
  listAriaLabel = 'Draggable list',
  getItemId = (item) => item.id,
} = {}) {
  // merge default controls with user-defined controls
  const controls = { ...defaultKeyboardControls, ...keyboardControls };
  const draggableList = ref([...initialDraggableList]);
  const liveAnnouncement = ref('');

  // Internal function to announce live messages, such as item movement.
  const announce = (message) => {
    liveAnnouncement.value = message;
  };
  /**
   * Focuses the DOM element that has an attribute matching the specified value.
   *
   * @param {string} id - The value of the attribute to match for focusing the element.
   */
  function focusElementByAttribute(id) {
    const element = document.querySelector(`[${CONSTANTS.LIST_ITEM_ID}="${id}"]`);
    if (element) {
      element.focus();
    }
  }

  /**
   * Moves an item within the draggable list from one index to another.
   *
   * @param {Event} event - The drag event triggering the move.
   * @param {number} fromIndex - The current index of the item to move.
   * @param {number} toIndex - The target index to move the item to.
   * @returns {void}
   */
  function moveItem(event, fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= draggableList.value.length) {
      return; // Invalid index
    }

    event.preventDefault();
    const itemToMove = draggableList.value[fromIndex];
    const toItem = draggableList.value[toIndex];
    const toItemId = getItemId(toItem);

    draggableList.value.splice(fromIndex, 1); // delete from original position
    draggableList.value.splice(toIndex, 0, itemToMove); // insert at new position
    announce(i18n.global.t('draggableList.itemMoved', {
      fromIndex: fromIndex + 1,
      toIndex: toIndex + 1,
    }));

    focusElementByAttribute(`${toItemId}`); // focus the moved item
  }

  /**
   * Handles keyboard navigation for a draggable list item.
   * Moves the item up or down in the list based on the pressed key.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered by the user.
   * @param {number} itemIndex - The current index of the item in the list.
   */
  function handleKeyDown(event, itemIndex) {
    if (controls.moveUp.includes(event.key)) {
      moveItem(event, itemIndex, itemIndex - 1);
    } else if (controls.moveDown.includes(event.key)) {
      moveItem(event, itemIndex, itemIndex + 1);
    }
  }

  /**
   * Generates props for a draggable list item, including accessibility attributes and event handlers.
   *
   * @param {Object} item - The item for which to generate props.
   * @param {number} itemIndex - The index of the item in the list.
   * @returns {Object} The props object containing accessibility attributes and event handlers for the list item.
   */
  function getItemProps(item, itemIndex) {
    return {
      [CONSTANTS.LIST_ITEM_ID]: `${getItemId(item)}`,
      onKeydown: (event) => handleKeyDown(event, itemIndex),
      'aria-posinset': itemIndex + 1, // ARIA attribute for position in the list
      'aria-setsize': draggableList.value.length, // ARIA attribute for total number of items
      role: 'listitem',
      tabindex: 0,
    };
  }

  return {
    draggableList,
    getItemProps,
    listAriaLabel,
    liveAnnouncement,
  };
}

/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * @fileoverview
 * Vue 3 directive to make table headers resizable via mouse, touch, and keyboard.
 * Compatible with native <table>, BTable, or any table component.
 * Adds the 'table-resizable' class to the table for styling.
 *
 * ## Usage
 * v-resizable-table="options"
 *
 * ## Options (all optional)
 * - wrap: {boolean} Whether to allow text wrapping in table cells (default: false)
 * - persistKey: {string} Key for localStorage to persist column widths
 *
 * Example:
 * <table v-resizable-table="{ persistKey: 'my-table' }">...</table>
 */

import {
  announceMessage,
  applyFixedTableLayout,
  createResizer,
  getColumnName,
  getColumnWidth,
  getColumnMinWidthInPx,
  getPersistedColumnWidth,
  isResizableColumn,
  measureCellContent,
  persistCurrentWidths,
  updateColumnWidths,
} from '../../utils/resizableTableUtils';

const TABLE_CLASS = 'table-resizable';
const RESIZER_CLASS = 'resizer';
const RESIZING_CLASS = `${TABLE_CLASS}--resizing`;
const RESIZER_MEASURE_CLASS = `${TABLE_CLASS}__shared-measure-container`;
const RESIZER_LIVE_REGION_CLASS = `${TABLE_CLASS}__live-region`;
const TABLE_NOWRAP_CLASS = `${TABLE_CLASS}--nowrap`;
const MUTATION_OBSERVER_DEBOUNCE_MS = 200;
const COLUMN_PROPS_MAP = new Map();

// Store event handlers to remove them later
const eventHandlers = new WeakMap();

/**
 * Get the event handlers for a specific resizer element.
 * @param {HTMLElement} resizer The resizer element
 * @returns {Object} The event handlers for the resizer
 */
function getEventHandlers(resizer) {
  if (!eventHandlers.has(resizer)) eventHandlers.set(resizer, {});
  return eventHandlers.get(resizer);
}

// Shared measure element for all tables (perf optimization)
const sharedMeasureDiv = document.createElement('div');
sharedMeasureDiv.setAttribute('aria-hidden', 'true');
sharedMeasureDiv.classList.add(RESIZER_MEASURE_CLASS);
document.body.appendChild(sharedMeasureDiv);

/**
 * Determines if the table is in right-to-left mode.
 * @param {HTMLElement} table - The table element
 * @returns {boolean}
 */
function isRightToLeft(table) {
  return getComputedStyle(table).direction === 'rtl';
}

/**
 * Event Handler for window resizing event.
 * Fetches the updated column widths from the local storage by using the persistKey and updates the columnProps with the updated pixel widths.
 * Apply the updated pixel widths to each of the column elements.
 */
function syncColumnWidthsToComputed() {
  COLUMN_PROPS_MAP.forEach((columnProps, key) => {
    const persistedWidthsInPixel = getPersistedColumnWidth(key);
    columnProps.columnMinWidth = getColumnMinWidthInPx();
    columnProps.cols.forEach((col, colIndex) => {
      const restoredWidthInPx = persistedWidthsInPixel[colIndex] || parseInt(getComputedStyle(col).width, 10) || col.offsetWidth;
      updateColumnWidths(colIndex, restoredWidthInPx, columnProps);
    });
  });
}

// Helper to get the X coordinate from mouse or touch event
function getClientX(e) {
  return e.touches ? e.touches[0].clientX : e.clientX;
}

/**
 * Makes a column header resizable by adding a resizer handle and events.
 * @param {number} colIndex - The index of the column
 * @param {object} columnProps - An object containing column properties
 * @param {HTMLElement} table - The table element
 */
function createResizableColumn(colIndex, columnProps, table) {
  const col = columnProps.cols[colIndex];
  col.style.position = 'relative';
  // Prevent duplicate resizers or columns marked as non-resizable
  if (col.querySelector(`.${RESIZER_CLASS}`) || !isResizableColumn(col.classList)) return;
  const resizer = createResizer(colIndex, columnProps);
  const handlers = getEventHandlers(resizer);
  let startX = 0;
  let startWidth = 0;
  let isResizing = false;
  const { persistKey } = columnProps;

  /**
   * Shared logic for mouse down and touch start events.
   * @param {MouseEvent|TouchEvent} event The mouse or touch event
   * @param {HTMLElement} currentColumn The column element being resized
   * @param {HTMLElement} currentResizer The resizer element
   */
  function onDown(event, currentColumn, currentResizer) {
    event.preventDefault();
    isResizing = true;
    startX = getClientX(event);
    startWidth = getColumnWidth(currentColumn);
    currentResizer.classList.add(RESIZING_CLASS);
  }

  /**
   * Handles mouse/touch move events for resizing.
   * @param {MouseEvent|TouchEvent} event The mouse or touch event
   */
  function onMove(event) {
    if (!isResizing) return;
    // Ensure table-layout is fixed when user starts interacting with the column width
    applyFixedTableLayout(table);
    window.requestAnimationFrame(() => {
      const clientX = getClientX(event);
      const dx = isRightToLeft(table) ? startX - clientX : clientX - startX;
      const newWidth = Math.max(columnProps.columnMinWidth, startWidth + dx);
      if (col.style.width !== `${newWidth}px`) {
        updateColumnWidths(colIndex, newWidth, columnProps);
        const columnName = getColumnName(columnProps, colIndex);
        announceMessage(table.__resizeLiveRegion, columnName, Math.round(newWidth));
      }
    });
  }

  /**
   * Handles mouse/touch up events to finalize resizing.
   */
  function onUp() {
    if (!isResizing) return;
    isResizing = false;

    resizer.classList.remove(RESIZING_CLASS);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
    // Prevent accidental click after resize
    const suppressClick = (clickEvent) => {
      clickEvent.stopPropagation();
      clickEvent.preventDefault();
      document.removeEventListener('click', suppressClick, true);
    };
    document.addEventListener('click', suppressClick, true);
    persistCurrentWidths(COLUMN_PROPS_MAP.get(persistKey));
  }

  /**
   * Mouse events for resizing
   * @param {MouseEvent} e The mouse event
   */
  handlers.onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onDown(e, col, resizer);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  /**
   * Touch events for resizing
   * @param {TouchEvent} e The touch event
   */
  handlers.onTouchStart = (e) => {
    onDown(e, col, resizer);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  /**
   * Keyboard accessibility for resizing
   * @param {Event} event The keyboard event
   */
  handlers.onKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    // Ensure table-layout is fixed when user starts interacting with the column width
    applyFixedTableLayout(table);
    event.preventDefault();
    const column = event.target.parentElement;
    const columnIndex = Array.from(column.parentElement.children).indexOf(column);
    const delta = (isRightToLeft(table) ? event.key === 'ArrowLeft' : event.key === 'ArrowRight') ? 10 : -10;
    const columnWidth = getColumnWidth(column);
    const width = Math.max(columnProps.columnMinWidth, columnWidth + delta);
    if (column.style.width !== `${width}px`) {
      updateColumnWidths(columnIndex, width, columnProps);
      const columnName = getColumnName(columnProps, columnIndex);
      announceMessage(table.__resizeLiveRegion, columnName, Math.round(width));
    }
    persistCurrentWidths(columnProps);
  };

  /**
   * Double-click to auto-fit column to content
   */
  handlers.onDoubleClick = () => {
    const { rows } = table;
    let maxContentWidth = columnProps.columnMinWidth;
    for (let i = 0; i < rows.length; i += 1) {
      const cell = rows[i].cells[colIndex];
      if (cell) {
        const totalWidth = measureCellContent(sharedMeasureDiv, cell);
        if (totalWidth > maxContentWidth) maxContentWidth = totalWidth;
      }
    }
    updateColumnWidths(colIndex, maxContentWidth, columnProps);
    const columnName = getColumnName(columnProps, colIndex);
    announceMessage(table.__resizeLiveRegion, columnName, Math.round(maxContentWidth));
    persistCurrentWidths(columnProps);
  };

  resizer.addEventListener('mousedown', handlers.onMouseDown);
  resizer.addEventListener('touchstart', handlers.onTouchStart, { passive: false });
  resizer.addEventListener('keydown', handlers.onKeyDown);
  resizer.addEventListener('dblclick', handlers.onDoubleClick);
  col.appendChild(resizer);
}

/**
 * Initializes or updates the resizable columns for the table.
 * @param {HTMLTableElement} table
 * @param {object} options - Directive binding options
 * @param {object} context - contextual values from mounted hook
 */
function createResizableTable(table, options) {
  const cols = Array.from(table.querySelectorAll('th'));
  const resizableCols = cols.filter((col) => isResizableColumn(col.classList));
  if (resizableCols.length <= 1) return; // Hide resizer if less than 2 resizable columns present in the table
  if (options.wrap) {
    table.parentElement.classList.remove(TABLE_NOWRAP_CLASS);
  } else {
    table.parentElement.classList.add(TABLE_NOWRAP_CLASS);
  }
  const { persistKey } = options;
  // Restore persisted widths if available
  const persistedColumnWidths = getPersistedColumnWidth(persistKey);
  if (persistedColumnWidths?.length > 0) {
    applyFixedTableLayout(table); // Ensure table-layout is fixed when the modified column widths are being restored
  }
  // Adds column properties to the Map based on the table persistKey
  COLUMN_PROPS_MAP.set(persistKey, {
    persistKey,
    cols,
    tableId: table.id,
    tdColumnList: table.querySelector('tbody tr:first-child')?.cells || table.rows?.[1]?.cells || [],
    columnMinWidth: getColumnMinWidthInPx(),
  });

  // Add resizer handles to each column
  cols.forEach((col, colIndex) => {
    if (persistedColumnWidths[colIndex]) {
      updateColumnWidths(colIndex, persistedColumnWidths[colIndex], COLUMN_PROPS_MAP.get(persistKey));
    }
    createResizableColumn(colIndex, COLUMN_PROPS_MAP.get(persistKey), table);
  });
}

export default {
  /**
   * Vue 3 directive hook: called when the directive is mounted.
   * Sets up resizer handles, accessibility, and event listeners.
   * @param {HTMLElement} el - The element the directive is bound to.
   * @param {Object} binding - The binding object containing options.
   * @see Options in file header for accepted properties.
   */
  mounted(el, binding) {
    const options = binding.value || {};
    // Find the table element (supports both direct and nested usage)
    const table = (el.tagName === 'TABLE' ? el : el.querySelector('table'));
    if (!table) {
      return;
    }
    table.parentElement.classList.add(TABLE_CLASS);

    // Accessibility: live region for announcements
    const liveRegion = document.createElement('span');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.classList.add(RESIZER_LIVE_REGION_CLASS);
    table.parentNode.insertBefore(liveRegion, table);
    table.__resizeLiveRegion = liveRegion;

    // Sync on window resize to prevent jump after dev tools open/close
    window.addEventListener('resize', syncColumnWidthsToComputed);

    // Observe table structure changes to re-initialize resizers
    let mutationTimeout;
    const observer = new MutationObserver((mutationsList) => {
      const hasStructuralChange = mutationsList.some((mutation) => mutation.type === 'childList');
      if (hasStructuralChange) {
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          // Always ensure the class is present
          if (!table.parentElement.classList.contains(TABLE_CLASS)) {
            table.parentElement.classList.add(TABLE_CLASS);
          }
          createResizableTable(table, options);
        }, MUTATION_OBSERVER_DEBOUNCE_MS);
      }
    });
    observer.observe(table, { childList: true, subtree: true });

    // Always call createResizableTable, even if there are no <th> yet.
    // It will be called again by the observer when <th> appear.
    createResizableTable(table, options);
    table.__resizeObserver = observer;
  },

  /**
   * Vue 3 directive hook: called when the directive is unmounted.
   * Cleans up event listeners, observers, and resizer handles.
   * @param {HTMLElement} el - The element the directive is bound to.
   */
  unmounted(el) {
    const table = el.tagName === 'TABLE' ? el : el.querySelector('table');
    const cols = Array.from(table.querySelectorAll('th'));
    if (!table) return;
    // Remove resizer handles and attributes
    cols.forEach((col) => {
      const resizer = col.querySelector(`.${RESIZER_CLASS}`);
      if (!resizer) return;
      const handlers = getEventHandlers(resizer);
      resizer.removeEventListener('mousedown', handlers.onMouseDown);
      resizer.removeEventListener('touchstart', handlers.onTouchStart);
      resizer.removeEventListener('keydown', handlers.onKeyDown);
      resizer.removeEventListener('dblclick', handlers.onDoubleClick);
      eventHandlers.delete(resizer);
      resizer.remove();
    });

    // Remove table class and live region
    table.parentElement.classList.remove(TABLE_CLASS);
    table.parentElement.classList.remove(TABLE_NOWRAP_CLASS);
    if (table.__resizeLiveRegion) {
      table.__resizeLiveRegion.remove();
      delete table.__resizeLiveRegion;
    }

    // Disconnect observer
    if (table.__resizeObserver) {
      table.__resizeObserver.disconnect();
      delete table.__resizeObserver;
    }
    COLUMN_PROPS_MAP.clear();

    // Remove window resize listener
    window.removeEventListener('resize', syncColumnWidthsToComputed);
  },
};

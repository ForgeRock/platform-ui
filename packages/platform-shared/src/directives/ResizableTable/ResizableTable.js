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
 * Adds the 'resizable-table' class to the table for styling.
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
  getColumnWidth,
  getColumnWidthRangeInPx,
  getPersistedColumnWidth,
  isNonResizedColumn,
  measureCellContent,
  persistCurrentWidths,
  updateColumnWidths,
} from '../../utils/resizableTableUtils';
import store from '../../store';

const TABLE_CLASS = 'resizable-table';
const RESIZER_CLASS = 'resizer';
const RESIZING_CLASS = `${TABLE_CLASS}--resizing`;
const RESIZER_MEASURE_CLASS = `${TABLE_CLASS}__shared-measure-container`;
const RESIZER_LIVE_REGION_CLASS = `${TABLE_CLASS}__live-region`;
const TABLE_NOWRAP_CLASS = `${TABLE_CLASS}--nowrap`;
const MUTATION_OBSERVER_DEBOUNCE_MS = 200;
const ANNOUNCE_WIDTH_THRESHOLD = 10;
const COLUMN_PROPS_MAP = new Map();
let persistKey;

// Shared measure element for all tables (perf optimization)
const sharedMeasureDiv = document.createElement('div');
sharedMeasureDiv.setAttribute('aria-hidden', 'true');
sharedMeasureDiv.classList.add(RESIZER_MEASURE_CLASS);
document.body.appendChild(sharedMeasureDiv);

/**
 * Event Handler for window resizing event.
 * Fetches the updated column widths from the local storage by using the persistKey and updates the columnPropsMap with the updated pixel widths.
 * Apply the updated pixel widths to each of the column elements.
 * @Param { Map } columnPropsMap - A map containing column properties.
 */
function syncColumnWidthsToComputed() {
  const columnPropsMap = COLUMN_PROPS_MAP.get(persistKey);
  const persistedWidthsInPixel = getPersistedColumnWidth(persistKey);
  const columnWidthRange = getColumnWidthRangeInPx();
  columnPropsMap.columnMaxWidth = columnWidthRange.max;
  columnPropsMap.columnMinWidth = columnWidthRange.min;
  columnPropsMap.cols.forEach((col, colIndex) => {
    const restoredWidthInPx = persistedWidthsInPixel[colIndex] || parseInt(getComputedStyle(col).width, 10) || col.offsetWidth;
    updateColumnWidths(colIndex, restoredWidthInPx, columnPropsMap);
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
    let isResizing = false;
    const options = binding.value || {};
    // Find the table element (supports both direct and nested usage)
    const table = el.tagName === 'TABLE' ? el : el.querySelector('table');
    const { enableTableColumnResizing } = store.state.SharedStore;
    if (!table || !enableTableColumnResizing || options.showColumnResizer === false) {
      return;
    }
    table.classList.add(TABLE_CLASS);

    // Accessibility: live region for announcements
    const liveRegion = document.createElement('span');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.classList.add(RESIZER_LIVE_REGION_CLASS);
    table.parentNode.insertBefore(liveRegion, table);
    table.__resizeLiveRegion = liveRegion;

    // Track last announced width for accessibility
    const lastAnnouncedWidth = {};
    const isRTL = getComputedStyle(table).direction === 'rtl';

    /**
     * Makes a column header resizable by adding a resizer handle and events.
     * @param {HTMLElement} col
     * @param {number} colIndex
     * @param {Map} columnPropsMap
     */
    function createResizableColumn(col, colIndex, columnPropsMap) {
      col.style.position = 'relative';
      // Prevent duplicate resizers or columns marked as non-resizable
      if (col.querySelector(`.${RESIZER_CLASS}`) || isNonResizedColumn(col.classList)) return;
      const resizer = createResizer(col, colIndex, columnPropsMap);

      let startX = 0;
      let startWidth = 0;
      lastAnnouncedWidth[colIndex] = col.offsetWidth;

      // Helper to get the X coordinate from mouse or touch event
      const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

      /**
       * Handles mouse/touch move events for resizing.
       * @param {MouseEvent|TouchEvent} e
       */
      const onMove = (e) => {
        if (!isResizing) return;
        // Ensure table-layout is fixed when user starts interacting with the column width
        applyFixedTableLayout(table);
        window.requestAnimationFrame(() => {
          const clientX = getClientX(e);
          const dx = isRTL ? startX - clientX : clientX - startX;
          const newWidth = Math.max(columnPropsMap.columnMinWidth, Math.min(columnPropsMap.columnMaxWidth, startWidth + dx));
          if (col.style.width !== `${newWidth}px`) {
            updateColumnWidths(colIndex, newWidth, columnPropsMap);
            resizer.setAttribute('aria-valuenow', newWidth);
            resizer.setAttribute('aria-valuemin', columnPropsMap.columnMinWidth);
            resizer.setAttribute('aria-valuemax', columnPropsMap.columnMaxWidth);
            if (Math.abs(newWidth - lastAnnouncedWidth[colIndex]) >= ANNOUNCE_WIDTH_THRESHOLD) {
              announceMessage(liveRegion, 'columnResized', colIndex + 1, Math.round(newWidth));
              lastAnnouncedWidth[colIndex] = newWidth;
            }
          }
        });
      };

      /**
       * Handles mouse/touch up events to finalize resizing.
       */
      const onUp = () => {
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
        const width = parseInt(getComputedStyle(col).width, 10) || col.offsetWidth;
        announceMessage(liveRegion, 'columnFinalized', colIndex + 1, Math.round(width));
        persistCurrentWidths(columnPropsMap);
      };

      // Mouse events for resizing
      resizer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = getClientX(e);
        startWidth = getColumnWidth(col);
        resizer.classList.add(RESIZING_CLASS);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      // Touch events for resizing
      resizer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isResizing = true;
        startX = getClientX(e);
        startWidth = getColumnWidth(col);
        resizer.classList.add(RESIZING_CLASS);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
      }, { passive: false });

      // Keyboard accessibility for resizing
      resizer.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        // Ensure table-layout is fixed when user starts interacting with the column width
        applyFixedTableLayout(table);
        e.preventDefault();
        const column = e.target.parentElement;
        const columnIndex = Array.from(column.parentElement.children).indexOf(column);
        const delta = e.key === 'ArrowRight' ? 10 : -10;
        const columnWidth = getColumnWidth(column);
        const width = Math.max(columnPropsMap.columnMinWidth, Math.min(columnPropsMap.columnMaxWidth, columnWidth + delta));
        updateColumnWidths(columnIndex, width, columnPropsMap);
        announceMessage(liveRegion, 'columnResized', columnIndex + 1, Math.round(width));
        resizer.setAttribute('aria-valuenow', width);
        resizer.setAttribute('aria-valuemin', columnPropsMap.columnMinWidth);
        resizer.setAttribute('aria-valuemax', columnPropsMap.columnMaxWidth);
        persistCurrentWidths(columnPropsMap);
      });

      // Double-click to auto-fit column to content
      resizer.addEventListener('dblclick', () => {
        const { rows } = table;
        let maxContentWidth = columnPropsMap.columnMinWidth;
        for (let i = 0; i < rows.length; i += 1) {
          const cell = rows[i].cells[colIndex];
          if (cell) {
            const totalWidth = measureCellContent(sharedMeasureDiv, cell);
            if (totalWidth > maxContentWidth) maxContentWidth = totalWidth;
          }
        }
        updateColumnWidths(colIndex, maxContentWidth, columnPropsMap);
        announceMessage(liveRegion, 'columnAutoFitted', colIndex + 1, Math.round(maxContentWidth));
        persistCurrentWidths(columnPropsMap);
      });
      col.appendChild(resizer);
    }

    /**
     * Initializes or updates the resizable columns for the table.
     * @param {HTMLTableElement} tbl
     */
    function createResizableTable(tbl) {
      const cols = Array.from(tbl.querySelectorAll('th'));
      const nonActionsCols = cols.filter((col) => !isNonResizedColumn(col.classList));
      if (options.showColumnResizer === false || !nonActionsCols.length || nonActionsCols.length === 1) return; // Hide the resizer if no columns or only one non-action column is present in the table
      if (options.wrap) {
        table.classList.remove(TABLE_NOWRAP_CLASS);
      } else {
        table.classList.add(TABLE_NOWRAP_CLASS);
      }
      persistKey = options.persistKey;
      // Restore persisted widths if available
      const persistedColumnWidths = getPersistedColumnWidth(persistKey);
      if (persistedColumnWidths?.length > 0) {
        applyFixedTableLayout(table); // Ensure table-layout is fixed when the modified column widths are being restored
      }
      const columnWidthRange = getColumnWidthRangeInPx();
      // Creates a Map of column properties based on the table persistKey
      COLUMN_PROPS_MAP.set(persistKey, {
        persistKey,
        cols,
        tableId: table.id,
        tdColumnList: tbl.querySelector('tbody tr:first-child')?.cells || tbl.rows?.[1]?.cells || [],
        columnMinWidth: columnWidthRange.min,
        columnMaxWidth: columnWidthRange.max,
      });

      // Add resizer handles to each column
      cols.forEach((col, colIndex) => {
        if (persistedColumnWidths[colIndex]) {
          updateColumnWidths(colIndex, persistedColumnWidths[colIndex], COLUMN_PROPS_MAP.get(options.persistKey));
        }
        createResizableColumn(col, colIndex, COLUMN_PROPS_MAP.get(options.persistKey));
      });
    }
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
          if (!table.classList.contains(TABLE_CLASS)) {
            table.classList.add(TABLE_CLASS);
          }
          createResizableTable(table);
        }, MUTATION_OBSERVER_DEBOUNCE_MS);
      }
    });
    observer.observe(table, { childList: true, subtree: true });

    // Always call createResizableTable, even if there are no <th> yet.
    // It will be called again by the observer when <th> appear.
    createResizableTable(table);
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
      if (resizer) {
        resizer.remove();
      }
    });

    // Remove table class and live region
    table.classList.remove(TABLE_CLASS);
    table.classList.remove(TABLE_NOWRAP_CLASS);
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

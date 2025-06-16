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
 * Emits a 'column-resized' CustomEvent on the table element.
 *
 * ## Usage
 * v-resizable-table="options"
 *
 * ## Options (all optional)
 * - wrap: {boolean} Whether to allow text wrapping in table cells (default: false)
 * - allowAutoLayout: {boolean} Whether to allow table-layout: auto (default: false)
 * - maxWidth: {number} Maximum width (px) for any column (default: Infinity)
 * - persistKey: {string} Key for localStorage to persist column widths
 * - resizerClass: {string} Extra class for the resizer handle(s)
 * - resizerStyle: {object} Inline style object for the resizer handle(s)
 * - onResizeStart: {function} Callback({ columnIndex, width, event }) when resizing starts
 * - onResize: {function} Callback({ columnIndex, width, event }) on every resize event
 * - onResizeEnd: {function} Callback({ columnIndex, width, event }) when resizing ends
 *
 * Example:
 * <table v-resizable-table="{ maxWidth: 400, persistKey: 'my-table', onResizeEnd: fn }">...</table>
 */

const TABLE_CLASS = 'resizable-table';
const RESIZER_CLASS = 'resizer';
const RESIZING_CLASS = `${TABLE_CLASS}--resizing`;
const RESIZER_MEASURE_CLASS = `${TABLE_CLASS}__shared-measure-container`;
const RESIZER_LIVE_REGION_CLASS = `${TABLE_CLASS}__live-region`;
const TABLE_NOWRAP_CLASS = `${TABLE_CLASS}--nowrap`;
const STORAGE_KEY_PREFIX = `${TABLE_CLASS}-widths-`;
const GLOBAL_MIN_WIDTH = 24;
const RESIZER_CONTENT_BUFFER = 24;
const MUTATION_OBSERVER_DEBOUNCE_MS = 200;
const DEFAULT_MAX_WIDTH = Infinity;
const ANNOUNCE_WIDTH_THRESHOLD = 10;

/**
 * Checks if an element is visible in the DOM.
 * @param {HTMLElement} el
 * @returns {boolean}
 */
function isElementVisible(el) {
  if (!el) return false;
  return !!(el.offsetParent || el === document.body);
}

/**
 * Persist column widths to localStorage.
 * @param {string} key
 * @param {number[]} widths
 */
function setPersistedWidths(key, widths) {
  localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(widths));
}

/**
 * Retrieve persisted column widths from localStorage.
 * @param {string} key
 * @returns {number[]}
 */
function getPersistedWidths(key) {
  if (!key) return [];
  const persisted = localStorage.getItem(STORAGE_KEY_PREFIX + key);
  return persisted ? JSON.parse(persisted) : [];
}

// Helper to sync column widths to computed widths
function syncColumnWidthsToComputed(table) {
  const cols = table.querySelectorAll('th');
  cols.forEach((col) => {
    const computedWidth = getComputedStyle(col).width;
    col.style.setProperty('width', computedWidth, 'important');
  });
}

// Shared measure element for all tables (perf optimization)
const sharedMeasureDiv = document.createElement('div');
sharedMeasureDiv.setAttribute('aria-hidden', 'true');
sharedMeasureDiv.classList.add(RESIZER_MEASURE_CLASS);
document.body.appendChild(sharedMeasureDiv);

/**
 * Measures the content width of a table cell, including padding and buffer.
 * @param {HTMLElement} cell
 * @returns {number}
 */
function measureCellContent(cell) {
  sharedMeasureDiv.innerHTML = '';
  Array.from(cell.childNodes).forEach((node) => {
    sharedMeasureDiv.appendChild(node.cloneNode(true));
  });
  const style = window.getComputedStyle(cell);
  const padding = (parseInt(style.paddingLeft, 10) || 0) + (parseInt(style.paddingRight, 10) || 0);
  return sharedMeasureDiv.offsetWidth + padding + RESIZER_CONTENT_BUFFER;
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

    if (!table) {
      return;
    }
    table.classList.add(TABLE_CLASS);

    // Accessibility: live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('role', 'status');
    liveRegion.classList.add(RESIZER_LIVE_REGION_CLASS);
    table.parentNode.insertBefore(liveRegion, table);
    table.__resizeLiveRegion = liveRegion;

    // Track last announced width for accessibility
    const lastAnnouncedWidth = {};

    /**
     * Announces a message via the live region for screen readers.
     * @param {string} msg
     */
    function announce(msg) {
      liveRegion.textContent = '';
      requestAnimationFrame(() => {
        liveRegion.textContent = msg;
      });
    }

    /**
     * Calls a user-provided callback if present in options.
     * @param {string} hook
     * @param {Object} payload
     */
    function emitCallback(hook, payload) {
      if (typeof options[hook] === 'function') {
        options[hook](payload);
      }
    }

    /**
     * Persists the current column widths using the persistKey option.
     */
    const persistCurrentWidths = () => {
      if (!options.persistKey) return;
      const cols = table.querySelectorAll('th');
      const widths = Array.from(cols).map((c) => parseInt(getComputedStyle(c).width, 10) || c.offsetWidth);
      setPersistedWidths(options.persistKey, widths);
    };

    let maxWidths = [];
    const isRTL = getComputedStyle(table).direction === 'rtl';

    /**
     * Creates a resizer handle for a column header.
     * @param {HTMLElement} col
     * @param {number} colIndex
     * @returns {HTMLElement}
     */
    function createResizer(col, colIndex) {
      const resizer = document.createElement('div');
      resizer.classList.add(RESIZER_CLASS);
      if (options.resizerClass) resizer.classList.add(options.resizerClass);
      resizer.setAttribute('role', 'separator');
      resizer.setAttribute('aria-orientation', 'vertical');
      resizer.setAttribute('tabindex', '0');
      resizer.setAttribute('aria-label', `Resize column ${colIndex + 1}`);
      if (table.id) resizer.setAttribute('aria-controls', table.id);
      resizer.setAttribute('aria-valuenow', col.offsetWidth);
      resizer.setAttribute('aria-valuemin', GLOBAL_MIN_WIDTH);
      resizer.setAttribute('aria-valuemax', maxWidths[colIndex]);
      if (options.resizerStyle) Object.assign(resizer.style, options.resizerStyle);
      if (col.hasAttribute('data-no-resize')) resizer.style.display = 'none';

      return resizer;
    }

    /**
     * Makes a column header resizable by adding a resizer handle and events.
     * @param {HTMLElement} col
     * @param {number} colIndex
     */
    function createResizableColumn(col, colIndex) {
      col.style.position = 'relative';
      // Prevent duplicate resizers or columns marked as non-resizable
      if (col.querySelector(`.${RESIZER_CLASS}`) || col.hasAttribute('data-no-resize')) return;
      const resizer = createResizer(col, colIndex);

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
        window.requestAnimationFrame(() => {
          const clientX = getClientX(e);
          const dx = isRTL ? startX - clientX : clientX - startX;
          const minWidth = GLOBAL_MIN_WIDTH;
          const maxWidth = maxWidths[colIndex] || options.maxWidth || DEFAULT_MAX_WIDTH;
          const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + dx));
          if (col.style.width !== `${newWidth}px`) {
            col.style.setProperty('width', `${newWidth}px`, 'important');
            resizer.setAttribute('aria-valuenow', newWidth);
            resizer.setAttribute('aria-valuemin', minWidth);
            resizer.setAttribute('aria-valuemax', maxWidth);
            if (Math.abs(newWidth - lastAnnouncedWidth[colIndex]) >= ANNOUNCE_WIDTH_THRESHOLD) {
              announce(`Column ${colIndex + 1} resized to ${Math.round(newWidth)} pixels`);
              lastAnnouncedWidth[colIndex] = newWidth;
            }
            emitCallback('onResize', { columnIndex: colIndex, width: newWidth, event: e });
          }
        });
      };

      /**
       * Handles mouse/touch up events to finalize resizing.
       * @param {MouseEvent|TouchEvent} e
       */
      const onUp = (e) => {
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
        const styles = window.getComputedStyle(col);
        const width = parseInt(styles.width, 10) || col.offsetWidth;
        announce(`Column ${colIndex + 1} finalized at ${Math.round(width)} pixels`);
        persistCurrentWidths();
        // Emit a custom event for consumers
        const resizeEvent = new CustomEvent('column-resized', {
          bubbles: true,
          detail: { columnIndex: colIndex, width, originalEvent: e },
        });
        table.dispatchEvent(resizeEvent);
        emitCallback('onResizeEnd', { columnIndex: colIndex, width, event: e });
      };

      // Mouse events for resizing
      resizer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        startX = getClientX(e);
        const styles = window.getComputedStyle(col);
        startWidth = parseInt(styles.width, 10) || col.offsetWidth;
        resizer.classList.add(RESIZING_CLASS);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        emitCallback('onResizeStart', { columnIndex: colIndex, width: startWidth, event: e });
      });

      // Touch events for resizing
      resizer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isResizing = true;
        startX = getClientX(e);
        const styles = window.getComputedStyle(col);
        startWidth = parseInt(styles.width, 10) || col.offsetWidth;
        resizer.classList.add(RESIZING_CLASS);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
        emitCallback('onResizeStart', { columnIndex: colIndex, width: startWidth, event: e });
      }, { passive: false });

      // Keyboard accessibility for resizing
      resizer.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const column = e.target.parentElement;
        const columnIndex = Array.from(column.parentElement.children).indexOf(column);
        const styles = window.getComputedStyle(column);
        let width = parseInt(styles.width, 10) || column.offsetWidth;
        const delta = e.key === 'ArrowRight' ? 10 : -10;
        const minWidth = GLOBAL_MIN_WIDTH;
        const maxWidth = maxWidths[columnIndex] || options.maxWidth || DEFAULT_MAX_WIDTH;
        width = Math.max(minWidth, Math.min(maxWidth, width + delta));
        column.style.setProperty('width', `${width}px`, 'important');
        announce(`Column ${columnIndex + 1} resized to ${Math.round(width)} pixels`);
        resizer.setAttribute('aria-valuenow', width);
        resizer.setAttribute('aria-valuemin', minWidth);
        resizer.setAttribute('aria-valuemax', maxWidth);
        persistCurrentWidths();
        const resizeEvent = new CustomEvent('column-resized', {
          bubbles: true,
          detail: { columnIndex, width, originalEvent: e },
        });
        table.dispatchEvent(resizeEvent);
        emitCallback('onResizeEnd', { columnIndex, width, event: e });
      });

      // Double-click to auto-fit column to content
      resizer.addEventListener('dblclick', () => {
        const { rows } = table;
        let maxContentWidth = GLOBAL_MIN_WIDTH;
        for (let i = 0; i < rows.length; i += 1) {
          const cell = rows[i].cells[colIndex];
          if (cell) {
            const totalWidth = measureCellContent(cell);
            if (totalWidth > maxContentWidth) maxContentWidth = totalWidth;
          }
        }
        col.style.setProperty('width', `${maxContentWidth}px`, 'important');
        announce(`Column ${colIndex + 1} auto-fitted to ${Math.round(maxContentWidth)} pixels`);
        persistCurrentWidths();
        const resizeEvent = new CustomEvent('column-resized', {
          bubbles: true,
          detail: { columnIndex: colIndex, width: maxContentWidth, originalEvent: null },
        });
        table.dispatchEvent(resizeEvent);
        emitCallback('onResizeEnd', { columnIndex: colIndex, width: maxContentWidth, event: null });
      });

      col.appendChild(resizer);
    }

    /**
     * Initializes or updates the resizable columns for the table.
     * @param {HTMLTableElement} tbl
     */
    function createResizableTable(tbl) {
      if (!isElementVisible(tbl)) return;
      if (options.wrap) {
        table.classList.remove(TABLE_NOWRAP_CLASS);
      } else {
        table.classList.add(TABLE_NOWRAP_CLASS);
      }
      const cols = Array.from(tbl.querySelectorAll('th'));
      // Determine max widths for each column
      maxWidths = cols.map((col) => (col.hasAttribute('data-max-width')
        ? parseInt(col.getAttribute('data-max-width'), 10)
        : options.maxWidth || DEFAULT_MAX_WIDTH));
      // Restore persisted widths if available
      const persistedWidths = getPersistedWidths(options.persistKey);
      if (persistedWidths.length) {
        cols.forEach((col, idx) => {
          if (persistedWidths[idx]) {
            const minW = GLOBAL_MIN_WIDTH;
            const maxW = maxWidths[idx] || options.maxWidth || DEFAULT_MAX_WIDTH;
            const restoredWidth = Math.max(minW, Math.min(maxW, persistedWidths[idx]));
            col.style.setProperty('width', `${restoredWidth}px`, 'important');
          }
        });
      } else {
        // Set initial widths if not persisted
        cols.forEach((col) => {
          if (!col.style.width) {
            col.style.setProperty('width', `${Math.max(GLOBAL_MIN_WIDTH, col.offsetWidth)}px`, 'important');
          }
        });
        persistCurrentWidths();
      }
      // Add resizer handles to each column
      cols.forEach((col, colIndex) => {
        createResizableColumn(col, colIndex);
      });
    }

    // Enforce table-layout: fixed unless user opts out
    if (!options.allowAutoLayout) {
      table.style.setProperty('table-layout', 'fixed');
    }

    // Sync on window resize to prevent jump after dev tools open/close
    window.addEventListener('resize', () => syncColumnWidthsToComputed(table));

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

    /**
     * Expose API for programmatic control (optional).
     * @property {function} setColumnWidth - Set the width of a column programmatically.
     * @property {function} getColumnWidth - Get the current width of a column.
     * @property {function} autoFitColumn - Auto-fit a column to its content.
     */
    table.__resizeApi = {
      /**
       * Set the width of a column programmatically.
       * @param {number} colIndex
       * @param {number} width
       */
      setColumnWidth: (colIndex, width) => {
        const cols = table.querySelectorAll('th');
        if (cols[colIndex]) {
          const minW = GLOBAL_MIN_WIDTH;
          const maxW = maxWidths[colIndex] || options.maxWidth || DEFAULT_MAX_WIDTH;
          const newWidth = Math.max(minW, Math.min(maxW, width));
          cols[colIndex].style.setProperty('width', `${newWidth}px`, 'important');
          const resizer = cols[colIndex].querySelector(`.${RESIZER_CLASS}`);
          if (resizer) resizer.setAttribute('aria-valuenow', newWidth);
          announce(`Column ${colIndex + 1} resized to ${Math.round(newWidth)} pixels`);
          persistCurrentWidths();
          emitCallback('onResizeEnd', { columnIndex: colIndex, width: newWidth, event: null });
        }
      },
      /**
       * Get the current width of a column.
       * @param {number} colIndex
       * @returns {number|null}
       */
      getColumnWidth: (colIndex) => {
        const col = table.querySelectorAll('th')[colIndex];
        return col ? (parseInt(getComputedStyle(col).width, 10) || col.offsetWidth) : null;
      },
      /**
       * Auto-fit a column to its content.
       * @param {number} colIndex
       */
      autoFitColumn: (colIndex) => {
        const cols = table.querySelectorAll('th');
        if (cols[colIndex]) {
          const { rows } = table;
          let maxContentWidth = GLOBAL_MIN_WIDTH;
          for (let i = 0; i < rows.length; i += 1) {
            const cell = rows[i].cells[colIndex];
            if (cell) {
              const totalWidth = measureCellContent(cell);
              if (totalWidth > maxContentWidth) maxContentWidth = totalWidth;
            }
          }
          cols[colIndex].style.setProperty('width', `${maxContentWidth}px`, 'important');
          const resizer = cols[colIndex].querySelector(`.${RESIZER_CLASS}`);
          if (resizer) resizer.setAttribute('aria-valuenow', maxContentWidth);
          announce(`Column ${colIndex + 1} auto-fitted to ${Math.round(maxContentWidth)} pixels`);
          persistCurrentWidths();
          emitCallback('onResizeEnd', { columnIndex: colIndex, width: maxContentWidth, event: null });
        }
      },
    };
  },

  /**
   * Vue 3 directive hook: called when the directive is unmounted.
   * Cleans up event listeners, observers, and resizer handles.
   * @param {HTMLElement} el - The element the directive is bound to.
   */
  unmounted(el) {
    const table = el.tagName === 'TABLE' ? el : el.querySelector('table');
    if (!table) return;

    // Remove resizer handles and attributes
    const cols = table.querySelectorAll('th');
    cols.forEach((col) => {
      const resizer = col.querySelector(`.${RESIZER_CLASS}`);
      if (resizer) {
        resizer.remove();
      }
      // Reset column width to computed style
      const computedWidth = getComputedStyle(col).width;
      col.style.setProperty('width', computedWidth, 'important');
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

    // Remove window resize listener
    window.removeEventListener('resize', () => syncColumnWidthsToComputed(table));
  },
};

export {
  setPersistedWidths,
  getPersistedWidths,
};

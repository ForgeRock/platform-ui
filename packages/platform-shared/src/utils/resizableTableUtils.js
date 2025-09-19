/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { debounce } from 'lodash';
import i18n from '@/i18n';
import { getValueFromLocalStorage, setLocalStorageValue } from './localStorageUtils';

const RESIZER_CLASS = 'resizer';
const STORAGE_KEY_SUFFIX = '-column-width';
const MAX_COLUMN_WIDTH_LOWER_LIMIT = 400;
const MAX_COLUMN_WIDTH_UPPER_LIMIT = 1200;
const MIN_COLUMN_WIDTH = 120;
const RESIZER_CONTENT_BUFFER = 24;
const DEBOUNCE_TIMER_IN_MS = 1000;
const FIXED_WIDTH_CLASS_LIST = [
  'w-50',
  'w-25',
  'col-width-33',
  'col-width-20',
];

// Maintains a map of fixed width column lists based on the existing column classes and their applied styling on page load, to avoid resizing them
const NON_RESIZE_COLUMN_LIST = [
  {
    className: 'col-actions',
    width: MIN_COLUMN_WIDTH,
  },
  {
    className: 'checkbox-column',
    width: 15, // The existing width of the checkbox column is 15px
  },
  {
    className: 'selector-cell',
    width: 40, // The existing width of the selector cell is 40px
  },
  {
    className: 'w-100px',
    width: 100,
  },
  {
    className: 'w-120px',
    width: 120,
  },
];

/**
 * Convert and return the viewport width (vw) equivalent of a pixel width (px).
 * @param {Number} widthInPx - The width in pixels to convert.
 * @return {Number} Converted width in viewport units (vw) rounded upto 2 decimal places.
 */
const convertPixelIntoViewportUnit = (widthInPx) => {
  const currentViewportWidth = window.innerWidth;
  const widthInVw = (widthInPx / currentViewportWidth) * 100;
  return Math.round(widthInVw * 100) / 100;
};

/**
 * Converts a viewport width (vw) to its pixel (px) equivalent.
 * @param {Number} widthInVw - The width in viewport units.
 * @return {Number} The equivalent width in pixels, rounded to the nearest integer.
 */
const convertViewportIntoPixelUnit = (widthInVw) => {
  const currentViewportWidth = window.innerWidth;
  return Math.round((widthInVw * currentViewportWidth) / 100);
};

/**
 * Helper to get the current width of a column based on the applied styles.
 * If the computed width is not available, it falls back to inline styles or offsetWidth.
 * @param {HTMLElement} col - The element for calculating the column width.
 * @return {Number} The width of the column in pixels.
 */
const getColumnWidth = (col) => parseInt(col.getBoundingClientRect().width, 10) || parseInt(col.style.width, 10) || col.offsetWidth;

/**
 * Returns the Persisted column widths in pixel unit based on the persistKey.
 * @param {String} persistKey - The key used to persist column widths in local storage.
 * @return {Array} Array of persisted column widths in pixels.
 */
const getPersistedColumnWidth = (persistKey) => {
  const persistedViewportWidths = getValueFromLocalStorage(persistKey + STORAGE_KEY_SUFFIX) || [];
  return persistedViewportWidths.map((width) => convertViewportIntoPixelUnit(width));
};

/**
 * Returns the Minimum and Maximum allowable column width calculated based on the viewport width.
 * @return {Object} An object containing the min and max column width in pixels.
 */
const getColumnWidthRangeInPx = () => {
  const viewportWidth = window.innerWidth;
  return {
    min: Math.max(Math.round(viewportWidth * 0.1), MIN_COLUMN_WIDTH),
    // max column width should be calculated based on the viewport width along with upper and lower limits
    max: Math.max(MAX_COLUMN_WIDTH_LOWER_LIMIT, Math.min(Math.round(viewportWidth * 0.6), MAX_COLUMN_WIDTH_UPPER_LIMIT)),
  };
};

/**
 * Iterates over the available columns and updates the corresponding column widths.
 * @param {Number} colIndex - The index of the column.
 * @param {Number} updatedWidthAtIndex - The updated value for the column width.
 * @Param {Map} columnPropsMap - A map containing column properties.
 */
const updateColumnWidths = (colIndex, updatedWidthAtIndex, columnPropsMap) => {
  Array.from(columnPropsMap.cols).forEach((col, index) => {
    let columnWidth;
    const nonResizableColumn = NON_RESIZE_COLUMN_LIST.find((column) => col.classList.contains(column.className));
    if (nonResizableColumn && nonResizableColumn.width) {
      columnWidth = nonResizableColumn.width;
    } else {
      const updatedColWidth = index === colIndex ? updatedWidthAtIndex : getColumnWidth(col);
      columnWidth = Math.max(columnPropsMap.columnMinWidth, Math.min(columnPropsMap.columnMaxWidth, updatedColWidth));
    }
    col.style.setProperty('width', `${columnWidth}px`, 'important');
  });
};

/**
 * Remove the hard coded width classes from the column list.
 * Used to reset the column widths when persisting widths.
 * @param {NodeList} columnList - List of column elements to remove classes from
 */
const removeClassesFromColumnList = (columnList) => {
  columnList.forEach((col) => {
    FIXED_WIDTH_CLASS_LIST.forEach((fixedClass) => {
      if (col.classList.contains(fixedClass)) {
        col.classList.remove(fixedClass);
      }
    });
  });
};

/**
 * Checks if a column width can be resized or not.
 * @param {Array} classList - The list of class names for the column.
 * @returns {boolean} - Indicates whether the column is non-resizable.
 */
const isNonResizedColumn = (classList) => NON_RESIZE_COLUMN_LIST.some((column) => classList.contains(column.className));
/**
 * Persists the current column widths using the persistKey option.
 * @Param { Map } columnPropsMap - A map containing column properties.

 */
const persistCurrentWidths = (columnPropsMap) => {
  if (!columnPropsMap.persistKey) return;
  removeClassesFromColumnList(columnPropsMap.cols);
  if (columnPropsMap.tdColumnList?.length > 0) {
    removeClassesFromColumnList(columnPropsMap.tdColumnList);
  }
  const viewPortWidths = columnPropsMap.cols.map((col) => convertPixelIntoViewportUnit(getColumnWidth(col)));
  setLocalStorageValue(columnPropsMap.persistKey + STORAGE_KEY_SUFFIX, viewPortWidths);
};

/**
 * Creates a resizer handle for a column header. Triggered inside createResizableColumn corresponding to each column
 * @param {HTMLElement} col - The column header element to which the resizer will be attached.
 * @param {number} colIndex - The index of the column.
 * @param {Map} columnPropsMap - A map containing column properties.
 * @returns {HTMLElement} The created resizer element to be used next to the column header.
 */
const createResizer = (col, colIndex, columnPropsMap) => {
  const resizer = document.createElement('span');
  resizer.classList.add(RESIZER_CLASS);
  resizer.setAttribute('role', 'separator');
  resizer.setAttribute('aria-orientation', 'vertical');
  resizer.setAttribute('tabindex', '0');
  resizer.setAttribute('aria-label', `Resize column ${colIndex + 1}`);
  if (columnPropsMap.tableId) resizer.setAttribute('aria-controls', columnPropsMap.tableId);
  return resizer;
};

/**
 * Announces a message via the live region for screen readers.
 * @param {HTMLElement} liveRegion - The live region element.
 * @param {String} columnName - The name of the column for which the width is being announced.
 * @param {number} width - The width of the column.
 */
const announceMessage = debounce((liveRegion, columnName, width) => {
  const translatedMsg = i18n.global.t('common.columnResizedAnnounceText', { columnName, width });
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    liveRegion.textContent = translatedMsg;
  });
}, DEBOUNCE_TIMER_IN_MS);

/**
 * Measures the content width of a table cell, including padding and buffer.
 * @param {HTMLElement} sharedMeasureDiv - A shared div element used for measurement.
 * @param {HTMLElement} cell
 * @returns {number}
 */
const measureCellContent = (sharedMeasureDiv, cell) => {
  sharedMeasureDiv.innerHTML = '';
  Array.from(cell.childNodes).forEach((node) => {
    sharedMeasureDiv.appendChild(node.cloneNode(true));
  });
  const style = window.getComputedStyle(cell);
  const padding = (parseInt(style.paddingLeft, 10) || 0) + (parseInt(style.paddingRight, 10) || 0);
  return sharedMeasureDiv.offsetWidth + padding + RESIZER_CONTENT_BUFFER;
};
/**
 * Apply fixed table-layout, if not already applied, to ensure column widths are respected
 * @param {HTMLElement} table - The table element to apply the layout to.
 */
const applyFixedTableLayout = (table) => {
  if (table.style.tableLayout !== 'fixed') {
    table.style.setProperty('table-layout', 'fixed');
  }
};

/**
 * Gets the column name based on the column index from the columnPropsMap.
 * If the column name cannot be determined, it returns the column index + 1 as a fallback.
 * @param {Map} columnPropsMap - A map containing column properties.
 * @param {number} columnIndex - The index of the column.
 * @return {String} The name of the column or the column index + 1 if the name cannot be determined.
 */
const getColumnName = (columnPropsMap, columnIndex) => {
  const columnInnerText = columnPropsMap.cols[columnIndex]?.innerText;
  // For the column name, Only consider the first line of the innerText to remove string related to sorting/filtering
  return columnInnerText?.split('\n')[0] || String(columnIndex + 1);
};

export {
  announceMessage,
  applyFixedTableLayout,
  convertPixelIntoViewportUnit,
  convertViewportIntoPixelUnit,
  createResizer,
  getColumnName,
  getColumnWidth,
  getColumnWidthRangeInPx,
  getPersistedColumnWidth,
  isNonResizedColumn,
  measureCellContent,
  persistCurrentWidths,
  removeClassesFromColumnList,
  updateColumnWidths,
};

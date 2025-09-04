/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@/i18n';
import { getValueFromLocalStorage, setLocalStorageValue } from './localStorageUtils';

const RESIZER_CLASS = 'resizer';
const COL_ACTIONS_CLASS = 'col-actions';
const CHECKBOX_COLUMN_CLASS = 'checkbox-column';
const SELECTOR_CELL_COLUMN_CLASS = 'selector-cell';
const NON_RESIZE_COLUMN_CLASS = 'fr-no-resize';
const STORAGE_KEY_SUFFIX = '-column-width';
const CHECKBOX_COLUMN_WIDTH = 15;
const SELECTOR_CELL_COLUMN_WIDTH = 40;
const MAX_COLUMN_WIDTH_LOWER_LIMIT = 400;
const MAX_COLUMN_WIDTH_UPPER_LIMIT = 1200;
const RESIZER_CONTENT_BUFFER = 24;
const FIXED_WIDTH_CLASS_LIST = [
  'w-50',
  'w-25',
  'col-width-33',
  'col-width-20',
];
const NON_RESIZE_CLASS_LIST = [
  COL_ACTIONS_CLASS,
  CHECKBOX_COLUMN_CLASS,
  SELECTOR_CELL_COLUMN_CLASS,
  NON_RESIZE_COLUMN_CLASS,
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
 * Convert and return the pixel width (px) equivalent of a viewport width (vw).
 * @param {Number} widthInVw - The width in viewport units to convert.
 * @return {Number} Converted width in pixels (px).
 */
const convertViewportIntoPixelUnit = (widthInVw) => {
  const currentViewportWidth = window.innerWidth;
  return (widthInVw * currentViewportWidth) / 100;
};

// Helper to get the current width of a column based on the current and computed styles
const getColumnWidth = (col) => parseInt(col.style.width, 10) || parseInt(getComputedStyle(col).width, 10) || col.offsetWidth;

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
 * Returns the Maximum allowable column width calculated based on the viewport width.
 * @return {Number} Maximum column width in pixels.
 */
const getMaxColumnWidthInPx = () => {
  const allowableViewportWidth = Math.round(window.innerWidth * 0.4 * 100) / 100; // Allow max width as 40% of the viewport width
  return Math.max(MAX_COLUMN_WIDTH_LOWER_LIMIT, Math.min(allowableViewportWidth, MAX_COLUMN_WIDTH_UPPER_LIMIT));
};

/**
 * Iterates over the available columns and updates the corresponding column widths.
 * Updates the persistedWidthsInPixel map with the updated calculated width.
 * @param {Number} colIndex - The index of the column.
 * @param {Number} updatedWidthAtIndex - The updated value for the column width.
 * @Param {Map} columnPropsMap - A map containing column properties.
 */
const updateColumnWidths = (colIndex, updatedWidthAtIndex, columnPropsMap) => {
  Array.from(columnPropsMap.cols).forEach((col, index) => {
    let columnWidth;
    if (col.classList.contains(CHECKBOX_COLUMN_CLASS)) {
      columnWidth = CHECKBOX_COLUMN_WIDTH;
    } else if (col.classList.contains(SELECTOR_CELL_COLUMN_CLASS)) {
      columnWidth = SELECTOR_CELL_COLUMN_WIDTH;
    } else if (col.classList.contains(COL_ACTIONS_CLASS)) {
      columnWidth = columnPropsMap.columnMinWidth;
    } else {
      const updatedColWidth = index === colIndex ? updatedWidthAtIndex : parseInt(getComputedStyle(col).width, 10) || col.offsetWidth;
      columnWidth = Math.max(columnPropsMap.columnMinWidth, Math.min(columnPropsMap.columnMaxWidth, updatedColWidth));
    }
    col.style.setProperty('width', `${columnWidth}px`, 'important');
    columnPropsMap.persistedWidthsInPixel[index] = columnWidth; // Sync persisted width with current computed width
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
const isNonResizedColumn = (classList) => NON_RESIZE_CLASS_LIST.some((className) => classList.contains(className));
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
  const viewPortWidths = columnPropsMap.persistedWidthsInPixel.map((width) => convertPixelIntoViewportUnit(width));
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
  resizer.setAttribute('aria-valuenow', col.offsetWidth);
  resizer.setAttribute('aria-valuemin', columnPropsMap.columnMinWidth);
  resizer.setAttribute('aria-valuemax', columnPropsMap.columnMaxWidth);
  return resizer;
};

/**
 * Announces a message via the live region for screen readers.
 * @param {HTMLElement} liveRegion - The live region element.
 * @param {string} type - The type of announcement.
 * @param {number} index - The index of the column.
 * @param {number} width - The width of the column.
 */
const announceMessage = (liveRegion, type, index, width) => {
  const translatedMsg = i18n.global.t(`common.announceText.${type}`, { index, width });
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    liveRegion.textContent = translatedMsg;
  });
};

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

export {
  convertPixelIntoViewportUnit,
  convertViewportIntoPixelUnit,
  getColumnWidth,
  getPersistedColumnWidth,
  getMaxColumnWidthInPx,
  updateColumnWidths,
  persistCurrentWidths,
  removeClassesFromColumnList,
  isNonResizedColumn,
  createResizer,
  announceMessage,
  measureCellContent,
};

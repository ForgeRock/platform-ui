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
const MIN_COLUMN_WIDTH = 120;
const RESIZER_CONTENT_BUFFER = 24;
const DEBOUNCE_TIMER_IN_MS = 1000;
// Maintains a map of columns which should not be resizable
const NON_RESIZABLE_COLUMN_CLASS = 'fr-no-resize';

/**
 * Convert and return the viewport width (vw) equivalent of a pixel width (px).
 * @param {number} widthInPx - The width in pixels to convert.
 * @return {number} Converted width in viewport units (vw) rounded upto 2 decimal places.
 */
function convertPixelIntoViewportUnit(widthInPx) {
  const currentViewportWidth = window.innerWidth;
  const widthInVw = (widthInPx / currentViewportWidth) * 100;
  return Math.round(widthInVw * 100) / 100;
}

/**
 * Converts a viewport width (vw) to its pixel (px) equivalent.
 * @param {number} widthInVw - The width in viewport units.
 * @return {number} The equivalent width in pixels, rounded to the nearest integer.
 */
function convertViewportIntoPixelUnit(widthInVw) {
  const currentViewportWidth = window.innerWidth;
  return Math.round((widthInVw * currentViewportWidth) / 100);
}

/**
 * Helper to get the current width of a column based on the applied styles.
 * If the computed width is not available, it falls back to inline styles or offsetWidth.
 * @param {HTMLElement} col - The element for calculating the column width.
 * @return {number} The width of the column in pixels.
 */
function getColumnWidth(col) {
  return parseInt(col.getBoundingClientRect().width, 10) || parseInt(col.style.width, 10) || col.offsetWidth;
}

/**
 * Returns the Persisted column widths in pixel unit based on the persistKey.
 * @param {String} persistKey - The key used to persist column widths in local storage.
 * @return {Array} Array of persisted column widths in pixels.
 */
function getPersistedColumnWidth(persistKey) {
  const persistedViewportWidths = getValueFromLocalStorage(persistKey + STORAGE_KEY_SUFFIX) || [];
  return persistedViewportWidths.map((width) => convertViewportIntoPixelUnit(width));
}

/**
 * Returns the minimum allowable column width calculated based on the viewport width.
 * @return {number} The minimum column width in pixels.
 */
function getColumnMinWidthInPx() {
  return Math.max(Math.round(window.innerWidth * 0.1), MIN_COLUMN_WIDTH);
}

/**
 * Checks if a column width can be resized or not.
 * @param {Array} classList - The list of class names for the column.
 * @returns {boolean} - Indicates whether the column is resizable.
 */
function isResizableColumn(classList) {
  return !classList.contains(NON_RESIZABLE_COLUMN_CLASS);
}

/**
 * Iterates over the available columns and updates the corresponding column widths.
 * @param {number} colIndex - The index of the column.
 * @param {number} updatedWidthAtIndex - The updated value for the column width.
 * @param {object} columnProps - An object containing column properties.
 */
function updateColumnWidths(colIndex, updatedWidthAtIndex, columnProps) {
  Array.from(columnProps.cols).forEach((col, index) => {
    if (isResizableColumn(col.classList)) {
      const updatedColWidth = index === colIndex ? updatedWidthAtIndex : getColumnWidth(col);
      const columnWidth = Math.max(columnProps.columnMinWidth, updatedColWidth);
      col.style.setProperty('width', `${columnWidth}px`, 'important');
    }
  });
}

/**
 * Persists the current column widths using the persistKey option.
 * @param {object} columnProps - An object containing column properties.
 */
function persistCurrentWidths(columnProps) {
  if (!columnProps.persistKey) return;
  const viewPortWidths = columnProps.cols.map((col) => convertPixelIntoViewportUnit(getColumnWidth(col)));
  setLocalStorageValue(columnProps.persistKey + STORAGE_KEY_SUFFIX, viewPortWidths);
}

/**
 * Creates a resizer handle for a column header. Triggered inside createResizableColumn corresponding to each column
 * @param {number} colIndex - The index of the column.
 * @param {object} columnProps - An object containing column properties.
 * @returns {HTMLElement} The created resizer element to be used next to the column header.
 */
function createResizer(colIndex, columnProps) {
  const resizer = document.createElement('span');
  resizer.classList.add(RESIZER_CLASS);
  resizer.setAttribute('role', 'separator');
  resizer.setAttribute('aria-orientation', 'vertical');
  resizer.setAttribute('tabindex', '0');
  resizer.setAttribute('aria-label', `Resize column ${colIndex + 1}`);
  if (columnProps.tableId) resizer.setAttribute('aria-controls', columnProps.tableId);
  return resizer;
}

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
function measureCellContent(sharedMeasureDiv, cell) {
  sharedMeasureDiv.innerHTML = '';
  Array.from(cell.childNodes).forEach((node) => {
    sharedMeasureDiv.appendChild(node.cloneNode(true));
  });
  const style = window.getComputedStyle(cell);
  const padding = (parseInt(style.paddingLeft, 10) || 0) + (parseInt(style.paddingRight, 10) || 0);
  return sharedMeasureDiv.offsetWidth + padding + RESIZER_CONTENT_BUFFER;
}

/**
 * Apply fixed table-layout, if not already applied, to ensure column widths are respected
 * @param {HTMLElement} table - The table element to apply the layout to.
 */
function applyFixedTableLayout(table) {
  if (table.style.tableLayout !== 'fixed') {
    table.style.setProperty('table-layout', 'fixed');
  }
}

/**
 * Gets the column name based on the column index from the columnProps.
 * If the column name cannot be determined, it returns the column index + 1 as a fallback.
 * @param {object} columnProps - An object containing column properties.
 * @param {number} columnIndex - The index of the column.
 * @return {String} The name of the column or the column index + 1 if the name cannot be determined.
 */
function getColumnName(columnProps, columnIndex) {
  const columnInnerText = columnProps.cols[columnIndex]?.innerText;
  // For the column name, only consider the first line of the innerText to remove strings related to sorting/filtering
  return columnInnerText?.split('\n')[0] || String(columnIndex + 1);
}

export {
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
};

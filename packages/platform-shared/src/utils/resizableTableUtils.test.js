/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as resizableTableUtils from './resizableTableUtils';
import * as localStorageUtils from './localStorageUtils';

describe('resizableTableUtils', () => {
  let originalInnerWidth;
  let columnPropsMap;

  beforeEach(() => {
    // Store the original innerWidth to restore it after the test
    originalInnerWidth = global.innerWidth;
    columnPropsMap = {
      cols: [document.createElement('th')],
      tdColumnList: [],
      persistedWidthsInPixel: [100, 200, 300],
      persistKey: 'test-key',
      columnMinWidth: 120,
      columnMaxWidth: 800,
    };
  });

  afterEach(() => {
    // Restore the original innerWidth
    global.innerWidth = originalInnerWidth;
    // Dispatch a resize event to ensure any listeners are notified of the restoration
    global.dispatchEvent(new Event('resize'));
  });

  it('convertPixelIntoViewportUnit should convert pixels into viewport units based on the window resolution', () => {
    global.innerWidth = 1024;
    expect(resizableTableUtils.convertPixelIntoViewportUnit(500)).toBe(48.83);
    expect(resizableTableUtils.convertPixelIntoViewportUnit(250)).toBe(24.41);

    global.innerWidth = 2560;
    expect(resizableTableUtils.convertPixelIntoViewportUnit(500)).toBe(19.53);
    expect(resizableTableUtils.convertPixelIntoViewportUnit(250)).toBe(9.77);
  });

  it('convertViewportIntoPixelUnit should convert vw into pixel units based on the window resolution', () => {
    global.innerWidth = 1024;
    expect(resizableTableUtils.convertViewportIntoPixelUnit(50)).toBe(512);
    expect(resizableTableUtils.convertViewportIntoPixelUnit(25)).toBe(256);

    global.innerWidth = 2560;
    expect(resizableTableUtils.convertViewportIntoPixelUnit(50)).toBe(1280);
    expect(resizableTableUtils.convertViewportIntoPixelUnit(25)).toBe(640);
  });

  it('removeClassesFromColumnList should remove fixed width classes from the input element list', () => {
    const col1 = document.createElement('th');
    col1.classList.add('w-50', 'foo');
    const col2 = document.createElement('th');
    col2.classList.add('col-width-33', 'bar');
    resizableTableUtils.removeClassesFromColumnList([col1, col2]);
    expect(col1.classList.contains('w-50')).toBe(false);
    expect(col1.classList.contains('foo')).toBe(true);
    expect(col2.classList.contains('col-width-33')).toBe(false);
    expect(col2.classList.contains('bar')).toBe(true);
  });

  it('getPersistedColumnWidth should convert and return persisted column widths in pixel units', () => {
    jest.spyOn(localStorageUtils, 'getValueFromLocalStorage').mockReturnValue([20, 15, 10, 40]);
    expect(resizableTableUtils.getPersistedColumnWidth('test')).toEqual([204.8, 153.6, 102.4, 409.6]);

    jest.spyOn(localStorageUtils, 'getValueFromLocalStorage').mockReturnValue([10, 35, 40]);
    expect(resizableTableUtils.getPersistedColumnWidth('test')).toEqual([102.4, 358.4, 409.6]); // Converted values into pixel units
  });

  it('getMaxColumnWidthInPx should return 400px for lower screen resolutions', () => {
    global.innerWidth = 500;
    expect(resizableTableUtils.getMaxColumnWidthInPx()).toBe(400);
  });

  it('getMaxColumnWidthInPx should return the calculated max column width based on the screen resolutions', () => {
    global.innerWidth = 2560;
    expect(resizableTableUtils.getMaxColumnWidthInPx()).toBe(1024);
  });

  it('getMaxColumnWidthInPx should return 1200px, when the screen resolution is much higher', () => {
    global.innerWidth = 5000;
    expect(resizableTableUtils.getMaxColumnWidthInPx()).toBe(1200);
  });

  it('updateColumnWidths should set corresponding widths for checkbox, selector, and action columns', () => {
    const col1 = document.createElement('input');
    col1.classList.add('checkbox-column');
    const col2 = document.createElement('button');
    col2.classList.add('col-actions');

    columnPropsMap = {
      ...columnPropsMap,
      cols: [col1, col2],
      persistedWidthsInPixel: [120, 180],
    };

    resizableTableUtils.updateColumnWidths(0, 200, columnPropsMap);
    expect(col1.style.width).toBe('15px');

    resizableTableUtils.updateColumnWidths(1, 100, columnPropsMap);
    expect(col2.style.width).toBe('120px');
  });

  it('updateColumnWidths should update the column width based on the input value if it is higher than the default min width', () => {
    const col1 = document.createElement('th');
    const col2 = document.createElement('th');
    const col3 = document.createElement('th');
    columnPropsMap = {
      ...columnPropsMap,
      cols: [col1, col2, col3],
      persistedWidthsInPixel: [120, 180],
    };
    resizableTableUtils.updateColumnWidths(0, 200, columnPropsMap);
    expect(col1.style.width).toBe('200px');
    expect(columnPropsMap.persistedWidthsInPixel[0]).toBe(200);

    resizableTableUtils.updateColumnWidths(1, 80, columnPropsMap);
    expect(col2.style.width).toBe('120px'); // Width should be reset to global min width
    expect(columnPropsMap.persistedWidthsInPixel[1]).toBe(120);

    resizableTableUtils.updateColumnWidths(2, 860, columnPropsMap);
    expect(col3.style.width).toBe(`${columnPropsMap.columnMaxWidth}px`); // Width should be reset to global max width
    expect(columnPropsMap.persistedWidthsInPixel[2]).toBe(800);
  });

  it('persistCurrentWidths should trigger setLocalStorageValue to persist the updated widths', () => {
    const col = document.createElement('td');
    const persistedViewportWidths = [20, 15, 10, 40];
    columnPropsMap = {
      ...columnPropsMap,
      cols: [col],
      persistedWidthsInPixel: persistedViewportWidths.map((width) => resizableTableUtils.convertViewportIntoPixelUnit(width)),
    };
    const setLocalStorageValueSpy = jest.spyOn(localStorageUtils, 'setLocalStorageValue');
    resizableTableUtils.persistCurrentWidths(columnPropsMap);
    const localStorageKey = `${columnPropsMap.persistKey}-column-width`;
    expect(setLocalStorageValueSpy).toHaveBeenCalledWith(localStorageKey, persistedViewportWidths);
  });

  it('isActionColumn should detect all the action columns', () => {
    const col = document.createElement('th');
    col.classList.add('col-actions');
    expect(resizableTableUtils.isActionColumn(col)).toBe(true);
    col.classList.remove('col-actions');
    col.classList.add('checkbox-column');
    expect(resizableTableUtils.isActionColumn(col)).toBe(true);
    col.classList.remove('checkbox-column');
    col.classList.add('selector-cell');
    expect(resizableTableUtils.isActionColumn(col)).toBe(true);
    col.classList.remove('selector-cell');
    expect(resizableTableUtils.isActionColumn(col)).toBe(false);
  });

  it('createResizer should create a resizer element with correct attributes', () => {
    const col = document.createElement('th');
    const resizer = resizableTableUtils.createResizer(col, 0, { tableId: 'table1' });
    expect(resizer.classList.contains('resizer')).toBe(true);
    expect(resizer.getAttribute('aria-controls')).toBe('table1');
    expect(resizer.getAttribute('aria-label')).toContain('Resize column');
  });
});

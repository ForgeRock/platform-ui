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

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      writable: true,
      value: jest.fn(() => ({
        x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0,
      })),
    });
  });

  beforeEach(() => {
    // Store the original innerWidth to restore it after the test
    originalInnerWidth = global.innerWidth;
    columnPropsMap = {
      cols: [document.createElement('th')],
      tdColumnList: [],
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

  it('getPersistedColumnWidth should convert and return the rounded value of the persisted column widths in pixel units', () => {
    jest.spyOn(localStorageUtils, 'getValueFromLocalStorage').mockReturnValue([20, 15, 10, 40]);
    expect(resizableTableUtils.getPersistedColumnWidth('test')).toEqual([205, 154, 102, 410]);

    jest.spyOn(localStorageUtils, 'getValueFromLocalStorage').mockReturnValue([10, 35, 40]);
    expect(resizableTableUtils.getPersistedColumnWidth('test')).toEqual([102, 358, 410]); // Converted values into pixel units
  });

  it('updateColumnWidths should set corresponding widths for checkbox, selector, and action columns', () => {
    const col1 = document.createElement('input');
    col1.classList.add('checkbox-column');
    const col2 = document.createElement('button');
    col2.classList.add('col-actions');

    columnPropsMap = {
      ...columnPropsMap,
      cols: [col1, col2],
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
    };
    resizableTableUtils.updateColumnWidths(0, 200, columnPropsMap);
    expect(col1.style.width).toBe('200px');

    resizableTableUtils.updateColumnWidths(1, 80, columnPropsMap);
    expect(col2.style.width).toBe('120px'); // Width should be reset to global min width

    resizableTableUtils.updateColumnWidths(2, 860, columnPropsMap);
    expect(col3.style.width).toBe(`${columnPropsMap.columnMaxWidth}px`); // Width should be reset to global max width
  });

  it('persistCurrentWidths should trigger setLocalStorageValue to persist the updated column widths in viewport units', () => {
    const col1 = document.createElement('td');
    const col2 = document.createElement('td');
    const col3 = document.createElement('td');
    const widthsArray = [300, 450, 500];
    col1.getBoundingClientRect = jest.fn().mockReturnValueOnce({
      x: 50, y: 50, width: widthsArray[0], height: 100, top: 50, right: 250, bottom: 150, left: 50,
    });
    col2.getBoundingClientRect = jest.fn().mockReturnValueOnce({
      x: 50, y: 50, width: widthsArray[1], height: 100, top: 50, right: 250, bottom: 150, left: 50,
    });
    col3.getBoundingClientRect = jest.fn().mockReturnValueOnce({
      x: 50, y: 50, width: widthsArray[2], height: 100, top: 50, right: 250, bottom: 150, left: 50,
    });

    const persistedViewportWidths = [resizableTableUtils.convertPixelIntoViewportUnit(widthsArray[0]), resizableTableUtils.convertPixelIntoViewportUnit(widthsArray[1]), resizableTableUtils.convertPixelIntoViewportUnit(widthsArray[2])];
    columnPropsMap = {
      ...columnPropsMap,
      cols: [col1, col2, col3],
    };
    const setLocalStorageValueSpy = jest.spyOn(localStorageUtils, 'setLocalStorageValue');
    resizableTableUtils.persistCurrentWidths(columnPropsMap);
    const localStorageKey = `${columnPropsMap.persistKey}-column-width`;
    expect(setLocalStorageValueSpy).toHaveBeenCalledWith(localStorageKey, persistedViewportWidths);
  });

  it('createResizer should create a resizer element with correct attributes', () => {
    const col = document.createElement('th');
    const resizer = resizableTableUtils.createResizer(col, 0, { tableId: 'table1' });
    expect(resizer.classList.contains('resizer')).toBe(true);
    expect(resizer.getAttribute('aria-controls')).toBe('table1');
    expect(resizer.getAttribute('aria-label')).toContain('Resize column');
  });
});

describe('isNonResizedColumn', () => {
  const inputColumn = document.createElement('th');
  inputColumn.classList.add('test-class');
  afterEach(() => {
    inputColumn.classList.remove('col-actions');
    inputColumn.classList.remove('action-wide-column');
    inputColumn.classList.remove('index-column');
    inputColumn.classList.remove('checkbox-column');
    inputColumn.classList.remove('selector-cell');
    inputColumn.classList.remove('w-100px');
    inputColumn.classList.remove('w-120px');
  });

  it('should return true if the element contains "action-wide-column" class', () => {
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(false);
    inputColumn.classList.add('action-wide-column');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(true);
  });

  it('should return true if the element contains "index-column" class', () => {
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(false);
    inputColumn.classList.add('index-column');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(true);
  });

  it('should return true if the element contains "col-actions" class', () => {
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(false);
    inputColumn.classList.add('col-actions');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(true);
  });

  it('should return true if the element contains "w-100px" class', () => {
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(false);
    inputColumn.classList.add('w-100px');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(true);
  });

  it('should return true if the element contains "w-120px" class', () => {
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(false);
    inputColumn.classList.add('w-120px');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(true);
  });

  it('should return true if the element contains "checkbox-column" class', () => {
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(false);
    inputColumn.classList.add('checkbox-column');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(true);
  });

  it('should return true if the element contains "selector-cell" class', () => {
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(false);
    inputColumn.classList.add('selector-cell');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(true);
  });

  it('should return true if the element contains multiple classes from the non-resized column list', () => {
    inputColumn.classList.add('selector-cell');
    inputColumn.classList.add('checkbox-column');
    inputColumn.classList.add('w-100px');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(true);
  });

  it('should return false if the classList does not include any of the non-resized column classes', () => {
    inputColumn.classList.add('some-other-class');
    inputColumn.classList.add('action-column');
    inputColumn.classList.add('selector-column');
    expect(resizableTableUtils.isNonResizedColumn(inputColumn.classList)).toBe(false);
  });
});

describe('applyFixedTableLayout', () => {
  it('should update the table-layout property to fixed for auto-layout tables', () => {
    const autoTable = document.createElement('table');
    autoTable.style.tableLayout = 'auto';
    resizableTableUtils.applyFixedTableLayout(autoTable);
    expect(autoTable.style.tableLayout).toBe('fixed');
  });

  it('should set the table-layout property to fixed for table without explicit table-layout property', () => {
    const table = document.createElement('table');
    resizableTableUtils.applyFixedTableLayout(table);
    expect(table.style.tableLayout).toBe('fixed');
  });

  it('should keep the table-layout property to fixed for fixed-layout tables', () => {
    const fixedTable = document.createElement('table');
    fixedTable.style.tableLayout = 'fixed';
    resizableTableUtils.applyFixedTableLayout(fixedTable);
    expect(fixedTable.style.tableLayout).toBe('fixed');
  });
});

describe('getColumnWidthRangeInPx', () => {
  it('should return the correct min and max column width based on the viewport width', () => {
    global.innerWidth = 1024;
    const { min, max } = resizableTableUtils.getColumnWidthRangeInPx();
    expect(min).toBe(120); // Minimum width should be 120px, as 10% of 1024 is less than 120
    expect(max).toBe(614); // Maximum width should be 614px, as 60% of 1024 is within the range of 400-1200
  });

  it('should return lower range of max width and default min width value for lower screen resolutions', () => {
    global.innerWidth = 500;
    const { min, max } = resizableTableUtils.getColumnWidthRangeInPx();
    expect(min).toBe(120); // Minimum width should be 120px, as 10% of 500 is less than 120
    expect(max).toBe(400); // Lower range of max width should get applied, as 60% of 500 is less than the lower range limit of 400px
  });

  it('should return the calculated min width and higher range of max width for higher screen resolutions', () => {
    global.innerWidth = 2560;
    const { min, max } = resizableTableUtils.getColumnWidthRangeInPx();
    expect(min).toBe(256); // Minimum width should be 256px, as 10% of 2560 is greater than the minimum limit of 120px
    expect(max).toBe(1200); // Higher range of max width should get applied, as 60% of 2560 is greater than 1024
  });
});

describe('getColumnName', () => {
  it('should return the correct column name if the innertext contains newline character', () => {
    const th1 = document.createElement('th');
    th1.innerText = 'Name\n Click to sort ascending';
    const th2 = document.createElement('th');
    th2.innerText = 'Status\n active/inactive';
    const columnPropsMap = {
      cols: [th1, th2],
    };
    expect(resizableTableUtils.getColumnName(columnPropsMap, 0)).toEqual('Name');
    expect(resizableTableUtils.getColumnName(columnPropsMap, 1)).toEqual('Status');
  });

  it('should return the correct column name if the innertext does not contain newline character', () => {
    const th1 = document.createElement('th');
    th1.innerText = 'Description';
    const th2 = document.createElement('th');
    th2.innerText = 'Actions';
    const columnPropsMap = {
      cols: [th1, th2],
    };
    expect(resizableTableUtils.getColumnName(columnPropsMap, 0)).toEqual('Description');
    expect(resizableTableUtils.getColumnName(columnPropsMap, 1)).toEqual('Actions');
  });

  it('should return the fallback column name based on the index if innertext is not found', () => {
    const th1 = document.createElement('th');
    const th2 = document.createElement('th');
    const columnPropsMap = {
      cols: [th1, th2],
    };
    expect(resizableTableUtils.getColumnName(columnPropsMap, 0)).toEqual('1');
    expect(resizableTableUtils.getColumnName(columnPropsMap, 1)).toEqual('2');
  });
});

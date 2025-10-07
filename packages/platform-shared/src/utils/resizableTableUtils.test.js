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
  let columnProps;

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
    columnProps = {
      cols: [document.createElement('th')],
      tdColumnList: [],
      persistKey: 'test-key',
      columnMinWidth: 120,
    };
  });

  afterEach(() => {
    // Restore the original innerWidth
    global.innerWidth = originalInnerWidth;
    // Dispatch a resize event to ensure any listeners are notified of the restoration
    global.dispatchEvent(new Event('resize'));
  });

  it('persistCurrentWidths should convert pixels into viewport units based on the window resolution', () => {
    const setLocalStorageValueSpy = jest.spyOn(localStorageUtils, 'setLocalStorageValue').mockReturnValue([20, 15, 10, 40]);
    global.innerWidth = 1024;
    const mockTh = document.createElement('th');
    mockTh.getBoundingClientRect = jest.fn().mockReturnValue({
      x: 50, y: 50, width: 500, height: 100, top: 50, right: 250, bottom: 150, left: 50,
    });
    const localColumnPropsMap = {
      cols: [mockTh],
      tdColumnList: [],
      persistKey: 'test-key',
      columnMinWidth: 120,
    };
    resizableTableUtils.persistCurrentWidths(localColumnPropsMap);
    expect(setLocalStorageValueSpy).toHaveBeenCalledWith('test-key-column-width', [48.83]);

    mockTh.getBoundingClientRect = jest.fn().mockReturnValue({
      x: 50, y: 50, width: 250, height: 100, top: 50, right: 250, bottom: 150, left: 50,
    });
    resizableTableUtils.persistCurrentWidths(localColumnPropsMap);
    expect(setLocalStorageValueSpy).toHaveBeenCalledWith('test-key-column-width', [24.41]);

    global.innerWidth = 2560;
    resizableTableUtils.persistCurrentWidths(localColumnPropsMap);
    expect(setLocalStorageValueSpy).toHaveBeenCalledWith('test-key-column-width', [9.77]);
  });

  it('getPersistedColumnWidth should convert vw into pixel units based on the window resolution', () => {
    jest.spyOn(localStorageUtils, 'getValueFromLocalStorage').mockReturnValue([20, 15, 10, 40]);
    global.innerWidth = 1024;
    expect(resizableTableUtils.getPersistedColumnWidth('test')[0]).toBe(205);
    expect(resizableTableUtils.getPersistedColumnWidth('test')[1]).toBe(154);

    global.innerWidth = 2560;
    expect(resizableTableUtils.getPersistedColumnWidth('test')[0]).toBe(512);
  });

  it('getPersistedColumnWidth should convert and return the rounded value of the persisted column widths in pixel units', () => {
    jest.spyOn(localStorageUtils, 'getValueFromLocalStorage').mockReturnValue([20, 15, 10, 40]);
    expect(resizableTableUtils.getPersistedColumnWidth('test')).toEqual([205, 154, 102, 410]);

    jest.spyOn(localStorageUtils, 'getValueFromLocalStorage').mockReturnValue([10, 35, 40]);
    expect(resizableTableUtils.getPersistedColumnWidth('test')).toEqual([102, 358, 410]); // Converted values into pixel units
  });

  it('updateColumnWidths should update the column width based on the input value if it is higher than the default min width', () => {
    const col1 = document.createElement('th');
    const col2 = document.createElement('th');
    const col3 = document.createElement('th');
    columnProps = {
      ...columnProps,
      cols: [col1, col2, col3],
    };
    resizableTableUtils.updateColumnWidths(0, 200, columnProps);
    expect(col1.style.width).toBe('200px');

    resizableTableUtils.updateColumnWidths(1, 80, columnProps);
    expect(col2.style.width).toBe('120px'); // Width should be reset to global min width
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

    const mockTh = document.createElement('th');
    mockTh.getBoundingClientRect = jest.fn().mockReturnValue({
      x: 50, y: 50, width: 500, height: 100, top: 50, right: 250, bottom: 150, left: 50,
    });
    const localColumnPropsMap = {
      cols: [mockTh],
      tdColumnList: [],
      persistKey: 'test-key',
      columnMinWidth: 120,
    };
    resizableTableUtils.persistCurrentWidths(localColumnPropsMap);
    columnProps = {
      ...columnProps,
      cols: [col1, col2, col3],
    };
    const setLocalStorageValueSpy = jest.spyOn(localStorageUtils, 'setLocalStorageValue');
    resizableTableUtils.persistCurrentWidths(columnProps);
    const localStorageKey = `${columnProps.persistKey}-column-width`;
    expect(setLocalStorageValueSpy).toHaveBeenCalledWith(localStorageKey, [29.3, 43.95, 48.83]);
  });

  it('createResizer should create a resizer element with correct attributes', () => {
    const resizer = resizableTableUtils.createResizer(0, { tableId: 'table1' });
    expect(resizer.classList.contains('resizer')).toBe(true);
    expect(resizer.getAttribute('aria-controls')).toBe('table1');
    expect(resizer.getAttribute('aria-label')).toContain('Resize column');
  });
});

describe('isResizableColumn', () => {
  const inputColumn = document.createElement('th');
  inputColumn.classList.add('test-class');
  afterEach(() => {
    inputColumn.classList.remove('fr-no-resize');
  });

  it('should return true if the element contains "sticky-right" class', () => {
    expect(resizableTableUtils.isResizableColumn(inputColumn.classList)).toBe(true);
    inputColumn.classList.add('fr-no-resize');
    expect(resizableTableUtils.isResizableColumn(inputColumn.classList)).toBe(false);
  });

  it('should return false if the classList does not include any of the non-resized column classes', () => {
    inputColumn.classList.add('some-other-class');
    inputColumn.classList.add('action-column');
    inputColumn.classList.add('selector-column');
    expect(resizableTableUtils.isResizableColumn(inputColumn.classList)).toBe(true);
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

describe('getColumnMinWidthInPx', () => {
  it('should return the correct min column width based on the viewport width', () => {
    global.innerWidth = 1024;
    const min = resizableTableUtils.getColumnMinWidthInPx();
    expect(min).toBe(120); // Minimum width should be 120px, as 10% of 1024 is less than 120
  });

  it('should return lower range of max width and default min width value for lower screen resolutions', () => {
    global.innerWidth = 500;
    const min = resizableTableUtils.getColumnMinWidthInPx();
    expect(min).toBe(120); // Minimum width should be 120px, as 10% of 500 is less than 120
  });

  it('should return the calculated min width and higher range of max width for higher screen resolutions', () => {
    global.innerWidth = 2560;
    const min = resizableTableUtils.getColumnMinWidthInPx();
    expect(min).toBe(256); // Minimum width should be 256px, as 10% of 2560 is greater than the minimum limit of 120px
  });
});

describe('getColumnName', () => {
  it('should return the correct column name if the innertext contains newline character', () => {
    const th1 = document.createElement('th');
    th1.innerText = 'Name\n Click to sort ascending';
    const th2 = document.createElement('th');
    th2.innerText = 'Status\n active/inactive';
    const columnProps = {
      cols: [th1, th2],
    };
    expect(resizableTableUtils.getColumnName(columnProps, 0)).toEqual('Name');
    expect(resizableTableUtils.getColumnName(columnProps, 1)).toEqual('Status');
  });

  it('should return the correct column name if the innertext does not contain newline character', () => {
    const th1 = document.createElement('th');
    th1.innerText = 'Description';
    const th2 = document.createElement('th');
    th2.innerText = 'Actions';
    const columnProps = {
      cols: [th1, th2],
    };
    expect(resizableTableUtils.getColumnName(columnProps, 0)).toEqual('Description');
    expect(resizableTableUtils.getColumnName(columnProps, 1)).toEqual('Actions');
  });

  it('should return the fallback column name based on the index if innertext is not found', () => {
    const th1 = document.createElement('th');
    const th2 = document.createElement('th');
    const columnProps = {
      cols: [th1, th2],
    };
    expect(resizableTableUtils.getColumnName(columnProps, 0)).toEqual('1');
    expect(resizableTableUtils.getColumnName(columnProps, 1)).toEqual('2');
  });
});

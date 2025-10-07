/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import ResizableTable from './ResizableTable';
import store from '@/store';
import * as localStorageUtils from '../../utils/localStorageUtils';
import * as resizableTableUtils from '../../utils/resizableTableUtils';

// Patch offsetParent to simulate visibility in JSDOM
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() { return this.parentNode ? {} : null; },
    configurable: true,
  });
});

describe('ResizableTable directive', () => {
  let table;
  let singleColTableParent;
  let th1;
  let th2;
  let el;
  let binding;

  // Helpers
  function createTable() {
    table = document.createElement('table');
    const tableParent = document.createElement('div');
    tableParent.appendChild(table);
    table.id = 'test-table';
    const tr = document.createElement('tr');
    th1 = document.createElement('th');
    th2 = document.createElement('th');
    th1.textContent = 'A';
    th2.textContent = 'B';
    tr.appendChild(th1);
    tr.appendChild(th2);
    table.appendChild(document.createElement('thead')).appendChild(tr);
    table.appendChild(document.createElement('tbody'));
    document.body.appendChild(tableParent);
    el = table;
  }

  function createTableWithSingleColumn() {
    singleColTableParent = document.createElement('div');
    const tableElement = document.createElement('table');
    singleColTableParent.appendChild(tableElement);
    singleColTableParent.id = 'test-table';
    const tr = document.createElement('tr');
    th1 = document.createElement('th');
    th1.textContent = 'A';
    tr.appendChild(th1);
    tableElement.appendChild(document.createElement('thead')).appendChild(tr);
    tableElement.appendChild(document.createElement('tbody'));
    document.body.appendChild(singleColTableParent);
    return singleColTableParent;
  }

  function getResizer(th = th1) {
    return th.querySelector('.resizer');
  }

  function addRowWithContent(content1 = '', content2 = '') {
    const row = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.textContent = content1;
    td2.textContent = content2;
    row.appendChild(td1);
    row.appendChild(td2);
    table.tBodies[0].appendChild(row);
  }

  beforeEach(() => {
    createTable();
    binding = { value: { persistKey: 'test-key', maxWidth: 200 } };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    store.state.SharedStore.enableTableColumnResizing = true;
    jest.useRealTimers();
  });

  it('mounted should not add table-resizable behaviour if feature flag is set to false', () => {
    store.state.SharedStore.enableTableColumnResizing = false;
    ResizableTable.mounted(el, binding);
    expect(table.classList.contains('table-resizable')).toBe(false);
    expect(table.querySelectorAll('.resizer').length).toBe(0);
    // Accessibility: live region should not be created
    expect(table.__resizeLiveRegion).not.toBeDefined();
    expect(table.parentNode.contains(table.__resizeLiveRegion)).toBe(false);
  });

  it('mounted adds table-resizable class and resizer handles', () => {
    ResizableTable.mounted(el, binding);
    expect(table.parentNode.classList.contains('table-resizable')).toBe(true);
    expect(table.querySelectorAll('.resizer').length).toBe(2);
    // Accessibility: live region
    expect(table.__resizeLiveRegion).toBeDefined();
    expect(table.parentNode.contains(table.__resizeLiveRegion)).toBe(true);
  });

  it('unmounted cleans up DOM, observers, and event listeners', () => {
    ResizableTable.mounted(el, binding);

    const resizer = getResizer();
    const removeListenerSpy = jest.spyOn(resizer, 'removeEventListener');

    ResizableTable.unmounted(el);

    // Check that elements are removed from the DOM
    expect(getResizer()).toBeNull();
    // Check that cleanup functions were called
    expect(removeListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('calls setLocalStorageValue to update the column width on window events', () => {
    const setLocalStorageValueSpy = jest.spyOn(localStorageUtils, 'setLocalStorageValue');
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    // Simulate mousedown/mousemove/mouseup
    resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 10 }));
    // Force synchronous execution of requestAnimationFrame for test environment
    window.requestAnimationFrame = (cb) => cb();
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 60 }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 40 }));
    expect(setLocalStorageValueSpy).toHaveBeenCalled();
  });

  it('updates column widths on touch events', () => {
    const updateWidthsSpy = jest.spyOn(resizableTableUtils, 'updateColumnWidths');
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();

    // Simulate touch drag
    resizer.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 100 }] }));
    window.requestAnimationFrame = (cb) => cb();
    document.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 150 }] }));
    document.dispatchEvent(new TouchEvent('touchend', {}));

    // Check that width was updated
    expect(updateWidthsSpy).toHaveBeenCalled();
    updateWidthsSpy.mockRestore();
  });

  it('does not call callbacks if not provided', () => {
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    // Should not throw if callbacks are missing
    resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 10 }));
    window.requestAnimationFrame = (cb) => cb();
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 30 }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 30 }));
    // No assertions needed, just ensure no error is thrown
  });

  it('does not add resizer to table having only single column', () => {
    ResizableTable.mounted(createTableWithSingleColumn(), binding);
    expect(singleColTableParent.querySelectorAll('.resizer').length).toBe(0);
    expect(getResizer(th1)).toBeNull();
  });

  it('does not add resizer to table having only one display column and another column having fr-no-resize class', () => {
    th2.classList.add('fr-no-resize');
    ResizableTable.mounted(el, binding);
    expect(getResizer(th2)).toBeNull();
    expect(getResizer(th1)).toBeNull();
  });

  it('keyboard resizing works (ArrowRight/ArrowLeft)', () => {
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    th1.style.width = '150px';
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBe(160);
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBe(150);
  });

  it('keyboard resizing works correctly in RTL mode', () => {
    table.style.direction = 'rtl';
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    th1.style.width = '150px';

    // In RTL, ArrowLeft should increase width
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBe(160);

    // In RTL, ArrowRight should decrease width
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBe(150);
  });

  it('respects min and max width constraints during resize', () => {
    // Mock the range to be narrow for easier testing
    jest.spyOn(resizableTableUtils, 'getColumnMinWidthInPx').mockReturnValue(100);
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    th1.style.width = '150px';

    // Try to resize below min width
    resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 150 }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 0 })); // Large drag left
    expect(parseInt(th1.style.width, 10)).toBe(100);
  });

  it('double-click auto-fits column', () => {
    jest.useFakeTimers();
    ResizableTable.mounted(el, binding);

    // Add a long cell to auto-fit BEFORE running timers
    addRowWithContent('Y'.repeat(40));

    // Now flush timers so MutationObserver and resizer logic run
    jest.runAllTimers();

    // Re-query for the resizer after timers and mutation
    const resizer = getResizer();

    resizer.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBeGreaterThanOrEqual(24);
  });

  it('syncs column widths on window resize', () => {
    const updateWidthsSpy = jest.spyOn(resizableTableUtils, 'updateColumnWidths');
    jest.spyOn(resizableTableUtils, 'getPersistedColumnWidth').mockReturnValue([180, 220]);

    ResizableTable.mounted(el, binding);

    // Simulate window resize event
    window.dispatchEvent(new Event('resize'));

    expect(updateWidthsSpy).toHaveBeenCalledWith(0, 180, expect.any(Object));
    expect(updateWidthsSpy).toHaveBeenCalledWith(1, 220, expect.any(Object));
    updateWidthsSpy.mockRestore();
  });

  it('applies nowrap class by default and respects wrap option', () => {
    ResizableTable.mounted(el, binding);
    expect(table.parentElement.classList.contains('table-resizable--nowrap')).toBe(true);

    ResizableTable.mounted(el, { value: { ...binding.value, wrap: true } });
    expect(table.parentElement.classList.contains('table-resizable--nowrap')).toBe(false);
  });
});

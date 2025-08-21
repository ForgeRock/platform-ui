/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import ResizableTable from './ResizableTable';
import store from '@/store';
import * as localStorageUtils from '../../utils/localStorageUtils';

// Patch offsetParent to simulate visibility in JSDOM
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() { return this.parentNode ? {} : null; },
    configurable: true,
  });
});

describe('ResizableTable directive', () => {
  let table;
  let singleColTable;
  let th1;
  let th2;
  let el;
  let binding;

  // Helpers
  function createTable() {
    table = document.createElement('table');
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
    document.body.appendChild(table);
    el = table;
  }

  function createTableWithSingleColumn() {
    singleColTable = document.createElement('table');
    singleColTable.id = 'test-table';
    const tr = document.createElement('tr');
    th1 = document.createElement('th');
    th1.textContent = 'A';
    tr.appendChild(th1);
    singleColTable.appendChild(document.createElement('thead')).appendChild(tr);
    singleColTable.appendChild(document.createElement('tbody'));
    document.body.appendChild(singleColTable);
    return singleColTable;
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

  test('mounted should not add resizable-table behaviour if feature flag is set to false', () => {
    store.state.SharedStore.enableTableColumnResizing = false;
    ResizableTable.mounted(el, binding);
    expect(table.classList.contains('resizable-table')).toBe(false);
    expect(table.querySelectorAll('.resizer').length).toBe(0);
    // Accessibility: live region should not be created
    expect(table.__resizeLiveRegion).not.toBeDefined();
    expect(table.parentNode.contains(table.__resizeLiveRegion)).toBe(false);
  });

  test('mounted adds resizable-table class and resizer handles', () => {
    ResizableTable.mounted(el, binding);
    expect(table.classList.contains('resizable-table')).toBe(true);
    expect(table.querySelectorAll('.resizer').length).toBe(2);
    // Accessibility: live region
    expect(table.__resizeLiveRegion).toBeDefined();
    expect(table.parentNode.contains(table.__resizeLiveRegion)).toBe(true);
  });

  test('calls setLocalStorageValue to update the column width on window events', () => {
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

  test('does not call callbacks if not provided', () => {
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    // Should not throw if callbacks are missing
    resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 10 }));
    window.requestAnimationFrame = (cb) => cb();
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 30 }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 30 }));
    // No assertions needed, just ensure no error is thrown
  });

  test('does not add resizer to table having only single column', () => {
    ResizableTable.mounted(createTableWithSingleColumn(), binding);
    expect(singleColTable.querySelectorAll('.resizer').length).toBe(0);
    expect(getResizer(th1)).toBeNull();
  });

  test('does not add resizer to table having only one display column and another column having col-action class', () => {
    th2.classList.add('col-actions');
    ResizableTable.mounted(el, binding);
    expect(getResizer(th2)).toBeNull();
    expect(getResizer(th1)).toBeNull();
  });

  test('does not add resizer to table having only one display column and one checkbox column', () => {
    th2.classList.add('checkbox-column');
    ResizableTable.mounted(el, binding);
    expect(getResizer(th2)).toBeNull();
    expect(getResizer(th1)).toBeNull();
  });

  test('keyboard resizing works (ArrowRight/ArrowLeft)', () => {
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    th1.style.width = '150px';
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBe(160);
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBe(150);
  });

  test('double-click auto-fits column', () => {
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
});

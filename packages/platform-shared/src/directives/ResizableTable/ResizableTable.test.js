/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import ResizableTable, { setPersistedWidths, getPersistedWidths } from './ResizableTable';

// Patch offsetParent to simulate visibility in JSDOM
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    get() { return this.parentNode ? {} : null; },
    configurable: true,
  });
});

describe('ResizableTable directive', () => {
  let table;
  let th1;
  let th2;
  let el;
  let binding;
  let origLocalStorage;
  let store;

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
    origLocalStorage = global.localStorage;
    store = {};
    global.localStorage = {
      getItem: (k) => store[k] || null,
      setItem: (k, v) => { store[k] = v; },
      removeItem: (k) => { delete store[k]; },
      clear: () => { store = {}; },
    };
    createTable();
    binding = { value: { persistKey: 'test-key', maxWidth: 200 } };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    global.localStorage = origLocalStorage;
    jest.useRealTimers();
  });

  test('setPersistedWidths and getPersistedWidths work', () => {
    setPersistedWidths('foo', [123, 456]);
    expect(getPersistedWidths('foo')).toEqual([123, 456]);
    expect(getPersistedWidths('bar')).toEqual([]);
  });

  test('mounted adds resizable-table class and resizer handles', () => {
    ResizableTable.mounted(el, binding);
    expect(table.classList.contains('resizable-table')).toBe(true);
    expect(table.querySelectorAll('.resizer').length).toBe(2);
    // Accessibility: live region
    expect(table.__resizeLiveRegion).toBeDefined();
    expect(table.parentNode.contains(table.__resizeLiveRegion)).toBe(true);
  });

  test('API: setColumnWidth, getColumnWidth, autoFitColumn', () => {
    ResizableTable.mounted(el, binding);
    const api = table.__resizeApi;
    expect(api).toBeDefined();
    api.setColumnWidth(0, 150);
    expect(parseInt(th1.style.width, 10)).toBe(150);
    expect(api.getColumnWidth(0)).toBe(150);
    // Fill a cell with long content for autoFit
    addRowWithContent('X'.repeat(50));
    api.autoFitColumn(0);
    expect(parseInt(th1.style.width, 10)).toBeGreaterThanOrEqual(24);
  });

  test('calls onResizeStart, onResize, onResizeEnd callbacks', () => {
    const onResizeStart = jest.fn();
    const onResize = jest.fn();
    const onResizeEnd = jest.fn();
    binding.value.onResizeStart = onResizeStart;
    binding.value.onResize = onResize;
    binding.value.onResizeEnd = onResizeEnd;
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    // Simulate mousedown/mousemove/mouseup
    resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 10 }));
    // Force synchronous execution of requestAnimationFrame for test environment
    window.requestAnimationFrame = (cb) => cb();
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 30 }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 30 }));
    expect(onResizeStart).toHaveBeenCalled();
    expect(onResize).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalled();
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

  test('calls onResizeEnd on keyboard resize', () => {
    const onResizeEnd = jest.fn();
    binding.value.onResizeEnd = onResizeEnd;
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    resizer.focus();
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(onResizeEnd).toHaveBeenCalled();
  });

  test('calls onResizeEnd on double-click auto-fit', () => {
    const onResizeEnd = jest.fn();
    binding.value.onResizeEnd = onResizeEnd;
    ResizableTable.mounted(el, binding);
    // Add a long cell to auto-fit
    addRowWithContent('Z'.repeat(40));
    // Force timers and MutationObserver flush
    jest.useFakeTimers();
    jest.runAllTimers();
    const resizer = getResizer();
    resizer.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(onResizeEnd).toHaveBeenCalled();
  });

  test('does not call onResizeStart if mousedown is not left button', () => {
    const onResizeStart = jest.fn();
    binding.value.onResizeStart = onResizeStart;
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 1, clientX: 10 }));
    expect(onResizeStart).not.toHaveBeenCalled();
  });

  test('calls onResizeStart and onResizeEnd for touch events', () => {
    const onResizeStart = jest.fn();
    const onResizeEnd = jest.fn();
    binding.value.onResizeStart = onResizeStart;
    binding.value.onResizeEnd = onResizeEnd;
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    // Simulate touchstart/touchend
    const touch = { clientX: 10 };
    resizer.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], bubbles: true }));
    document.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch], bubbles: true }));
    expect(onResizeStart).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalled();
  });

  test('restores persisted widths on mount', () => {
    setPersistedWidths('test-key', [111, 222]);
    expect(getPersistedWidths('test-key')).toEqual([111, 222]);
    ResizableTable.mounted(el, binding);
    expect(parseInt(th1.style.width, 10)).toBe(111);
    expect(parseInt(th2.style.width, 10)).toBe(200);
  });

  test('does not add resizer to columns with data-no-resize', () => {
    th2.setAttribute('data-no-resize', 'true');
    ResizableTable.mounted(el, binding);
    expect(getResizer(th2)).toBeNull();
    expect(getResizer(th1)).not.toBeNull();
  });

  test('keyboard resizing works (ArrowRight/ArrowLeft)', () => {
    ResizableTable.mounted(el, binding);
    const resizer = getResizer();
    th1.style.width = '50px';
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBe(60);
    resizer.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBe(50);
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
    expect(resizer).not.toBeNull();

    resizer.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(parseInt(th1.style.width, 10)).toBeGreaterThanOrEqual(24);
  });
});

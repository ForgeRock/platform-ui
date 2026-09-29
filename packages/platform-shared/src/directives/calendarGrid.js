/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Rewrites BootstrapVue's BCalendar DOM into an accessible ARIA grid, so
 * screen readers can navigate dates by row and column (WCAG 1.3.1 —
 * IAM-10173).
 *
 * Usage: <BFormDatepicker v-calendar-grid ...>
 * In <script setup>, import it as `vCalendarGrid`; in Options API
 * components, register it under `directives` as 'calendar-grid'.
 */
const GRID_SELECTOR = '.b-calendar-grid';
const GRID_COLUMN_COUNT = 7;

/**
 * Applies ARIA grid semantics to the calendar grid inside a container.
 * Idempotent — safe to run after every re-render.
 *
 * @param {HTMLElement} container - Element containing a BCalendar grid
 *   (the BFormDatepicker root the directive is bound to).
 */
function applyGridSemantics(container) {
  const grid = container.querySelector(GRID_SELECTOR);
  if (!grid) {
    return;
  }

  const body = grid.querySelector('.b-calendar-grid-body');
  const bodyRows = body ? Array.from(body.children) : [];

  grid.setAttribute('role', 'grid');
  grid.setAttribute('aria-colcount', String(GRID_COLUMN_COUNT));
  // aria-rowcount includes the weekday header row. The number of week rows
  // varies per month (4-6), so it is computed from the DOM on every
  // application rather than hardcoded.
  grid.setAttribute('aria-rowcount', String(bodyRows.length + 1));

  // Un-hide the weekday header row and expose it as the grid's column
  // headers, so screen readers can associate each date cell with its weekday.
  const weekdays = grid.querySelector('.b-calendar-grid-weekdays');
  if (weekdays) {
    weekdays.removeAttribute('aria-hidden');
    weekdays.setAttribute('role', 'row');
    weekdays.setAttribute('aria-rowindex', '1');
    Array.from(weekdays.children).forEach((heading, index) => {
      heading.setAttribute('role', 'columnheader');
      heading.setAttribute('aria-colindex', String(index + 1));
    });
  }

  if (!body) {
    return;
  }

  body.setAttribute('role', 'rowgroup');
  // Explicit aria-colindex: BCalendar hides out-of-month cells,
  // so screen readers need the DOM column position, not a count.
  bodyRows.forEach((row, rowIndex) => {
    row.setAttribute('role', 'row');
    // Row 1 is the weekday header row.
    row.setAttribute('aria-rowindex', String(rowIndex + 2));
    // Explicit name to prevent VoiceOver from reading all cell labels in
    // the row. Must match aria-rowindex value so the spoken number is consistent.
    row.setAttribute('aria-label', String(rowIndex + 2));
    Array.from(row.children).forEach((cell, index) => {
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-colindex', String(index + 1));
      // Ensure consistent aria-selected state: selected cells keep their
      // aria-selected="true" (set by BootstrapVue), non-selected get
      // aria-selected="false" so screen readers announce selection state and
      // support selection-based navigation per the ARIA grid pattern.
      if (!cell.hasAttribute('aria-selected')) {
        cell.setAttribute('aria-selected', 'false');
      }
      // Ensure aria-disabled is present on disabled cells (BootstrapVue sets
      // it on disabled ones, but reinforce it for consistency).
      if (cell.hasAttribute('aria-disabled')) {
        // Already set by BootstrapVue, keep as-is
      } else {
        cell.setAttribute('aria-disabled', 'false');
      }
    });
  });
}

export default {
  /**
   * Directive lifecycle hook called when the host element is mounted.
   * Applies the grid semantics once, then observes the container so
   * re-renders (popup open, month navigation) get the same treatment.
   *
   * @param {HTMLElement} container - The element the directive is bound to.
   */
  mounted(container) {
    applyGridSemantics(container);

    const observer = new MutationObserver(() => applyGridSemantics(container));
    // BCalendar renders nothing while its popup is closed and recreates the
    // grid whenever it opens and whenever the visible month or year changes.
    observer.observe(container, { childList: true, subtree: true });
    container.__calendarGridObserver = observer;
  },
  /**
   * Directive lifecycle hook called after each host component update.
   * Re-applies the (idempotent) grid semantics.
   *
   * @param {HTMLElement} container - The element the directive is bound to.
   */
  updated(container) {
    applyGridSemantics(container);
  },
  /**
   * Directive lifecycle hook called when the host element is unmounted.
   * Disconnects the observer so the container can be garbage collected.
   *
   * @param {HTMLElement} container - The element the directive is bound to.
   */
  unmounted(container) {
    if (container.__calendarGridObserver) {
      container.__calendarGridObserver.disconnect();
      delete container.__calendarGridObserver;
    }
  },
};

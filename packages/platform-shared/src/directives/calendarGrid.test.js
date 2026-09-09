/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { BootstrapVue } from 'bootstrap-vue';
import { axe } from 'jest-axe';
import calendarGrid from './calendarGrid';

/**
 * Build a BCalendar-like DOM structure mirroring the markup the directive
 * is expected to transform (see node_modules/bootstrap-vue calendar.js).
 * @returns {HTMLElement} container element
 */
function createTestCalendar() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="b-calendar-grid form-control h-auto text-center" role="application" tabindex="0" aria-activedescendant="cell-1">
      <div class="b-calendar-grid-caption">September 2026</div>
      <div class="b-calendar-grid-weekdays row no-gutters border-bottom" aria-hidden="true">
        <small class="col">Sun</small>
        <small class="col">Mon</small>
      </div>
      <div class="b-calendar-grid-body">
        <div class="row no-gutters">
          <div class="col p-0" id="cell-0" role="button" aria-label="September 6, 2026" aria-selected="true" aria-current="date">
            <span class="btn">6</span>
          </div>
          <div class="col p-0" id="cell-1" role="button" aria-label="September 7, 2026">
            <span class="btn">7</span>
          </div>
        </div>
      </div>
      <div class="b-calendar-grid-help">help text</div>
    </div>
  `;
  return container;
}

describe('calendarGrid directive', () => {
  it('sets role="grid" on the calendar grid container', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    expect(container.querySelector('.b-calendar-grid').getAttribute('role')).toBe('grid');
  });

  it('exposes the weekday row as row with columnheader children', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    const weekdays = container.querySelector('.b-calendar-grid-weekdays');
    expect(weekdays.getAttribute('role')).toBe('row');
    expect(weekdays.hasAttribute('aria-hidden')).toBe(false);
    weekdays.querySelectorAll('small').forEach((heading, index) => {
      expect(heading.getAttribute('role')).toBe('columnheader');
      expect(heading.getAttribute('aria-colindex')).toBe(String(index + 1));
    });
  });

  it('marks the grid body as rowgroup and week rows as rows', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    const body = container.querySelector('.b-calendar-grid-body');
    expect(body.getAttribute('role')).toBe('rowgroup');
    expect(body.querySelector('.row').getAttribute('role')).toBe('row');
  });

  it('sets aria-colcount and aria-rowcount on the grid', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    const grid = container.querySelector('.b-calendar-grid');
    expect(grid.getAttribute('aria-colcount')).toBe('7');
    // One weekday header row plus one week row in the test fixture
    expect(grid.getAttribute('aria-rowcount')).toBe('2');
  });

  it('gives day cells explicit aria-colindex matching their DOM column', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    container.querySelectorAll('[role="row"]').forEach((row) => {
      row.querySelectorAll('[role="gridcell"]').forEach((cell, index) => {
        expect(cell.getAttribute('aria-colindex')).toBe(String(index + 1));
      });
    });
  });

  it('numbers the header row as row 1 and week rows after it', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    expect(container.querySelector('.b-calendar-grid-weekdays').getAttribute('aria-rowindex')).toBe('1');
    container.querySelectorAll('.b-calendar-grid-body [role="row"]').forEach((row, index) => {
      expect(row.getAttribute('aria-rowindex')).toBe(String(index + 2));
    });
  });

  it('sets aria-label on week rows matching their aria-rowindex', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    container.querySelectorAll('.b-calendar-grid-body [role="row"]').forEach((row, index) => {
      const rowNumber = String(index + 2);
      expect(row.getAttribute('aria-label')).toBe(rowNumber);
      expect(row.getAttribute('aria-rowindex')).toBe(rowNumber);
    });
  });

  it('recomputes aria-rowcount when month navigation changes the week count', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);
    expect(container.querySelector('.b-calendar-grid').getAttribute('aria-rowcount')).toBe('2');

    // Simulate navigating to a month spanning 5 weeks
    const body = container.querySelector('.b-calendar-grid-body');
    const extraWeek = document.createElement('div');
    extraWeek.className = 'row no-gutters';
    extraWeek.innerHTML = `
      <div class="col p-0" role="button" aria-label="November 1, 2026"><span class="btn">1</span></div>
    `;
    body.appendChild(extraWeek);

    calendarGrid.updated(container);

    const grid = container.querySelector('.b-calendar-grid');
    expect(grid.getAttribute('aria-rowcount')).toBe('3');
    expect(extraWeek.getAttribute('aria-rowindex')).toBe('3');
    expect(extraWeek.getAttribute('aria-label')).toBe('3');
  });

  it('changes day cell roles from button to gridcell', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    const cells = container.querySelectorAll('[role="gridcell"]');
    expect(cells.length).toBe(2);
    expect(container.querySelector('[role="button"]')).toBeNull();
  });

  it('preserves day cell labels and sets consistent aria-selected state', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    const cells = container.querySelectorAll('[role="gridcell"]');
    // Selected cell
    expect(cells[0].getAttribute('aria-label')).toBe('September 6, 2026');
    expect(cells[0].getAttribute('aria-selected')).toBe('true');
    expect(cells[0].getAttribute('aria-current')).toBe('date');
    // Non-selected cell gets aria-selected="false" for consistent state
    expect(cells[1].getAttribute('aria-selected')).toBe('false');
  });

  it('sets aria-disabled consistently on all cells', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    const cells = container.querySelectorAll('[role="gridcell"]');
    cells.forEach((cell) => {
      expect(cell.hasAttribute('aria-disabled')).toBe(true);
      // Non-disabled cells get aria-disabled="false"
      if (!cell.hasAttribute('aria-disabled')) {
        expect(cell.getAttribute('aria-disabled')).toBe('false');
      }
    });
  });

  it('does nothing when the container has no calendar grid', () => {
    const container = document.createElement('div');
    container.appendChild(document.createElement('p'));
    expect(() => calendarGrid.mounted(container)).not.toThrow();

    expect(container.querySelector('p').getAttribute('role')).toBeNull();
  });

  it('handles grid without a weekday header row gracefully', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="b-calendar-grid" role="application">
        <div class="b-calendar-grid-body">
          <div class="row no-gutters">
            <div class="col p-0" role="button" aria-label="September 1, 2026"></div>
          </div>
        </div>
      </div>
    `;
    expect(() => calendarGrid.mounted(container)).not.toThrow();

    // Grid still gets transformed without the weekday row
    const grid = container.querySelector('.b-calendar-grid');
    expect(grid.getAttribute('role')).toBe('grid');
    expect(container.querySelector('[role="gridcell"]')).toBeTruthy();
  });

  it('handles grid without a body gracefully', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="b-calendar-grid" role="application">
        <div class="b-calendar-grid-weekdays">
          <small class="col">Sun</small>
        </div>
      </div>
    `;
    expect(() => calendarGrid.mounted(container)).not.toThrow();

    // Grid still gets transformed with weekday header but no body
    const grid = container.querySelector('.b-calendar-grid');
    expect(grid.getAttribute('role')).toBe('grid');
    const weekdays = container.querySelector('.b-calendar-grid-weekdays');
    expect(weekdays.getAttribute('role')).toBe('row');
  });

  it('is idempotent when applied twice', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);
    calendarGrid.updated(container);

    const weekdays = container.querySelector('.b-calendar-grid-weekdays');
    expect(weekdays.getAttribute('role')).toBe('row');
    expect(container.querySelectorAll('[role="gridcell"]').length).toBe(2);
  });

  it('cleans up observer on unmounted', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);
    expect(container.__calendarGridObserver).toBeDefined();

    calendarGrid.unmounted(container);
    expect(container.__calendarGridObserver).toBeUndefined();
  });

  it('re-applies semantics when the grid is re-created after mount', () => {
    const container = createTestCalendar();
    calendarGrid.mounted(container);

    // Simulate BCalendar recreating the grid on month navigation
    const freshGrid = document.createElement('div');
    freshGrid.innerHTML = `
      <div class="b-calendar-grid" role="application" tabindex="0" aria-activedescendant="cell-0">
        <div class="b-calendar-grid-body">
          <div class="row no-gutters">
            <div class="col p-0" id="cell-0" role="button" aria-label="October 1, 2026"><span class="btn">1</span></div>
          </div>
        </div>
      </div>
    `;
    container.replaceChild(freshGrid, container.querySelector('.b-calendar-grid'));

    return flushPromises().then(() => {
      const grid = container.querySelector('.b-calendar-grid');
      expect(grid.getAttribute('role')).toBe('grid');
      expect(grid.querySelector('#cell-0').getAttribute('role')).toBe('gridcell');
      expect(grid.querySelector('.row').getAttribute('aria-label')).toBe('2');
    });
  });

  it('works end to end through a mounted BFormDatepicker', async () => {
    const wrapper = mount({
      template: `<BFormDatepicker
        v-calendar-grid
        v-model="date"
        name="datepicker"
        ref="datepicker" />`,
      data() {
        return { date: '' };
      },
    }, {
      global: {
        plugins: [BootstrapVue],
        directives: { 'calendar-grid': calendarGrid },
      },
      attachTo: document.body,
    });

    await flushPromises();
    // BCalendar renders nothing until the popup opens. In jsdom, directly set
    // the visibility flag to simulate the popup opening (the same flag that
    // onShown event handler would set).
    const datepicker = wrapper.findComponent({ name: 'BFormDatepicker' }).vm;
    datepicker.isVisible = true;
    await flushPromises();

    const grid = wrapper.find('.b-calendar-grid');
    expect(grid.exists()).toBe(true);
    expect(grid.attributes('role')).toBe('grid');

    const weekdays = wrapper.find('.b-calendar-grid-weekdays');
    expect(weekdays.attributes('role')).toBe('row');
    expect(weekdays.attributes('aria-hidden')).toBeUndefined();

    expect(wrapper.find('.b-calendar-grid-body').attributes('role')).toBe('rowgroup');
    expect(wrapper.findAll('[role="row"]').length).toBeGreaterThan(0);
    expect(wrapper.findAll('[role="gridcell"]').length).toBeGreaterThan(0);
    expect(wrapper.find('[role="button"][aria-label]').exists()).toBe(false);

    // Every week row has an aria-label matching its row number
    const weekRows = wrapper.findAll('.b-calendar-grid-body [role="row"]');
    weekRows.forEach((row, index) => {
      const rowNumber = String(index + 2);
      expect(row.attributes('aria-label')).toBe(rowNumber);
      expect(row.attributes('aria-rowindex')).toBe(rowNumber);
    });

    // jest-axe validation: the transformed grid should have no accessibility
    // violations introduced by the new roles and attributes.
    // Drain the frames so the DOM state axe() sees is deterministic.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await flushPromises();
    const results = await axe(wrapper.element);

    // aria-required-children is not an issue for calendarGrid: the only
    // flagged child is BCalendar's own month-caption live region
    // (aria-atomic inside the grid div, calendar.js $gridCaption) — it must
    // keep its live attributes, so the finding is expected and accepted.
    // Anything else (any other violation, or a second offending element)
    // still fails.
    const isKnownCaptionFinding = (violation) => violation.id === 'aria-required-children'
      && violation.nodes.length === 1
      && (violation.nodes[0].any ?? []).some((check) => check.id === 'aria-required-children'
        && check.data
        && check.data.messageKey === 'unallowed'
        && check.data.values === 'div[aria-atomic]');

    const unexpectedViolations = results.violations.filter(
      (violation) => !isKnownCaptionFinding(violation),
    );
    expect(unexpectedViolations).toHaveLength(0);

    wrapper.unmount();
  });
});

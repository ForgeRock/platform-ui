/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { BootstrapVue } from 'bootstrap-vue';
import presentationalTable from './presentationalTable';

/**
 * Build a BTable-like DOM structure with the roles and aria attributes
 * the directive is expected to strip.
 * @returns {HTMLElement} table element
 */
function createTestTable() {
  const table = document.createElement('table');
  table.setAttribute('aria-colcount', '2');
  table.setAttribute('aria-rowcount', '3');
  table.setAttribute('aria-busy', 'false');
  table.setAttribute('role', 'table');
  table.innerHTML = `
    <thead role="rowgroup">
      <tr role="row">
        <th role="columnheader" aria-colindex="1">Icon</th>
        <th role="columnheader" aria-colindex="2">Activity</th>
      </tr>
    </thead>
    <tbody role="rowgroup">
      <tr role="row" aria-rowindex="1">
        <td role="cell" aria-colindex="1">icon</td>
        <td role="cell" aria-colindex="2">comment</td>
      </tr>
      <tr role="row" aria-rowindex="2">
        <td role="cell" aria-colindex="1">icon</td>
        <td role="cell" aria-colindex="2">approve</td>
      </tr>
    </tbody>
  `;
  return table;
}

describe('presentationalTable directive', () => {
  it('sets role="presentation" on the table when applied to a table element', () => {
    const table = createTestTable();
    presentationalTable.mounted(table);

    expect(table.getAttribute('role')).toBe('presentation');
  });

  it('removes table aria attributes from the table element', () => {
    const table = createTestTable();
    presentationalTable.mounted(table);

    ['aria-colcount', 'aria-rowcount', 'aria-busy'].forEach((attr) => {
      expect(table.hasAttribute(attr)).toBe(false);
    });
  });

  it('finds the table inside a container and strips its semantics', () => {
    const container = document.createElement('div');
    const table = createTestTable();
    container.appendChild(table);
    presentationalTable.mounted(container);

    expect(table.getAttribute('role')).toBe('presentation');
    expect(table.hasAttribute('aria-colcount')).toBe(false);
  });

  it('sets role="presentation" on rowgroups, rows, cells, and headers', () => {
    const table = createTestTable();
    presentationalTable.mounted(table);

    table.querySelectorAll('[role="rowgroup"], [role="row"], [role="cell"], [role="columnheader"]').forEach((element) => {
      expect(element.getAttribute('role')).toBe('presentation');
    });
  });

  it('removes aria-colindex and aria-rowindex from rows and cells', () => {
    const table = createTestTable();
    presentationalTable.mounted(table);

    table.querySelectorAll('tr, th, td').forEach((element) => {
      expect(element.hasAttribute('aria-colindex')).toBe(false);
      expect(element.hasAttribute('aria-rowindex')).toBe(false);
    });
  });

  it('does nothing when the container has no table', () => {
    const container = document.createElement('div');
    container.appendChild(document.createElement('p'));
    expect(() => presentationalTable.mounted(container)).not.toThrow();

    expect(container.querySelector('p').getAttribute('role')).toBeNull();
  });

  it('re-strips semantics on updated', () => {
    const table = createTestTable();
    presentationalTable.mounted(table);

    // Simulate BTable re-render regenerating attributes (e.g. pagination)
    table.setAttribute('aria-colcount', '2');
    const row = table.querySelector('tbody tr');
    row.setAttribute('aria-rowindex', '1');
    row.setAttribute('role', 'row');
    row.querySelector('td').setAttribute('aria-colindex', '1');

    presentationalTable.updated(table);

    expect(table.hasAttribute('aria-colcount')).toBe(false);
    expect(row.hasAttribute('aria-rowindex')).toBe(false);
    expect(row.getAttribute('role')).toBe('presentation');
    expect(row.querySelector('td').getAttribute('role')).toBe('presentation');
  });

  it('cleans up state on unmounted', () => {
    const table = createTestTable();
    presentationalTable.mounted(table);
    expect(table.__stripTableSemantics).toBeDefined();

    presentationalTable.unmounted(table);
    expect(table.__stripTableSemantics).toBeUndefined();
  });

  it('works end to end through a mounted BTable', async () => {
    const wrapper = mount({
      template: `<BTable
        v-presentational-table
        :items="[{ icon: 'x', activity: 'comment' }]"
        :fields="[{ key: 'icon' }, { key: 'activity' }]"
        thead-class="d-none" />`,
    }, {
      global: {
        plugins: [BootstrapVue],
        directives: { 'presentational-table': presentationalTable },
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    const table = wrapper.find('table').element;
    expect(table.getAttribute('role')).toBe('presentation');
    expect(table.hasAttribute('aria-colcount')).toBe(false);

    wrapper.unmount();
  });
});

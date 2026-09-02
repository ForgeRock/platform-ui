/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * BTable applies table roles and aria-index attributes to its generated markup
 * after any user-supplied attrs, so they cannot be suppressed via props.
 * This directive strips those semantics from the DOM so a layout-only
 * BTable is not announced as a table by assistive technology. Re-strips on
 * `updated` since pagination re-renders regenerate them.
 *
 * Usage: <BTable v-presentational-table ...>
 * In <script setup>, import it as `vPresentationalTable` for auto-registration;
 * in Options API components, register it under `directives` as 'presentational-table'.
 *
 * @warning Only use on layout-only tables. Never apply this to a BTable that
 * represents real tabular data — it would remove semantics that data tables
 * need for accessibility.
 */
export default {
  /**
   * Directive lifecycle hook called when the host element is mounted.
   * Strips the table semantics once and stores the strip function on the
   * container so `updated` can re-apply it after re-renders.
   *
   * @param {HTMLElement} container - The element the directive is bound to (the BTable root).
   */
  mounted(container) {
    /**
     * Marks a single element as presentational and removes its table-index
     * ARIA attributes.
     *
     * @param {HTMLElement} element - Element to strip semantics from.
     */
    const strip = (element) => {
      element.setAttribute('role', 'presentation');
      ['aria-colindex', 'aria-rowindex', 'aria-colcount', 'aria-rowcount', 'aria-busy'].forEach((attr) => element.removeAttribute(attr));
    };

    /**
     * Strips table semantics from the table and all of its row, cell and
     * header descendants. Safe to call repeatedly — re-renders regenerate
     * the attributes that were removed earlier.
     */
    const stripTableSemantics = () => {
      const table = container.tagName === 'TABLE' ? container : container.querySelector('table');
      if (!table) {
        return;
      }
      strip(table);
      table.querySelectorAll('[role="rowgroup"], [role="row"], [role="cell"], [role="columnheader"], [role="rowheader"]').forEach(strip);
    };

    stripTableSemantics();
    container.__stripTableSemantics = stripTableSemantics;
  },
  /**
   * Directive lifecycle hook called after each component update. Pagination
   * and re-rendering regenerate the table roles and aria-index attributes,
   * so the stripping must be re-applied.
   *
   * @param {HTMLElement} container - The element the directive is bound to.
   */
  updated(container) {
    if (container.__stripTableSemantics) {
      container.__stripTableSemantics();
    }
  },
  /**
   * Directive lifecycle hook called when the host element is unmounted.
   * Removes the stored strip function so the container can be garbage collected.
   *
   * @param {HTMLElement} container - The element the directive is bound to.
   */
  unmounted(container) {
    delete container.__stripTableSemantics;
  },
};

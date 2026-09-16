/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getAxe } from '../jest-axe-config';

describe('placeholder-as-name custom axe rule (WCAG 3.3.2)', () => {
  const axe = getAxe();

  async function violations(html) {
    const results = await axe(html);
    return results.violations.filter((v) => v.id === 'placeholder-as-label');
  }

  it('flags an input whose aria-label matches the placeholder (pre-fix pattern)', async () => {
    const hit = await violations(
      '<input id="s1" type="search" placeholder="Search your apps" aria-label="Search your apps">',
    );
    expect(hit).toHaveLength(1);
    expect(hit[0].nodes[0].target[0]).toBe('#s1');
  });

  it('flags an input with a placeholder and no name source at all', async () => {
    const hit = await violations('<input id="s2" type="text" placeholder="Email address">');
    expect(hit).toHaveLength(1);
  });

  it('flags a textarea relying on the placeholder', async () => {
    const hit = await violations('<textarea id="s3" placeholder="Tell us more"></textarea>');
    expect(hit).toHaveLength(1);
  });

  it('flags an aria-label that does not merely echo the placeholder but is derived from it (substring)', async () => {
    const hit = await violations(
      '<input id="s4" type="search" placeholder="Search" aria-label="Search your apps">',
    );
    // Not flagged: aria-label adds information beyond the placeholder
    expect(hit).toHaveLength(0);
  });

  it('passes when a real <label for> exists, even if its text equals the placeholder', async () => {
    const hit = await violations(
      '<label for="p1">Search your apps</label><input id="p1" type="search" placeholder="Search your apps">',
    );
    expect(hit).toHaveLength(0);
  });

  it('passes when a wrapping <label> exists', async () => {
    const hit = await violations(
      '<label>Search site <input type="search" placeholder="Search"></label>',
    );
    expect(hit).toHaveLength(0);
  });

  it('passes when an aria-label differs from the placeholder', async () => {
    const hit = await violations(
      '<input id="p2" type="search" placeholder="Search" aria-label="Search your apps">',
    );
    expect(hit).toHaveLength(0);
  });

  it('passes when aria-labelledby provides the name', async () => {
    const hit = await violations(
      '<span id="lbl1">Email address</span><input id="p3" type="email" placeholder="name@example.com" aria-labelledby="lbl1">',
    );
    expect(hit).toHaveLength(0);
  });

  it('passes when there is no placeholder and no name sources (stock label rule territory)', async () => {
    const hit = await violations('<input id="p4" type="text">');
    expect(hit).toHaveLength(0);
  });

  it('skips disabled and readonly inputs', async () => {
    const hit = await violations(
      '<input id="p5" type="text" disabled placeholder="Search">'
      + '<input id="p6" type="text" readonly placeholder="Search">',
    );
    expect(hit).toHaveLength(0);
  });

  it('ignores non-text inputs (checkbox, hidden, submit)', async () => {
    const hit = await violations(
      '<input id="p7" type="checkbox" placeholder="Search">'
      + '<input id="p8" type="hidden" placeholder="Search">'
      + '<input id="p9" type="submit" placeholder="Search">',
    );
    expect(hit).toHaveLength(0);
  });
});

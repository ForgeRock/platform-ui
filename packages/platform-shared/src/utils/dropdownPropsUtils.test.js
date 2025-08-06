/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';
import getDropdownBoundary from './dropdownPropsUtils';

describe('Dropdown Props Utils', () => {
  it('getDropdownBoundary should return "window" if no input params is passed and enableTableColumnResizing is set to false', () => {
    store.state.SharedStore.enableTableColumnResizing = false;
    const boundary = getDropdownBoundary();
    expect(boundary).toEqual('window');
  });

  it('getDropdownBoundary should return "scrollParent" if no input params is passed and enableTableColumnResizing is set to true', () => {
    store.state.SharedStore.enableTableColumnResizing = true;
    const boundary = getDropdownBoundary();
    expect(boundary).toEqual('scrollParent');
  });

  it('getDropdownBoundary should return "scrollParent" if input params is true and enableTableColumnResizing is set to true', () => {
    store.state.SharedStore.enableTableColumnResizing = true;
    const boundary = getDropdownBoundary(true);
    expect(boundary).toEqual('scrollParent');
  });

  it('getDropdownBoundary should return "window" if input params is false and enableTableColumnResizing is set to true', () => {
    store.state.SharedStore.enableTableColumnResizing = true;
    const boundary = getDropdownBoundary(false);
    expect(boundary).toEqual('window');
  });

  it('getDropdownBoundary should return "window" if input params is false and enableTableColumnResizing is set to false', () => {
    store.state.SharedStore.enableTableColumnResizing = false;
    const boundary = getDropdownBoundary(false);
    expect(boundary).toEqual('window');
  });
});

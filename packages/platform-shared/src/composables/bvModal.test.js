/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import useBvModal from './bvModal';

jest.mock('vue', () => ({
  ...jest.requireActual('vue'),
  getCurrentInstance: jest.fn(() => ({
    ctx: {
      _bv__modal: 'bvModal',
    },
  })),
}));

describe('useBvModal', () => {
  it('expect to be null at first', () => {
    const { bvModal } = useBvModal();
    expect(bvModal.value).toBeNull();
  });
  it('expect to set the value with the instance', async () => {
    const { bvModal } = useBvModal();
    await nextTick();
    expect(bvModal.value).toBe('bvModal');
  });
});

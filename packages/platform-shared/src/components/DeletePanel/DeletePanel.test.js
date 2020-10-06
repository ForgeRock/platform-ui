/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import DeletePanel from './index';

describe('DeletePanel', () => {
  it('DeletePanel successfully loaded', () => {
    const wrapper = shallowMount(DeletePanel, {
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.name()).toEqual('DeletePanel');
  });
});

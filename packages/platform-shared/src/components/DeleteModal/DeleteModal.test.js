/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import DeleteModal from './index';

describe('DeleteModal', () => {
  it('DeleteModal successfully loaded', () => {
    const wrapper = shallowMount(DeleteModal, {
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.name()).toEqual('DeleteModal');
  });
});

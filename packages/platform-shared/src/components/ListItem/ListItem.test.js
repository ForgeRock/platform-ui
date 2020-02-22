/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import ListItem from './index';

describe('ListItem Component', () => {
  it('ListItem successfully loaded', () => {
    const wrapper = shallowMount(ListItem, {
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.name()).toEqual('ListItem');
  });
});

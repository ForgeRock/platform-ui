/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import Alert from './index';

describe('Key Value Component', () => {
  it('Key Value successfully loaded', () => {
    const wrapper = shallowMount(Alert, {
      mocks: {
        $t: () => {},
      },
    });

    expect(wrapper.name()).toEqual('KeyValueList');
  });
});

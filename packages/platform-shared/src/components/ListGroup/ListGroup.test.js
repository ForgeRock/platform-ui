/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import ListGroup from './index';

describe('ListGroup Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ListGroup, {
      mocks: {
        $t: () => {},
      },
    });
  });

  it('ListGroup successfully loaded', () => {
    expect(wrapper.name()).toEqual('ListGroup');
  });
});

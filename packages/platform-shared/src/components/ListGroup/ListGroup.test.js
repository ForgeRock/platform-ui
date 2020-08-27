/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { mount } from '@vue/test-utils';
import ListGroup from './index';

describe('ListGroup Component', () => {
  let wrapper;

  function mountListGroup(extraProps) {
    wrapper = mount(ListGroup, {
      mocks: {
        $t: () => {},
      },
      ...extraProps,
    });
  }

  it('ListGroup successfully loaded', () => {
    mountListGroup();
    expect(wrapper.name()).toEqual('ListGroup');
  });

  it('Adds a bottom margin to the top level card by default', () => {
    mountListGroup();
    expect(wrapper.find('.mb-3').exists()).toBe(true);
  });

  it('Does not add a bottom margin to the top level card when the borderless prop is true', () => {
    mountListGroup({
      propsData: {
        noMargin: true,
      },
    });
    expect(wrapper.find('.mb-3').exists()).toBe(false);
  });
});

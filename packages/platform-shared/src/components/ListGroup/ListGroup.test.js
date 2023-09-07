/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ListGroup from './index';

describe('ListGroup Component', () => {
  let wrapper;

  function mountListGroup(extraProps) {
    wrapper = mount(ListGroup, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
      ...extraProps,
    });
  }

  it('Adds a bottom margin to the top level card by default', () => {
    mountListGroup();
    expect(wrapper.find('.mb-3').exists()).toBe(true);
  });

  it('Does not add a bottom margin to the top level card when the borderless prop is true', () => {
    mountListGroup({
      props: {
        noMargin: true,
      },
    });
    expect(wrapper.find('.mb-3').exists()).toBe(false);
  });
});

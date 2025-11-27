/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import ListGroup from './index';

import { runA11yTest } from '../../utils/testHelpers';

describe('a11y tests', () => {
  function setup(props = {}, slotData = {}) {
    const wrapper = mount(ListGroup, {
      props: {
        ...props,
      },
      slots: slotData,
    });
    return wrapper;
  }

  it('should pass accessibility tests with default props', async () => {
    const wrapper = setup();
    await runA11yTest(wrapper);
  });

  it('should pass accessibility tests with title and subtitle props', async () => {
    const wrapper = setup({ title: 'Test Title', subtitle: 'Test Subtitle' });
    await runA11yTest(wrapper);
  });

  it('should pass accessibility tests with custom slot content', async () => {
    const wrapper = setup({ noMargin: true }, {
      'list-group-header': '<div>Custom Group Header</div>',
    });
    await runA11yTest(wrapper);
  });
});

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

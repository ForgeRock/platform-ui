/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import VisualizationCard from './index';
import { runA11yTest } from '../../../utils/testHelpers';

describe('VisualizationCard', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render the component', () => {
    wrapper = mount(VisualizationCard);
    expect(wrapper.exists()).toBe(true);
  });

  it('should display title when provided', () => {
    const title = 'Test Visualization';
    wrapper = mount(VisualizationCard, {
      props: { title },
    });
    expect(wrapper.text()).toContain(title);
  });

  describe('@a11y', () => {
    it('should have no accessibility violations', async () => {
      wrapper = mount(VisualizationCard, {
        props: {
          title: 'Accessible Visualization',
        },
      });
      await runA11yTest(wrapper);
    });

    it('should have no accessibility violations when loading state is true', async () => {
      wrapper = mount(VisualizationCard, {
        props: {
          title: 'Accessible Visualization',
          loading: true,
        },
      });
      await runA11yTest(wrapper);
    });
  });
});

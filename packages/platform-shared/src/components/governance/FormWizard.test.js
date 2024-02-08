/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import FormWizard from './FormWizard';

describe('FormWizard', () => {
  let wrapper;
  function mountComponent(props) {
    return mount(FormWizard, {
      global: {
        plugins: [
          i18n,
          createTestingPinia(),
        ],
      },
      props: {
        ...props,
      },
    });
  }

  it('has a breadcrumb with the prop title and route', async () => {
    wrapper = mountComponent({
      breadcrumbTitle: 'test',
      breadcrumbPath: '/test/1',
    });

    await flushPromises();

    const breadcrumb = wrapper.find('routerlink');
    expect(breadcrumb.text()).toBe('arrow_backtest');
    expect(breadcrumb.attributes('to')).toBe('/test/1');
  });

  it('displays the title', () => {
    wrapper = mountComponent({
      title: 'test title',
    });

    const title = findByTestId(wrapper, 'wizard-title');
    expect(title.text()).toBe('test title');
  });

  it('shows tabs based on prop', async () => {
    wrapper = mountComponent({
      tabs: [
        {
          title: 'tab1',
          component: 'component1',
        },
        {
          title: 'tab2',
          component: 'component2',
        },
      ],
    });

    expect(findByTestId(wrapper, 'tab1').exists()).toBeTruthy();
    expect(findByTestId(wrapper, 'tab2').exists()).toBeTruthy();
  });

  it('clicking next advances the tab', () => {
    wrapper = mountComponent({
      tabs: [
        {
          title: 'tab1',
          component: 'component1',
        },
        {
          title: 'tab2',
          component: 'component2',
        },
      ],
    });

    const changeStepSpy = jest.spyOn(wrapper.vm, 'changeStep');

    const next = findByTestId(wrapper, 'nextButton');
    next.trigger('click');

    expect(changeStepSpy).toHaveBeenCalled();
    expect(wrapper.vm.currentStep).toBe(1);
  });

  it('clicking next on the final step emits save event', () => {
    wrapper = mountComponent({
      tabs: [
        {
          title: 'tab1',
          component: 'component1',
        },
      ],
    });

    const changeStepSpy = jest.spyOn(wrapper.vm, 'changeStep');

    const next = findByTestId(wrapper, 'nextButton');
    next.trigger('click');

    expect(changeStepSpy).toHaveBeenCalled();
    expect(wrapper.emitted().save).toBeTruthy();
  });
});

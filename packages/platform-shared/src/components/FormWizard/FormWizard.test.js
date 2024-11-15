/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { findByTestId } from '@/utils/testHelpers';
import i18n from '@/i18n';
import FormWizard from './FormWizard';

describe('FormWizard', () => {
  function mountComponent(props) {
    return mount(FormWizard, {
      global: {
        plugins: [
          i18n,
          createTestingPinia(),
        ],
      },
      props: {
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
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('has a breadcrumb with the prop title and route', async () => {
      const wrapper = mountComponent({
        breadcrumbTitle: 'test',
        breadcrumbPath: '/test/1',
      });
      await flushPromises();

      const breadcrumb = wrapper.find('routerlink');
      expect(breadcrumb.text()).toBe('arrow_backtest');
      expect(breadcrumb.attributes('to')).toBe('/test/1');
    });

    it('displays the title', async () => {
      const wrapper = mountComponent({
        title: 'test title',
      });
      await flushPromises();

      const title = findByTestId(wrapper, 'wizard-title');
      expect(title.text()).toBe('test title');
    });

    it('shows tabs based on prop', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      expect(findByTestId(wrapper, 'tab1').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'tab2').exists()).toBeTruthy();
    });

    it('displays progress dots', async () => {
      let wrapper = mountComponent({
        tabs: [
          {
            title: 'tab1',
            component: 'component1',
          },
        ],
        progressDots: true,
      });
      await flushPromises();

      let dots = findByTestId(wrapper, 'progress-dots');
      expect(dots.isVisible()).toBeTruthy();

      wrapper = mountComponent({
        tabs: [
          {
            title: 'tab1',
            component: 'component1',
          },
        ],
        progressDots: false,
      });
      await flushPromises();

      dots = findByTestId(wrapper, 'progress-dots');
      expect(dots.exists()).toBeFalsy();
    });

    it('displays save button on final tab', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      let nextBtn = findByTestId(wrapper, 'nextButton');
      let saveBtn = findByTestId(wrapper, 'saveButton');

      expect(saveBtn.exists()).toBeFalsy();

      await nextBtn.trigger('click');
      await wrapper.vm.$nextTick();

      nextBtn = findByTestId(wrapper, 'nextButton');
      saveBtn = findByTestId(wrapper, 'saveButton');

      expect(nextBtn.exists()).toBeFalsy();
      expect(saveBtn.isVisible()).toBeTruthy();
    });

    it('displays save button in if showSaveButtonOnEdit is true', async () => {
      const wrapper = mountComponent({
        edit: true,
        showSaveButtonOnEdit: true,
      });
      await flushPromises();

      const nextBtn = findByTestId(wrapper, 'nextButton');
      const saveBtn = findByTestId(wrapper, 'saveButton');

      expect(nextBtn.exists()).toBeFalsy();
      expect(saveBtn.isVisible()).toBeTruthy();
    });
  });

  describe('@actions', () => {
    it('clicking next advances the tab', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const changeStepSpy = jest.spyOn(wrapper.vm, 'changeStep');

      const next = findByTestId(wrapper, 'nextButton');
      await next.trigger('click');

      expect(changeStepSpy).toHaveBeenCalled();
      expect(wrapper.vm.currentStep).toBe(1);
    });

    it('clicking save on the final step emits save event', async () => {
      const wrapper = mountComponent({
        tabs: [
          {
            title: 'tab1',
            component: 'component1',
          },
        ],
      });
      await flushPromises();

      expect(wrapper.emitted().save).toBeFalsy();

      const save = findByTestId(wrapper, 'saveButton');
      await save.trigger('click');

      expect(wrapper.emitted().save).toBeTruthy();
    });
  });
});

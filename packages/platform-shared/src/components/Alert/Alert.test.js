/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import Alert from './index';

describe('Alert Component', () => {
  let wrapper;

  it('Alert successfully loaded', () => {
    wrapper = shallowMount(Alert);
    expect(wrapper.name()).toEqual('Alert');
  });

  it('Will show alert text passed in through slot', () => {
    wrapper = shallowMount(Alert, {
      slots: {
        default: 'Hello',
      },
    });
    expect(wrapper.text().includes('Hello'));
  });

  it('primary variant is the default variant', () => {
    wrapper = shallowMount(Alert);
    expect(wrapper.vm.variant).toBe('primary');
    expect(wrapper.find('.material-icons-outlined').text()).toBe('info');
  });

  it('warning variant will have a warning icon', () => {
    wrapper = shallowMount(Alert, {
      propsData: {
        variant: 'warning',
      },
    });
    expect(wrapper.find('.material-icons-outlined').text()).toBe('warning');
  });
});

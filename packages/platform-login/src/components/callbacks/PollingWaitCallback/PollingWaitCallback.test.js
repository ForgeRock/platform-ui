/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import PollingWaitCallback from '@/components/callbacks/PollingWaitCallback';
import i18n from '@/i18n';

jest.useFakeTimers();

describe('PollingWaitCallback', () => {
  let wrapper;
  const defaultProps = {
    callback: {
      getMessage: () => 'Message',
      getWaitTime: () => 1000,
    },
  };
  function setup(props) {
    return mount(PollingWaitCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  it('Sets interval and message data', () => {
    const setTimeoutSpy = jest.spyOn(window, 'setTimeout');
    wrapper = setup();
    expect(wrapper.vm.$data.message).toEqual('Message');
    expect(wrapper.vm.$data.timeout).toBeDefined();
    expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  });

  it('Emits next-step', () => {
    wrapper = setup();
    jest.runAllTimers();
    expect(wrapper.emitted()['next-step'].pop()).toEqual([null, true]);
  });

  it('Renders message and spinner by default', () => {
    wrapper = setup();
    const spinner = findByRole(wrapper, 'status');
    expect(spinner.exists()).toBeTruthy();
    expect(wrapper.text()).toContain('Message');
  });

  it('Renders message and spinner when hideSpinnerAndMessage is set to false', () => {
    const propsData = {
      callback: {
        getMessage: () => 'Message',
        getWaitTime: () => 1000,
      },
      hideSpinnerAndMessage: false,
    };
    wrapper = setup(propsData);
    const spinner = findByRole(wrapper, 'status');
    expect(spinner.exists()).toBeTruthy();
    expect(wrapper.text()).toContain('Message');
  });

  it('Does not render message or spinner when hideSpinnerAndMessage is set to true', () => {
    const propsData = {
      callback: {
        getMessage: () => 'Message',
        getWaitTime: () => 1000,
      },
      hideSpinnerAndMessage: true,
    };
    wrapper = setup(propsData);
    const spinner = findByRole(wrapper, 'status');
    expect(spinner.exists()).toBeFalsy();
    expect(wrapper.text()).not.toContain('Message');
  });
});

/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import PollingWaitCallback from '@/components/callbacks/PollingWaitCallback';
import i18n from '@/i18n';

jest.useFakeTimers();

describe('PollingWaitCallback', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(PollingWaitCallback, {
      i18n,
      propsData: {
        callback: {
          getMessage: () => 'Message',
          getWaitTime: () => 1000,
        },
      },
    });
  });

  it('Load PollingWaitCallback component', () => {
    expect(wrapper.name()).toEqual('PollingWaitCallback');
  });

  it('Sets interval and message data', () => {
    expect(wrapper.vm.$data.message).toEqual('Message');
    expect(wrapper.vm.$data.timeout).toBeDefined();
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  });

  it('Emits next-step', () => {
    jest.runAllTimers();
    expect(wrapper.emitted()['next-step'].pop()).toEqual([null, true]);
  });
});

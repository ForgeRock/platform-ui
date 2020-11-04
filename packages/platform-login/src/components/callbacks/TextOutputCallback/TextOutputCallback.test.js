/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import TextOutputCallback from '@/components/callbacks/TextOutputCallback';
import i18n from '@/i18n';

describe('TextOutputCallback.vue', () => {
  let wrapper;

  const mountComponent = ({ messageType } = {}) => {
    const propsData = {
      callback: {
        getMessageType: () => messageType || 4,
        getMessage: jest.fn(),
      },
      index: 5,
    };
    wrapper = mount(TextOutputCallback, {
      i18n,
      propsData,
    });
  };

  beforeEach(() => {
    wrapper = undefined;
  });

  it('Load TextOutputCallback component', () => {
    mountComponent({ messageType: '1' });
    expect(wrapper.name()).toEqual('TextOutputCallback');
  });

  it('Mounts QRCodeReader on window', () => {
    mountComponent({ messageType: '1' });
    expect(window.QRCodeReader).toBeDefined();
    expect(window.QRCodeReader.createCode).toBeDefined();
  });

  it('Sets data messageType base on getMessageType', () => {
    mountComponent({ messageType: '1' });
    expect(wrapper.vm.$data.messageType).toBe('WARNING');

    mountComponent({ messageType: '2' });
    expect(wrapper.vm.$data.messageType).toBe('ERROR');

    mountComponent({ messageType: '3' });
    expect(wrapper.vm.$data.messageType).toBe('INFORMATION');

    mountComponent({ messageType: '4' });
    expect(wrapper.vm.$data.messageType).toBe('SCRIPT');
  });

  it('It handles scripts by emit event and appending', async () => {
    mountComponent({ messageType: '4' });
    wrapper.vm.$refs.textOutputPanel.appendChild = jest.fn();

    expect(wrapper.emitted()['has-scripts'].pop()).toEqual([]);

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.$refs.textOutputPanel.appendChild).toHaveBeenCalledWith(expect.any(Element));
  });
});

/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import TimezoneOffset from './index';
import { createAppContainer, runA11yTest } from '../../utils/testHelpers';

let wrapper;
function setupMount(props) {
  wrapper = mount(TimezoneOffset, {
    attachTo: createAppContainer(),
    props: {
      ...props,
      placeholder: 'timezone.placeholder',
    },
    global: {
      mocks: {
        $t(val) { return val; },
      },
      renderStubDefaultSlot: true,
    },
  });

  const domWrapper = new DOMWrapper(document.body);
  return { domWrapper };
}

async function openPopover(wrapperInstance) {
  wrapperInstance.vm.popoverShow = true;
  await flushPromises();
}

describe('TimezoneOffset Component', () => {
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }

    document.body.innerHTML = '';
  });

  const originalGetBoundingClientRect = global.Element.prototype.getBoundingClientRect;
  beforeAll(() => {
    // Mocking the size of elements so Popper.js doesn't bail out
    // as it thinks there's no space to render the popover
    global.Element.prototype.getBoundingClientRect = () => ({
      width: 100,
      height: 30,
      top: 0,
      left: 0,
      right: 100,
      bottom: 30,
    });
  });

  afterAll(() => {
    // Restore the original getBoundingClientRect function
    global.Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('display value is user friendly string', async () => {
    const { domWrapper } = await setupMount({ value: -7 });
    await flushPromises();
    await openPopover(wrapper);
    await flushPromises();
    expect(domWrapper.find('output').text()).toBe('GMT - 7:00');
  });

  it('contains link to timezone offset explanation', async () => {
    await setupMount();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'BLink' }).text()).toBe('timezone.linkText');
    expect(wrapper.findComponent({ name: 'BLink' }).attributes('href')).toBe('https://www.timeanddate.com/time/zones/');
  });

  it('should have no a11y violations in default state', async () => {
    await setupMount();
    await flushPromises();
    await runA11yTest(wrapper);
  });

  it('should have no a11y violations when popover is open', async () => {
    await setupMount();
    await flushPromises();
    wrapper.vm.popoverShow = true;
    await flushPromises();
    await runA11yTest(wrapper);
  });
});

/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import { createTooltipContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import AccessToolbar from './AccessToolbar';
import i18n from '@/i18n';

describe('AccessToolbar', () => {
  let wrapper;
  beforeEach(async () => {
    wrapper = mount(AccessToolbar, {
      attachTo: createTooltipContainer(['btnFullscreen']),
      global: {
        plugins: [i18n],
        mocks: {
          getConfig: jest.spyOn(configApi, 'getConfig').mockImplementation(() => Promise.resolve(
            {
              data: {},
            },
          ), () => Promise.reject()),
        },
      },
      props: {
        selectedTypes: {
          roleMembership: true,
          accountGrant: true,
          entitlementGrant: true,
        },
      },
    });
  });

  it('zoom in should emit to zoom view in', async () => {
    await flushPromises();

    const zoomIn = wrapper.find('button[aria-label="Zoom In"]');
    zoomIn.trigger('click');
    expect(wrapper.emitted('zoom')[0][0]).toEqual(90);
  });

  it('zoom out should emit to zoom view out', async () => {
    await flushPromises();

    const zoomOut = wrapper.find('button[aria-label="Zoom Out"]');
    zoomOut.trigger('click');
    expect(wrapper.emitted('zoom')[0][0]).toEqual(70);
  });

  it('zoom in should disable zoom in button when 150 zoom value is reached', async () => {
    await flushPromises();

    const zoomIn = wrapper.find('button[aria-label="Zoom In"]');
    expect(zoomIn.attributes('disabled')).toBeUndefined();
    zoomIn.trigger('click');
    zoomIn.trigger('click');
    zoomIn.trigger('click');
    zoomIn.trigger('click');
    zoomIn.trigger('click');
    zoomIn.trigger('click');
    zoomIn.trigger('click');
    await flushPromises();
    expect(zoomIn.attributes('disabled')).toBeDefined();
    const zoomOut = wrapper.find('button[aria-label="Zoom Out"]');
    zoomOut.trigger('click');
    await flushPromises();
    expect(zoomIn.attributes('disabled')).toBeUndefined();
  });

  it('zoom out should disable zoom out button when 50 zoom value is reached', async () => {
    await flushPromises();

    const zoomOut = wrapper.find('button[aria-label="Zoom Out"]');
    expect(zoomOut.attributes('disabled')).toBeUndefined();
    zoomOut.trigger('click');
    zoomOut.trigger('click');
    zoomOut.trigger('click');
    await flushPromises();
    expect(zoomOut.attributes('disabled')).toBeDefined();
    const zoomIn = wrapper.find('button[aria-label="Zoom In"]');
    zoomIn.trigger('click');
    await flushPromises();
    expect(zoomOut.attributes('disabled')).toBeUndefined();
  });

  it('emits toggle type when checkbox clicked', async () => {
    await flushPromises();

    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    await checkboxes[0].setChecked(false);
    expect(wrapper.emitted('toggle-selected-type')[0][0]).toEqual('roleMembership');
  });
});

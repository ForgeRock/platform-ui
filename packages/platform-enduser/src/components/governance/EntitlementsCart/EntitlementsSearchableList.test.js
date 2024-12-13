/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import EntitlementsSearchableList from './EntitlementsSearchableList';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

describe('EntitlementsSearchableList', () => {
  function setup(props) {
    return mount(EntitlementsSearchableList, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  }

  it('should search for entitlements by name', async () => {
    const wrapper = setup({
      entitlements: [
        {
          name: 'testName',
          description: 'testDescription',
          appName: 'testAppName',
          app: 'testApp',
          compositeId: 'testCompositeId',
        },
        {
          name: 'testName2',
          description: 'testDescription2',
          appName: 'testAppName2',
          app: 'testApp2',
          compositeId: 'testCompositeId2',
        },
      ],
    });

    const searchInput = wrapper.find('input');
    await searchInput.setValue('testName2');

    const listItems = wrapper.findAll('.list-group-item');
    expect(listItems.length).toBe(1);
    expect(listItems[0].find('h3').text()).toBe('testName2');
  });

  it('should search for entitlements by description', async () => {
    const wrapper = setup({
      entitlements: [
        {
          name: 'testName',
          description: 'testDescription',
          appName: 'testAppName',
          app: 'testApp',
          compositeId: 'testCompositeId',
        },
        {
          name: 'testName2',
          description: 'testDescription2',
          appName: 'testAppName2',
          app: 'testApp2',
          compositeId: 'testCompositeId2',
        },
      ],
    });

    const searchInput = wrapper.find('input');
    await searchInput.setValue('testDescription2');

    const listItems = wrapper.findAll('.list-group-item');
    expect(listItems.length).toBe(1);
    expect(listItems[0].find('h3').text()).toBe('testName2');
  });

  it('should search for entitlements by appName', async () => {
    const wrapper = setup({
      entitlements: [
        {
          name: 'testName',
          description: 'testDescription',
          appName: 'testAppName',
          app: 'testApp',
          compositeId: 'testCompositeId',
        },
        {
          name: 'testName2',
          description: 'testDescription2',
          appName: 'testAppName2',
          app: 'testApp2',
          compositeId: 'testCompositeId2',
        },
      ],
    });

    const searchInput = wrapper.find('input');
    await searchInput.setValue('testAppName2');

    const listItems = wrapper.findAll('.list-group-item');
    expect(listItems.length).toBe(1);
    expect(listItems[0].find('h3').text()).toBe('testName2');
  });

  it('should add all entitlements to cart', async () => {
    const wrapper = setup({
      entitlements: [
        {
          name: 'testName',
          description: 'testDescription',
          appName: 'testAppName',
          app: 'testApp',
          compositeId: 'testCompositeId',
        },
        {
          name: 'testName2',
          description: 'testDescription2',
          appName: 'testAppName2',
          app: 'testApp2',
          compositeId: 'testCompositeId2',
        },
      ],
    });

    const addAllButton = wrapper.find('button');
    await addAllButton.trigger('click');

    expect(wrapper.emitted('add-all')).toBeTruthy();
    expect(wrapper.emitted('add-all')[0][0]).toEqual([{
      name: 'testName',
      description: 'testDescription',
      appName: 'testAppName',
      app: 'testApp',
      compositeId: 'testCompositeId',
    },
    {
      name: 'testName2',
      description: 'testDescription2',
      appName: 'testAppName2',
      app: 'testApp2',
      compositeId: 'testCompositeId2',
    },
    ]);
  });

  it('should show added text instead add all button when added property is true', () => {
    const wrapper = setup({
      entitlements: [
        {
          name: 'testName',
          description: 'testDescription',
          appName: 'testAppName',
          app: 'testApp',
          compositeId: 'testCompositeId',
          added: true,
        },
        {
          name: 'testName2',
          description: 'testDescription2',
          appName: 'testAppName2',
          app: 'testApp2',
          compositeId: 'testCompositeId2',
          added: true,
        },
      ],
      added: true,
    });

    const addedText = wrapper.find('span').text();
    expect(addedText).toBe('checkAdded');

    const addAllButton = wrapper.find('button');
    expect(addAllButton.exists()).toBe(false);
  });
});

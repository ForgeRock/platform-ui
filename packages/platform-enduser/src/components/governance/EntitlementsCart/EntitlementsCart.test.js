/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import EntitlementsCart from './EntitlementsCart';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

describe('EntitlementsCart', () => {
  function setup(props) {
    return mount(EntitlementsCart, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  }

  it('should show the default message when no entitlements are passed', () => {
    const wrapper = setup();

    const emptyTitle = wrapper.find('h3').text();
    expect(emptyTitle).toBe('No entitlements selected yet');
    const emptyDescription = wrapper.find('p').text();
    expect(emptyDescription).toBe('Add entitlements to revoke');
  });

  it('should load correctly entitlements list length less than 3', () => {
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

    const listItems = wrapper.findAll('.list-group-item');
    expect(listItems.length).toBe(2);

    const listItem1 = listItems[0];
    const name = listItem1.find('h3').text();
    expect(name).toBe('testName');
    const appName = listItem1.find('h4').text();
    expect(appName).toBe('testAppName');
    const description = listItem1.find('small').text();
    expect(description).toBe('testDescription');
    const image = listItem1.find('img').attributes('alt');
    expect(image).toBe('Application Logo - testApp');

    const listItem2 = listItems[1];
    const name2 = listItem2.find('h3').text();
    expect(name2).toBe('testName2');
    const appName2 = listItem2.find('h4').text();
    expect(appName2).toBe('testAppName2');
    const description2 = listItem2.find('small').text();
    expect(description2).toBe('testDescription2');
    const image2 = listItem2.find('img').attributes('alt');
    expect(image2).toBe('Application Logo - testApp2');
  });

  it('should not show the view more button if entitlements list length is less than 3', () => {
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

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(0);
    const collapseStyles = wrapper.find('.collapse').attributes('style');
    expect(collapseStyles).toBe('display: none;');
  });

  it('should show the view more button if entitlements list length is greater than 3', () => {
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
        {
          name: 'testName3',
          description: 'testDescription3',
          appName: 'testAppName3',
          app: 'testApp3',
          compositeId: 'testCompositeId3',
        },
        {
          name: 'testName4',
          description: 'testDescription4',
          appName: 'testAppName4',
          app: 'testApp4',
          compositeId: 'testCompositeId4',
        },
      ],
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(1);
    const showMoreButton = buttons[0];
    expect(showMoreButton.text()).toBe('View 1 more');
  });

  it('the panel should be collapsed and only show 3 items if entitlements list length is greater than 3, ', () => {
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
        {
          name: 'testName3',
          description: 'testDescription3',
          appName: 'testAppName3',
          app: 'testApp3',
          compositeId: 'testCompositeId3',
        },
        {
          name: 'testName4',
          description: 'testDescription4',
          appName: 'testAppName4',
          app: 'testApp4',
          compositeId: 'testCompositeId4',
        },
      ],
    });

    const collapseStyles = wrapper.find('.collapse').attributes('style');
    expect(collapseStyles).toBe('display: none;');

    const lists = wrapper.findAll('.list-group');
    const itemsShown = lists[0].findAll('.list-group-item');
    expect(itemsShown.length).toBe(3);
  });

  it('should show the rest of the entitlements when the view more button is clicked', async () => {
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
        {
          name: 'testName3',
          description: 'testDescription3',
          appName: 'testAppName3',
          app: 'testApp3',
          compositeId: 'testCompositeId3',
        },
        {
          name: 'testName4',
          description: 'testDescription4',
          appName: 'testAppName4',
          app: 'testApp4',
          compositeId: 'testCompositeId4',
        },
      ],
    });

    const buttons = wrapper.findAll('button');
    const showMoreButton = buttons[0];

    showMoreButton.trigger('click');

    await wrapper.vm.$nextTick();

    const collapseStyles = wrapper.find('.collapse').attributes('style');
    expect(collapseStyles).toBe('');

    const lists = wrapper.findAll('.list-group');
    const itemsShown = lists[1].findAll('.list-group-item');
    expect(itemsShown.length).toBe(1);

    const listItem1 = itemsShown[0];
    const name = listItem1.find('h3').text();
    expect(name).toBe('testName4');
    const appName = listItem1.find('h4').text();
    expect(appName).toBe('testAppName4');
    const description = listItem1.find('small').text();
    expect(description).toBe('testDescription4');
    const image = listItem1.find('img').attributes('alt');
    expect(image).toBe('Application Logo - testApp4');
  });

  it('should show the view less button if panel is not collapsed', async () => {
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
        {
          name: 'testName3',
          description: 'testDescription3',
          appName: 'testAppName3',
          app: 'testApp3',
          compositeId: 'testCompositeId3',
        },
        {
          name: 'testName4',
          description: 'testDescription4',
          appName: 'testAppName4',
          app: 'testApp4',
          compositeId: 'testCompositeId4',
        },
      ],
    });

    wrapper.vm.showMore = true;

    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(1);
    const showLessButton = buttons[0];
    expect(showLessButton.text()).toBe('View less');
  });

  it('should collapse the panel when the view less button is clicked', async () => {
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
        {
          name: 'testName3',
          description: 'testDescription3',
          appName: 'testAppName3',
          app: 'testApp3',
          compositeId: 'testCompositeId3',
        },
        {
          name: 'testName4',
          description: 'testDescription4',
          appName: 'testAppName4',
          app: 'testApp4',
          compositeId: 'testCompositeId4',
        },
      ],
    });

    wrapper.vm.showMore = true;

    await wrapper.vm.$nextTick();

    let buttons = wrapper.findAll('button');
    const viewLessButton = buttons[0];

    viewLessButton.trigger('click');

    await wrapper.vm.$nextTick();

    const collapseStyles = wrapper.find('.collapse').attributes('style');
    expect(collapseStyles).toBe('display: none;');

    buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(1);
    const viewMoreButton = buttons[0];
    expect(viewMoreButton.text()).toBe('View 1 more');
  });

  it('should split correctly the entitlements array', async () => {
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
        {
          name: 'testName3',
          description: 'testDescription3',
          appName: 'testAppName3',
          app: 'testApp3',
          compositeId: 'testCompositeId3',
        },
        {
          name: 'testName4',
          description: 'testDescription4',
          appName: 'testAppName4',
          app: 'testApp4',
          compositeId: 'testCompositeId4',
        },
      ],
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.vm.firstEntitlements).toEqual([
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
      {
        name: 'testName3',
        description: 'testDescription3',
        appName: 'testAppName3',
        app: 'testApp3',
        compositeId: 'testCompositeId3',
      },
    ]);
    expect(wrapper.vm.restOfEntitlements).toEqual([
      {
        name: 'testName4',
        description: 'testDescription4',
        appName: 'testAppName4',
        app: 'testApp4',
        compositeId: 'testCompositeId4',
      },
    ]);
  });
});

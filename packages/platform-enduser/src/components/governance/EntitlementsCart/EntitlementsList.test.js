/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import EntitlementsList from './EntitlementsList';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

describe('EntitlementsList', () => {
  function setup(props) {
    return mount(EntitlementsList, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  }

  it('should render correctly the entitlements in the list', () => {
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
});

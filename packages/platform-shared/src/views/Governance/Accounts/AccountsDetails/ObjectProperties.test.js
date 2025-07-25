/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import ObjectProperties from './ObjectProperties';

async function mountComponent() {
  const wrapper = mount(ObjectProperties, {
    global: {
      mocks: {
        $t: (string) => string,
      },
    },
    props: {
      objectProperties: {
        displayName: 'Alyson Skelly',
        givenName: 'Alyson',
        accountEnabled: true,
        cn: null,
        proxyAddresses: [
          'SMTP:Alyson@IGATestQA.onmicrosoft.com',
        ],
      },
    },
  });
  await flushPromises();
  return wrapper;
}

describe('ObjectProperties Component', () => {
  it('loads list with 4 rows', async () => {
    const wrapper = await mountComponent();

    const propertyOne = wrapper.find('div[name="property-displayName"]');
    expect(propertyOne.exists()).toBe(true);

    const propertyTwo = wrapper.find('div[name="property-givenName"]');
    expect(propertyTwo.exists()).toBe(true);

    const propertyThree = wrapper.find('div[name="property-accountEnabled"]');
    expect(propertyThree.exists()).toBe(true);

    const propertyFour = wrapper.find('div[name="property-cn"]');
    expect(propertyFour.exists()).toBe(true);

    const propertyFive = wrapper.find('div[name="property-proxyAddresses"]');
    expect(propertyFive.exists()).toBe(true);
  });

  it('rows contain correct data', async () => {
    const wrapper = await mountComponent();

    const propertyOne = wrapper.find('div[name="property-displayName"]');
    expect(propertyOne.exists()).toBe(true);
    const propertyOneName = propertyOne.find('div.col-sm-4');
    expect(propertyOneName.text()).toBe('displayName');
    const propertyOneDetail = propertyOne.find('div.col-sm-8');
    expect(propertyOneDetail.text()).toBe('Alyson Skelly');
  });

  it('uses -- if rawData property value is null', async () => {
    const wrapper = await mountComponent();

    const propertyFour = wrapper.find('div[name="property-cn"]');
    expect(propertyFour.exists()).toBe(true);
    const propertyFourName = propertyFour.find('div.col-sm-4');
    expect(propertyFourName.text()).toBe('cn');
    const propertyFourDetail = propertyFour.find('div.col-sm-8');
    expect(propertyFourDetail.text()).toBe('--');
  });
});

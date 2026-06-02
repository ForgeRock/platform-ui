/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import ObjectProperties from './ObjectProperties';

async function mountComponent(additionalProps = {}) {
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
      ...additionalProps,
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

  it('uses schema display name when provided', async () => {
    const wrapper = await mountComponent({
      schema: { displayName: 'Display Name', givenName: 'Given Name' },
    });

    const propertyOne = wrapper.find('div[name="property-displayName"]');
    const propertyOneName = propertyOne.find('div.col-sm-4');
    expect(propertyOneName.text()).toBe('Display Name');

    const propertyTwo = wrapper.find('div[name="property-givenName"]');
    const propertyTwoName = propertyTwo.find('div.col-sm-4');
    expect(propertyTwoName.text()).toBe('Given Name');
  });

  it('falls back to key when schema has no entry', async () => {
    const wrapper = await mountComponent({
      schema: { displayName: 'Display Name' },
    });

    const propertyTwo = wrapper.find('div[name="property-givenName"]');
    const propertyTwoName = propertyTwo.find('div.col-sm-4');
    expect(propertyTwoName.text()).toBe('givenName');
  });

  it('sorts properties alphabetically by resolved display name', async () => {
    const wrapper = await mountComponent({
      schema: {
        displayName: 'ZZZ Name',
        givenName: 'AAA Name',
      },
    });

    // givenName -> 'AAA Name', accountEnabled -> 'accountEnabled', cn -> 'cn', proxyAddresses -> 'proxyAddresses', displayName -> 'ZZZ Name'
    const rows = wrapper.findAll('.row[name^="property-"]');
    expect(rows[0].attributes('name')).toBe('property-givenName');
    expect(rows[rows.length - 1].attributes('name')).toBe('property-displayName');
  });

  it('collapse works when enabled', async () => {
    const wrapper = await mountComponent({ enableCollapse: true });
    const cards = wrapper.findAll('.card-body');
    const visibleCollapse = cards[0].find('.collapse.show');
    expect(visibleCollapse.exists()).toBe(true);

    await wrapper.setProps({ isCollapsed: true });
    await wrapper.vm.$nextTick();

    const visibleAfterCollapse = cards[0].find('.collapse.show');
    expect(visibleAfterCollapse.exists()).toBe(false);
  });
});

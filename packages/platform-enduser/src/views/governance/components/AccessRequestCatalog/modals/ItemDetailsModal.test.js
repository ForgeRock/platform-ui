/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { BModal, BButton } from 'bootstrap-vue';
import ItemDetailsModal from './ItemDetailsModal';
import i18n from '@/i18n';

describe('ItemDetailsModal', () => {
  let wrapper;

  const propsData = {
    glossarySchema: [
      {
        displayName: 'Role Owner',
        id: 'test-id-1',
        name: 'roleOwner',
      },
      {
        displayName: 'Risk Level',
        id: 'test-id-2',
        name: 'riskLevel',
      },
    ],
    item: {
      description: 'This is a static role.',
      id: 'role-id',
      name: 'Role-Static',
      requested: false,
      glossary: {
        requestable: true,
        riskLevel: 'medium',
        roleOwner: 'managed/user/user-id',
      },
    },
    itemType: 'role',
    visible: true,
  };

  function setup(props) {
    return mount(ItemDetailsModal, {
      global: {
        plugins: [i18n],
        components: {
          BModal, BButton,
        },
      },
      props: {
        ...propsData,
        ...props,
      },
    });
  }

  it('renders item details correctly', async () => {
    wrapper = setup();
    await wrapper.vm.$nextTick();

    // Assert modal title
    const title = findByTestId(wrapper, 'modal-title');
    expect(title.text()).toBe('Request Role Access');

    // Assert item name and description
    expect(findByTestId(wrapper, 'item-name').text()).toBe(propsData.item.name);
    expect(findByTestId(wrapper, 'description').text()).toBe(propsData.item.description);

    // Assert glossary fields
    const { glossarySchema, item } = propsData;

    expect(findByTestId(wrapper, `glossary-title${glossarySchema[0].id}`).text()).toBe(glossarySchema[0].displayName);
    expect(findByTestId(wrapper, `glossary-title${glossarySchema[1].id}`).text()).toBe(glossarySchema[1].displayName);
    expect(findByTestId(wrapper, `glossary-item${glossarySchema[0].id}`).text()).toBe('--');
    expect(findByTestId(wrapper, `glossary-item${glossarySchema[1].id}`).text()).toBe(item.glossary[glossarySchema[1].name]);
  });

  it('emits the correct event on OK button click', async () => {
    wrapper = setup();
    await wrapper.vm.$nextTick();
    await wrapper.setProps({ visible: true });

    // Trigger OK button click
    await wrapper.find('.modal-footer button.btn-primary').trigger('click');
    await wrapper.vm.$nextTick();

    // Assert that the correct event is emitted
    expect(wrapper.emitted()).toHaveProperty('toggle-item');
    expect(wrapper.emitted()['toggle-item']).toHaveLength(1);
    expect(wrapper.emitted()['toggle-item'][0]).toEqual([propsData.item]);
  });
});

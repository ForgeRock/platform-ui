/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as RequestFormAssignmentsApi from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import * as RequestFormsApi from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import { BModal, BButton } from 'bootstrap-vue';
import ItemDetailsModal from './ItemDetailsModal';
import i18n from '@/i18n';

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

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
    isTesting: true,
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
    await flushPromises();

    // Assert modal title
    const title = findByTestId(wrapper, 'modal-title');
    expect(title.text()).toBe('Request Role Access');

    // Assert item name and description
    expect(findByTestId(wrapper, 'item-name').text()).toBe(propsData.item.name);
    expect(findByTestId(wrapper, 'description').text()).toBe(propsData.item.description);

    // Assert glossary fields
    const { glossarySchema, item } = propsData;

    expect(findByTestId(wrapper, `glossary-title-${glossarySchema[0].name}`).text()).toBe(glossarySchema[0].displayName);
    expect(findByTestId(wrapper, `glossary-title-${glossarySchema[1].name}`).text()).toBe(glossarySchema[1].displayName);
    expect(findByTestId(wrapper, `glossary-item-${glossarySchema[0].name}`).text()).toBe(item.glossary[glossarySchema[0].name]);
    expect(findByTestId(wrapper, `glossary-item-${glossarySchema[1].name}`).text()).toBe(item.glossary[glossarySchema[1].name]);
  });

  it('emits the correct event on OK button click', async () => {
    wrapper = setup();
    await flushPromises();

    // Trigger OK button click
    await wrapper.find('.modal-footer button.btn-primary').trigger('click');
    await flushPromises();

    // Assert that the correct event is emitted
    expect(wrapper.emitted()).toHaveProperty('toggle-item');
    expect(wrapper.emitted()['toggle-item']).toHaveLength(1);
    expect(wrapper.emitted()['toggle-item'][0]).toEqual([propsData.item, {}]);
  });

  describe('application items', () => {
    const testFormSchema = {
      form: {
        fields: [
          {
            id: 'rowid',
            fields: [
              {
                label: 'testLabel',
                model: 'testModel',
                name: 'test',
                type: 'string',
                layout: {
                  offset: 0,
                  columns: 12,
                },
                validation: {
                  required: true,
                },
              },
            ],
          },
        ],
      },
    };

    it('gets a form for an application item for the correct application and object type', async () => {
      const formRelationshipSpy = jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      const formSpy = jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: { form: {} } });

      wrapper = setup({
        glossarySchema: [],
        item: {
          applicationId: 'testApp',
          connectorId: 'testConnector',
          mappingNames: [
            'systemTestconnectorAccount_managedAlpha_user',
          ],
        },
        itemType: 'application',
      });
      await flushPromises();

      expect(formRelationshipSpy).toHaveBeenCalledWith('testApp', 'Account');
      expect(formSpy).toHaveBeenCalledWith('someForm');
    });

    it('displays a form when clicking next on an app with a form associated', async () => {
      jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: testFormSchema });

      wrapper = setup({
        glossarySchema: [],
        item: {
          applicationId: 'testApp',
          connectorId: 'testConnector',
          mappingNames: [
            'systemTestconnectorAccount_managedAlpha_user',
          ],
        },
        itemType: 'application',
      });
      await flushPromises();

      await wrapper.find('.modal-footer button.btn-primary').trigger('click');

      const modalBody = wrapper.find('.modal-body');
      expect(modalBody.text()).toContain('testLabel');
    });

    it('emits the correct event with request data on OK button click', async () => {
      jest.spyOn(RequestFormAssignmentsApi, 'getApplicationRequestFormAssignment')
        .mockResolvedValue({ data: { result: [{ formId: 'someForm' }] } });
      jest.spyOn(RequestFormsApi, 'getRequestForm')
        .mockResolvedValue({ data: testFormSchema });

      const item = {
        applicationId: 'testApp',
        connectorId: 'testConnector',
        mappingNames: [
          'systemTestconnectorAccount_managedAlpha_user',
        ],
      };

      wrapper = setup({
        glossarySchema: [],
        item,
        itemType: 'application',
      });
      await flushPromises();

      await wrapper.find('.modal-footer button.btn-primary').trigger('click');
      await wrapper.findComponent('#testLabel').vm.$emit('input', 'testValue');
      await wrapper.find('.modal-footer button.btn-primary').trigger('click');

      // Assert that the correct event is emitted
      expect(wrapper.emitted()).toHaveProperty('toggle-item');
      expect(wrapper.emitted()['toggle-item']).toHaveLength(1);
      expect(wrapper.emitted()['toggle-item'][0]).toEqual([item, { testModel: 'testValue' }]);
    });
  });
});

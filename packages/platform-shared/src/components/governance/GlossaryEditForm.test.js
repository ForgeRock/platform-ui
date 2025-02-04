/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  mount,
  flushPromises,
} from '@vue/test-utils';
import { nextTick } from 'vue';
import { defineRule } from 'vee-validate';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import FrGovObjectMultiselect from '@forgerock/platform-shared/src/components/FormEditor/components/governance/GovObjectMultiselect';
import FrGovObjectSelect from '@forgerock/platform-shared/src/components/FormEditor/components/governance/GovObjectSelect';
import GlossaryEditForm from './GlossaryEditForm';
import i18n from '@/i18n';

defineRule('required', jest.fn());
defineRule('numeric', jest.fn());
defineRule('integer', jest.fn());

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
ManagedResourceApi.getManagedResourceList.mockResolvedValue({
  data: {
    result: [
      {
        givenName: 'test1',
        sn: 'user1',
        _id: 'userId1',
      },
      {
        givenName: 'test2',
        sn: 'user2',
        _id: 'userId2',
      },
    ],
  },
});

describe('GlossaryEditForm', () => {
  const multiselectTag = 'span[class="multiselect__tag"]';

  const multiselectSingle = 'span[class="multiselect__single"]';

  const multiselectTagDiv = 'span[class="multiselect__tag"]';

  const stringGlossarySchema = [{
    name: 'arrayStrings', description: 'Array Strings', displayName: 'Array Strings', type: 'string', isMultiValue: true, enumeratedValues: [{ text: 'test', value: 'test' }, { text: 'test1', value: 'test1' }, { text: 'test2', value: 'test2' }, { text: 'test3', value: 'test3' }, { text: 'test4', value: 'test4' }], isIndexed: true, searchable: true, allowedValues: ['test', 'test1', 'test2', 'test3', 'test4'], id: '291f4522-ca52-487d-b148-78855c017160', glossary: { kv: [], tags: [] },
  }, {
    name: 'singleString', description: 'Single String', displayName: 'Single String', type: 'string', isMultiValue: false, enumeratedValues: [{ text: 'test', value: 'test' }, { text: 'test1', value: 'test1' }], isIndexed: false, searchable: false, allowedValues: ['test', 'test1'], id: '6a37a60a-0bcd-4fbe-9df0-2251b6efa345', glossary: { kv: [], tags: [] },
  }, {
    name: 'stringAttribute', description: 'String Attribute', displayName: 'String Attribute', type: 'string', isMultiValue: false, enumeratedValues: [], isIndexed: true, searchable: true, allowedValues: [], id: 'c4d46b3d-c1fc-48df-8203-acdeb48332e2', glossary: { kv: [], tags: [] },
  }, {
    name: 'stringTags', description: 'String Tags', displayName: 'String Tags', type: 'string', isMultiValue: true, enumeratedValues: [], isIndexed: true, searchable: true, allowedValues: [], id: '2731436c-f929-4f93-bfb8-318bdea36b07', glossary: { kv: [], tags: [] },
  }];

  const numberGlossarySchema = [{
    name: 'arrayNumbers', description: 'Number Array', displayName: 'Number Array', type: 'int', objectType: '/openidm/managed/application', isMultiValue: true, enumeratedValues: [{ text: 10, value: 10 }, { text: 20, value: 20 }, { text: 30, value: 30 }, { text: 40, value: 40 }, { text: 50, value: 50 }], isIndexed: true, searchable: true, allowedValues: [10, 20, 30, 40, 50], id: '11cbc132-87a6-47da-bb1b-b0c270c15f44', glossary: { kv: [], tags: [] },
  }, {
    name: 'numberAttribute', description: 'Number Attribute', displayName: 'Number Attribute', type: 'int', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [], isIndexed: true, searchable: true, allowedValues: [], id: '524fba8f-8857-4d93-958a-29f333a57599', glossary: { kv: [], tags: [] },
  }, {
    name: 'numberTags', description: 'Number Tags', displayName: 'Number Tags', type: 'int', objectType: '/openidm/managed/application', isMultiValue: true, enumeratedValues: [], isIndexed: true, searchable: true, allowedValues: [], id: '9fbf03ce-6fcb-4294-8611-e6b9122456a4', glossary: { kv: [], tags: [] },
  }, {
    name: 'singleNumber', description: 'Single Number', displayName: 'Single Number', type: 'int', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [{ text: 10, value: 10 }, { text: 20, value: 20 }, { text: 30, value: 30 }], isIndexed: true, searchable: true, allowedValues: [10, 20, 30], id: '5f2ef95f-20df-44c3-8561-5d3583b1d4e1', glossary: { kv: [], tags: [] },
  }];

  const integerGlossarySchema = [{
    name: 'arrayNumbers', description: 'Number Array', displayName: 'Number Array', type: 'integer', objectType: '/openidm/managed/application', isMultiValue: true, enumeratedValues: [{ text: 10, value: 10 }, { text: 20, value: 20 }, { text: 30, value: 30 }, { text: 40, value: 40 }, { text: 50, value: 50 }], isIndexed: true, searchable: true, allowedValues: [10, 20, 30, 40, 50], id: '11cbc132-87a6-47da-bb1b-b0c270c15f44', glossary: { kv: [], tags: [] },
  }, {
    name: 'numberAttribute', description: 'Number Attribute', displayName: 'Number Attribute', type: 'integer', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [], isIndexed: true, searchable: true, allowedValues: [], id: '524fba8f-8857-4d93-958a-29f333a57599', glossary: { kv: [], tags: [] },
  }, {
    name: 'numberTags', description: 'Number Tags', displayName: 'Number Tags', type: 'integer', objectType: '/openidm/managed/application', isMultiValue: true, enumeratedValues: [], isIndexed: true, searchable: true, allowedValues: [], id: '9fbf03ce-6fcb-4294-8611-e6b9122456a4', glossary: { kv: [], tags: [] },
  }, {
    name: 'singleNumber', description: 'Single Number', displayName: 'Single Number', type: 'integer', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [{ text: 10, value: 10 }, { text: 20, value: 20 }, { text: 30, value: 30 }], isIndexed: true, searchable: true, allowedValues: [10, 20, 30], id: '5f2ef95f-20df-44c3-8561-5d3583b1d4e1', glossary: { kv: [], tags: [] },
  }];

  const dateGlossarySchema = [{
    name: 'dateAttribute', description: 'Date Attribute', displayName: 'Date Attribute', type: 'date', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [], isIndexed: false, searchable: false, allowedValues: [], id: '543a1579-ada2-47e1-a403-177ec6cae7a3', glossary: { kv: [], tags: [] },
  }];

  const boolGlossarySchema = [{
    name: 'booleanAttribute', description: 'Boolean Attribute', displayName: 'Boolean Attribute', type: 'boolean', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [], isIndexed: false, searchable: false, allowedValues: [], id: 'cbbdeabd-1558-4cde-b868-cc341dcb516b', glossary: { kv: [], tags: [] },
  }];

  const orgGlossarySchema = [{
    name: 'multiOrg', description: 'This is a multiple org attribute', displayName: 'Multiple Orgs', type: 'managedObject', objectType: '/openidm/managed/application', isMultiValue: true, enumeratedValues: [], isIndexed: true, searchable: true, managedObjectType: '/openidm/managed/organization', allowedValues: [], id: 'ad99f9d8-4125-40bc-89e4-e6c2baf49e02', glossary: { kv: [], tags: [] },
  }, {
    name: 'singleOrg', description: 'Single Org', displayName: 'Single Org', type: 'managedObject', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [], isIndexed: true, searchable: true, managedObjectType: '/openidm/managed/organization', allowedValues: [], id: '871e5c08-57aa-4913-9460-1c031cb33b92', glossary: { kv: [], tags: [] },
  }];

  const roleGlossarySchema = [{
    name: 'multipleRoles', description: 'Multiple Roles', displayName: 'Multiple Roles', type: 'managedObject', objectType: '/openidm/managed/application', isMultiValue: true, enumeratedValues: [], isIndexed: true, searchable: true, managedObjectType: '/openidm/managed/role', allowedValues: [], id: '34ec3b64-24e6-4940-91cb-b78692fc04b4', glossary: { kv: [], tags: [] },
  }, {
    name: 'singleRole', description: 'Single Role', displayName: 'Single Role', type: 'managedObject', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [], isIndexed: true, searchable: true, managedObjectType: '/openidm/managed/role', allowedValues: [], id: 'e0df02d0-e152-45df-8b30-021a9e346558', glossary: { kv: [], tags: [] },
  }];

  const userGlossarySchema = [{
    name: 'multiUser', description: 'Multi User', displayName: 'Multi User', type: 'managedObject', objectType: '/openidm/managed/application', isMultiValue: true, enumeratedValues: [], isIndexed: true, searchable: true, allowedValues: [], id: '34177d87-e643-440a-88a4-cb7da82da2db', glossary: { kv: [], tags: [] }, managedObjectType: '/openidm/managed/user',
  }, {
    name: 'singleUser', description: 'Single User', displayName: 'Single User', type: 'managedObject', objectType: '/openidm/managed/application', isMultiValue: false, enumeratedValues: [], isIndexed: true, searchable: true, managedObjectType: '/openidm/managed/user', allowedValues: [], id: '0b274b73-4266-4c8c-9c89-a78eb1736cfb', glossary: { kv: [], tags: [] },
  }];

  function setup(props) {
    return mount(GlossaryEditForm, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('renders string fields for create scenario', async () => {
      const wrapper = setup({
        glossarySchema: stringGlossarySchema,
      });

      await nextTick();

      expect(wrapper.find('input[name="String Attribute"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="String Tags"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="Array Strings"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="Single String"]').exists()).toBeTruthy();
    });

    it('renders number fields for create scenario', async () => {
      const wrapper = setup({
        glossarySchema: numberGlossarySchema,
      });

      await nextTick();

      expect(wrapper.find('input[name="Number Attribute"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="Number Tags"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="Number Array"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="Single Number"]').exists()).toBeTruthy();
    });

    it('renders integer fields for create scenario', async () => {
      const wrapper = setup({
        glossarySchema: integerGlossarySchema,
      });

      await nextTick();

      expect(wrapper.find('input[name="Number Attribute"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="Number Tags"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="Number Array"]').exists()).toBeTruthy();
      expect(wrapper.find('div[id="Single Number"]').exists()).toBeTruthy();
    });

    it('renders date field for create scenario', async () => {
      const wrapper = setup({
        glossarySchema: dateGlossarySchema,
      });

      await nextTick();

      expect(wrapper.find('input[type="date"]').exists()).toBeTruthy();
    });

    it('renders boolean field for create scenario', async () => {
      const wrapper = setup({
        glossarySchema: boolGlossarySchema,
      });

      await nextTick();

      expect(wrapper.find('input[type="checkbox"]').exists()).toBeTruthy();
    });

    it('renders string fields for edit scenario', async () => {
      const wrapper = setup({
        glossarySchema: stringGlossarySchema,
        'model-value': {
          stringAttribute: 'testnew1',
          stringTags: ['test', 'test2'],
          arrayStrings: ['test', 'test2', 'test3'],
          singleString: 'test',
        },
        readOnly: true,
      });

      await flushPromises();
      const arrayStrings = wrapper.find('div[id="Array Strings"]');
      expect(arrayStrings.findAll(multiselectTag)[0].text()).toEqual('test');
      expect(arrayStrings.findAll(multiselectTag)[1].text()).toEqual('test2');
      expect(arrayStrings.findAll(multiselectTag)[2].text()).toEqual('test3');

      expect(wrapper.find('div[id="Single String"]').findAll(multiselectSingle)[0].text()).toEqual('test');

      const stringTags = wrapper.find('div[id="String Tags"]');
      expect(stringTags.findAll('span[class="fr-tag-text"]')[0].text()).toEqual('test');
      expect(stringTags.findAll('span[class="fr-tag-text"]')[1].text()).toEqual('test2');

      expect(wrapper.find('div[id="String Attribute"]').find('input').element.value).toEqual('testnew1');
    });
    it('renders number fields for edit scenario', async () => {
      const wrapper = setup({
        glossarySchema: numberGlossarySchema,
        'model-value': {
          numberAttribute: 40, numberTags: [10, 20], arrayNumbers: [10, 20, 30], singleNumber: 20,
        },
      });

      await nextTick();

      const arrayNumbers = wrapper.find('div[id="Number Array"]');
      expect(arrayNumbers.findAll(multiselectTag)[0].text()).toEqual('10');
      expect(arrayNumbers.findAll(multiselectTag)[1].text()).toEqual('20');
      expect(arrayNumbers.findAll(multiselectTag)[2].text()).toEqual('30');

      const numberTags = wrapper.find('div[id="Number Tags"]');
      expect(numberTags.findAll('span[class="fr-tag-text"]')[0].text()).toEqual('10');
      expect(numberTags.findAll('span[class="fr-tag-text"]')[1].text()).toEqual('20');

      expect(wrapper.find('div[id="Single Number"]').findAll(multiselectSingle)[0].text()).toEqual('20');

      expect(wrapper.find('div[id="Number Attribute"]').find('input').element.value).toEqual('40');
    });
    it('renders integer fields for edit scenario', async () => {
      const wrapper = setup({
        glossarySchema: integerGlossarySchema,
        'model-value': {
          numberAttribute: 40, numberTags: [10, 20], arrayNumbers: [10, 20, 30], singleNumber: 20,
        },
      });

      await nextTick();

      const arrayNumbers = wrapper.find('div[id="Number Array"]');
      expect(arrayNumbers.findAll(multiselectTag)[0].text()).toEqual('10');
      expect(arrayNumbers.findAll(multiselectTag)[1].text()).toEqual('20');
      expect(arrayNumbers.findAll(multiselectTag)[2].text()).toEqual('30');

      const numberTags = wrapper.find('div[id="Number Tags"]');
      expect(numberTags.findAll('span[class="fr-tag-text"]')[0].text()).toEqual('10');
      expect(numberTags.findAll('span[class="fr-tag-text"]')[1].text()).toEqual('20');

      expect(wrapper.find('div[id="Single Number"]').findAll(multiselectSingle)[0].text()).toEqual('20');

      expect(wrapper.find('div[id="Number Attribute"]').find('input').element.value).toEqual('40');
    });
    it('renders date field for edit scenario', async () => {
      const wrapper = setup({
        glossarySchema: dateGlossarySchema,
        'model-value': {
          dateAttribute: '2023-04-12T00:00:00+00:00',
        },
      });

      await nextTick();

      expect(wrapper.find('div[id="Date Attribute"]').find('input[type="date"]').element.value).toEqual('2023-04-12');
    });
    it('renders boolean field for edit scenario', async () => {
      const wrapper = setup({
        glossarySchema: boolGlossarySchema,
        'model-value': {
          booleanAttribute: true,
        },
      });

      await nextTick();

      expect(wrapper.find('div[label="Boolean Attribute"]').find('input[type="checkbox"]').element.checked).toBeTruthy();
    });
    it('renders org fields for create scenario', async () => {
      const wrapper = setup({
        glossarySchema: orgGlossarySchema,
      });

      await flushPromises();

      expect(wrapper.find('div[label="Multiple Orgs"]').exists()).toBeTruthy();

      expect(wrapper.find('div[label="Single Org"]').exists()).toBeTruthy();
    });
    it('renders role fields for create scenario', async () => {
      const wrapper = setup({
        glossarySchema: roleGlossarySchema,
      });

      await flushPromises();

      expect(wrapper.find('div[label="Multiple Roles"]').exists()).toBeTruthy();

      expect(wrapper.find('div[label="Single Role"]').exists()).toBeTruthy();
    });
    it('renders user fields for create scenario', async () => {
      const wrapper = setup({
        glossarySchema: userGlossarySchema,
      });

      await flushPromises();

      expect(wrapper.find('div[label="Multi User"]').exists()).toBeTruthy();

      expect(wrapper.find('div[label="Single User"]').exists()).toBeTruthy();
    });
    it('renders org fields for edit scenario', async () => {
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              name: 'Engineering',
              _id: 'test1',
            },
            {
              name: 'Sales',
              _id: 'userId2',
            },
          ],
        },
      });
      const wrapper = setup({
        glossarySchema: orgGlossarySchema,
        'model-value': {
          singleOrg: 'managed/organization/test1', multiOrg: ['managed/organization/test1'],
        },
      });

      await flushPromises();

      expect(wrapper.find('div[label="Multiple Orgs"]').findAll(multiselectTagDiv)[0].text()).toContain('Engineering');

      expect(wrapper.find('div[label="Single Org"]').find(multiselectSingle).text()).toContain('Engineering');
    });
    it('renders user fields for edit scenario', async () => {
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              givenName: 'igaadmin',
              _id: 'test1',
            },
          ],
        },
      });
      const wrapper = setup({
        glossarySchema: userGlossarySchema,
        'model-value': {
          singleUser: 'managed/user/test1', multiUser: ['managed/user/test1'],
        },
      });

      await flushPromises();

      expect(wrapper.find('div[label="Multi User"]').findAll(multiselectTagDiv)[0].text()).toContain('igaadmin');

      expect(wrapper.find('div[label="Single User"]').find(multiselectSingle).text()).toContain('igaadmin');
    });
    it('renders role fields for edit scenario', async () => {
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              name: 'IT Analyst',
              _id: 'test1',
            },
          ],
        },
      });
      const wrapper = setup({
        glossarySchema: roleGlossarySchema,
        'model-value': {
          singleRole: 'managed/role/test1', multipleRoles: ['managed/role/test1'],
        },
      });

      await flushPromises();

      expect(wrapper.find('div[label="Multiple Roles"]').findAll(multiselectTagDiv)[0].text()).toContain('IT Analyst');

      expect(wrapper.find('div[label="Single Role"]').find(multiselectSingle).text()).toContain('IT Analyst');
    });
  });
  describe('@actions', () => {
    it('should emit update event on string fields', async () => {
      const wrapper = setup({
        glossarySchema: stringGlossarySchema,
      });

      await flushPromises();

      const stringAttribute = wrapper.find('input[name="String Attribute"]');
      stringAttribute.setValue('some value');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ stringAttribute: 'some value' });

      const stringArray = wrapper.findComponent('div[id="Array Strings"]');
      stringArray.trigger('click');
      stringArray.findAll('li')[1].find('span').trigger('click');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ arrayStrings: ['test1'] });

      const singleString = wrapper.findComponent('div[id="Single String"]');
      singleString.trigger('click');
      singleString.findAll('li')[1].find('span').trigger('click');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[2][0]).toEqual({ singleString: 'test1' });

      const inputTagsString = wrapper.findComponent('div[id="String Tags"]').find('input');
      inputTagsString.element.value = 'test321';
      inputTagsString.trigger('change');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[3][0]).toEqual({
        stringTags: ['test321'],
      });
    });

    it('should emit update event on int fields', async () => {
      const wrapper = setup({
        glossarySchema: numberGlossarySchema,
      });

      await flushPromises();

      const numberInput = wrapper.find('input[name="Number Attribute"]');
      numberInput.element.value = 0;
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ numberAttribute: 0 });

      const inputTagsNumber = wrapper.find('div[id="Number Tags"]').find('input');
      inputTagsNumber.element.value = 40;
      inputTagsNumber.trigger('change');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ numberTags: ['40'] });

      const numberArray = wrapper.find('div[id="Number Array"]');
      numberArray.trigger('click');
      numberArray.findAll('li')[1].find('span').trigger('click');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[2][0]).toEqual({ arrayNumbers: [20] });

      const singleNumber = wrapper.find('div[id="Single Number"]');
      singleNumber.trigger('click');
      singleNumber.findAll('li')[1].find('span').trigger('click');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[3][0]).toEqual({
        singleNumber: 20,
      });
    });

    it('should emit update event on integer fields', async () => {
      const wrapper = setup({
        glossarySchema: integerGlossarySchema,
      });

      await flushPromises();

      const numberInput = wrapper.find('input[name="Number Attribute"]');
      numberInput.element.value = 0;
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ numberAttribute: 0 });

      const inputTagsNumber = wrapper.find('div[id="Number Tags"]').find('input');
      inputTagsNumber.element.value = 40;
      inputTagsNumber.trigger('change');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ numberTags: ['40'] });

      const numberArray = wrapper.find('div[id="Number Array"]');
      numberArray.trigger('click');
      numberArray.findAll('li')[1].find('span').trigger('click');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[2][0]).toEqual({ arrayNumbers: [20] });

      const singleNumber = wrapper.find('div[id="Single Number"]');
      singleNumber.trigger('click');
      singleNumber.findAll('li')[1].find('span').trigger('click');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[3][0]).toEqual({
        singleNumber: 20,
      });
    });

    it('should emit update event on boolean fields', async () => {
      const wrapper = setup({
        glossarySchema: boolGlossarySchema,
      });

      await flushPromises();

      const boolAttr = wrapper.findComponent('div[label="Boolean Attribute"]').find('input');
      boolAttr.element.checked = false;
      await flushPromises();
      boolAttr.setChecked(true);
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ booleanAttribute: true });
    });

    it('should emit update event on date fields', async () => {
      const wrapper = setup({
        glossarySchema: dateGlossarySchema,
      });

      await nextTick();

      const dateAttribute = wrapper.find('div[id="Date Attribute"]');
      dateAttribute.find('input').setValue('2023-04-02');
      await nextTick();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ dateAttribute: '2023-04-02' });
    });

    it('should emit update event on org object fields', async () => {
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              name: 'org1',
              _id: 'orgId1',
            },
          ],
        },
      });
      const wrapper = setup({
        glossarySchema: orgGlossarySchema,
      });

      await flushPromises();

      const multiOrg = wrapper.findComponent(FrGovObjectMultiselect);
      multiOrg.vm.$emit('update:model', { path: 'multiOrg', value: ['managed/organization/orgId1'] });
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ multiOrg: ['managed/organization/orgId1'] });

      const singleOrg = wrapper.findComponent(FrGovObjectSelect);
      singleOrg.vm.$emit('update:model', { path: 'singleOrg', value: 'managed/organization/orgId1' });
      expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ singleOrg: 'managed/organization/orgId1' });
    });

    it('should emit update event on role object fields', async () => {
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              name: 'role1',
              _id: 'roleId1',
            },
          ],
        },
      });
      const wrapper = setup({
        glossarySchema: roleGlossarySchema,
      });

      await flushPromises();

      const multiRole = wrapper.findComponent(FrGovObjectMultiselect);
      multiRole.vm.$emit('update:model', { path: 'multipleRoles', value: ['managed/role/roleId1'] });
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ multipleRoles: ['managed/role/roleId1'] });

      const singleRole = wrapper.findComponent(FrGovObjectSelect);
      singleRole.vm.$emit('update:model', { path: 'singleRole', value: 'managed/role/roleId1' });
      expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ singleRole: 'managed/role/roleId1' });
    });

    it('should emit update event on user object fields', async () => {
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              givenName: 'test1',
              sn: 'user1',
              _id: 'userId1',
            },
          ],
        },
      });
      const wrapper = setup({
        glossarySchema: userGlossarySchema,
      });

      await flushPromises();

      const multiUser = wrapper.findComponent(FrGovObjectMultiselect);
      multiUser.vm.$emit('update:model', { path: 'multiUser', value: ['managed/user/userId1'] });
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ multiUser: ['managed/user/userId1'] });

      const singleUser = wrapper.findComponent(FrGovObjectSelect);
      singleUser.vm.$emit('update:model', { path: 'singleUser', value: 'managed/user/userId1' });
      expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ singleUser: 'managed/user/userId1' });
    });
  });
  describe('@edge cases', () => {
    it('should clean up glossary values for empty values', async () => {
      const wrapper = setup({
        glossarySchema: numberGlossarySchema,
        'model-value': {
          numberAttribute: 40, numberTags: [10, 20], arrayNumbers: [10, 20, 30], singleNumber: 20,
        },
      });

      await flushPromises();

      wrapper.find('input[name="Number Attribute"]').setValue('');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
        numberAttribute: 40,
        arrayNumbers: [10, 20, 30],
        numberTags: [10, 20],
        singleNumber: 20,
      });
    });
    it('should clean up glossary values for non managed type empty values', async () => {
      const wrapper = setup({
        glossarySchema: numberGlossarySchema,
        'model-value': {
          numberAttribute: 40, numberTags: [10, 20], arrayNumbers: [10, 20, 30], singleNumber: 20,
        },
      });

      await flushPromises();

      wrapper.find('input[name="Number Attribute"]').setValue('');
      await flushPromises();
      expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
        numberAttribute: 40,
        arrayNumbers: [10, 20, 30],
        numberTags: [10, 20],
        singleNumber: 20,
      });
    });
    it('should clean up glossary values for managed type empty values', async () => {
      ManagedResourceApi.getManagedResourceList.mockResolvedValue({
        data: {
          result: [
            {
              name: 'role1',
              _id: 'roleId1',
            },
          ],
        },
      });
      const wrapper = setup({
        glossarySchema: roleGlossarySchema,
        'model-value': {
          singleRole: 'managed/role/roleId1', multipleRoles: ['managed/role/roleId1'],
        },
      });

      await flushPromises();

      const multiRole = wrapper.findComponent(FrGovObjectMultiselect);
      multiRole.vm.$emit('update:model', { path: 'multipleRoles', value: [] });
      expect(wrapper.emitted('update:modelValue')[1][0]).toEqual({ singleRole: 'managed/role/roleId1' });
    });
  });
});

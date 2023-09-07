/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { BModal } from 'bootstrap-vue';
import Notifications from '@kyvg/vue3-notification';
import SettingsTab from './index';
import * as SchemaApi from '@/api/SchemaApi';

let wrapper;
describe('SettingsTab', () => {
  beforeEach(() => {
    wrapper = shallowMount(SettingsTab, {
      global: {
        mocks: {
          $t: () => {},
          $store: {
            state: {
              isFraas: true,
              realm: 'realm',
            },
          },
        },
        plugins: [Notifications],
        stubs: { BModal },
        renderStubDefaultSlot: true,
      },
      props: {
        properties: {
          temporalConstraints: {
            disabled: true,
          },
          condition: {
            disabled: false,
          },
        },
        resourcePath: 'resourcePath',
        resourceName: 'resourceName',
      },
    });
    wrapper.setData({
      disableSave: true,
      editProperty: {
        isConditional: true,
        value: 'test',
      },
    });
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        patch: () => Promise.resolve(),
      }
    ));
    jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve({
      data: {
        order: [
          'test',
          'test2',
        ],
        properties: {
          test: {
            value: 'test',
            viewable: true,
            type: 'object',
            title: 'testTitle',
            propName: 'testPropName',
            order: [
              'innerTest',
            ],
            properties: {
              innerTest: {
                type: 'string',
              },
            },
            isTemporalConstraint: true,
          },
          test2: {
            value: 'test2',
            type: 'string',
            title: 'test2Title',
            propName: 'test2PropName',
            viewable: true,
            isTemporalConstraint: false,
            isConditional: true,
          },
        },
      },
    }));
  });

  it('disables save button', () => {
    expect(wrapper.vm.saveDisabled).toBeTruthy();
    wrapper.setData({
      disableSave: false,
      editProperty: {
        isConditional: true,
      },
    });
    expect(wrapper.vm.saveDisabled).toBeFalsy();
  });

  it('toggles form', () => {
    expect(wrapper.vm.editProperty.value).toBe('test');
    wrapper.vm.showForm = false;
    wrapper.vm.toggleForm();
    expect(wrapper.vm.editProperty.value).toBe('');
    expect(wrapper.vm.disableSave).toBeFalsy();
  });

  it('changes query filter', () => {
    expect(wrapper.vm.editProperty.value).toBe('test');
    wrapper.vm.queryFilterChange('queryFilterString');
    expect(wrapper.vm.editProperty.value).toBe('queryFilterString');
    expect(wrapper.vm.disableSave).toBeFalsy();
  });

  it('disables save on query filter errors', () => {
    wrapper.setData({
      disableSave: false,
      editProperty: {
        isConditional: true,
      },
    });
    expect(wrapper.vm.disableSave).toBeFalsy();
    wrapper.vm.queryFilterError();
    expect(wrapper.vm.disableSave).toBeTruthy();
  });

  it('saves settings', async () => {
    wrapper.setData({
      disableSave: true,
      editProperty: {
        isConditional: true,
        value: '',
        isTemporalConstraint: true,
        propName: 'propName',
      },
    });
    const hideSpy = jest.spyOn(wrapper.vm.$refs.settingsModal, 'hide');
    await wrapper.vm.saveSetting();
    expect(hideSpy).toHaveBeenCalled();
    expect(wrapper.emitted()['refresh-data']).toBeTruthy();
  });

  it('shows modal', async () => {
    const showSpy = jest.spyOn(wrapper.vm.$refs.settingsModal, 'show');
    await wrapper.vm.showModal({
      isConditional: true,
      value: '',
      isTemporalConstraint: true,
      propName: 'propName',
    });
    expect(wrapper.vm.editProperty).toStrictEqual({
      isConditional: true,
      value: '',
      isTemporalConstraint: true,
      propName: 'propName',
    });
    expect(wrapper.vm.showForm).toBe(false);
    expect(showSpy).toHaveBeenCalled();
    expect(wrapper.vm.conditionOptions).toStrictEqual([
      {
        label: 'testTitle/innerTest',
        type: 'string',
        value: 'test/innerTest',
      },
      {
        label: 'test2Title',
        type: 'string',
        value: 'test2',
      },
    ]);
  });
});

/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { setupTestPinia } from '../../utils/testPiniaHelpers';
import ResourceMixin from './index';

let wrapper;

describe('ResourceMixin', () => {
  beforeEach(() => {
    setupTestPinia({ user: { idmRoles: ['openidm-admin'], idmUIAdminRoles: ['openidm-admin'] } });
    wrapper = shallowMount({}, {
      render() {},
      global: {
        mixins: [ResourceMixin],
        mocks: {
          $t: (id) => id,
          $store: {
            commit: jest.fn(),
            state: {
              SharedStore: {
                uiConfig: {

                },
                managedObjectMinimumUIFilterLength: {},
              },
            },
          },
        },
      },
    });
  });

  describe('Generating update patches', () => {
    const originalForm = {
      phone: 'b', name: 'c', cn: 'd', sn: '', mail: 'john@doe.com',
    };
    const newForm = {
      phone: '', name: 'c', cn: 'e', sn: 'f', mail: undefined,
    };

    const returnedPatch = [
      { operation: 'remove', field: '/phone' },
      { operation: 'replace', field: '/cn', value: 'e' },
      { operation: 'add', field: '/sn', value: 'f' },
      { operation: 'remove', field: '/mail' },
    ];
    it('Correctly generates a patch based on original and new forms', () => {
      const updatePatch = wrapper.vm.generateUpdatePatch(originalForm, newForm);
      expect(updatePatch).toStrictEqual(returnedPatch);
    });
  });

  describe('Finding Policy errors', () => {
    const policyReqs = [
      { a: 'a', params: {}, policyRequirement: 'REQUIRED' },
      { a: 'b', params: {}, policyRequirement: 'MATCH_REGEXP' },
      { a: 'c', params: {}, policyRequirement: 'UNIQUE' },
    ];

    const errorResponseKey = {
      data: {
        detail: {
          failedPolicyRequirements: [
            {
              policyRequirements: [{ a: 'REQUIRED', params: {} }],
              property: 'foo',
            },
          ],
        },
      },
    };

    const errorResponseRegExp = {
      data: {
        detail: {
          failedPolicyRequirements: [
            {
              policyRequirements: [{ a: 'MATCH_REGEXP', params: {} }],
              property: 'fizz',
            },
          ],
        },
      },
    };

    const errorResponseTitle = {
      data: {
        detail: {
          failedPolicyRequirements: [
            {
              policyRequirements: [{ a: 'UNIQUE', params: {} }],
              property: 'bar',
            },
          ],
        },
      },
    };

    const properties = [
      { name: 'foo' },
      { propName: 'fizz' },
      { name: 'bar', title: 'Title Bar' },
    ];
    const finalErrorKey = [{ exists: true, field: 'foo', msg: 'common.policyValidationMessages.REQUIRED' }];
    const finalErrorRegExp = [{ exists: true, field: 'fizz', msg: 'common.policyValidationMessages.MATCH_REGEXP' }];
    const finalErrorTitle = [{ exists: true, field: 'bar', msg: 'common.policyValidationMessages.UNIQUE' }];

    it('Finds and returns policy error', () => {
      const normalizeSpyForErrorKey = jest.spyOn(wrapper.vm, 'normalizePolicies').mockReturnValue([policyReqs[0]]);
      const parsedErrorKey = wrapper.vm.findPolicyError(errorResponseKey, properties);
      expect(parsedErrorKey).toStrictEqual(finalErrorKey);
      expect(normalizeSpyForErrorKey).toHaveBeenCalled();

      const normalizeSpyForRegExpError = jest.spyOn(wrapper.vm, 'normalizePolicies').mockReturnValue([policyReqs[1]]);
      const parsedErrorRegExp = wrapper.vm.findPolicyError(errorResponseRegExp, properties);
      expect(parsedErrorRegExp).toStrictEqual(finalErrorRegExp);
      expect(normalizeSpyForRegExpError).toHaveBeenCalled();

      const normalizeSpyForErrorTitle = jest.spyOn(wrapper.vm, 'normalizePolicies').mockReturnValue([policyReqs[2]]);
      const parsedErrorTitle = wrapper.vm.findPolicyError(errorResponseTitle, properties);
      expect(parsedErrorTitle).toStrictEqual(finalErrorTitle);
      expect(normalizeSpyForErrorTitle).toHaveBeenCalled();
    });
  });

  it('Sets help text from search field length', () => {
    wrapper.vm.queryThreshold = 0;
    wrapper.vm.filter = '';

    wrapper.vm.setHelpTextFromSearchLength();

    expect(wrapper.vm.hasFocus).toBe(true);
    expect(wrapper.vm.searchHelpText).toBe('');

    wrapper.vm.queryThreshold = 3;

    wrapper.vm.setHelpTextFromSearchLength();
    expect(wrapper.vm.searchHelpText).toBe('listResource.searchInProgressText');

    wrapper.vm.filter = 'fo';
    wrapper.vm.setHelpTextFromSearchLength();
    expect(wrapper.vm.searchHelpText).toBe('listResource.searchInProgressText');

    wrapper.vm.filter = 'foo';
    wrapper.vm.setHelpTextFromSearchLength();
    expect(wrapper.vm.searchHelpText).toBe('listResource.searchActiveText');
  });

  it('Removes help text and focus', () => {
    wrapper.vm.hasFocus = true;
    wrapper.vm.searchHelpText = 'foo';

    wrapper.vm.removeHelpText();
    expect(wrapper.vm.hasFocus).toEqual(false);
    expect(wrapper.vm.searchHelpText).toEqual('');
  });

  describe('Getting the minimum UI filter length for an object', () => {
    describe('Calling the count api to determine whether to set a minimum filter length', () => {
      it('Uses the default minimum length if the response from the API is over 1000', async () => {
        jest.spyOn(ManagedResourceApi, 'getManagedResourceCount').mockResolvedValue({ data: { resultCount: 1000000 } });
        const minFilterLength = await wrapper.vm.getMinimumUIFilterLength('test');
        expect(minFilterLength).toBe(3);
      });

      it('Uses the 0 as the length if the response from the API is 1000 or under', async () => {
        jest.spyOn(ManagedResourceApi, 'getManagedResourceCount').mockResolvedValue({ data: { resultCount: 1 } });
        const minFilterLength = await wrapper.vm.getMinimumUIFilterLength('test');
        expect(minFilterLength).toBe(0);
      });

      it('Uses the default minimum length if the API request encounters an error', async () => {
        jest.spyOn(ManagedResourceApi, 'getManagedResourceCount').mockRejectedValue({ message: 'Unsupported object type for count query' });
        const minFilterLength = await wrapper.vm.getMinimumUIFilterLength('test');
        expect(minFilterLength).toBe(3);
      });
    });
  });
});

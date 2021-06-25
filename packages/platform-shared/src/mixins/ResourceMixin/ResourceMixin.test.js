/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ResourceMixin from './index';

let wrapper;

describe('ResourceMixin', () => {
  beforeEach(() => {
    wrapper = shallowMount({}, {
      render() {},
      mixins: [ResourceMixin],
      mocks: { $t: (id) => id },
    });
  });

  describe('Generating update patches', () => {
    const originalForm = {
      phone: 'b', name: 'c', cn: 'd', sn: '',
    };
    const newForm = {
      phone: '', name: 'c', cn: 'e', sn: 'f',
    };

    const returnedPatch = [
      { operation: 'remove', field: '/phone' },
      { operation: 'replace', field: '/cn', value: 'e' },
      { operation: 'add', field: '/sn', value: 'f' },
    ];
    it('Correctly generates a patch based on original and new forms', () => {
      const updatePatch = wrapper.vm.generateUpdatePatch(originalForm, newForm);
      expect(updatePatch).toStrictEqual(returnedPatch);
    });
  });

  describe('Finding Policy errors', () => {
    const policyReqs = [
      { a: 'a', params: {}, policyRequirement: 'REQUIRED' },
      { a: 'b', params: {}, policyRequirement: 'UNIQUE' },
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

    const properties = [{ key: 'foo' }, { key: 'bar', title: 'Title Bar' }];
    const finalErrorKey = [{ exists: true, field: 'foo', msg: 'common.policyValidationMessages.REQUIRED' }];
    const finalErrorTitle = [{ exists: true, field: 'bar', msg: 'common.policyValidationMessages.REQUIRED' }];

    it('Finds and returns policy error', () => {
      const normalizeSpy = jest.spyOn(wrapper.vm, 'normalizePolicies').mockReturnValue(policyReqs);

      const parsedErrorKey = wrapper.vm.findPolicyError(errorResponseKey, properties);
      expect(parsedErrorKey).toStrictEqual(finalErrorKey);

      const parsedErrorTitle = wrapper.vm.findPolicyError(errorResponseTitle, properties);
      expect(parsedErrorTitle).toStrictEqual(finalErrorTitle);

      expect(normalizeSpy).toHaveBeenCalled();
    });
  });

  describe('Generating Search URLs', () => {
    const schemaProps = {
      isAdmin: { type: 'boolean' },
      sn: { type: 'string' },
      userName: { type: 'string' },
      age: { type: 'number' },
    };

    it('Generates a filter url for a string', () => {
      const filterUrl = wrapper.vm.generateSearch('a', ['userName', 'sn'], schemaProps);
      expect(filterUrl).toStrictEqual('userName sw "a" OR sn sw "a"');
    });

    it('Generates a filter url for a number', () => {
      const filterUrl = wrapper.vm.generateSearch('1', ['age'], schemaProps);
      expect(filterUrl).toStrictEqual('age eq 1');
    });

    it('Generates a filter url for a boolean', () => {
      const filterUrl = wrapper.vm.generateSearch('true', ['isAdmin'], schemaProps);
      expect(filterUrl).toStrictEqual('isAdmin eq true');
    });
  });
});

/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CertificationTaskActionConfirmModal from './index';

let wrapper;

function mountComponent(options) {
  wrapper = shallowMount(CertificationTaskActionConfirmModal, {
    methods: {
      cancel: jest.fn(),
    },
    mocks: {
      $t: (t) => t,
      ...options,
    },
    propsData: {
      modalOptions: {},
      isLoading: false,
    },
  });
}
describe('CertificationTaskActionConfirmModal', () => {
  describe('Component mount', () => {
    it('CertificationTaskActionConfirmModal successfully loaded', () => {
      mountComponent();
      expect(wrapper.name()).toEqual('CertificationTaskActionConfirmModal');
    });
  });
});

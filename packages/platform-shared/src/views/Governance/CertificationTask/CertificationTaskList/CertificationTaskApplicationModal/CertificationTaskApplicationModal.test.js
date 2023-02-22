/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import CertificationTaskApplicationModal from './index';

describe('CertificationTaskApplicationModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(CertificationTaskApplicationModal, {
      mocks: {
        $t: (t) => t,
      },
      propsData: {
        application: {
          id: 'test',
        },
      },
    });
  });

  it('component should load correclty', () => {
    expect(wrapper.name()).toBe('CertificationTaskApplicationModal');
  });

  it('getFullName shoul return name formatted', () => {
    const fullName = wrapper.vm.getFullName('first', 'last');

    expect(fullName).toBe('governance.certificationTask.userFullName');
  });
});

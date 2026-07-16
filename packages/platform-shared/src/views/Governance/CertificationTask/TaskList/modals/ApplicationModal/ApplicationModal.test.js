/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ApplicationModal from './index';

describe('ApplicationModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ApplicationModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        application: {
          id: 'test',
        },
      },
    });
  });

  it('getFullName shoul return name formatted', () => {
    const fullName = wrapper.vm.getFullName('first', 'last');

    expect(fullName).toBe('common.userFullName');
  });

  it('sets aria-label combining display name and application name when provided', async () => {
    await wrapper.setProps({ application: { id: 'test', name: 'My App' } });
    expect(wrapper.find('#CertificationTaskApplicationModal').attributes('arialabel')).toContain('My App');
  });

  it('falls back to translated string when application has no name', () => {
    expect(wrapper.find('#CertificationTaskApplicationModal').attributes('arialabel')).toBe('common.application');
  });
});

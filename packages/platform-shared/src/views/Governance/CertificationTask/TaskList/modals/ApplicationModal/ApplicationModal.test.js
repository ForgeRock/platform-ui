/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import ApplicationModal from './index';

jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils');

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

  it('renders decorative images with empty alt text', () => {
    getApplicationLogo.mockReturnValue('testlogo');
    getApplicationDisplayName.mockReturnValue('common.application');

    const mountedWrapper = mount(ApplicationModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
        stubs: {
          BModal: {
            template: '<div><slot name="modal-header" /><slot /></div>',
          },
          FrGlossaryDisplayForm: true,
        },
      },
      props: {
        application: {
          id: 'test',
          name: 'My App',
          applicationOwners: [
            {
              givenName: 'First',
              sn: 'Last',
              userName: 'first.last',
            },
          ],
        },
      },
    });

    const images = mountedWrapper.findAll('img');
    expect(images.length).toBe(2);
    images.forEach((img) => {
      expect(img.attributes('alt')).toBe('');
    });
  });
});

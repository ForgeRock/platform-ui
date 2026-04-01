/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import Who from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('Who View', () => {
  let wrapper;

  CommonsApi.getResource.mockReturnValue(Promise.resolve({
    data: {
      result: [
        {
          name: 'role1',
          id: 'role1',
        },
        {
          name: 'role2',
          id: 'role2',
        },
      ],
    },
  }));

  beforeEach(() => {
    wrapper = mount(Who, {
      global: {
        mocks: {
          $t: (text) => (text),
          $store: {
            state: {
              SharedStore: {
                uiConfig: {},
              },
            },
          },
        },
      },
      props: {
        value: {
          defaultCertifier: '',
          defaultCertifierInfo: {},
          enableDefaultCertifier: true,
          certRole: 'role1',
          certType: 'governance.editTemplate.role',
          certUser: '',
          certUserInfo: {},
          certifierPath: '',
        },
        grantFilterProperties: {
          user: [
            {
              key: 'postalAddress',
              name: 'postalAddress',
              displayName: 'Address 1',
              description: 'Address 1',
              type: 'string',
              isMultiValue: false,
            },
            {
              key: 'custom_attribute',
              name: 'attribute',
              displayName: 'Attribute 1',
              description: 'Attribute 1',
              type: 'string',
              isMultiValue: false,
            },
          ],
        },
      },
    });
  });

  it('initializes form with values from value prop', () => {
    expect(findByTestId(wrapper, 'enable-default-certifier').attributes('value')).toBe('true');
  });
  it('should print the user selector when the certType is user', async () => {
    wrapper.vm.formFields.certType = 'user';
    await flushPromises();
    expect(findByTestId(wrapper, 'cert-type-user').exists()).toBeTruthy();
  });
  it('should print the new role when the certType is role', async () => {
    wrapper.vm.formFields.certType = 'role';
    await flushPromises();
    expect(findByTestId(wrapper, 'cert-type-role').exists()).toBeTruthy();
  });
  it('should have the correct schema options when certifier type is custom', async () => {
    wrapper.vm.formFields.certType = 'custom';
    await flushPromises();
    const certPath = wrapper.find('#certifierPath');
    const lis = certPath.findAll('li.multiselect__element');
    expect(lis).toHaveLength(2);
    expect(lis[0].text()).toContain('Attribute 1');
    expect(lis[1].text()).toContain('id');
  });
});

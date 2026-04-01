/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import DetailsForm from './index';
import i18n from '@/i18n';

mockValidation();

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('DetailsForm', () => {
  CommonsApi.getResource.mockReturnValue(Promise.resolve({ data: {} }));
  CertificationApi.getCertificationTemplates = jest.fn().mockReturnValue(Promise.resolve({
    data: {
      result: [{ name: 'testName1' }, { name: 'testName2' }, { name: 'testName3' }, { name: 'testName4' }],
    },
  }));

  function setup(props) {
    return mount(DetailsForm, {
      global: {
        plugins: [i18n],
      },
      props: {
        value: {
          description: 'test description',
          name: 'test name',
          owner: 'test owner',
          ownerInfo: {},
          stagingEnabled: true,
        },
        ...props,
      },
    });
  }

  it('initializes form with values from value prop', async () => {
    const searchTemplateNameSpy = jest.spyOn(CertificationApi, 'getCertificationTemplates');
    const wrapper = setup();
    await wrapper.vm.$nextTick();

    expect(findByTestId(wrapper, 'input-name').element.value).toBe('test name');
    expect(findByTestId(wrapper, 'description').element.value).toBe('test description');
    expect(findByTestId(wrapper, 'staging-enabled').attributes('value')).toBe('true');
    expect(searchTemplateNameSpy).toHaveBeenCalled();
  });

  it('hides the staging option when cert is event based', async () => {
    const wrapper = setup({ eventBased: true });
    await wrapper.vm.$nextTick();

    expect(findByTestId(wrapper, 'staging-enabled').exists()).toBeFalsy();
  });
});

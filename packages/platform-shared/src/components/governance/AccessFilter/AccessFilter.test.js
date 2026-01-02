/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';
import AccessFilter from './AccessFilter';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

const mockApplications = [
  {
    icon: 'google.svg',
    id: '1761d1fd-796d-490d-a986-f41ee09c03f5',
    name: 'GWS-ULife',
    templateName: 'google.workspace',
  },
  {
    description: 'Test',
    icon: 'microsoft.svg',
    id: '1fbe6672-780c-4226-af35-01a2546723c1',
    name: 'Microsoft Target',
    templateName: 'azure.ad',
  },
];

const mountComponent = (useQueryFilter = true) => mount(AccessFilter, {
  global: {
    plugins: [i18n],
  },
  props: {
    useQueryFilter,
  },
});

describe('Access Filter functionality', () => {
  CommonsApi.getResource.mockResolvedValue({ result: mockApplications });

  it('should emit never certified filter when checkbox clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const expectedQueries = {
      accountGrant: "!(item.decision.certification.decision co '')",
      all: "!(item.decision.certification.decision co '')",
      entitlementGrant: "!(item.decision.certification.decision co '')",
      roleMembership: "!(item.decision.certification.decision co '')",
    };

    const neverCertified = wrapper.find('input[name="neverCertified"]');
    await neverCertified.setChecked();

    expect(wrapper.emitted('update-filter')[0]).toEqual([expectedQueries]);
  });

  it('should emit roleBased filter when checkbox clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const roleBased = wrapper.find('input[name="roleBased"]');
    await roleBased.setChecked();

    const emittedQueries = wrapper.emitted('update-filter')[0][0];
    expect(emittedQueries.accountGrant).toEqual("relationship.properties.grantTypes.grantType eq 'role'");
    expect(emittedQueries.roleMembership).not.toBeDefined();
  });

  it('should emit combined filters when multiple filters selected', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const expectedQueries = {
      accountGrant: "(!(item.decision.certification.decision co '')) and (relationship.properties.grantTypes.grantType eq 'role')",
      all: "(!(item.decision.certification.decision co '')) and (relationship.properties.grantTypes.grantType eq 'role')",
      entitlementGrant: "(!(item.decision.certification.decision co '')) and (relationship.properties.grantTypes.grantType eq 'role')",
      roleMembership: "!(item.decision.certification.decision co '')",
    };

    const neverCertified = wrapper.find('input[name="neverCertified"]');
    await neverCertified.setChecked();

    const roleBased = wrapper.find('input[name="roleBased"]');
    await roleBased.setChecked();

    expect(wrapper.emitted('update-filter')[1]).toEqual([expectedQueries]);
  });

  it('should generate target filters when useQueryFilter prop is false', async () => {
    const wrapper = mountComponent(false);
    await flushPromises();
    const allTargetFilter = {
      operand: [
        {
          operand: {
            targetName: 'item.decision.certification.decision',
            targetValue: null,
          },
          operator: 'EXISTS',
        },
      ],
      operator: 'NOT',
    };

    const neverCertified = wrapper.find('input[name="neverCertified"]');
    await neverCertified.setChecked();

    const emittedQueries = wrapper.emitted('update-filter')[0][0];
    expect(emittedQueries.all).toEqual(allTargetFilter);
  });

  it('should emit clear filter event when clear button is pressed', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const clearButton = wrapper.find('.btn-outline-primary');
    await clearButton.trigger('click');

    expect(wrapper.emitted('clear-filters')).toBeTruthy();
  });
});

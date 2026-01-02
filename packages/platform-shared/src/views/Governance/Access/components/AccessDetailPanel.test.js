/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import AccessDetailPanel from './AccessDetailPanel';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    enterprise: {
      AzureAD: {
        '3_3-azure-ad': { id: 'azure.ad', displayName: 'Microsoft Entra', image: 'microsoft.svg' },
      },
    },
  }),
}));

const exampleAccess = {
  account: {
    __NAME__: 'Barth@IGATestQA.onmicrosoft.com',
  },
  application: {
    icon: '',
    name: 'Microsoft Target',
    templateName: 'azure.ad',
    templateVersion: '3.3',
  },
  descriptor: {
    idx: {
      '/entitlement': {
        displayName: '({Marketing)}',
      },
      '/account': {
        displayName: 'Barth@IGATestQA.onmicrosoft.com',
      },
    },
  },
  entitlement: {
    __NAME__: '({Marketing)}',
  },
  item: {
    decision: {
      certification: {
        campaignId: '1f7e7786-25b6-4e62-a5ea-e79fab6cf162',
        targetId: '7bd138ddb7c34f40124ef0de0212050b8546b85da3bac1d894a33cc8cbdd2e03b5c4e14702295a56e5dbc22df9fc2d7c9d43d9872638480594aca21cbdcd35a3',
        status: 'signed-off',
        decision: 'certify',
        decisionDate: '2025-10-02T19:50:29+00:00',
        decisionBy: {
          givenName: 'John',
          id: 'managed/user/b08acf25-178e-457f-8014-e6df2adeab13',
          mail: 'qatestautomation627@gmail.com',
          sn: 'Smith',
          userName: 'jsmith',
        },
        completionDate: '2025-10-02T19:50:49+00:00',
        completedBy: {
          givenName: 'John',
          id: 'managed/user/b08acf25-178e-457f-8014-e6df2adeab13',
          mail: 'qatestautomation627@gmail.com',
          sn: 'Smith',
          userName: 'jsmith',
        },
      },
    },
    type: 'entitlementGrant',
    objectType: '__GROUP__',
  },
  metadata: {
    modifiedDate: '2025-11-03T22:44:29.411Z',
    createdDate: '2025-09-24T13:39:45.71376591Z',
  },
};

async function mountComponent(accessGrant = exampleAccess) {
  const wrapper = mount(AccessDetailPanel, {
    global: {
      plugins: [i18n],
    },
    props: {
      access: accessGrant,
    },
  });
  await flushPromises();
  return wrapper;
}

describe('AccessDetailPanel', () => {
  it('displays certification details when provided', async () => {
    const wrapper = await mountComponent();
    const certificationDetails = wrapper.find('.border-top');
    const header = certificationDetails.find('h3');
    expect(header.text()).toBe('Certification Details');

    expect(certificationDetails.text()).toContain('John Smith');
    expect(certificationDetails.text()).toContain('jsmith');

    const badge = certificationDetails.find('.badge');
    expect(badge.text()).toBe('Certify');
  });

  it('emits close event when close button is clicked', async () => {
    const wrapper = await mountComponent();

    const closeButton = wrapper.find('[id="btnCloseDetails"]');
    await closeButton.trigger('click');
    expect(wrapper.emitted('close-panel')).toBeTruthy();
  });

  it('displays no certification details message when not present', async () => {
    const accessWithoutDecision = {
      ...exampleAccess,
      item: {
        ...exampleAccess.item,
        decision: undefined,
      },
    };
    const wrapper = await mountComponent(accessWithoutDecision);
    const certificationDetails = wrapper.find('.border-top');
    const header = certificationDetails.find('h3');
    expect(header.text()).toBe('Certification Details');

    expect(certificationDetails.text()).toContain('This access has not been previously certified');
    const badge = certificationDetails.find('.badge');
    expect(badge.exists()).toBe(false);
  });
});

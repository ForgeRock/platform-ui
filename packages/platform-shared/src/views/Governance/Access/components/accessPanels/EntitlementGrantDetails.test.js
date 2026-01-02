/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import EntitlementGrantDetails from './EntitlementGrantDetails';

jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

const exampleEntitlementGrant = {
  entitlement: {
    __NAME__: 'Marketing',
  },
  application: {
    connectorId: 'MicrosoftTarget',
    name: 'Microsoft Target',
    templateName: 'azure.ad',
    templateVersion: '3.3',
  },
  descriptor: {
    idx: {
      '/entitlement': {
        displayName: 'Marketing',
      },
    },
  },
  item: {
    decision: {
      accessRequest: {
        grantEndDate: '2025-01-23T15:21:29Z',
      },
    },
    type: 'entitlementGrant',
  },
};

const predictionEntitlementGrant = {
  ...exampleEntitlementGrant,
  prediction: {
    usr_id: '02_ID_fa51cc88-905e-40eb-ae04-2c7173b8e5a5',
    ent_id: '06_ENT_ID_system_ShowcaseSAP___GROUP___WEB_user_Sub-Division Consumption and analysis_II_7HQ',
    confidence: 1,
    confidenceIcon: 'thumb_up_off_alt',
    confidenceIconColor: 'green',
    confidenceLevel: 'HIGH',
    confidencePercentage: 100,
    rule: [
      {
        displayName: 'JOB_DESCRIPTION',
        value: 'InfoSYS Power Gen',
      },
      {
        displayName: 'CHIEF_YES_NO',
        value: 'Yes',
      },
    ],
  },
};

const mountComponent = (accessGrant = exampleEntitlementGrant) => mount(EntitlementGrantDetails, {
  global: {
    plugins: [i18n],
  },
  props: {
    access: accessGrant,
  },
});

describe('Entitlement Grant Details', () => {
  it('should display correct entitlement details', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const imgElement = wrapper.find('img[src="app_logo.png"]');
    expect(imgElement.exists()).toBe(true);

    const appName = wrapper.find('h4');
    expect(appName.text()).toBe('Microsoft Target');

    const entitlementName = wrapper.find('h3');
    expect(entitlementName.text()).toBe('Marketing');

    const grantDates = wrapper.findAll('.mb-4');
    expect(grantDates[0].text()).toBe('Access Start Date --');
    expect(grantDates[1].text()).toBe('Access End Date Jan 23, 2025');
  });

  it('should display prediction details when present', async () => {
    const wrapper = mountComponent(predictionEntitlementGrant);
    await flushPromises();

    const recommendationText = wrapper.findAll('small')[2];
    expect(recommendationText.exists()).toBe(true);
    expect(recommendationText.text()).toContain('Access Recommendation');
  });
});

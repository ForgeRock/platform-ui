/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount } from '@vue/test-utils';
import ActivateCampaignModal from './index';

describe('ActivateCampaignModal Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(ActivateCampaignModal, {
      global: {
        mocks: {
          $t: (text) => text,
        },
      },
    });
  });

  it('emit activate-campaign event on call activateCampaign method', () => {
    wrapper.vm.activateCampaign();

    const event = wrapper.emitted()['activate-campaign'];
    expect(event).toBeTruthy();
    expect(event.length).toBe(1);
    expect(event[0][0]).toBeUndefined();
  });
});

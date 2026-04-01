/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount } from '@vue/test-utils';
import DeleteCampaignModal from './index';

describe('DeleteCampaignModal Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(DeleteCampaignModal, {
      global: {
        mocks: {
          $t: (text) => text,
        },
      },
    });
  });

  it('emit delete-campaign event on call deleteCampaign method', () => {
    wrapper.vm.deleteCampaign();

    const event = wrapper.emitted()['delete-campaign'];
    expect(event).toBeTruthy();
    expect(event.length).toBe(1);
    expect(event[0][0]).toBeUndefined();
  });
});

/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { shallowMount } from '@vue/test-utils';
import CancelCampaignModal from './index';

describe('CancelCampaignModalModal Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(CancelCampaignModal, {
      global: {
        mocks: {
          $t: (text) => text,
        },
      },
    });
  });

  it('emit cancel-campaign event on save', () => {
    wrapper.vm.save();

    const event = wrapper.emitted()['cancel-campaign'];
    expect(event).toBeTruthy();
    expect(event.length).toBe(1);
    expect(event[0][0]).toBeUndefined();
  });
});

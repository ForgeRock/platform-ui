/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import FrUserBasicInfo from '@forgerock/platform-shared/src/components/UserGroupList/UserBasicInfo';
import CampaignDetailsModal from './CampaignDetailsModal';
import i18n from '@/i18n';

describe('CampaignDetailsModal.vue', () => {
  const campaignMock = {
    ownerInfo: { name: 'John Doe' },
    stageDuration: 7,
    description: 'Test campaign description',
  };

  function mountComponent(props = {}) {
    return mount(CampaignDetailsModal, {
      props: {
        campaign: campaignMock,
        isTesting: true,
        ...props,
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('renders the modal with correct title', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('#campaign-details-modal').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toBe('Campaign Details');
  });

  it('displays campaign owner info', () => {
    const wrapper = mountComponent();
    const userInfo = wrapper.findComponent(FrUserBasicInfo);
    expect(userInfo.exists()).toBe(true);
    expect(userInfo.props('user')).toEqual(campaignMock.ownerInfo);
  });

  it('displays campaign duration', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Duration');
    expect(wrapper.text()).toContain('1 week');
  });

  it('displays campaign description', () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain('Description');
    expect(wrapper.text()).toContain(campaignMock.description);
  });

  it('emits close event when modal is hidden', async () => {
    const wrapper = mountComponent();
    await wrapper.findComponent({ name: 'BModal' }).vm.$emit('hidden');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});

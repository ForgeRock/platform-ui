/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { createLocalVue, shallowMount } from '@vue/test-utils';
import AuthorizedApplications from '@/components/profile/AuthorizedApplications';
import i18n from '@/i18n';

const localVue = createLocalVue();

describe('AuthorizedApplications.vue', () => {
  beforeEach(() => {
    jest.spyOn(AuthorizedApplications, 'mounted')
      .mockImplementation(() => { });
  });

  it('Authorized Applications loads', () => {
    const wrapper = shallowMount(AuthorizedApplications, {
      localVue,
      i18n,
      stubs: {
        BListGroupItem: true,
        BModal: true,
        BButton: true,
      },
    });

    expect(wrapper.name()).toBe('AuthorizedApplications');
    expect(wrapper).toMatchSnapshot();
  });
});

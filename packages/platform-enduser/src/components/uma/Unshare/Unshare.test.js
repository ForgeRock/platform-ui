/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import Unshare from '@/components/uma/Unshare';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Unshare.vue', () => {
  let wrapper;
  const propsData = {
    resource: {
      _id: '12345',
      name: 'test resource',
      resourceOwnerId: 'alice',
      scopes: ['view', 'comment', 'download'],
      policy: {
        permissions: [{
          subject: 'bob',
          scopes: ['download'],
        }],
      },
    },
    newScopes: {},
    newShare: false,
  };

  beforeEach(() => {
    wrapper = shallowMount(Unshare, {
      localVue,
      i18n,
      propsData,
    });
  });

  afterEach(() => {
    wrapper = undefined;
  });

  it('Resources page loaded', () => {
    expect(wrapper.name()).toBe('Unshare');
    expect(wrapper).toMatchSnapshot();
  });

  it('Emits "unshareResource" event', () => {
    wrapper.vm.$refs.fsModal.hide = jest.fn();
    wrapper.vm.unshare('12345');

    localVue.nextTick(() => {
      expect(wrapper.emitted('unshareResource').length).toBe(1);
    });
  });
});

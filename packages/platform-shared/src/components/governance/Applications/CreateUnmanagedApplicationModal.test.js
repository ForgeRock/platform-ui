/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import CreateUnmanagedApplicationModal from './CreateUnmanagedApplicationModal';

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));

function setup(props = {}) {
  return shallowMount(CreateUnmanagedApplicationModal, {
    global: {
      mocks: { $t: (k) => k },
    },
    props: {
      isTesting: true,
      ...props,
    },
  });
}

describe('CreateUnmanagedApplicationModal', () => {
  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('renders a modal container', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.html()).toBeTruthy();
    });

    it('wraps content in a VeeForm', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.html()).toContain('form-stub');
    });
  });

  describe('@actions', () => {
    it('emits create with transformed ownerIds on save', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.model = {
        name: 'My App',
        description: 'Desc',
        ownerIds: [{ _ref: 'managed/alpha_user/user-1' }],
      };

      wrapper.vm.saveForm();
      expect(wrapper.emitted('create')).toBeTruthy();
      const payload = wrapper.emitted('create')[0][0];
      expect(payload.name).toBe('My App');
      expect(payload.ownerIds).toEqual(['user-1']);
    });

    it('emits create with empty ownerIds when none set', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.model = { name: 'App' };
      wrapper.vm.saveForm();

      const payload = wrapper.emitted('create')[0][0];
      expect(payload.ownerIds).toEqual([]);
    });

    it('resets model on initializeModal', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.model = { name: 'Stale' };
      wrapper.vm.initializeModal();
      expect(wrapper.vm.model).toEqual({});
    });

    it('updates model path on updateModel', async () => {
      const wrapper = setup();
      await flushPromises();

      wrapper.vm.updateModel({ path: 'name', value: 'Test App' });
      expect(wrapper.vm.model.name).toBe('Test App');
    });
  });
});

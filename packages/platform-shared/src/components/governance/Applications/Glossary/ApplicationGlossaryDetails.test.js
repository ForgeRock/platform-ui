/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as GlossaryApi from '@forgerock/platform-shared/src/api/governance/GlossaryApi';
import ApplicationGlossaryDetails from './ApplicationGlossaryDetails';

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));

jest.mock('@forgerock/platform-shared/src/api/governance/GlossaryApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
}));

const defaultProps = {
  appId: 'app-123',
  userResourceName: 'alpha_user',
  roleResourceName: 'alpha_role',
  orgResourceName: 'alpha_organization',
  isAuthoritative: false,
};

function setup(props = {}) {
  return mount(ApplicationGlossaryDetails, {
    global: {
      mocks: { $t: (k) => k },
      stubs: {
        FrApplicationGlossaryDetailsForm: {
          name: 'FrApplicationGlossaryDetailsForm',
          template: '<div />',
          props: ['glossarySchema', 'modelValue', 'userResourceName', 'roleResourceName', 'orgResourceName'],
        },
        FrSpinner: { name: 'FrSpinner', template: '<div />' },
      },
    },
    props: { ...defaultProps, ...props },
  });
}

describe('ApplicationGlossaryDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    GlossaryApi.searchGlossaryAttributes.mockResolvedValue({ data: { result: [] } });
    GlossaryApi.getGlossaryAttributesByAppId.mockResolvedValue({ data: {} });
  });

  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations after loading', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('shows spinner while loading', () => {
      GlossaryApi.searchGlossaryAttributes.mockReturnValue(new Promise(() => {}));
      const wrapper = setup();
      expect(wrapper.vm.showWheel).toBe(true);
    });

    it('hides spinner and shows form after data loads', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.showWheel).toBe(false);
    });

    it('filters requestable attribute when isAuthoritative is true', async () => {
      GlossaryApi.searchGlossaryAttributes.mockResolvedValue({
        data: { result: [{ name: 'requestable' }, { name: 'department' }] },
      });
      const wrapper = setup({ isAuthoritative: true });
      await flushPromises();
      expect(wrapper.vm.glossarySchema.find((s) => s.name === 'requestable')).toBeUndefined();
      expect(wrapper.vm.glossarySchema.find((s) => s.name === 'department')).toBeDefined();
    });

    it('includes requestable attribute when isAuthoritative is false', async () => {
      GlossaryApi.searchGlossaryAttributes.mockResolvedValue({
        data: { result: [{ name: 'requestable' }, { name: 'department' }] },
      });
      const wrapper = setup({ isAuthoritative: false });
      await flushPromises();
      expect(wrapper.vm.glossarySchema.find((s) => s.name === 'requestable')).toBeDefined();
    });
  });

  describe('@actions', () => {
    it('emits update:model after loading glossary values', async () => {
      GlossaryApi.getGlossaryAttributesByAppId.mockResolvedValue({ data: { dept: 'Engineering' } });
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.emitted('update:model')).toBeTruthy();
      expect(wrapper.emitted('update:model')[0][0]).toEqual({ dept: 'Engineering' });
    });

    it('emits update:glossaryCreateFlag when getGlossaryAttributesByAppId fails', async () => {
      GlossaryApi.getGlossaryAttributesByAppId.mockRejectedValue(new Error('not found'));
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.emitted('update:glossaryCreateFlag')).toBeTruthy();
      expect(wrapper.emitted('update:glossaryCreateFlag')[0][0]).toBe(true);
    });

    it('hides spinner even when outer searchGlossaryAttributes fails', async () => {
      GlossaryApi.searchGlossaryAttributes.mockRejectedValue(new Error('server error'));
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.findComponent({ name: 'FrSpinner' }).exists()).toBe(false);
    });
  });
});

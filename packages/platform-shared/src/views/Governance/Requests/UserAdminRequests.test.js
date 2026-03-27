/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import UserAdminRequests from './UserAdminRequests';

describe('UserAdminRequests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  function setup() {
    const wrapper = mount(UserAdminRequests, {
      attachTo: createAppContainer(),
      global: {
        plugins: [i18n],
        stubs: {
          FrHeader: true,
          FrRequestsTab: true,
          FrNewRequestModal: true,
          BContainer: true,
          BRow: true,
          BCol: true,
        },
      },
    });

    return wrapper;
  }

  describe('UserAdminRequests', () => {
    it('should render the component', () => {
      const wrapper = setup();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.vm).toBeDefined();
    });
  });
});

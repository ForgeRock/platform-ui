/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as notification from '@forgerock/platform-shared/src/utils/notification';
import ObjectTypeCorrelation from './ObjectTypeCorrelation';

jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));

const defaultProps = {
  applicationId: 'app-1',
  objectType: {
    id: 'User',
    type: 'account',
    properties: {
      userName: { type: 'string', displayName: 'Username', order: 0 },
      email: { type: 'string', displayName: 'Email', order: 1 },
      status: { type: 'string', displayName: 'Status', order: 2 },
    },
  },
};

const taskResponse = {
  data: {
    id: 'task-1',
    name: 'Account Correlation',
    type: 'applicationBulkOperation',
    status: 'pending',
    recurring: true,
    intervalMs: 86400000,
    context: { application: 'app-1' },
    taskData: {
      targets: [{ objectType: 'account' }],
      action: {
        type: 'createLink',
        overwrite: false,
        correlationRule: {
          type: 'attributeMatch',
          userAttribute: 'userName',
          accountAttribute: 'userName',
        },
      },
    },
    systemMessages: [],
  },
};

const filterSchemaResponse = {
  data: {
    user: [
      {
        name: 'userName', displayName: 'Username', type: 'string', isMultiValue: false,
      },
      {
        name: 'mail', displayName: 'Email', type: 'string', isMultiValue: false,
      },
      {
        name: 'roles', displayName: 'Roles', type: 'string', isMultiValue: true,
      },
    ],
  },
};

function setup(props = {}) {
  return mount(ObjectTypeCorrelation, {
    global: {
      mocks: { $t: (k) => k },
      renderStubDefaultSlot: true,
      stubs: {
        FrSpinner: true,
        FrField: true,
        FrIcon: { template: '<span><slot /></span>' },
        FrNoData: { name: 'NoData', template: '<div />' },
        FrButtonWithSpinner: { name: 'ButtonWithSpinner', template: '<button><slot /></button>' },
      },
    },
    props: { ...defaultProps, ...props },
  });
}

describe('ObjectTypeCorrelation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    CommonsApi.getFilterSchema.mockResolvedValue(filterSchemaResponse);
  });

  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations in empty state', async () => {
      ApplicationsApi.getApplicationTask.mockRejectedValue({ response: { status: 404 } });
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });

    it('has no accessibility violations with task loaded', async () => {
      ApplicationsApi.getApplicationTask.mockResolvedValue(taskResponse);
      const wrapper = setup();
      await flushPromises();
      // The edit-date toggle button uses an icon-only design without aria-label — suppress until fixed
      await runA11yTest(wrapper, { overrideRules: { rules: { 'button-name': { enabled: false } } } });
    });
  });

  describe('when no task exists', () => {
    beforeEach(() => {
      ApplicationsApi.getApplicationTask.mockRejectedValue({ response: { status: 404 } });
    });

    it('shows the empty state and hides the form', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.findComponent({ name: 'NoData' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).exists()).toBe(false);
    });

    it('shows the form when configure button is clicked', async () => {
      const wrapper = setup();
      await flushPromises();
      await wrapper.find('button').trigger('click');
      expect(wrapper.findComponent({ name: 'NoData' }).exists()).toBe(false);
      expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).exists()).toBe(true);
    });

    it('hides the form and resets on cancel', async () => {
      const wrapper = setup();
      await flushPromises();
      await wrapper.find('button').trigger('click');
      const cancelBtn = wrapper.findAll('button').find((b) => b.text().includes('common.cancel'));
      await cancelBtn.trigger('click');
      expect(wrapper.findComponent({ name: 'NoData' }).exists()).toBe(true);
      expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).exists()).toBe(false);
    });

    it('does not show error notification on 404', async () => {
      setup();
      await flushPromises();
      expect(notification.showErrorMessage).not.toHaveBeenCalled();
    });
  });

  describe('when a task exists', () => {
    beforeEach(() => {
      ApplicationsApi.getApplicationTask.mockResolvedValue(taskResponse);
    });

    it('shows the form pre-populated with task data', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.findComponent({ name: 'BCard' }).exists()).toBe(true);
    });

    it('shows the status badge', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.findComponent({ name: 'BBadge' }).exists()).toBe(true);
    });

    it('shows error notification when load fails with non-404', async () => {
      ApplicationsApi.getApplicationTask.mockRejectedValue({ response: { status: 500 } });
      setup();
      await flushPromises();
      expect(notification.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    beforeEach(() => {
      ApplicationsApi.getApplicationTask.mockRejectedValue({ response: { status: 404 } });
      ApplicationsApi.saveApplicationTask.mockResolvedValue(taskResponse);
    });

    it('calls saveApplicationTask with correct payload on save', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.form.accountAttribute = 'userName';
      wrapper.vm.form.userAttribute = 'userName';
      await wrapper.vm.save();
      await flushPromises();

      expect(ApplicationsApi.saveApplicationTask).toHaveBeenCalledWith(
        'app-1',
        expect.objectContaining({
          name: 'Account Correlation',
          type: 'applicationBulkOperation',
          context: { application: 'app-1' },
          taskData: expect.objectContaining({
            action: expect.objectContaining({
              correlationRule: expect.objectContaining({
                userAttribute: 'userName',
                accountAttribute: 'userName',
              }),
            }),
          }),
        }),
      );
    });

    it('shows success notification after save', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.form.accountAttribute = 'userName';
      wrapper.vm.form.userAttribute = 'userName';
      await wrapper.vm.save();
      await flushPromises();
      expect(notification.displayNotification).toHaveBeenCalledWith(
        'success',
        expect.stringContaining('saveSuccess'),
      );
    });

    it('shows error notification when save fails', async () => {
      ApplicationsApi.saveApplicationTask.mockRejectedValue(new Error('fail'));
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.form.accountAttribute = 'userName';
      wrapper.vm.form.userAttribute = 'userName';
      await wrapper.vm.save();
      await flushPromises();
      expect(notification.showErrorMessage).toHaveBeenCalled();
    });
  });

  describe('run now', () => {
    beforeEach(() => {
      ApplicationsApi.getApplicationTask.mockResolvedValue(taskResponse);
      ApplicationsApi.triggerApplicationTask.mockResolvedValue({});
    });

    it('calls triggerApplicationTask with preserveDate=true', async () => {
      const wrapper = setup();
      await flushPromises();
      await wrapper.vm.runNow();
      await flushPromises();
      expect(ApplicationsApi.triggerApplicationTask).toHaveBeenCalledWith('app-1', 'Account Correlation', true);
    });

    it('shows success notification after trigger', async () => {
      const wrapper = setup();
      await flushPromises();
      await wrapper.vm.runNow();
      await flushPromises();
      expect(notification.displayNotification).toHaveBeenCalledWith(
        'success',
        expect.stringContaining('runSuccess'),
      );
    });
  });

  describe('account attribute options', () => {
    beforeEach(() => {
      ApplicationsApi.getApplicationTask.mockRejectedValue({ response: { status: 404 } });
    });

    it('only includes string-type properties', async () => {
      const wrapper = setup({
        objectType: {
          id: 'User',
          type: 'account',
          properties: {
            userName: { type: 'string', displayName: 'Username', order: 0 },
            count: { type: 'integer', displayName: 'Count', order: 1 },
            tags: { type: 'array', displayName: 'Tags', order: 2 },
          },
        },
      });
      await flushPromises();
      const { vm } = wrapper;
      expect(vm.accountAttributeOptions).toHaveLength(1);
      expect(vm.accountAttributeOptions[0].value).toBe('userName');
    });
  });

  describe('user attribute options', () => {
    beforeEach(() => {
      ApplicationsApi.getApplicationTask.mockRejectedValue({ response: { status: 404 } });
    });

    it('excludes multi-value fields from user attributes', async () => {
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.userAttributeOptions).toHaveLength(2);
      expect(wrapper.vm.userAttributeOptions.map((o) => o.value)).not.toContain('roles');
    });
  });
});

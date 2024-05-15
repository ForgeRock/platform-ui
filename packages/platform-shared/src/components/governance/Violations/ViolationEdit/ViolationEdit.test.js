/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as ViolationApi from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
import ViolationEdit from './ViolationEdit';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/ViolationApi');
jest.mock('@forgerock/platform-shared/src/composables/bvModal');
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { violationId: '1' } })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

ValidationRules.extendRules({
  required: ValidationRules.getRules(i18n).required,
});

const violation = {
  decision: {
    status: 'testStatus',
    startDate: '2024-05-08T16:33:22+00:00',
    comments: [
      {
        action: 'assignment',
        comment: 'testAssignment',
        timeStamp: '2024-05-08T16:33:24+00:00',
      },
      {
        action: 'reasign',
        comment: 'testReassign',
        timeStamp: '2024-05-08T16:33:24+00:00',
      },
      {
        action: 'allow',
        comment: 'testAllow',
        timeStamp: '2024-05-08T16:33:24+00:00',
      },
    ],
    phases: [
      {
        name: 'testPhase',
      },
    ],
  },
  user: {
    userName: 'testUsername',
    givenName: 'testGivenName',
    sn: 'testSn',
  },
  policyRule: {
    name: 'ruleName',
    description: 'ruleDescription',
    policyRuleOwner: {
      userName: 'ruleUsername',
      givenName: 'ruleGivenName',
      sn: 'ruleSn',
    },
    riskScore: '1',
    mitigatingControl: 'testMitigating',
    documentationUrl: 'documentationUrl',
    correctionAdvice: 'testCorrectionAdvice',
  },
};

describe('Violation Edit', () => {
  const defaultProps = {
    breadcrumbPath: '/back',
    breadcrumbTitle: 'back',
    isException: false,
    isTesting: true,
    isAdmin: true,
  };
  function mountComponent(props = {}) {
    const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
    useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });
    setupTestPinia();

    const wrapper = mount(ViolationEdit, {
      global: {
        plugins: [i18n],
        mocks: {
          $bvModal: {
            show: jest.fn(),
            hide: jest.fn(),
          },
        },
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
    return wrapper;
  }

  ViolationApi.getViolation = jest.fn().mockReturnValue(Promise.resolve({
    data: violation,
  }));
  ViolationApi.forwardViolation = jest.fn().mockReturnValue(Promise.resolve({
    data: violation,
  }));
  CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({ data: {} }));

  it('gets violation based on id from route parameter', async () => {
    const getViolationSpy = jest.spyOn(ViolationApi, 'getViolation');
    mountComponent();
    await flushPromises();

    expect(getViolationSpy).toHaveBeenCalledWith('1');
  });

  it('has three tabs: details, activity, and comments', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs[0].text()).toBe('Details');
    expect(tabs[1].text()).toBe('Activity');
    expect(tabs[2].text()).toBe('Comments');
  });

  it('should not hide the actions if it is an violation', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.vm.hideActions).toBe(false);
  });

  it('should hide the actions if it is an exception', async () => {
    const wrapper = mountComponent({ isException: true });
    await flushPromises();

    expect(wrapper.vm.hideActions).toBe(true);
  });

  it('opens forward modal', async () => {
    const wrapper = mountComponent();
    const forwardModalSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await flushPromises();

    const forwardButton = wrapper.find('button');
    await forwardButton.trigger('click');

    expect(forwardModalSpy).toHaveBeenCalledWith('violation-forward-modal');
  });

  it('calls to forward a violation', async () => {
    const wrapper = mountComponent();
    const forwardSpy = jest.spyOn(ViolationApi, 'forwardViolation');
    await flushPromises();

    const forwardModal = wrapper.findComponent('#violation-forward-modal___BV_modal_outer_');
    forwardModal.vm.$emit('forward-item', { actorId: 'testId', forwardComment: 'testComment' });
    await flushPromises();
    expect(forwardSpy).toHaveBeenCalledWith('1', 'testPhase', 'testId', {
      allow: false, comment: false, exception: false, reassign: false, remediate: false,
    },
    'testComment');
  });

  it('should show allow and revoke buttons when is not admin', async () => {
    const wrapper = mountComponent({
      isAdmin: false,
    });
    await flushPromises();

    const buttons = wrapper.findAll('button');

    expect(buttons[0].text()).toBe('checkAllow');
    expect(buttons[1].text()).toBe('blockRevoke');
    expect(buttons[2].text()).toBe('redoForward');
  });

  it('should not show allow and revoke buttons when is admin', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const buttons = wrapper.findAll('button');

    expect(buttons[0].text()).toBe('redoForward');
  });

  it('opens conflict modal if is admin', async () => {
    const wrapper = mountComponent();
    const forwardModalSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await flushPromises();

    wrapper.vm.openConflictModal();

    expect(forwardModalSpy).toHaveBeenCalledWith('violation-conflicts-modal');
  });

  it('emits view-conflicts event if is not admin', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();

    wrapper.vm.openConflictModal();

    expect(wrapper.emitted('view-conflicts')).toBeTruthy();
  });

  it('should allow exception and navigate to violations list when the allow exception modal emits action event', async () => {
    ViolationApi.allowException = jest.fn().mockImplementation(() => Promise.resolve());
    const displayNotificationSpy = jest.spyOn(Notification, 'displayNotification').mockImplementation(() => {});

    const wrapper = mountComponent();
    await flushPromises();
    const routerSpy = jest.spyOn(wrapper.vm.router, 'push').mockImplementation(() => {});

    const exceptionModal = wrapper.findComponent({ name: 'ExceptionModal' });
    exceptionModal.vm.$emit('action', 'allow');
    await flushPromises();

    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully allowed');
    expect(routerSpy).toHaveBeenCalledWith({ path: '/back' });
  });

  it('should show error message when the allow exception api call fails', async () => {
    const error = new Error('ERROR');
    ViolationApi.allowException = jest.fn().mockImplementation(() => Promise.reject(error));
    const showErrorMessageSpy = jest.spyOn(Notification, 'showErrorMessage').mockImplementation(() => {});

    const wrapper = mountComponent();
    await flushPromises();
    const routerSpy = jest.spyOn(wrapper.vm.router, 'push').mockImplementation(() => {});

    const exceptionModal = wrapper.findComponent({ name: 'ExceptionModal' });
    exceptionModal.vm.$emit('action', 'allow');
    await flushPromises();

    expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'There was an error allowing the exception');
    expect(routerSpy).not.toHaveBeenCalled();
  });
});

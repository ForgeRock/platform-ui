/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as ViolationApi from '@forgerock/platform-shared/src/api/governance/ViolationApi';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import * as Notification from '@forgerock/platform-shared/src/utils/notification';
import ViolationEdit from './ViolationEdit';
import i18n from '@/i18n';
import ViolationDetails from './ViolationDetails';
import * as store from '@/store';

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');
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
  ManagedResourceApi.getManagedResourceList.mockReturnValue(Promise.resolve({ data: {} }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    store.default.replaceState({
      violationsCount: 1,
    });
    const storeSpy = jest.spyOn(store.default, 'commit').mockImplementation();
    await flushPromises();

    const forwardModal = wrapper.findComponent('#violation-forward-modal___BV_modal_outer_');
    forwardModal.vm.$emit('forward-item', { actorId: 'testId', comment: 'testComment' });
    await flushPromises();
    expect(forwardSpy).toHaveBeenCalledWith('1', 'testPhase', 'testId', {
      allow: false, comment: false, exception: false, reassign: false, remediate: false,
    },
    'testComment');
    expect(storeSpy).toHaveBeenCalledWith('setViolationsCount', 0);
  });

  it('opens conflict modal if is admin', async () => {
    const wrapper = mountComponent();
    const forwardModalSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await flushPromises();

    wrapper.vm.openConflictModal();

    expect(forwardModalSpy).toHaveBeenCalledWith('violation-conflicts-modal');
  });

  it('emits view-conflicts event if is not admin and actions are not hidden', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();

    wrapper.vm.openConflictModal();

    expect(wrapper.emitted('view-conflicts')).toBeTruthy();
  });

  it('should allow exception forever and navigate to violations list when the allow exception modal emits action event', async () => {
    ViolationApi.allowException = jest.fn().mockImplementation(() => Promise.resolve());
    const displayNotificationSpy = jest.spyOn(Notification, 'displayNotification').mockImplementation(() => {});
    store.default.replaceState({
      violationsCount: 1,
    });
    const storeSpy = jest.spyOn(store.default, 'commit').mockImplementation();

    const wrapper = mountComponent();
    await flushPromises();
    const routerSpy = jest.spyOn(wrapper.vm.router, 'push').mockImplementation(() => {});

    const exceptionModal = wrapper.findComponent({ name: 'ExceptionModal' });
    exceptionModal.vm.$emit('action', {
      violationId: '002bd665-3946-465c-b444-de470fa04254',
      phaseId: 'testPhase',
      payload: {
        exceptionExpirationDate: null,
        comment: '',
      },
    });
    await flushPromises();

    expect(ViolationApi.allowException).toHaveBeenCalledWith('002bd665-3946-465c-b444-de470fa04254', 'testPhase', {
      exceptionExpirationDate: null,
      comment: '',
    });
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully allowed');
    expect(routerSpy).toHaveBeenCalledWith({ path: '/back' });
    expect(storeSpy).toHaveBeenCalledWith('setViolationsCount', 0);
  });

  it('should allow exception and navigate to violations list when the allow exception modal emits action event and not to update the violations count on the store', async () => {
    ViolationApi.allowException = jest.fn().mockImplementation(() => Promise.resolve());
    const displayNotificationSpy = jest.spyOn(Notification, 'displayNotification').mockImplementation(() => {});
    const storeSpy = jest.spyOn(store.default, 'commit').mockImplementation();

    const wrapper = mountComponent();
    await flushPromises();
    const routerSpy = jest.spyOn(wrapper.vm.router, 'push').mockImplementation(() => {});

    const exceptionModal = wrapper.findComponent({ name: 'ExceptionModal' });
    exceptionModal.vm.$emit('action', {
      violationId: '002bd665-3946-465c-b444-de470fa04254',
      phaseId: 'testPhase',
      payload: {
        exceptionExpirationDate: '2024-06-18',
        comment: 'test',
      },
    });
    await flushPromises();

    expect(ViolationApi.allowException).toHaveBeenCalledWith('002bd665-3946-465c-b444-de470fa04254', 'testPhase', {
      exceptionExpirationDate: '2024-06-18',
      comment: 'test',
    });
    expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'Exception successfully allowed');
    expect(routerSpy).toHaveBeenCalledWith({ path: '/back' });
    expect(storeSpy).not.toHaveBeenCalledWith('setViolationsCount', 0);
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

  it('emits revoke-violation event when is not admin and click on revoke button', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();

    const revokeButton = wrapper.findAll('button')[1];
    await revokeButton.trigger('click');

    expect(wrapper.emitted('revoke-violation')).toBeTruthy();
    expect(wrapper.emitted('revoke-violation')[0][0]).toEqual(violation);
  });

  it('emits revoke-violation event when violation details component emmit the view-conflicts event and it is not admin', async () => {
    const wrapper = mountComponent({ isAdmin: false });
    await flushPromises();

    const violationDetailsComponent = wrapper.findComponent(ViolationDetails);
    violationDetailsComponent.vm.$emit('view-conflicts', violation);
    await flushPromises();

    expect(wrapper.emitted('revoke-violation')).toBeTruthy();
    expect(wrapper.emitted('revoke-violation')[0][0]).toEqual(violation);
  });

  describe('actions', () => {
    it('violations should have forward button in admin view', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const buttons = wrapper.findAll('button');

      expect(buttons[0].text()).toBe('redoForward');
    });

    it('exceptions should have forward button in admin view', async () => {
      const wrapper = mountComponent({ isException: true });
      await flushPromises();

      const buttons = wrapper.findAll('button');

      expect(buttons[0].text()).toBe('redoForward');
    });

    it('should show allow, revoke and forward buttons when is not admin', async () => {
      const wrapper = mountComponent({
        isAdmin: false,
      });
      await flushPromises();

      const buttons = wrapper.findAll('button');

      expect(buttons[0].text()).toBe('checkAllow');
      expect(buttons[1].text()).toBe('blockRevoke');
      expect(buttons[2].text()).toBe('redoForward');
    });

    it('should show extend exception, revoke, and forward buttons when is enduser exception', async () => {
      const wrapper = mountComponent({
        isAdmin: false,
        isEnduserException: true,
      });
      await flushPromises();

      const buttons = wrapper.findAll('button');

      expect(buttons[0].text()).toBe('updateExtend Exception');
      expect(buttons[1].text()).toBe('blockRevoke Exception');
      expect(buttons[2].text()).toBe('redoForward');
    });

    it('should hide actions when violation is complete for admin', async () => {
      const completeViolation = cloneDeep(violation);
      completeViolation.decision.status = 'complete';
      ViolationApi.getViolation = jest.fn().mockReturnValue(Promise.resolve({
        data: completeViolation,
      }));
      const wrapper = mountComponent();
      await flushPromises();

      const firstButton = wrapper.find('button');
      expect(firstButton.text()).toBe('View Conflicts');

      ViolationApi.getViolation = jest.fn().mockReturnValue(Promise.resolve({
        data: violation,
      }));
    });

    it('should hide actions when violation is complete when it is not admin', async () => {
      const completeViolation = cloneDeep(violation);
      completeViolation.decision.status = 'complete';
      ViolationApi.getViolation = jest.fn().mockReturnValue(Promise.resolve({
        data: completeViolation,
      }));
      const wrapper = mountComponent({ isAdmin: false });
      await flushPromises();

      const firstButton = wrapper.find('button');
      expect(firstButton.text()).toBe('View Conflicts');

      ViolationApi.getViolation = jest.fn().mockReturnValue(Promise.resolve({
        data: violation,
      }));
    });
  });
});

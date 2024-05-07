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
    violation: {
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
  function mountComponent() {
    const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
    useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });
    setupTestPinia();
    const props = {
      breadcrumbPath: '/back',
      breadcrumbTitle: 'back',
      isTesting: true,
    };
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
      props,
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

  it('opens forward modal', async () => {
    const wrapper = mountComponent();
    const forwardModalSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await flushPromises();

    const forwardButton = wrapper.find('button');
    await forwardButton.trigger('click');

    expect(forwardModalSpy).toHaveBeenCalledWith('violation-forward-modal');
  });

  it('calls to forwrad a violation', async () => {
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
});

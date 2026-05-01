/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import AdditionalOptions from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

mockValidation(['required', 'min_value']);

describe('AdditionalOptions View', () => {
  let wrapper;

  CommonsApi.getResource.mockReturnValue(Promise.resolve({ data: {} }));

  describe('initializes with default values', () => {
    beforeEach(() => {
      wrapper = mount(AdditionalOptions, {
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
        props: {
          value: {
            allowBulkCertify: false,
            allowExceptions: false,
            allowPartialSignoff: false,
            allowSelfCert: false,
            closeAction: 'revoke',
            closeActionDuration: 0,
            closeActionTime: '',
            enableForward: false,
            enableReassign: false,
            enableReassignmentDelegation: false,
            escalation: false,
            escalationAction: 'notification',
            escalationEmail: '',
            escalationFrequency: 7,
            escalationOwner: '',
            escalationOwnerInfo: {},
            escalateToSelector: 'role',
            expireOption: 2,
            reassignPermissions: {
              comment: false,
              makeDecision: false,
              reassign: false,
              signoff: false,
            },
            reassignUser: '',
            reassignUserInfo: {},
            exceptionDuration: 1,
            exceptionTimespan: 'governance.timespans.weeks',
            processRemediation: true,
            remediationDuration: 10,
            remediationTime: 'governance.timespans.immediately',
            remediationTimespan: 'governance.timespans.days',
            requireJustification: {
              revoke: true,
              exceptionAllowed: true,
            },
            selfCertFilter: 'governance.editTemplate.allCertifiers',
          },
        },
      });
    });

    it('allowing self certification shows self-cert-filter component', () => {
      findByTestId(wrapper, 'allow-self-cert').setChecked(true);
      expect(findByTestId(wrapper, 'allow-self-cert').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'self-cert-filter').exists()).toBeTruthy();
    });

    it('enabling reassignment delegation shows reassign and forward options', () => {
      findByTestId(wrapper, 'enable-reassignment-delegation').setChecked(true);
      expect(findByTestId(wrapper, 'enable-reassignment-delegation').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'enable-reassign').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'enable-forward').exists()).toBeTruthy();
    });

    it('allowing exceptions shows exception duration and timespan options', () => {
      findByTestId(wrapper, 'allow-exceptions').setChecked(true);
      expect(findByTestId(wrapper, 'allow-exceptions').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'input-exception-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'exception-timespan').exists()).toBeTruthy();
    });

    it('enabling process remediation shows remediation time option', async () => {
      findByTestId(wrapper, 'process-remediation').setChecked(true);
      expect(findByTestId(wrapper, 'process-remediation').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'remediation-time')).toBeTruthy();

      expect(findByTestId(wrapper, 'input-remediation-duration').exists()).toBeFalsy();
      expect(findByTestId(wrapper, 'remediation-timespan').exists()).toBeFalsy();
      findByTestId(wrapper, 'remediation-time')
        .findAll('li')[1]
        .find('span')
        .trigger('click');
      await flushPromises();
      expect(findByTestId(wrapper, 'input-remediation-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'remediation-timespan').exists()).toBeTruthy();
    });
  });

  describe('initializes with non default values', () => {
    beforeEach(() => {
      wrapper = mount(AdditionalOptions, {
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
        props: {
          value: {
            allowBulkCertify: true,
            allowExceptions: true,
            allowPartialSignoff: true,
            allowSelfCert: true,
            closeAction: 'revoke',
            closeActionDuration: 0,
            closeActionTime: '',
            enableForward: true,
            enableReassign: true,
            enableReassignmentDelegation: true,
            escalation: false,
            escalationAction: 'notification',
            escalationEmail: '',
            escalationFrequency: 7,
            escalationOwner: '',
            escalationOwnerInfo: {},
            escalateToSelector: 'role',
            expireOption: 2,
            reassignPermissions: {
              comment: false,
              makeDecision: false,
              reassign: false,
              signoff: false,
            },
            reassignUser: '',
            reassignUserInfo: {},
            exceptionDuration: 1,
            exceptionTimespan: 'governance.timespans.weeks',
            processRemediation: true,
            remediationDuration: 10,
            remediationTime: 'governance.timespans.afterADuration',
            remediationTimespan: 'governance.timespans.days',
            requireJustification: {
              revoke: true,
              exceptionAllowed: true,
            },
            selfCertFilter: 'governance.editTemplate.allCertifiers',
          },
        },
      });
    });

    it('initializes form with values from value prop', async () => {
      expect(findByTestId(wrapper, 'allow-bulk-certify').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'allow-self-cert').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'self-cert-filter').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'self-cert-filter').find('span').text()).toBe('All certifiers');
      expect(findByTestId(wrapper, 'enable-reassignment-delegation').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'enable-reassign').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'enable-reassign').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'enable-forward').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'enable-forward').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'allow-exceptions').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'input-exception-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-exception-duration').element.value).toBe('1');
      expect(findByTestId(wrapper, 'exception-timespan').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'exception-timespan').find('span').text()).toBe('week(s)');
      expect(findByTestId(wrapper, 'allow-partial-signoff').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'process-remediation').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'remediation-time').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'remediation-time').find('span').text()).toBe('after a duration');
      expect(findByTestId(wrapper, 'input-remediation-duration').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'input-remediation-duration').element.value).toBe('10');
      expect(findByTestId(wrapper, 'remediation-timespan').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'remediation-timespan').find('span').text()).toBe('day(s)');
    });
  });

  describe('escalation', () => {
    beforeEach(() => {
      wrapper = mount(AdditionalOptions, {
        global: {
          mocks: {
            $t: (text) => (text),
          },
        },
        props: {
          value: {
            allowBulkCertify: false,
            allowExceptions: false,
            allowPartialSignoff: false,
            allowSelfCert: false,
            closeAction: 'revoke',
            closeActionDuration: 0,
            closeActionTime: '',
            enableForward: false,
            enableReassign: false,
            enableReassignmentDelegation: false,
            escalation: false,
            escalationAction: 'notification',
            escalationEmail: '',
            escalationFrequency: 7,
            escalationOwner: '',
            escalationOwnerInfo: {},
            escalateToSelector: 'role',
            expireOption: 2,
            reassignPermissions: {
              comment: false,
              makeDecision: false,
              reassign: false,
              signoff: false,
            },
            reassignUser: '',
            reassignUserInfo: {},
            exceptionDuration: 1,
            exceptionTimespan: 'governance.timespans.weeks',
            processRemediation: false,
            requireJustification: { revoke: false, exceptionAllowed: false },
            selfCertFilter: 'governance.editTemplate.allCertifiers',
          },
        },
      });
    });

    it('enabling escalation shows escalation options', async () => {
      findByTestId(wrapper, 'escalation').setChecked(true);
      await flushPromises();
      expect(findByTestId(wrapper, 'escalation').attributes('value')).toBe('true');
      expect(findByTestId(wrapper, 'input-escalation-frequency').exists()).toBeTruthy();
      expect(findByTestId(wrapper, 'escalation-action').exists()).toBeTruthy();
    });

    it('handleUserInfo updates escalationOwnerInfo', () => {
      const userInfo = {
        givenName: 'Kristy',
        profileImage: undefined,
        sn: 'sn',
        userName: 'Kristy.Crawley@autoidzoran.onmicrosoft.com',
      };
      wrapper.vm.handleUserInfo(userInfo);
      expect(wrapper.vm.formFields.escalationOwnerInfo).toStrictEqual(userInfo);
    });
  });
});

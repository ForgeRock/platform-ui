/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import ViolationDetails from './ViolationDetails';
import i18n from '@/i18n';

describe('Violation Details', () => {
  const violation = {
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
    decision: {
      status: 'testStatus',
    },
  };
  function mountComponent(props) {
    const wrapper = mount(ViolationDetails, {
      global: {
        plugins: [i18n],
      },
      props: {
        violation,
        ...props,
      },
    });
    return wrapper;
  }

  it('should have sections for each detail', () => {
    const wrapper = mountComponent();

    const rows = wrapper.findAll('.col-lg-4');
    const rowNames = [
      'User',
      'Rule Name',
      'Rule Description',
      'Rule Owner',
      'Status',
      'Conflicts',
      'Risk Level',
      'Mitigating Control',
      'Control Url',
      'Correction Advice',
    ];

    rows.forEach((row, index) => {
      expect(row.text()).toMatch(rowNames[index]);
    });
  });

  it('should have violation details for each section', () => {
    const wrapper = mountComponent();

    const rows = wrapper.findAll('.col-lg-8');
    const expectedValues = [
      'testGivenName testSntestUsername',
      'ruleName',
      'ruleDescription',
      'ruleGivenName ruleSnruleUsername',
      '--',
      'View Conflicts',
      '1',
      'testMitigating',
      'documentationUrl',
      'testCorrectionAdvice',
    ];

    rows.forEach((row, index) => {
      expect(row.text()).toMatch(expectedValues[index]);
    });
  });

  describe('statuses', () => {
    it('displays exception allowed for allow', () => {
      const allow = cloneDeep(violation);
      allow.decision.status = 'complete';
      allow.decision.outcome = 'allow';

      const wrapper = mountComponent({ violation: allow });

      const status = wrapper.findAll('.col-lg-8').at(4);
      expect(status.text()).toBe('Exception Allowed');
    });

    it('displays resolved for remediate', () => {
      const remediate = cloneDeep(violation);
      remediate.decision.status = 'complete';
      remediate.decision.outcome = 'remediate';

      const wrapper = mountComponent({ violation: remediate });

      const status = wrapper.findAll('.col-lg-8').at(4);
      expect(status.text()).toBe('Resolved');
    });

    it('displays exception granted for exception', () => {
      const exception = cloneDeep(violation);
      exception.decision.status = 'exception';

      const wrapper = mountComponent({ violation: exception });

      const status = wrapper.findAll('.col-lg-8').at(4);
      expect(status.text()).toBe('Exception Granted');
    });

    it('displays pending for pending', () => {
      const pending = cloneDeep(violation);
      pending.decision.status = 'pending';

      const wrapper = mountComponent({ violation: pending });

      const status = wrapper.findAll('.col-lg-8').at(4);
      expect(status.text()).toBe('Pending');
    });

    it('displays in-progress for in-progress', () => {
      const inProgress = cloneDeep(violation);
      inProgress.decision.status = 'in-progress';

      const wrapper = mountComponent({ violation: inProgress });

      const status = wrapper.findAll('.col-lg-8').at(4);
      expect(status.text()).toBe('In-Progress');
    });
  });
});

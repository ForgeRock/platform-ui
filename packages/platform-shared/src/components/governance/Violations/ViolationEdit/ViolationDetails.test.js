/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
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
      violation: {
        status: 'testStatus',
      },
    },
  };
  function mountComponent() {
    const wrapper = mount(ViolationDetails, {
      global: {
        plugins: [i18n],
      },
      props: {
        violation,
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
      'testStatus',
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
});

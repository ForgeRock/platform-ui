/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import SODViolationMessage from './SODViolationMessage';
import i18n from '@/i18n';

describe('SODViolationMessage', () => {
  let wrapper;

  const props = {
    isTesting: true,
    sodError: [{
      name: 'ruleName',
      description: 'ruleDescription',
    }],
  };

  function setup() {
    return mount(SODViolationMessage, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  }

  it('shows an alert when there is an SOD error', () => {
    wrapper = setup();
    const alert = wrapper.find('[class=fr-alert]');
    expect(alert.find('[class=fr-alert]')).toBeTruthy();
    expect(alert.text()).toMatch('error_outline');
    expect(alert.text()).toMatch('Granting access to these entitlement(s) will result in a Segregation of Duties (SoD) violationView Details');
  });

  it('has a button to view details', () => {
    wrapper = setup();
    const viewDetailsBtn = wrapper.find('[type="button"]');
    expect(viewDetailsBtn.exists()).toBeTruthy();
    expect(viewDetailsBtn.text()).toBe('View Details');
  });

  it('has a modal with violation details', () => {
    wrapper = setup();
    const modalBody = wrapper.find('#sod-violation-modal___BV_modal_body_');
    expect(modalBody.find('h3').text()).toBe('ruleName');
    expect(modalBody.find('small').text()).toBe('ruleDescription');
  });
});

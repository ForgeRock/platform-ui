/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import ExceptionModal from './ExceptionModal';
import i18n from '@/i18n';

const { required } = ValidationRules.getRules(i18n);
ValidationRules.extendRules({ required });

describe('ExceptionModal', () => {
  let wrapper;

  const violation = {
    id: 'test-id',
    phaseId: 'phase-1',
    policyRule: {
      name: 'TEST Policy Rule',
      description: 'This is a test rule description.',
      violationLifecycle: {
        exception: {
          justificationCheck: true,
        },
      },
    },
    comments: [
      {
        action: 'exception',
        comment: 'Previous exception comment',
        user: {
          givenName: 'John',
          sn: 'Doe',
        },
      },
    ],
  };

  const mountComponent = (propsData) => (
    mount(ExceptionModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...propsData,
      },
    })
  );

  it('should render the component with violation details', () => {
    wrapper = mountComponent({ violation });

    expect(wrapper.find('h2.h5.rule-title').text()).toBe(violation.policyRule.name);
    expect(wrapper.find('.max-lines-3').text()).toBe(violation.policyRule.description);
  });

  it('should disable the submit button when form is invalid', async () => {
    wrapper = mountComponent({ violation });
    await flushPromises();

    const specifiedDateRadio = wrapper.find('input[value="specifiedDate"]');
    const okButton = wrapper.find('button.btn-primary');
    expect(wrapper.vm.timePeriod).toBe('forever');
    expect(okButton.attributes('disabled')).toBeUndefined();

    await specifiedDateRadio.setChecked();
    await flushPromises();

    expect(wrapper.vm.timePeriod).toBe('specifiedDate');
    expect(okButton.attributes('disabled')).toBeDefined();
  });

  it('should not validate the mandatory justification if justificationCheck is false', async () => {
    const noMandatoryJustificationTest = {
      policyRule: {
        violationLifecycle: {
          exception: {
            justificationCheck: false,
          },
        },
      },
    };
    wrapper = mountComponent({
      extendException: true,
      violation: noMandatoryJustificationTest,
    });
    await flushPromises();

    const specifiedDateRadio = wrapper.find('input[value="specifiedDate"]');
    const okButton = wrapper.find('button.btn-primary');
    expect(wrapper.vm.timePeriod).toBe('forever');
    expect(okButton.attributes('disabled')).toBeUndefined();

    await specifiedDateRadio.setChecked();
    await flushPromises();

    expect(wrapper.vm.timePeriod).toBe('specifiedDate');
    expect(okButton.attributes('disabled')).toBeUndefined();
  });
});

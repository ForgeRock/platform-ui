/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import UpdateResumeDateModal from './index';

const rules = ValidationRules.getRules(i18n);
ValidationRules.extendRules(rules);

describe('UpdateResumeDateModal Component', () => {
  let wrapper;

  function setup() {
    wrapper = mount(UpdateResumeDateModal, {
      global: {
        mocks: {
          $t: (text) => text,
        },
      },
      props: {
        isTesting: true,
        loading: false,
      },
    });
  }

  it('Should not be valid to set a resume date in the past', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2077-01-01'));
    ValidationRules.extendRules({ is_after_date: jest.fn().mockReturnValue(false) });
    setup();

    const resumeDate = wrapper.findComponent(UpdateResumeDateModal);
    resumeDate.vm.$emit('update-resume-date', '2023-01-01', 'justification');

    await flushPromises();
    jest.runAllTimers();

    const saveButton = wrapper.find('.btn.btn-primary');
    await saveButton.trigger('click');

    expect(saveButton.attributes('disabled')).toBeDefined();
    jest.useRealTimers();
  });

  it('Should not be valid to submit a resume date without the justification text', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));
    ValidationRules.extendRules({ is_after_date: jest.fn().mockReturnValue(false) });
    setup();

    const resumeDate = wrapper.findComponent(UpdateResumeDateModal);
    resumeDate.vm.$emit('update-resume-date', '2077-01-01');

    await flushPromises();
    jest.runAllTimers();

    const saveButton = wrapper.find('.btn.btn-primary');
    await saveButton.trigger('click');

    expect(saveButton.attributes('disabled')).toBeDefined();
    jest.useRealTimers();
  });

  it('Should send a new resume date on save if set a future date', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));
    ValidationRules.extendRules({ is_after_date: jest.fn().mockReturnValue(true) });
    setup();

    const resumeDate = wrapper.findComponent(UpdateResumeDateModal);
    resumeDate.vm.$emit('update-resume-date', '2033-01-01T00:00:00+00:00', 'justification');

    await flushPromises();
    jest.runAllTimers();

    const saveButton = wrapper.find('.btn.btn-primary');
    expect(saveButton.attributes().disabled).toBeFalsy();
    await saveButton.trigger('click');

    expect(wrapper.emitted('update-resume-date')).toStrictEqual([['2033-01-01T00:00:00+00:00', 'justification']]);
    jest.useRealTimers();
  });
});

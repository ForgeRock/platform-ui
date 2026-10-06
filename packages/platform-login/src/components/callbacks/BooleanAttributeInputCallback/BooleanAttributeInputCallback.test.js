/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import BooleanAttributeInputCallback from '@/components/callbacks/BooleanAttributeInputCallback';
import i18n, * as i18nModule from '@/i18n';

describe('BooleanAttributeInputCallback', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(BooleanAttributeInputCallback, {
      global: {
        plugins: [i18n],
      },
      props: {
        callback: {
          getInputValue: () => true,
          getPrompt: () => 'option',
          setInputValue: jest.fn(),
        },
        index: 5,
      },
    });
  });

  it('Sets name and value data', () => {
    expect(wrapper.vm.$data.name).toEqual('callback_5');
    expect(wrapper.vm.$data.value).toEqual(true);
  });

  it('Sets prompt on DOM', () => {
    expect(wrapper.find('label').text()).toEqual('option');
  });

  it('On toggle updates value', () => {
    wrapper.vm.onToggle();
    expect(wrapper.vm.$props.callback.setInputValue).toHaveBeenCalled();
  });
});

describe('BooleanAttributeInputCallback label resolution', () => {
  // Snapshot the real app instance at describe scope, before any test can
  // swap the module's `default` export: the default import `i18n` compiles
  // to a live read of the namespace's `default` slot, so referencing it
  // after a swap (e.g. `i18nModule.default = i18n`) would read back the mock
  // and make the afterEach restore a self-assignment no-op.
  const realI18n = i18n;

  function setupI18n(mockData) {
    // Swap the module's `default` export via its namespace object; a plain
    // `i18n.default = ...` on the default import would only set a property
    // on the instance object, not rebind the export other modules read.
    i18nModule.default = createI18n({
      silentFallbackWarn: true,
      silentTranslationWarn: true,
      ...mockData,
    });
  }

  const mountCallback = (callback) => mount(BooleanAttributeInputCallback, {
    global: {
      plugins: [i18nModule.default],
    },
    props: {
      callback,
      index: 0,
    },
  });

  afterEach(() => {
    // Restore the snapshotted real app instance. Must use the snapshot, not
    // the `i18n` binding: by afterEach time that binding reads the
    // already-swapped module slot.
    i18nModule.default = realI18n;
  });

  it('renders the localized attribute label for a non-English locale', () => {
    setupI18n({
      locale: 'de-DE',
      fallbackLocale: ['de', 'en'],
      messages: {
        'de-DE': { common: { policyValidationMessages: { attributes: { mail: 'E-Mail-Adresse' } } } },
        en: { common: { policyValidationMessages: { attributes: { mail: 'Email' } } } },
      },
    });

    const callback = {
      getInputValue: () => false,
      getName: () => 'mail',
      getPrompt: () => 'Email Address',
      setInputValue: jest.fn(),
    };
    const localizedWrapper = mountCallback(callback);

    expect(localizedWrapper.find('label').text()).toBe('E-Mail-Adresse');
  });

  it('renders the prompt for the English locale even when the en attributes map has an entry', () => {
    setupI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: { common: { policyValidationMessages: { attributes: { mail: 'Email' } } } },
      },
    });

    const callback = {
      getInputValue: () => false,
      getName: () => 'mail',
      getPrompt: () => 'Email Address',
      setInputValue: jest.fn(),
    };
    const localizedWrapper = mountCallback(callback);

    expect(localizedWrapper.find('label').text()).toBe('Email Address');
  });

  it('renders the prompt when no non-English locale in the chain has the attributes entry', () => {
    setupI18n({
      locale: 'de-DE',
      fallbackLocale: ['de', 'en'],
      messages: {
        'de-DE': {},
        en: { common: { policyValidationMessages: { attributes: { mail: 'Email' } } } },
      },
    });

    const callback = {
      getInputValue: () => false,
      getName: () => 'mail',
      getPrompt: () => 'Email Address',
      setInputValue: jest.fn(),
    };
    const localizedWrapper = mountCallback(callback);

    expect(localizedWrapper.find('label').text()).toBe('Email Address');
  });
});

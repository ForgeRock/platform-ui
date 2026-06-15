/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import ApplicationDetailsPanel from './ApplicationDetailsPanel';

jest.mock('vee-validate', () => ({
  useForm: jest.fn(() => ({
    meta: { invalid: false, pending: false },
    validate: jest.fn(),
  })),
}));

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));

function setup(props = {}) {
  return mount(ApplicationDetailsPanel, {
    attachTo: document.body,
    global: {
      mocks: { $t: (k) => k },
      stubs: {
        FormGenerator: {
          name: 'FormGenerator',
          template: '<div class="fr-form-generator-stub"><slot name="logo" /><slot name="application-owners" :property="{ model: \'ownerIds\' }" /></div>',
          props: ['schema', 'model'],
          emits: ['update:model'],
        },
        RelationshipEdit: { name: 'RelationshipEdit', template: '<div class="fr-relationship-edit-stub" />' },
        ApplicationGlossaryDetails: {
          name: 'ApplicationGlossaryDetails',
          template: '<div class="fr-application-glossary-details-stub" />',
        },
        ButtonWithSpinner: {
          name: 'ButtonWithSpinner',
          template: '<button class="btn btn-primary" aria-label="common.save" @mousedown.prevent="$emit(\'mousedown\', $event)" />',
        },
        BCard: { template: '<div><slot /><slot name="footer" /></div>' },
        BImg: true,
      },
    },
    props: {
      logoSource: 'test-logo.svg',
      schema: [],
      ...props,
    },
  });
}

describe('ApplicationDetailsPanel', () => {
  afterAll(() => jest.restoreAllMocks());

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });

  describe('@renders', () => {
    it('renders the form generator with translated schema', async () => {
      const schema = [[{ model: 'name', type: 'string' }]];
      const wrapper = setup({ schema });
      await flushPromises();
      expect(wrapper.html()).toContain('fr-form-generator-stub');
    });

    it('always renders glossary', async () => {
      const wrapper = setup({ appId: 'app-1' });
      await flushPromises();
      expect(wrapper.html()).toContain('fr-application-glossary-details-stub');
    });

    it('renders relationship edit when relationshipProperty is set', async () => {
      const wrapper = setup({
        relationshipProperty: { _id: 'rel-1', value: [] },
      });
      await flushPromises();
      expect(wrapper.html()).toContain('fr-relationship-edit-stub');
    });
  });

  describe('@actions', () => {
    it('emits save-app when save button clicked', async () => {
      const wrapper = setup();
      await flushPromises();
      await wrapper.find('button').trigger('mousedown');
      expect(wrapper.emitted('save-app')).toBeTruthy();
    });

    it('emits update:model when form generator updates', async () => {
      const wrapper = setup({ schema: [[{ model: 'name', type: 'string' }]] });
      await flushPromises();
      await wrapper.findComponent({ name: 'FormGenerator' }).vm.$emit('update:model', { path: 'name', value: 'Test' });
      expect(wrapper.emitted('update:model')).toBeTruthy();
    });

    it('translates schema labels using i18n paths', async () => {
      const schema = [[{ model: 'name', type: 'string', title: 'Name Title' }]];
      const wrapper = setup({ schema });
      await flushPromises();
      const fg = wrapper.findComponent({ name: 'FormGenerator' });
      const translatedSchema = fg.props('schema');
      expect(translatedSchema[0][0].label).toBe('Name Title');
    });

    it('falls back to last model segment when no title or translation', async () => {
      const schema = [[{ model: 'some.nested.field', type: 'string' }]];
      const wrapper = setup({ schema });
      await flushPromises();
      const fg = wrapper.findComponent({ name: 'FormGenerator' });
      const translatedSchema = fg.props('schema');
      expect(translatedSchema[0][0].label).toBe('field');
    });

    it('does not mutate original schema prop objects', async () => {
      const original = { model: 'name', type: 'string' };
      const schema = [[original]];
      setup({ schema });
      await flushPromises();
      expect(Object.keys(original)).not.toContain('label');
    });
  });
});

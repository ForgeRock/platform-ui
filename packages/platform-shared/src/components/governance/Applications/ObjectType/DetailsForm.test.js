/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as AgentConfigApi from '@forgerock/platform-shared/src/api/governance/AgentConfigApi';
import DetailsForm, { clearAgentConfig } from './DetailsForm';

jest.mock('@/i18n', () => ({
  // Mirrors the real i18n singleton: known keys return their value, missing
  // keys return the full key path — so agentTemplateLabel can detect an
  // untranslated template by comparing t(key) against the key (te() is
  // deliberately not used — it checks only the exact active locale and
  // ignores the fallback chain, so it returns false for every key when the
  // locale is en-US and messages are registered under en).
  // Only 'aws.bedrock' has a template locale entry here; unknown templates
  // exercise the Custom-label fallback.
  global: {
    t: (key) => ({
      'governance.agents.tabs.aws-bedrock': 'aws-bedrock',
      'governance.agents.tabs.custom': 'custom',
    }[key] ?? key),
  },
}));
jest.mock('@forgerock/platform-shared/src/api/governance/AgentConfigApi');

const resource = {
  id: 'device',
  name: 'Devices',
  type: 'resource',
  isNHI: true,
  otherField: 'preserve',
  properties: {
    id: {
      type: 'string',
      displayName: 'Identifier',
      required: true,
      isDisplay: true,
    },
    owner: { type: 'string', displayName: 'Owner', flags: ['NOT_UPDATEABLE'] },
  },
};
const account = {
  id: 'user',
  name: 'Users',
  type: 'account',
  properties: {
    id: { type: 'string', displayName: 'Identifier' },
  },
};

function setup(props = {}) {
  return mount(DetailsForm, {
    global: {
      mocks: { $t: (key) => key },
    },
    props: {
      objectType: resource,
      application: { id: 'application-1', metadata: { revision: 1 }, displayName: 'App' },
      ...props,
    },
  });
}

describe('DetailsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAgentConfig();
    AgentConfigApi.getAgentConfig.mockResolvedValue({ data: { templates: [{ id: 'aws.bedrock' }, { id: 'azure.openai' }] } });
  });

  afterAll(() => jest.restoreAllMocks());

  describe('@renders', () => {
    it('derives the display property and resource NHI state', async () => {
      const wrapper = setup();
      await flushPromises();

      expect(wrapper.vm.form.displayProperty).toBe('id');
      expect(wrapper.vm.form.isNHI).toBe(true);
      expect(wrapper.vm.propertyOptions).toEqual([
        { value: 'id', text: 'Identifier' },
        { value: 'owner', text: 'Owner' },
      ]);
      expect(wrapper.vm.form.name).toBe('Devices');
      expect(wrapper.vm.form.id).toBe('device');
    });

    it('preserves an existing application source when agent configuration fails', async () => {
      AgentConfigApi.getAgentConfig.mockRejectedValueOnce(new Error('failed'));
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();

      wrapper.vm.saveHandler();

      expect(wrapper.vm.agentConfigError).toBe(true);
      expect(wrapper.emitted('save')[0][0].application).toEqual({
        id: 'application-1',
        aiAgentSource: 'aws.bedrock',
      });
    });

    it('loads and normalizes account source options from the agent configuration', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();

      expect(AgentConfigApi.getAgentConfig).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.form.aiAgents).toBe(true);
      expect(wrapper.vm.form.agentSource).toBe('aws.bedrock');
      expect(wrapper.vm.agentSourceOptions).toEqual([
        { value: 'aws.bedrock', text: 'aws-bedrock' },
        { value: 'azure.openai', text: 'custom' },
      ]);
    });

    it('falls back to the Custom label when a template has no locale entry', async () => {
      AgentConfigApi.getAgentConfig.mockResolvedValueOnce({ data: { templates: [{ id: 'brand.new.agent' }] } });
      const wrapper = setup({ objectType: account });
      await flushPromises();

      // The t() mock renders the whole key path for missing keys (real
      // vue-i18n behavior); the equality guard must prevent that from
      // leaking, falling back to the Custom label instead.
      expect(wrapper.vm.agentSourceOptions).toEqual([
        { value: 'brand.new.agent', text: 'custom' },
      ]);
    });

    it('reuses an empty successful account config response across Details mounts', async () => {
      AgentConfigApi.getAgentConfig.mockResolvedValueOnce({ data: { templates: [] } });

      const firstWrapper = setup({ objectType: account });
      await flushPromises();
      firstWrapper.unmount();
      const secondWrapper = setup({ objectType: account });
      await flushPromises();

      expect(AgentConfigApi.getAgentConfig).toHaveBeenCalledTimes(1);
      expect(secondWrapper.vm.agentSourceOptions).toEqual([]);
      expect(secondWrapper.vm.agentConfigError).toBe(false);
      expect(secondWrapper.vm.agentControlsDisabled).toBe(true);
      secondWrapper.unmount();
    });

    it('handles malformed agent configuration without inventing options', async () => {
      AgentConfigApi.getAgentConfig.mockResolvedValue({ data: { templates: [{ name: 'missing-id' }, null] } });
      const wrapper = setup({ objectType: account });
      await flushPromises();

      expect(wrapper.vm.agentSourceOptions).toEqual([]);
      expect(wrapper.vm.agentConfigError).toBe(false);
      expect(wrapper.vm.agentControlsDisabled).toBe(true);
      expect(wrapper.find('[data-testid="agent-config-empty"]').exists()).toBe(true);
    });

    it('rejects a previously loaded source when it is not in current templates', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'stale.source' },
      });
      await flushPromises();

      expect(wrapper.vm.form.aiAgents).toBe(false);
      expect(wrapper.vm.form.agentSource).toBe('');
    });

    it('resets derived values when switching object types', async () => {
      const wrapper = setup();
      await flushPromises();

      await wrapper.setProps({
        objectType: {
          id: 'person',
          name: 'People',
          type: 'account',
          properties: {},
        },
        application: {},
      });
      await flushPromises();

      expect(wrapper.vm.form.name).toBe('People');
      expect(wrapper.vm.form.id).toBe('person');
      expect(wrapper.vm.form.displayProperty).toBe('');
      expect(wrapper.vm.form.isNHI).toBe(false);
      expect(wrapper.vm.form.aiAgents).toBe(false);
      expect(wrapper.vm.form.agentSource).toBe('');
      expect(wrapper.vm.propertyOptions).toEqual([]);
    });

    it('does not discard staged edits when the same object type is reassigned by a sibling tab', async () => {
      // Bootstrap-vue's lazy tabs keep Details mounted once visited, so a
      // sibling tab (e.g. Properties) can replace the shared object-type
      // object with a new reference for the *same* object type — this must
      // not be treated as an object-type switch, or an in-progress, unsaved
      // Details selection would be silently wiped.
      const wrapper = setup();
      await flushPromises();
      expect(wrapper.vm.form.displayProperty).toBe('id');

      wrapper.vm.form.displayProperty = 'owner';
      await wrapper.setProps({
        objectType: { ...resource, otherField: 'changed-by-sibling-tab' },
      });
      await flushPromises();

      expect(wrapper.vm.form.displayProperty).toBe('owner');
    });

    it('re-derives state through repeated object-type switches without leaking values', async () => {
      const wrapper = setup();
      await flushPromises();

      // Switch to an account type: resource NHI state must not leak in, and the
      // account state must derive from the application source again.
      await wrapper.setProps({
        objectType: {
          id: 'person',
          name: 'People',
          type: 'account',
          properties: {},
        },
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();
      expect(wrapper.vm.form.isNHI).toBe(false);
      expect(wrapper.vm.form.aiAgents).toBe(true);
      expect(wrapper.vm.form.agentSource).toBe('aws.bedrock');

      // Switch back to a resource without a top-level isNHI: account state must
      // not leak and a missing isNHI defaults to false.
      await wrapper.setProps({
        objectType: {
          id: 'device2',
          name: 'Devices',
          type: 'resource',
          properties: {
            id: { type: 'string', displayName: 'Identifier' },
          },
        },
        application: { id: 'application-1' },
      });
      await flushPromises();

      expect(wrapper.vm.form.isNHI).toBe(false);
      expect(wrapper.vm.form.displayProperty).toBe('');
      expect(wrapper.vm.form.aiAgents).toBe(false);
      expect(wrapper.vm.form.agentSource).toBe('');
    });

    it('clears account source state when the parent application source is removed', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();

      await wrapper.setProps({ application: { id: 'application-1' } });
      await flushPromises();

      expect(wrapper.vm.form.aiAgents).toBe(false);
      expect(wrapper.vm.form.agentSource).toBe('');
    });

    it('clears an invalid changed application source instead of retaining stale state', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();

      await wrapper.setProps({ application: { id: 'application-1', aiAgentSource: 'stale.source' } });
      await flushPromises();

      expect(wrapper.vm.form.aiAgents).toBe(false);
      expect(wrapper.vm.form.agentSource).toBe('');
    });

    it('surfaces agent configuration failures and permits a retry', async () => {
      AgentConfigApi.getAgentConfig.mockRejectedValueOnce(new Error('failed'));
      const wrapper = setup({ objectType: account });
      await flushPromises();

      expect(wrapper.vm.agentConfigError).toBe(true);
      expect(wrapper.vm.agentControlsDisabled).toBe(true);
      expect(wrapper.find('[data-testid="agent-config-error"]').exists()).toBe(true);

      AgentConfigApi.getAgentConfig.mockResolvedValueOnce({ data: { templates: [{ id: 'retry.source' }] } });
      await wrapper.vm.loadAgentConfig();
      await flushPromises();
      expect(wrapper.vm.agentConfigError).toBe(false);
      expect(wrapper.vm.agentSourceOptions).toEqual([{ value: 'retry.source', text: 'custom' }]);
    });
  });

  describe('@actions', () => {
    it('emits separate full payloads and clears display flags and NHI', async () => {
      const wrapper = setup();
      await flushPromises();
      wrapper.vm.form.displayProperty = 'owner';
      wrapper.vm.form.isNHI = false;
      wrapper.vm.saveHandler();

      const payload = wrapper.emitted('save')[0][0];
      expect(payload.objectType).toEqual({
        ...resource,
        isNHI: false,
        properties: {
          id: { ...resource.properties.id, isDisplay: false },
          owner: { ...resource.properties.owner, isDisplay: true },
        },
      });
      expect(payload.application).toEqual({ id: 'application-1', displayName: 'App' });
      expect(payload.objectType).not.toHaveProperty('aiAgentSource');
    });

    it('omits the application source when AI Agents is unchecked', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();
      wrapper.vm.form.aiAgents = false;
      wrapper.vm.saveHandler();

      expect(wrapper.emitted('save')[0][0].application).toEqual({ id: 'application-1' });
    });

    it('reveals and hides the agent source select with the AI Agents checkbox', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();

      // The select renders only while the checkbox is checked.
      const sourceSelect = () => wrapper.find('[data-testid="fr-field-agentSource"]');
      expect(sourceSelect().exists()).toBe(true);

      wrapper.vm.form.aiAgents = false;
      await flushPromises();
      expect(sourceSelect().exists()).toBe(false);

      wrapper.vm.form.aiAgents = true;
      await flushPromises();
      expect(sourceSelect().exists()).toBe(true);
    });

    it('collapses and expands the advanced controls through the toggle link', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();

      const toggle = () => wrapper.find('[data-testid="details-advanced-toggle"]');
      expect(toggle().attributes('aria-expanded')).toBe('false');
      // BCollapse drops the `show` class (and v-show hides it) when collapsed.
      expect(wrapper.find('#object-type-details-advanced.show').exists()).toBe(false);

      await toggle().trigger('click');
      await flushPromises();
      expect(toggle().attributes('aria-expanded')).toBe('true');
      expect(wrapper.find('#object-type-details-advanced.show').exists()).toBe(true);
      expect(wrapper.find('[data-testid="fr-field-aiAgents"]').exists()).toBe(true);

      await toggle().trigger('click');
      await flushPromises();
      expect(toggle().attributes('aria-expanded')).toBe('false');
      expect(wrapper.find('#object-type-details-advanced.show').exists()).toBe(false);
    });

    it('clicks the save button and emits the save payloads through the template wiring', async () => {
      const wrapper = setup();
      await flushPromises();

      await wrapper.find('[data-testid="details-save"]').trigger('click');

      const payload = wrapper.emitted('save')[0][0];
      expect(payload.objectType).toEqual({
        ...resource,
        properties: {
          id: { ...resource.properties.id, isDisplay: true },
          owner: { ...resource.properties.owner, isDisplay: false },
        },
      });
      expect(payload.application).toEqual({ id: 'application-1', displayName: 'App' });
    });

    it('stages a freshly selected valid source only at the application level on a successful save', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', displayName: 'App' },
      });
      await flushPromises();

      wrapper.vm.form.aiAgents = true;
      wrapper.vm.form.agentSource = 'azure.openai';
      wrapper.vm.saveHandler();

      const payload = wrapper.emitted('save')[0][0];
      expect(payload.application).toEqual({
        id: 'application-1',
        displayName: 'App',
        aiAgentSource: 'azure.openai',
      });
      expect(payload.objectType).not.toHaveProperty('aiAgentSource');
    });

    it('retains staged values when save preparation is called again', async () => {
      const wrapper = setup({ objectType: account });
      await flushPromises();
      wrapper.vm.form.agentSource = 'aws.bedrock';
      wrapper.vm.form.aiAgents = true;
      wrapper.vm.saveHandler();

      expect(wrapper.vm.form.agentSource).toBe('aws.bedrock');
      expect(wrapper.vm.form.aiAgents).toBe(true);
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations for a resource', async () => {
      const wrapper = setup();
      await flushPromises();
      await runA11yTest(wrapper);
    });

    it('has no accessibility violations for an account with agent controls', async () => {
      const wrapper = setup({
        objectType: account,
        application: { id: 'application-1', aiAgentSource: 'aws.bedrock' },
      });
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});

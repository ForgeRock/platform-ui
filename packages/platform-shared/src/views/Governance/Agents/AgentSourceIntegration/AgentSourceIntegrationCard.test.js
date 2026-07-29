/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import * as UseAgentConfig from '../utils/useAgentConfig';
import AgentSourceIntegrationCard from './AgentSourceIntegrationCard';

// One stable useBvModal() instance for all calls, referenced lazily inside the
// factory (jest.mock hoisting requirement).
const mockBvModal = { show: jest.fn(), hide: jest.fn() };

jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: () => ({ bvModal: { value: mockBvModal } }),
}));

const mockAgentSources = {
  privilege: {
    bedrock: { objectClasses: [{ name: '__ACCOUNT__', nativeName: 'AWS Bedrock Agents' }] },
    vertex: { objectClasses: [] },
  },
};

/** Waits for the real-timer retry chain (backoff shrunk to milliseconds). */
async function waitForRetryChain() {
  // Real-timer backoffs: wait past the worst case, then drain microtasks
  // (cycles unrolled for the no-await-in-loop lint rule).
  await new Promise((resolve) => setTimeout(resolve, 2300));
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
}

function mountComponent({ sources = mockAgentSources, applicationsResult = [], skipApplicationsMock = false } = {}) {
  setupTestPinia();
  UseAgentConfig.useAgentConfig = jest.fn().mockReturnValue({
    agentApplicationProps: ref({}),
    agentSources: ref(sources),
    loadConfig: jest.fn().mockResolvedValue({}),
  });
  if (!skipApplicationsMock) {
    ApplicationsApi.getApplications = jest.fn().mockResolvedValue({ data: { result: applicationsResult } });
  }
  return mount(AgentSourceIntegrationCard, {
    global: {
      plugins: [Notifications],
      mocks: {
        $t: (t, params) => {
          if (t === 'governance.agents.integration.status.partial' && params) {
            return `${params.configured} of ${params.total} set up`;
          }
          return t;
        },
        $bvModal: { show: jest.fn(), hide: jest.fn() },
      },
      stubs: {
        BCard: {
          template: '<div><slot /></div>',
        },
        ConfigureAgentSourceModal: true,
      },
    },
  });
}

describe('AgentSourceIntegrationCard', () => {
  beforeEach(() => {
    mockBvModal.show.mockClear();
    mockBvModal.hide.mockClear();
  });

  it('fetches the source\'s configured applications on mount and shows the not-set-up status when none exist', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(ApplicationsApi.getApplications).toHaveBeenCalledWith(null, {
      queryFilter: 'ingestion.connector.type eq "privilege"',
      pageSize: 100,
      fields: 'name,id,aiAgentSource,ingestion',
      disconnected: true,
    });
    expect(wrapper.find('[data-testid="integration-status"]').text()).toBe('Not set up');
    expect(wrapper.find('[data-testid="integration-status"]').classes()).toContain('badge-light');
    expect(wrapper.vm.hasConfiguredSubtypes).toBe(false);
  });

  it('shows the partial status with counts when some subtypes are configured', async () => {
    const wrapper = mountComponent({
      applicationsResult: [
        { id: 'app-1', ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } } },
      ],
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="integration-status"]').text()).toBe('1 of 2 set up');
    expect(wrapper.find('[data-testid="integration-status"]').classes()).toContain('badge-warning');
    expect(wrapper.vm.hasConfiguredSubtypes).toBe(true);
  });

  it('shows the set-up status when every subtype is configured', async () => {
    const wrapper = mountComponent({
      applicationsResult: [
        { id: 'app-1', ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } } },
        { id: 'app-2', ingestion: { connector: { type: 'privilege', subtype: 'vertex' } } },
      ],
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="integration-status"]').text()).toBe('Enabled');
    expect(wrapper.find('[data-testid="integration-status"]').classes()).toContain('badge-success');
  });

  it('renders the source subtitle but not the subtype grid (grid lives in the config modal)', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const cardText = wrapper.text();
    expect(cardText).toContain('governance.agents.integration.subtitle');
    expect(cardText).not.toContain('AWS Bedrock Agents');
    expect(cardText).not.toContain('vertex');
  });

  it('opens the configuration modal when the action button is clicked', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.find('button').trigger('click');
    expect(mockBvModal.show).toHaveBeenCalledWith('ConfigureAgentSourceModal');
  });

  it('refetches the source applications when the config modal emits configured', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    expect(ApplicationsApi.getApplications).toHaveBeenCalledTimes(1);

    wrapper.findComponent({ name: 'ConfigureAgentSourceModal' }).vm.$emit('configured');
    // The emit starts the retry chain (3 attempts, 1s apart) since nothing was
    // configured; let it run out so its timers don't leak into later tests.
    await waitForRetryChain();

    expect(ApplicationsApi.getApplications.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('retries the refetch while the status has not advanced (eventual-consistency lag), then stops', async () => {
    // Mount + first two post-save fetches return stale (empty) results; the fourth
    // returns the saved app (the search index has caught up by then).
    ApplicationsApi.getApplications = jest.fn()
      .mockResolvedValueOnce({ data: { result: [] } })
      .mockResolvedValueOnce({ data: { result: [] } })
      .mockResolvedValueOnce({ data: { result: [] } })
      .mockResolvedValue({
        data: {
          result: [
            { id: 'app-1', ingestion: { connector: { type: 'privilege', subtype: 'bedrock' } } },
          ],
        },
      });

    const wrapper = mountComponent({ skipApplicationsMock: true });
    await flushPromises();
    // Fetch #1 (mount, stale); #2 and #3 trigger retries; #4 lands. Real timers
    // keep the chain deterministic (~2s of backoff elapse).
    wrapper.findComponent({ name: 'ConfigureAgentSourceModal' }).vm.$emit('configured');
    await waitForRetryChain();
    expect(wrapper.vm.subtypeRows).toEqual([
      { key: 'bedrock', displayName: 'AWS Bedrock Agents', configured: true },
      { key: 'vertex', displayName: 'vertex', configured: false },
    ]);
    expect(wrapper.find('[data-testid="integration-status"]').text()).toBe('1 of 2 set up');
  });

  it('bounds the retry at three attempts when the status never advances', async () => {
    ApplicationsApi.getApplications = jest.fn().mockResolvedValue({ data: { result: [] } });

    const wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent({ name: 'ConfigureAgentSourceModal' }).vm.$emit('configured');
    await waitForRetryChain();
    // Give any further (buggy) retry a chance to fire; none should.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await flushPromises();

    expect(ApplicationsApi.getApplications).toHaveBeenCalledTimes(4);
  });

  it('renders nothing when the backend config does not define the source', async () => {
    const wrapper = mountComponent({ sources: { otherSource: {} } });
    await flushPromises();

    expect(wrapper.find('div').exists()).toBe(false);
  });

  it('renders nothing when the config has no sources at all (connector service unreachable)', async () => {
    const wrapper = mountComponent({ sources: null });
    await flushPromises();

    expect(wrapper.find('div').exists()).toBe(false);
  });
});

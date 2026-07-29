/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

jest.mock('./agentConstants', () => ({
  __esModule: true,
  default: {
    AGENT_TEMPLATES: { PING: 'ping.aiagent' },
    AGENT_APPLICATION_PROPS: { default: {} },
  },
}));

const mockConfigResponse = {
  templates: [
    {
      id: 'ping.aiagent', resources: [], sourceName: 'privilege', icon: 'ping-privilege.svg', displayName: 'Ping AI Agents',
    },
    { id: 'default', resources: [] },
  ],
  applicationProps: {},
};

describe('useAgentConfig', () => {
  beforeEach(() => {
    // Reset the module-level cache and the shared AgentApi graph between cases.
    jest.resetModules();
  });

  it('passes the config response\'s sources through to agentSources', async () => {
    const sources = { privilege: { bedrock: { objectClasses: [] } } };
    jest.doMock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
      getAgentConfig: jest.fn().mockResolvedValue({
        data: { ...mockConfigResponse, sources },
      }),
    }));

    // eslint-disable-next-line global-require
    const { useAgentConfig } = require('./useAgentConfig');
    const { agentSources, loadConfig } = useAgentConfig();
    await loadConfig();

    expect(agentSources.value).toEqual(sources);
  });

  it('exposes templates[].icon keyed by template id as agentTemplateIcons', async () => {
    jest.doMock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
      getAgentConfig: jest.fn().mockResolvedValue({
        data: { ...mockConfigResponse },
      }),
    }));

    // eslint-disable-next-line global-require
    const { useAgentConfig } = require('./useAgentConfig');
    const { agentTemplateIcons, loadConfig } = useAgentConfig();
    await loadConfig();

    expect(agentTemplateIcons.value).toEqual({ 'ping.aiagent': 'ping-privilege.svg' });
  });

  it('exposes templates[].displayName keyed by template id as agentTemplateDisplayNames', async () => {
    jest.doMock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
      getAgentConfig: jest.fn().mockResolvedValue({
        data: { ...mockConfigResponse },
      }),
    }));

    // eslint-disable-next-line global-require
    const { useAgentConfig } = require('./useAgentConfig');
    const { agentTemplateDisplayNames, loadConfig } = useAgentConfig();
    await loadConfig();

    expect(agentTemplateDisplayNames.value).toEqual({ 'ping.aiagent': 'Ping AI Agents' });
  });

  it('exposes templates[].sources keyed by template id as agentTemplateSourceArrays', async () => {
    jest.doMock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
      getAgentConfig: jest.fn().mockResolvedValue({
        data: {
          templates: [
            { id: 'aws.bedrock', resources: [], sources: ['privilege.bedrock'] },
            { id: 'ping.aiagent', resources: [] },
          ],
        },
      }),
    }));

    // eslint-disable-next-line global-require
    const { useAgentConfig } = require('./useAgentConfig');
    const { agentTemplateSourceArrays, loadConfig } = useAgentConfig();
    await loadConfig();

    expect(agentTemplateSourceArrays.value).toEqual({ 'aws.bedrock': ['privilege.bedrock'] });
  });

  describe('resolveAiAgentSource', () => {
    const templateSourceArrays = {
      'aws.bedrock': ['privilege.bedrock'],
      'm365.copilot': ['privilege.copilot'],
    };

    // eslint-disable-next-line global-require
    const { resolveAiAgentSource } = require('./useAgentConfig');

    it('returns the claiming template id for a source.subtype match', () => {
      expect(resolveAiAgentSource(templateSourceArrays, 'privilege', 'bedrock')).toBe('aws.bedrock');
      expect(resolveAiAgentSource(templateSourceArrays, 'privilege', 'copilot')).toBe('m365.copilot');
    });

    it('falls back to the subtype key when no template claims the pair', () => {
      expect(resolveAiAgentSource(templateSourceArrays, 'privilege', 'vertex')).toBe('vertex');
    });

    it('falls back to the subtype key when the template sources map is missing or empty', () => {
      expect(resolveAiAgentSource(undefined, 'privilege', 'bedrock')).toBe('bedrock');
      expect(resolveAiAgentSource({}, 'privilege', 'bedrock')).toBe('bedrock');
    });
  });

  it('omits templates without an icon from agentTemplateIcons', async () => {
    jest.doMock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
      getAgentConfig: jest.fn().mockResolvedValue({
        data: {
          templates: [
            { id: 'ping.aiagent', resources: [] },
          ],
        },
      }),
    }));

    // eslint-disable-next-line global-require
    const { useAgentConfig } = require('./useAgentConfig');
    const { agentTemplateIcons, loadConfig } = useAgentConfig();
    await loadConfig();

    expect(agentTemplateIcons.value).toEqual({});
  });

  it('sets agentSources to null when the response has no sources key', async () => {
    jest.doMock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
      getAgentConfig: jest.fn().mockResolvedValue({
        data: { ...mockConfigResponse },
      }),
    }));

    // eslint-disable-next-line global-require
    const { useAgentConfig } = require('./useAgentConfig');
    const { agentSources, loadConfig } = useAgentConfig();
    await loadConfig();

    expect(agentSources.value).toBeNull();
  });

  it('keeps the null fallback when the config fetch fails', async () => {
    jest.doMock('@forgerock/platform-shared/src/api/governance/AgentApi', () => ({
      getAgentConfig: jest.fn().mockRejectedValue(new Error('fetch failed')),
    }));

    // eslint-disable-next-line global-require
    const { useAgentConfig } = require('./useAgentConfig');
    const { agentSources, loadConfig } = useAgentConfig();
    await loadConfig();

    expect(agentSources.value).toBeNull();
  });
});

describe('resolveAgentIcon', () => {
  const icons = { 'ping.aiagent': 'ping-privilege.svg', 'custom.src': '/images/custom/agent.svg' };
  const sources = { 'custom.src': 'my-discovery-source' };

  it('returns the application icon when set', () => {
    // eslint-disable-next-line global-require
    const { resolveAgentIcon } = require('./useAgentConfig');
    expect(resolveAgentIcon({ icon: '/app-icon.png' }, icons, sources)).toBe('/app-icon.png');
  });

  it('resolves a bare filename icon from the matched template', () => {
    // eslint-disable-next-line global-require
    const { resolveAgentIcon } = require('./useAgentConfig');
    expect(resolveAgentIcon({ templateName: 'ping.aiagent' }, icons, sources)).toBe(
      'https://cdn.forgerock.com/platform/app-templates/images/ping-privilege.svg',
    );
  });

  it('resolves a full-path icon from the matched template unchanged', () => {
    // eslint-disable-next-line global-require
    const { resolveAgentIcon } = require('./useAgentConfig');
    expect(resolveAgentIcon({ aiAgentSource: 'my-discovery-source' }, icons, sources)).toBe(
      '/images/custom/agent.svg',
    );
  });

  it('returns null when no template matches', () => {
    // eslint-disable-next-line global-require
    const { resolveAgentIcon } = require('./useAgentConfig');
    expect(resolveAgentIcon({ templateName: 'unknown.template' }, icons, sources)).toBeNull();
  });

  it('returns null when the application is missing', () => {
    // eslint-disable-next-line global-require
    const { resolveAgentIcon } = require('./useAgentConfig');
    expect(resolveAgentIcon(undefined, icons, sources)).toBeNull();
  });

  it('returns null when the template icon is empty or undefined', () => {
    // eslint-disable-next-line global-require
    const { resolveAgentIcon } = require('./useAgentConfig');
    expect(resolveAgentIcon({ templateName: 'no.icon' }, { 'no.icon': undefined }, sources)).toBeNull();
    expect(resolveAgentIcon({ templateName: 'no.icon' }, { 'no.icon': '' }, sources)).toBeNull();
  });
});

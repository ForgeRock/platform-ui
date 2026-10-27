/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { resolveTemplateIcon } from '@forgerock/platform-shared/src/views/Governance/Agents/utils/useAgentConfig';
import { buildAgentView, loadAgentViewConfig } from './agentView';

// useAgentConfig destructures getAgentConfig at import time (namespace reassignment
// can't reach it), so the module mock feeds loadAgentViewConfig its resolved config
jest.mock('@forgerock/platform-shared/src/views/Governance/Agents/utils/useAgentConfig', () => ({
  ...jest.requireActual('@forgerock/platform-shared/src/views/Governance/Agents/utils/useAgentConfig'),
  useAgentConfig: () => {
    // the real composable returns refs (loadAgentViewConfig unwraps .value)
    const config = {
      agentMappings: { mystery: [{ iga: 'model.id', icf: 'model' }] },
      agentTemplateSources: {},
      agentTemplateIcons: {},
      agentTemplateDisplayNames: {},
    };
    const refConfig = Object.fromEntries(Object.entries(config).map(([key, value]) => [key, { value }]));
    return { ...refConfig, loadConfig: jest.fn().mockResolvedValue(config) };
  },
}));

// echo the agent config the view resolves through — same shape useAgentConfig returns
const agentConfig = {
  agentMappings: {
    'aws.bedrock': [
      { iga: 'model.id', icf: 'model', privilege: 'foundationModel' },
    ],
    default: [],
  },
  agentTemplateSources: { 'aws.bedrock': 'aws-bedrock' },
  agentTemplateIcons: { 'aws.bedrock': 'bedrock-icon.svg' },
  agentTemplateDisplayNames: { 'aws.bedrock': 'AWS Bedrock' },
};

describe('buildAgentView', () => {
  it('returns undefined for items with no agent account stamp and no account name', () => {
    expect(buildAgentView({ item: { type: 'entitlementGrant' } })).toBeUndefined();
  });

  it('builds the agent view from a stamped agent account item', () => {
    const item = {
      item: { type: 'accountGrant' },
      account: { displayName: 'bedrock-assistant-1' },
      application: { name: 'AWS BedRock Prod', templateName: 'aws.bedrock' },
      glossary: { idx: { '/account/accountType': 'agent', '/account/actors': ['managed/user/abc-123'] } },
      descriptor: { idx: { '/account': { displayName: 'bedrock-assistant-1' } } },
    };
    expect(buildAgentView(item, agentConfig)).toEqual({
      agent: 'bedrock-assistant-1',
      platform: 'aws.bedrock',
      platformLabel: 'AWS Bedrock',
      platformIcon: resolveTemplateIcon('bedrock-icon.svg'),
      model: undefined,
      owner: ['managed/user/abc-123'],
    });
  });

  it('falls back to application.name for the agent name and aiAgentSource for platform', () => {
    const item = {
      application: { name: 'My Copilot', aiAgentSource: 'm365.copilot' },
      descriptor: { idx: { '/account': { displayName: 'copilot-1' } } },
    };
    const view = buildAgentView(item, agentConfig);
    expect(view.agent).toBe('copilot-1');
    expect(view.platform).toBe('m365.copilot');
  });

  it('passes the actors ref through as stored (single or list) — enrichment lands separately', () => {
    const item = {
      account: { displayName: 'agent-9' },
      glossary: { idx: { '/account/accountType': 'agent', '/account/actors': 'managed/user/x' } },
    };
    expect(buildAgentView(item, agentConfig).owner).toBe('managed/user/x');
  });

  describe('model resolution', () => {
    it('resolves model through the template mapping icf key for template-matched agents', () => {
      const item = {
        account: { displayName: 'agent-1', model: 'claude-3' },
        application: { name: 'AWS BedRock Prod', templateName: 'aws.bedrock' },
        glossary: { idx: { '/account/accountType': 'agent' } },
      };
      // templateName matches the template — entry's icf key names the account attribute
      expect(buildAgentView(item, agentConfig).model).toBe('claude-3');
    });

    it('resolves model through the mapping privilege key for discovered agents', () => {
      const item = {
        account: { displayName: 'agent-2', foundationModel: 'gemini-1.5' },
        application: { name: 'AWS BedRock Prod', aiAgentSource: 'aws-bedrock' },
        glossary: { idx: { '/account/accountType': 'agent' } },
      };
      // aiAgentSource matches the template's discovery source — still this template's
      // mapping, but no application.templateName, so the privilege key applies
      expect(buildAgentView(item, agentConfig).model).toBe('gemini-1.5');
    });

    it('falls back to the schema key when no mapping entry exists', () => {
      const item = {
        account: { displayName: 'agent-3', 'model.id': 'llama-3' },
        application: { name: 'Unknown Platform', aiAgentSource: 'mystery' },
        glossary: { idx: { '/account/accountType': 'agent' } },
      };
      // no template match: default mapping (empty) has no model.id entry — the
      // schema key itself names the attribute
      expect(buildAgentView(item, agentConfig).model).toBe('llama-3');
    });

    it('leaves model undefined when the account carries no value', () => {
      const item = {
        account: { displayName: 'agent-4' },
        application: { name: 'AWS BedRock Prod', templateName: 'aws.bedrock' },
        glossary: { idx: { '/account/accountType': 'agent' } },
      };
      expect(buildAgentView(item, agentConfig).model).toBeUndefined();
    });

    it('resolves model through the cached config when none is passed', async () => {
      // the mocked useAgentConfig supplies the mapping; loadAgentViewConfig seeds
      // the module-level cache from it
      await loadAgentViewConfig();
      const item = {
        account: { displayName: 'agent-5', model: 'cached-model' },
        application: { name: 'Unknown Platform', templateName: 'mystery' },
        glossary: { idx: { '/account/accountType': 'agent' } },
      };
      expect(buildAgentView(item).model).toBe('cached-model');
    });
  });
});

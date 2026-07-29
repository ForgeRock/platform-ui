/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import {
  getAgentTypeVariant, getAgentDisplayName, getAgentTemplateLabel, getMappingSystemKey, buildAgentPropertiesDisplay, buildAgentApplicationPayload,
} from './agentUtility';
import agentConstants from './agentConstants';

describe('Agent Utility Functions', () => {
  describe('getAgentTypeVariant', () => {
    it('should return correct badge variant for default agent type', () => {
      const result = getAgentTypeVariant(agentConstants.ACCOUNT_TYPES.DEFAULT);
      expect(result).toBe('light');
    });

    it('should return correct badge variant for machine type', () => {
      const result = getAgentTypeVariant(agentConstants.ACCOUNT_TYPES.MACHINE);
      expect(result).toBe('warning');
    });

    it('should return default badge variant for unknown agent type', () => {
      const result = getAgentTypeVariant('unknown');
      expect(result).toBe('light');
    });

    it('should return default badge variant for null agent type', () => {
      const result = getAgentTypeVariant(null);
      expect(result).toBe('light');
    });
  });

  describe('getAgentDisplayName', () => {
    it('should return display name from agent descriptor', () => {
      const agent = { descriptor: { idx: { '/account': { displayName: 'John Doe' } } } };
      const result = getAgentDisplayName(agent);
      expect(result).toBe('John Doe');
    });

    it('should return fallback name when display name is not available', () => {
      const agent = { __NAME__: 'Fallback Name' };
      const result = getAgentDisplayName(agent);
      expect(result).toBe('Fallback Name');
    });

    it('should return blank value indicator for agent with no display name or fallback', () => {
      const agent = {};
      const result = getAgentDisplayName(agent);
      expect(result).toBe(blankValueIndicator);
    });
  });

  describe('getAgentTemplateLabel', () => {
    it('returns the template displayName when present', () => {
      expect(getAgentTemplateLabel({ id: 'aws.bedrock', displayName: 'Bedrock (EU)' })).toBe('Bedrock (EU)');
    });

    it('returns the locale translation when no displayName is set', () => {
      expect(getAgentTemplateLabel({ id: 'aws.bedrock' })).toBe('AWS Bedrock');
    });

    it('returns the raw key when the locale has no translation', () => {
      expect(getAgentTemplateLabel({ id: 'not.a.template' })).toBe('governance.agents.tabs.not-a-template');
    });

    it('returns an empty string when the template has no id', () => {
      expect(getAgentTemplateLabel({})).toBe('');
    });
  });

  describe('getMappingSystemKey', () => {
    const entry = { iga: 'status', icf: 'statecode', privilege: 'state' };

    it('returns the icf key when the application has a templateName', () => {
      expect(getMappingSystemKey(entry, { templateName: 'm365.copilot' })).toBe('statecode');
    });

    it('returns the privilege key when the application has no templateName', () => {
      expect(getMappingSystemKey(entry, { aiAgentSource: 'agentcore' })).toBe('state');
    });

    it('returns the privilege key when there is no application at all', () => {
      expect(getMappingSystemKey(entry, undefined)).toBe('state');
    });

    it('returns the entry value as-is when the resolved key is null', () => {
      expect(getMappingSystemKey({ iga: 'model.id', icf: null, privilege: 'foundationModel' }, { templateName: 'm365.copilot' })).toBeNull();
    });

    it('returns the system key for legacy { iga, system } entries', () => {
      expect(getMappingSystemKey({ iga: 'status', system: 'state' }, { templateName: 'm365.copilot' })).toBe('state');
      expect(getMappingSystemKey({ iga: 'status', system: 'state' }, {})).toBe('state');
    });
  });

  describe('buildAgentApplicationPayload', () => {
    const subtypeSchema = {
      objectClasses: [{ name: '__ACCOUNT__', nativeName: 'Bedrock Agents' }],
    };

    it('stamps the claiming template id as aiAgentSource when templates[].sources matches', () => {
      const payload = buildAgentApplicationPayload(
        'privilege', 'bedrock', subtypeSchema, ['owner-1'], {}, { 'aws.bedrock': ['privilege.bedrock'] },
      );
      expect(payload.aiAgentSource).toBe('aws.bedrock');
    });

    it('stamps the subtype key as aiAgentSource when no template sources are provided', () => {
      const payload = buildAgentApplicationPayload('privilege', 'bedrock', subtypeSchema, ['owner-1'], {});
      expect(payload.aiAgentSource).toBe('bedrock');
    });
  });

  describe('buildAgentPropertiesDisplay', () => {
    const schema = [
      { key: 'agentName', displayName: 'Agent Name', type: 'string' },
      { key: 'createdAt', displayName: 'Created On', type: 'date' },
      { key: 'status', displayName: 'Status', type: 'string' },
      { key: 'provider.tenant', displayName: 'Tenant', type: 'string' },
    ];
    const mapping = [
      { iga: 'agentName', icf: '__NAME__', privilege: 'agentName' },
      { iga: 'createdAt', icf: 'createdOn', privilege: 'createdAt' },
      { iga: 'status', icf: 'statecode', privilege: 'state' },
      { iga: 'provider.tenant', icf: null, privilege: 'tenant' },
    ];

    it('resolves icf keys for agents with a templateName and formats per type', () => {
      const record = {
        __NAME__: 'TranscriptParserAgent',
        createdOn: '2026-06-25T03:12:30Z',
        statecode: 0,
      };
      const result = buildAgentPropertiesDisplay(record, schema, mapping, { templateName: 'm365.copilot' });
      expect(Object.keys(result)).toEqual(['agentName', 'createdAt', 'status', 'provider.tenant']);
      expect(result.agentName).toBe('TranscriptParserAgent');
      expect(result.createdAt).toBe('Jun 25, 2026 3:12 AM');
      expect(result.status).toBe('0');
    });

    it('resolves privilege keys for agents without a templateName', () => {
      const record = { agentName: 'Discovered', state: 'ACTIVE' };
      const result = buildAgentPropertiesDisplay(record, schema, mapping, { aiAgentSource: 'agentcore' });
      expect(result.agentName).toBe('Discovered');
      expect(result.status).toBe('ACTIVE');
    });

    it('renders blank for entries whose resolved mapping key is null', () => {
      const result = buildAgentPropertiesDisplay({ tenant: 't-1' }, schema, mapping, { templateName: 'm365.copilot' });
      expect(result['provider.tenant']).toBe('');
    });

    it('falls back to reading the schema key off the record when no mapping entry exists', () => {
      const result = buildAgentPropertiesDisplay({ createdAt: '2026-06-25T03:12:30Z' }, schema, [], {});
      expect(result.createdAt).toBe('Jun 25, 2026 3:12 AM');
    });

    it('renders blank for schema keys absent from the record', () => {
      const result = buildAgentPropertiesDisplay({}, schema, [], {});
      expect(result.agentName).toBe('');
      expect(result.createdAt).toBe('');
      expect(result.status).toBe('');
      expect(result['provider.tenant']).toBe('');
    });
  });
});

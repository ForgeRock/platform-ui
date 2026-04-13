/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getAgentTypeVariant, getAgentDisplayName } from './agentUtility';
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
});

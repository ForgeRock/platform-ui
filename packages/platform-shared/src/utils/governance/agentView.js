/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { get } from 'lodash';
import { useAgentConfig, resolveTemplateId, resolveTemplateIcon } from '@forgerock/platform-shared/src/views/Governance/Agents/utils/useAgentConfig';
import { getMappingSystemKey } from '@forgerock/platform-shared/src/views/Governance/Agents/utils/agentUtility';
import i18n from '@/i18n';

// Module-level config, hydrated once per TaskList lifetime: the agent mappings,
// template sources, icons, and display names the model/platform columns resolve
// through — the same config driving the Agent Properties card in the agent modal
// and the details page.
let agentConfig = null;

/**
 * Loads (once) and caches the agent config needed to resolve mapped attributes
 * on certification line items.
 * @returns {Promise<{agentMappings: Object, agentTemplateSources: Object, agentTemplateIcons: Object, agentTemplateDisplayNames: Object}>}
 */
export async function loadAgentViewConfig() {
  if (!agentConfig) {
    const {
      agentMappings, agentTemplateSources, agentTemplateIcons, agentTemplateDisplayNames, loadConfig,
    } = useAgentConfig();
    await loadConfig();
    // useAgentConfig returns refs — unwrap them; every lookup below reads plain
    // objects (matching how AgentTable/AgentsDetails consume these same refs)
    agentConfig = {
      agentMappings: agentMappings.value,
      agentTemplateSources: agentTemplateSources.value,
      agentTemplateIcons: agentTemplateIcons.value,
      agentTemplateDisplayNames: agentTemplateDisplayNames.value,
    };
  }
  return agentConfig;
}

/**
 * Resolves the agent's foundation model for a line item the same way the agent
 * modal's header badge does: schema key "model.id" → the matched template's
 * mapping entry → the account attribute it points at (see getMappingSystemKey).
 * @param {Object} item certification line item
 * @param {{agentMappings: Object, agentTemplateSources: Object}} config loaded agent config
 * @returns {String|undefined} the model id, when the account carries it
 */
function resolveAgentModel(item, config) {
  const mapping = config.agentMappings[resolveTemplateId(item.application, config.agentTemplateSources)]
    || config.agentMappings.default || [];
  const entry = mapping.find((m) => m.iga === 'model.id');
  const attribute = entry ? getMappingSystemKey(entry, item.application) : 'model.id';
  return attribute ? get(item.account, attribute) : undefined;
}

/**
 * Resolves the platform cell's icon for a line item: the matched template's
 * config icon, else null (the cell falls back to a generic agent icon).
 * @param {Object} item certification line item
 * @param {{agentTemplateIcons: Object, agentTemplateSources: Object}} config loaded agent config
 * @returns {String|null} the resolved icon URL, or null when no template icon
 */
function resolveAgentPlatformIcon(item, config) {
  const templateId = resolveTemplateId(item.application, config.agentTemplateSources);
  const icon = templateId && config.agentTemplateIcons?.[templateId];
  return icon ? resolveTemplateIcon(icon) : null;
}

/**
 * Label for the platform cell, matching the Agents page tabs' resolution:
 * the matched template's config displayName, else the tabs.* locale key for
 * the template id ("AWS Bedrock" etc.), else the raw id. The locale lookup
 * compares t()'s result against the key — vue-i18n echoes the key itself for
 * missing translations. te() can't be used here: the app never sets the locale,
 * so it stays en-US while messages register under en, and te() checks only the
 * exact current locale (t() resolves through the implicit region fallback).
 * @param {Object} item certification line item
 * @param {String} platform raw platform value (template id or discovery source)
 * @param {Object} config loaded agent config
 * @returns {String} the display label
 */
function resolveAgentPlatformLabel(item, platform, config) {
  const templateId = resolveTemplateId(item.application, config.agentTemplateSources);
  const configName = templateId && config.agentTemplateDisplayNames?.[templateId];
  if (configName) return configName;
  const localeKey = `governance.agents.tabs.${String(platform).replace(/\./g, '-')}`;
  const resolved = i18n.global.t(localeKey);
  return resolved === localeKey ? platform : resolved;
}

/**
 * Builds the agent view object for a certification line item from fields that
 * already exist on the item: { agent, platform, platformLabel, platformIcon,
 * model, owner }. The backend does not stamp an agent object on items, so the
 * UI constructs one.
 * @param {Object} item certification line item
 * @param {{agentMappings: Object, agentTemplateSources: Object, agentTemplateIcons: Object, agentTemplateDisplayNames: Object}} [config] loaded agent
 *   config; when omitted the model resolves through the cached config
 * @returns {Object|undefined} { agent, platform, platformLabel, platformIcon, model, owner } or undefined for non-agent items
 */
export function buildAgentView(item, config = agentConfig) {
  // agentProfile items are accountGrant docs carrying the account glossary;
  // agentAccess items key on the agent's user identity. Only build the view
  // when the item actually represents an agent (stamped account or glossary present).
  // glossary keys contain '/' — lodash needs array paths for them
  const accountType = get(item, ['glossary', 'idx', '/account/accountType']);
  const isAgentAccount = accountType === 'agent';
  const name = get(item, ['descriptor', 'idx', '/account', 'displayName'])
    || get(item, 'account.displayName')
    || get(item, 'application.name');
  if (!isAgentAccount && !name) {
    return undefined;
  }

  // platform is the agent template id, not the app instance name
  const platform = get(item, 'application.templateName') || get(item, 'application.aiAgentSource');

  return {
    agent: name,
    // label resolves through the Agents page tabs' chain (config displayName →
    // tabs.* locale key → raw id); platform stays the raw id for alt text
    platform,
    platformLabel: config ? resolveAgentPlatformLabel(item, platform, config) : platform,
    // matched template's config icon; null when unknown — the cell renders a
    // generic agent icon in its place
    platformIcon: config ? resolveAgentPlatformIcon(item, config) : null,
    model: config ? resolveAgentModel(item, config) : undefined,
    // ponytail: raw 'managed/user/<id>' refs — uuids render until the custodian
    // name-enrichment util lands; column stays out of defaults for that reason
    owner: get(item, ['glossary', 'idx', '/account/actors']),
  };
}

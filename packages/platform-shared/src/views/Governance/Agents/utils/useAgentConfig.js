/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { getAgentConfig } from '@forgerock/platform-shared/src/api/governance/AgentApi';
import { resolveImage } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import agentConstants from './agentConstants';

// Module-level cache so multiple component instances share a single fetch
let cachedConfig = null;
let fetchPromise = null;

/**
 * Resolves a template icon value into an image URL: bare filenames resolve
 * against the app-templates images route; paths/URLs pass through unchanged.
 * @param {string} icon Icon value from /agent/config templates[].icon
 * @returns {String|null} The resolved image URL, or null when no icon is set
 */
function resolveTemplateIcon(icon) {
  if (!icon) return null;
  // Anything path- or URL-shaped (including data URIs) is used as-is
  if (icon.includes('/')) return icon;
  return resolveImage(icon);
}

/**
 * Config template id owning the application (mirrors the server's resolver):
 * aiAgentSource primary, templateName fallback.
 * @param {Object} application - The agent's application object
 * @param {Object} agentTemplateSources - Per-template id -> discovery source name map
 * @returns {String|undefined} The matching template id, or undefined if none matches
 */
export function resolveTemplateId(application, agentTemplateSources) {
  const aiAgentSource = application?.aiAgentSource;
  if (aiAgentSource) {
    // The source may already equal a template id, or may be the discovery source
    // name of a template configured with one
    if (agentTemplateSources && Object.values(agentTemplateSources).includes(aiAgentSource)) {
      return Object.keys(agentTemplateSources)
        .find((templateId) => agentTemplateSources[templateId] === aiAgentSource);
    }
  }
  const templateName = application?.templateName?.replace(/-override$/, '');
  if (templateName && templateName !== 'undefined') return templateName;
  // no sourceName configured yet: a source value may still equal a template id
  if (aiAgentSource) return aiAgentSource;
  return undefined;
}

/**
 * Application icon: application's own, then the matched template's config icon,
 * else null (callers fall back to getApplicationLogo).
 * @param {Object} application - The agent's application object
 * @param {Object} agentTemplateIcons - Per-template id -> icon from /agent/config
 * @param {Object} agentTemplateSources - Per-template id -> discovery source name map
 * @returns {String|null} The resolved icon URL, or null when nothing matches
 */
export function resolveAgentIcon(application, agentTemplateIcons, agentTemplateSources) {
  if (!application) return null;
  if (application.icon) return application.icon;
  const templateId = resolveTemplateId(application, agentTemplateSources);
  const icon = templateId && agentTemplateIcons?.[templateId];
  return icon ? resolveTemplateIcon(icon) : null;
}

/**
 * Transforms a raw /agent/config response into the shapes used by the Agents UI.
 * @param {Object} data - Raw config response data
 * @returns {{ agentTemplates: string[], agentApplicationProps: Object, agentMappings: Object, agentSchema: Array, agentTemplateSources: Object, agentSources: Object, agentTemplateIcons: Object, agentTemplateDisplayNames: Object }}
 */
function transformConfig(data) {
  const agentTemplates = data.templates.map((t) => t.id).filter((id) => id !== 'default');

  // Preserve the static 'default' fallback for unknown templates
  const agentApplicationProps = { default: agentConstants.AGENT_APPLICATION_PROPS.default };
  const agentMappings = { default: [] };
  // Maps template id -> the discovery source (from /agent/config sources) that produced it,
  // so agent list tabs can also match agents by application.aiAgentSource.
  const agentTemplateSources = {};
  // Maps template id -> icon from /agent/config (bare filename or full image path),
  // so agents matching a template can display its icon when the application has none.
  const agentTemplateIcons = {};
  // Maps template id -> displayName from /agent/config, so tabs and headers can
  // prefer the config's label before falling back to locale translations.
  const agentTemplateDisplayNames = {};
  // Template id -> source keys (e.g. 'privilege.bedrock') from templates[].sources,
  // for stamping aiAgentSource on newly created applications.
  const agentTemplateSourceArrays = {};
  data.templates.forEach((template) => {
    agentApplicationProps[template.id] = {};
    template.resources.forEach(({ type, ...rest }) => {
      agentApplicationProps[template.id][type] = rest;
    });
    agentMappings[template.id] = template.mapping || [];
    if (template.sourceName) agentTemplateSources[template.id] = template.sourceName;
    if (template.icon) agentTemplateIcons[template.id] = template.icon;
    if (template.displayName) agentTemplateDisplayNames[template.id] = template.displayName;
    if (Array.isArray(template.sources) && template.sources.length) agentTemplateSourceArrays[template.id] = template.sources;
  });

  return {
    agentTemplates,
    agentApplicationProps,
    agentMappings,
    // A top-level "schema" property on the response defines the Agent Properties
    // display; fall back to the static backup schema when absent.
    agentSchema: Array.isArray(data.schema) ? data.schema : agentConstants.AGENT_SCHEMA,
    agentTemplateSources,
    agentSources: data.sources || null,
    agentTemplateIcons,
    agentTemplateSourceArrays,
    agentTemplateDisplayNames,
  };
}

/**
 * aiAgentSource value to stamp on a new disconnected agent application: the id
 * of the template claiming the '<type>.<subtype>' pair, else the subtype key.
 * @param {Object} agentTemplateSourceArrays per-template id -> sources array from the config
 * @param {String} source discovery source type (e.g. 'privilege')
 * @param {String} subtypeKey subtype key within the source (e.g. 'bedrock')
 * @returns {String} the claiming template's id, or subtypeKey when none claims it
 */
export function resolveAiAgentSource(agentTemplateSourceArrays, source, subtypeKey) {
  const match = `${source}.${subtypeKey}`;
  const templateId = Object.keys(agentTemplateSourceArrays || {})
    .find((id) => (agentTemplateSourceArrays[id] || []).includes(match));
  return templateId || subtypeKey;
}

/**
 * Fetches the agent template configuration (cached; static fallbacks on failure)
 * as reactive refs; each mirrors the transformConfig field of the same name.
 * @returns {Object} refs: agentTemplates, agentApplicationProps, agentMappings,
 *   agentSchema, agentTemplateSources, agentSources, agentTemplateIcons,
 *   agentTemplateSourceArrays, agentTemplateDisplayNames; plus loadConfig()
 */
export function useAgentConfig() {
  const agentTemplates = ref(Object.values(agentConstants.AGENT_TEMPLATES));
  const agentApplicationProps = ref(agentConstants.AGENT_APPLICATION_PROPS);
  const agentMappings = ref({});
  const agentSchema = ref(agentConstants.AGENT_SCHEMA);
  const agentTemplateSources = ref({});
  const agentSources = ref(null);
  const agentTemplateIcons = ref({});
  const agentTemplateSourceArrays = ref({});
  const agentTemplateDisplayNames = ref({});

  async function loadConfig() {
    if (cachedConfig) {
      agentTemplates.value = cachedConfig.agentTemplates;
      agentApplicationProps.value = cachedConfig.agentApplicationProps;
      agentMappings.value = cachedConfig.agentMappings;
      agentSchema.value = cachedConfig.agentSchema;
      agentTemplateSources.value = cachedConfig.agentTemplateSources;
      agentSources.value = cachedConfig.agentSources;
      agentTemplateIcons.value = cachedConfig.agentTemplateIcons;
      agentTemplateSourceArrays.value = cachedConfig.agentTemplateSourceArrays;
      agentTemplateDisplayNames.value = cachedConfig.agentTemplateDisplayNames;
      return cachedConfig;
    }
    if (!fetchPromise) {
      fetchPromise = getAgentConfig();
    }
    let cachedPromise;
    try {
      cachedPromise = fetchPromise;
      const { data } = await cachedPromise;
      const transformed = transformConfig(data);
      cachedConfig = transformed;
      agentTemplates.value = transformed.agentTemplates;
      agentApplicationProps.value = transformed.agentApplicationProps;
      agentMappings.value = transformed.agentMappings;
      agentSchema.value = transformed.agentSchema;
      agentTemplateSources.value = transformed.agentTemplateSources;
      agentSources.value = transformed.agentSources;
      agentTemplateIcons.value = transformed.agentTemplateIcons;
      agentTemplateSourceArrays.value = transformed.agentTemplateSourceArrays;
      agentTemplateDisplayNames.value = transformed.agentTemplateDisplayNames;
      return transformed;
    } catch {
      // Clear the failed promise so a later loadConfig() retries the fetch
      // instead of awaiting this rejection forever.
      if (fetchPromise === cachedPromise) fetchPromise = null;
      // Keep static fallbacks already set as initial ref values
      return {
        agentTemplates: agentTemplates.value,
        agentApplicationProps: agentApplicationProps.value,
        agentMappings: agentMappings.value,
        agentSchema: agentSchema.value,
        agentTemplateSources: agentTemplateSources.value,
        agentSources: agentSources.value,
        agentTemplateIcons: agentTemplateIcons.value,
        agentTemplateSourceArrays: agentTemplateSourceArrays.value,
        agentTemplateDisplayNames: agentTemplateDisplayNames.value,
      };
    }
  }

  return {
    agentTemplates, agentApplicationProps, agentMappings, agentSchema, agentTemplateSources, agentSources, agentTemplateIcons, agentTemplateSourceArrays, agentTemplateDisplayNames, loadConfig,
  };
}

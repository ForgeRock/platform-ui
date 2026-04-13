/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const ACCOUNT_TYPES = {
  DEFAULT: 'default',
  MACHINE: 'machine',
  AGENT: 'agent',
};

const AGENT_APPLICATION_PROPS = {
  'aws.bedrock': {
    guardrails: 'guardrailId',
    identity: 'agentPrincipals',
    knowledge: 'knowledgeBases',
    tools: 'tools',
  },
  'azure.aifoundry': {
    guardrails: 'guardrailId',
    identity: 'agentPrincipals',
    knowledge: 'knowledgeBases',
    tools: 'toolsRaw',
  },
  'google.vertex': {
    guardrails: 'guardrailId',
    identity: 'agentPrincipals',
    knowledge: 'knowledgeBases',
    tools: 'tools',
  },
  'salesforce.agentforce': {
    guardrails: 'guardrailId',
    identity: 'agentPrincipals',
    knowledge: 'knowledgeBases',
    tools: 'tools',
  },
  default: {
    guardrails: 'guardrailId',
    identity: 'agentPrincipals',
    knowledge: 'knowledgeBases',
    tools: 'tools',
  },
};

const AGENT_ICONS = {
  guardrails: {
    icon: 'lock',
    color: 'green',
  },
  identity: {
    icon: 'link',
    color: 'blue',
  },
  knowledge: {
    icon: 'storage',
    color: 'orange',
  },
  tools: {
    icon: 'construction',
    color: 'purple',
  },
};

export default {
  ACCOUNT_TYPES,
  AGENT_APPLICATION_PROPS,
  AGENT_ICONS,
};

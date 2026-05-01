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

const AGENT_TEMPLATES = {
  AWS: 'aws.bedrock',
  AWS_AGENTCORE: 'aws-bedrock-agentcore',
  VERTEX: 'google.vertexai',
  M365: 'm365.copilot',
  AZURE: 'azure.aifoundry',
  SALESFORCE: 'sf.agentforce',
  PING: 'ping.aiagent',
};

const APPLICATION_PROPS = {
  GUARDRAILS: 'guardrails',
  IDENTITY: 'identity',
  KNOWLEDGE: 'knowledge',
  TOOLS: 'tools',
  TOOL_CREDENTIALS: 'toolCredentials',
  SERVICE_ACCOUNT: 'serviceAccount',
  CONNECTION: 'connection',
};

const AGENT_APPLICATION_PROPS = {
  [AGENT_TEMPLATES.AWS]: {
    [APPLICATION_PROPS.GUARDRAILS]: {
      accountAttribute: 'guardrailId',
      objectType: 'agentGuardrail',
      nameProperty: 'guardrailName',
      descriptionProperty: 'guardrailDescription',
    },
    [APPLICATION_PROPS.IDENTITY]: {
      accountAttribute: 'identityBindingIds',
      objectType: 'agentIdentityBinding',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.KNOWLEDGE]: {
      accountAttribute: 'knowledgeBases',
      objectType: 'agentKnowledgeBase',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOLS]: {
      accountAttribute: 'tools',
      objectType: 'agentTool',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOL_CREDENTIALS]: {
      accountAttribute: 'toolCredentialIds',
      objectType: 'agentToolCredentials',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
  },
  [AGENT_TEMPLATES.AWS_AGENTCORE]: {
    // No resources for agentcore
  },
  [AGENT_TEMPLATES.AZURE]: {
    [APPLICATION_PROPS.GUARDRAILS]: {
      accountAttribute: 'guardrailId',
      objectType: 'agentGuardrail',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.IDENTITY]: {
      accountAttribute: 'identityBindingIds',
      objectType: 'agentIdentityBinding',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.KNOWLEDGE]: {
      accountAttribute: 'knowledgeBaseIds',
      objectType: 'agentKnowledgeBase',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOLS]: {
      accountAttribute: 'toolIds',
      objectType: 'agentTool',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOL_CREDENTIALS]: {
      accountAttribute: 'toolCredentialIds',
      objectType: 'agentToolCredential',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',

    },
    [APPLICATION_PROPS.SERVICE_ACCOUNT]: {
      accountAttribute: 'serviceAccountIds',
      objectType: 'serviceAccount',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.CONNECTION]: {
      accountAttribute: 'connectionIds',
      objectType: 'agentConnection',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
  },
  [AGENT_TEMPLATES.VERTEX]: {
    [APPLICATION_PROPS.GUARDRAILS]: {
      accountAttribute: 'guardrailId',
      objectType: 'agentGuardrail',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.IDENTITY]: {
      accountAttribute: 'identityBindingIds',
      objectType: 'agentIdentityBinding',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.KNOWLEDGE]: {
      accountAttribute: 'knowledgeBaseIds',
      objectType: 'agentKnowledgeBase',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOLS]: {
      accountAttribute: 'toolIds',
      objectType: 'agentTool',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOL_CREDENTIALS]: {
      accountAttribute: 'toolCredentialIds',
      objectType: 'agentToolCredential',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.SERVICE_ACCOUNT]: {
      accountAttribute: 'serviceAccountIds',
      objectType: 'serviceAccount',
      nameProperty: 'displayName',
      descriptionProperty: 'description',
    },

  },
  [AGENT_TEMPLATES.M365]: {
    [APPLICATION_PROPS.IDENTITY]: {
      accountAttribute: 'identityBindingIds',
      objectType: 'agentIdentityBinding',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.KNOWLEDGE]: {
      accountAttribute: 'knowledgeBaseIds',
      objectType: 'agentKnowledgeBase',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOLS]: {
      accountAttribute: 'toolIds',
      objectType: 'agentTool',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
  },
  [AGENT_TEMPLATES.SALESFORCE]: {
    // No resources for salesforce
  },
  [AGENT_TEMPLATES.PING]: {
    // No resources for ping
  },
  default: {
    [APPLICATION_PROPS.GUARDRAILS]: {
      accountAttribute: 'guardrailId',
      objectType: 'agentGuardrail',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.IDENTITY]: {
      accountAttribute: 'identityBindingIds',
      objectType: 'agentIdentityBinding',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.KNOWLEDGE]: {
      accountAttribute: 'knowledgeBaseIds',
      objectType: 'agentKnowledgeBase',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOLS]: {
      accountAttribute: 'toolIds',
      objectType: 'agentTool',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.TOOL_CREDENTIALS]: {
      accountAttribute: 'toolCredentialIds',
      objectType: 'agentToolCredential',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',

    },
    [APPLICATION_PROPS.SERVICE_ACCOUNT]: {
      accountAttribute: 'serviceAccountIds',
      objectType: 'serviceAccount',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
    [APPLICATION_PROPS.CONNECTION]: {
      accountAttribute: 'connectionIds',
      objectType: 'agentConnection',
      nameProperty: '__NAME__',
      descriptionProperty: 'description',
    },
  },
};

const AGENT_ICONS = {
  [APPLICATION_PROPS.GUARDRAILS]: {
    icon: 'lock',
    color: 'green',
  },
  [APPLICATION_PROPS.IDENTITY]: {
    icon: 'link',
    color: 'blue',
  },
  [APPLICATION_PROPS.KNOWLEDGE]: {
    icon: 'storage',
    color: 'orange',
  },
  [APPLICATION_PROPS.TOOLS]: {
    icon: 'construction',
    color: 'purple',
  },
  [APPLICATION_PROPS.TOOL_CREDENTIALS]: {
    icon: 'key',
    color: 'yellow',
  },
  [APPLICATION_PROPS.SERVICE_ACCOUNT]: {
    icon: 'account_circle',
    color: 'teal',
  },
  [APPLICATION_PROPS.CONNECTION]: {
    icon: 'link',
    color: 'brown',
  },
};

export default {
  ACCOUNT_TYPES,
  APPLICATION_PROPS,
  AGENT_APPLICATION_PROPS,
  AGENT_ICONS,
  AGENT_TEMPLATES,
};

/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getResourceTypePrivilege } from '@forgerock/platform-shared/src/api/PrivilegeApi';

// eslint-disable-next-line import/prefer-default-export
export const useGovernanceStore = defineStore('governance', () => {
  const privileges = ref({});
  const schema = ref({});

  async function setPrivileges(resourcePath) {
    if (!privileges.value[resourcePath]) {
      const { data } = await getResourceTypePrivilege(resourcePath);
      privileges.value[resourcePath] = data;
    }
  }

  async function setSchema(resourcePath) {
    if (!schema.value[resourcePath]) {
      const { data: schemaData } = await getSchema(resourcePath);
      schema.value[resourcePath] = schemaData;
    }
  }

  return {
    privileges,
    schema,
    setPrivileges,
    setSchema,
  };
});

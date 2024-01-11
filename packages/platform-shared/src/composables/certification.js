/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { computed } from 'vue';
import { useCertificationStore } from '@forgerock/platform-shared/src/stores/certification';

export default function useCertification() {
  const certificationStore = useCertificationStore();
  const template = computed(() => certificationStore.template);

  function setTemplate(templateData) {
    certificationStore.template = templateData;
  }

  return {
    setTemplate,
    template,
  };
}

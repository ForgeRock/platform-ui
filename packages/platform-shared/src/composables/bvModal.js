/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref, getCurrentInstance, onBeforeMount } from 'vue';

export default function useBvModal() {
  const bvModal = ref(null);

  // Used onBeforeMount because the setup function is executed at the
  // beginning of the lifecycle and the bvModal is instantiated in the beforeCreated hook
  onBeforeMount(() => {
    const currentInstance = getCurrentInstance();
    bvModal.value = currentInstance.ctx._bv__modal;
  });

  return {
    bvModal,
  };
}

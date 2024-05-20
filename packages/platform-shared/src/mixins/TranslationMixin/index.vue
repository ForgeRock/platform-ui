<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import {
  translationExists,
  toTranslationKey,
  getLocalizedString,
  isTranslationKey,
  getTranslation,
} from '@forgerock/platform-shared/src/utils/translations';

export default {
  name: 'TranslationMixin',
  methods: {
    translationExists,
    toTranslationKey,
    getLocalizedString,
    isTranslationKey,
    getTranslation,
  },
};
</script>

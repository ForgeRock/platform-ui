/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import NewCheckbox from './NewCheckbox';
import Checkbox from './Checkbox';

const compatFeaturesDisabled = !!process.env.VUE_APP_COMPAT_FEATURES_DISABLED;
const exportedComponent = compatFeaturesDisabled ? NewCheckbox : Checkbox;
export default exportedComponent;

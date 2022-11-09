/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getExecutionModels } from '../../Pipelines/api/PipelineApi';

const fetchModelsData = (pipelineId) => getExecutionModels(pipelineId);
export default fetchModelsData;

/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// eslint-disable-next-line import/no-cycle
import { updateHypothetical } from './update';

const state = {
  modelId: '',
  hypothetical: {},
  riskConfig: {},
};

const setModelId = (id) => {
  state.modelId = id;

  if (!state.hypothetical[state.modelId]) {
    state.hypothetical[state.modelId] = {};
  }
};

const getHypothetical = () => state.hypothetical[state.modelId];

const setHypothetical = (d) => {
  state.hypothetical[state.modelId] = d;

  updateHypothetical();
};

// const getSelected = () => {
//   return state.selected[state.modelId];
// };

// const setSelected = (d) => {
//   state.selected[state.modelId] = d;

//   updateSelected();
// };

const getModelId = () => state.modelId;

const setRiskConfig = (riskConfig) => {
  state.riskConfig = riskConfig;
};

const getRiskConfig = () => state.riskConfig;

export {
  setModelId, getHypothetical, setHypothetical, getModelId, setRiskConfig, getRiskConfig,
};

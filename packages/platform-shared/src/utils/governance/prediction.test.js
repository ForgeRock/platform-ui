/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';
import {
  confidenceLevels,
  isHighConfidence,
  isLowConfidence,
  getConfidenceLevel,
  getConfidenceIconColor,
  getConfidenceIcon,
  getPredictionDisplayInfo,
  normalizePredictionData,
  convertRulesToDisplay,
} from './prediction';

const autoIdSettings = {
  enableAutoId: true,
  highScorePercentThreshold: 81.3,
  mediumScorePercentThreshold: 54,
  lowScorePercentThreshold: 24,
  training_features_filter: [
    'user.frIndexedString9',
    'user.frIndexedString10',
    'user.frIndexedString11',
    'user.frIndexedString12',
    'user.frIndexedString13',
    'user.frIndexedString14',
    'user.frIndexedString15',
    'user.frIndexedString16',
    'user.frIndexedString19',
    'user.city',
    'user.managerId',
  ],
  roleMiningConfidenceThreshold: 0.85,
  roleMiningMembershipThreshold: 3,
  roleMiningEntitlementThreshold: 2,
};

const data = {
  highConfidence: {
    prediction: {
      usr_id: '02_ID_fa51cc88-905e-40eb-ae04-2c7173b8e5a5',
      ent_id: '06_ENT_ID_system_ShowcaseSAP___GROUP___WEB_user_Sub-Division Consumption and analysis_II_7HQ',
      confidence: 1,
      rule: [
        '11_FRINDEXEDSTRING10_InfoSYS Power Gen',
        '11_FRINDEXEDSTRING12_SOL_YY1',
        '11_FRINDEXEDSTRING13_Service Representitive II',
      ],
      freq: 5,
      freqUnion: 5,
      is_assigned: '',
      last_usage: '',
      created: '2025-06-12T23:25:09.04036513Z',
    },
  },
  lowConfidence: {
    prediction: {
      usr_id: '02_ID_fa51cc88-905e-40eb-ae04-2c7173b8e5a5',
      ent_id: '06_ENT_ID_system_ShowcaseSAPFinance___GROUP___Business Units All Analytics_II_7HQ',
      confidence: 0.05,
      rule: [
        '11_FRINDEXEDSTRING13_Service Representitive II',
        '11_FRINDEXEDSTRING14_Strategy and Policy',
      ],
      freq: 56,
      freqUnion: 3,
      is_assigned: '',
      last_usage: '',
      created: '2025-06-12T23:26:59.893663608Z',
    },
  },
  mediumConfidence: {
    prediction: {
      usr_id: '02_ID_fa51cc88-905e-40eb-ae04-2c7173b8e5a5',
      ent_id: '06_ENT_ID_system_ShowcaseSAPFinance___GROUP___Business Units All Analytics_II_7HQ',
      confidence: 0.55,
      rule: [
        '11_FRINDEXEDSTRING13_Service Representitive II',
        '11_FRINDEXEDSTRING99_Strategy and Policy',
      ],
      freq: 22,
      freqUnion: 12,
      is_assigned: '',
      last_usage: '',
      created: '2025-06-12T23:26:59.893663608Z',
    },
  },
  differentPrediction: {
    prediction: {
      user_id: '02_ID_fa51cc88-905e-40eb-ae04-2c7173b8e5a5',
      ent_id: '06_ENT_ID_system_ShowcaseSAP___GROUP___WEB_user_Sub-Division Consumption and analysis_II_7HQ',
      CONF: 1,
      RULE: [
        '11_FRINDEXEDSTRING10_InfoSYS Power Gen',
        '11_FRINDEXEDSTRING12_SOL_YY1',
        '11_FRINDEXEDSTRING13_Service Representitive II',
      ],
      freq: 5,
      freqUnion: 5,
      is_assigned: '',
      last_usage: '',
      created: '2025-06-12T23:25:09.04036513Z',
    },
  },
};

const schema = {
  user: [
    {
      key: 'frIndexedString10',
      name: 'frIndexedString10',
      displayName: 'JOB_DESCRIPTION',
      description: 'Generic Indexed String 10',
      type: 'string',
      isMultiValue: false,
    },
    {
      key: 'frIndexedString11',
      name: 'frIndexedString11',
      displayName: 'USR_DEPARTMENT_NAME',
      description: 'Generic Indexed String 11',
      type: 'string',
      isMultiValue: false,
    },
    {
      key: 'frIndexedString12',
      name: 'frIndexedString12',
      displayName: 'COST_CENTER',
      description: 'Generic Indexed String 12',
      type: 'string',
      isMultiValue: false,
    },
    {
      key: 'frIndexedString13',
      name: 'frIndexedString13',
      displayName: 'JOBCODE_NAME',
      description: 'Generic Indexed String 13',
      type: 'string',
      isMultiValue: false,
    },
    {
      key: 'frIndexedString14',
      name: 'frIndexedString14',
      displayName: 'LINE_OF_BUSINESS',
      description: 'Generic Indexed String 14',
      type: 'string',
      isMultiValue: false,
    },
  ],
};

describe('Prediction Utility Functions', () => {
  describe('isHighConfidence', () => {
    it('should return true for high confidence items', () => {
      expect(isHighConfidence(data.highConfidence.prediction, autoIdSettings)).toBeTruthy();
    });

    it('should return false for non-high confidence items', () => {
      expect(isHighConfidence(data.lowConfidence.prediction, autoIdSettings)).toBeFalsy();
    });
  });

  describe('isLowConfidence', () => {
    it('should return true for low confidence items', () => {
      expect(isLowConfidence(data.lowConfidence.prediction, autoIdSettings)).toBeTruthy();
    });

    it('should return false for non-low confidence items', () => {
      expect(isLowConfidence(data.highConfidence.prediction, autoIdSettings)).toBeFalsy();
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return the correct confidence level for high confidence items', () => {
      expect(getConfidenceLevel(data.highConfidence.prediction, autoIdSettings)).toBe(confidenceLevels.HIGH);
    });

    it('should return the correct confidence level for low confidence items', () => {
      expect(getConfidenceLevel(data.lowConfidence.prediction, autoIdSettings)).toBe(confidenceLevels.LOW);
    });

    it('should return medium for items with mid confidence level', () => {
      expect(getConfidenceLevel(data.mediumConfidence.prediction, autoIdSettings)).toBe(confidenceLevels.MEDIUM);
    });
  });

  describe('getConfidenceIconColor', () => {
    it('should return green for high confidence', () => {
      expect(getConfidenceIconColor(confidenceLevels.HIGH)).toBe('green');
    });

    it('should return red for low confidence', () => {
      expect(getConfidenceIconColor(confidenceLevels.LOW)).toBe('red');
    });
  });

  describe('getConfidenceIcon', () => {
    it('should return the correct icon for high confidence', () => {
      expect(getConfidenceIcon(confidenceLevels.HIGH)).toBe('thumb_up_off_alt');
    });

    it('should return the correct icon for low confidence', () => {
      expect(getConfidenceIcon(confidenceLevels.LOW)).toBe('thumb_down_off_alt');
    });

    it('should return the correct icon for low confidence', () => {
      expect(getConfidenceIcon(confidenceLevels.MEDIUM)).toBe('horizontal_rule');
    });
  });

  describe('convertRulesToDisplay', () => {
    it('should convert rules correctly for valid input', () => {
      const displayRules = convertRulesToDisplay(data.highConfidence.prediction.rule, schema.user);
      const expectedValue = [
        { ...schema.user[0], value: 'InfoSYS Power Gen' },
        { ...schema.user[2], value: 'SOL_YY1' },
        { ...schema.user[3], value: 'Service Representitive II' },
      ];
      expect(displayRules).toEqual(expectedValue);
    });

    it('should convert rules correctly when a given schema object is not found', () => {
      const displayRules = convertRulesToDisplay(data.mediumConfidence.prediction.rule, schema.user);
      const expectedValue = [
        { ...schema.user[3], value: 'Service Representitive II' },
        { key: 'FRINDEXEDSTRING99', value: 'Strategy and Policy', displayName: 'FRINDEXEDSTRING99' },
      ];
      expect(displayRules).toEqual(expectedValue);
    });

    it('should handle empty rules array', () => {
      const displayRules = convertRulesToDisplay([], schema.user);
      expect(displayRules).toEqual([]);
    });
  });

  describe('normalizePredictionData', () => {
    it('should normalize prediction data correctly', () => {
      const expectedData = cloneDeep(data.highConfidence.prediction);
      expectedData.CONF = expectedData.confidence;
      expectedData.user_id = expectedData.usr_id;
      expectedData.RULE = expectedData.rule;
      const dataToNormalize = cloneDeep(data.differentPrediction.prediction);
      normalizePredictionData(dataToNormalize);
      expect(dataToNormalize).toEqual(expectedData);
    });
  });

  describe('getPredictionDisplayInfo', () => {
    it('should return correct display info for valid item', () => {
      const predictionWithDisplay = getPredictionDisplayInfo(data.highConfidence, autoIdSettings);
      expect(predictionWithDisplay.confidenceLevel).toEqual(confidenceLevels.HIGH);
      expect(predictionWithDisplay.confidenceIcon).toEqual('thumb_up_off_alt');
      expect(predictionWithDisplay.confidenceIconColor).toEqual('green');
    });
  });
});

/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import RecommendationBanner from './RecommendationBanner';
import i18n from '@/i18n';

describe('RecommendationBanner', () => {
  const defaultPropsData = {
    autoIdSettings: {
      enableAutoId: true,
      highScorePercentThreshold: 81.3,
      lowScorePercentThreshold: 24,
      mediumScorePercentThreshold: 54,
    },
    prediction: {
      confidence: 1,
      confidenceLevel: 'HIGH',
      confidencePercentage: 100,
    },
    userDisplayName: 'Test User',
    objectDisplayName: 'Test Object',
  };

  const lowConfidencePropsData = cloneDeep(defaultPropsData);
  lowConfidencePropsData.prediction = {
    confidence: 0.20,
    confidenceLevel: 'LOW',
    confidencePercentage: 20,
  };

  const mediumConfidencePropsData = cloneDeep(defaultPropsData);
  mediumConfidencePropsData.prediction = {
    confidence: 0.75,
    confidenceLevel: 'MEDIUM',
    confidencePercentage: 75,
  };

  const createWrapper = (props) => mount(RecommendationBanner, {
    props,
    global: {
      plugins: [i18n],
    },
    attachTo: document.body,
  });

  it('component should render high recommendation properly', () => {
    const wrapper = createWrapper(defaultPropsData);
    const boldText = wrapper.find('strong');
    const spans = wrapper.findAll('span');
    expect(boldText.text()).toContain('Access recommended');
    expect(spans[2].text()).toContain('100% of people similar to Test User have been provisioned Test Object');
  });

  it('component should render low recommendation properly', () => {
    const wrapper = createWrapper(lowConfidencePropsData);
    const boldText = wrapper.find('strong');
    const spans = wrapper.findAll('span');
    expect(boldText.text()).toContain('Access not recommended');
    expect(spans[2].text()).toContain('Only 20% of people similar to Test User have been provisioned Test Object');
  });

  it('component should render properly', () => {
    const wrapper = createWrapper(mediumConfidencePropsData);
    const boldText = wrapper.find('strong');
    const spans = wrapper.findAll('span');
    expect(boldText.text()).toEqual('No recommendation');
    expect(spans[2].text()).toContain('75% of people similar to Test User have been provisioned Test Object');
  });
});

/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import RecommendationIcon from './RecommendationIcon';
import i18n from '@/i18n';

describe('RecommendationIcon', () => {
  const defaultPropsData = {
    autoIdSettings: {
      enableAutoId: true,
      highScorePercentThreshold: 81.3,
      lowScorePercentThreshold: 24,
      mediumScorePercentThreshold: 54,
    },
    testMode: true,
    id: 'test',
    prediction: {
      usr_id: '02_ID_fa51cc88-905e-40eb-ae04-2c7173b8e5a5',
      ent_id: '06_ENT_ID_system_ShowcaseSAP___GROUP___WEB_user_Sub-Division Consumption and analysis_II_7HQ',
      confidence: 1,
      confidenceIcon: 'thumb_up_off_alt',
      confidenceIconColor: 'green',
      confidenceLevel: 'HIGH',
      confidencePercentage: 100,
      rule: [
        {
          displayName: 'JOB_DESCRIPTION',
          value: 'InfoSYS Power Gen',
        },
        {
          displayName: 'CHIEF_YES_NO',
          value: 'Yes',
        },
      ],
    },
  };

  const createWrapper = (props) => mount(RecommendationIcon, {
    props,
    global: {
      plugins: [i18n],
      stubs: ['BPopover'],
    },
    attachTo: document.body,
  });

  it('component should render properly', () => {
    const wrapper = createWrapper(defaultPropsData);
    const icon = wrapper.find('.color-green');
    expect(icon.exists()).toBeTruthy();
    const popover = wrapper.findComponent({ name: 'BPopover' });
    expect(popover.attributes('target')).toBe('predictionIcon-test');
  });
});

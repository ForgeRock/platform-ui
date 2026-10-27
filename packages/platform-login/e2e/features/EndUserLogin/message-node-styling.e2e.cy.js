/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach } from '@e2e/util';
import apiSteps from '@e2e/steps/apiSteps';
import { JOURNEYS } from '@e2e/support/constants';
import enduser from '../../persona/enduserSteps';

describe('Message node styling', { tags: ['@cloud', '@forgeops'] }, () => {
  const { messageNodeStyling } = enduser;

  const POSITIVE = 'continue';
  const NEGATIVE = 'exit';

  before(() => {
    apiSteps.journey.importJourney({ name: JOURNEYS.STYLING_ON_MESSAGE_NODE.name });
  });

  after(() => {
    cy.loginAsAdminCached().then(() => {
      apiSteps.journey.deleteImportedJourneys();
    });
  });

  retryableBeforeEach(() => {
    enduser.login.logout();
    messageNodeStyling.visit();
    messageNodeStyling.assertDefaultTheme();
  });

  it('[C25118] Journey Flow Node Styling', () => {
    // Page 1: entry MessageNode renders with the default theme and stacked Yes/No buttons
    messageNodeStyling.assertActionsStacked('Yes', 'No');

    // Page 2: username page, theme remains the default, Next stacked
    messageNodeStyling.clickActionButton('Yes');
    messageNodeStyling.assertDefaultTheme();
    messageNodeStyling.assertNextStacked();

    // Page 3: theme switches to the journey theme, buttons inline and left positioned
    messageNodeStyling.typeUserName('anything');
    messageNodeStyling.clickNext();
    messageNodeStyling.assertJourneyThemeSwitched();
    messageNodeStyling.assertActionsInlineLeft(POSITIVE, NEGATIVE);

    // Page 4: theme persists, both actions render as links side by side, left positioned
    messageNodeStyling.clickActionButton(POSITIVE);
    messageNodeStyling.assertJourneyThemePersists();
    messageNodeStyling.assertActionsRenderAsLinks(POSITIVE, NEGATIVE);
    messageNodeStyling.assertActionsInlineLeft(POSITIVE, NEGATIVE);

    // Page 5: theme persists, only the positive action remains, as a button
    messageNodeStyling.clickActionButton(POSITIVE);
    messageNodeStyling.assertJourneyThemePersists();
    messageNodeStyling.assertOnlyPositiveActionButton(POSITIVE);

    // Page 6: theme persists, only the positive action remains, as a link
    messageNodeStyling.clickActionButton(POSITIVE);
    messageNodeStyling.assertJourneyThemePersists();
    messageNodeStyling.assertOnlyPositiveActionLink(POSITIVE);

    // Page 7: failure page — error alert and restored action buttons, left positioned
    messageNodeStyling.clickActionButton(POSITIVE);
    messageNodeStyling.assertLoginFailureVisible();
    messageNodeStyling.assertJourneyThemePersists();
    messageNodeStyling.assertActionsInlineLeft('Yes', 'No');
    messageNodeStyling.assertFailureAlertLeftPositioned();

    // The flow repeats: Yes on the failure view lands on the username page again
    messageNodeStyling.clickActionButton('Yes');
    messageNodeStyling.assertJourneyThemePersists();
    messageNodeStyling.assertNextInlineLeft();
  });
});

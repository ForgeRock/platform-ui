/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { journeyCleanupManager } from '@e2e/utils/manageJourneys';
import { generateJourneyFileName } from '@e2e/utils/journeyUtils';

export default class JourneyApiSteps {
  static importJourney(journey) {
    const alreadyImported = journeyCleanupManager.getAll().find((j) => j.name === journey.name);
    if (!alreadyImported) {
      const fileName = generateJourneyFileName(journey.name);
      cy.importTreesViaAPI([fileName]).then(() => {
        journeyCleanupManager.add({ name: journey.name, fileName });
      });
    }
  }

  static deleteImportedJourneys() {
    journeyCleanupManager.cleanup();
  }
}

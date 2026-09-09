/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { addOverrides, deleteOverrides, getOverrides } from '@e2e/api/localizationApi.e2e';

export default class LocalizationApiSteps {
  /**
   * Per-locale pre-existing state, captured before seeding:
   * - null: record was absent, must not be restored
   * - { body }: complete payload to restore in cleanup
   */
  static existingOverrides = {};

  /**
   * Complete records the suite itself created (no snapshot existed) that
   * cleanup must delete.
   */
  static createdLocales = [];

  /**
   * Snapshot the current record for a locale. Must be called before seeding
   * so cleanup knows whether to restore or delete. Only the first snapshot
   * per locale is kept: later steps in the suite may re-snapshot a locale
   * whose state this suite has already changed, and cleanup must restore the
   * pristine pre-run record, not an intermediate one.
   */
  static snapshotOverride(locale) {
    return getOverrides(locale).then((response) => {
      if (locale in LocalizationApiSteps.existingOverrides) {
        return response;
      }
      if (response.status === 200) {
        LocalizationApiSteps.existingOverrides[locale] = { body: response.body };
      } else if (response.status === 404) {
        LocalizationApiSteps.existingOverrides[locale] = null;
      } else {
        throw new Error(`Unexpected status ${response.status} snapshotting uilocale/${locale}`);
      }
      return response;
    });
  }

  /**
   * Seed a locale only after snapshotting its pre-existing state. If a record
   * already exists, its complete payload is captured for restore; otherwise
   * the seeded record is tracked for deletion.
   */
  static seedOverrides(locale, body) {
    return LocalizationApiSteps.snapshotOverride(locale).then(() => addOverrides(locale, body).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      if (LocalizationApiSteps.existingOverrides[locale] === null) {
        LocalizationApiSteps.createdLocales.push(locale);
      }
      return response;
    }));
  }

  /**
   * Ensure a locale record is absent. If one exists, its complete payload is
   * captured for restore. Used by C20207 to establish the missing-PL
   * precondition for a locale that may pre-exist on shared environments.
   */
  static ensureOverrideAbsent(locale) {
    return LocalizationApiSteps.snapshotOverride(locale).then((response) => {
      if (response.status === 200) {
        return deleteOverrides(locale).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);
          return deleteResponse;
        });
      }
      return response;
    });
  }

  /**
   * Restore every snapshotted pre-existing record and delete every record the
   * suite created. A failure fails visibly and leaves state tracked for
   * diagnosis rather than silently clearing the trackers.
   */
  static cleanupOverrides() {
    return cy.wrap({ restores: LocalizationApiSteps.existingOverrides, deletes: [...LocalizationApiSteps.createdLocales] }, { log: false })
      .then(({ restores, deletes }) => {
        // Restores first: re-PUT complete payloads for records that existed before the run.
        const restoreEntries = Object.entries(restores).filter(([, snapshot]) => snapshot !== null);

        return cy.wrap(restoreEntries, { log: false }).each(([locale, snapshot]) => addOverrides(locale, snapshot.body).then((response) => {
          expect(response.status).to.eq(200);
        })).then(() => cy.wrap(deletes, { log: false }).each((locale) => deleteOverrides(locale, false).then((response) => {
          expect(response.status).to.be.oneOf([200, 404]);
        })));
      })
      .then(() => {
        LocalizationApiSteps.existingOverrides = {};
        LocalizationApiSteps.createdLocales = [];
      });
  }
}

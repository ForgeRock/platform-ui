/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  getProxyConnectConfig, putProxyConnectConfig, seedIpRanges,
} from '@e2e/api/proxyConnectApi.e2e';

/**
 * The clean tenant config the spec's expectations assume: status OPEN with no
 * rules configured. Tests that need another state seed it themselves.
 */
const KNOWN_BASELINE = {
  proxyStatus: 'OPEN',
  headerRules: { enabled: false, headers: [] },
  ipRules: { enabled: false, ipRanges: [] },
};

export default class ProxyConnectApiSteps {
  /**
   * Snapshot of the tenant config captured by snapshotConfig() in beforeEach,
   * restored by restoreConfig() in afterEach.
   */
  static originalConfig = null;

  /**
   * proxyStatus sent by the UI's apply PUT, captured by interceptApplyFastForward
   * and merged into the intercepted status polls so the UI settles on the new
   * status immediately.
   */
  static appliedProxyStatus = null;

  static getProxyConnectConfig() {
    return getProxyConnectConfig();
  }

  static putProxyConnectConfig(body) {
    return putProxyConnectConfig(body);
  }

  static seedIpRanges(ipRanges) {
    return seedIpRanges(ipRanges)
      .then(() => ProxyConnectApiSteps.asyncWaitForServerApply())
      // A SUCCESS response can be the previous apply's — the PUT returns
      // before this apply has registered, so the first poll may read stale
      // settled state. Verify the seeded ranges are actually live before
      // proceeding (observed empty-after-seed on 2026-10-27).
      .then(() => ProxyConnectApiSteps.waitForIpRanges(ipRanges));
  }

  /**
   * Polls until GET /environment/proxy-connect reports exactly the given IP
   * ranges, guarding against reading pre-apply state that still carries a
   * stale SUCCESS requestStatus.
   *
   * @param {Array} ipRanges expected seeded IP strings
   */
  static waitForIpRanges(ipRanges, maxAttempts = 20) {
    return cy.wrap(null).then({ timeout: 300000 }, () => {
      const poll = (attempt) => {
        if (attempt >= maxAttempts) {
          throw new Error(`Seeded IP ranges ${JSON.stringify(ipRanges)} did not appear within ${maxAttempts} polls`);
        }
        return getProxyConnectConfig().then(({ body }) => {
          const live = JSON.stringify([...(body.ipRules?.ipRanges || [])].sort());
          const expected = JSON.stringify([...ipRanges].sort());
          if (live === expected) return cy.wrap(body);
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          return cy.wait(12000).then(() => poll(attempt + 1));
        });
      };
      return poll(0);
    });
  }

  /**
   * Puts the tenant into KNOWN_BASELINE if it is not already there, so tests
   * never assume a starting state left behind by a previous run. No-ops (one
   * GET, no PUT) when the tenant is already clean.
   */
  static seedKnownBaseline() {
    return getProxyConnectConfig().then(({ body }) => {
      const isClean = body.proxyStatus === KNOWN_BASELINE.proxyStatus
        && body.headerRules.enabled === false
        && (body.headerRules.headers || []).length === 0
        && body.ipRules.enabled === false
        && (body.ipRules.ipRanges || []).length === 0;
      if (isClean) return null;
      return putProxyConnectConfig(KNOWN_BASELINE)
        .then(() => ProxyConnectApiSteps.asyncWaitForServerApply('OPEN'));
    });
  }

  /**
   * Captures the current Proxy Connect config so afterEach can restore it,
   * even if a test crashes mid-apply. Safe to call repeatedly — an existing
   * snapshot is kept (the beforeEach snapshot must survive any in-test
   * re-snapshots taken after seeding).
   */
  static snapshotConfig() {
    return getProxyConnectConfig().then(({ body }) => {
      if (!ProxyConnectApiSteps.originalConfig) {
        ProxyConnectApiSteps.originalConfig = {
          proxyStatus: body.proxyStatus,
          headerRules: {
            enabled: body.headerRules.enabled,
            headers: body.headerRules.headers || [],
          },
          ipRules: {
            enabled: body.ipRules.enabled,
            ipRanges: body.ipRules.ipRanges || [],
          },
        };
      }
    });
  }

  /**
   * Restores the exact pre-test config captured by snapshotConfig(). Waits for
   * any in-flight server-side apply to settle first, since every PUT (the
   * test's apply and this restore) starts an async apply on the backend.
   */
  static restoreConfig() {
    return cy.wrap(null).then(() => {
      if (!ProxyConnectApiSteps.originalConfig) return null;
      return ProxyConnectApiSteps.asyncWaitForServerApply()
        .then(() => putProxyConnectConfig(ProxyConnectApiSteps.originalConfig))
        .then(() => ProxyConnectApiSteps.asyncWaitForServerApply())
        .then(() => {
          ProxyConnectApiSteps.originalConfig = null;
          ProxyConnectApiSteps.appliedProxyStatus = null;
        });
    });
  }

  /**
   * Intercepts the UI's apply PUT (pass-through) and remembers the applied
   * proxyStatus for the fast-forwarded status polls. cy.request calls from the
   * API helpers bypass cy.intercept entirely, so only the browser-side UI apply
   * is captured.
   */
  static interceptApplyFastForward() {
    cy.intercept('PUT', '**/environment/proxy-connect', (req) => {
      req.continue((res) => {
        ProxyConnectApiSteps.appliedProxyStatus = req.body?.proxyStatus ?? null;
        res.send();
      });
    }).as('putProxyConnectApply');
  }

  /**
   * Waits for the UI's apply PUT to reach the server (200 with a requestId),
   * then registers the GET poll intercept that fast-forwards the UI's 15-second
   * poll loop: every subsequent browser GET merges requestStatus: 'SUCCESS' and
   * the applied proxyStatus into the real response, so the UI shows the success
   * toast and settles on the new status immediately. The real server-side apply
   * still proceeds — final assertions read real state via cy.request, which
   * bypasses these intercepts.
   */
  static waitApplyRequest() {
    return cy.wait('@putProxyConnectApply').then(({ response }) => {
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.have.property('requestId');

      cy.intercept('GET', '**/environment/proxy-connect', (req) => {
        req.reply((res) => {
          if (res.statusCode === 200) {
            res.body.requestStatus = 'SUCCESS';
            if (ProxyConnectApiSteps.appliedProxyStatus) {
              res.body.proxyStatus = ProxyConnectApiSteps.appliedProxyStatus;
            }
          }
          res.send();
        });
      }).as('getProxyConnectStatus');
    });
  }

  /**
   * Waits for the merged-SUCCESS poll response and the app's post-SUCCESS
   * config reload GET, so the success toast and status radio are both settled.
   */
  static waitSuccessPoll() {
    return cy.wait('@getProxyConnectStatus', { timeout: 40000 })
      .then(() => cy.wait('@getProxyConnectStatus', { timeout: 15000 }));
  }

  /**
   * Waits until the server-side apply settles (requestStatus SUCCESS / FAILED /
   * absent-after-at-least-one-POLL) so subsequent PUTs (seeding, restore) and
   * real-state assertions do not collide with an in-flight apply. Polls up to
   * ~4 minutes (20 × 12s) — a loaded tenant has been observed holding
   * requestStatus PENDING past 72s (2026-10-27 run). When `expectedProxyStatus`
   * is given, additionally asserts the applied state actually took effect — a
   * backend that silently reverts (e.g. a config it refuses to apply) fails
   * here instead of deeper in the test.
   * Fails the test explicitly when the apply does not settle within the poll
   * budget, so callers never proceed (e.g. into the restore PUT) while an apply
   * is still in flight.
   */
  static asyncWaitForServerApply(maxAttempts = 20, expectedProxyStatus = null) {
    return cy.wrap(null).then({ timeout: 300000 }, () => {
      let lastBody = null;
      const poll = (attempt) => {
        if (attempt >= maxAttempts) {
          const reach = expectedProxyStatus ? ` to reach proxyStatus "${expectedProxyStatus}"` : '';
          throw new Error(
            `Proxy Connect server-side apply did not settle within ${maxAttempts} polls (~${maxAttempts * 12}s)`
            + `${reach}. Last observed config: ${JSON.stringify(lastBody)}`,
          );
        }
        return getProxyConnectConfig(null, { failOnStatusCode: false }).then(({ body }) => {
          lastBody = body;
          const settled = body.requestStatus === 'SUCCESS'
            || body.requestStatus === 'FAILED'
            || (!body.requestStatus && attempt > 0);
          if (settled) {
            if (expectedProxyStatus) {
              expect(body.proxyStatus).to.eq(expectedProxyStatus);
            }
            return cy.wrap(body);
          }
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          return cy.wait(12000).then(() => poll(attempt + 1));
        });
      };
      return poll(0);
    });
  }
}

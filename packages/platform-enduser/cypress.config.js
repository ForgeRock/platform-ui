/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const { defineConfig } = require('cypress');
const { default: lighthouse } = require('lighthouse');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  chromeWebSecurity: false,
  experimentalWebKitSupport: true,
  experimentalMemoryManagement: true,
  video: true,
  retries: 2,
  reporter: '../../node_modules/mochawesome',
  reporterOptions: {
    overwrite: false,
    html: false,
    json: true,
  },
  env: {
    lighthousePassThreshold: {
      performance: 0.75,
      accessibility: 0.75,
      'best-practices': 0.75,
    },
    hars_folders: 'e2e/hars',
  },
  fixturesFolder: 'e2e/fixtures',
  screenshotsFolder: 'e2e/screenshots',
  videosFolder: 'e2e/videos',
  downloadsFolder: 'e2e/downloads',
  e2e: {
    taskTimeout: 120000, // 2 minutes for Lighthouse audits (matches internal TIMEOUT_MS)
    async setupNodeEvents(on, config) {
      // Register Lighthouse task for performance audits
      if (process.env.LIGHTHOUSE_ENABLED === 'true') {
        on('task', {
          async lighthouseAudit({ url, outputPath }) {
            let browser;
            const startTime = Date.now();
            const TIMEOUT_MS = 120000; // 2 minutes max

            try {
              // Connect to Cypress's Chrome instance via CDP (Chrome DevTools Protocol)
              const cdpPort = parseInt(process.env.CYPRESS_REMOTE_DEBUGGING_PORT || config.env.cdpPort || '9222', 10);

              // Validate CDP port
              if (Number.isNaN(cdpPort) || cdpPort < 1 || cdpPort > 65535) {
                throw new Error(`Invalid CDP port: ${cdpPort}. Must be between 1-65535`);
              }

              // eslint-disable-next-line no-console
              console.log(`[Lighthouse] Auditing ${url} on CDP port ${cdpPort}`);

              // Use Puppeteer to connect to Chrome and create a new page in the same browser context
              // eslint-disable-next-line global-require
              const puppeteer = require('puppeteer-core');
              browser = await puppeteer.connect({
                browserURL: `http://localhost:${cdpPort}`,
                defaultViewport: null,
              });

              // Step 1: Navigate to origin (IndexedDB is origin-scoped)
              const tempPage = await browser.newPage();
              const targetUrl = new URL(url);
              const originUrl = `${targetUrl.protocol}//${targetUrl.host}`;
              await tempPage.goto(originUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

              // Step 1.5: Verify OAuth flow has been initiated (wait for IndexedDB database to be created)
              // eslint-disable-next-line no-console
              console.log('[Lighthouse] Verifying OAuth flow has been initiated...');
              const initTimeout = 5000; // 5 seconds to detect OAuth flow start
              const initStartTime = Date.now();
              let dbExists = false;

              while (!dbExists && (Date.now() - initStartTime) < initTimeout) {
                // eslint-disable-next-line no-await-in-loop
                dbExists = await tempPage.evaluate(() => new Promise((resolve) => {
                  try {
                    const dbReq = window.indexedDB.open('appAuth');
                    dbReq.onsuccess = (event) => {
                      const db = event.target.result;
                      const exists = db.objectStoreNames.contains('end-user-ui');
                      db.close();
                      resolve(exists);
                    };
                    dbReq.onerror = () => resolve(false);
                    dbReq.onblocked = () => resolve(false);
                  } catch (error) {
                    resolve(false);
                  }
                }));

                if (!dbExists) {
                  // eslint-disable-next-line no-await-in-loop
                  await new Promise((resolve) => setTimeout(resolve, 200));
                }
              }

              if (!dbExists) {
                throw new Error('[Lighthouse] OAuth flow not initiated - IndexedDB database not found within 5s');
              }

              // eslint-disable-next-line no-console
              console.log('[Lighthouse] OAuth flow detected, waiting for token population...');

              // Step 2: Poll IndexedDB for OAuth tokens (async OAuth flow)
              // eslint-disable-next-line no-console
              console.log('[Lighthouse] Waiting for OAuth tokens in IndexedDB (30s timeout)...');
              const authTimeout = 30000;
              const authStartTime = Date.now();
              let hasAuth = false;
              let attemptCount = 0;

              while (!hasAuth && (Date.now() - authStartTime) < authTimeout) {
                attemptCount += 1;
                const elapsed = Date.now() - authStartTime;

                if (attemptCount % 5 === 1) { // Log every 2.5 seconds
                  // eslint-disable-next-line no-console
                  console.log(`[Lighthouse] Polling attempt ${attemptCount}, elapsed: ${elapsed}ms`);
                }

                // eslint-disable-next-line no-await-in-loop
                hasAuth = await tempPage.evaluate(() => new Promise((resolve) => {
                  try {
                    const dbReq = window.indexedDB.open('appAuth');

                    dbReq.onsuccess = (event) => {
                      const db = event.target.result;

                      // Check if 'end-user-ui' store exists
                      if (!db.objectStoreNames.contains('end-user-ui')) {
                        db.close();
                        resolve(false);
                        return;
                      }

                      // Read tokens from store
                      const tx = db.transaction('end-user-ui', 'readonly');
                      const store = tx.objectStore('end-user-ui');
                      const req = store.get('tokens');

                      req.onsuccess = () => {
                        db.close();
                        resolve(!!req.result);
                      };

                      req.onerror = () => {
                        db.close();
                        resolve(false);
                      };

                      // Handle transaction abort (e.g., due to conflicts)
                      tx.onabort = () => {
                        db.close();
                        resolve(false);
                      };
                    };

                    dbReq.onerror = () => {
                      // Database access error (e.g., permissions, corruption)
                      resolve(false);
                    };

                    dbReq.onblocked = () => {
                      // Database is blocked by another connection (e.g., version change pending)
                      resolve(false);
                    };
                  } catch (error) {
                    // Handle any synchronous errors (e.g., IndexedDB not available)
                    resolve(false);
                  }
                }));

                if (!hasAuth) {
                  // eslint-disable-next-line no-await-in-loop
                  await new Promise((resolve) => setTimeout(resolve, 500)); // Poll every 500ms
                }
              }

              if (!hasAuth) {
                // eslint-disable-next-line no-console
                console.error(`[Lighthouse] OAuth tokens not found after ${authTimeout}ms`);
                throw new Error(`OAuth tokens not found in IndexedDB after ${authTimeout}ms. AppAuthHelper may have failed to complete OAuth flow.`);
              }

              // eslint-disable-next-line no-console
              console.log(`[Lighthouse] ✓ OAuth tokens found after ${Date.now() - authStartTime}ms (${attemptCount} attempts)`);

              // Step 3: Close temporary page
              await tempPage.close();

              // Check timeout before running Lighthouse
              if (Date.now() - startTime > TIMEOUT_MS) {
                throw new Error(`Lighthouse audit timeout: exceeded ${TIMEOUT_MS}ms during setup`);
              }

              // Step 4: Run Lighthouse audit with authenticated page
              const options = {
                port: cdpPort,
                output: ['json', 'html'],
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                disableStorageReset: true, // Preserve IndexedDB/cookies
                throttling: {
                  rttMs: 0,
                  throughputKbps: 0,
                  cpuSlowdownMultiplier: 1,
                },
                screenEmulation: { disabled: true },
                maxWaitForLoad: 60000,
              };

              // Run Lighthouse audit without artificial timeout race
              // The taskTimeout (120000ms) will handle overall timeout
              // This allows sufficient time for OAuth/IndexedDB flow + audit
              const runnerResult = await lighthouse(url, options);

              if (!runnerResult || !runnerResult.lhr) {
                throw new Error('Lighthouse returned empty result');
              }

              // Validate categories exist before accessing
              const {
                performance, accessibility, seo,
                'best-practices': bestPractices,
              } = runnerResult.lhr.categories;
              if (!performance || !accessibility || !bestPractices || !seo) {
                throw new Error('Lighthouse result missing expected categories');
              }

              if (outputPath && runnerResult.report) {
                // Ensure output directory exists
                const outputDir = path.dirname(outputPath);
                if (!fs.existsSync(outputDir)) {
                  fs.mkdirSync(outputDir, { recursive: true });
                }

                fs.writeFileSync(outputPath, JSON.stringify(runnerResult.lhr, null, 2));
                const htmlPath = outputPath.replace('.json', '.html');
                const htmlReport = Array.isArray(runnerResult.report) && runnerResult.report.length > 1
                  ? runnerResult.report[1]
                  : runnerResult.report;
                fs.writeFileSync(htmlPath, htmlReport);
              }

              return {
                performance: performance.score * 100,
                accessibility: accessibility.score * 100,
                'best-practices': bestPractices.score * 100,
                seo: seo.score * 100,
              };
            } catch (error) {
              const elapsed = Math.round((Date.now() - startTime) / 1000);
              // eslint-disable-next-line no-console
              console.error(`[Lighthouse] Audit failed after ${elapsed}s: ${error.message}`);

              // Re-throw with execution time for debugging
              throw new Error(`${error.message} (after ${elapsed}s)`);
            } finally {
              // Clean up: close the audit page and disconnect from browser
              if (browser) {
                try {
                  const pages = await browser.pages();
                  const auditPages = pages.filter((p) => !p.url().includes('/__/'));
                  await Promise.all(auditPages.map((p) => p.close().catch(() => {})));
                  await browser.disconnect();
                } catch (err) {
                  // Ignore cleanup errors
                }
              }
            }
          },
        });
      }

      // Override specPattern for Percy visual tests
      if (process.env.PERCY_ENABLED === 'true') {
        config.specPattern = 'e2e/tests/visuals/**/*.visual.cy.js';
        config.excludeSpecPattern = [];
      }

      return require('../../e2e/plugins/index.js')(on, config); // eslint-disable-line global-require
    },
    excludeSpecPattern: ['lighthouse.suite.cy.js', 'e2e/tests/visuals/**/*'],
    specPattern: 'e2e/tests/**/*.{js,feature}',
    supportFile: 'e2e/support/index.js',
  },
});

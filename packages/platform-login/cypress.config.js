/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const { defineConfig } = require('cypress');
const { default: lighthouse } = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

module.exports = defineConfig({
  experimentalMemoryManagement: true,
  video: true,
  retries: 2,
  reporter: '../../node_modules/mochawesome',

  reporterOptions: {
    overwrite: false,
    html: false,
    json: true,
  },

  chromeWebSecurity: false,

  experimentalWebKitSupport: true,

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
    taskTimeout: 120000, // 2 minutes for Lighthouse audits
    async setupNodeEvents(on, config) {
      // Register Lighthouse task for performance audits
      if (process.env.LIGHTHOUSE_ENABLED === 'true') {
        on('task', {
          async lighthouseAudit({ url, outputPath, cookies }) {
            let chrome;
            try {
              // Launch Chrome on available port
              chrome = await chromeLauncher.launch({
                chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
              });

              // Build Cookie header from Cypress cookies
              const cookieHeader = cookies && cookies.length > 0
                ? cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
                : '';

              // Run Lighthouse audit with authentication
              const options = {
                port: chrome.port,
                output: 'json',
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                extraHeaders: cookieHeader ? { Cookie: cookieHeader } : {},
              };

              const runnerResult = await lighthouse(url, options);

              // Save to file for run-tests.sh compatibility
              if (outputPath && runnerResult.lhr) {
                fs.writeFileSync(outputPath, JSON.stringify(runnerResult.lhr, null, 2));
              }

              // Return scores in expected format
              return {
                performance: runnerResult.lhr.categories.performance.score * 100,
                accessibility: runnerResult.lhr.categories.accessibility.score * 100,
                'best-practices': runnerResult.lhr.categories['best-practices'].score * 100,
                seo: runnerResult.lhr.categories.seo.score * 100,
              };
            } finally {
              if (chrome) await chrome.kill();
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

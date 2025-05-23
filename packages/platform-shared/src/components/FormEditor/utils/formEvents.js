/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep } from 'lodash';

/**
 * Executes a given script in a Web Worker, providing form values and schema as variables.
 * The worker exists only to run the script and return the potentially modified form values and schema.
 * Worker is terminated after recieving the result.
 *
 * @param {string} script - The JavaScript code to execute inside the Web Worker.
 * @param {Object} formValues - The current form values to be passed to the worker.
 * @param {Object} formSchema - The form schema to be passed to the worker.
 * @returns {Promise<{formValues: Object, formSchema: Object}>} Resolves with the potentially updated form values and schema.
 * @throws {Error} If the worker encounters an error during script execution.
 */
// eslint-disable-next-line import/prefer-default-export
export async function useWebWorker(script, formValues, formSchema) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./formEventsWorker.js', import.meta.url));

    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(new Error(`Error executing onLoad event: ${e.data.error}`));
        worker.terminate();
        return;
      }

      resolve({
        formValues: e.data.formValues,
        formSchema: e.data.formSchema,
      });

      worker.terminate();
    };

    const scriptVariables = {
      formValues: cloneDeep(formValues),
      formSchema: cloneDeep(formSchema),
    };

    worker.postMessage({
      script, scriptVariables,
    });
  });
}

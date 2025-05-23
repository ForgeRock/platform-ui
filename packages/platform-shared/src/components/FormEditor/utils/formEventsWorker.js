/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

let _tempFormValues = {};
let _tempFormSchema = [];

const form = {};

/**
 * Executes a given script in a Web Worker, providing form values and schema as variables.
 * Attempt to execute the script and return the potentially modified form values and schema.
 * Return an error if the script execution fails for any reason.
 */
onmessage = (e) => {
  try {
    const { script, scriptVariables } = e.data;
    _tempFormValues = scriptVariables.formValues;
    _tempFormSchema = scriptVariables.formSchema;

    // eslint-disable-next-line no-new-func
    const func = new Function('form', script);
    func(form);

    postMessage({ formValues: _tempFormValues, formSchema: _tempFormSchema });
  } catch (error) {
    postMessage({ error });
  }
};

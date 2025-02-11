/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * @description Class that generates an analytics report parameter object.
 */

export default class ReportParameter {
  /**
   * @description Constructor for the ReportParameter.
   * @param {Object} args Object containing the parameter properties
   */
  constructor(args) {
    this._id = args._id;
    this._model = args.model;
    this.component = args.component;
    this.description = args.description;
    this.internalSearch = args.internalSearch;
    this.label = args.label;
    this.placeholder = args.label;
    this.taggable = args.taggable;
    this.testId = `fr-field-${args._id}`;
    this.type = args.type;

    if (args.request) {
      this.request = args.request;
      this.request.fetchRequestData = (term) => this.request.fetch(this.request, term);
      this.request.mutateRequestData = (data) => this.request.mutation(data, this.request.attribute);
    } else if (args.enums) {
      this.enums = ReportParameter.enumMutation(args.enums);
    } else if (args.type === 'multiselect' || args.type === 'select') {
      this.options = [];
    }
  }

  get model() {
    return this._model;
  }

  set model(value) {
    this._model = value;
  }

  /**
   * @description Method to handle the data for a select / multiselect field.
   * @param {Array} data Data handled by the dropdown options
   * @returns {Array} Filtered array if field type is select or multiselect
   */
  selectOptionsDataHandler(data) {
    if (data && this.model) {
      if (this.type === 'select') {
        // The select component requires a selected value to be part of the
        // overall list of options and if it is not present, the selected value
        // will not be displayed.  This can happen when we fetch data when
        // searching within a field and selecting a value that is not in the
        // original list. After selection, the field will query for the original
        // list, which will not contain the selected value, and will make the
        // selected value disappear. To prevent this, we add the selected value
        // to the beginning of the list if it is not included in the response.
        if (!data.includes(this.model)) return [this.model, ...data];
      }
      if (this.type === 'multiselect') {
        // Filters out any selected values from the search results
        return data.filter((item) => !this.model.includes(item));
      }
    }

    return data;
  }

  /**
   * @description Method to format the payload for the API request.
   * @returns {Object} containing the parameter payload
   */
  payload() {
    let payload = this.model;
    if (this.type === 'date') payload = ReportParameter.dateToISO(payload);
    return { [this._id]: payload };
  }

  /**
   * @description Setter for the select component options which
   * can be triggered on the "@tag" event on the <FrField> component.
   * It checks if the value is already present in the enums,
   * request, or options arrays and adds it if it is not present.
   * @param {String} val The value to be added to the dropdown options
   */
  selectOptionsSetter(val) {
    const { enums, request, options } = this;
    const enumsText = enums ? enums.map(({ text }) => text.toLowerCase()) : [];

    if (enums && !enumsText.includes(val.toLowerCase())) {
      enums.unshift(ReportParameter.enumFormat(val));
    } else if (request && !request.data.includes(val)) {
      request.data.unshift(val);
    } else if (options && !options.includes(val)) {
      this.options.unshift(val);
    }

    this.model = val;
  }

  /**
   * @description Method to convert a date string to ISO format.
   * @param {String} date date string from the datepicker component
   * @returns {String} ISO formatted date string
   */
  static dateToISO(date) {
    return Date.parse(date) ? new Date(date).toISOString() : date;
  }

  /**
   * @description Method to format the enums that are received from the API.
   * @param {String} value use for the label and value of the enum
   * @returns {Object} containing the text and value of the enum
   */
  static enumFormat(value) {
    return { text: value, value };
  }

  /**
   * @description Formats the enums array that is passed to the FrField component.
   * @param {Array} enums Array of enums to be formatted
   * @returns {Array} containing the text and value of the enums
   */
  static enumMutation(enums) {
    return enums.map(({ name: text, value }) => ({ text, value }));
  }
}

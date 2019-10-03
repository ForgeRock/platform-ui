import { isArray } from 'lodash';

/**
 * @description Util "class" specifically for validating callback output and input
 *
 * */
export default {
	name: 'CallbackValidation',
	// make sure the callback has an output or input property and the input or output is an Array that has at least one item
	validateOutput: prop => prop.output
            && isArray(prop.output)
            && prop.output.length > 0,
	validateInput: prop => prop.input
            && isArray(prop.input)
            && prop.input.length > 0,
};

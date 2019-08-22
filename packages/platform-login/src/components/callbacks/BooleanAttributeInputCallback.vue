<template>
  <div class="row text-left ml-1 mb-2">
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :value="value">
    <input
      class="ml-1 mt-1"
      type="checkbox"
      :id="'boolean_callback_' + index"
      :value="value"
      :checked="value"
      @change="onToggle()">
    <label
      class="ml-2"
      :for="'boolean_callback_' + index">
      {{ prompt }}
    </label>
  </div>
</template>

<script>
import CallbackValidation from '@/utils/CallbackValidation';

export default {
	props: {
		callback: {
			type: Object,
			// make sure the callback has an input property that is an Array and has at least one item
			validator: CallbackValidation.validateInput,
			required: true,
		},
		index: {
			type: Number,
			default: 0,
		},
		prompt: {
			type: String,
			default: '',
		},
	},
	mounted() {
		this.name = `callback_${this.index}`;

		this.value = this.callback.input[0].value;
	},
	data() {
		return {
			name: '',
			value: false,
		};
	},
	methods: {
		onToggle() {
			this.value = !this.value;
		},
	},
};
</script>

<template>
  <div>
    <label class="my-3">
      {{ $t('queryFilterBuilder.basicEditorHeadline') }}
    </label>
    <VuePrismEditor
      language="javascript"
      v-model="queryFilterString"
      @input="$emit('input', $event.target.innerText)" />
  </div>
</template>

<script>
import VuePrismEditor from 'vue-prism-editor';

export default {
  name: 'QueryFilterAdvanced',
  components: {
    VuePrismEditor,
  },
  data() {
    return {
      queryFilterString: this.value.toString(),
    };
  },
  props: {
    value: {
      required: true,
      type: [String, Boolean],
    },
  },
};
</script>

<style lang="scss" scoped>
/deep/ code {
  white-space: pre-wrap !important;
}
</style>

<template>
  <div>
    <label class="my-3">
      {{ $t('queryFilterBuilder.basicEditorHeadline') }}
    </label>
    <VuePrismEditor
      class="pb-4"
      language="javascript"
      :line-numbers="true"
      v-model="queryFilterString"
      @change="onStringChange"
    />
    <BButton
      v-if="toggle"
      class="px-0"
      variant="link"
      @click="onModeButtonClick">
      {{ $t('queryFilterBuilder.basicEditor') }}
    </BButton>
  </div>
</template>

<script>
import {
  BButton,
} from 'bootstrap-vue';
import 'prismjs';
import VuePrismEditor from 'vue-prism-editor';

export default {
  name: 'QueryFilterAdvanced',
  components: {
    BButton,
    VuePrismEditor,
  },
  data() {
    return {
      queryFilterString: this.queryFilter,
      toggle: true,
    };
  },
  props: {
    queryFilter: {
      required: true,
      type: String,
    },
  },
  methods: {
    onModeButtonClick() {
      this.$emit('on-mode-button-click');
    },
    onStringChange() {
      this.$set(this.$data, 'toggle', false);
      this.$emit('on-change', this.queryFilterString);
    },
  },
};
</script>

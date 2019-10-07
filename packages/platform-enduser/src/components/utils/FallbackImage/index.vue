<template>
  <div>
    <BImg
      v-if="imageFound"
      :src="src"
      :width="width"
      :height="width"
      :alt="alt" />
    <span
      v-else
      class="icon-holder p-2 d-flex bg-light border rounded">
      <i :class="['material-icons-outlined md-24 text-dark mt-auto', inputClass]">
        {{ fallback }}
      </i>
    </span>
  </div>
</template>

<script>
import { isNull, isUndefined } from 'lodash';
import axios from 'axios';

/**
 * @description Component that will load an image and if the image fails to load it will display a fallback image rather then loading nothing
 *
 * */
export default {
  name: 'ImageFallback',
  props: {
    src: {
      type: String,
      default: () => '',
    },
    width: {
      type: [String, Number],
      default: () => '',
    },
    alt: {
      type: String,
      default: () => '',
    },
    fallback: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {
      imageFound: false,
    };
  },
  mounted() {
    if (!isNull(this.src) && !isUndefined(this.src) && this.src.length > 0) {
      axios.get(`${this.src}`).then(({ status }) => {
        this.imageFound = status === 200;
      }).catch((error) => {
        if (error) {
          this.imageFound = false;
        }
      });
    } else {
      this.imageFound = false;
    }
  },
};
</script>

<style language="scss" scoped>
.icon-holder {
  min-height: 2.28rem;
  min-width: 2.28rem;
}
</style>

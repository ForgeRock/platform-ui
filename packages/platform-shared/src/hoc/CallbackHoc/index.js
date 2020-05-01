import Vue from 'vue';

const WithCallback = (component) => {
  let props = { ...component.props };
  if (component.mixins) {
    props = {
      ...props,
      ...component.mixins.reduce((acc, mixin) => ({ ...mixin.props, ...acc }), {}),
    };
  }

  return Vue.component('WithCallback', {
    render(createElement) {
      const context = this;
      return createElement(component, {
        props: { ...this.$props },
        on: {
          valueChange(value) {
            if (context.callback && context.callback.setInputValue) {
              context.callback.setInputValue(value);
            }
          },
        },
      });
    },
    props: {
      ...props,
      callback: {
        type: Object,
        default: () => {},
        required: false,
      },
    },
    data() {
      return {};
    },
  });
};

export default WithCallback;

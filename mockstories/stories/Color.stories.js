import { storiesOf } from '@storybook/vue';
import Color from '../mocks/foundations/Color.vue';

storiesOf('Foundations|Color', module)
    .add('Color', () => ({
        components: { 'color': Color },
        template: '<color></color>'
    }));

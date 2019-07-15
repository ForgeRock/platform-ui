import { storiesOf } from '@storybook/vue';
import Icons from '../mocks/foundations/Icons.vue';

storiesOf('Foundations|Icons', module)
    .add('Icons', () => ({
        components: { 'icons': Icons },
        template: '<icons></icons>'
    }));

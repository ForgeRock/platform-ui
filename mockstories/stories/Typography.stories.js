import { storiesOf } from '@storybook/vue';
import Typography from '../mocks/foundations/Typography.vue';

storiesOf('Foundations|Typography', module)
    .add('Typography', () => ({
        components: { 'typography': Typography },
        template: '<typography></typography>'
    }));

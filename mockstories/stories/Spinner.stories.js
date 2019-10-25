import { storiesOf } from '@storybook/vue';
import Spinner from '../mocks/components/Spinner.vue';

storiesOf('Components-Mock|Spinner', module)
    .add('Spinner', () => ({
        components: { 'fr-spinner': Spinner },
        template: '<fr-spinner></fr-spinner>'
    }));

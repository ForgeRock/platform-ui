import { storiesOf } from '@storybook/vue';
import Tooltips from '../mocks/components/Tooltips.vue';

storiesOf('Components-Mock|Tooltips', module)
    .add('Tooltips', () => ({
        components: { 'fr-tooltips': Tooltips },
        template: '<fr-tooltips></fr-tooltips>'
    }));

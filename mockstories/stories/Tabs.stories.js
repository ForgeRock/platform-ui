import { storiesOf } from '@storybook/vue';
import Tabs from '../mocks/components/Tabs.vue';

storiesOf('Components-Mock|Tabs', module)
    .add('Tabs', () => ({
        components: { 'fr-tabs': Tabs },
        template: '<fr-tabs></fr-tabs>'
    }));

import { storiesOf } from '@storybook/vue';
import Switch from '../mocks/components/Switch.vue';

storiesOf('Components-Mock|Switch', module)
    .add('Switch', () => ({
        components: { 'fr-switch': Switch },
        template: '<fr-switch></fr-switch>'
    }));

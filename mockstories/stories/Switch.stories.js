import { storiesOf } from '@storybook/vue';
import FrSwitch from '../mocks/components/Switch.vue';

storiesOf('Components-Mock|Switch', module)
    .add('FrSwitch', () => ({
        components: { 'fr-switch': FrSwitch },
        template: '<fr-switch></fr-switch>'
    }));

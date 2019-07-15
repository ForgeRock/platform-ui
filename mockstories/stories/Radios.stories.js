import { storiesOf } from '@storybook/vue';
import Radios from '../mocks/components/Radios.vue';

storiesOf('Components-Mock|Radios', module)
    .add('Radios', () => ({
        components: { 'fr-radios': Radios },
        template: '<fr-radios></fr-radios>'
    }));

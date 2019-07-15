import { storiesOf } from '@storybook/vue';
import Checkbox from '../mocks/components/Checkbox.vue';

storiesOf('Components-Mock|Checkbox', module)
    .add('Checkbox', () => ({
        components: { 'fr-checkbox': Checkbox },
        template: '<fr-checkbox></fr-checkbox>'
    }));

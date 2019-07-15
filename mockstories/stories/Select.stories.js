import { storiesOf } from '@storybook/vue';
import Select from '../mocks/components/Select.vue';

storiesOf('Components-Mock|Select', module)
    .add('Select', () => ({
        components: { 'fr-select': Select },
        template: '<fr-select></fr-select>'
    }));

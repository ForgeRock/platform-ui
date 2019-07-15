import { storiesOf } from '@storybook/vue';
import Input from '../mocks/components/Input.vue';

storiesOf('Components-Mock|Input', module)
    .add('Input', () => ({
        components: { 'fr-input': Input },
        template: '<fr-input></fr-input>'
    }));

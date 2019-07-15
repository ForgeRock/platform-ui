import { storiesOf } from '@storybook/vue';
import Button from '../mocks/components/Button.vue';

storiesOf('Components-Mock|Button', module)
    .add('Button', () => ({
        components: { 'fr-button': Button },
        template: '<fr-button></fr-button>'
    }));

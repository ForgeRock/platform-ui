import { storiesOf } from '@storybook/vue';
import Card from '../mocks/components/Card.vue';

storiesOf('Components-Mock|Card', module)
    .add('Card', () => ({
        components: { 'fr-card': Card },
        template: '<fr-card></fr-card>'
    }));

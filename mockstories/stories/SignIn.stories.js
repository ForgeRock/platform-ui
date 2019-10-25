import { storiesOf } from '@storybook/vue';
import SignIn from '../mocks/templates/SignIn.vue';

storiesOf('Templates|Sign In', module)
    .add('Sign In', () => ({
        components: { 'fr-signin': SignIn },
        template: '<fr-signin></fr-signin>'
    }));

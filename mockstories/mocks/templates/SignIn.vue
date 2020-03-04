<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <BContainer fluid class="mock px-0 h-100 d-flex">
        <div class="fr-m-auto fr-center-card align-self-center">
            <div class="card border-xs-0 border-sm d-flex fr-stretch-card">
                <div class="card-header d-flex align-items-center flex-fill">
                    <div class="d-flex flex-fill flex-column justify-content-center">
                        <img :src="require('@/assets/images/vertical-logo.svg')" alt="logo" class="fr-logo mb-3 mt-2 img-fluid" />
                        <div>
                            <h2 class="h2">Sign In</h2>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <form class="form-signin mb-3">
                        <div class="mb-3">
                            <div class="form-label-group mb-0">
                                <input aria-invalid="false" aria-required="false" autofocus="autofocus" class="polyfill-placeholder form-control" data-vv-as="Username" data-vv-id="1" data-vv-validate-on="submit" id="floatingLabelInput13" name="username" placeholder="Username" type="text"> <!----> <label for="floatingLabelInput13">Username</label>
                            </div>
                            <div class="fr-validation-requirements text-left" style="display: none;">
                                <span class="text-danger"></span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-label-group form-label-group-password">
                                <div class="form-label-group-input">
                                    <input type="password" id="passwordInput" class="form-control" placeholder="Password" />
                                    <label for="passwordInput">Password</label>
                                </div>
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" type="button"><i class="material-icons material-icons-outlined">visibility_off</i></button>
                                </div>
                            </div>
                            <div class="fr-validation-requirements text-left" style="display: none;">
                                <span class="text-danger"></span>
                            </div>
                        </div><button class="btn btn btn-block btn-primary" type="submit">Sign In</button>
                    </form>
                    <p class="text-center"><a href="#">Forgot username?</a><span class="mx-3 opacity-50">•</span><a href="#">Forgot password?</a></p>
                </div>
                <div class="card-footer">
                    New here? <a href="#">Create an account</a>
                </div>
            </div>
        </div>
    </BContainer>
</template>

<script>
import { BContainer } from 'bootstrap-vue';

export default {
    name: 'SignIn',
    data: function () {
        return {};
    },
    components: {
        BContainer
    },
    mounted () {},
    methods: {}
};
</script>

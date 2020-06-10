<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
    <div class="mock">
        <div class="sg_masthead">
            <BContainer>
                <h1 class="display-4">Typography</h1>
                <p class="mb-4 lead">All text is set in Open Sans.</p>
            </BContainer>
        </div>
        <BContainer>
            <template>
                <section class="sg_pattern">
                    <h2 class="mb-5">Open Sans</h2>
                    <div class="card">
                        <div class="card-body">
                            <h1>AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz</h1>
                            <h1 id="1234567890-_">1234567890’,.&lt;&gt;/?;’:”[]{}-=_+!@#$%^&amp;*()</h1>
                            <p>Once upon a time not long ago
                            when people wore pajamas and lived life slow
                            when laws were stern and justice stood
                            and people were behavin’ like they ought to good
                            there lived a little boy who was misled
                            by another little boy and this is what he said</p>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Headings</h2>
                    <div class="card">
                        <div class="card-body">
                            <h1>h1 heading</h1>
                            <h2>h2 heading</h2>
                            <h3>h3 heading</h3>
                            <h4>h4 heading</h4>
                            <h5>h5 heading</h5>
                            <h6>h6 heading</h6>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Display Headings</h2>
                    <div class="card">
                        <div class="card-body">
                            <h1 class="display-1">Display 1</h1>
                            <h1 class="display-2">Display 2</h1>
                            <h1 class="display-3">Display 3</h1>
                            <h1 class="display-4">Display 4</h1>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2>Lead</h2>
                    <div class="mb-5">Make a paragraph stand out by adding <code class="highlighter-rouge">.lead</code>.</div>
                    <div class="card">
                        <div class="card-body">
                            <p class="lead">
                                Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Duis mollis, est non commodo luctus.
                            </p>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Unordered List</h2>
                    <div class="card">
                        <div class="card-body">
                            <ul>
                                <li>Item One</li>
                                <li>Item Two</li>
                                <li>Item Three</li>
                            </ul>
                        </div>
                    </div>
                </section>
                <section class="sg_pattern">
                    <h2 class="mb-5">Ordered List</h2>
                    <div class="card">
                        <div class="card-body">
                            <ol>
                                <li>Item One</li>
                                <li>Item Two</li>
                                <li>Item Three</li>
                            </ol>
                        </div>
                    </div>
                </section>
            </template>
        </BContainer>
    </div>
</template>

<script>
import { BContainer } from 'bootstrap-vue';

export default {
    name: 'Typography',
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

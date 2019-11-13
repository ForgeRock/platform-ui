<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template functional>
  <dl class="row">
    <dt class="col-xl-5 mb-3">
      {{ parent.$t('pages.profile.consent.accountAccess') }}
    </dt>
    <dd class="col-xl-7 mb-4">
      <ul class="list-unstyled text-muted">
        <li
          class="py-1"
          v-for="field in props.fields"
          :key="field.name">
          <i class="material-icons-outlined md-16 text-success font-weight-bolder mr-2">
            check
          </i>
          {{ field.title }}
        </li>
      </ul>
    </dd>
  </dl>
</template>

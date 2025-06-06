<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template>
      <div
        id="toolbar-with-buttons-label"
        class="btn-toolbar row mb-4"
        role="toolbar"
        :aria-label="$t('pages.uma.resources.toolbarWithButtons')">
        <div class="input-group col-sm-4">
          <div class="input-group-prepend">
            <div class="input-group-text">
              <FrIcon
                icon-class="md-24"
                name="search" />
            </div>
          </div>
          <input
            type="text"
            class="form-control"
            aria-labelledby="toolbar-with-buttons-label"
            :placeholder="$t('common.search')"
            v-model="resourceFilter">
        </div>
        <div class="col">
          <BDropdown
            variant="link"
            right
            class="float-right text-muted">
            <template #button-content>
              <span class="text-muted">
                <FrIcon
                  icon-class="md-24 mb-1"
                  :name="!this.viewgrid ? 'format_list_bulleted' : 'apps'" />
              </span>
            </template>
            <BDropdownHeader>{{ $t('pages.uma.resources.viewAs') }}</BDropdownHeader>
            <BDropdownItem
              href="#"
              @click="toggleGrid">
              <div class="media">
                <div
                  class="d-flex align-self-center text-center"
                  style="min-width: 1.5rem;">
                  <FrIcon
                    v-if="!this.viewgrid"
                    icon-class="md-16 font-weight-bolder text-success"
                    name="check" />
                </div>
                <div class="media-body">
                  {{ $t('pages.uma.resources.list') }}
                </div>
                <div class="d-flex ml-3 align-self-center text-muted">
                  <FrIcon
                    icon-class="md-24"
                    name="format_list_bulleted" />
                </div>
              </div>
            </BDropdownItem>
            <BDropdownItem
              href="#"
              @click="toggleGrid">
              <div class="media">
                <div
                  class="d-flex align-self-center text-center"
                  style="min-width: 1.5rem;">
                  <FrIcon
                    v-if="this.viewgrid"
                    icon-class="md-16 font-weight-bolder text-success"
                    name="check" />
                </div>
                <div class="media-body">
                  {{ $t('pages.uma.resources.grid') }}
                </div>
                <div class="d-flex ml-3 align-self-center text-muted">
                  <FrIcon
                    icon-class="md-24"
                    name="apps" />
                </div>
              </div>
            </BDropdownItem>
          </BDropdown>
        </div>
      </div>
      <div
        id="listView"
        v-if="!this.viewgrid">
        <BCard
          no-body
          class="my-4">
          <BListGroup flush>
            <BListGroupItem
              v-for="(resource, index) in filteredResources"
              :key="`listResource-${index}`">
              <div class="d-sm-flex">
                <div class="media-body">
                  <div class="media mb-2 mb-sm-0">
                    <div class="d-flex mr-3 align-self-top">
                      <FrFallbackImage
                        :src="resource.icon_uri"
                        fallback="description"
                        input-class="md-36 m-auto pt-1 pb-1" />
                    </div>
                    <div class="d-sm-flex media-body align-self-center">
                      <div class="media-body mb-2 mb-sm-0">
                        <div class="my-0">
                          {{ resource.name }}
                        </div>
                        <small
                          class="text-muted"
                          v-if="!resource.policy">
                          {{ $t('pages.uma.resources.resourceNotShared') }}
                        </small>
                        <small
                          class="text-muted"
                          v-else-if="resource.policy.permissions.length > 1">
                          {{ $t('pages.uma.resources.sharedWithPeople', {numberOf: resource.policy.permissions.length}) }}
                        </small>
                        <small
                          class="text-muted"
                          v-else>
                          {{ $t('pages.uma.resources.sharedWithPerson') }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-start justify-content-sm-start ml-sm-3 align-self-center">
                  <div class="d-sm-none">
                    <a
                      href="#"
                      class="align-self-center pr-3"
                      @click="renderShareModal(resource)">
                      {{ $t('pages.uma.resources.share') }}
                    </a>
                    <a
                      href="#"
                      class="align-self-center pr-3"
                      @click="renderUnshareModal(resource.name, resource._id)">
                      {{ $t('pages.uma.resources.unshare') }}
                    </a>
                  </div>
                  <div class="d-none d-sm-flex">
                    <a
                      href="#"
                      class="align-self-center pr-3"
                      @click="renderShareModal(resource)">
                      {{ $t('pages.uma.resources.share') }}
                    </a>
                    <a
                      href="#"
                      v-if="resource.policy && resource.policy.permissions.length > 0"
                      class="align-self-center pr-3"
                      @click="renderUnshareModal(resource.name, resource._id)">
                      {{ $t('pages.uma.resources.unshare') }}
                    </a>
                  </div>
                </div>
              </div>
            </BListGroupItem>
          </BListGroup>
        </BCard>
      </div>
      <div
        id="gridView"
        v-if="this.viewgrid">
        <div class="row">
          <div
            v-for="(resource, index) in filteredResources"
            :key="`viewResource-${index}`"
            class="col-sm-6 col-md-3">
            <div class="card text-center mb-4">
              <div class="card-header py-0 px-1 border-0">
                <BDropdown
                  variant="link"
                  class="fr-card-menu-link float-right"
                  right
                  no-caret>
                  <template #button-content>
                    <span class="text-muted">
                      <FrIcon
                        icon-class="md-24"
                        name="more_horiz" />
                    </span>
                  </template>
                  <BDropdownItem
                    href="#"
                    @click="renderShareModal(resource)">
                    {{ $t('pages.uma.resources.share') }}
                  </BDropdownItem>
                  <BDropdownItem
                    href="#"
                    @click="renderUnshareModal(resource.name, resource._id)">
                    {{ $t('pages.uma.resources.unshare') }}
                  </BDropdownItem>
                </BDropdown>
              </div>
              <div class="card-body pt-0">
                <FrFallbackImage
                  :src="resource.icon_uri"
                  :width="86"
                  :height="86"
                  class="pl-5 pr-5 pt-3 mb-3"
                  fallback="description"
                  input-class="md-48 m-auto pt-3 pb-3" />
                <h5 class="card-title text-truncate">
                  {{ resource.name }}
                </h5>
                <div class="card-text">
                  <small
                    class="text-muted"
                    v-if="!resource.policy">
                    {{ $t('pages.uma.resources.resourceNotShared') }}
                  </small>
                  <small
                    class="text-muted"
                    v-else-if="resource.policy.permissions.length > 1">
                    {{ $t('pages.uma.resources.sharedWithPeople', {numberOf: resource.policy.permissions.length}) }}
                  </small>
                  <small
                    class="text-muted"
                    v-else>
                    {{ $t('pages.uma.resources.sharedWithPerson') }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {
  BCard,
  BDropdown,
  BDropdownHeader,
  BDropdownItem,
  BListGroup,
  BListGroupItem,
} from 'bootstrap-vue';
import { filter } from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FallbackImage from '@forgerock/platform-shared/src/enduser/components/FallbackImage';

/**
* @description Component for displaying a resource
*
* */
export default {
  name: 'Resources',
  components: {
    BCard,
    BDropdown,
    BDropdownHeader,
    BDropdownItem,
    BListGroup,
    BListGroupItem,
    FrFallbackImage: FallbackImage,
    FrIcon,
  },
  data() {
    return {
      viewgrid: false,
      showModalActions: false,
      newshare: '',
      resourceFilter: '',
    };
  },
  props: {
    resources: {
      type: Array,
      default: () => {},
    },
  },
  methods: {
    renderShareModal(resource) {
      this.$emit('renderShareModal', resource);
    },
    renderUnshareModal(resourceName, resourceId) {
      this.$emit('renderUnshareModal', resourceName, resourceId);
    },
    toggleGrid() {
      this.viewgrid = !this.viewgrid;
    },
  },
  computed: {
    filteredResources() {
      return filter(this.resources, (resource) => resource.name.includes(this.resourceFilter));
    },
  },
};
</script>

<style lang="scss" scoped>
  .form-control {
    height: initial;
  }
</style>

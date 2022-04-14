<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="card-footer py-2">
    <nav :aria-label="$t('common.tableNavigation')">
      <ul class="pagination justify-content-center mb-0">
        <li
          @click.prevent="currentPage === 0 ? '' : $emit('pagination-change', 0)"
          :class="[{ disabled: currentPage === 0 }, 'page-item']">
          <a
            class="page-link"
            href="#">
            <i class="material-icons-outlined mr-2">
              first_page
            </i>
          </a>
        </li>
        <li
          @click.prevent="currentPage === 0 ? '' : $emit('pagination-change', currentPage - 1)"
          :class="[{ disabled: currentPage === 0 }, 'page-item']">
          <a
            class="page-link"
            href="#">
            <i class="material-icons-outlined mr-2">
              keyboard_arrow_left
            </i>
          </a>
        </li>
        <li
          @click.prevent="lastPage ? '' : $emit('pagination-change', currentPage + 1)"
          :class="[{ disabled: lastPage }, 'page-item']">
          <a
            class="page-link"
            href="#">
            <i class="material-icons-outlined mr-2">
              keyboard_arrow_right
            </i>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';

export default {
  name: 'Pagination',
  mixins: [
    NotificationMixin,
  ],
  props: {
    /**
     * Initial value for table's current page.
     */
    currentPage: {
      type: Number,
      default: 0,
    },
    /**
     * Whether we are on the last page of the table or not
     */
    lastPage: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
/**
 * @description mixin for governance data processing
 *
 */
import dayjs from 'dayjs';

export default {
  name: 'GovernanceCertificationData',
  data() {
    return {
      searchQuery: '',
      sortBy: 'formattedDeadline',
      sortDesc: false,
      statusSort: {
        param: 'active',
        type: 'active',
        text: this.$t('governance.status.active'),
      },
      completedCampaignStatuses: [
        'signed-off',
        'completed',
      ],
      statuses: new Map([
        ['in-progress',
          {
            sortHide: true,
            param: 'active',
            type: 'in-progress',
            variant: 'success',
            text: this.$t('governance.status.in-progress'),
          },
        ],
        ['active',
          {
            param: 'active',
            type: 'active',
            text: this.$t('governance.status.active'),
          },
        ],
        ['expiring',
          {
            sortHide: true,
            type: 'expiring',
            variant: 'warning',
            text: this.$t('governance.status.expiring'),
          },
        ],
        ['overdue',
          {
            sortHide: true,
            type: 'overdue',
            variant: 'danger',
            text: this.$t('governance.status.overdue'),
          },
        ],
        ['closed',
          {
            sortHide: true,
            type: 'closed',
            variant: 'light',
            text: this.$t('governance.status.closed'),
          },
        ],
        ['expired',
          {
            param: 'expired',
            type: 'expired',
            variant: 'danger',
            text: this.$t('governance.status.expired'),
          },
        ],
        ['cancelled',
          {
            sortAccessReviewHide: true,
            param: 'cancelled',
            type: 'cancelled',
            variant: 'light',
            text: this.$t('governance.status.canceled'),
          },
        ],
        ['completed',
          {
            param: 'complete',
            type: 'completed',
            variant: 'success',
            text: this.$t('governance.status.complete'),
          },
        ],
        ['creating',
          {
            sortHide: true,
            type: 'creating',
            variant: 'light',
            text: this.$t('governance.status.creating'),
          },
        ],
        ['pending',
          {
            sortHide: true,
            type: 'pending',
            variant: 'light',
            text: this.$t('governance.status.creating'),
          },
        ],
      ]),
    };
  },
  computed: {
    isActiveLikeStatus() {
      const statuses = Object.fromEntries(this.statuses);
      const matchStatuses = [statuses['in-progress'].type, statuses.active.type, statuses.creating.type, statuses.expiring.type, statuses.overdue.type];
      return matchStatuses.findIndex((type) => this.statusSort.type === type) > -1;
    },
    isClosedLikeStatus() {
      const statuses = Object.fromEntries(this.statuses);
      const matchStatuses = [statuses.closed.type, statuses.expired.type, statuses.cancelled.type, statuses.completed?.type, statuses['signed-off']?.type];
      return matchStatuses.findIndex((type) => this.statusSort.type === type) > -1;
    },
  },
  methods: {
    clear() {
      this.searchQuery = null;
      this.currentPage = 1;
      this.getList();
    },
    handleStatusSort({ type }) {
      this.statusSort = this.statuses.get(type);
      this.currentPage = 1;
      this.getList();
    },
    search() {
      this.currentPage = 1;
      this.getList();
    },
    sortingChanged(sort) {
      this.sortBy = sort.sortBy;
      this.sortDesc = sort.sortDesc;
      this.getList();
    },
    getList() {
      this.getItems({
        status: this.statusSort.param,
        pageNumber: this.currentPage - 1,
        pageSize: this.pageSize,
        queryString: this.searchQuery,
        sortBy: this.sortBy === 'formattedDeadline' ? 'deadline' : this.sortBy,
        sortDesc: this.sortDesc,
      })
        .then(({ data }) => {
          if (this.$store?.state?.certificationCount) {
            this.$store.commit('setCertificationCount', data.totalCount);
          }
          const fixedData = {
            totalCount: data.totalHits || data.totalCount,
            result: data?.results?.length > -1 ? data.results : data.result,
          };
          if (data.result?.[0]?._source) {
            fixedData.result = data.result.map((item) => ({
              ...item._source,
            }));
          }
          this.setAccessReviewList(fixedData);
        });
    },
    getStatusCampaignTranslationLabel(statusParam) {
      const statusTranslateLabel = this.completedCampaignStatuses.includes(statusParam) ? 'complete' : statusParam;
      return this.$t(`governance.status.${statusTranslateLabel}`);
    },
    setAccessReviewList({ result = [], totalCount }) {
      this.accessReviewList = result.map((item) => {
        const newItem = {};
        if (item.campaignId) newItem.id = item.campaignId;
        if (item.campaignName) newItem.name = item.campaignName;

        const reviewItem = {
          ...item,
          ...newItem,
          formattedDeadline: item.deadline ? dayjs(item.deadline).format('MMM D, YYYY').toString() : '–',
        };

        // enduser access review api has totals contained in a separate property
        // add the number of completed items to that property
        if (reviewItem.totals) reviewItem.totals.completed = reviewItem.totals.total - reviewItem.totals['in-progress'];

        return reviewItem;
      });
      this.totalRows = totalCount;
      this.tableLoading = false;
    },
  },
};
</script>

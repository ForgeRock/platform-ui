/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const ChartKey = {
  ROC: 'roc',
  PR: 'pr',
};

const chartMeta = {
  roc: {
    x: 'fpr',
    y: 'tpr',
    labels: {
      title: 'Receiver Operator Characteristics',
      xAxis: 'False Positive Rate (FPR)',
      yAxis: 'True Positive Rate (TPR)',
    },
  },
  pr: {
    x: 'rc',
    y: 'ppv',
    labels: {
      title: 'Precision Recall',
      xAxis: 'True Positive Rate (TPR)',
      yAxis: 'Positive Predictive Value (PPV)',
    },
  },
  common: {
    labels: {
      threshold: 'Threshold',
      selectThresholdButton: 'Select',
      actual: 'Actual',
      predicted: 'Predicted',
      positive: 'P',
      negative: 'N',
    },
  },
};

const dim = {
  width: 600,
  height: 600,
  padding: {
    l: 65,
    r: 10,
    t: 60,
    b: 65,
  },
  detailWidth: 250,
  detailMargin: {
    lr: 40,
    tb: 0,
  },
  point: {
    size: 4,
    selectedSize: 7,
  },
};

export { ChartKey, chartMeta, dim };

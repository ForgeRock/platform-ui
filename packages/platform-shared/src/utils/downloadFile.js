/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// eslint-disable-next-line import/prefer-default-export
export function downloadFile(file, fileType, fileName) {
  const data = file;

  const blob = new Blob([data], { type: `data:${fileType}` });
  const a = document.createElement('a');

  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = [`data:${fileType}`, a.download, a.href].join(':');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

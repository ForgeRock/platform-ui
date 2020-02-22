<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<script>

/**
 * @description DownloadFileMixin is used to allow a user to download a file with any type of content
 *
 */
export default {
  name: 'DownloadFileMixin',
  methods: {
  /**
    * Downloads a file from the browser
    *
    * @param {String} file contents of the file to be downloaded
    * @param {String} fileType data type of file to be downloaded
    * @param {String} fileName name of the file after being downloaded by the browser
    */
    downloadFile(file, fileType, fileName) {
      const data = file;

      const blob = new Blob([data], { type: `data:${fileType}` });
      const a = document.createElement('a');

      a.download = fileName;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = [`data:${fileType}`, a.download, a.href].join(':');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
  },
};
</script>

let uploadUrl = "/paperpad/upload";

export function uploadFile(
  type,
  bytes,
  onUploadFinished = (src) => {},
  onUploadFailed = (errorMsg) => {},
  onProgress = (done, total) => {}
) {
  var data = new FormData();
  data.append("type", type);
  data.append("file", uploadDataToBlob(file_data));
  $.ajax({
    url: uploadUrl,
    type: "POST",
    data: data,
    dataType: "json",
    processData: false,
    contentType: false,
    cache: false,
    xhr: function () {
      var xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", function (event) {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      });
      return xhr;
    },
    beforeSend: function (xhr) {
      onProgress(0, 100);
    },
    success: function (data) {
      if (data.error) {
        return onUploadFailed(data.error);
      } else {
        onUploadFinished(data.src);
      }
    },
    error: function (xhr) {
      return onUploadFailed("Ошибка соединения с сервером");
    },
  });
}

export function canUploadImageToServer() {
  return false;
}

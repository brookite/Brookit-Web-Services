export const uploadUrl = "/paperpad/upload";
export const embedPathPrefix = "/paperpad/embed";
export const embedInfoPrefix = "/paperpad/embedInfo";

export const dummyImage = "/paperpad/empty.png";

export function matchEmbed(query, callback, errorCallback) {
  let data = {};
  if (query.match(/^(https?):\/\/\S+/i)) {
    data.url = query;
    query = "";
  } else if (query.startsWith("/")) {
    query += query;
  }
  $.ajax({
    url: embedInfoPrefix + query,
    type: "GET",
    data: data,
    dataType: "json",
    success: callback,
    error: errorCallback,
  });
}

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

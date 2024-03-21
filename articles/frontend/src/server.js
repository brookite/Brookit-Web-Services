import $ from "jquery";

export const uploadUrl = "/paperpad/upload";
export const embedPathPrefix = "/paperpad/embed";
export const embedInfoPrefix = "/paperpad/embedInfo";

export const dummyImage = "/paperpad/empty.png";

export function matchEmbed(query, callback, errorCallback) {
  let data = {};
  if (matchSupportedEmbeds(query)) {
    data.url = query;
    query = "";
  } else if (query.startsWith(embedPathPrefix)) {
    query = query.replace(embedPathPrefix, "");
  } else {
    return false;
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
  // TODO: can upload?
  return false;
}

export function matchSupportedEmbeds(url) {
  const regex = [
    /^(?:https?:\/\/)?(?:www.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})$/gi,
    "^" + embedPathPrefix.replaceAll("/", "\\/") + "\\/(\\S+)$",
    /^(?:https?:\/\/)?(?:www.)?rutube\.ru\/video\/(\S+)$/,
    /^(?:https?:\/\/)?(?:vk\.com|vk\.ru|vkontakte\.ru)\/video(-?\d+)_(\d+)$/,
    /^(?:https?:\/\/\S+)?(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?$/i,
  ];
  for (let expr of regex) {
    if (url.match(expr)) {
      return true;
    }
  }
  return false;
}

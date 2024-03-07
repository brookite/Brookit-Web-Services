export function urlPrepare(value) {
  if (
    value.substr(0, 1) != "#" &&
    value.substr(0, 1) != "/" &&
    value.substr(0, 7) != "http://" &&
    value.substr(0, 8) != "https://" &&
    value.substr(0, 7) != "mailto:"
  ) {
    if (value.indexOf("@") > 0) {
      return "mailto:" + value;
    } else {
      return "http://" + value;
    }
  }
  return value;
}

export function selectImage(accept, callback, context) {
  let input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", accept);
  input.addEventListener("change", (e) => {
    callback(context, e);
  });
  input.click();
}

export function showFlash(text, type) {}

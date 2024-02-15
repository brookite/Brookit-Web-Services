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

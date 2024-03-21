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

export function findUrl(text) {
  const urlRegex = /(https?:\/\/|mailto:)[^\s/$.?#].[^\s]*/gi;
  let matches = [];
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
    });
  }
  return matches;
}

export function matchUrl(url) {
  try {
    const newUrl = new URL(str);
    return (
      newUrl.protocol === "http:" ||
      newUrl.protocol === "https:" ||
      newUrl.protocol === "mailto:"
    );
  } catch (err) {
    return false;
  }
}

export function matchBase64Data(text) {
  let matches = text.match(
    /^data:(image\/jpe?g|image\/gif|image\/png);base64,(.*)$/
  );
  if (matches) {
    return matches[1], matches[0];
  } else {
    return [undefined, undefined];
  }
}

export function base64_to_bytes(text, type) {
  const binaryArray = new Uint8Array(
    atob(text)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
  return new Blob([binaryArray], { type: type });
}

export function selectImage(accept, callback, context) {
  let input = document.querySelector(".file-accept.hidden");
  input = document.createElement("input");
  input.classList.add("hidden");
  input.classList.add("file-accept");
  input.setAttribute("type", "file");
  input.setAttribute("accept", accept);
  input.addEventListener("change", (e) => {
    callback(context, e);
  });
  input.click();
  //TODO: fix adding error
}

export function showFlash(text, type) {}

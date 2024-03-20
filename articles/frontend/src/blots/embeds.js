import { BlockEmbed } from "quill/blots/block";
import $ from "jquery";
import {
  canUploadImageToServer,
  dummyImage,
  matchEmbed,
  uploadFile,
} from "../server";
import { base64_to_bytes, showFlash } from "../utils";

export class FigureBlot extends BlockEmbed {
  static blotName = "abstractFigure";
  static tagName = "figure";

  constructor(domNode, value) {
    super(domNode, value);

    this.domNode.setAttribute("contenteditable", false);
    this.figureView = document.createElement("div");
    this.figureView.classList.add("figureView");
    this.figureCaption = document.createElement("figcaption");
    if (value.caption) {
      this.figureCaption.innerText = value.caption;
    }

    let input = document.createElement("textarea");
    input.classList.add("captionInput");
    input.setAttribute("placeholder", "Надпись");
    this.figureCaption.appendChild(input);

    this.domNode.appendChild(this.figureView);
    this.domNode.appendChild(this.figureCaption);

    this.initListeners();
    this._buildFigure(this.figureView, value);
  }

  initListeners() {
    $(this.figureView).on("click", () => {
      if (!this.isSelected()) {
        this.select();
      }
    });
  }

  _buildFigure(figureView, value) {}

  select() {
    this.figureView.classList.add("selected");
  }

  isSelected() {
    return this.figureView.classList.contains("selected");
  }

  removeSelection() {
    this.figureView.classList.remove("selected");
  }
}

export class ImageBlot extends FigureBlot {
  static blotName = "image";

  constructor(domNode, value) {
    super(domNode, value);
    this.overlayText = document.createElement("span");
    this.overlayText.classList.add("figureOverlayText");
    this.figureView.appendChild(this.overlayText);
  }

  _buildFigure(figureView, value) {
    this.image = document.createElement("img");
    if (value) {
      this.image.setAttribute("src", value);
      this.uploadToServer(value);
    } else {
      this.image.setAttribute("src", dummyImage);
    }
    figureView.appendChild(this.image);
    return this.image;
  }

  uploadToServer(src) {
    let matches = src.match(
      /^data:(image\/jpe?g|image\/gif|image\/png);base64,(.*)$/
    );
    if (matches && canUploadImageToServer()) {
      this.figureView.classList.add("loading");
      let bytes = base64_to_bytes(matches[1], matches[0]);
      uploadFile(
        "image",
        bytes,
        (onUploadFinished = (src) => {
          this.image.src = src;
          this.figureView.classList.remove("loading");
          this.overlayText.innerHTML = "";
        }),
        (onUploadFailed = (errorMsg) => {
          showFlash(errorMsg, "error");
          this.figureView.classList.remove("loading");
          this.overlayText.innerHTML = "";
        }),
        (onProgress = (done, total) => {
          let progress = Math.floor((done / total) * 100);
          this.overlayText.innerHTML = `${progress}%`;
        })
      );
    } else {
      showFlash("Загрузка изображения на сервер не удалась", "error");
    }
  }

  static value(domNode) {
    let image = domNode.querySelector("img");
    if (image.src == dummyImage) {
      return false;
    }
    return image.src;
  }
}

export class EmbedBlot extends FigureBlot {
  static blotName = "embed";

  _buildFigure(figureView, value) {
    if ((match = value.match(/^(https?):\/\/\S+/i))) {
      let element = document.createElement("a");
      element.href = url;
      if (element.pathname.match(/\.(webm|mp4)$/i)) {
        this.embed = document.createElement("video");
        this.embed.setAttribute("src", value);
        this.embed.setAttribute("controls", "controls");
        this.embed.setAttribute("preload", "auto");
        figureView.appendChild(this.embed);
        figureView.setAttribute("data-embed", "video");
      } else if (element.pathname.match(/\.(ogg|mp3|wav)$/i)) {
        this.embed = document.createElement("audio");
        this.embed.setAttribute("src", value);
        this.embed.setAttribute("controls", "controls");
        this.embed.setAttribute("preload", "auto");
        figureView.appendChild(this.embed);
        figureView.setAttribute("data-embed", "audio");
      } else {
        if (value != false) {
          figureView.setAttribute("data-embed", value);
          matchEmbed(
            value,
            (data) => {
              let iframe = document.createElement("iframe");
              iframe.setAttribute("src", data.src);
              iframe.setAttribute("width", data.width ?? "640");
              iframe.setAttribute("height", data.height ?? "360");
              iframe.setAttribute("frameborder", "0");
              iframe.setAttribute("allowtransparency", "true");
              iframe.setAttribute("allowfullscreen", data.allowFullScreen);
              iframe.setAttribute("scrolling", data.scrolling);
              figureView.appendChild(iframe);
              if (!data.figureSelecting) {
                $(figureView).off("click");
                this.removeSelection();
              }
            },
            () => {
              showFlash("Ошибка сети", "error");
            }
          );
        }
      }
    }
  }

  static value(domNode) {
    let view = domNode.querySelector(".figureView");
    let attr = view.getAttribute("data-embed");
    if (attr == "audio") {
      return domNode.querySelector("audio").src;
    } else if (attr == "audio") {
      return domNode.querySelector("video").src;
    } else if (!attr) {
      return false;
    } else {
      return attr;
    }
  }
}

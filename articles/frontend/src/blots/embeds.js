import { BlockEmbed } from "quill/blots/block";
import $ from "jquery";
import { canUploadImageToServer, uploadFile } from "../server";
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

    this._buildFigure(this.figureView, value);
    this.initListeners();
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

  _buildFigure(figureView, value) {
    this.image = document.createElement("img");
    this.image.setAttribute("src", value);
    figureView.appendChild(this.image);
    this.uploadToServer(value);
    return this.image;
  }

  uploadToServer(src) {
    let matches = src.match(
      /^data:(image\/jpe?g|image\/gif|image\/png);base64,(.*)$/
    );
    if (matches && canUploadImageToServer()) {
      let bytes = base64_to_bytes(matches[1], matches[0]);
      uploadFile(
        "image",
        bytes,
        (onUploadFinished = (src) => {
          this.image.src = src;
        }),
        (onUploadFailed = (errorMsg) => {
          showFlash(errorMsg, "error");
        })
      );
    }
  }

  static value(domNode) {
    let image = domNode.querySelector("img");
    return image.src;
  }
}

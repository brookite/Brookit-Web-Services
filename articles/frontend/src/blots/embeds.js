import { BlockEmbed } from "quill/blots/block";

export class FigureBlot extends BlockEmbed {
  static blotName = "abstractFigure";
  static tagName = "figure";

  constructor(domNode, value) {
    super(domNode, value);

    let figureView = document.createElement("div");
    figureView.classList.add("figureView");
    let figureCaption = document.createElement("figcaption");
    figureCaption.setAttribute("data-placeholder", "Надпись");
    if (value.caption) {
      figureCaption.innerText = value.caption;
    }

    this.domNode.appendChild(figureView);
    this.domNode.appendChild(figureCaption);

    this._buildFigure(figureView, value);
    this.initListeners();
  }

  initListeners() {}

  _buildFigure(figureView, value) {}
}

export class ImageBlot extends FigureBlot {
  static blotName = "image";

  _buildFigure(figureView, value) {
    let image = document.createElement("img");
    image.setAttribute("src", this.validate(value));
    figureView.appendChild(image);
    return image;
  }

  validate(src) {
    return src;
  }

  static value(domNode) {
    let image = domNode.querySelector("img");
    return image.src;
  }
}

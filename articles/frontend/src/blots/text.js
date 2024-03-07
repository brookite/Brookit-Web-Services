import { MultiLineBlockBlot } from "./blocks";

class TextParagraph extends MultiLineBlockBlot {
  static blotName = "paragraph";
  static tagName = "P";

  getAlignment() {
    if (!this.domNode.getAttribute("align")) {
      return "left";
    } else {
      return this.domNode.getAttribute("align");
    }
  }

  align(value) {
    this.domNode.setAttribute("align", value);
  }
}

export { TextParagraph as default };

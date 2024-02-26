import { MultiLineBlockBlot } from "./blocks";

class TextParagraph extends MultiLineBlockBlot {
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
TextParagraph.blotName = "paragraph";
TextParagraph.tagName = "P";

export { TextParagraph as default };

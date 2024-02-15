import { ServiceBlockBlot } from "./blocks";

class TitleBlot extends ServiceBlockBlot {
  static create(value) {
    let domNode = super.create(value);
    domNode.setAttribute("data-placeholder", "Название статьи");
    domNode.setAttribute("data-label", "Название статьи");
    return domNode;
  }
}

TitleBlot.blotName = "titleBlock";
TitleBlot.tagName = "h1";
export { TitleBlot as default };

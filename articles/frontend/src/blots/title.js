import { ServiceBlockBlot } from "./blocks";

class TitleBlot extends ServiceBlockBlot {
  static blotName = "titleBlock";
  static tagName = "h1";

  static create(value) {
    let domNode = super.create(value);
    domNode.setAttribute("data-placeholder", "Название статьи");
    domNode.setAttribute("data-label", "Название статьи");
    return domNode;
  }
}

export { TitleBlot as default };

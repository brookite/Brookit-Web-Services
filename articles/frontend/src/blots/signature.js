import { ServiceBlockBlot } from "./blocks";

class SignatureBlot extends ServiceBlockBlot {
  static blotName = "signatureBlock";
  static tagName = "address";

  static create(value) {
    let domNode = super.create(value);
    domNode.setAttribute("data-placeholder", "Ваше имя");
    domNode.setAttribute("data-label", "Автор");
    return domNode;
  }
}

export { SignatureBlot as default };

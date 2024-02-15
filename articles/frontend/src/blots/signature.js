import { ServiceBlockBlot } from "./blocks";

class SignatureBlot extends ServiceBlockBlot {
  static create(value) {
    let domNode = super.create(value);
    domNode.setAttribute("data-placeholder", "Ваше имя");
    domNode.setAttribute("data-label", "Автор");
    return domNode;
  }
}

SignatureBlot.blotName = "signatureBlock";
SignatureBlot.tagName = "address";

export { SignatureBlot as default };

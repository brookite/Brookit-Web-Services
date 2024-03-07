import { SingleLineBlockBlot } from "./blocks";
import $ from "jquery";

export class HeaderBlot extends SingleLineBlockBlot {
  static blotName = "headerH1";
  static tagName = "h2";

  optimize() {
    super.optimize();
    let anchor = $(this.domNode)
      .text()
      .replace(/[\s-]+/gm, "_");
    if (
      this.domNode.hasAttribute("id") &&
      this.domNode.getAttribute("id") == anchor
    ) {
      return;
    }
    this.domNode.setAttribute("id", anchor);
  }
}

export class HeaderH2Blot extends HeaderBlot {
  static blotName = "headerH2";
  static tagName = "h3";
}

export class HeaderH3Blot extends HeaderBlot {
  static blotName = "headerH3";
  static tagName = "h4";
}

export class HeaderH4Blot extends HeaderBlot {
  static blotName = "headerH4";
  static tagName = "h5";
}

export class HeaderH5Blot extends HeaderBlot {
  static blotName = "headerH5";
  static tagName = "h6";
}

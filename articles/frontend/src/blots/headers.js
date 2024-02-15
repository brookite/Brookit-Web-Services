import { SingleLineBlockBlot } from "./blocks";
import $ from "jquery";

export class HeaderBlot extends SingleLineBlockBlot {
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
HeaderBlot.blotName = "headerH1";
HeaderBlot.tagName = "h2";

export class HeaderH2Blot extends HeaderBlot {}
HeaderH2Blot.blotName = "headerH2";
HeaderH2Blot.tagName = "h3";

export class HeaderH3Blot extends HeaderBlot {}
HeaderH3Blot.blotName = "headerH3";
HeaderH3Blot.tagName = "h4";

export class HeaderH4Blot extends HeaderBlot {}
HeaderH4Blot.blotName = "headerH4";
HeaderH4Blot.tagName = "h5";

export class HeaderH5Blot extends HeaderBlot {}
HeaderH5Blot.blotName = "headerH5";
HeaderH5Blot.tagName = "h6";

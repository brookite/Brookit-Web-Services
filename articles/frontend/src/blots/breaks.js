import Embed from "quill/blots/embed";
import BlockEmbed from "quill/blots/embed";

export class BreakBlot extends Embed {
  static blotName = "textBreak";
  static tagName = "br";
}

export class DividerBlot extends BlockEmbed {
  static blotName = "divider";
  static tagName = "hr";

  constructor(scroll, node) {
    super(scroll, node);
    this.domNode.textContent = "";
  }
}

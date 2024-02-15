import Embed from "quill/blots/embed";
import BlockEmbed from "quill/blots/embed";

export class BreakBlot extends Embed {}
BreakBlot.blotName = "textBreak";
BreakBlot.tagName = "br";

export class DividerBlot extends BlockEmbed {}
DividerBlot.blotName = "divider";
DividerBlot.tagName = "hr";

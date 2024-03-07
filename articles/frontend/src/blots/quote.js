import { MultiLineBlockBlot } from "./blocks";

class BlockquoteBlot extends MultiLineBlockBlot {
  static blotName = "blockquoteBlock";
  static tagName = "blockquote";
}

export class CenteredBlockquoteBlot extends BlockquoteBlot {
  static blotName = "centerBlockquoteBlock";
  static tagName = "centered-quote";
}

export { BlockquoteBlot as default };

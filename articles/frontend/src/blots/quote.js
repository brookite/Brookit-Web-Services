import { MultiLineBlockBlot } from "./blocks";

class BlockquoteBlot extends MultiLineBlockBlot {}
BlockquoteBlot.blotName = "blockquoteBlock";
BlockquoteBlot.tagName = "blockquote";

export { BlockquoteBlot as default };

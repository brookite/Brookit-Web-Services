import { MultiLineBlockBlot } from "./blocks";

class BlockquoteBlot extends MultiLineBlockBlot {}
BlockquoteBlot.blotName = "blockquoteBlock";
BlockquoteBlot.tagName = "blockquote";

export class CenteredBlockquoteBlot extends BlockquoteBlot {}
CenteredBlockquoteBlot.blotName = "centerBlockquoteBlock";
CenteredBlockquoteBlot.className = "centered-quote";

export { BlockquoteBlot as default };

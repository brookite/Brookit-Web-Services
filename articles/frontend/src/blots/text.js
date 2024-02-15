import { MultiLineBlockBlot } from "./blocks";

class TextParagraph extends MultiLineBlockBlot {}
TextParagraph.blotName = "paragraph";
TextParagraph.tagName = "P";

export { TextParagraph as default };

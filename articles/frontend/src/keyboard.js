import Quill from "quill/core";
import { MultiLineBlockBlot, ServiceBlockBlot } from "./blots/blocks";
import { BreakBlot } from "./blots/breaks";

export class KeyboardHandlers {
  static serviceEnter(range, context) {
    if (range.index + 1 >= this.quill.getLines()) {
      this.quill.insertText(range.index, "\n", Quill.sources.USER);
      this.quill.formatLine(
        range.index + 1,
        1,
        {
          signatureBlock: false,
          titleBlock: false,
        },
        Quill.sources.USER
      );
    }
    this.quill.setSelection(range.index + 1, Quill.sources.USER);
    return false;
  }

  static singleLineBlockNewLine(range, context) {
    this.quill.insertText(range.index, "\n", Quill.sources.SILENT);
    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
    this.quill.formatLine(
      range.index + 1,
      1,
      {
        headerH1: false,
        headerH2: false,
        headerH3: false,
        headerH4: false,
        headerH5: false,
      },
      Quill.sources.USER
    );
    return false;
  }

  static defaultNewLineHandler(range, context) {
    let blot = this.quill.scroll.descendants(BreakBlot, range.index);
    if (
      blot.length ||
      this.quill.getFormat(range)["blockquoteBlock"] ||
      this.quill.getFormat(range)["centerBlockquoteBlock"]
    ) {
      this.quill.insertText(range.index, "\n", Quill.sources.USER);
      this.quill.setSelection(range.index + 1, Quill.sources.USER);
      this.quill.formatLine(
        range.index + 1,
        1,
        {
          blockquoteBlock: false,
          centerBlockquoteBlock: false,
        },
        Quill.sources.USER
      );
      return false;
    }
    return true;
  }

  static shiftNewLine(range, context) {
    let multilineBlot = this.quill.scroll.descendant(
      MultiLineBlockBlot,
      range.index
    );
    if (!multilineBlot[0]) {
      return true;
    }
    if (this.quill.getText(range.index).length) {
      this.quill.insertEmbed(
        range.index,
        "textBreak",
        true,
        Quill.sources.USER
      );
      this.quill.insertEmbed(
        range.index + 1,
        "textBreak",
        true,
        Quill.sources.USER
      );
      this.quill.setSelection(range.index + 1, 0, Quill.sources.SILENT);
      return false;
    }
    return true;
  }

  static backspace(range, context) {
    let [line_blot, index] = this.quill.getLine(range.index);
    if (
      line_blot.prev instanceof ServiceBlockBlot ||
      line_blot instanceof ServiceBlockBlot
    ) {
      if (line_blot.prev) {
        this.quill.setSelection(range.index - 1, 0, Quill.sources.SILENT);
      }
      return false;
    }
    return true;
  }
}

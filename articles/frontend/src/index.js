import "remixicon/fonts/remixicon.css";
import "quill/dist/quill.core.css";
import "./static/core.css";

import Quill from "quill/core";
import Delta from "quill-delta";
import Keyboard from "quill/modules/keyboard";
import Block from "quill/blots/block";
import BlockEmbed from "quill/blots/embed";
import $ from "jquery";

import TitleBlot from "./blots/title";
import { BreakBlot, DividerBlot } from "./blots/breaks";
import BlockquoteBlot from "./blots/quote";
import { CenteredBlockquoteBlot } from "./blots/quote";
import TextParagraph from "./blots/text";
import {
  HeaderBlot,
  HeaderH2Blot,
  HeaderH3Blot,
  HeaderH4Blot,
  HeaderH5Blot,
} from "./blots/headers";
import SignatureBlot from "./blots/signature";
import { ServiceBlockBlot } from "./blots/blocks";
import { Highlight } from "./blots/inlines";

import { isEditMode, setProperTextDirection } from "./page";

import { AddMenu, FormatTooltip, LineButtonGroup } from "./editor";

import Bold from "quill/formats/bold";
import Strike from "quill/formats/strike";
import Italic from "quill/formats/italic";
import Script from "quill/formats/script";
import Underline from "quill/formats/underline";
import { KeyboardHandlers } from "./keyboard";
import LinkBlot from "./blots/link";
import { ImageBlot } from "./blots/embeds";

Quill.register(Bold);
Quill.register(Strike);
Quill.register(Italic);
Quill.register(Script);
Quill.register(Underline);
Quill.register(Highlight);
Quill.register(LinkBlot);

Quill.register(TitleBlot);
Quill.register(SignatureBlot);
Quill.register(TextParagraph);
Quill.register(ImageBlot);
Quill.register(BreakBlot);
Quill.register(DividerBlot);
Quill.register(BlockquoteBlot);
Quill.register(HeaderBlot);
Quill.register(HeaderH2Blot);
Quill.register(HeaderH3Blot);
Quill.register(HeaderH4Blot);
Quill.register(HeaderH5Blot);
Quill.register(CenteredBlockquoteBlot);

function initQuill(articleElements) {
  let quill = new Quill(".page", {
    readOnly: false,
    fileSizeLimit: 8 * 1024 * 1024,
    fileSizeLimitCallback: function () {
      showError("Требуется размер файла не более 8 МБ");
    },
    formats: [
      "bold",
      "italic",
      "underline",
      "strike",
      "link",
      "script",
      "highlight",
      "headerH1",
      "headerH2",
      "headerH3",
      "headerH4",
      "headerH5",
      "titleBlock",
      "signatureBlock",
      "blockquoteBlock",
      "centerBlockquoteBlock",
      "code",
      "image",
      "textBreak",
      "divider",
      "code-block",
    ],
    modules: {
      keyboard: {
        bindings: {
          serviceEnter: {
            key: Keyboard.keys.ENTER,
            collapsed: true,
            format: ["titleBlock", "signatureBlock"],
            handler: KeyboardHandlers.serviceEnter,
          },
          singleLineEnter: {
            key: Keyboard.keys.ENTER,
            collapsed: true,
            format: [
              "headerH1",
              "headerH2",
              "headerH3",
              "headerH4",
              "headerH5",
            ],
            handler: KeyboardHandlers.singleLineBlockNewLine,
          },
          defaultEnter: {
            key: Keyboard.keys.ENTER,
            collapsed: true,
            handler: KeyboardHandlers.defaultNewLineHandler,
          },
          shiftEnter: {
            key: Keyboard.keys.ENTER,
            collapsed: true,
            shiftKey: true,
            handler: KeyboardHandlers.shiftNewLine,
          },
          backspace: {
            key: Keyboard.keys.BACKSPACE,
            collapsed: true,
            offset: 0,
            handler: KeyboardHandlers.backspace,
          },
        },
      },
    },
  });

  quill.addContainer($("#mainLineButtons").get(0));
  quill.addContainer($("#mainTooltip").get(0));
  quill.addContainer($("#textTooltip").get(0));
  quill.addContainer($("#mainFormatTooltip").get(0));

  quill.on(Quill.events.EDITOR_CHANGE, function (eventType, range) {
    if (eventType !== Quill.events.SELECTION_CHANGE) return;
    if (!quill.isEnabled()) return;
    if (range == null) return;
    let [block, offset] = quill.scroll.descendant(Block, range.index);

    if (range.length === 0) {
      articleElements.formatTooltip.hide();
      if (
        block != null &&
        !(block instanceof ServiceBlockBlot) &&
        !(block instanceof BlockquoteBlot) &&
        !$(block.domNode).text().trim().length
      ) {
        articleElements.lineButtons.show();
      } else {
        articleElements.lineButtons.hide();
      }
    } else {
      if (!(block instanceof TitleBlot)) {
        articleElements.formatTooltip.show();
        articleElements.formatTooltip.updateButtonState(range);
      } else {
        articleElements.formatTooltip.hide();
      }
    }
    checkBlotsState(quill);
  });

  /*
  quill.on(Quill.events.TEXT_CHANGE, function () {
    
  });
  */

  quill.on(Quill.events.TEXT_PASTE, function () {});

  prepareArticleEditView(quill);

  return quill;
}

function prepareArticleEditView(quill) {
  quill.setContents(
    new Delta()
      .insert("\n", { titleBlock: true })
      .insert("\n", { signatureBlock: true })
      .insert("\n", { paragraph: true }),
    Quill.sources.SILENT
  );
  checkBlotsState(quill);
}

function checkBlotsState(quill) {
  let lines = quill.getLines();

  if (!(lines[0] instanceof BlockEmbed)) {
    quill.formatLine(0, 1, { titleBlock: true }, Quill.sources.SILENT);
  } else {
    quill.updateContents(
      new Delta()
        .insert("\n", { titleBlock: true })
        .insert("\n", { signatureBlock: true }),
      Quill.sources.SILENT
    );
  }

  if (!lines[1]) {
    let offset = quill.getLength();
    quill.updateContents(
      new Delta().retain(offset).insert("\n", { signatureBlock: true }),
      Quill.sources.SILENT
    );
  } else if (!(lines[1] instanceof BlockEmbed)) {
    let offset = quill.getIndex(lines[1]);
    quill.formatLine(offset, 1, { signatureBlock: true }, Quill.sources.SILENT);
  } else {
    let offset = quill.getIndex(lines[1]);
    quill.updateContents(
      new Delta().retain(offset).insert("\n", { signatureBlock: true }),
      Quill.sources.SILENT
    );
  }

  lines = quill.getLines();

  lines.forEach((line, i) => {
    if (line instanceof ServiceBlockBlot && i > 1) {
      quill.formatLine(
        quill.getIndex(line),
        1,
        { titleBlock: false, signatureBlock: false },
        Quill.sources.SILENT
      );
    }

    if (line.domNode.tagName == "P") {
      if (lines.length == 3 && i == 2) {
        line.domNode.setAttribute(
          "data-placeholder",
          "Начните писать вашу статью..."
        );
      } else {
        line.domNode.removeAttribute("data-placeholder");
      }
    }

    if (line.domNode.hasAttribute("data-placeholder")) {
      $(line.domNode).toggleClass(
        "empty",
        !$(line.domNode).text().trim().length
      );
    } else {
      $(line.domNode).removeClass("empty");
    }
  });
}

let articleElements = {
  formatTooltip: undefined,
  lineButtons: undefined,
};
export let quill = initQuill(articleElements);
articleElements.formatTooltip = new FormatTooltip(quill);
articleElements.lineButtons = new LineButtonGroup(quill);

$(document).on("click", (e) => {
  if (!$(e.target).is(".menuTooltip *, .menuTooltip, #add_more_button")) {
    AddMenu.shutdown();
  }
});
setProperTextDirection($(".view").get(0));

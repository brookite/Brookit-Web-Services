import "remixicon/fonts/remixicon.css";
import "quill/dist/quill.core.css";
import "./static/core.css";

import Quill from "quill/core";
import Keyboard from "quill/modules/keyboard";
import Block from "quill/blots/block";
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
import {
  checkBlotsState,
  checkFiguresState,
  prepareArticleEditView,
} from "./core";

import Bold from "quill/formats/bold";
import Strike from "quill/formats/strike";
import Italic from "quill/formats/italic";
import Script from "quill/formats/script";
import Underline from "quill/formats/underline";
import { KeyboardHandlers } from "./keyboard";
import LinkBlot from "./blots/link";
import { EmbedBlot, FigureBlot, ImageBlot } from "./blots/embeds";

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
Quill.register(EmbedBlot);
Quill.register(BreakBlot);
Quill.register(DividerBlot);
Quill.register(BlockquoteBlot);
Quill.register(HeaderBlot);
Quill.register(HeaderH2Blot);
Quill.register(HeaderH3Blot);
Quill.register(HeaderH4Blot);
Quill.register(HeaderH5Blot);
Quill.register(CenteredBlockquoteBlot);

function initQuill(editorElements) {
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
      "embed",
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
      quill.editorElements.formatTooltip.hide();
      if (
        block != null &&
        !(block instanceof ServiceBlockBlot) &&
        !(block instanceof BlockquoteBlot) &&
        !$(block.domNode).text().trim().length
      ) {
        quill.editorElements.lineButtons.show();
      } else {
        quill.editorElements.lineButtons.hide();
      }
    } else {
      if (!(block instanceof TitleBlot)) {
        quill.editorElements.formatTooltip.show();
        quill.editorElements.formatTooltip.updateButtonState(range);
      } else {
        quill.editorElements.formatTooltip.hide();
      }
    }
    checkBlotsState(quill);
    checkFiguresState(quill, quill.editorElements, range);
  });

  /*
  quill.on(Quill.events.TEXT_CHANGE, function () {
    
  });
  */

  quill.on(Quill.events.TEXT_PASTE, function () {});

  prepareArticleEditView(quill);

  quill.editorElements = editorElements;

  return quill;
}

let editorElements = {
  formatTooltip: undefined,
  lineButtons: undefined,
};
export let quill = initQuill(editorElements);
quill.editorElements.formatTooltip = new FormatTooltip(quill);
quill.editorElements.lineButtons = new LineButtonGroup(quill);

$(document).on("click", (e) => {
  if (!$(e.target).is(".menuTooltip *, .menuTooltip, #add_more_button")) {
    AddMenu.shutdown();
  }
});
setProperTextDirection($(".view").get(0));

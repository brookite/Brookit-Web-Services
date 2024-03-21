import Delta from "quill-delta";
import BlockEmbed from "quill/blots/embed";
import { FigureBlot } from "./blots/embeds";
import Quill from "quill/core";
import { ServiceBlockBlot } from "./blots/blocks";
import $ from "jquery";
import { findUrl } from "./utils";
import { matchSupportedEmbeds } from "./server";

export function insertBlotByInlineQuery(quill, blot, queryType) {
  let offset = blot.offset(quill.scroll);
  let query = blot.domNode.innerText;
  let newBlotInfo = {};
  switch (queryType) {
    case "embed":
      newBlotInfo["embed"] = query;
      break;
  }
  quill.updateContents(
    new Delta().retain(offset).delete(query.length).insert(newBlotInfo),
    Quill.sources.USER
  );
}

export function detectUrlOrEmbed(quill, blot, range) {
  let offset = blot.offset(quill.scroll);
  let text = blot.domNode.innerText;

  if (matchSupportedEmbeds(text)) {
    quill.updateContents(
      new Delta().retain(offset).delete(text.length).insert({ embed: text }),
      Quill.sources.USER
    );
    return;
  }

  let matches = findUrl(text);
  for (let match of matches) {
    quill.formatText(
      offset + match.index,
      match.length,
      "link",
      text.substr(match.index, match.length)
    );
  }
}

export function prepareArticleEditView(quill) {
  quill.setContents(
    new Delta()
      .insert("\n", { titleBlock: true })
      .insert("\n", { signatureBlock: true })
      .insert("\n", { paragraph: true }),
    Quill.sources.SILENT
  );
  checkBlotsState(quill);
}

export function checkFiguresState(quill, articleElements, range) {
  let allFigures = quill.scroll.descendants(
    FigureBlot,
    0,
    quill.scroll.length()
  );
  let currentFigure = quill.scroll.descendant(FigureBlot, range.index)[0];
  allFigures.forEach((blot) => {
    if (currentFigure !== blot) {
      blot.removeSelection();
    }
  });
  if (currentFigure) {
    currentFigure.select();
    articleElements.formatTooltip.hide();
    articleElements.lineButtons.hide();
  }
}

export function checkBlotsState(quill) {
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

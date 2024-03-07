import {
  HeaderBlot,
  HeaderH2Blot,
  HeaderH3Blot,
  HeaderH4Blot,
  HeaderH5Blot,
} from "./blots/headers";
import LinkBlot from "./blots/link";
import { isEditMode, isMobileView, setProperTextDirection } from "./page";
import { selectImage, showFlash, urlPrepare } from "./utils";
import $ from "jquery";
import Quill from "quill/core";
import Delta from "quill-delta";
import TextParagraph from "./blots/text";

export class ViewElement {
  setViewCondition() {}

  getJQueryElement() {}

  isEnabled() {
    return true;
  }

  getAnimationClasses() {}

  setVisible(state) {
    if (!this.isEnabled()) {
      return;
    }
    let tooltip = this.getJQueryElement();
    if (state) {
      if (this.getAnimationClasses() != undefined) {
        for (let animationClass of this.getAnimationClasses()) {
          tooltip.addClass(animationClass);
        }
      }
      tooltip.addClass("shown");
    } else {
      if (this.getAnimationClasses() != undefined) {
        for (let animationClass of this.getAnimationClasses()) {
          tooltip.removeClass(animationClass);
        }
      }
      tooltip.removeClass("shown");
    }
  }

  show() {
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }

  constructor() {
    this.setViewCondition();
  }
}

export class MenuItem extends ViewElement {
  icon;
  text;
  itemElement;
  tag;
  callback;
  subMenu;

  constructor(element) {
    super();
    this.itemElement = element;
    this.tag = element.getAttribute("tag");
    if (element.children.length > 1) {
      this.icon = element.querySelector("i");
      this.text = element.querySelector("span");
      if (this.icon == undefined) {
        this.text = element;
      }
    }
    let subMenu = $(`[for=${this.itemElement.getAttribute("id")}]`).get(0);
    if (subMenu) {
      this.subMenu = new PopupMenu(subMenu);
      $(element).on("mouseover", () => {
        this.subMenu.setRelativePosition(this.getJQueryElement());
        this.subMenu.show();
      });
      $(element).on("mouseout", () => {
        this.subMenu.hide();
      });
    }
  }

  setCallback(func) {
    this.callback = func;
    $(this.itemElement).on("click", func);
  }

  static new(text, iconClass) {
    let element;
    if (iconClass == undefined) {
      element = document.createElement("div");
      element.setAttribute("class", "menuItem");
      element.innerText = text;
    } else {
      element = document.createElement("div");
      element.setAttribute("class", "menuItem");

      let icon = document.createElement("i");
      icon.setAttribute("class", iconClass);
      let textBlock = document.createElement("span");
      textBlock.innerText = text;

      element.appendChild(icon);
      element.appendChild(textBlock);
    }
    return $(element);
  }

  getJQueryElement() {
    return $(this.itemElement);
  }
}

export class PopupMenu extends ViewElement {
  static _popups = [];

  constructor(element) {
    super();
    this.menu = element;
    this._pullMenuItems();
  }

  static shutdown() {
    for (let popup of PopupMenu._popups) {
      popup.hide();
    }
    PopupMenu._popups = [];
  }

  _pullMenuItems() {
    this.items = [];
    $(".menuItem", this.menu).each((i, child) => {
      this.items.push(new MenuItem(child));
    });
  }

  addItem(item) {
    this.items.push(item);
    this.menu.appendChild(item.itemElement);
  }

  getItems() {
    return this.items;
  }

  getJQueryElement() {
    return $(this.menu);
  }

  setVisible(state) {
    if (state) {
      PopupMenu._popups.push(this);
    }
    super.setVisible(state);
  }

  setRelativePosition(element) {}
}

export class AddMenu extends PopupMenu {
  constructor(quill) {
    super($("#addMenu").get(0));
    this.quill = quill;
    this.initListeners();
  }

  initListeners() {
    $("#menuDivider").on("click", this.addDivider.bind(this));
    $("#menuHeadersH1").on("click", () => {
      this.addHeader(1);
    });

    $("#menuHeadersH2").on("click", () => {
      this.addHeader(2);
    });

    $("#menuHeadersH3").on("click", () => {
      this.addHeader(3);
    });

    $("#menuHeadersH4").on("click", () => {
      this.addHeader(4);
    });

    $("#menuHeadersH5").on("click", () => {
      this.addHeader(5);
    });

    $("#menuImage").on("click", () => {
      this.addImage();
    });
  }

  addImage() {
    let urlAction = (value) => {
      let range = this.quill.getSelection(true);
      this.quill.updateContents(
        new Delta()
          .retain(range.index)
          .delete(range.length)
          .insert({ image: value }),
        Quill.sources.USER
      );
    };

    let tp = new PromptTooltip(this.quill, urlAction);

    let postAction = () => {
      selectImage(
        "image/gif, image/jpeg, image/jpg, image/png",
        (quill, e) => {
          let image = e.target.files[0];
          if (!image) {
            showFlash("Ошибка формата файла", "error");
          }
          let reader = new FileReader();
          let range = quill.getSelection(true);
          reader.onload = (e) => {
            quill.updateContents(
              new Delta()
                .retain(range.index)
                .delete(range.length)
                .insert({ image: e.target.result }),
              Quill.sources.USER
            );
          };
          reader.readAsDataURL(image);
        },
        this.quill
      );
      tp.hide();
    };

    this.hide();
    tp.updatePositionCallback = (element) => {
      let offset = $("#add_more_button").offset();
      element.css({
        top: offset.top,
      });
    };
    tp.enableFileButton(postAction);
    tp.show();
  }

  addHeader(level) {
    let selection = this.quill.getSelection(true);
    let offset = selection != null ? selection.index : this.quill.getLength();
    let styles = {};
    styles[`headerH${level}`] = true;
    this.quill.updateContents(
      new Delta().retain(offset).insert("\n", styles),
      Quill.sources.SILENT
    );
  }

  addDivider() {
    let selection = this.quill.getSelection(true);
    let offset = selection != null ? selection.index : this.quill.getLength();
    this.quill.insertEmbed(offset, "divider", true, Quill.sources.API);
  }

  setRelativePosition(element) {
    let styles = {
      top: element.outerHeight(),
      left: element.outerWidth(),
    };
    if (isMobileView()) {
      styles["left"] =
        -this.getJQueryElement().outerWidth() + (3 / 2) * element.outerWidth();
    }
    this.getJQueryElement().css(styles);
  }
}

export class Tooltip extends ViewElement {
  constructor(quill) {
    super();
    this.quill = quill;
    setProperTextDirection(this.getJQueryElement().get(0));
  }

  updatePosition(placeOnTop, range) {
    if (this.updatePositionCallback) {
      this.updatePositionCallback(this.getJQueryElement());
      return;
    }
    let tooltip = this.getJQueryElement();
    if (!range) {
      range = this.quill.getSelection();
    }

    let directionSign = placeOnTop ? 1 : -1;
    let zeroSign = placeOnTop ? 0 : 1;

    let rangeBounds = this.quill.getBounds(range);
    let maxLeft = $(window).outerWidth() - tooltip.outerWidth() - 3;
    tooltip.css({
      top:
        rangeBounds.top -
        directionSign * tooltip.outerHeight() -
        (zeroSign * tooltip.outerHeight()) / 2,
      left:
        $(this.quill.container).offset().left + rangeBounds.left > maxLeft
          ? maxLeft
          : rangeBounds.left,
    });
    if (
      tooltip.get(0).getAttribute("dir") == "rtl" &&
      $(window).outerWidth() >= 1050
    ) {
      tooltip.css({
        left: maxLeft - $(".rightbar").outerWidth(),
      });
    }
  }
}

export class FormatTooltip extends Tooltip {
  constructor(quill) {
    super();
    this.quill = quill;
    this.enabledState = true;

    $("#boldButton").on("click", this.bold.bind(this));
    $("#italicButton").on("click", this.italic.bind(this));
    $("#underlineButton").on("click", this.underline.bind(this));
    $("#strikeButton").on("click", this.strike.bind(this));
    $("#linkButton").on("click", this.link.bind(this));
    $("#headerH1Button").on("click", this.header(1).bind(this));
    $("#headerH2Button").on("click", this.header(2).bind(this));
    $("#highlightButton").on("click", this.highlight.bind(this));
    $("#quoteButton").on("click", this.quote.bind(this));
    $("#alignButton").on("click", this.align.bind(this));
    $("#indexButton").on("click", this.script.bind(this));
  }

  setVisible(state) {
    if (state) {
      this.updatePosition(isMobileView() ? false : true);
    }
    super.setVisible(state);
  }

  getAnimationClasses() {
    return ["appear_animation"];
  }

  getJQueryElement() {
    return $(".formatTooltip");
  }

  prepareFormat(event) {
    let applied = event.target.classList.contains("applied");
    let range = this.quill.getSelection(true);
    event.preventDefault();
    return [applied, range];
  }

  formatDone(range) {
    this.updateButtonState(range);
  }

  bold(event) {
    let [applied, range] = this.prepareFormat(event);
    this.quill.format("bold", !applied, Quill.sources.API);
    this.formatDone(range);
  }

  italic(event) {
    let [applied, range] = this.prepareFormat(event);
    this.quill.format("italic", !applied, Quill.sources.API);
    this.formatDone(range);
  }

  underline(event) {
    let [applied, range] = this.prepareFormat(event);
    this.quill.format("underline", !applied, Quill.sources.API);
    this.formatDone(range);
  }

  strike(event) {
    let [applied, range] = this.prepareFormat(event);
    this.quill.format("strike", !applied, Quill.sources.API);
    this.formatDone(range);
  }

  highlight(event) {
    let [applied, range] = this.prepareFormat(event);
    this.quill.format("highlight", !applied, Quill.sources.API);
    this.formatDone(range);
  }

  align(event) {
    let [applied, range] = this.prepareFormat(event);
    let [textBlock, offset] = this.quill.scroll.descendants(
      TextParagraph,
      range.index,
      range.length
    );
    switch (textBlock.getAlignment()) {
      case "left":
        textBlock.align("center");
        break;
      case "center":
        textBlock.align("right");
        break;
      case "right":
        textBlock.align("left");
        break;
    }
    this.formatDone(range);
  }

  script(event) {
    let [applied, range] = this.prepareFormat(event);
    let format = this.quill.getFormat(range);
    if (!format["script"]) {
      this.quill.format("script", "sub");
    } else if (format["script"] == "sub") {
      this.quill.format("script", "super");
    } else if (format["script"] == "super") {
      this.quill.format("script", false);
    }
    this.formatDone(range);
  }

  link(event) {
    let [applied, range] = this.prepareFormat(event);
    if (!applied) {
      let tooltip = new PromptTooltip(this.quill, (text) => {
        this.quill.format("link", urlPrepare(text), Quill.sources.API);
        this.formatDone(range);
        this.show();
      });
      this.hide();
      tooltip.show();
    } else {
      this.quill.format("link", false, Quill.sources.API);
      this.formatDone(range);
    }
  }

  header(level) {
    if (level > 5 || level < 1) {
      level = 1;
    }
    let classes = [
      HeaderBlot,
      HeaderH2Blot,
      HeaderH3Blot,
      HeaderH4Blot,
      HeaderH5Blot,
    ];
    return (event) => {
      let [applied, range] = this.prepareFormat(event);
      let format = `headerH${level}`;
      this.quill.format("headerH1", false, Quill.sources.API);
      this.quill.format("headerH2", false, Quill.sources.API);
      this.quill.format("headerH3", false, Quill.sources.API);
      this.quill.format("headerH4", false, Quill.sources.API);
      this.quill.format("headerH5", false, Quill.sources.API);
      this.quill.format(format, !applied, Quill.sources.API);
      let blots = this.quill.scroll.descendants(
        classes[level - 1],
        range.index,
        range.length
      );
      blots.forEach((blot) => {
        let index = this.quill.getIndex(blot);
        let length = blot.length();
        this.quill.formatText(
          index,
          length,
          {
            bold: false,
            italic: false,
            code: false,
          },
          Quill.sources.SILENT
        );
      });
      this.formatDone(range);
    };
  }

  quote(event) {
    let [applied, range] = this.prepareFormat(event);

    let centered = event.target.classList.contains("center-quote")
      ? true
      : false;
    applied ||= centered;

    if (applied && centered) {
      this.quill.format("blockquoteBlock", false, Quill.sources.API);
      this.quill.format("centerBlockquoteBlock", false, Quill.sources.SILENT);
    } else if (applied && !centered) {
      this.quill.format("blockquoteBlock", false, Quill.sources.API);
      this.quill.format("centerBlockquoteBlock", true, Quill.sources.SILENT);
    } else {
      this.quill.format("blockquoteBlock", !applied, Quill.sources.API);
    }
    this.formatDone(range);
  }

  updateButtonState(range) {
    let formats = range == null ? {} : this.quill.getFormat(range);
    let [textBlock, offset] = this.quill.scroll.descendants(
      TextParagraph,
      range.index,
      range.length
    );

    let inside_code = !!formats["code-block"];
    let inside_header = !!(
      formats["headerH1"] ||
      formats["headerH2"] ||
      formats["headerH3"] ||
      formats["headerH4"] ||
      formats["headerH5"]
    );
    let inside_signature = !!formats["signatureBlock"];

    $("#boldButton").toggleClass("applied", !!formats["bold"]);
    $("#italicButton").toggleClass("applied", !!formats["italic"]);
    $("#underlineButton").toggleClass("applied", !!formats["underline"]);
    $("#strikeButton").toggleClass("applied", !!formats["strike"]);
    $("#headerH1Button").toggleClass("applied", !!formats["headerH1"]);
    $("#headerH2Button").toggleClass(
      "applied",
      !!formats["headerH2"] ||
        !!formats["headerH3"] ||
        !!formats["headerH4"] ||
        !!formats["headerH5"]
    );
    $("#highlightButton").toggleClass("applied", !!formats["highlight"]);

    $("#quoteButton").toggleClass("applied", !!formats["blockquoteBlock"]);
    $("#quoteButton").toggleClass(
      "center-quote",
      !!formats["centerBlockquoteBlock"]
    );

    $("#indexButton").toggleClass(
      "applied",
      formats["script"] == "sub" || formats["script"] == "super"
    );
    $("#indexButton").toggleClass(
      "ri-subscript",
      formats["script"] == "sub" || !formats["script"]
    );
    $("#indexButton").toggleClass(
      "ri-superscript",
      formats["script"] == "super"
    );

    if (textBlock != null) {
      let align = textBlock.getAlignment();
      switch (align) {
        case "left":
          align = "ri-align-left";
          break;
        case "center":
          align = "ri-align-center";
          break;
        case "right":
          align = "ri-align-right";
          break;
      }
      let button = $("#alignButton");
      button.toggleClass("ri-align-left", false);
      button.toggleClass("ri-align-center", false);
      button.toggleClass("ri-align-right", false);
      button.toggleClass(align, true);
    }

    if (range != null) {
      let links = this.quill.scroll.descendants(
        LinkBlot,
        range.index,
        range.length
      );
      $("#linkButton").toggleClass("applied", !!links.length);
    } else {
      $("#linkButton").toggleClass("applied", false);
    }

    if (inside_code) {
      this.enabledState = false;
    } else {
      this.enabledState = true;
    }

    $("#boldButton").toggleClass("hidden", inside_header || inside_signature);
    $("#italicButton").toggleClass("hidden", inside_header || inside_signature);

    $("#underlineButton").toggleClass("hidden", inside_signature);
    $("#strikeButton").toggleClass("hidden", inside_signature);
    $("#headerH1Button").toggleClass("hidden", inside_signature);
    $("#headerH2Button").toggleClass("hidden", inside_signature);
    $("#highlightButton").toggleClass("hidden", inside_signature);
    $("#quoteButton").toggleClass("hidden", inside_signature);
    $("#alignButton").toggleClass("hidden", inside_signature);
    $("#indexButton").toggleClass("hidden", inside_signature);
  }

  isEnabled() {
    return isEditMode() && this.enabledState;
  }
}

export class PromptTooltip extends Tooltip {
  constructor(quill, onEnterCallback) {
    super();
    this.quill = quill;
    this.enabledState = true;

    $("#mainTooltipCloseButton").on("click", this.hide.bind(this));
    $(".tooltipPrompt").val("");
    $(".tooltipPrompt").on("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onEnterCallback($(".tooltipPrompt").val());
        this.hide();
      }
    });
  }

  enableFileButton(callback) {
    $("#mainTooltipFileButton").css({
      display: "inline",
    });
    $("#mainTooltipFileButton").on("click", callback);
  }

  setPlaceholder(text) {
    $(".tooltipPrompt").attr("placeholder", text);
  }

  setVisible(state) {
    if (state) {
      this.updatePosition(isMobileView() ? false : true);
    }
    super.setVisible(state);
    if (state) {
      $(".tooltipPrompt").trigger("focus");
    }
  }

  getJQueryElement() {
    return $(".tooltip");
  }
}

export class TextTooltip extends Tooltip {
  blot;

  setVisible(state) {
    if (state) {
      this.updatePosition(false, {
        index: this.quill.getIndex(this.blot),
        length: this.blot.length(),
      });
    }
    super.setVisible(state);
  }

  setText(text, blot) {
    $(this.getJQueryElement(), ".tooltipText").text(text);
    this.blot = blot;
  }

  getJQueryElement() {
    return $(".textTooltip");
  }
}

export class LineButtonGroup extends ViewElement {
  constructor(quill) {
    super();
    this.quill = quill;
    this.menu = new AddMenu(this.quill);
    this.initListeners();
    setProperTextDirection(this.getJQueryElement().get(0));
  }

  initListeners() {
    $("#image_button").on("click", this.menu.addImage.bind(this.menu));
    $("#add_more_button").on("click", () => {
      this.menu.setRelativePosition($("#add_more_button"));
      this.menu.show();
    });
  }

  getJQueryElement() {
    return $(".lineButtons");
  }

  setVisible(state) {
    let range = this.quill.getSelection();
    if (range == null) return;
    if (!isEditMode()) return;
    super.setVisible(state);
    if (state) {
      let bounds = this.quill.getBounds(range);
      $(".lineButtons").css({
        top: bounds.top - 3,
      });
    }
  }
}

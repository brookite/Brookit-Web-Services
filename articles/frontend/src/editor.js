import {
  HeaderBlot,
  HeaderH2Blot,
  HeaderH3Blot,
  HeaderH4Blot,
  HeaderH5Blot,
} from "./blots/headers";
import LinkBlot from "./blots/link";
import { isEditMode, isMobileView } from "./page";
import { urlPrepare } from "./utils";
import $ from "jquery";
import Quill from "quill/core";

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

  setRelativePosition(element) {
    this.getJQueryElement().css({
      left: element.outerWidth(),
      top: element.offset().top - element.parent().offset().top,
    });
  }
}

export class AddMenu extends PopupMenu {
  constructor(quill) {
    super($("#addMenu").get(0));
    this.quill = quill;
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
  }

  updatePosition(placeOnTop, range) {
    let tooltip = this.getJQueryElement();
    if (!range) {
      range = this.quill.getSelection();
    }

    let directionSign = placeOnTop ? 1 : -1;
    let zeroSign = placeOnTop ? 0 : 1;

    let rangeBounds = this.quill.getBounds(range);
    tooltip.css({
      top:
        rangeBounds.top -
        directionSign * tooltip.outerHeight() -
        (zeroSign * tooltip.outerHeight()) / 2,
      left: rangeBounds.left,
    });
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
      this.quill.format(format, !applied, Quill.sources.API);
      let blots = this.quill.scroll.descendants(
        classes[level - 1],
        range.index,
        range.length
      );
      blots.forEach((blot) => {
        let index = quill.getIndex(blot);
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
    this.quill.format("blockquoteBlock", !applied, Quill.sources.API);
    this.formatDone(range);
  }

  updateButtonState(range) {
    let formats = range == null ? {} : this.quill.getFormat(range);

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
    $("#headerH2Button").toggleClass("applied", !!formats["headerH2"]);
    $("#highlightButton").toggleClass("applied", !!formats["highlight"]);
    $("#quoteButton").toggleClass("applied", !!formats["blockquoteBlock"]);

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
    this.initListeners();
  }

  initListeners() {
    $("#add_more_button").on("click", () => {
      let menu = new AddMenu(this.quill);
      menu.setRelativePosition($("#add_more_button"));
      menu.show();
    });
    $("#image_button").on("click", () => {});
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

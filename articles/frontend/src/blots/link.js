import Link from "quill/formats/link";
import { TextTooltip } from "../editor";
import $ from "jquery";
import { quill } from "..";

export class LinkBlot extends Link {
  tooltipObject;

  constructor(node, value) {
    super(node);
    $(node).on("mouseover", () => {
      this.tooltipObject = new TextTooltip(quill);
      this.tooltipObject.setText(value, this);
      this.tooltipObject.show();
    });
    $(node).on("mouseout", () => {
      this.tooltipObject.hide();
      this.tooltipObject = null;
    });
  }
}

export { LinkBlot as default };

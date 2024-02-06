import { PageView } from "./common.js";
import { randomInt } from "../utils/random.js";
import { Queue } from "../entities/playlist.js";
import { renderView } from "./common.js";

export class MainView extends PageView {
  selectedSourceId = -1;

  init() {
    $("#source-select .dropdown-item").click((e) => {
      let element = e.target;
      this.selectedSourceId = parseInt(element.getAttribute("source_id"));
      renderView(
        `main?source_id=${this.selectedSourceId}`,
        `?source_id=${this.selectedSourceId}`,
        this.as_function.bind(this),
        this.webView
      );
    });
    if (
      document.querySelector("#source-select .dropdown-item.active") !=
      undefined
    ) {
      document.querySelector("#dropdownMenuButton").innerHTML =
        document.querySelector(".dropdown-item.active").innerHTML;
    }
  }

  fetchQueue() {
    this.player.availableQueue = new Queue(
      "random",
      randomInt(1000, 20000000) * 10 + this.selectedSourceId,
      document.querySelectorAll(".queue")[2]
    );
  }
}

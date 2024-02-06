import { PageView, WebView, loadView } from "./common.js";
import { randomInt } from "../utils/random.js";
import { Queue } from "../entities/playlist.js";
import { MediaObject } from "../entities/media.js";

export class SourceView extends PageView {
  selectedSourceId = -1;

  init() {
    $(".dropdown-item").click((e) => {
      let element = e.target;
      this.selectedSourceId = parseInt(element.getAttribute("source_id"));
      let list = element.parentElement.parentElement;
      for (let el of list.children) {
        el.children[0].classList.remove("active");
      }
      element.classList.add("active");
      document.querySelector("#dropdownMenuButton").innerHTML =
        element.innerHTML;
      this.webView.pageNum = 1;
      loadView(
        `sourceTrackList?page=${this.webView.pageNum}&id=${this.selectedSourceId}`,
        (data) => {
          document.querySelector(".music-content").innerHTML = data;
          this.player.availableQueue = new Queue(
            "source",
            this.selectedSourceId * 10 + this.webView.pageNum
          );
          this.webView.setListenersOnSongList(this.player);
        }
      );
    });
    this.webView.scrollEndTrigger = () => {
      this.webView.pageNum += 1;
      loadView(
        `sourceTrackList?page=${this.webView.pageNum}&id=${this.selectedSourceId}`,
        (data) => {
          document.querySelector(".music-content").innerHTML += data;
          this.player.availableQueue = new Queue(
            "source",
            this.selectedSourceId * 10 + this.webView.pageNum
          );
          this.webView.setListenersOnSongList(this.player);
        }
      );
    };
    $(".radio-play-btn").click((e) => {
      let elements = document.querySelectorAll(".radio-play-btn");
      let newQueue = new Queue("radio", 1);
      let tracks = [];
      let i = 0;
      let pointer = 0;
      for (let radio of elements) {
        if (e.target.parentElement == radio) {
          pointer = i;
        }
        let name = radio.querySelector(".radio-name").innerHTML;
        let url = radio.getAttribute("stream_url");
        tracks.push(new MediaObject(name, "радио").setUrl(url));
        i++;
      }
      newQueue.tracks = tracks;
      newQueue.setPointer(pointer);
      this.player.loadQueue(newQueue);
      this.player.play();
    });
  }

  fetchQueue() {
    this.player.availableQueue = new Queue(
      "empty_sources",
      randomInt(1000, 20000000) * 10,
      document.querySelectorAll(".queue")[2]
    );
  }

  clearInfo() {
    this.selectedSourceId = -1;
  }
}

import { PageView, WebView, loadView } from "./common.js";
import { Queue } from "../entities/playlist.js";
import { AddingSong } from "../modals/songAdding.js";

export class SearchView extends PageView {
  typingTimer;
  doneTypingInterval = 300;

  init() {
    this.webView.pageNum = 1;
    var searchAction = (q) => {
      loadView(
        "searchMedia",
        (data) => {
          document.querySelector(".music-content").innerHTML = data;
          this.player.availableQueue = new Queue(
            "search",
            900 + this.webView.pageNum
          );
          $(".addNewSong").click(() => {
            AddingSong.addSong();
          });
          this.webView.setListenersOnSongList(this.player);
        },
        { query: q.trim() }
      );
    };

    $(".search-field").on("keyup", (e) => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(
        searchAction,
        this.doneTypingInterval,
        e.target.value
      );
    });

    $(".search-field").on("keydown", () => {
      clearTimeout(this.typingTimer);
    });

    $(".addSong-btn").click(() => {
      AddingSong.saveSong();
    });
  }
}

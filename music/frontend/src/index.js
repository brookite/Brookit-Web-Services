import { MainView } from "./views/main.js";
import { SourceView } from "./views/sources.js";
import { SettingsView } from "./views/settings.js";
import { SearchView } from "./views/search.js";
import { PlaylistView } from "./views/playlists.js";
import { LabView } from "./views/lab.js";

import { initAllModals } from "./modals/global.js";

import { Player } from "./core/player.js";
import { WebView, renderView } from "./views/common.js";
import { AddingSong } from "./modals/songAdding.js";
import { Queue } from "./entities/playlist.js";
import { LocalQueue } from "./entities/savelist.js";
import { DEFAULT_SAVED_ID } from "./entities/savelist.js";

let player = new Player();
let webView = new WebView(player);
var view;
Queue.onRender = () => {
  webView.setListenersOnSongList(player);
};
player.initListeners(webView);
let mainQueue = new Queue(
  "current",
  9,
  document.querySelector(".queue-current")
);
let savedQueue = new LocalQueue();
webView.savedQueue = savedQueue;
player.onQueueChanged = () => {
  if (player.queue.id == DEFAULT_SAVED_ID) {
    player.queue = savedQueue;
  }
  mainQueue.sub(player.queue).render();
};

// Event Listeners
$(".main-link").click(() => {
  view = new MainView(webView, player);
  renderView("main", "/music", view, webView);
});

$(".sources-link").click(() => {
  view = new SourceView(webView, player);
  renderView("sources", "/music/sources", view, webView);
});

$(".settings-link").click(() => {
  view = new SettingsView(webView, player);
  renderView("settings", "/music/settings", view, webView);
});

$(".search-link").click(() => {
  view = new SearchView(webView, player);
  renderView("search", "/music/search", view, webView);
});

$(".saved-link").click(() => {
  view = new PlaylistView(webView, player);
  renderView("playlists", "/music/playlists", view, webView);
});

$(".lab-link").click(() => {
  view = new LabView(webView, player);
  renderView("lab", "/music/lab", view, webView);
});

window.onscroll = function () {
  if (window.innerHeight + window.scrollY + 5 >= document.body.offsetHeight) {
    console.log("End reached");
    if (webView.scrollEndTrigger != undefined) {
      webView.scrollEndTrigger();
    }
  }
};

// Bare view init

let urlArgs = window.location.href.split("/");
let urlArg = urlArgs[urlArgs.length - 1];
if (urlArg.startsWith("sources")) {
  view = new SourceView(webView, player).as_function();
} else if (urlArg.startsWith("settings")) {
  view = new SettingsView(webView, player).as_function();
} else if (urlArg.startsWith("search")) {
  view = new SearchView(webView, player).as_function();
} else if (urlArg.startsWith("playlists")) {
  view = new PlaylistView(webView, player).as_function();
} else if (urlArg.startsWith("lab")) {
  view = new LabView(webView, player).as_function();
} else {
  view = new MainView(webView, player).as_function();
}

const modals = initAllModals(webView, player);

$(".addToPlaylistBtn").click(() => {
  AddingSong.addToPlaylist();
});

$(".queueBtn").click(() => {
  const sidebar = document.getElementById("sidebar");

  if (!sidebar.classList.contains("opened-sidebar")) {
    sidebar.classList.add("opened-sidebar");
  } else {
    sidebar.classList.remove("opened-sidebar");
  }
});

$(".shuffleBtn").click(() => {
  let isCurrentQueue = document
    .querySelector("#current-tab")
    .classList.contains("active");
  if (isCurrentQueue) {
    mainQueue.setPointer(player.queue.getPointer());
    mainQueue.initState = player.queue.initState;
    mainQueue.shuffle();
    player.queue.sub(mainQueue).render();
  } else {
    savedQueue.shuffle();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.code == "Space" && $(".modal.in").length > 0) {
    player.setPause(!player.isPaused());
  }
});

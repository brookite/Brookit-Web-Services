import { TrackInfo } from "./trackInfo.js";
import { AddingSong } from "./songAdding.js";
import { YoutubeSearch } from "./youtubeSearch.js";
import initLyrics from "./videoView.js";

export function initAllModals(webView, player) {
  const modals = [
    new TrackInfo(webView, player),
    new AddingSong(webView, player),
    new YoutubeSearch(webView, player),
  ];
  for (let modal of modals) {
    modal.initListeners();
  }
  initLyrics(player);
  return modals;
}

import $ from "jquery";

export const RIGHTBAR_WIDTH = 1050;
export const MOBILE_VIEW_WIDTH = 950;
export const COMPACT_VIEW_WIDTH = 500;

export function getViewWidth() {
  return $(".view").outerWidth();
}

export function isEditMode() {
  return $(".page").hasClass("page_edit");
}

export function isMobileView() {
  return parseInt($(document).width()) <= MOBILE_VIEW_WIDTH;
}

export function setProperTextDirection(element, root) {
  if (root == undefined) {
    root = $(".view").get(0);
  }
  element.setAttribute("dir", window.getComputedStyle(root).direction);
}

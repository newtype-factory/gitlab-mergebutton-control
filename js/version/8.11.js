"use strict";

class GitLab extends GitLabBase {
  constructor() {
  }

  static getVersion() {
    return "8.11";
  }

  static getCommentElements() {
    return $("#notes").find("ul.main-notes-list>li:not(.system-note) .note-text>p");
  }

  static getPlusOneCount() {
    var $votes = $('img[data-emoji="thumbsup"]').parent("button"), count = 0;

    if ($votes.length > 0) {
      count = Number($votes.text());
    }
    return count;
  }

  static getLoginName() {
    var $profile = $(".header-user-dropdown-toggle"), name = "";

    if ($profile.length > 0) {
      name = $profile.attr("href").replace(/\/u\//, "");
    }
    return name;
  }

  static getAuthorName() {
    var $author = $(".author_link").find('span[data-placement="top"]'), name = "";

    if ($author.length > 0) {
      name = $author.text();
    }
    return name;
  }

  static getWidgetElement() {
    return $(".mr-widget-body");
  }

  static getMergeFormElement() {
    return $('.accept-mr-form');
  }

  static mergeCancel() {
    var button = '<button name="button" type="submit" class="btn btn-create btn-grouped js-merge-button accept_merge_request">Accept Merge Request</button>';

    // キャンセルしたのでボタンに再度変更
    $(".accept-action").html(button);
  }
}

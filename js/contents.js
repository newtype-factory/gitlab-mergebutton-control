"use strict";

// LGTM判定
function isLGTM() {
  var $notes = GitLab.getCommentElements(),
      plusOneCount = GitLab.getPlusOneCount(),
      comment, $plusOne, flag = false;

  // +1のチェック
  if (plusOneCount > 0) {
    return true;
  }
  // システム以外のコメント欄のチェック
  $notes.each(function() {
    comment = $(this).text();
    $plusOne = $(this).find("img.emoji[title=':+1:']")
    // LGTMのコメントがあるか、+1の絵文字があるか
    if (comment.match(/LGTM/) || $plusOne.length >= 1) {
      flag = true;
      return false; // break
    }
  });

  return flag;
}

// 自分のマージリクエストかどうか判定
function isSelfMergeRequest() {
  var loginName = GitLab.getLoginName(),
      authorName = GitLab.getAuthorName();

  return loginName === authorName;
}

// マージボタンの無効化
function disableMergeButton(fileName) {
  var $widget = GitLab.getWidgetElement(),
      $parent = $($widget.parent()[0].className.split(" ")[0]),
      filePath = "html/" + fileName;

  if ($widget.length > 0 && fileName) {
    // 親要素のイベントOFF
    $parent.off();
    $.get(chrome.runtime.getURL(filePath), function(data) {
      // マージチェック中だと時間差でマージボタンが表示されるのでブロックごと内容変更
      $widget.html(data);
    });
  }
}

// 確認ダイアログの挿入
function insertConfirmScript() {
  var $form = GitLab.getMergeFormElement();

  if ($form.length > 0) {
    $form.submit(function() {
      if (!confirm("マージします。よろしいですか？")) {
        GitLab.mergeCancel();
        return false;
      }
    });
  }
}

// LGTMが出ていない場合の処理
function noLGTM() {
  disableMergeButton("noLGTM.html");
}

// マージリクエストの作成者でない場合の処理
function notAuthor() {
  disableMergeButton("notAuthor.html");
}

// メッセージリスナー(background.jsとのデータやりとり用)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var response = {}, flag = 0;

  if (request.name === "hasGitlabClass") {
    response = {gitlabClass: typeof(GitLab) === "function"};
  } else if (request.name === "hasLGTM") {
    response = {lgtm: isLGTM()};
  } else if (request.name === "disableMergeButton") {
    if ((flag = isLGTM()) === false) {
      noLGTM();
    } else if (request.allDisabled && isSelfMergeRequest() === false) {
      notAuthor();
    } else {
      insertConfirmScript();
    }
    response = {lgtm: flag};
  }
  sendResponse(response);
});

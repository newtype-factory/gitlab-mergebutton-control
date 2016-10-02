"use strict";

// ストレージからデータの取り出し
function getStorageData() {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(["url", "version", "allDisabled"], function(items) {
      var storageData = {
        url: "",
        version: "",
        allDisabled: false
      };
      if (items) {
        storageData.url = items.url;
        storageData.version = items.version;
        storageData.allDisabled = items.allDisabled;
      }
      resolve(storageData);
    });
  });
}

// ストレージへデータの保存
function setStorageData(data) {
  chrome.storage.sync.set(data);
}

// バージョン別scriptファイルの挿入
function injectScriptFile(tabId, filePath) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tabId, {name: "hasGitlabClass"}, null, function(response) {
      // jsのinject
      if (response && !response.gitlabClass) {
        chrome.tabs.executeScript(tabId, {file: filePath});
      }
      resolve();
    });
  });
}

// 引数に指定したURLからGitLabページかどうかの判定
function isGitLabPage(settingUrl, tabUrl) {
  if (!settingUrl || !tabUrl) {
    return false;
  }
  return Boolean(tabUrl.match(new RegExp(settingUrl)));
}

// 引数に指定したURLからGitLabのマージリクエストのページかどうかの判定
function isGitLabMergeRequestPage(url) {
  return Boolean(url.match(/\/merge_requests\/[0-9]+/));
}

// アイコン変更
function setToolBarIcon(tabId, flag) {
  chrome.browserAction.setIcon({
    tabId: tabId, path: "img/" + (flag ? "good-icon48.png" : "bad-icon48.png")
  });
}

// ページの状態チェック
function checkStatusOfPage(tab) {
  var storageData;

  getStorageData().then(function(data) {
    storageData = data;
    // GitLabページの場合
    if (isGitLabPage(data.url, tab.url)) {
      chrome.browserAction.enable(tab.id);
      return injectScriptFile(tab.id, "js/version/" + data.version + ".js");
    } else {
      chrome.browserAction.disable(tab.id);
      setToolBarIcon(tab.id, 1);
      return Promise.reject();
    }
  }).then(function() {
    // マージリクエストのページの場合
    if (isGitLabMergeRequestPage(tab.url)) {
      var message = {name: "disableMergeButton", allDisabled: storageData.allDisabled};
      chrome.tabs.sendMessage(tab.id, message, null, function(response) {
        if (response) {
          // ツールバーアイコンの更新
          setToolBarIcon(tab.id, response.lgtm);
        }
      });
    } else {
      setToolBarIcon(tab.id, 1);
    }
  }).catch(function() {
    // nop
  });
}

// 拡張機能のインストール時のイベント
chrome.runtime.onInstalled.addListener(function() {
  getStorageData().then(function(data) {
    if (!data) {
      alert('お使いのGitLabのURL、バージョンを設定して下さい。');
      chrome.runtime.openOptionsPage();
    }
  });
});

// ページがアクティブになったときのイベント
chrome.tabs.onActivated.addListener(function(activeInfo) {
  if (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab){
      checkStatusOfPage(tab);
    });
  }
});

// ページが更新されたときのイベント
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url) {
    checkStatusOfPage(tab);
  }
});

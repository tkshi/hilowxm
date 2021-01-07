// ライブラリのインポート
const webdriver = require('selenium-webdriver');
const { Builder, By, until, Dimension } = webdriver;
const { promisify } = require('util');
const sleep = require('sleep');

let hlDriver = new Builder().forBrowser('chrome').build();
let xmDriver = new Builder().forBrowser('chrome').build();

// 設定
const REWRIGHTPRICE = '104.01'; //書き換えるレート値
const REWRIGHTINTERVAL = 500; //レート値を書き換えるインターバル（ミリ秒）
const REWRIGHTSTART = 30000; //レート値を書き換えが開始するまでの時間（ミリ秒）

//
async function launchHighlow() {
  await hlDriver.manage().window().setRect({
    width: 1200,
    height: 1200,
    x: 0,
    y: 0,
  });
  await hlDriver.get('https://trade.highlow.com/'); //ハイローオーストラリアを開く
  await hlDriver.wait(until.elementLocated(By.css('#strike')), 10000); //レートの要素が読み込み終わるまで待つ
  await hlDriver.findElement(By.css('#header a.highlight.hidden-xs.outlineNone')).click();
  await hlDriver.wait(until.elementLocated(By.css('.cashback-tooltip.active')), 10000); //キャッシュバック通知が読み込み終わるまで待つ
  await hlDriver.findElement(By.css('.exit-onboarding')).click(); //キャッシュバック通知をクリックして閉じる
  await hlDriver.findElement(By.id('ChangingStrikeOOD')).click(); // Turboに切り替え
  await hlDriver.findElement(By.xpath('//*[@id="4046"]')).click(); // EUR/JPYに切り替え
}

async function rewriteHighlow() {
  // レートの数値を書き換え
  setInterval(async () => {
    await hlDriver.executeScript("document.querySelector('#carousel_container .carousel_item:first-child div.instrument-panel-body.ChangingStrikeOOD > div.clearfix.first-child > div:nth-child(2) > div > div.strike-value > span.strike').textContent = '104.01'");
  }, REWRIGHTINTERVAL);
}

async function launchXmTrading() {
  // ウィンドウのプロパティ
  await xmDriver.manage().window().setRect({
    width: 1200,
    height: 1200,
    x: 1200,
    y: 0,
  });

  // ウィンドウ立ち上げ時
  await xmDriver.get('https://www.xmtrading.com/jp/'); //XMトレーディングを開く
  await xmDriver.wait(until.elementLocated(By.xpath('//*[@id="cookieModal"]/div/div/div[1]/div[2]/div[2]/div/button')), 10000); //クッキー許可のモーダル表示まで待つ
  await sleep.msleep(1000); //エラー回避のための待ち時間
  await xmDriver.findElement(By.xpath('//*[@id="cookieModal"]/div/div/div[1]/div[2]/div[2]/div/button')).click(); // クッキーを許可するボタンをクリック

  let rateSection = xmDriver.findElement(By.xpath('/html/body/div[1]/div[3]/section[4]'));
  const actions = xmDriver.actions({ async: true }); //アクションを読み込む
  await actions.move({ origin: rateSection }).perform(); //指定要素までスクロールダウン
}

async function rewriteXmTrading() {
  // レートの数値を書き換え
  setInterval(async () => {
    await xmDriver.executeScript("document.querySelector('body > div.layout > div.site-canvas > section.container.hidden-xs.hidden-sm > div > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(2)').textContent = '104.01'");
    await xmDriver.executeScript("document.querySelector('body > div.layout > div.site-canvas > section.container.hidden-xs.hidden-sm > div > div:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(3)').textContent = '104.01'");
    await xmDriver.executeScript("document.querySelector('body > div.layout > div.site-canvas > section.container.hidden-xs.hidden-sm > div > div:nth-child(3) > table > tbody > tr:nth-child(3) > td:nth-child(2)').textContent = '104.01'");
    await xmDriver.executeScript("document.querySelector('body > div.layout > div.site-canvas > section.container.hidden-xs.hidden-sm > div > div:nth-child(3) > table > tbody > tr:nth-child(3) > td:nth-child(3)').textContent = '104.01'");
  }, REWRIGHTINTERVAL);
}

(async () => {
  await launchHighlow();
  await launchXmTrading();

  //レートを読み込み終えるための休憩
  await sleep.msleep(REWRIGHTSTART);

  await rewriteHighlow();
  await rewriteXmTrading();
})();

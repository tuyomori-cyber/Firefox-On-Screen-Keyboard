# FX-OSK 仕様書 v0.2

- 文書バージョン：0.2
- 作成日：2026-10-26
- 状態：現行実装ベース
- 対象：Firefox Manifest V2拡張、通常Webページ、fox-voice-editor埋め込み

## 1. 目的と構成

FX-OSKはFirefoxの通常ページへオンスクリーンキーボードを表示する拡張である。Foxbookでは、拡張ページへ直接コンテンツスクリプトを注入できない制約に対し、web-accessibleな`keyboard-frame.html`を埋め込む経路を追加する。

```text
fox-voice-editor
  └─ external message → FX-OSK background
       └─ keyboard-frame.html URL
            └─ postMessage → 親の手入力欄
```

拡張IDは`fx-osk-touch@tuyomori-cyber.github.io`、Manifestバージョンは2、現行拡張版は`1.11.0`である。

## 2. 通常ページのキーボード

`keyboard.js`を`<all_urls>`の全フレームへ`document_end`で注入する。テキスト系入力欄のフォーカスまたはクリックでキーボードを表示し、ページ内の入力対象へキー操作を送る。設定画面の`scaleValue`は`browser.storage.local`に保存する。

キーボードの表示・再表示時はviewport幅・高さからキー高さを`max(28, min(52, width×0.06, height×0.11))`で求める。リサイズ中に開いている場合は再配置する。

## 3. 埋め込み契約

横断契約の正本は[`IF-VE-OSK-001`](../../foxbook/docs/interfaces/fox-voice-editor--firefox-on-screen-keyboard.md)である。

| 方向 | メッセージ | 現行検証 |
| --- | --- | --- |
| voice-editor → FX-OSK | `{type:"fxosk.frame.request", version:1}` | 型・version |
| FX-OSK → voice-editor | `{type:"fxosk.frame.response", version:1, url}` | 固定frame URL |
| frame → 親 | `{type:"fxosk.key", version:1, key}` | 親window |
| frame → 親 | `{type:"fxosk.visibility", version:1, open}` | 親window |
| 親 → frame | `{type:"fxosk.show", version:1}` | `event.source === window.parent` |

`keyboard-frame.html`は`web_accessible_resources`として公開する。フレームは初期化時の内部closeを親へ通知せず、実際の開閉だけを`fxosk.visibility`で通知する。

## 4. 安全境界と既知の制約

- 外部メッセージ受信は型とversionだけを検証し、現状は送信元拡張IDを検証しない。
- frameの`postMessage`は親windowを送信先にするが、originは`*`であり、受信側がsourceと形式を検証する前提である。
- 通常ページ向けコンテンツスクリプトは`<all_urls>`へ注入される。ブラウザーUI、設定画面、PDFビューア、ファイル選択画面での入力は保証しない。
- 拡張から任意コマンドやローカルNative Hostは実行しない。

## 5. 配布

`package-addon.py`は10ファイルだけを新規ZIPへ梱包する。アップロード前にZIP内の`manifest.json`とソースを確認する。データ収集なしはmanifestで宣言する。

## 6. 検証

パッケージ生成と内容確認は実施済み。通常ページの入力と、fox-voice-editor埋め込みの実画面確認、Surface高DPI・回転確認、AMO再検証は未完了である。詳細はTODOとFoxbookの検証マトリクスに記録する。

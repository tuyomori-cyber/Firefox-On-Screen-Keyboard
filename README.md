# Firefox On Screen Keyboard (FX-OSK) v1.11.0

Firefox用のオンスクリーンキーボードです。通常Webページの入力欄へ表示する経路に加え、Foxbookでは`fox-voice-editor`の拡張ページに埋め込む経路を提供します。

現行の実装仕様は[仕様書 v0.2](specification/fx-osk仕様書v0.2.md)、未完了事項は[TODO](TODO.md)、横断契約は[`IF-VE-OSK-001`](../foxbook/docs/interfaces/fox-voice-editor--firefox-on-screen-keyboard.md)を参照してください。旧文書は[old/](old/)に保管しています。

## 拡張の識別と配布

- Manifest V2拡張、固定IDは`fx-osk-touch@tuyomori-cyber.github.io`。
- 元の公開版とは別の拡張として扱い、設定は自動移行しない。
- データ収集なしを`data_collection_permissions.required: ["none"]`で宣言する。
- 現行バージョンは`1.11.0`。同じIDで提出済み版を更新する場合は、`manifest.json`の版を上げる。

## fox-voice-editor連携

fox-voice-editorは外部メッセージ`fxosk.frame.request`（version 1）で、埋め込み用`keyboard-frame.html`のURLを取得します。フレームはキー入力を`fxosk.key`、表示状態を`fxosk.visibility`として親へ通知します。親からの`fxosk.show`（version 1）で再表示します。

埋め込み時のキー高さはフレームの幅・高さから28〜52pxへ自動調整され、リサイズ時にも再計算します。閉鎖後のiframeを親側で非表示・非受付にし、再フォーカス時は既存フレームを再表示する責務はfox-voice-editor側にあります。

現在の受信実装はメッセージ型とversionを検証しますが、送信元拡張IDを検証していません。この境界の強化はTODOに記録しています。

## アップロード用ZIP

```bash
python3 package-addon.py /tmp/fx-osk-upload.zip
unzip -l /tmp/fx-osk-upload.zip
```

出力先には未作成のZIPパスを指定します。パッケージにはmanifest、背景スクリプト、キーボード本体、埋め込みフレーム、アイコン、設定画面、LICENSEの10ファイルだけを含めます。`.git`、開発設定、既存ZIPは含めません。

## 検証

現時点で自動テストはありません。`package-addon.py`によるパッケージ内容の検査は実施済みです。Firefox実画面での埋め込み表示、文字入力、削除、Enter、Surfaceの高DPI・画面回転は未確認です。

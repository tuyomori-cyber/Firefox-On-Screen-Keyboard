# Firefox-On-Screen-Keyboard 現状 ToDo

更新日：2026-10-26

## 現状

- `foxbook-touch`ブランチでFoxbook向け改造を管理し、自分のForkの`mine/foxbook-touch`を追跡する。
- 固定ID、AMOのデータ収集なし宣言、`textContent`によるキー表示、最小ZIP作成を実装済み。
- fox-voice-editor向けに、埋め込みURL返却、キー入力通知、表示状態通知、再表示通知を実装済み。
- 埋め込みキーボードのキー高さを28〜52pxで自動調整し、リサイズ時に再計算する。
- `package-addon.py`で必要な10ファイルだけを梱包できることを確認済み。

## 未完了

- [ ] Firefox実画面で、fox-voice-editorへの埋め込み表示、文字入力、削除、Enter、閉鎖後の再表示を確認する。
- [ ] SurfaceのCageで通常ページの入力・削除・送信、英語配列、画面回転、高DPI時のキー寸法を確認する。
- [ ] `runtime.onMessageExternal`の送信元拡張IDを検証し、想定外の拡張から埋め込みURLを取得できないようにする。
- [ ] AMOで再検証し、固定ID・データ収集宣言・パッケージ内容に関する指摘の解消を確認する。
- [ ] 実機確認後、変更を自分のForkへcommit・pushする。元の作者のリポジトリへ直接pushしない。

## 参照

- 現行仕様：[仕様書 v0.2](specification/fx-osk仕様書v0.2.md)
- 横断契約：[`IF-VE-OSK-001`](../foxbook/docs/interfaces/fox-voice-editor--firefox-on-screen-keyboard.md)
- 横断管理：[FX-OSK管理文書](../foxbook/docs/repositories/firefox-on-screen-keyboard.md)
- 旧文書：[old/](old/)

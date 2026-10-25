# Firefox-On-Screen-Keyboard 現状 ToDo

更新日：2026-10-19

## 現状

- Foxbook用の改造ブランチは`foxbook-touch`。自分のFork`tuyomori-cyber/Firefox-On-Screen-Keyboard`の`mine/foxbook-touch`を追跡する設定済み。
- 通常のWebページで文字入力できることは確認済み。The SessionとGoogle検索での削除・検索実行、入力不能だった原因は未確認。
- Surfaceで倍率設定を100にしてもタッチ向けの大きさには不足。サイズ調整は未実施。
- AMO検証で指摘されたmanifestの必須宣言・固定ID・`innerHTML`警告は修正済み。必要ファイルだけを含む`/tmp/fx-osk-amo-fixed.zip`を作成・検査済み。
- fox-voice-editor向けに、拡張間メッセージで埋め込み用キーボードURLを返し、フレームのキー入力を手入力欄へ戻す連携経路を実装。キー高さは埋め込みフレームの横幅・高さに応じて28〜52pxへ自動調整し、リサイズ時も再計算する。閉じた後の再フォーカスでは既存フレームへ再表示通知を送り、閉じたiframeは親画面でも非表示・タップ非受付にする。パッケージ内容を検査済み。Firefox実画面での縮小表示・文字入力・削除・Enter操作確認は未実施。

## 未完了

- [ ] `/tmp/fx-osk-amo-fixed.zip`をAMOで再検証し、修正したエラーの解消を確認する。
- [ ] SurfaceのCageでThe SessionとGoogle検索の入力・削除・送信、英語配列、画面回転時の表示を評価する。
- [ ] `foxbook-touch`で高DPI時の`devicePixelRatio`を含むサイズ計算とキー寸法を調整し、Surfaceで一時読み込みしてタッチ操作を確認する。
- [ ] 調整が終わったら変更をcommitし、自分のForkへpushする。元の作者のリポジトリへ直接pushしない。
- [ ] 必要が生じた場合、AMO公開版とGitHubソースの差分、Firefoxの設定画面・PDFビューア・ファイル選択画面など通常ページ以外への入力要否を確認する。

## 参照

- Foxbook側の連携事項：`../foxbook-control/TODO.md`

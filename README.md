# Firefox On Screen Keyboard (FX-OSK)
An on screen keyboard for Firefox for those in a kiosk environment.

You can find the add-on at https://addons.mozilla.org/en-US/firefox/addon/fx-osk/ if you wish to download to your Firefox for testing purposes or if you wish to use it, any suggestions for upgrades will be accepted gratefully, I can incorporate and update to Firefox.

## 自分用ForkのAMO検証対応

このForkでは、元の公開版と区別する固定IDとして
`fx-osk-touch@tuyomori-cyber.github.io` を使用します。元の公開版とは別の拡張として扱われ、設定は自動移行されません。今後この改造版を更新するときは同じIDを維持してください。

データを外部へ収集・送信しないことを `data_collection_permissions.required: ["none"]` で宣言しています。キーの表示にはHTML解釈を伴わない `textContent` を使い、角括弧・波括弧も文字そのものとして定義しています。

## fox-voice-editor連携

fox-voice-editorが設定したこの拡張IDへ`fxosk.frame.request`を送ると、埋め込み用の`keyboard-frame.html` URLを返します。手入力欄へ表示されたフレームのキー操作は、親画面へ`fxosk.key`として返します。通常ページへのコンテンツスクリプト注入とは別経路で、拡張ページの手入力欄も操作できます。

キー高さは埋め込みフレームの横幅・高さに応じて28〜52pxへ自動調整され、ウインドウの分割やリサイズ後も再計算されます。設定画面の倍率はこの自動調整後の大きさに掛かる上限です。

キーボードを閉じた後も、fox-voice-editorの手入力欄へ再フォーカスすると、既存フレームへ再表示通知を送りキーボードを開き直します。

## アップロード用ZIPの作成

リポジトリ直下で実行します。出力先には未作成のZIPパスを指定してください。

```bash
python3 package-addon.py /tmp/fx-osk-upload.zip
unzip -l /tmp/fx-osk-upload.zip
```

必要な8ファイルだけを梱包します。`.git`、開発設定、既存ZIPは含めません。`.gitignore` はZIP作成時の除外指定ではありません。

アップロード前にZIP内の `manifest.json` とソースを確認してください。ZIPのファイル名によらず、拡張のバージョンは `manifest.json` の値（現在は `1.11.0`）です。同じIDの拡張を更新するときは、提出済みの版よりバージョンを上げる必要があります。

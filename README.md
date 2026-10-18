# Firefox On Screen Keyboard (FX-OSK)
An on screen keyboard for Firefox for those in a kiosk environment.

You can find the add-on at https://addons.mozilla.org/en-US/firefox/addon/fx-osk/ if you wish to download to your Firefox for testing purposes or if you wish to use it, any suggestions for upgrades will be accepted gratefully, I can incorporate and update to Firefox.

## 自分用ForkのAMO検証対応

このForkでは、元の公開版と区別する固定IDとして
`fx-osk-touch@tuyomori-cyber.github.io` を使用します。元の公開版とは別の拡張として扱われ、設定は自動移行されません。今後この改造版を更新するときは同じIDを維持してください。

データを外部へ収集・送信しないことを `data_collection_permissions.required: ["none"]` で宣言しています。キーの表示にはHTML解釈を伴わない `textContent` を使い、角括弧・波括弧も文字そのものとして定義しています。

## アップロード用ZIPの作成

リポジトリ直下で実行します。出力先には未作成のZIPパスを指定してください。

```bash
python3 package-addon.py /tmp/fx-osk-upload.zip
unzip -l /tmp/fx-osk-upload.zip
```

必要な8ファイルだけを梱包します。`.git`、開発設定、既存ZIPは含めません。`.gitignore` はZIP作成時の除外指定ではありません。

アップロード前にZIP内の `manifest.json` とソースを確認してください。ZIPのファイル名によらず、拡張のバージョンは `manifest.json` の値（現在は `1.11.0`）です。同じIDの拡張を更新するときは、提出済みの版よりバージョンを上げる必要があります。

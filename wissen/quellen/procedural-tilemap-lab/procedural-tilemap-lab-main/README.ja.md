# Procedural Tilemap Lab

[English](README.md) | 日本語

![Procedural Tilemap Lab](assets/readme/title.jpg)

2D見下ろし型ゲーム向けのタイルマップを、シードに基づいて生成するブラウザツールです。
草原、街道、森、山、ダンジョンの生成に対応しています。
バイブコーディングでのゲーム開発を想定し、生成器のコードとデータをAI統合バンドルとして出力できます。

## 起動

Node.js 22以降が必要です。`npm install`は不要です。

Windowsでは、次のファイルをダブルクリックします。

```text
start-lab-server.bat
```

コマンドラインまたはWindows以外の環境では、次のコマンドを実行します。

```powershell
npm start
```

## 主な機能

- シードに基づくマップ生成と、ランダム・プリセット・直接指定によるサイズ設定
- マップの生成、確認、デバッグ表示を行うマップビュー
- 配置物とプロシージャルエレメントを調整するマテリアルラボ
- 日本語・英語UI
- AI統合バンドルとPNG画像の出力

マテリアルラボの保存操作は、ローカルの作業フォルダ内にあるJSONを更新し、必要に応じてPNG素材を生成します。

## テスト

```powershell
npm test
```

多数のシードを対象とした総合検査には、`npm run check`を使用します。

## ライセンス

ソースコードと文書は[MIT License](LICENSE)、画像素材は[CC0 1.0 Universal](ASSET-LICENSE.md)で提供します。

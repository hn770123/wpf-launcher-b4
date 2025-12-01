# 医療用ランチャーシステム (Medical Launcher System)

Node.js + Express のバックエンドサーバーと、WPF (.NET Framework 4.6.1) のランチャーアプリケーションから構成されるシステムです。
WebダッシュボードからカスタムURIスキームを使用してローカルのランチャーアプリを起動し、認証トークンを渡すことでセキュアな連携を実現します。

## 機能概要

- **Webサーバー (Node.js)**
  - ユーザー認証 (ログイン)
  - ダッシュボード画面 (ランチャー起動ボタン)
  - API (設定情報の配信、接続情報の検証)
  - SQLiteデータベースによるユーザー・トークン管理

- **ランチャー (WPF)**
  - C# および VB.NET のプロジェクト
  - カスタムURIスキーム (`medlauncher://`) による起動
  - 起動引数からの認証トークン取得
  - サーバーAPIからの設定取得と動的なアプリ一覧表示
  - 医療現場をイメージしたクリーンなデザイン

## 前提条件

- **Node.js**: 最新のLTSバージョン推奨
- **.NET Framework 4.6.1 Developer Pack**: ランチャーのビルドに必要
- **Visual Studio** または **Build Tools for Visual Studio**: `.NET Desktop Development` ワークロード

## セットアップ手順

### 1. サーバー (Server)

1. `server` ディレクトリに移動します。
   ```powershell
   cd server
   ```
2. 依存関係をインストールします。
   ```powershell
   npm install
   ```
3. サーバーを起動します。
   ```powershell
   node index.js
   ```
   サーバーは `http://localhost:3000` で起動します。

### 2. ランチャー (Launcher)

1. `launcher` ディレクトリに移動します。
   ```powershell
   cd launcher
   ```
2. ソリューションをビルドします。
   ```powershell
   dotnet build
   ```
3. URIスキームをレジストリに登録します。
   - `launcher/register_scheme.reg` ファイルをダブルクリックして実行し、レジストリに追加してください。
   - **注意**: プロジェクトの配置場所が異なる場合は、`.reg` ファイル内のパスを修正してから実行してください。

## 使用方法

1. サーバーを起動した状態で、ブラウザで `http://localhost:3000` にアクセスします。
2. ログイン画面が表示されます。以下のデフォルトアカウントでログインしてください。
   - **ユーザー名**: `admin`
   - **パスワード**: `admin`
3. ダッシュボードの「Launch Medical System」ボタンをクリックします。
4. ブラウザが `MedicalLauncher` を開く許可を求めてくるので、許可します。
5. WPFアプリケーションが起動し、自動的に認証が行われ、アプリケーション一覧が表示されます。

## ディレクトリ構成

- `server/`: Node.js バックエンド
  - `index.js`: エントリーポイント
  - `database.js`: データベース設定
  - `public/`: フロントエンド (HTML/CSS/JS)
- `launcher/`: WPF ソリューション
  - `MedicalLauncher/`: C# プロジェクト
  - `MedicalLauncherVB/`: VB.NET プロジェクト
  - `register_scheme.reg`: URIスキーム登録用レジストリファイル

## トラブルシューティング

- **ビルドエラー**: .NET Framework 4.6.1 がインストールされていることを確認してください。
- **ランチャーが起動しない**: レジストリへの登録が正しく行われているか、パスが正しいか確認してください (`HKEY_CLASSES_ROOT\medlauncher`)。
- **設定が読み込めない**: サーバーが起動しているか、トークンが正しく渡されているか確認してください。

# モバイルアプリビルドガイド (Android / iOS)

このプロジェクトは **Capacitor** を使用して、Webアプリのコードベースからネイティブモバイルアプリ（Android / iOS）を生成できるように構成されています。

以下の手順に従って、Google Playストア向けのAABファイルおよびApp Store向けのiOSビルドを作成してください。

---

## 1. 前提条件

開発用PC（Mac推奨、AndroidのみならWindows可）に以下のツールをインストールしてください。

*   **Node.js** (v18以上)
*   **Android Studio** (Androidビルド用)
*   **Xcode** (iOSビルド用 ※Mac必須)
*   **CocoaPods** (iOS依存関係管理用: `sudo gem install cocoapods`)

## 2. プロジェクトのセットアップ

まず、ソースコードをローカル環境にダウンロードし、依存関係をインストールします。

```bash
# 依存関係のインストール
npm install
# または
pnpm install
```

## 3. Webアセットのビルドと同期

Webアプリの最新の状態をネイティブプロジェクトに反映させます。コードを変更した後は必ずこのコマンドを実行してください。

```bash
# Webアプリをビルド
npm run build

# ビルド成果物をネイティブプロジェクトにコピー
npx cap sync
```

---

## 4. Androidアプリのビルド (Google Play向け)

1.  **Android Studioを開く**:
    ```bash
    npx cap open android
    ```
2.  Android Studioが起動したら、Gradleの同期が完了するのを待ちます。
3.  **署名設定**:
    *   メニューの `Build` > `Generate Signed Bundle / APK` を選択します。
    *   `Android App Bundle` を選択し、`Next` をクリックします。
    *   `Key store path` で `Create new...` を選び、キーストアファイル（.jks）を作成・保存します（パスワードは忘れないように！）。
    *   作成したキーストア情報を入力し、`Next` をクリックします。
    *   `release` ビルドバリアントを選択し、`Finish` をクリックします。
4.  **AABファイルの取得**:
    *   ビルドが完了すると、右下に通知が表示されます。`locate` をクリックすると、生成された `.aab` ファイル（`app-release.aab`）があるフォルダが開きます。
    *   このファイルをGoogle Play Consoleにアップロードします。

---

## 5. iOSアプリのビルド (App Store向け)

**注意**: iOSビルドにはMacが必要です。

1.  **Xcodeを開く**:
    ```bash
    npx cap open ios
    ```
2.  **署名設定**:
    *   左側のナビゲーションで `App` プロジェクトを選択します。
    *   `Signing & Capabilities` タブを開きます。
    *   `Team` ドロップダウンから、あなたのApple Developerアカウントを選択します。
    *   `Bundle Identifier` が `com.manus.kaimonokiroku` になっていることを確認します（必要に応じて変更してください）。
3.  **アーカイブの作成**:
    *   上部のデバイス選択メニューで `Any iOS Device (arm64)` を選択します。
    *   メニューの `Product` > `Archive` を選択します。
4.  **App Storeへのアップロード**:
    *   アーカイブが完了すると、Organizerウィンドウが開きます。
    *   `Distribute App` をクリックします。
    *   `App Store Connect` > `Upload` を選択し、ウィザードに従ってアップロードします。

---

## 6. アプリアイコンとスプラッシュ画面の変更

デフォルトのアイコンを変更するには、`assets` フォルダ内の画像を置き換えて、以下のツールを使用します。

1.  `@capacitor/assets` をインストール（未インストールの場合）:
    ```bash
    npm install @capacitor/assets --save-dev
    ```
2.  `assets` フォルダ（プロジェクトルート直下）に以下の画像を用意します:
    *   `icon.png` (1024x1024)
    *   `splash.png` (2732x2732)
    *   `splash-dark.png` (2732x2732, オプション)
3.  アセットを生成します:
    ```bash
    npx capacitor-assets generate
    ```
    これにより、Android/iOSの各解像度用アイコンが自動生成されます。

---

## トラブルシューティング

*   **同期エラー**: `npx cap sync` でエラーが出る場合は、一度 `android` または `ios` フォルダを削除し、`npx cap add android` / `npx cap add ios` で再生成してみてください。
*   **Web画面が真っ白**: `capacitor.config.ts` の `webDir` が正しく `dist/public` を指しているか確認してください。

# Google Playストア リリースガイド (TWA対応)

このガイドでは、Webアプリ「サクキロ」をAndroidアプリとしてGoogle Playストアで公開するための手順を解説します。
「Trusted Web Activity (TWA)」という技術を使用し、Webサイトをそのままアプリとしてパッケージ化します。

## 1. 事前準備

### 必要なもの
*   **Google Play Developerアカウント**: 登録料（$25、1回払い）が必要です。
*   **アセット画像**:
    *   アプリアイコン: 512x512 px (PNG)
    *   フィーチャーグラフィック: 1024x500 px (PNG/JPEG)
    *   スクリーンショット: 最低2枚（スマホ用、7インチタブレット用、10インチタブレット用）
*   **プライバシーポリシーのURL**: Webサイト上にプライバシーポリシーページが必要です。

### Webサイト側の準備（完了済み）
*   `manifest.json` の最適化（アイコン、スクリーンショット設定など）
*   PWA対応（Service Workerの実装）

## 2. アプリパッケージ (AAB) の作成

Microsoftが提供する無料ツール「PWABuilder」を使用するのが最も簡単です。

1.  **PWABuilderにアクセス**: [https://www.pwabuilder.com/](https://www.pwabuilder.com/)
2.  **URLを入力**: アプリのURL (`https://kaimonoki-lwr93qoh.manus.space/`) を入力し、「Start」をクリック。
3.  **スコア確認**: "PWA Score" が表示されます。すべてクリアしていることが理想ですが、警告があっても進めます。
4.  **Androidパッケージの生成**:
    *   "Package for Stores" をクリック。
    *   "Android" の「Generate」ボタンをクリック。
5.  **オプション設定**:
    *   **Package ID**: `com.sakukiro.app` のような一意のIDを設定（重要：後で変更不可）。
    *   **App Name**: "サクキロ"
    *   **Launcher Name**: "サクキロ"
    *   **Signing Key**: "Create New" を選択し、新しい署名鍵を作成・ダウンロードします（**この鍵ファイルとパスワードは絶対に紛失しないでください。アップデートに必須です**）。
6.  **ダウンロード**: 生成されたZIPファイルをダウンロードします。中にある `.aab` ファイル（App Bundle）がPlayストア提出用ファイルです。

## 3. Digital Asset Links の設定

アプリとWebサイトの所有権を紐付けるために、Webサイト側に署名情報を配置する必要があります。

1.  PWABuilderからダウンロードしたZIPファイル内に `assetlinks.json` が含まれています。
2.  このファイルの内容をコピーし、Webサイトの以下のパスでアクセスできるように配置します。
    *   URL: `https://kaimonoki-lwr93qoh.manus.space/.well-known/assetlinks.json`
    *   ※現在のプロジェクトでは `client/public/.well-known/assetlinks.json` に配置してデプロイすればOKです。

## 4. Google Play Console での申請

1.  **アプリの作成**: Google Play Consoleにログインし、「アプリを作成」をクリック。
2.  **基本情報の入力**: アプリ名、言語、無料/有料などを設定。
3.  **ストアの掲載情報のセットアップ**:
    *   説明文（短文・全文）を入力。
    *   用意したアイコン、フィーチャーグラフィック、スクリーンショットをアップロード。
4.  **プライバシーポリシー**: URLを設定。
5.  **リリースの作成**:
    *   「製品版」または「内部テスト」を選択。
    *   PWABuilderで作成した `.aab` ファイルをアップロード。
    *   署名鍵について聞かれた場合は、「Google Play App Signing」を有効にし、PWABuilderで生成した鍵を使用する設定を行います。
6.  **審査提出**: すべての必須項目（コンテンツのレーティング、ターゲット層など）を埋めたら、「審査に送信」をクリック。

## 5. 審査と公開

*   審査には通常数日〜1週間程度かかります。
*   審査が通ると、Playストアで公開されます。

## 注意事項

*   **ドメイン変更**: もし将来的に独自ドメイン（例: `sakukiro.com`）に変更する場合は、パッケージの再作成と `assetlinks.json` の再配置が必要です。
*   **オフライン動作**: TWAはWebコンテンツを表示するため、オフライン時は「インターネットに接続してください」という画面になります（Service Workerでキャッシュ制御していればある程度動作します）。

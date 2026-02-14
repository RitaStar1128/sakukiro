# サクキロ (SAKUKIRO)

最速入力に特化した支出記録PWAです。  
「開いたらすぐ入力できる」ことを最優先に、家計簿の継続コストを下げる設計になっています。

![SAKUKIRO OGP](client/public/images/ogp-generated.png)

## 特徴

- テンキー中心UIで金額を即入力
- カテゴリ・備考つきでワンタップ記録
- 履歴一覧から編集/削除（左スワイプ削除対応）
- CSVエクスポート
- 多通貨対応（`JPY` / `USD` / `EUR` / `GBP` / `KRW` / `CNY`）
- 日本語/英語の2言語対応
- ライト/ダーク/システムテーマ対応
- PWA対応（ホーム画面追加、更新通知）
- データは端末内（`localStorage`）保存のみ

## デモ

- Web: `https://sakukiro.vercel.app/`

## 技術スタック

- Frontend: `React 19` + `TypeScript` + `Vite`
- UI: `Tailwind CSS v4` + `Radix UI` + `framer-motion`
- Router: `wouter`
- PWA: `vite-plugin-pwa` + Service Worker
- Server: `Express`（開発時Viteミドルウェア / 本番静的配信）
- Mobile: `Capacitor`（Android / iOSラッパー）

## アーキテクチャ

- `client/`  
  UIとアプリロジック本体。記録データは`localStorage`に保存。
- `server/`  
  APIサーバーというより配信用エントリ。現状は外部公開APIなし。
- `android/` `ios/`  
  Capacitorのネイティブプロジェクト。
- `shared/`  
  共有定数。

## データ仕様（ローカル保存）

保存キー: `kaimono_records`

```json
{
  "id": "uuid",
  "amount": 1500,
  "categoryKey": "cat_food",
  "note": "ランチ",
  "date": "2026-02-14T12:34:56.000Z",
  "currency": "JPY"
}
```

その他に以下の設定キーを使用します。

- `kaimono_language`
- `kaimono_currency`
- `theme`
- `has_visited_sakukiro`
- `kaimono_swipe_tutorial_seen`
- `kaimono_pwa_banner_dismissed`
- `kaimono_force_pc`

## セットアップ

### 前提

- Node.js `20+` 推奨
- pnpm `10+` 推奨

### インストール

```bash
pnpm install
```

### 開発サーバー起動

```bash
pnpm dev
```

アクセス先: `http://localhost:3000`

## ビルド / 実行

```bash
pnpm build
pnpm start
```

補助コマンド:

- `pnpm preview` : Vite preview
- `pnpm check` : TypeScript型チェック
- `pnpm format` : Prettier整形

## モバイルアプリ化（Capacitor）

```bash
pnpm build
npx cap sync
npx cap open android
# or
npx cap open ios
```

詳細は以下を参照:

- `MOBILE_BUILD_GUIDE.md`
- `PLAY_STORE_GUIDE.md`

## 環境変数

必須のアプリ機能には基本不要ですが、以下を利用する実装があります。

- `PORT` : サーバーポート（未指定時 `3000`）
- `VITE_ANALYTICS_ENDPOINT`
- `VITE_ANALYTICS_WEBSITE_ID`

テンプレート由来で現状UIから未使用の値:

- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`

## ディレクトリ構成

```text
.
├─ client/              # Reactアプリ
│  ├─ src/
│  │  ├─ pages/         # Home / History
│  │  ├─ components/    # モーダル、PWAプロンプト、UI部品
│  │  └─ contexts/      # 言語・通貨・テーマ
│  └─ public/           # アイコン、OGP、manifest
├─ server/              # Expressエントリ（配信）
├─ android/             # Capacitor Android
├─ ios/                 # Capacitor iOS
├─ shared/              # 共有定数
└─ vite.config.ts
```

## ライセンス

`MIT`


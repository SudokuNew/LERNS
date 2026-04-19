# 📚 LERNS — 個人学習管理アプリ / Personal Study Management App

> 自分専用の学習サポートWebアプリ。iPhone のホーム画面に追加してネイティブアプリのように使用できます。  
> A personal study support web app. Add it to your iPhone home screen and use it like a native app.

---

## 🇯🇵 日本語

### 概要

**LERNS** は、毎日の勉強をサポートするために設計した個人専用のPWA（Progressive Web App）です。  
GitHub Pages でホストしており、Safari から「ホーム画面に追加」するだけでアプリのように使えます。

### 機能一覧

| 機能 | 説明 |
|---|---|
| 🔥 ポモドーロタイマー | 円形プログレスリング付き。残り時間に応じて色が変化し、終了時に通知を送信 |
| 📝 学習ログ | 科目・学習時間を記録し、合計学習時間をホームに表示 |
| 📅 計画表ビューア | 学習スケジュールのPDFをアプリ内で表示 |
| 🎬 学習BGM動画 | YouTubeの学習用動画を選択・再生 |
| 🀄 四字熟語カード | 日替わりの四字熟語をかっこいいデザインで表示。背景画像は時間ごとに自動切り替え |

### 使い方

#### iPhone でのセットアップ

1. Safari で以下のURLを開く
   ```
   https://sudokunew.github.io/LERNS/
   ```
2. 下部の共有ボタン（□↑）をタップ
3. **「ホーム画面に追加」** を選択
4. 追加後、ホーム画面のアイコンからアプリとして起動

#### ローカルで確認する場合

```bash
# リポジトリをクローン
git clone https://github.com/SudokuNew/LERNS.git

# フォルダに移動
cd LERNS

# ブラウザで index.html を開く（Live Server 推奨）
```

### ファイル構成

```
LERNS/
├── index.html            # メインページ
├── manifest.json         # PWA設定
├── service-worker.js     # オフライン対応
├── css/
│   ├── style.css         # グローバルスタイル
│   ├── tabs.css          # タブナビゲーション
│   └── kotowaza.css      # 四字熟語カード
├── js/
│   ├── functions.js      # タイマー・ログ・動画機能
│   ├── tabs.js           # タブ制御・モーダル
│   └── kotowaza.js       # 四字熟語カード制御
├── assets/               # 背景画像素材
├── docs/                 # PDFファイル
└── icons/                # アプリアイコン
```

### 使用技術

| 種別 | 内容 |
|---|---|
| 言語 | HTML5 / CSS3 / Vanilla JavaScript (ES6+) |
| フォント | Google Fonts（Shippori Mincho B1 / Noto Serif JP） |
| ストレージ | localStorage（学習ログ・設定の保存） |
| PWA | Web App Manifest + Service Worker |
| ホスティング | GitHub Pages |

### ライセンス

このリポジトリは個人利用を目的としたプライベートプロジェクトです。  
コードの無断転載・再配布はご遠慮ください。

使用している外部フォント・素材については、各サービスのライセンスに従います。

---

## 🇬🇧 English

### Overview

**LERNS** is a personal PWA (Progressive Web App) designed to support daily study sessions.  
Hosted on GitHub Pages — just open it in Safari and "Add to Home Screen" to use it like a native app.

### Features

| Feature | Description |
|---|---|
| 🔥 Pomodoro Timer | Circular progress ring with color changes. Sends a notification when the session ends |
| 📝 Study Log | Record subject and study time. Total study time is displayed on the home tab |
| 📅 Schedule Viewer | View study schedule PDFs inside the app |
| 🎬 Study BGM | Select and play YouTube study videos |
| 🀄 Kotowaza Card | Daily Japanese proverb card with auto-rotating background images |

### Setup

#### On iPhone

1. Open the URL below in Safari
   ```
   https://sudokunew.github.io/LERNS/
   ```
2. Tap the Share button (□↑) at the bottom
3. Select **"Add to Home Screen"**
4. Launch the app from your home screen icon

#### Local Development

```bash
git clone https://github.com/SudokuNew/LERNS.git
cd LERNS
# Open index.html in your browser (Live Server recommended)
```

### Tech Stack

| Category | Details |
|---|---|
| Languages | HTML5 / CSS3 / Vanilla JavaScript (ES6+) |
| Fonts | Google Fonts (Shippori Mincho B1 / Noto Serif JP) |
| Storage | localStorage for study logs and settings |
| PWA | Web App Manifest + Service Worker |
| Hosting | GitHub Pages |

### License

This repository is a private project for personal use only.  
Unauthorized reproduction or redistribution of the code is not permitted.

External fonts and assets are subject to their respective licenses.

---

<p align="center">
  Made for personal use with ☕ and 📖
</p>

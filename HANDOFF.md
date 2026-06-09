# TOEIC 復習アプリ — Claude Code 引き継ぎメモ

## プロジェクト概要
TOEIC 公式問題集 TEST 1 のリーディング（Q101〜200）を自分でデジタル化したデータをもとに作った、**間違い問題の解説閲覧アプリ**。

---

## 現状のファイル構成

```
toeic_review.html              # ← メインアプリ（単一HTMLファイル）
toeic_test1_reading_all.json   # ← TEST1全問データ（100問・統合版）
toeic_test1_part5.json         # ← Part5のみ
toeic_test1_part6.json         # ← Part6のみ
toeic_test1_part7_147-171.json # ← Part7前半
toeic_test1_part7_172-195.json # ← Part7後半
toeic_test1_part7_196-200.json # ← Part7最終
```

---

## toeic_review.html の構造

現在は**単一HTMLファイル（Vanilla JS）**。データはJSの `const DATA = [...]` にハードコードされている。

### 画面構成

```
LIST VIEW（一覧）
  ├ ヘッダー（スコアバー：Part別間違い数）
  └ Part 5 / 6 / 7 ごとにセクション分け
       └ 問題カード（問題番号・あなたの解答・正解・文書タイプ）
            ↓ タップ
DETAIL VIEW（解説）
  ├ 設問文（"-------" → "___"）
  ├ 選択肢（正解:緑 / 誤答:オレンジ）
  ├ 正解バッジ ＋ 解説文（日本語）
  ├ キーワードチップ
  ├ 本文・文書（Part 6/7 のみ）
  └ 前の問題 / 次の問題 ナビ
```

---

## DATAの形式

```js
{
  number: 111,               // 問題番号
  part: 5,                   // 5 / 6 / 7
  your_answer: "C",          // 自分の解答（null = 未解答）
  correct_answer: "D",       // 正解
  question: "Incoming CEO...",  // 設問文（Part6の穴埋めは ""）
  choices: { A:"schedule", B:"to schedule", C:"have scheduled", D:"will schedule" },
  explanation_ja: "...",     // 日本語解説（公式問題集そのまま）
  keywords: ["will schedule", "executive"],  // キーワード

  // Part 6/7 のみ追加
  passage_type: "notice",    // 文書タイプ（e-mail / article / form / report など）
  passage_text: "NOTICE. ..." // 本文テキスト
}
```

---

## toeic_test1_reading_all.json の構造

```json
{
  "test": "TEST 1",
  "section": "Reading",
  "total_questions": 100,
  "parts": [
    {
      "part": 5,
      "format": "questions",
      "questions": [ { "number":101, "correct_answer":"C", ... }, ... ]
    },
    {
      "part": 6,
      "format": "passages",
      "passages": [
        {
          "passage_id": "P6-131-134",
          "type": "article",
          "passage_text": "...",
          "questions": [ ... ]
        }
      ]
    },
    {
      "part": 7,
      "format": "passages",
      "passages": [ ... ]
    }
  ]
}
```

---

## 現在のDATAに入っている問題（間違い38問）

| Part | 問題番号 |
|------|----------|
| 5 | 111, 113, 116, 117, 118, 124, 125 |
| 6 | 134, 138, 141, 143 |
| 7 | 159, 160(未解答), 161, 163, 164, 169, 171, 173, 175, 177, 179, 181〜183, 185, 186, 188〜192, 194, 196〜200 |

181〜200の多くは時間切れマークの可能性あり（全部"A"と回答）。

---

## 改修アイデア（未実装）

- [ ] **React / Next.js に移植**して保守しやすくする
- [ ] **間違い問題のデータを外部JSONから動的ロード**（`toeic_test1_reading_all.json` + 解答CSVを組み合わせ）
- [ ] **解答アプリのスクショをAI OCRで読み取り**、自動的に間違いリストを生成
- [ ] **TEST 2 以降のデータを追加**
- [ ] **復習済みチェック機能**（localStorage または Supabase）
- [ ] **フィルター機能**（Part別・未復習のみ など）
- [ ] **統計ページ**（苦手パターン分析）
- [ ] **PWA化**（オフライン対応・ホーム画面追加）

---

## デザイン方針
- ネイビー（`#0a1a6b`）ベース
- 正解：緑（`#1a7a3a`）、誤答：オレンジ（`#e07b2a`）
- スマホ縦向き最適化（`max-width: 480px` 想定）
- 公式問題集の「正解○」解説ボックスのレイアウトを踏襲

---

## 注意事項
- `explanation_ja` は TOEIC 公式問題集の解説テキストをそのまま収録している（著作権：ETS）
- アプリは個人学習用途のみ

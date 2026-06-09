# TOEIC 復習アプリ — デザイントークン

## カラーパレット

```css
/* CSS Variables（toeic_review.html そのまま） */
--navy:          #0a1a6b;   /* メインカラー：ヘッダー・ボタン */
--navy-light:    #1a2e8a;   /* スコアバー背景 */
--blue-acc:      #2a6dd9;   /* アクセント：空所ブランク */
--wrong:         #e07b2a;   /* 誤答オレンジ */
--correct:       #1a7a3a;   /* 正解グリーン */
--bg:            #f4f5f8;   /* ページ背景 */
--card:          #ffffff;   /* カード背景 */
--border:        #dde1ea;   /* ボーダー */
--text:          #1a1f2e;   /* メインテキスト */
--sub:           #5a6278;   /* サブテキスト */
--correct-bg:    #eaf7ed;   /* 正解行の背景 */
--wrong-bg:      #fff4e8;   /* 誤答行の背景 */
--passage-bg:    #f8f9fc;   /* 本文ブロック背景 */
--passage-border:#c8d0e8;   /* 本文ブロックのボーダー */
```

## フォント

```css
font-family: 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
```

## スペーシング

| 用途 | 値 |
|------|----|
| ページ横パディング | 16px |
| カード縦パディング | 14px |
| セクション見出し | 10px 16px |
| ボーダー半径（カード） | 8px |
| ボーダー半径（バッジ） | 4〜20px |

## コンポーネント別デザイン

### ヘッダー（sticky）
- 背景：`--navy`
- テキスト：white
- スコアバー背景：`--navy-light`
- 区切り線：`rgba(255,255,255,0.2)`

### 問題カード（一覧）
- 背景：white、ボーダーボトム：`--border`
- 問題番号バッジ：背景 `--wrong-bg`、文字 `--wrong`、角丸 8px、36×36px
- 正解バッジ：背景 `--correct-bg`、文字 `--correct`
- 矢印：`#c0c8d8`

### 選択肢（解説画面）
| 状態 | 背景 | ボーダー | 文字 | 丸アイコン |
|------|------|----------|------|------------|
| 正解 | `--correct-bg` | `--correct` | `--correct` + bold | 緑塗り白字 |
| 誤答 | `--wrong-bg` | `--wrong` | `--wrong` + bold | オレンジ塗り白字 |
| その他 | `#f8f9fc` | transparent | `--sub` | `#e0e4ef` 塗り |

### 正解解説ボックス（公式問題集レイアウト再現）
- 「正解」バッジ：背景 `--navy`、白文字、角丸 4px
- 正解文字：`--correct`、font-size 16px、font-weight 900
- 解説本文：font-size 13px、line-height 1.85

### キーワードチップ
- 背景：`#e8edf8`、文字：`--navy`、font-size 11px、角丸 10px

### 本文ブロック
- 外枠：`--passage-bg` + `--passage-border`、角丸 6px、margin 12px
- フォント：font-size 12px、line-height 1.85、color `#2a3050`
- white-space: pre-wrap（改行保持）

### ナビゲーションバー（sticky bottom）
- 背景：white、ボーダートップ：`--border`
- 「前の問題」ボタン：white背景、`--navy`ボーダー・文字
- 「次の問題」ボタン：`--navy`背景、white文字（.primary）

## React 移植時の推奨構成

```
src/
  styles/
    tokens.css        ← 上記CSS Variablesをここに
  components/
    Header.jsx
    ScoreBar.jsx
    QuestionCard.jsx  ← 一覧の1行
    ChoiceRow.jsx     ← 選択肢1行（state: correct/wrong/other）
    ExplanationBox.jsx← 「正解○」ボックス
    PassageBlock.jsx  ← 本文表示
    NavBar.jsx        ← 前/次ボタン
  pages/
    ListPage.jsx
    DetailPage.jsx
```

## Tailwind を使う場合のマッピング

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      navy:      '#0a1a6b',
      'navy-l':  '#1a2e8a',
      'blue-acc':'#2a6dd9',
      wrong:     '#e07b2a',
      correct:   '#1a7a3a',
      'wrong-bg':'#fff4e8',
      'correct-bg':'#eaf7ed',
      sub:       '#5a6278',
    }
  }
}
```

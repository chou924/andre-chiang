# ============================================================
#  江振誠 André Chiang — 個人網站
#  純靜態 HTML / CSS / JS，可直接部署到 GitHub Pages
# ============================================================

主廚江振誠的單頁個人網站。純 HTML + CSS + 原生 JavaScript，
沒有任何建構步驟或框架依賴，clone 下去改完 push 上去就是網站。

---

## 快速開始

### 1. 在本機預覽

直接用瀏覽器打開 `index.html` 即可。

想要更接近線上環境（尤其是路徑行為），可以起一個小伺服器：

```bash
npx serve .          # 或 python -m http.server 8000 / php -S localhost:8000
```

### 2. 推上 GitHub Pages

```bash
cd test
git init
git add .
git commit -m "feat: personal website"
git branch -M main
git remote add origin https://github.com/<你的帳號>/<repo 名稱>.git
git push -u origin main
```

再到 GitHub 後台：**Settings → Pages → Build and deployment → Source →
Deploy from a branch** → 選 `main` 分支、`/ (root)` → Save

約 1～2 分鐘後網址會是 `https://<你的帳號>.github.io/<repo 名稱>/`。

> 也可改用內建的 GitHub Actions（`.github/workflows/deploy.yml`）自動部署，
> 開啟後把 Pages 來源設成 `GitHub Actions`。**兩種方式擇一，不要同時開。**

---

## 檔案結構

```
.
├── index.html              整個網站內容都在這裡（單頁）
├── assets/
│   ├── css/style.css       樣式（Design Token → 元件 → RWD）
│   ├── js/main.js          互動：主題切換、捲動動畫、篩選、表單驗證
│   └── img/
│       ├── chef-andre.jpg  主廚照片
│       ├── favicon.svg     分頁圖示
│       ├── og-image.png    社群分享封面（1200 × 630，含人像）
│       └── projects/       餐廳縮圖：dish / fire / garden
├── .nojekyll               讓 _ 開頭的檔名也能正常運作
└── README.md
```

> **部署方式**：目前採用 GitHub Pages 的 **Deploy from a branch**（`main` 分支、
> `/ (root)` 目錄）。`deploy.yml` 已移除，避免 Actions 與 branch 部署互相衝突。
> 若想改成 Actions 自動部署，把 `.github/workflows/deploy.yml` 加回來
> （內容見 git 歷史），並把 Pages 的 Source 改成 **GitHub Actions**。

---

## 換成你自己的內容

| 想改的東西 | 搜尋關鍵字 |
| --- | --- |
| 姓名、職稱、所有文案 | `江振誠`、`André` |
| Email | `YOUR_EMAIL@example.com` |
| Instagram / Facebook / YouTube | `YOUR_HANDLE` |
| 網站網址（canonical、OG） | `YOUR_USERNAME.github.io/YOUR_REPO` |
| 主廚照片 | `assets/img/chef-andre.jpg`（CSS 用 `transform: scale()` 放大取景，可自行調整比例與 `transform-origin`） |
| 餐廳縮圖 | `assets/img/projects/*.svg`（建議換成真實照片 640×400） |
| 履歷 PDF | `assets/Andre-Chiang-Resume.pdf`（檔案不存在時按鈕會自動隱藏，不會 404） |
| 打字機詞庫 | `data-words="..."` |
| 配色 | `assets/css/style.css` 最上方 `:root` / `[data-theme]` |

`<head>` 裡的 JSON-LD（結構化資料）也要同步更新名字、Email、
`sameAs` 與 `award`，這會影響 Google 搜尋結果的呈現。

### 加一間餐廳

複製 `index.html` 裡 `<article class="project">` 的區塊，改掉
`data-category`（`taipei` / `singapore` / `paris` / `chengdu`）、
名稱、說明、標籤與連結。城市篩選按鈕會自動生效，不用動到 JS。

### 資料來源提醒

站上關於餐廳、年份與獎項的敘述整理自公開資料
（維基百科「江振誠」條目、天下文化書籍介紹、米其林指南與
聖沛黎洛榜單公告）。**正式上線前請自行再核對一次**，尤其是
已歇業或異動中的餐廳營業時間。

---

## 聯絡表單

純前端站台沒有後端，目前的流程是：

1. 前端驗證（必填、Email 格式、字數）
2. 驗證通過後開啟訪客的寄信程式（`mailto:`），並帶入姓名與內容

若希望「真的寄到信箱」，最省事的是接第三方表單服務：

1. 到 [Formspree](https://formspree.io) 建立免費表單，取得 endpoint
2. 把 `<form>` 改成：

```html
<form id="contactForm" action="https://formspree.io/f/xxxxxxx" method="POST">
  <input type="hidden" name="_subject" value="餐飲合作諮詢">
  <input type="hidden" name="_replyto" value="YOUR_EMAIL@example.com">
  ...
</form>
```

3. 把 `assets/js/main.js` 裡 `Form.init()` 的 `submit` 事件，
   從 `window.location.href = mailto:...` 改成 `form.submit()`

---

## 設計與實作重點

- **配色**：炭黑 × 琥珀 × 陶土，深淺兩套主題；所有顏色都是 CSS 變數，
  改 `:root` 與 `[data-theme]` 就能整個換掉。
- **主題**：`data-theme` 切換 `dark` / `light`，選擇存在 `localStorage`，
  並在 `<head>` 用內聯腳本提前套用，避免閃爍。
- **字體**：標題用思源宋體（Noto Serif TC）營造餐飲氣質，
  內文用 Inter + Noto Sans TC，並附系統字型後援。
- **進場動畫**：`IntersectionObserver` 監看 `.reveal` 元素，
  進入視窗才加 `.is-visible`；延遲用 `style="--d:.06s"` 控制。
- **無障礙**：跳至主內容連結、語意化標籤、`aria-expanded` / `aria-label`、
  打字機效果對螢幕閱讀器隱藏、可見 focus 樣式、
  尊重 `prefers-reduced-motion`。
- **效能**：無框架、無外部 JS；字型 `display=swap`。
- **RWD**：斷點 960 / 780 / 620 / 420px，手機選單為浮層。

Lighthouse（Accessibility / Best Practices / SEO）目前皆為滿分。

---

## 部署後檢查清單

- [ ] 全站搜尋 `YOUR_` 確認沒有殘留佔位字串
- [ ] `og-image.png` 內容已換成自己的版本
- [ ] 表單測試寄出成功
- [ ] 手機、iPad、桌機各看一次
- [ ] 用 Google Rich Results / PageSpeed 檢查
- [ ] 確認 `canonical` 與 OG 網址指向正式網域

---

## 照片授權

`assets/img/chef-andre.jpg`

> 江振誠受訪畫面，來源 PDIS，經 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:%E6%B1%9F%E6%8C%AF%E8%AA%A0.jpg) 提供，
> 授權 [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)。

CC BY 3.0 要求標示出處，因此頁面照片下方已附上來源與授權連結
（`.about__credit`）。**若換成自己的照片，請一併移除該標示；若沿用這張，
請保留標示。**

---

## 授權

網站程式碼：MIT License
照片與第三方素材：依各自授權（見上方「照片授權」）

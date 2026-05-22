/**
 * Archive.js - Works List Page
 *
 * このスクリプトは以下の処理を行います：
 * 1. microCMS APIからすべてのWORKSデータを取得
 * 2. グリッド形式でカード表示
 * 3. カードをクリックでdetail ページへ遷移
 */

(function () {
  "use strict";

  // =====================
  // API 設定
  // =====================
  const MICROCMS_API_ENDPOINT =
    "https://zumi-portfolio.microcms.io/api/v1/works";
  const MICROCMS_API_KEY = "Y3Ut8NKM9kjNH5CxFnSF4U54EPhwQeEdHZyt";

  // =====================
  // microCMS APIからWORKSを取得
  // =====================
  /**
   * microCMS APIからWORKSデータを非同期で取得
   * @returns {Promise<Array>} コンテンツの配列
   */
  async function fetchWorks() {
    try {
      // fetchを使ってAPI呼び出し
      // headers に APIキーを設定することで認証
      const response = await fetch(MICROCMS_API_ENDPOINT, {
        headers: {
          "X-MICROCMS-API-KEY": MICROCMS_API_KEY,
        },
      });

      // レスポンスが正常か確認
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // JSON形式で返す
      const data = await response.json();

      // API レスポンスから contents 配列を抽出
      return data.contents || [];
    } catch (error) {
      // エラーログを出力
      console.error("Failed to fetch works:", error);
      throw error;
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  };
  // =====================
  // WORKSカードをHTML生成して表示
  // =====================
  /**
   * 取得したWORKSデータをグリッドにレンダリング
   * @param {Array} works - microCMS APIから取得したコンテンツ配列
   */
  function renderWorksGrid(works) {
    const gridContainer = document.getElementById("works-grid");

    // worksが空の場合
    if (!works || works.length === 0) {
      gridContainer.innerHTML = '<p class="no-works">No works found</p>';
      return;
    }

    // 各まとめをカード要素に変換して HTML生成
    const cardsHTML = works
      .map((work) => {
        // thumbnailのみ使用
        const thumbnailUrl = work.thumbnail?.url || "about:blank";

        return `
        <!-- Works カード -->
         <div class="works-card-container">
                        <div class="card-shadow">
                            <div class="card-border-outer">
                                <div class="card-border-inner">
                                    <div class="works-content">
                        <div class=" works-card" data-id="${work.id}">
                                        <div class="works-card-content">
                                            <h3 class="works-card-title">${work.title || "Untitled"}</h3>
                                        </div>
                                        <!-- サムネイル画像 -->
                                        <div class="works-card-image" style="background-image: url('${thumbnailUrl}')">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div class="works-card-date">
                        <h4 class="date">${work.publishedAt ? formatDate(work.publishedAt) : "Untitled"}</h4>
                    </div>
                    </div>
                    
    `;
      })
      .join("");

    // HTMLを設定
    gridContainer.innerHTML = cardsHTML;

    // クリックイベントを各カードに設定
    setupCardClickHandlers(works);
  }

  // =====================
  // カードのクリックイベントを設定
  // =====================
  /**
   * WORKSカードにクリックリスナーを設定
   * クリック時に single-works.html へ遷移
   * @param {Array} works - コンテンツ配列
   */
  function setupCardClickHandlers(works) {
    const cards = document.querySelectorAll(".works-card");

    cards.forEach((card) => {
      card.addEventListener("click", function () {
        // data-id 属性からコンテンツIDを取得
        const workId = this.getAttribute("data-id");

        // single-works.html?id=xxx の形式で遷移
        // window.location.href を使用して別ページへ移動
        window.location.href = `single-works.html?id=${workId}`;
      });
    });
  }

  // =====================
  // ローカルタイム更新（既存機能）
  // =====================
  /**
   * ローカルタイムを更新して表示
   */
  function updateLocalTime() {
    const timeElement = document.getElementById("current-time");
    if (!timeElement) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    timeElement.textContent = timeString;
  }

  // =====================
  // カラー切り替え（既存機能）
  // =====================
  /**
   * テーマカラーを切り替え
   */
  function initColorTheme() {
    const root = document.documentElement;
    const btn = document.getElementById("btn-toggle");

    const colors = ["#000", "#2904E2", "#00BA0F"];
    let colorIndex = 0;

    if (btn) {
      btn.addEventListener("click", () => {
        colorIndex = (colorIndex + 1) % colors.length;
        root.style.setProperty("--color-primary", colors[colorIndex]);
      });
    }
  }

  // =====================
  // ページロード時の初期化
  // =====================
  /**
   * DOMが読み込まれたら実行
   */
  async function init() {
    try {
      // ローカルタイムを更新
      updateLocalTime();
      setInterval(updateLocalTime, 1000);

      // カラー切り替え初期化
      initColorTheme();

      // microCMS APIからWORKSデータを取得
      const works = await fetchWorks();

      // グリッドに表示
      renderWorksGrid(works);
    } catch (error) {
      // エラーメッセージを表示
      const errorContainer = document.getElementById("error-message");
      if (errorContainer) {
        errorContainer.textContent =
          "Failed to load works. Please try again later.";
        errorContainer.style.display = "block";
      }
      console.error("Initialization error:", error);
    }
  }

  // =====================
  // DOM読み込み完了時に実行
  // =====================
  // DOMContentLoaded なのか、既に読み込まれているかで処理を分岐
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
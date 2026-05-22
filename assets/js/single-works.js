/**
 * Single-Works.js - Work Detail Page
 * 
 * このスクリプトは以下の処理を行います：
 * 1. URLのクエリパラメータから コンテンツID を取得
 * 2. microCMS APIから該当するコンテンツを取得
 * 3. 詳細情報とギャラリー画像を表示
 */

(function() {
    'use strict';

    // =====================
    // API 設定
    // =====================
    const MICROCMS_API_ENDPOINT = 'https://zumi-portfolio.microcms.io/api/v1/works';
    const MICROCMS_API_KEY = 'Y3Ut8NKM9kjNH5CxFnSF4U54EPhwQeEdHZyt';

    // =====================
    // URLパラメータからコンテンツIDを取得
    // =====================
    /**
     * URLのクエリパラメータ（?id=xxx）から値を取得
     * @param {string} paramName - パラメータ名
     * @returns {string|null} パラメータの値、またはnull
     */
    function getUrlParameter(paramName) {
        // URLの検索部分（?以降）を取得
        const urlParams = new URLSearchParams(window.location.search);
        // 指定されたパラメータを返す
        return urlParams.get(paramName);
    }

    // =====================
    // microCMS APIから特定のコンテンツを取得
    // =====================
    /**
     * コンテンツIDおよびすべてのコンテンツを取得して、該当するものを返す
     * ※ microCMS API では特定IDの直接取得は使用できないため、
     *    すべてのコンテンツを取得して JavaScript で検索
     * @returns {Promise<Object|null>} コンテンツオブジェクト、または見つからない場合はnull
     */
    async function fetchWorkDetail() {
        try {
            // 目的のコンテンツID
            const workId = getUrlParameter('id');

            // IDが指定されていない場合
            if (!workId) {
                throw new Error('Work ID not found in URL');
            }

            // microCMS APIからすべてのWORKSを取得
            const response = await fetch(MICROCMS_API_ENDPOINT, {
                headers: {
                    'X-MICROCMS-API-KEY': MICROCMS_API_KEY
                }
            });

            // レスポンス確認
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            // JSON形式で返す
            const data = await response.json();
            const contents = data.contents || [];

            // contents 配列から ID で該当するコンテンツを検索
            const work = contents.find(item => item.id === workId);

            if (!work) {
                throw new Error(`Work with ID "${workId}" not found`);
            }

            return work;

        } catch (error) {
            console.error('Failed to fetch work detail:', error);
            throw error;
        }
    }

    // =====================
    // 詳細情報をHTMLで表示
    // =====================
    /**
     * 取得したコンテンツをページに表示
     * @param {Object} work - microCMSから取得したコンテンツオブジェクト
     */
    function renderWorkDetail(work) {
        const detailContainer = document.getElementById('work-detail');
        const breadcrumb = document.getElementById('breadcrumb');

        // ページタイトルを更新
        document.title = `${work.title} - Zumi Portfolio`;

        // パンくずを更新
        if (breadcrumb) {
            breadcrumb.innerHTML = `<a href="index.html">TOP</a> / <a href="archive.html">WORKS</a> / ${work.title}`;
        }

        // メタ情報を行形式で構築
        // displayしない特別なフィールド
        const excludeFields = ['id', 'createdAt', 'updatedAt', 'publishedAt', 'revisedAt', 'title', 'image', 'thumbnail'];
        
        const metaRows = [];
        
        // work オブジェクトをループしてすべてのフィールドを処理
        for (const [key, value] of Object.entries(work)) {
            // 除外フィールドや空値をスキップ
            if (excludeFields.includes(key) || !value) {
                continue;
            }
            
            // ラベルを生成（キャメルケースをUPPERCASEに変換）
            const label = key
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .toUpperCase();
            
            // URLの場合はリンクを作成
            let valueHTML = value;
            if ((key === 'url' || key.toLowerCase().includes('url')) && typeof value === 'string') {
                valueHTML = `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`;
            }
            
            metaRows.push(`
                <div class="meta-row">
                    <div class="meta-label">${label}</div>
                    <div class="meta-value">${valueHTML}</div>
                </div>
            `);
        }

        // 詳細情報のHTMLを生成
        const detailHTML = `
            <!-- タイトル -->
            <h1 class="work-title">${work.title || 'Untitled'}</h1>

            <!-- メタ情報（行形式）-->
            <div class="work-meta-rows">
                ${metaRows.join('')}
            </div>

            <!-- Gallery セクション（複数画像）-->
            ${work.image && work.image.length > 0 ? `
                <section class="work-gallery-section">
                    <div class="work-gallery">
                        ${work.image.map((img, index) => `
                            <figure class="gallery-item">
                                <img src="${img.url}" alt="Gallery image ${index + 1}" class="gallery-image">
                            </figure>
                        `).join('')}
                    </div>
                </section>
            ` : ''}
        `;

        // HTMLを設定
        detailContainer.innerHTML = detailHTML;
    }

    // =====================
    // ローカルタイム更新（既存機能）
    // =====================
    /**
     * ローカルタイムを更新して表示
     */
    function updateLocalTime() {
        const timeElement = document.getElementById('current-time');
        if (!timeElement) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
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
        const btn = document.getElementById('btn-toggle');

        const colors = ['#000', '#2904E2', '#00BA0F'];
        let colorIndex = 0;

        if (btn) {
            btn.addEventListener('click', () => {
                colorIndex = (colorIndex + 1) % colors.length;
                root.style.setProperty('--color-primary', colors[colorIndex]);
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

            // microCMS APIからコンテンツを取得
            const work = await fetchWorkDetail();

            // 詳細ページに表示
            renderWorkDetail(work);

        } catch (error) {
            // エラーメッセージを表示
            const errorContainer = document.getElementById('error-message');
            const detailContainer = document.getElementById('work-detail');

            if (detailContainer) {
                detailContainer.innerHTML = '';
            }
            if (errorContainer) {
                errorContainer.textContent = error.message || 'Failed to load work details. Please try again later.';
                errorContainer.style.display = 'block';
            }
            console.error('Initialization error:', error);
        }
    }

    // =====================
    // DOM読み込み完了時に実行
    // =====================
    // DOMContentLoaded なのか、既に読み込まれているかで処理を分岐
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

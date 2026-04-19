/**
 * kotowaza.js — 四字熟語・ことわざ カード制御
 * LERNS プロジェクト用
 *
 * ▼ 背景画像の変更方法
 *   KOTOWAZA_LIST の各エントリの `image` プロパティに
 *   画像URL または ローカルパス（例: "assets/dragon.jpg"）を指定してください。
 *   `null` の場合はデフォルトのCSS墨絵グラデーションが適用されます。
 */

const KOTOWAZA_LIST = [
    {
        text: '雲外蒼天',
        yomi: 'うんがいそうてん',
        meaning: '苦難の雲を乗り越えた先に、青く澄み渡る空が広がる',
        image: null, // 例: "assets/dragon.jpg" に変更可能
    },
    {
        text: '一念発起',
        yomi: 'いちねんほっき',
        meaning: 'ある決意のもと、強い意志で新たなことを始めること',
        image: null,
    },
    {
        text: '不撓不屈',
        yomi: 'ふとうふくつ',
        meaning: 'どんな困難にも屈せず、強い意志で立ち向かうこと',
        image: null,
    },
    {
        text: '臥薪嘗胆',
        yomi: 'がしんしょうたん',
        meaning: '目的のために、長い間苦労・苦心を重ねること',
        image: null,
    },
    {
        text: '七転八起',
        yomi: 'しちてんはっき',
        meaning: '何度失敗しても、諦めずに立ち上がること',
        image: null,
    },
    {
        text: '初志貫徹',
        yomi: 'しょしかんてつ',
        meaning: '最初に決めた志を、最後まで貫き通すこと',
        image: null,
    },
    {
        text: '捲土重来',
        yomi: 'けんどちょうらい',
        meaning: '一度敗れた者が勢いを盛り返して再び挑むこと',
        image: null,
    },
    {
        text: '磨斧作針',
        yomi: 'まふさくしん',
        meaning: '根気よく努力し続ければ、必ず成し遂げられるということ',
        image: null,
    },
    {
        text: '切磋琢磨',
        yomi: 'せっさたくま',
        meaning: '仲間と共に学び、互いに励まし合って向上すること',
        image: null,
    },
    {
        text: '百折不撓',
        yomi: 'ひゃくせつふとう',
        meaning: '何度くじかれても、意志が曲がることなく進み続けること',
        image: null,
    },
];

// =====================================================================
// カード描画ロジック
// =====================================================================

(function () {
    const STORAGE_KEY = 'lerns_kotowaza_index';

    /** 今日の日付（YYYY-MM-DD）を返す */
    function todayStr() {
        return new Date().toISOString().slice(0, 10);
    }

    /** 表示するインデックスを取得・更新 */
    function getIndex() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            // 日替わりモード：日付が変わったら次の熟語へ
            if (saved.date !== todayStr()) {
                const nextIdx = ((saved.index ?? -1) + 1) % KOTOWAZA_LIST.length;
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr(), index: nextIdx }));
                return nextIdx;
            }
            return saved.index ?? 0;
        } catch {
            return 0;
        }
    }

    function setIndex(idx) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr(), index: idx }));
    }

    /** カードのDOMを更新 */
    function renderCard(idx) {
        const item = KOTOWAZA_LIST[idx];
        if (!item) return;

        const card = document.getElementById('kotowaza-card');
        if (!card) return;

        // 背景画像の切り替え
        if (item.image) {
            card.style.backgroundImage = `url('${item.image}')`;
            card.classList.remove('kotowaza-default-bg');
        } else {
            card.style.backgroundImage = '';
            card.classList.add('kotowaza-default-bg');
        }

        // テキスト更新（アニメーション付き）
        const textEl   = document.getElementById('kotowaza-text');
        const yomiEl   = document.getElementById('kotowaza-yomi');
        const meaningEl = document.getElementById('kotowaza-meaning');

        [textEl, yomiEl, meaningEl].forEach(el => {
            if (el) el.classList.remove('kotowaza-fade-in');
        });

        // 次フレームで付け直してアニメーション再トリガー
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (textEl)    { textEl.textContent    = item.text;    textEl.classList.add('kotowaza-fade-in'); }
                if (yomiEl)    { yomiEl.textContent    = item.yomi;    yomiEl.classList.add('kotowaza-fade-in'); }
                if (meaningEl) { meaningEl.textContent = item.meaning; meaningEl.classList.add('kotowaza-fade-in'); }
            });
        });

        // ページインジケーター更新
        const indicator = document.getElementById('kotowaza-indicator');
        if (indicator) {
            indicator.textContent = `${idx + 1} / ${KOTOWAZA_LIST.length}`;
        }
    }

    /** 次の熟語へ */
    function next() {
        const current = getIndex();
        const nextIdx = (current + 1) % KOTOWAZA_LIST.length;
        setIndex(nextIdx);
        renderCard(nextIdx);
    }

    /** 前の熟語へ */
    function prev() {
        const current = getIndex();
        const prevIdx = (current - 1 + KOTOWAZA_LIST.length) % KOTOWAZA_LIST.length;
        setIndex(prevIdx);
        renderCard(prevIdx);
    }

    // DOMContentLoaded 後に初期化
    document.addEventListener('DOMContentLoaded', () => {
        const idx = getIndex();
        renderCard(idx);

        document.getElementById('kotowaza-next')?.addEventListener('click', next);
        document.getElementById('kotowaza-prev')?.addEventListener('click', prev);
    });
})();

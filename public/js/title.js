// --- 1. HTMLの要素を取得 ---
const createRecipeButton = document.getElementById('btn-1');
const yamiGachaButton = document.getElementById('btn-gacha-yami');
const legendGachaButton = document.getElementById('btn-gacha-legend');
// ★★★ 「食材ガチャ」ボタンを新しく取得 ★★★
const materialGachaButton = document.getElementById('btn-gacha-material');


// --- 2. 各ボタンのクリック処理 ---
//click上でHTMLから拾ったbtn-系をもとに動かす
// 「1, レシピを作る」ボタン (変更なし)
createRecipeButton.addEventListener('click', () => {
    window.location.href = '/material-input.html';
});

// 「2, 闇ガチャ」ボタン (変更なし)
yamiGachaButton.addEventListener('click', () => {
    window.location.href = '/gacha.html?type=yami';
});

// 「3, 伝説のガチャ」ボタン (変更なし)
legendGachaButton.addEventListener('click', () => {
    window.location.href = '/gacha.html?type=legend';
});

// ★★★ 「4, 食材ガチャから作る」ボタン (新規追加) ★★★
materialGachaButton.addEventListener('click', () => {
    // 3. ランダムな食材リストを生成する
    const randomIngredients = generateRandomIngredients();
    
    // 4. surotto.js が読み取れるように、URLパラメータの形に変換する
    // (この方法は material-input.js と同じです)
    const params = new URLSearchParams({
        ingredients: JSON.stringify(randomIngredients)
    });
    
    // 5. スロット画面に食材データを渡して遷移する
    window.location.href = `/surotto.html?${params.toString()}`;
});


// --- 3. ランダムな食材と量を生成するヘルパー関数 ---

// ★★★ ランダム食材生成ロジック（新規追加） ★★★

/**
 * 0からmax-1までのランダムな整数を返す
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * ランダムな食材リストを生成する
 */
function generateRandomIngredients() {
    // 食材ガチャの候補リスト
    const ingredientPool = [
        '豚肉', '鶏肉', '牛肉', '謎の肉', 'キャベツ', 'レタス', '玉ねぎ',
        '液体窒素', 'スライム', '輝くキノコ', 'チョコレート', 'プリン',
        'エビ', 'イカ', 'タコ', '魚の切り身', '豆腐', '納豆', '卵',
        'マヨネーズ', 'ケチャップ', 'タイヤキ', '雑草', 'ダイヤモンド'
    ];
    
    // 量の候補リスト (g)
    const quantityPool = [50, 100, 150, 200, 300, 500];
    
    // 3〜5種類の食材をランダムに選ぶ
    const numberOfIngredients = getRandomInt(3) + 3; // 3, 4, または 5
    const results = [];
    
    // 抽選済みの食材を記録するセット (重複を防ぐため)
    const usedIngredients = new Set();
    
    for (let i = 0; i < numberOfIngredients; i++) {
        let randomIngredient;
        
        // もし食材が重複したら、もう一度引き直す
        do {
            randomIngredient = ingredientPool[getRandomInt(ingredientPool.length)];
        } while (usedIngredients.has(randomIngredient));
        
        // 抽選済みとして記録
        usedIngredients.add(randomIngredient);
        
        // ランダムな量を取得
        const randomQuantity = quantityPool[getRandomInt(quantityPool.length)];
        
        // { name: "豚肉", quantity: 100 } のようなオブジェクトを作成
        results.push({
            name: randomIngredient,
            quantity: randomQuantity
        });
    }
    
    return results;
}
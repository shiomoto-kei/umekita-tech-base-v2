// HTMLの要素を取得
const createRecipeButton = document.getElementById('btn-1');
const yamiGachaButton = document.getElementById('btn-gacha-yami'); // ★ 修正
const legendGachaButton = document.getElementById('btn-gacha-legend'); // ★ 修正

// 「レシピを作る」ボタンがクリックされた時の処理
createRecipeButton.addEventListener('click', () => {
    window.location.href = '/material-input.html';
});

// ★★★ 「闇ガチャ」ボタンがクリックされた時の処理 ★★★
yamiGachaButton.addEventListener('click', () => {
    // URLに ?type=yami というパラメータを付けて遷移
    window.location.href = '/gacha.html?type=yami';
});

// ★★★ 「伝説のガチャ」ボタンがクリックされた時の処理 ★★★
legendGachaButton.addEventListener('click', () => {
    // URLに ?type=legend というパラメータを付けて遷移
    window.location.href = '/gacha.html?type=legend';
});
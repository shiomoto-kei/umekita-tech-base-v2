// DOMContentLoadedイベントリスナーで、HTMLの読み込み完了を待つ
window.addEventListener('DOMContentLoaded', () => {

    // --- 1. ページ読み込み時に、どのガチャかを取得 ---
    
    // 現在のページのURLから ?type=... の部分（URLパラメータ）を読み取る
    const params = new URLSearchParams(window.location.search);
    
    // 'type' パラメータの値を取得する。
    // もしURLに ?type=... が無い場合は、|| (または) を使って
    // 安全のために 'yami' (闇ガチャ) をデフォルト値にする
    const gachaType = params.get('type') || 'yami';

    // HTMLの要素を取得
    const drawButton = document.getElementById('draw-button');
    const gachaMachineImg = document.querySelector('.gacha-machine-img');

    // ★★★ もし gacha.html 側にもタイトルがあるなら、
    //     それも変えると親切です（任意） ★★★
    const titleElement = document.querySelector('.title'); // gacha.html に .title があると仮定
    if (titleElement) {
        if (gachaType === 'legend') {
            titleElement.textContent = '伝説のガチャ';
        } else {
            titleElement.textContent = '闇ガチャ';
        }
    }
    
    // --- 2. 「ガチャを引く」ボタンがクリックされた時の処理 ---
    drawButton.addEventListener('click', async () => {
        // ガチャを引いている間のアニメーションを追加
        gachaMachineImg.classList.add('shake');
        drawButton.disabled = true;
        drawButton.textContent = '念を込めています...';

        try {
            // --- 3. サーバーAPIを呼び出す (★ここが重要★) ---
            
            // fetchで呼び出すURLを、取得した gachaType を使って動的に変更する
            // 例: /api/gacha?type=yami または /api/gacha?type=legend
            const response = await fetch(`/api/gacha?type=${gachaType}`);

            if (!response.ok) {
                throw new Error('ガチャの神様がへそを曲げました...');
            }
            const recipe = await response.json();

            // --- 4. サーバーからの応答を処理する (ここは変更なし) ---
            
            // 成功したら、結果をURLパラメータとして結果画面に渡す
            if (recipe) {
                const params = new URLSearchParams({
                    id: recipe.id,
                    recipeName: recipe.recipeName,
                    description: recipe.description,
                    steps: recipe.steps,
                });
                
                // 1.5秒待ってから結果画面へ遷移
                setTimeout(() => {
                    window.location.href = `/amazing-cooking-screen.html?${params.toString()}`;
                }, 1500);

            } else {
                alert('残念！何も出ませんでした...');
                resetButton();
            }

        } catch (error) {
            console.error('エラー:', error);
            alert(error.message);
            resetButton();
        }
    });

    // ボタンの状態をリセットする関数（変更なし）
    function resetButton() {
        gachaMachineImg.classList.remove('shake');
        drawButton.disabled = false;
        drawButton.textContent = 'ガチャを引く';
    }
});
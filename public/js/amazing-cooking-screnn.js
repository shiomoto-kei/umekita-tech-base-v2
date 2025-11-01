// front/js/amazing-cooking-screen.js (完全版)

// ページが読み込まれたときに実行
window.addEventListener('load', () => {
    // --- 1. URLからパラメータをすべて取得 ---
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    const recipeName = params.get('recipeName');
    const description = params.get('description');
    const steps = params.get('steps');
    const rating = params.get('rating'); // ★ 評価点を取得
    const rated_count = params.get('rated_count'); // ★ 評価回数を取得

    // --- 2. HTML要素に取得した情報を表示 ---
    const recipeNameElement = document.getElementById('recipe-name');
    const recipeDescriptionElement = document.getElementById('recipe-description');
    const recipeStepsElement = document.getElementById('recipe-steps');
    
    // ★ 評価表示用のHTML要素を取得 (追加) ★
    const ratingElement = document.getElementById('recipe-community-rating');

    if (recipeName) {
        recipeNameElement.textContent = recipeName;
    }
    if (description) {
        recipeDescriptionElement.textContent = description;
    }

    // --- 3. ★ コミュニティ評価を表示する処理 (新規追加) ★ ---
    if (rating && rated_count && ratingElement) {
        // rating は '3.5' のような文字列なので、数値(小数)に変換
        const numericRating = parseFloat(rating);
        
        // toFixed(1) で小数点以下1桁に丸める (例: 3.5)
        // もし 0.0 なら「評価待ち」と表示する
        if (numericRating === 0) {
             ratingElement.innerHTML = `<h4>コミュニティ評価</h4>
                                       <p>まだ評価されていません</p>`;
        } else {
             ratingElement.innerHTML = `<h4>コミュニティ評価</h4>
                                       <p>平均: ★ ${numericRating.toFixed(1)} (${rated_count}票)</p>`;
        }
    }
    // ★ 追加ここまで ★

    // --- 4. 調理工程の表示 (変更なし) ---
    if (steps && recipeStepsElement) {
        let stepsHtml = '<h4>調理工程</h4><ul>';
        // \n (改行コード) で文字列を分割して配列にする
        steps.split('\n').forEach(step => {
            if (step) { // 空の行は無視
                stepsHtml += `<li>${step}</li>`;
            }
        });
        stepsHtml += '</ul>';
        recipeStepsElement.innerHTML = stepsHtml;
    }
    
    // --- 5. 星評価ロジック (Priority 1 で実装済みのもの) ---
    
    const starsGacha = document.querySelectorAll('#rating-stars-gacha .star');
    let currentRatingGacha = 0;
    let ratingSubmitted = false; // 評価済みフラグ

    // 星の色を設定する関数
    function setRatingGacha(rating) {
        starsGacha.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    // 星のホバー（マウス乗せ）を設定する関数
    function setHoverGacha(rating) {
        starsGacha.forEach(star => {
            if (parseInt(star.dataset.value) <= rating) {
                star.classList.add('hover');
            } else {
                star.classList.remove('hover');
            }
        });
    }

    // 各「★」ボタンにイベントを設定
    starsGacha.forEach(star => {
        // マウスが乗った時の処理
        star.addEventListener('mouseover', () => {
            if (!ratingSubmitted) { // 評価前のみホバーを許可
                setHoverGacha(parseInt(star.dataset.value));
            }
        });
        
        // クリックされた時の処理 (★ async が重要 ★)
        star.addEventListener('click', async () => {
            if (ratingSubmitted) { // 既に評価済みなら何もしない
                alert('このレシピは既に評価済みです。');
                return;
            }
            if (!recipeId) {
                alert('エラー: レシピIDがありません。');
                return;
            }
            
            // 押された星の数を保存
            currentRatingGacha = parseInt(star.dataset.value);
            setRatingGacha(currentRatingGacha);

            // ★ API呼び出し（Priority 1 の実装） ★
            try {
                // 新設した「評価更新API」を呼び出す
                const response = await fetch(`/api/rate-recipe/${recipeId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newRating: currentRatingGacha })
                });
                
                const result = await response.json();
                if (!result.success) throw new Error(result.error);
                
                alert('評価を送信しました！ありがとうございます。');
                ratingSubmitted = true; // 評価済みにする
                
                // 評価したので、星をロックする
                document.getElementById('rating-stars-gacha').style.pointerEvents = 'none';
                document.getElementById('rating-stars-gacha').style.opacity = 0.7;

            } catch (err) {
                console.error('評価エラー:', err);
                alert('評価の送信に失敗しました。');
            }
        });
    });

    // 星からマウスが離れた時の処理
    document.getElementById('rating-stars-gacha').addEventListener('mouseout', () => {
        if (!ratingSubmitted) { // 評価前のみ
            setHoverGacha(currentRatingGacha); // 選択中の評価に戻す
        }
    });

    // 初期状態をセット (0星状態)
    currentRatingGacha = 0;
    setRatingGacha(currentRatingGacha);
    setHoverGacha(currentRatingGacha);
}); // ★ window.addEventListener('load', ...) はここで閉じる ★


// --- タイトルへ戻るボタンの処理 ---
// (loadイベントの外に置くのが安全です)
document.getElementById('return-button').addEventListener('click', () => {
    window.location.href = '/index.html';
});
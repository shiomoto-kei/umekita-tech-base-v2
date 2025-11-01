document.addEventListener('DOMContentLoaded', () => {
    // 1. 必要なHTML要素をすべて取得
    const titleElement = document.getElementById('recipe-title');
    const imageElement = document.getElementById('recipe-image');
    const detailsElement = document.getElementById('recipe-details');
    const shareButton = document.getElementById('share-button');
    const returnButton = document.getElementById('return-button');
    const saveButton = document.getElementById('save-button');

    // 2. レシピ生成から表示まですべてを行うメイン関数
    async function generateAndDisplayRecipe() {
        
        // 3. スロット画面からデータを取得
        const recipeData = JSON.parse(sessionStorage.getItem('finalRecipe'));
        const styleData = JSON.parse(sessionStorage.getItem('cookingStyle'));

        if (!recipeData || !styleData || recipeData.length === 0) {
            titleElement.textContent = "レシピ情報がありません";
            return;
        }

        const ingredients = recipeData.map(r => r.ingredient.split('(')[0]);
        const cookingStyle = styleData.name;
        
        let recipeName, description, steps;

        // 4. サーバーのAPIを呼び出して「凝った名前」と「調理工程」を生成
        try {
            titleElement.textContent = "レシピ名を生成中...";
            const recipeResponse = await fetch('/api/generate-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ingredients: ingredients,
                    cookingStyle: cookingStyle,
                    recipeData: recipeData
                }),
            });
            
            if (!recipeResponse.ok) {
                throw new Error('レシピ生成APIがエラーを返しました');
            }
            
            const recipeApiData = await recipeResponse.json();
            recipeName = recipeApiData.recipeName;
            description = recipeApiData.description;
            steps = recipeApiData.steps; 
            
            titleElement.textContent = recipeName;

        } catch (error) {
            // ★★★ API失敗時の処理 ★★★
            // APIが失敗しても、"しょぼい"名前で処理を続行し、表示が止まらないようにする
            console.error('レシピ生成APIの呼び出しに失敗:', error);
            titleElement.textContent = "レシピ名の生成に失敗 (ローカルで生成)";
            
            recipeName = `${ingredients[0] || '奇跡'}と${ingredients[1] || '謎'}の${cookingStyle}`; // しょぼい名前
            description = `主な材料は${ingredients.join('、')}。調理法は「${cookingStyle}」。`;
            steps = recipeData.map(step => { // しょぼい工程
                const seasoningText = step.seasoning ? `, 味付け: ${step.seasoning}` : '';
                return `${step.ingredient} → 時間:${step.time}, 切り方:${step.cutting}${seasoningText}`;
            });
        }

        // 5. 画像生成APIを呼び出し (ミステリアスなプロンプトを使用)
        try {
            imageElement.src = ""; 
            imageElement.alt = "画像を生成中...";
            titleElement.textContent = "奇跡の料理を調理中...";
            // 5. AI画像生成のAPIを呼び出す
            imageElement.src = "/img/loading.gif"; // もしローディング用GIF画像があれば
            imageElement.alt = "AIが調理中...";
            const imagePrompt = generateImagePrompt(recipeName, ingredients, cookingStyle); 
            
    
    
        
            
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: imagePrompt }),
            });

            if (!response.ok) {
                throw new Error(`APIサーバーがエラーを返しました: ${response.status}`);
            }
            const data = await response.json();
            if (data.imageUrl) {
                imageElement.src = data.imageUrl;
                imageElement.alt = recipeName;
            }
        } catch (error) {
            console.error('画像生成に失敗しました:', error);
            imageElement.src = '/img/1402858_s.jpg';
            imageElement.alt = '画像の読み込みに失敗しました';
        }

        // 6. レシピ詳細の表示 (APIまたはフォールバックで生成されたsteps)
        let detailsHtml = '<h4>調理工程</h4><ul>';
        steps.forEach(step => {
            detailsHtml += `<li>${step}</li>`;
        });
        detailsHtml += '</ul>';
        detailsElement.innerHTML = detailsHtml;

        // 7. 星評価のロジックを起動
        const stars = document.querySelectorAll('#rating-stars .star');
        let currentRating = 1; // 初期値1

        function setRating(rating) {
            stars.forEach(star => {
                star.classList.toggle('selected', parseInt(star.dataset.value) <= rating);
            });
        }
        function setHover(rating) {
            stars.forEach(star => {
                star.classList.toggle('hover', parseInt(star.dataset.value) <= rating);
            });
        }
        stars.forEach(star => {
            star.addEventListener('mouseover', () => setHover(parseInt(star.dataset.value)));
            star.addEventListener('click', () => {
                currentRating = parseInt(star.dataset.value);
                setRating(currentRating);
            });
        });
        document.getElementById('rating-stars').addEventListener('mouseout', () => setHover(currentRating));
        setRating(currentRating);
        setHover(currentRating);

        // 8. 保存ボタンのロジックを起動
        saveButton.addEventListener('click', async () => {
            const recipeToSave = { recipeName, description, steps };
            try {
                const saveResponse = await fetch('/api/save-recipe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(recipeToSave),
                });
                const result = await saveResponse.json();
                if (result.success) {
                    // ★★★ ここを修正 ★★★
                    alert('評価を送信！\nあなたのレシピは「ガチャ」のラインナップに追加されました！'); 
                    // ★★★ 修正ここまで ★★★
                    saveButton.disabled = true;
                    saveButton.textContent = '追加済み';
                } else { throw new Error(result.error || '保存に失敗しました。'); }
            } catch (err) {
                console.error('保存エラー:', err);
                alert('エラーによりレシピを保存できませんでした。');
            }
        });
        
        // 9. 共有ボタンのロジックを起動
        shareButton.addEventListener('click', () => {
            const shareText = `奇跡のレシピ「${recipeName}」が完成！\n主な材料: ${ingredients.join(', ')}\n#グルメイカー #AIレシピ`;
            const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            window.open(shareUrl, '_blank');
        });

        // 10. スタートへ戻るボタンのロジックを起動
        returnButton.addEventListener('click', () => {
            window.location.href = '/index.html'; // 正しいパス
        });
    }

    // メイン関数を実行
    generateAndDisplayRecipe();
});

// --- ヘルパー関数 (ミステリアスな画像プロンプト) ---
function generateImagePrompt(recipeName, ingredients, cookingStyle) {
    const mainPrompt = recipeName; 
    return `
        (best quality, masterpiece),
        A mysterious and surreal dish called "${mainPrompt}".
        Made from strange ingredients like "${ingredients.join(' and ')}".
        (bioluminescent:1.3), glowing with a (neon:1.2) light,
        looks like something from a deep-sea trench or a distant nebula.
        (otherworldly:1.2), magical, enigmatic, 
        intricate details, dark background.
    `;
}
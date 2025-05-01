const gameState = {
    health: 100,
    maxHealth: 100,
    gold: 10,
    currentLocation: 'village',
    inventory: [],
    level: 1,
    experience: 0,
    questProgress: {},
    skills: [],
    reputation: 50,
    currentBattle: null,
    lastDiscovery: null,
    magicPower: 0,
    lastAction: ''
};

// 當頁面載入時開始遊戲
window.onload = function() {
    updateStats();
    appendMessage('ai', `歡迎來到魔法冒險世界！

你是一位剛踏上冒險之路的旅人，當前擁有 ${gameState.gold} 金幣。

可用指令：
1. 探索村莊 - 尋找任務和寶藏
2. 進入森林 - 戰鬥和採集資源
3. 查看背包 - 檢視物品和狀態
4. 進入商店 - 購買裝備道具

請輸入數字(1-4)或直接輸入要做的事情。`);
};

function updateStats() {
    document.getElementById('health').textContent = `生命值: ${gameState.health}/${gameState.maxHealth}`;
    document.getElementById('gold').textContent = `金幣: ${gameState.gold} | 等級: ${gameState.level} | 經驗: ${gameState.experience}`;
}

async function handleGameLogic(userInput) {
    const input = userInput.toLowerCase();
    let response = '';    // 優先處理戰鬥狀態
    if (gameState.currentBattle) {
        const battleResponse = handleBattle(input);
        if (battleResponse) {
            updateStats();
            return battleResponse;
        }
        return `戰鬥狀態：面對 ${gameState.currentBattle.name}
怪物生命值：${gameState.currentBattle.hp}/${gameState.currentBattle.maxHp}
你可以：
1. 攻擊
2. 使用物品
3. 逃跑`;
    }

    // 處理主要場景動作
    if (gameState.currentLocation === 'forest') {
        if (input === '1' || input.includes('探索')) {
            const randomEvent = Math.random();
            if (randomEvent < 0.6) { // 60% 機率遇到怪物
                const monsters = [
                    { name: '野狼', hp: 30, damage: 10, exp: 20, gold: 5 },
                    { name: '哥布林', hp: 25, damage: 8, exp: 15, gold: 8 },
                    { name: '強盜', hp: 40, damage: 12, exp: 25, gold: 12 }
                ];
                const monster = monsters[Math.floor(Math.random() * monsters.length)];
                gameState.currentBattle = { ...monster, maxHp: monster.hp };
                return `你遇到了 ${monster.name}！\n
怪物狀態：
生命值: ${monster.hp}
攻擊力: ${monster.damage}\n
你可以：
1. 攻擊
2. 使用物品
3. 逃跑`;
            } else {
                const forestEvents = [
                    '你發現了一些野生蘑菇！',
                    '你找到了一些有用的草藥。',
                    '你發現了一個小寶箱！'
                ];
                response = forestEvents[Math.floor(Math.random() * forestEvents.length)];
                const item = ['野生蘑菇', '草藥', '小型治療藥水'][Math.floor(Math.random() * 3)];
                gameState.inventory.push(item);
                return `${response}\n你獲得了 ${item}！`;
            }
        } else if (input === '2' || input.includes('打獵')) {
            const huntResults = [
                '你成功捕獲了一隻兔子！',
                '你找到了一些野果。',
                '你跟丟了獵物，但發現了一些金幣！'
            ];
            response = huntResults[Math.floor(Math.random() * huntResults.length)];
            if (response.includes('金幣')) {
                gameState.gold += 2;
                updateStats();
            } else {
                gameState.inventory.push(response.includes('兔子') ? '兔肉' : '野果');
            }
            return response;
        } else if (input === '3' || input.includes('返回')) {
            gameState.currentLocation = 'village';
            return `你安全地返回了村莊。\n
你可以：
1. 探索村莊
2. 進入森林
3. 查看背包
4. 進入商店`;
        }
    } else if (input === '1' || input.includes('探索')) {
        const events = [
            '你在村莊裡發現了一個金幣！',
            '你幫助鐵匠整理工具，獲得2金幣報酬。',
            '你在井邊撿到3金幣。'
        ];
        response = events[Math.floor(Math.random() * events.length)];
        gameState.gold += Math.floor(Math.random() * 3) + 1;
        updateStats();
    } else if (input === '2' || input.includes('森林')) {
        gameState.currentLocation = 'forest';
        return `你進入了神秘的森林。這裡充滿了未知的冒險！\n
你可以：
1. 深入探索 - 尋找寶藏和冒險（可能遇到怪物！）
2. 打獵 - 獲取食物和資源
3. 返回村莊

小心！森林中潛伏著危險的生物...`;
    } else if (input === '3' || input.includes('背包')) {
        return `【角色狀態】
生命值: ${gameState.health}/${gameState.maxHealth}
金幣: ${gameState.gold}
等級: ${gameState.level}
經驗值: ${gameState.experience}

【背包物品】
${gameState.inventory.length > 0 ? gameState.inventory.join('\n') : '空空如也'}

提示：部分物品可以使用！輸入"使用 物品名稱"來使用物品。`;    } else if (input === '4' || input.includes('商店')) {
        gameState.lastAction = 'shop';
        return `歡迎來到商店！
你有 ${gameState.gold} 金幣

可購買的物品：
A. 治療藥水 (5金幣) - 恢復30點生命值
B. 木劍 (10金幣) - 提升戰鬥力
C. 皮甲 (8金幣) - 增加防禦力
X. 離開商店

請輸入物品代號購買 (A/B/C) 或 X 離開商店`;
    } else if (input.startsWith('使用')) {
        const itemName = input.substring(3).trim();
        if (gameState.inventory.includes(itemName)) {
            if (itemName === '治療藥水' || itemName === '小型治療藥水') {
                const healAmount = itemName === '治療藥水' ? 30 : 20;
                gameState.health = Math.min(gameState.maxHealth, gameState.health + healAmount);
                gameState.inventory = gameState.inventory.filter(item => item !== itemName);
                response = `你使用了${itemName}，恢復了 ${healAmount} 點生命值！`;
                updateStats();
            } else if (itemName === '野果' || itemName === '兔肉') {
                const healAmount = itemName === '兔肉' ? 20 : 10;
                gameState.health = Math.min(gameState.maxHealth, gameState.health + healAmount);
                gameState.inventory = gameState.inventory.filter(item => item !== itemName);
                response = `你食用了${itemName}，恢復了 ${healAmount} 點生命值！`;
                updateStats();
            } else {
                response = '這個物品現在無法使用。';
            }
            return response;
        } else {
            return `你沒有 ${itemName}！`;
        }
    }    if (gameState.lastAction === 'shop') {
        const prices = [5, 10, 8];
        const items = ['治療藥水', '木劍', '皮甲'];
        let choice = -1;
        
        if (input.toLowerCase() === 'a') choice = 0;
        else if (input.toLowerCase() === 'b') choice = 1;
        else if (input.toLowerCase() === 'c') choice = 2;
        else if (input.toLowerCase() === 'x') {
            gameState.lastAction = '';
            return `你離開了商店。\n
請選擇要做什麼：
1. 探索村莊
2. 進入森林
3. 查看背包
4. 進入商店`;
        }

        if (choice >= 0) {
            if (gameState.gold >= prices[choice]) {
                gameState.gold -= prices[choice];
                gameState.inventory.push(items[choice]);
                response = `你購買了 ${items[choice]}！\n
你還有 ${gameState.gold} 金幣\n
可購買的物品：
A. 治療藥水 (5金幣) - 恢復30點生命值
B. 木劍 (10金幣) - 提升戰鬥力
C. 皮甲 (8金幣) - 增加防禦力
X. 離開商店

請輸入物品代號購買 (A/B/C) 或 X 離開商店`;
                updateStats();
            } else {
                response = `金幣不足！\n
你還有 ${gameState.gold} 金幣\n
可購買的物品：
A. 治療藥水 (5金幣) - 恢復30點生命值
B. 木劍 (10金幣) - 提升戰鬥力
C. 皮甲 (8金幣) - 增加防禦力
X. 離開商店

請輸入物品代號購買 (A/B/C) 或 X 離開商店`;
            }
            return response;
        }
        
        // 如果輸入無效，顯示商店選單
        return `無效的選擇！\n
你有 ${gameState.gold} 金幣\n
可購買的物品：
A. 治療藥水 (5金幣) - 恢復30點生命值
B. 木劍 (10金幣) - 提升戰鬥力
C. 皮甲 (8金幣) - 增加防禦力
X. 離開商店

請輸入物品代號購買 (A/B/C) 或 X 離開商店`;
    }

    return response || `請選擇要做什麼：
1. 探索村莊
2. 進入森林
3. 查看背包
4. 進入商店`;
}

function handleBattle(input) {
    if (!gameState.currentBattle) return null;
    
    const monster = gameState.currentBattle;
    let response = '';

    if (input === '1' || input.includes('攻擊')) {
        // 玩家攻擊
        const playerDamage = 15 + Math.floor(Math.random() * 10);
        monster.hp -= playerDamage;
        
        // 怪物反擊
        if (monster.hp > 0) {
            gameState.health -= monster.damage;
            response = `你對${monster.name}造成了 ${playerDamage} 點傷害！
怪物生命值：${monster.hp}/${monster.maxHp}\n
但${monster.name}反擊了！你受到了 ${monster.damage} 點傷害。
你的生命值：${gameState.health}/${gameState.maxHealth}`;
        } else {
            // 戰鬥勝利
            gameState.gold += monster.gold;
            gameState.experience += monster.exp;
            response = `你擊敗了${monster.name}！
獲得：
- ${monster.gold} 金幣
- ${monster.exp} 經驗值`;
            gameState.currentBattle = null;
        }
    } else if (input === '2' || input.includes('物品')) {
        if (gameState.inventory.includes('治療藥水')) {
            gameState.health = Math.min(gameState.maxHealth, gameState.health + 30);
            gameState.inventory = gameState.inventory.filter(item => item !== '治療藥水');
            response = '你使用了治療藥水，恢復了30點生命值！';
        } else {
            response = '你沒有可以使用的物品！';
        }
    } else if (input === '3' || input.includes('逃跑')) {
        if (Math.random() > 0.5) {
            gameState.currentBattle = null;
            response = '你成功逃脫了！';
        } else {
            gameState.health -= monster.damage;
            response = `逃跑失敗！${monster.name}攻擊了你，造成 ${monster.damage} 點傷害。`;
        }
    }
    
    // 檢查玩家是否死亡
    if (gameState.health <= 0) {
        response += '\n\n你的生命值耗盡了！遊戲結束。';
        gameState.currentBattle = null;
    }
    
    return response;
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();

    if (message === '') return;

    appendMessage('user', message);
    userInput.value = '';

    const gameResponse = await handleGameLogic(message);
    appendMessage('ai', gameResponse);

    // 檢查遊戲是否結束
    if (gameState.health <= 0) {
        appendMessage('ai', '遊戲結束！你的生命值耗盡了。請重新整理頁面開始新的遊戲。');
        document.getElementById('userInput').disabled = true;
    }
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 按下 Enter 鍵發送訊息
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

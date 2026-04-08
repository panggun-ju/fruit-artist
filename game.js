// Game state
let canvas, ctx;
let gameActive = false;
let score = 0;
let timeLeft = 10;
let lastTime = 0;
let fruits = [];
let tapes = [];
let isDragging = false;
let dragStart = null;
let dragCurrent = null;
let firstFruitTaped = false;
let tapedFruitsCount = 0;
let wallTapesCount = 0;
let tapedBanana = false;
let gameTimer = null;
let soundsPlayed = false;
let zoomTarget = null;
let zoomFactor = 1;

// Audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Fruit emojis
const fruitEmojis = ['🍎', '🍊', '🍇', '🍌', '🍐', '🍑', '🍒', '🥝'];
const bananaEmoji = '🍌';

const ART_SPEAK_MESSAGES = [
    '해체된 자아의 단면',
    '자본의 유연한 점성',
    '무의미의 화려한 박제',
    '부정형의 야망',
    '자본주의의 달콤한 붕괴',
    '시장의 무중력 상태',
    '가격표 뒤의 침묵',
    '유동성의 정물화',
    '희소성이라는 환상의 껍질',
    '관람객의 시선이 완성한 조각',
    '따짐을 당하지 않는 장담',
    '미학적 허탈의 순간',
    '박제된 욕망의 단면',
    '거래 가능한 시시함',
    '레퍼런스 없는 고전',
];

function pickArtSpeak() {
    return ART_SPEAK_MESSAGES[Math.floor(Math.random() * ART_SPEAK_MESSAGES.length)];
}

const VOID_COA_PRICE = 999999999;

const VOID_COA_TITLES = [
    '무제 (테이프의 부재가 곧 테이프다)',
    '《공백의 낙찰: 시장만 남은 정물》',
    '부재에 대한 연구 XVII — 디스플레이만 존재함',
    '《보이지 않는 유산》· 에디션: 시선',
    '히든 오브젝트 (Hidden in Plain Capital)',
];

const VOID_COA_DESCRIPTIONS = [
    '본 작품은 재료를 의도적으로 거부함으로써, 유일한 매질인 “시장의 기대”만을 표면에 띄운다. 테이프는 붙지 않았으나 가격은 선행한다 — 이는 디지털 시대 정물화의 패러다임 전복이다.',
    '과일은 스쳐 지나갔고 덕트 테이프는 영원히 미도달 상태로 남는다. 관람객의 시선이 유일한 물리적 층위이며, 본 서술 문단은 작품의 실체보다 길다(의도된 비율).',
    '작가는 “붙이지 않음”을 긍정적 행위로 선언한다. 박제되지 않은 순간들의 합이 오히려 희소성을 증폭시키며, 본 보증서는 그 역설을 문서화한다.',
    '캔버스는 없고, 오직 잠재적 낙찰만이 있다. 본 작품은 존재론적으로 완결되었으나 물리적으로는 비어 있으며, 그 간극이 곧 서사다.',
];

const VOID_WALL_NOTES = [
    '벽면 텍스트(비공식): “Lot ∅ — Nothing taped, everything priced.”',
    '카탈로그 레이징: 부재 매체 / 조명: 관람객 죄책감 / 조건: 설명이 작품보다 비쌈',
    '전시장 안내: 사진 촬영 허용. 다만 찍힌 것이 없을 경우 그 공백이 작품의 일부입니다.',
    '큐레이터 주석: “이건 게임 실패가 아니라 리스크 오프(risk-off) 미학입니다.”',
];

const NORMAL_COA_DESCRIPTIONS = [
    '디지털 과일 표면에 가해진 가상 덕트 테이프의 장력이 남긴 순간적 평형. 중력과 자본의 중력이 같은 벡터로 작용한 듯한 착시.',
    '스크린 픽셀 위에서만 성립하는 박제. 실물 갤러리의 조명과 동일한 온도의 허세를 디지털로 이식하였다.',
    '낙찰가는 희소성 함수의 부산물이며, 테이프 각도는 작가(플레이어)의 무의식적 구도 감각을 반영한다.',
];

const NORMAL_WALL_NOTES = [
    '벽면 보조 라벨: “본 작품은 저장 매체가 아닌, 저장되지 않은 순간들의 합성이다.”',
    'Audio guide 없음 — 침묵이 작품 설명서입니다.',
    '출처: Fruit Artist, 디지털 에디션. 재료: 이모지, 테이프, 시장 심리.',
];

const GREED_LABEL_TITLES = [
    '찰나의 박제 — 욕심이 희소성을 갉아먹다',
    '《과잉 박제》· 시장은 한 점만 원했다',
    '다중 테이프: 욕망의 할인율',
    '희소성 붕괴를 동반한 정물 연작',
];

const VOID_MATERIAL_LINES = [
    '부재, 공기, 브라우저 기반 조명, 가상 덕트 테이프(미부착), RGB 픽셀, 시장 기대치(무형)',
    '디스플레이, 관람 시선, 미도달 테이프 레이어, 유령 낙찰가, 디지털 회벽 질감',
    '비물질, 스크린, 프랙털 노이즈(그레인), 테이프 0m, 자본주의적 미학(공허판)',
];

const SINGLE_MATERIAL_LINES = [
    '디지털 과일, 가상 덕트 테이프, 스크린 조명, 자본주의적 미학',
    '디지털 과일(유니코드), 은박 가상 덕트 테이프, LCD, 그림자(렌더)',
    '이모지 정물, 시뮬레이션 덕트 테이프, 픽셀, 전시장 스포트라이트(가상)',
];

const BANANA_SINGLE_TITLES = [
    '《Comedian》을 염두에 둔 디지털 거리',
    '찰나의 박제: 1억 2천만 달러의 농담(재현)',
    '벽과 바나나 사이: 시장이 웃는 정물',
    '단일 낙찰 — 유머가 희소성을 대신하다',
    '테이프 한 줄에 담긴 아트페어 신화',
    '낙관과 바나나: 자본이 좋아하는 곡선',
];

const GREED_MATERIAL_LINES = [
    '디지털 과일 {n}점, 중첩 가상 덕트 테이프, 희소성 페널티 레이어, 스크린, 자본주의적 미학',
    '다점 이모지 정물, 다층 가상 덕트 테이프, 브라우저 캔버스, 알고리즘 할인, LCD',
    '디지털 과일 {n}연작, 누적 가상 덕트 테이프, 픽셀, 시장 심리(가변 매질)',
];

function pickCoaLine(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function clearArtLabel() {
    const label = document.getElementById('art-label');
    label.classList.remove('art-label--void', 'visible');
    document.getElementById('art-label-artist').textContent = '작가 미상';
    document.getElementById('art-label-title-line').innerHTML = '';
    document.getElementById('art-label-medium').textContent = '';
}

function fillArtLabel(taped) {
    const tapedCount = taped.length;
    const label = document.getElementById('art-label');
    const titleEl = document.getElementById('art-label-title-line');
    const mediumEl = document.getElementById('art-label-medium');
    document.getElementById('art-label-artist').textContent = '작가 미상';
    label.classList.toggle('art-label--void', tapedCount === 0);

    if (tapedCount === 0) {
        const t = pickCoaLine(VOID_COA_TITLES);
        titleEl.innerHTML = `<i>${t}</i><span class="art-label__year">, 2026</span>`;
        mediumEl.textContent = pickCoaLine(VOID_MATERIAL_LINES);
    } else if (tapedCount === 1) {
        const only = taped[0];
        const isBanana = only && only.emoji === bananaEmoji;
        const titleText = isBanana ? pickCoaLine(BANANA_SINGLE_TITLES) : '찰나의 박제: 시장이 인정한 단면';
        titleEl.innerHTML = `<i>${titleText}</i><span class="art-label__year">, 2026</span>`;
        mediumEl.textContent = pickCoaLine(SINGLE_MATERIAL_LINES);
    } else {
        const gt = pickCoaLine(GREED_LABEL_TITLES);
        titleEl.innerHTML = `<i>${gt}</i><span class="art-label__year">, 2026</span>`;
        mediumEl.textContent = pickCoaLine(GREED_MATERIAL_LINES).replace('{n}', String(tapedCount));
    }
}

function setCoaScrollOpen(open) {
    const dock = document.getElementById('coa-scroll-dock');
    const roll = document.getElementById('coa-scroll-roll');
    const hint = roll.querySelector('.coa-scroll-roll__hint');
    if (open) dock.classList.add('coa-scroll-dock--open');
    else dock.classList.remove('coa-scroll-dock--open');
    roll.setAttribute('aria-expanded', open ? 'true' : 'false');
    hint.textContent = open ? '접기' : '펼치기';
}

// Initialize
window.onload = function() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, {passive: false});
    canvas.addEventListener('touchmove', onTouchMove, {passive: false});
    canvas.addEventListener('touchend', onPointerUp);

    document.addEventListener('mousemove', updateCursor);

    const roll = document.getElementById('coa-scroll-roll');
    roll.addEventListener('click', () => {
        setCoaScrollOpen(!document.getElementById('coa-scroll-dock').classList.contains('coa-scroll-dock--open'));
    });
    roll.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            roll.click();
        }
    });
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function updateCursor(e) {
    const cursor = document.getElementById('custom-cursor');
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
}

// Sound generation
function playClap() {
    const bufferSize = audioContext.sampleRate * 0.15;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noise.start();
}

function playWhistle() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2400, audioContext.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.25);
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.25);
}

function playWoo() {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(120, audioContext.currentTime + 0.6);
    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.6);
}

function playSounds() {
    if (soundsPlayed) return;
    soundsPlayed = true;
    const total = tapedFruitsCount + wallTapesCount;
    if (total === 1 && tapedFruitsCount === 1) {
        playClap();
        if (tapedBanana) setTimeout(playWhistle, 150);
    } else {
        playWoo();
    }
}

// Input handling
function onPointerDown(e) {
    if (!gameActive) return;
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    dragCurrent = { x: e.clientX, y: e.clientY };
    document.getElementById('custom-cursor').style.transform = "translate(-50%, -50%) rotate(-15deg) scale(0.9)";
}

function onPointerMove(e) {
    if (!gameActive) return;
    dragCurrent = { x: e.clientX, y: e.clientY };
}

function onPointerUp(e) {
    if (!gameActive || !isDragging) return;
    isDragging = false;
    document.getElementById('custom-cursor').style.transform = "translate(-50%, -50%) rotate(-15deg) scale(1.0)";
    if (dragStart && dragCurrent) createTape(dragStart, dragCurrent);
    dragStart = null;
    dragCurrent = null;
}

function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    onPointerDown({ clientX: touch.clientX, clientY: touch.clientY });
}

function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    onPointerMove({ clientX: touch.clientX, clientY: touch.clientY });
}

// Game logic
function startGame() {
    document.getElementById('start-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('end-screen').style.display = 'none';
    }, 1000);
    
    gameActive = true;
    score = 0;
    timeLeft = 10;
    fruits = [];
    tapes = [];
    firstFruitTaped = false;
    tapedFruitsCount = 0;
    wallTapesCount = 0;
    tapedBanana = false;
    soundsPlayed = false;
    zoomFactor = 1;
    zoomTarget = null;
    document.getElementById('game-container').style.transform = "scale(1)";
    clearArtLabel();
    document.getElementById('vignette').classList.remove('active');
    document.getElementById('film-grain').classList.remove('active');
    document.getElementById('sold-dot').classList.remove('visible');
    const cert = document.getElementById('certificate');
    cert.classList.remove('certificate--void');
    const dock = document.getElementById('coa-scroll-dock');
    dock.classList.remove('coa-scroll-dock--shown', 'coa-scroll-dock--open');
    setCoaScrollOpen(false);
    const placard = document.getElementById('void-placard');
    placard.textContent = '';
    placard.classList.remove('void-placard--visible');
    placard.setAttribute('aria-hidden', 'true');
    
    updateUI();
    
    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            timeLeft = 0;
            endGame();
            return;
        }
        updateUI();
    }, 100);
    
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    
    spawnFruit();
    setTimeout(spawnFruit, 2500);
}

function spawnFruit() {
    if (!gameActive) return;
    const emoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
    const x = Math.random() * (canvas.width - 240) + 120;
    
    const startY = canvas.height + 150;
    const targetY = canvas.height * (0.15 + Math.random() * 0.15);
    const dist = startY - targetY;
    
    // 기본 물리 계수 (60fps 기준)
    const baseG = 0.45;
    const slowFactor = 0.35;
    
    // 프레임 독립적인 중력 계산
    const gravity = baseG * (slowFactor * slowFactor);
    // 도달 속도 공식: v = sqrt(2 * g * h)
    const vy = -Math.sqrt(2 * gravity * dist);
    
    const vx = (Math.random() - 0.5) * 1.5;
    const size = (Math.random() * 0.04 + 0.12) * Math.min(canvas.width, canvas.height);
    const rot = Math.random() * Math.PI * 2;
    const rotSpd = (Math.random() - 0.5) * 0.04;
    
    fruits.push({ 
        emoji, x, y: startY, 
        vx, vy, 
        gravity, 
        size, 
        rotation: rot, 
        rotationSpeed: rotSpd, 
        taped: false, 
        tapeOpacity: 0 
    });
}

function createTape(start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 10) return;
    const ang = Math.atan2(dy, dx);
    const mx = (start.x + end.x) / 2;
    const my = (start.y + end.y) / 2;
    
    let hit = null;
    let minDist = Infinity;
    for (let f of fruits) {
        if (f.taped) continue;
        const d = Math.sqrt(Math.pow(f.x - mx, 2) + Math.pow(f.y - my, 2));
        if (d < f.size * 0.6 && d < minDist) {
            minDist = d;
            hit = f;
        }
    }
    
    if (hit) {
        hit.taped = true;
        hit.tapeAngle = ang;
        hit.tapeLength = Math.min(len, hit.size * 2);
        tapedFruitsCount++;
        const isB = hit.emoji === bananaEmoji;
        if (isB) tapedBanana = true;
        const pts = isB ? 120000000 : 10000000;
        
        if (!firstFruitTaped) {
            score = pts;
            firstFruitTaped = true;
            triggerContemporaryArtEffects(pts);
        } else {
            const penalty = Math.floor(score * 0.15);
            score -= penalty;
        }
        showMessage(pickArtSpeak());
    } else {
        wallTapesCount++;
        tapes.push({ x: mx, y: my, length: len, angle: ang });
        if (firstFruitTaped) {
            // 허공 테이프: 가치 -25% (작가의 의도 불분명)
            const penalty = Math.floor(score * 0.25);
            score -= penalty;
            showMessage('의도 불분명: -25%');
        }
    }
    if (score < 0) score = 0;
    updateUI();
}

function showMessage(text) {
    const msg = document.getElementById('message-display');
    msg.textContent = text;
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 1500);
}

function triggerContemporaryArtEffects(val) {
    const flash = document.getElementById('flash');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 200);
}

function triggerEndFlashAndConfetti() {
    const flash = document.getElementById('flash');
    flash.classList.add('active');
    createConfetti();
    setTimeout(() => flash.classList.remove('active'), 200);
}

function createConfetti() {
    const container = document.getElementById('game-container');
    const colors = ['#f0f0f0', '#d4d4d4', '#e8e8e8', '#ff2a2a', '#1a1a1a', '#c9a227', '#8b7355'];
    const count = 52 + Math.floor(Math.random() * 36);
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'confetti';
        const startLeftVw = Math.random() * 100;
        const startTopVh = -22 + Math.random() * 38;
        const w = 3 + Math.random() * 11;
        const h = 2 + Math.random() * (w * 0.9);
        const durS = 1.45 + Math.random() * 2.35;
        const driftVw = (Math.random() - 0.5) * 62;
        const rotEnd = 360 + Math.random() * 900;
        const delayMs = Math.floor(Math.random() * 120);

        div.style.left = startLeftVw + 'vw';
        div.style.top = startTopVh + 'vh';
        div.style.width = w + 'px';
        div.style.height = h + 'px';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.borderRadius = Math.random() > 0.45 ? '50%' : `${Math.random() > 0.5 ? '0' : '2'}px`;
        div.style.opacity = '1';
        div.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(div);

        const endTopVh = 108 + Math.random() * 22;
        const endLeftVw = startLeftVw + driftVw;

        setTimeout(() => {
            div.style.transition = [
                `top ${durS}s cubic-bezier(0.28, 0.05, 0.42, 1)`,
                `left ${durS}s cubic-bezier(0.15, 0.5, 0.35, 1)`,
                `transform ${durS}s linear`,
                `opacity ${durS * 0.55}s ease-out ${durS * 0.25}s`,
            ].join(', ');
            div.style.top = endTopVh + 'vh';
            div.style.left = endLeftVw + 'vw';
            div.style.transform = `rotate(${rotEnd}deg)`;
            div.style.opacity = '0';
        }, delayMs);

        setTimeout(() => div.remove(), delayMs + durS * 1000 + 350);
    }
}

function updateUI() {
    let price = score === 0 ? '가치: $0' : (score > 0 ? `가치: $${score.toLocaleString()}` : `가치: -$${Math.abs(score).toLocaleString()}`);
    document.getElementById('score-display').textContent = price;
    document.getElementById('timer-display').textContent = timeLeft.toFixed(1) + '초';
}

function gameLoop(time) {
    // 테이프 안 붙은 과일이 화면에 남아있는지 확인
    const untapedOnScreen = fruits.some(f => !f.taped);
    
    // 게임이 끝났고, 줌 애니메이션도 없고, 남은 과일도 없으면 루프 중단
    if (!gameActive && zoomFactor === 1 && !untapedOnScreen) return;
    
    // Delta time 계산 (초 단위)
    const dt = Math.min((time - lastTime) / 1000, 0.1); 
    lastTime = time;
    
    update(dt);
    render();
    
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    const step = dt * 60; // 60fps 기준으로 연산 정규화
    
    for (let i = fruits.length - 1; i >= 0; i--) {
        const f = fruits[i];
        if (!f.taped) {
            f.x += f.vx * step;
            f.y += f.vy * step;
            f.vy += f.gravity * step;
            f.rotation += f.rotationSpeed * step;
            if (f.y > canvas.height + 250) {
                fruits.splice(i, 1);
                if (gameActive) setTimeout(spawnFruit, 400);
            }
        } else if (f.tapeOpacity < 1) {
            f.tapeOpacity += dt * 2.5;
        }
    }
    if (gameActive && fruits.filter(f => !f.taped).length < 2 && Math.random() < 0.01) spawnFruit();
}

function render() {
    ctx.save();
    if (zoomTarget) {
        const targetX = canvas.width / 2;
        const targetY = canvas.height / 2;
        const dx = (targetX - zoomTarget.x) * (zoomFactor - 1);
        const dy = (targetY - zoomTarget.y) * (zoomFactor - 1);
        ctx.translate(dx, dy);
        ctx.translate(targetX, targetY);
        ctx.scale(zoomFactor, zoomFactor);
        ctx.translate(-targetX, -targetY);
    }
    
    ctx.clearRect(-1000, -1000, canvas.width + 2000, canvas.height + 2000);
    for (let t of tapes) drawTape(t.x, t.y, t.length, t.angle);
    for (let f of fruits) {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.font = `${f.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = zoomFactor > 1 ? 15 : 8;
        ctx.fillText(f.emoji, 0, 0);
        if (f.taped && f.tapeOpacity > 0) {
            ctx.rotate(f.tapeAngle - f.rotation);
            drawTapeOnFruit(f.tapeLength, f.tapeOpacity);
        }
        ctx.restore();
    }
    if (isDragging && dragStart && dragCurrent) drawDragLine();
    ctx.restore();
}

function drawTape(x, y, len, ang) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const tw = Math.max(14, canvas.width * 0.016);
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#b5b5b5';
    ctx.fillRect(-len/2, -tw/2, len, tw);
    ctx.restore();
}

function drawTapeOnFruit(len, op) {
    ctx.save();
    ctx.globalAlpha = op;
    const tw = Math.max(12, canvas.width * 0.014);
    ctx.shadowColor = zoomFactor > 1 ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = zoomFactor > 1 ? 12 : 6;
    ctx.shadowOffsetY = zoomFactor > 1 ? 6 : 4;
    ctx.fillStyle = '#b8b8b8';
    ctx.fillRect(-len/2, -tw/2, len, tw);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = -len/2 + 3; i < len/2; i += 4) {
        ctx.beginPath(); ctx.moveTo(i, -tw/2); ctx.lineTo(i, tw/2); ctx.stroke();
    }
    ctx.restore();
}

function drawDragLine() {
    const dx = dragCurrent.x - dragStart.x, dy = dragCurrent.y - dragStart.y;
    const len = Math.sqrt(dx * dx + dy * dy), ang = Math.atan2(dy, dx);
    ctx.save();
    ctx.translate((dragStart.x + dragCurrent.x)/2, (dragStart.y + dragCurrent.y)/2);
    ctx.rotate(ang);
    ctx.fillStyle = 'rgba(180,180,180,0.6)';
    ctx.fillRect(-len/2, -8, len, 16);
    ctx.restore();
}

function computeZoomForTapedFruits(taped) {
    const padFrac = 0.14;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const f of taped) {
        const r = f.size * 0.55;
        minX = Math.min(minX, f.x - r);
        maxX = Math.max(maxX, f.x + r);
        minY = Math.min(minY, f.y - r);
        maxY = Math.max(maxY, f.y + r);
    }
    const w = Math.max(maxX - minX, 48);
    const h = Math.max(maxY - minY, 48);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const innerW = canvas.width * (1 - 2 * padFrac);
    const innerH = canvas.height * (1 - 2 * padFrac);
    const fitZoom = Math.min(innerW / w, innerH / h);
    let targetZoom;
    if (taped.length === 1) {
        targetZoom = Math.min(2.5, fitZoom);
        targetZoom = Math.max(targetZoom, 1);
    } else {
        targetZoom = Math.min(fitZoom, 4.2);
        targetZoom = Math.max(targetZoom, 1);
    }
    return { zoomTarget: { x: cx, y: cy }, targetZoom };
}

function formatCoaPrice(tapedCount) {
    if (tapedCount === 0) return `$${VOID_COA_PRICE.toLocaleString()}`;
    if (score === 0) return '$0';
    if (score > 0) return `$${score.toLocaleString()}`;
    return `-$${Math.abs(score).toLocaleString()}`;
}

function buildCoaSerial() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `FA-${t}-${r}`;
}

function fillCertificate(tapedCount) {
    const cert = document.getElementById('certificate');
    const placard = document.getElementById('void-placard');
    const g = document.getElementById('coa-guarantee');

    document.getElementById('coa-serial').textContent = buildCoaSerial();
    document.getElementById('coa-price').textContent = formatCoaPrice(tapedCount);

    if (tapedCount === 0) {
        cert.classList.add('certificate--void');
        document.getElementById('coa-title').textContent = pickCoaLine(VOID_COA_TITLES);
        document.getElementById('coa-description').textContent = pickCoaLine(VOID_COA_DESCRIPTIONS);
        document.getElementById('coa-wall-note').textContent = pickCoaLine(VOID_WALL_NOTES);
        document.getElementById('coa-edition').textContent = "Edition \u221e / \u221e · AP (Artist's Pretence)";
        g.textContent =
            '부재는 곧 완성이다. 본 디지털 공백은 시장이 스스로 상상한 희소성을 보증하며, 물리적 테이프 없이도 낙찰 서사를 완결한다.';
        placard.innerHTML =
            '특별 소장품 <em>부재의 완결</em><br>기획: 가상 큐레이터 오피스 · 섹션: “테이프 이전의 자본”';
        placard.classList.add('void-placard--visible');
        placard.setAttribute('aria-hidden', 'false');
    } else {
        cert.classList.remove('certificate--void');
        document.getElementById('coa-title').textContent = `찰나의 박제 — 테이프 단면 연구 (${tapedCount}점)`;
        document.getElementById('coa-description').textContent = pickCoaLine(NORMAL_COA_DESCRIPTIONS);
        document.getElementById('coa-wall-note').textContent = pickCoaLine(NORMAL_WALL_NOTES);
        document.getElementById('coa-edition').textContent = `Unique mis-en-scène · ${tapedCount} constituent fragment(s)`;
        g.textContent = '본 디지털 박제물은 예술적 가치를 보증함';
        placard.textContent = '';
        placard.classList.remove('void-placard--visible');
        placard.setAttribute('aria-hidden', 'true');
    }
}

function revealCoaScrollDock() {
    const dock = document.getElementById('coa-scroll-dock');
    setCoaScrollOpen(false);
    dock.classList.add('coa-scroll-dock--shown');
}

function endGame() {
    gameActive = false;
    clearInterval(gameTimer);
    playSounds();

    const taped = fruits.filter(f => f.taped);
    const duration = 2500;
    updateUI();
    if (taped.length === 0) {
        document.getElementById('score-display').textContent =
            `가치: $${VOID_COA_PRICE.toLocaleString()}`;
    }
    fillCertificate(taped.length);
    fillArtLabel(taped);

    if (taped.length > 0) {
        const { zoomTarget: zt, targetZoom } = computeZoomForTapedFruits(taped);
        zoomTarget = zt;
        const start = performance.now();
        document.getElementById('vignette').classList.add('active');
        document.getElementById('film-grain').classList.add('active');

        function animateZoom(time) {
            const progress = Math.min((time - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            zoomFactor = 1 + (targetZoom - 1) * ease;
            if (progress < 1) requestAnimationFrame(animateZoom);
        }
        requestAnimationFrame(animateZoom);

        setTimeout(() => {
            triggerEndFlashAndConfetti();
            document.getElementById('sold-dot').classList.add('visible');
            document.getElementById('art-label').classList.add('visible');
            document.getElementById('end-screen').style.display = 'flex';
            document.getElementById('end-screen').style.opacity = '1';
            revealCoaScrollDock();
        }, duration);
    } else {
        zoomTarget = null;
        zoomFactor = 1;
        setTimeout(() => {
            triggerEndFlashAndConfetti();
            document.getElementById('art-label').classList.add('visible');
            document.getElementById('end-screen').style.display = 'flex';
            document.getElementById('end-screen').style.opacity = '1';
            revealCoaScrollDock();
        }, 400);
    }
}

function resetGame() {
    document.getElementById('end-screen').style.opacity = '0';
    document.getElementById('vignette').classList.remove('active');
    setTimeout(() => {
        document.getElementById('end-screen').style.display = 'none';
        startGame();
    }, 1000);
}

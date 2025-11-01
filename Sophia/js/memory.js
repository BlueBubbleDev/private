// Modern und sauber: professionelles Memory-Game-Konzept

document.addEventListener('DOMContentLoaded', () => {
  // Deine Bildpfade (je Paar einmal --> Script macht automatisch 2x jede Karte draus)
  const images = [
    'img/lve1.png',
    'img/lve2.png',
    'img/lve3.png',
    'img/lve4.png',
    'img/lve5.png',
    'img/lve6.png',
    'img/lve7.png',
    'img/lve8.png',
    'img/lve9.png',
    'img/lve10.png',
    // weitere Paare einfach ergänzen
  ];

  const gameBoard = document.getElementById('game-board');
  const scoreEl = document.getElementById('score');
  const overlay = document.getElementById('image-overlay');
  const overlayImg = overlay.querySelector('img');
  const codePopup = document.getElementById('code-popup');
  const closeCodeBtn = document.getElementById('close-code-btn');
  const scoreboard = document.getElementById('scoreboard');
  const TARGET_SCORE = 250;

  let cardDeck = [];
  let firstCard = null, secondCard = null;
  let lockBoard = false;
  let points = 0;
  let matchedPairs = 0;

  function setupDeck() {
    // Für jedes Bild zwei Karten (je Paar)
    cardDeck = [];
    images.forEach((src, idx) => {
      cardDeck.push( { id:`card${idx}-a`, pair: src } );
      cardDeck.push( { id:`card${idx}-b`, pair: src } );
    });
    shuffle(cardDeck);
  }

  function shuffle(array) {
    for (let i = array.length-1; i>0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function buildBoard() {
    gameBoard.innerHTML = '';
    cardDeck.forEach(cardObj => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.setAttribute('tabindex', '0');
      card.dataset.cardId = cardObj.id;
      card.dataset.pair = cardObj.pair;

      const inner = document.createElement('div');
      inner.className = 'memory-card-inner';

      const front = document.createElement('div');
      front.className = 'memory-card-front';
      front.innerHTML = '❤️';

      const back = document.createElement('div');
      back.className = 'memory-card-back';
      const img = document.createElement('img');
      img.src = cardObj.pair;
      img.alt = "Memory-Kartenbild";
      back.appendChild(img);

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      // Karten-Click
      card.addEventListener('click', () => revealCard(card));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); revealCard(card);}
      });

      gameBoard.appendChild(card);
    });
  }

  function revealCard(card) {
    if (lockBoard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    // Maximal zwei Karten gleichzeitig
    card.classList.add('flipped');
    showOverlay(card.querySelector('.memory-card-back img').src);

    if (!firstCard) {
      firstCard = card;
      return;
    }
    if (card === firstCard) return; // Gleiches Feld doppelt

    secondCard = card;
    lockBoard = true;

    setTimeout(() => {
      checkPair();
      hideOverlay();
    }, 1300); // kürzeres Overlay für mehr Spielfluss
  }

  function checkPair() {
    if (
      firstCard &&
      secondCard &&
      firstCard.dataset.pair === secondCard.dataset.pair
    ) {
      // Treffer!
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      animateHeartCoin(firstCard);
      animateHeartCoin(secondCard);
      points += 25;
      matchedPairs += 1;
      scoreEl.textContent = points;
      if (points >= TARGET_SCORE) {
        setTimeout(showCodePopup, 800);
      }
      // Beide nicht mehr klickbar
    } else {
      // Kein Treffer
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
    }
    // Reset selection
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  function showOverlay(src) {
    overlayImg.src = src;
    overlay.classList.add('visible');
  }
  function hideOverlay() {
    overlay.classList.remove('visible');
  }

  function animateHeartCoin(card) {
    const coin = document.createElement('span');
    coin.className = 'heart-coin';
    coin.textContent = '❤️';
    const cardRect = card.getBoundingClientRect();
    coin.style.left = `${cardRect.left + cardRect.width/2}px`;
    coin.style.top = `${cardRect.top + cardRect.height/2}px`;
    document.body.appendChild(coin);

    const scoreRect = scoreboard.getBoundingClientRect();
    const tx = scoreRect.left + scoreRect.width/2 - (cardRect.left + cardRect.width/2);
    const ty = scoreRect.top + scoreRect.height/2 - (cardRect.top + cardRect.height/2);

    coin.style.setProperty('--tx', `${tx}px`);
    coin.style.setProperty('--ty', `${ty}px`);
    setTimeout(() => coin.remove(), 1000);
  }

  function showCodePopup() {
    codePopup.style.display = 'block';
    codePopup.setAttribute('aria-modal', 'true');
  }
  closeCodeBtn.addEventListener('click', () =>{
    codePopup.style.display = 'none';
    codePopup.setAttribute('aria-modal', 'false');
  });

  function init() {
    points = 0;
    matchedPairs = 0;
    scoreEl.textContent = points;
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
    codePopup.style.display = 'none';
    setupDeck();
    buildBoard();
  }

  // Overlay schließt auch per Klick/tap!
  overlay.addEventListener('click', hideOverlay);

  init();
});


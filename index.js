const cardObjectDefinition = [
  { id: 1, imagePath: "./images/card-AceSpades.png" },
  { id: 2, imagePath: "./images/card-JackClubs.png" },
  { id: 3, imagePath: "./images/card-KingHearts.png" },
  { id: 4, imagePath: "./images/card-QueenDiamonds.png" },
];
const aceId = cardObjectDefinition.find((f) => /ace/i.test(f.imagePath)).id;
const cardBackImgPath = "./images/card-back-Blue.png";

const playGameButtonElement = document.getElementById("playGame");
const cardContainerElement = document.querySelector(".card-container");
const currentGameStatusElement = document.querySelector(".current-status");
const scoreContainerElement = document.querySelector(".header-score-container");
const scoreElem = document.querySelector(".score");
const roundContainerElement = document.querySelector(".header-round-container");
const roundElem = document.querySelector(".round");

let cards;
let gameInProgress = false;
let shufflingInProgress = false;
let cardsRevealed = false;
let round = 0;
let maxRounds = 4;
let score = 0;
let GAME_OBJECT;

const winColor = "green";
const loseColor = "red";
const primaryColor = "black";
const collapsedGridAreaTemplate = '"a a" "a a"';
const cardCollectionCellClass = ".card-pos-a";
const cardPositions = [];
const gameKey = "TERRY";

const shufflesPositions = [
  "shuffle-left",
  "shuffle-right",
  "shuffle-right-top",
  "shuffle-left-down",
];
/**
 *      <section class="card" id="Number">
          <article class="card-inner">
            <div class="card-front">
              <img
                src="./images/card-JackClubs.png"
                alt="JackClubs"
                class="card-img"
              />
            </div>
            <div class="card-back">
              <img
                src="./images/card-back-Blue.png"
                alt="backBlue"
                class="card-img"
              />
            </div>
          </article>
        </section>
 */
loadGame();
function gameOver() {
  updateStatusElement(scoreContainerElement, "none");
  updateStatusElement(roundContainerElement, "none");

  const _gameOverMessage = `Game Over! Final score: <span class="badge">${score}</span>. Click 'Play Game' button to play again`;
  updateStatusElement(
    currentGameStatusElement,
    "block",
    primaryColor,
    _gameOverMessage
  );

  gameInProgress = false;
  playGameButtonElement.disabled = false;
}
function endRound() {
  setTimeout(() => {
    if (round === maxRounds) {
      gameOver();
      return;
    } else {
      startRound();
    }
  }, 3000);
}
function chooseCard(card) {
  if (canChooseCard()) {
    evaluateCardChoice(card);
    flipCard(card, false);
    saveGameToLocalStorage(score, round);
    setTimeout(() => {
      flipCards(false);
      updateStatusElement(
        currentGameStatusElement,
        "block",
        primaryColor,
        "Card positions revealed"
      );
      endRound();
    }, 3000);
    cardsRevealed = true;
  }
}
function calculateScoreToAdd(roundNum) {
  return roundNum < 4 ? 25 * 2 ** (3 - roundNum) : 10;
}
function calculateScore() {
  score += calculateScoreToAdd(round);
}
function updateScore() {
  calculateScore();
  updateStatusElement(
    scoreElem,
    "block",
    primaryColor,
    `Score <span class="badge">${score}</span>`
  );
}
function updateStatusElement(elem, display, color, innerHTML) {
  elem.style.display = display;
  if (arguments.length > 2) {
    elem.style.color = color;
    elem.innerHTML = innerHTML;
  }
}
function outputChoiceFeedBack(hit) {
  if (hit) {
    updateStatusElement(
      currentGameStatusElement,
      "block",
      winColor,
      "Hit! - Well Done!!! 🤩"
    );
  } else {
    updateStatusElement(
      currentGameStatusElement,
      "block",
      loseColor,
      "Missed! 🙄"
    );
  }
}
function evaluateCardChoice(card) {
  //Todos los atributos de un elemento son de tipo String, aùn si fueron inicializados con valores tipo Number
  if (Number(card.id) === aceId) {
    updateScore();
    outputChoiceFeedBack(true);
  } else {
    outputChoiceFeedBack(false);
  }
}
function canChooseCard() {
  return gameInProgress && !shufflingInProgress && !cardsRevealed;
}
function loadGame() {
  createCards();
  cards = document.querySelectorAll(".card");
  cardFlyInEffect();
  playGameButtonElement.addEventListener("click", () => startGame());

  updateStatusElement(scoreContainerElement, "none");
  updateStatusElement(roundContainerElement, "none");
}
function startGame() {
  initializeNewGame();
  startRound();
}
function initializeNewGame() {
  score = 0;
  round = 0;
  shufflingInProgress = false;

  checkForIncompleteGame();

  updateStatusElement(scoreContainerElement, "flex");
  updateStatusElement(roundContainerElement, "flex");
  updateStatusElement(
    scoreElem,
    "block",
    primaryColor,
    `Score <span class="badge">${score}</span>`
  );
  updateStatusElement(
    roundElem,
    "block",
    primaryColor,
    `Round <span class="badge">${round}</span>`
  );
}
function startRound() {
  initializeNewRound();
  collectCards();
  flipCards(true);
  shuffleCards();
}
function initializeNewRound() {
  round++;
  playGameButtonElement.disabled = true;

  gameInProgress = true;
  shufflingInProgress = true;
  cardsRevealed = false;

  updateStatusElement(
    currentGameStatusElement,
    "block",
    primaryColor,
    "Shuffling..."
  );
  updateStatusElement(
    roundElem,
    "block",
    primaryColor,
    `Round <span class="badge">${round}</span>`
  );
}
function collectCards() {
  transformGridArea(collapsedGridAreaTemplate);
  addCardsToPositionCell(cardCollectionCellClass);
}
function transformGridArea(areas) {
  cardContainerElement.style.gridTemplateAreas = areas;
}
function addCardsToPositionCell(cellPositionClassName) {
  const _cellPositionElem = document.querySelector(cellPositionClassName);
  cards.forEach((card, index) => {
    //Aquí se mueven las cartas, de un padre a otro Nodo.
    addChild(_cellPositionElem, card);
  });
}

//Voltear las cartas
function flipCards(flipToBack) {
  cards.forEach((card, index) => {
    setTimeout(() => {
      flipCard(card, flipToBack);
    }, index * 100);
  });
}
function flipCard(card, flipToBack) {
  card.firstChild.classList.toggle("flip-it", flipToBack);
}

//Repartiendo las cartas
function cardFlyInEffect() {
  const _id = setInterval(flyIn, 5);
  let cardCount = 0;
  let count = 0;
  function flyIn() {
    if (cardCount === cards.length) {
      clearInterval(_id);
      playGameButtonElement.style.display = "block";
    }
    if ([0, 1, 2, 3].map((m) => m * 200).includes(count)) {
      cardCount++;
      document.getElementById(cardCount).classList.remove("fly-in");
    }
    count++;
  }
}

//Animando el barajeo de las cartas
function removeAnimateShuffle() {
  cards.forEach((f) => {
    f.classList.remove(...shufflesPositions);
  });
}
function animateShuffle(shuffleCount) {
  const _random1 = Math.floor(Math.random() * cards.length) + 1;
  const _random2 = Math.floor(Math.random() * cards.length) + 1;

  const _card_1 = document.getElementById(_random1);
  const _card_2 = document.getElementById(_random2);

  if (shuffleCount % 5 === 0) {
    _card_1.classList.toggle(shufflesPositions[0]);
    _card_1.style.zIndex = 100;
    _card_2.classList.toggle(shufflesPositions[0]);
    _card_2.style.zIndex = 100;
  }
  if (shuffleCount % 13 === 0) {
    _card_1.classList.toggle(shufflesPositions[1]);
    _card_1.style.zIndex = 200;
    _card_2.classList.toggle(shufflesPositions[1]);
    _card_2.style.zIndex = 200;
  }
  if (shuffleCount % 29 === 0) {
    _card_1.classList.toggle(shufflesPositions[2]);
    _card_1.style.zIndex = 300;
    _card_2.classList.toggle(shufflesPositions[2]);
    _card_2.style.zIndex = 300;
  }
  if (shuffleCount % 37 === 0) {
    _card_1.classList.toggle(shufflesPositions[3]);
    _card_1.style.zIndex = 400;
    _card_2.classList.toggle(shufflesPositions[3]);
    _card_2.style.zIndex = 400;
  }
}

//Barajar las cartas
function shuffleCards() {
  const _id = setInterval(shuffle, 20);
  // 20 * 100 da 2 segundos
  let shuffleCount = 0;
  function shuffle() {
    randomizeCardPosition();
    animateShuffle(shuffleCount);

    if (shuffleCount === 150) {
      clearInterval(_id);
      shufflingInProgress = false;
      removeAnimateShuffle();
      dealCards();
      updateStatusElement(
        currentGameStatusElement,
        "block",
        primaryColor,
        "Please, click the card you think is the <i>ace spades</i>"
      );
    } else {
      shuffleCount++;
    }
  }
}
function randomizeCardPosition() {
  const _random1 = Math.floor(Math.random() * cards.length) + 1;
  const _random2 = Math.floor(Math.random() * cards.length) + 1;
  const _temp = cardPositions[_random1 - 1];
  cardPositions[_random1 - 1] = cardPositions[_random2 - 1];
  cardPositions[_random2 - 1] = _temp;
}

function dealCards() {
  addCardsToAppropriateCell();
  transformGridArea(areaGridMappedToCardPos());
}
function areaGridMappedToCardPos() {
  const _defaultAreas = [..."abcd"];
  const _stringPositions = cardPositions
    .map((m) => _defaultAreas[m - 1])
    .join("");
  return ((str) => `"${str[0]} ${str[1]}" "${str[2]} ${str[3]}"`)(
    _stringPositions
  ); //IIFE function
}
function addCardsToAppropriateCell() {
  cards.forEach((card) => {
    addCardToGridCell(card);
  });
}

function initializeCardPosition(card) {
  cardPositions.push(card.id);
}

//Creación de cartas
function createCards() {
  cardObjectDefinition.forEach((cardItem) => {
    createCard(cardItem);
  });
}
function createCard(cardItem) {
  //Elements that make up a card
  const _cardElem = createElement("section");
  const _cardInnerElem = createElement("article");
  const _cardFrontElem = createElement("div");
  const _cardBackElem = createElement("div");
  //Img elements for a card
  const _cardFrontImg = createElement("img");
  const _cardBackImg = createElement("img");
  //adding class and id to object card
  addID(_cardElem, cardItem.id);
  addClass(_cardElem, "card");
  addClass(_cardElem, "fly-in");

  addClass(_cardInnerElem, "card-inner");
  addClass(_cardFrontElem, "card-front");
  addClass(_cardBackElem, "card-back");
  //adding src and class to IMG elements
  addClass(_cardFrontImg, "card-img");
  addClass(_cardBackImg, "card-img");
  addSrc(_cardFrontImg, cardItem.imagePath);
  addSrc(_cardBackImg, cardBackImgPath);
  //adding children
  addChild(_cardFrontElem, _cardFrontImg);
  addChild(_cardBackElem, _cardBackImg);
  addChild(_cardInnerElem, _cardFrontElem);
  addChild(_cardInnerElem, _cardBackElem);
  addChild(_cardElem, _cardInnerElem);
  addCardToGridCell(_cardElem);
  initializeCardPosition(_cardElem);
  attachClickEventHandlerToCard(_cardElem);
}

function attachClickEventHandlerToCard(card) {
  card.addEventListener("click", () => chooseCard(card));
}

//Functions to help
function createElement(type) {
  return document.createElement(type);
}
function addClass(elem, nameClass) {
  elem.classList.add(nameClass);
}
function addID(elem, id) {
  elem.id = id;
}
function addSrc(img, src) {
  img.src = src;
}
function addChild(elem, child) {
  elem.appendChild(child);
}
function addCardToGridCell(card) {
  const areasClass = [
    ".card-pos-a",
    ".card-pos-b",
    ".card-pos-c",
    ".card-pos-d",
  ];
  const cardPositionByClass = document.querySelector(areasClass[card.id - 1]);
  addChild(cardPositionByClass, card);
}

//LOCAL STORAGE
function getSerializedJSON(obj) {
  return JSON.stringify(obj);
}
function getObjectFromJSON(string) {
  return JSON.parse(string);
}
function updateLocalStorage(key, value) {
  localStorage.setItem(key, value);
}
function getLocalStorageItemValue(key) {
  return localStorage.getItem(key);
}
function removeLocalStorageItem(key) {
  localStorage.removeItem(key);
}
function saveGameToLocalStorage(score, round) {
  GAME_OBJECT = { score: score, round: round };
  updateLocalStorage(gameKey, getSerializedJSON(GAME_OBJECT));
}
function checkForIncompleteGame() {
  const _serializedGameObj = getLocalStorageItemValue(gameKey);
  if (_serializedGameObj) {
    GAME_OBJECT = getObjectFromJSON(_serializedGameObj);
    if (GAME_OBJECT.round >= maxRounds) {
      removeLocalStorageItem(gameKey);
    } else {
      if (confirm("Would you like to continue with your last game?")) {
        score = GAME_OBJECT.score;
        round = GAME_OBJECT.round;
      }
    }
  }
}

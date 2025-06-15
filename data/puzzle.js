const board = document.getElementById('board');
const size = 3; // 4x4
const tiles = [];
let emptyX = size - 1;
let emptyY = size - 1;
const imageURL = 'image/puzzle1.jpg'; // 任意の画像ファイル名を指定（400x400）

function createTiles() {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.style.backgroundImage = `url(${imageURL})`;
      tile.dataset.x = x;
      tile.dataset.y = y;

      // 右下だけ空白にする
      if (x === size - 1 && y === size - 1) {
        tile.classList.add('empty');
        tile.style.backgroundImage = '';
        tile.addEventListener('click', () => moveTile(x, y));
      } else {
        const posX = x * -150;
        const posY = y * -150;
        tile.style.backgroundPosition = `${posX}px ${posY}px`;
        tile.addEventListener('click', () => moveTile(x, y));
      }

      tiles.push(tile);
      board.appendChild(tile);
    }
  }
}

function getIndex(x, y) {
  return y * size + x;
}

function moveTile(x, y) {
  const dx = Math.abs(x - emptyX);
  const dy = Math.abs(y - emptyY);

  console.log(`Moving tile at (${x}, ${y}) from empty position (${emptyX}, ${emptyY})`);

  if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
    const clickedTile = tiles[getIndex(x, y)];
    const emptyTile = tiles[getIndex(emptyX, emptyY)];

    // 入れ替え
    emptyTile.style.backgroundImage = clickedTile.style.backgroundImage;
    emptyTile.style.backgroundPosition = clickedTile.style.backgroundPosition;
    emptyTile.classList.remove('empty');

    clickedTile.style.backgroundImage = '';
    clickedTile.style.backgroundPosition = '';
    clickedTile.classList.add('empty');

    emptyX = x;
    emptyY = y;

    // クリア判定
    if (checkClear()) {
      setTimeout(() => {
        alert("完成！");
      }, 100);
    }

  }
}

function shuffleTiles() {
  for (let i = 0; i < 1000; i++) {
    const moves = getValidMoves();
    const move = moves[Math.floor(Math.random() * moves.length)];
    moveTile(move.x, move.y);
  }
}

function getValidMoves() {
  const moves = [];
  if (emptyX > 0) moves.push({ x: emptyX - 1, y: emptyY });
  if (emptyX < size - 1) moves.push({ x: emptyX + 1, y: emptyY });
  if (emptyY > 0) moves.push({ x: emptyX, y: emptyY - 1 });
  if (emptyY < size - 1) moves.push({ x: emptyX, y: emptyY + 1 });
  return moves;
}


function checkClear() {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = getIndex(x, y);
      const tile = tiles[index];

      if (x === size - 1 && y === size - 1) {
        if (!tile.classList.contains('empty')) return false;
      } else {
        const expectedX = x * -150 + 'px';
        const expectedY = y * -150 + 'px';
        if (tile.style.backgroundPosition !== `${expectedX} ${expectedY}`) {
          return false;
        }
      }
    }
  }
  $('#block').show();
  return true;
}

// 最初の描画
createTiles();
shuffleTiles();

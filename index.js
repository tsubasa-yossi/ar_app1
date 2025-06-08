// ======= index.js (Express + Socket.IO Server) =======
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static('data'));

// HTMLファイルのルーティング
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/index.html'));
});
app.get('/hacker.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/hacker.html'));
});
app.get('/runner.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/runner.html'));
});
app.get('/defender.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/defender.html'));
});
app.get('/viewer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/viewer.html'));
});


function initializeGameState() {
  return {
    teams: {
      A: { hacker: null, runners: [], defender: null },
      B: { hacker: null, runners: [], defender: null }
    },
    questions: {
    q_1 :{ text: "問題1の内容", answer: "正解", answered: false, team: null, point: 1 ,pointget: 0},
    q_2 :{ text: "問題2の内容", answer: "正解2", answered: false, team: null, point: 3 ,pointget: 0},

     // { questionId: { text, answered, team, correct } }
  }
  };
}

// ゲーム状態管理
let gameState = initializeGameState();

io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  socket.on('joinTeam', ({ team, role }) => {
    socket.team = team;
    socket.role = role;

    if (role === 'hacker') gameState.teams[team].hacker = socket.id;
    if (role === 'defender') gameState.teams[team].defender = socket.id;
    if (role === 'runner') gameState.teams[team].runners.push(socket.id);

    console.log(`ユーザー ${socket.id} がチーム ${team} の役割 ${role} で参加しました。`);
    socket.emit('roleConfirmed', { role });

  });

  socket.on('submitAnswer', ({ codeId, answer }) => {
    console.log(`回答提出: ${String(codeId)} by ${socket.id}, 回答: ${answer}`);
    let questionId = "q_" + String(codeId);
    let question = gameState.questions[questionId];
    // 質問が存在しない、または既に回答済みの場合は何もしない
    if (!question || question.answered) return;

    // 仮の答え合わせ処理（正答は"42"）
    if (answer === question.answer) {
      question.answered = true;
      question.team = socket.team;
      io.to(socket.id).emit('answerResult', { correct: true });
    } else {
      io.to(socket.id).emit('answerResult', { correct: false });
      io.to(socket.id).emit('freeze', { duration: 10000 });
    }
  });

  socket.on('scanAR', ({ codeId }) => {
    // 仮のARコード処理（ハズレ or 問題を出す）
    if (codeId.startsWith('bad')) {
      let hackerId = gameState.teams[socket.team].hacker;
      io.to(hackerId).emit('freeze', { duration: 10000 });
      return;
    }

    // 問題を割り当てる
    const questionId = "q_" + codeId;
    socket.emit('question', { questionId:questionId, text: gameState.questions[questionId].text });
  });

  socket.on('claimPoint', ({ questionId }) => {
    const question = gameState.questions[questionId];
    console.log(`ポイント請求: ${questionId} by ${socket.id}`);
    if (question && question.answered && question.team === socket.team) {
      question.pointget = question.point;
      socket.emit('pointClaimed', { success: true , point: question.point });
    } else {
      socket.emit('pointClaimed', { success: false, point: 0 });
    }
  });

  // ビューア用スコア送信
  socket.on('requestScore', () => {
    socket.emit('scoreData', gameState.questions);
  });

    // 管理者による状態リセット
  socket.on('resetGame', () => {
    gameState = initializeGameState();
    console.log('ゲーム状態がリセットされました');
    io.emit('scoreData', gameState.questions); // 全クライアントに即時反映
  });

});

server.listen(PORT, () => {
  console.log(`サーバー起動 http://localhost:${PORT}`);
});

// ======= index.js (Express + Socket.IO Server) =======
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static('public'));

// ゲーム状態管理
let gameState = {
  teams: {
    A: { hacker: null, runners: [], defender: null },
    B: { hacker: null, runners: [], defender: null }
  },
  questions: {
    q_1 :{ text: "問題1の内容", answer: "正解", answered: false, team: null, point: 1 }

  }, // { questionId: { text, answered, team, correct } }
};

io.on('connection', (socket) => {
  console.log('ユーザー接続:', socket.id);

  socket.on('joinTeam', ({ team, role }) => {
    socket.team = team;
    socket.role = role;

    if (role === 'hacker') gameState.teams[team].hacker = socket.id;
    if (role === 'defender') gameState.teams[team].defender = socket.id;
    if (role === 'runner') gameState.teams[team].runners.push(socket.id);

    socket.emit('roleConfirmed', { role });
  });

  socket.on('submitAnswer', ({ questionId, answer }) => {
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
      const hackerId = gameState.teams[socket.team].hacker;
      io.to(hackerId).emit('freeze', { duration: 10000 });
      return;
    }

    // 問題を割り当てる
    const questionId = 'q_' + codeId;
    // if (!gameState.questions[questionId]) {
    //   gameState.questions[questionId] = {
    //     text: `問題 ${codeId} の内容`,
    //     answered: false
    //   };
    // }
    socket.emit('question', { questionId, text: gameState.questions[questionId].text });
  });

  socket.on('claimPoint', ({ questionId }) => {
    const question = gameState.questions[questionId];
    if (question && question.answered && question.team === socket.team) {
      socket.emit('pointClaimed', { success: true });
    } else {
      socket.emit('pointClaimed', { success: false });
    }
  });
});

server.listen(PORT, () => {
  console.log(`サーバー起動 http://localhost:${PORT}`);
});

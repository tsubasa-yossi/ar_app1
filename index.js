var bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const cors = require('cors');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'data')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(cors({
    origin: '*', //アクセス許可するオリジン
    // credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
    // optionsSuccessStatus: 200, //レスポンスstatusを200に設定
    // methods: ["GET", "POST"],
    allowedHeaders:["Access-Control-Allow-Origin:*"]
}))


// ゲームイメージ
// 初期では中立の状態
// どちらかのチームが得点を100点獲得したら、所属がそのチームに以降する
// 所属後も奪還することは可能であるが、攻撃側は2点+、防御側は-1点
// 見事に攻撃側が100点になれば、奪還可能


var http = require('http').Server(app);
var io = require('socket.io')(http);
let marker_cnt = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]; // marker_cnt[team][marker_no]
let marker_state = [0,0,0,0,0]; // 0: neutral, 1: team1, 2: team2
let marker_no = 0;
let team = 0; // 初期はteam1
let state = 0;
let check_state = 0;


app.get('/', (req, res) => {
  // res.setHeader('Access-Control-Allow-Origin', '*')
  res.render('index.html');
});

// リアルタイムに各基地のダメージを表示するためのSocket.IOの設定
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('attack', function(msg){
    console.log('get attack message: team:' + msg['team'] + ' marker_no:' + msg['marker_no']);
    marker_no = msg['marker_no'];
    team = msg['team'];
    state = marker_state[marker_no-1];
    // 所属状態に応じて、ポイントを加算する
    if ( state == 0) {
      marker_cnt[team][marker_no-1]++;
      check_state = team;
    } else {
      check_state = state;
      if (team != state) {
        marker_cnt[state][marker_no-1] += 2; // 攻撃側は2点
      } else {
        marker_cnt[state][marker_no-1] -= 1; // 防御側は-1点
      }
    } 
    // ポイントを確認して所属を更新
    if (marker_cnt[check_state][marker_no-1] > 10) {
      marker_cnt[check_state][marker_no-1] = 0;
      marker_state[marker_no-1] = team; // 所属変更
      console.log('change marker_state: ' + marker_state[marker_no-1]);
    } else if (marker_cnt[check_state][marker_no-1] < 0) {
      marker_cnt[check_state][marker_no-1] = 0;
    }

    io.emit('attack', {"marker_state":marker_state,"marker_cnt":marker_cnt});
  });


  socket.on('reset', function(msg){
    console.log('reset message');
    marker_cnt = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]; // marker_cnt[team][marker_no]
    marker_state = [0,0,0,0,0]; // 0: neutral, 1: team1, 2: team2
    marker_no = 0;
    team = 0; // 初期はteam1
    state = 0;
    check_state = 0;
    io.emit('attack', {"marker_state":marker_state,"marker_cnt":marker_cnt});
  });

  socket.on('load', function(msg){
    io.emit('attack', {"marker_state":marker_state,"marker_cnt":marker_cnt});
  });

});




http.listen(port, () => console.log('Example app listening on port ' + port + '!'));
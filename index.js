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

var http = require('http').Server(app);
var io = require('socket.io')(http);
let cnt1 = 0;
let cnt2 = 0;
let cnt3 = 0;
let cnt4 = 0;
let cnt5 = 0;
let target_no = 0;


app.get('/', (req, res) => {
  // res.setHeader('Access-Control-Allow-Origin', '*')
  res.render('index.html');
});

// リアルタイムに各基地のダメージを表示するためのSocket.IOの設定
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('attack', function(msg){
    console.log('get attack message: ' + msg);
    target_no = msg;
    if (target_no == 1) {
        cnt1++;
        cnt1=check_hp(cnt1);
    } else if (target_no == 2) {
        cnt2++;
        cnt2=check_hp(cnt2);
    } else if (target_no == 3) {
        cnt3++;
        cnt3=check_hp(cnt3);
    } else if (target_no == 4) {
        cnt4++;
        cnt4=check_hp(cnt4);
    } else if (target_no == 5) {
        cnt5++;
        cnt5=check_hp(cnt5);
    }
    io.emit('attack', {
      "marker1":cnt1, "marker2":cnt2, "marker3":cnt3, "marker4":cnt4, "marker5":cnt5
    });
  });
});

var check_hp = function(cnt) {
  if (cnt > 30) {
    return 0;
  } else {
    return cnt;
  }
}


app.post('/marker/', (req, res) => {
  console.log(req.body.marker_no);
  target_no = req.body.marker_no;
    if (target_no == 1) {
        cnt1++;
        cnt1=check_hp(cnt1);
    } else if (target_no == 2) {
        cnt2++;
        cnt2=check_hp(cnt2);
    } else if (target_no == 3) {
        cnt3++;
        cnt3=check_hp(cnt3);
    } else if (target_no == 4) {
        cnt4++;
        cnt4=check_hp(cnt4);
    } else if (target_no == 5) {
        cnt5++;
        cnt5=check_hp(cnt5);
    }
  // res.send({
  //   "marker1":cnt1, "marker2":cnt2, "marker3":cnt3, "marker4":cnt4, "marker5":cnt5
  // });
});

app.post('/reset/', (req, res) => {
    console.log("reset target hp.");
    cnt1 = 0;
    cnt2 = 0;
    cnt3 = 0;
    cnt4 = 0;
    cnt5 = 0;
    res.send({
        "statuc": "success"
    });
});



http.listen(port, () => console.log('Example app listening on port ' + port + '!'));
const express = require('express')
const app = express()
const port = 3000
const path = require('path');
let cnt1 = 0;
let cnt2 = 0;
let cnt3 = 0;
let cnt4 = 0;
let cnt5 = 0;


app.use(express.static(path.join(__dirname, 'data')));

app.post('/marker1/', (req, res) => {
  console.log(req.body);
  cnt1++;
  console.log(cnt1);
  res.send({
    "marker1":cnt1, "marker2":cnt2, "marker3":cnt3, "marker4":cnt4, "marker5":cnt5,
  });
});
app.post('/marker2/', (req, res) => {
  console.log(req.body);
  cnt2++;
  console.log(cnt2);
  res.send({
    "marker1":cnt1, "marker2":cnt2, "marker3":cnt3, "marker4":cnt4, "marker5":cnt5,
  });
});

app.listen(port, () => console.log('Example app listening on port 3000!'))
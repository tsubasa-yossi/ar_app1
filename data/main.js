var target_url = "";
var marker_no = 0;
var target_marker_str = "";
var socket = io();
var point_top = 0;
var point_left = 0;
var point_img_str = ""
const target_lost_str = "target not found";
const let_attark_str = "Let's attack!";

document
.querySelector("#marker1")
.addEventListener("markerFound", (event) => {
    console.log("Marker Found1", event);
    marker_no = 1;
    $("#img_area").html('<img src="image/Japan.jpeg" class="anime">');
    $("#target_hp_area").text(let_attark_str);
});
document
.querySelector("#marker1")
.addEventListener("markerLost", (event) => {
    console.log("Marker Lost1", event);
    marker_no = 0;
    $("#img_area").html('');
    $("#target_hp_area").text(target_lost_str);
});

document
.querySelector("#marker2")
.addEventListener("markerFound", (event) => {
    console.log("Marker Found2", event);
    marker_no = 2;
    $("#img_area").html('<img src="image/British.jpeg" class="anime">');
    $("#target_hp_area").text(let_attark_str);
});
document
.querySelector("#marker2")
.addEventListener("markerLost", (event) => {
    console.log("Marker Lost2", event);
    marker_no = 0;
    $("#img_area").html('');
    $("#target_hp_area").text(target_lost_str);
});

document.getElementById("attack_button").addEventListener("click", function() {
    console.log("ボタンがクリックされました！", event);
    point_top = Math.floor( Math.random() * 40 ) + 20
    point_left = Math.floor( Math.random() * 50 ) + 20
    point_img_str = '<img src="image/teian.png" class="anime_teian" style="top: ' + point_top + '%; left: ' + point_left + '%;">';
    console.log("point image : ", point_img_str);
    $("#img_point").html(point_img_str);
    if (marker_no !=0){
        socket.emit('attack', marker_no);
    }
});

socket.on('attack', function(res){
    console.log(res);
    target_marker_str = "marker" + marker_no;
    $("#target_hp_area").text("トータルダメージ: " + res[target_marker_str]);
});

document.getElementById("reset_button").addEventListener("click", function() {
    console.log("リセットボタンがクリックされました！", event);
    socket.emit('reset');
});

var chessBoard = [];
var me = true;
var over = false;

//赢法数组
var wins = [];
var myWin = [];
var computerWin = [];
var tip = document.getElementById("tips");
var color = true;


for (var i = 0; i < 15; i++) {
    chessBoard[i] = [];
    for (var j = 0; j < 15; j++) {
        chessBoard[i][j] = 0;
    }
}

for (i = 0; i < 15; i++) {
    wins[i] = [];
    for (j = 0; j < 15; j++) {
        wins[i][j] = [];
    }
}
// 穷举赢法数目
var count = 0;
for (i = 0; i < 15; i++) {
    for (j = 0; j < 11; j++) {
        for (var k = 0; k < 5; k++) {
            wins[i][j + k][count] = true;
        }
        count++;
    }
}
for (i = 0; i < 15; i++) {
    for (j = 0; j < 11; j++) {
        for (k = 0; k < 5; k++) {
            wins[j + k][i][count] = true;
        }
        count++;
    }
}
for (i = 0; i < 11; i++) {
    for (j = 0; j < 11; j++) {
        for (k = 0; k < 5; k++) {
            wins[i + k][j + k][count] = true;
        }
        count++;
    }
}
for (i = 0; i < 11; i++) {
    for (j = 14; j > 3; j--) {
        for (k = 0; k < 5; k++) {
            wins[i + k][j - k][count] = true;
        }
        count++;
    }
}
console.log(count);

for (i = 0; i < count; i++) {
    myWin[i] = 0;
    computerWin[i] = 0;
}

var chess = document.getElementById("chess");
var context = chess.getContext('2d');
context.strokeStyle = "#BFBFBF";

//为底部添加水印
var logo = new Image();
logo.src = "images/logo.png";
logo.onload = function () {   //渲染完加载水印
    context.drawImage(logo, 0, 0, 450, 450);
    drawChessBoard();
};

/**
 * 打开ws连接
 */
//输入游戏名后连接游戏
socket = new WebSocket('ws://119.29.37.33:9501/');  //监听端口
socket.onopen = function () {  //监听是否连接服务器成功触发
    socket.send('1');
};
/**
 * 接收信息监听
 * */
socket.onmessage = function (event) {  // **接收到服务器数据**触发
    var data = JSON.parse(event.data);
    if (data.status == '1') {
        if (data.type == '1') {
            tip.innerHTML = '当前你为黑棋';
            me = true;
        } else {
            tip.innerHTML = '当前你为白棋';
            me = false;
        }
    } else if (data.status == '2') {
        tip.innerHTML = '游戏开始';
    } else if (data.status == '3') {
        over = false;   //解除锁定
        oneStep(Math.floor(parseInt(data.x) / 30), Math.floor(parseInt(data.y) / 30), !me);  //另一方下棋
        isFinished(Math.floor(parseInt(data.x) / 30), Math.floor(parseInt(data.y) / 30));
    } else if (data.status == '4') {
        alert("对方断线，你赢了");
    } else if (data.status == '5') {
        socket.close();
        alert(((data.type == '1') ? '黑' : '白') + '棋赢了');
    } else {
        alert('抱歉，游戏已满人');
    }
};

socket.onclose = function () {  //与服务器连接断开触发
    tip.innerHTML = '游戏房间关闭，请刷新重新进入';
};
socket.onerror = function () { //与服务器连接出现错误触发
    console.log('Error!');
};


var drawChessBoard = function () {
    for (var i = 0; i < 15; i++) {
        //横线
        context.moveTo(15 + i * 30, 15);
        context.lineTo(15 + i * 30, 435);
        context.stroke();
        //纵线
        context.moveTo(15, 15 + i * 30);
        context.lineTo(435, 15 + i * 30);
        context.stroke();
    }
};

var oneStep = function (i, j, me) {
    context.beginPath();
    context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
    context.closePath();
    var gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 50, 200, 200, 20);
    if (me) { //黑
        gradient.addColorStop(0, "#0A0A0A");
        gradient.addColorStop(0, "#636766");
    } else { //白
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(0, "#F9F9F9");
    }
    context.fillStyle = gradient;
    context.fill();
};

chess.onclick = function (e) {
    if (over) {
        return;
    }
    var x = e.offsetX;
    var y = e.offsetY;
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);
    if (chessBoard[i][j] == 0) {
        oneStep(i, j, me);
        socket.send('{"status":"3","x":"' + x + '","y":"' + y + '"}');
        over = true;  //暂停按键
        isFinished(i, j);   //是否结束  接收来自socket时需要将me转换
    }
};

/**
 * 判断是否结束
 */
var isFinished = function (i, j) {
    if (color) {
        chessBoard[i][j] = 1;
        for (var k = 0; k < count; k++) {   //黑棋
            if (wins[i][j][k]) {
                myWin[k]++;
                computerWin[k] = 6;
                if (myWin[k] == 5) {
                    socket.send('{"status":"5","":"1"}');
                    socket.close();
                    window.alert("黑棋赢了!");
                    over = true;
                }
            }
        }
    } else {
        chessBoard[i][j] = 2;
        for (k = 0; k < count; k++) {
            if (wins[i][j][k]) {
                computerWin[k]++;
                myWin[k] = 6;
                if (computerWin[k] == 5) {  //白棋
                    socket.send('{"status":"5","type":"0"}');
                    window.alert("白棋赢了!");
                    over = true;
                }
            }
        }
    }
    color = !color;
};

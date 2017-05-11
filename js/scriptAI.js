var chessBoard = [];
var me = true;
var over = false;

//赢法数组
var wins = [];
var myWin = [];
var computerWin = [];

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

//TODO:①监听接收数据，首先进入时会接收该子是黑还是白，然后设置me为true或false,
//TODO:③监听坐标数据，并调用oneStep与is_Finished进行填充显示

/**
 * 点击事件
 * @param e
 */
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
        //TODO：②点击click事件后 ws.send("xxx坐标");
        isFinished();   //是否结束  接收来自socket时需要将me转换
    }
};

/**
 * 判断是否结束
 */
var isFinished = function () {
    if (me) {
        chessBoard[i][j] = 1;
        for (var k = 0; k < count; k++) {   //黑棋
            if (wins[i][j][k]) {
                myWin[k]++;
                computerWin[k] = 6;
                if (myWin[k] == 5) {
                    window.alert("你赢了!");
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
                    window.alert("计算机赢了!");
                    over = true;
                }
            }
        }
    }
    me = !me;
};



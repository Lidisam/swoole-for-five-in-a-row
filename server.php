<?php


class WebSocket
{
    /**
     * 配置信息
     * @var
     */
    private $server;
    private $port;
    private $players = [];
    private $reject = true;   //暂时拒接所有连接

    function __construct($port)
    {
        $this->port = $port;
        $this->init();
    }


    /**
     * 初始化服务
     */
    public function init()
    {
        /*********启动服务**********/
        $this->server = $server = new swoole_websocket_server('0.0.0.0', $this->port);
        $this->server->set([
            'worker_num' => 2,
            'daemonize' => true, //是否作为守护进程
        ]);
        $this->server->on('open', [$this, 'open']);
        $this->server->on('message', [$this, 'message']);
        $this->server->on('close', [$this, 'close']);
        $this->server->start();
    }

    /**
     * 监听连接
     * @param swoole_websocket_server $server
     * @param swoole_http_request $req
     */
    public function open(swoole_websocket_server $server, swoole_http_request $req)
    {
        echo "\n connection open: " . $req->fd . "\n";
        if (count($this->players) < 2 && $this->reject) {
            $this->players[$req->fd] = $req->fd;
            //1:黑棋，2白棋
            $server->push((int)$req->fd, '{"status":"1","type":"' . count($this->players) . '"}');
            if (count($this->players) == 2) {
                sleep(2);
                foreach ($server->connections as $k => $v) {
                    $server->push($v, '{"status":"2"}');   //广播当前用户游戏开始
                }
            }
        } else {
            //游戏人员已满
            $server->push((int)$req->fd, '{"status":"6"}');
            sleep(1);
            $server->close($req->fd);
        }
    }

    /**d
     * 监听socket信息
     * @param swoole_websocket_server $server
     * @param swoole_websocket_frame $frame
     */
    public function message(swoole_websocket_server $server, swoole_websocket_frame $frame)
    {
        $val = json_decode($frame->data, true);
        //接收另一方下棋信息
        if (in_array($val['status'], ['3', '5'])) {
            foreach ($server->connections as $k => $v) {
                if ($v != $frame->fd)
                    $server->push($v, $frame->data);
            }
        }
    }

    /**
     * 监听连接断开
     * @param swoole_websocket_server $server
     * @param $fd
     */
    public function close(swoole_websocket_server $server, $fd)
    {
        unset($this->players[$fd]);
        $temp_fd = '';
        if (count($this->players) == 1) { //如果尚有数据且删除了一个的话
            foreach ($server->connections as $k => $v) {
                if ($v != $fd) {
                    $server->push($v, '{"status":"4"}');
                    $temp_fd = $v;
                    $this->reject = false;   //为关闭期间拒接其他连接
                }
            }
            sleep(1);
            $server->close($temp_fd);
            $this->reject = true;   //关闭之后重新开启连接
        }

    }
}

new WebSocket(9501);
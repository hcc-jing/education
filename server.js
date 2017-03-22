var moment          = require("moment");
var WebSocketServer = require('ws').Server
    , wss           = new WebSocketServer({port: 8181});
var clients_list    = {}, total = 0, text_tal = 0, user_list = [], clients = [];
wss.on('connection', function (ws) {
    ws.on("open", function () {
        try {
            // 上报统计信息
            reportStatisticInfo();
        } catch (err) {
            console.log("error the message!" + err.stack);
        }
    });
    ws.on('message', function (message) {
        try {
            var obj  = JSON.parse(message);
            var time = moment().format("YYYY-MM-DD HH:mm:ss");
            if (obj.type == "login") {
                if (obj.LOGIN_SWITCH == "0") {
                    ws.id = "7100058" + total;
                    clients.push(ws);
                    save_user(message, ws.id);
                    var u_list      = get_client();
                    obj.client_list = u_list;
                    obj.time        = time;
                    obj.client_id   = ws.id;
                    send_all(JSON.stringify(obj));
                } else {
                    ws.id = "7100058" + total;
                    clients.push(ws);
                    save_user(message, ws.id);
                    var u_list      = get_client();
                    obj.client_list = u_list;
                    obj.type        = "re_login";
                    send_all(JSON.stringify(obj));
                }
                
            }
            if (obj.type == "say") {
                var b = find_user(obj.roleid);
                if (b) {
                    var data = set_msg(message, b.client_id);
                }
                if (obj.shstatus == 0) {
                    for (var k in user_list) {
                        if (user_list[k].adminid == 1) {
                            for (var i in clients) {
                                if (clients[i].id == user_list[k].client_id) {
                                    clients[i].send(JSON.stringify(data));
                                }
                            }
                        }
                    }
                } else {
                    send_all(JSON.stringify(data));
                }
            }
            if (obj.type == "siliao") {
            }
            if (obj.type == "deleteliaotian") {
                var lid      = JSON.parse(message);
                var dele_msg = {"type": "deleteliaotian", "lid": lid.lid};
                send_all(JSON.stringify(dele_msg));
            }
            if (obj.type == "shenhe") {
                var data = sh_data(message);
                send_all(JSON.stringify(data));
                //log(data);
            }
            if (obj.type == "sendflower") {
                var flo    = JSON.parse(message);
                var flower = {"type": "say", "content": flo.sh_content, "username": "系统提示"};
                send_all(JSON.stringify(flower));
            }
            if(obj.type == "logout"){
                var obj = JSON.parse(message);
            }
        } catch (err) {
            console.log(err.stack);
        }
    });
    ws.on('close', function () {
        var time   = moment().format("YYYY-MM-DD HH:mm:ss");
        //var client = find_client(ws.id);
        var outid = "";
        for(var k in user_list){
            if(user_list[k].client_id == ws.id){
                outid = user_list[k];
            }
        }
        delete_client(ws.id);
        var u_list = get_client();
        if (outid) {
            var data = {
                "type": "logout",
                "from_client_id": outid.client_id,
                "from_client_name": outid.client_name,
                "mid":outid.mid,
                "client_list":u_list,
                "time": time
            };
            send_all(JSON.stringify(data));
        }
        
    });
    ws.on('error', function (err) {
        log(err);
    });
});
setInterval(function () {
    ping();
}, 50000);
function sh_data(message) {
    var a = JSON.parse(message);
    var b = find_user(a.mid);
    if (typeof(a.tomid) == "number" && a.tomid != 0) {
        var c    = find_user(a.tomid);
        var t_id = c.client_id;
    } else {
        var t_id = "all";
    }
    var data = {
        "adminid": a.adminid,
        "content": a.sh_content,
        "from_clietn_id": b.client_id,
        "from_client_name": a.username,
        "lid": a.lid,
        "mid": a.mid,
        "quanping": 0,
        "shstatus": a.shatatus,
        "time": new Date().getTime() / 1000,
        "to_client_id": t_id,
        "toadminid": a.toadminid,
        "tousername": a.tousername,
        "type": "say",
        "username": a.username
    };
    return data;
}
function find_client(wid) {
    var data = "";
    log(wid);
    if (user_list.length > 0) {
        for (var k in user_list) {
            log(user_list);
            if (user_list[k].client_id == wid) {
                log(user_list[k]);
                return user_list[k];
            } else {
                log('not find!');
                return false;
            }
        }
    }
}
function delete_client(wid) {
    for (var k in user_list) {
        if (user_list[k].client_id == wid) {
            delete(user_list[k]);
        }
    }
    for (var i in clients) {
        if (clients[i].id == wid) {
            delete(clients[i]);
        }
    }
}
function send_all1(data) {
    for (var k in clients) {
        if (clients[k].readyState != 1) {
            delete(clients[k]);
            log("cliente not opened!");
        } else {
            for (var i in user_list) {
                if (user_list[i].wid == clients[k].id) {
                    clients[k].send(data);
                }
            }
        }
    }
}
//群发信息
function send_all(data) {
    for (var i in clients) {
        if (clients[i].readyState == 1) {
            clients[i].send(data);
        } else {
            log("cliente not opened!");
            delete(clients[i]);
        }
    }

}
//获取用户列表
function get_client() {
    var data = {};
    if (user_list.length > 0) {
        for (var k in user_list) {
            data[user_list[k].client_id] = user_list[k].client_list;
        }
    }
    return data;
}
function in_user(mid,wid){
    if (user_list.length > 0) {
        for (var k in user_list) {
            if (user_list[k].mid == mid && user_list[k].client_id == wid) {
                return k;
            }else{
                return false;
            }
        }
    }else{
        return false;
    }
}
//保存用户信息
function save_user(message, wid) {
    var obj = JSON.parse(message);
    var u = in_user(obj.mid,wid);
    if(u){
        user_list[u].client_id = wid;
    }else{
        var data = {
            "client_id": wid,
            "mid": obj.mid,
            "client_name": obj.client_name,
            "adminid": obj.adminid,
            "client_list": JSON.parse(message)
        };
        user_list.push(data);
        total++;
    }
}
function find_user(mid) {
    var data = '';
    if (user_list.length < 1) {
        log("user_list is null");
        return false;
    }
    for (var k in user_list) {
        if (user_list[k].mid == mid) {
            data = user_list[k];
        }
    }
    return data;
}
function ping() {
    var data = {"type": "ping"};
    for (var k in clients) {
        if (clients[k].readyState != 1) {
            delete(clients[k]);
        }
    }
    send_all(JSON.stringify(data));
}
function log(val) {
    return console.log(val);
}
function set_msg(message, cid) {
    var obj  = JSON.parse(message);
    var data = {
        "adminid": obj.roleaid,
        "from_client_id": cid,
        "from_client_name": obj.username,
        "time": new Date().getTime() / 1000,
        "lid": obj.lid,
        "mid": obj.roleid,
        "username": obj.rolename,
        "toadminid": obj.toadminid,
        "tomid": obj.tomid,
        "tousername": obj.tousername,
        "content": obj.content,
        "shstatus": obj.shstatus,
        "quanping": obj.quanping,
        "type": obj.type,
    };
    return data;
}
function censor(censor) {
    var i = 0;
    return function (key, value) {
        if (i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) {
            return '[Circular]';
        }
        if (i >= 29) // seems to be a harded maximum of 30 serialized objects?
        {
            return '[Unknown]';
        }
        ++i; // so we know we aren't using the original object anymore
        return value;
    }
}

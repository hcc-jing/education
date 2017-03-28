$(function () {
    init();
    $(".liaotian_right div").dblclick(function () {
        $.fancybox($(this).html(), {
            scrolling: "no",
            padding: 20,
            transitionIn: "none",
            transitionOut: "none"
        })
    });
    if (ADMINID == 14) {

        if (VIEWSTATUS != '0') {
            setTimeout('clearVideo()', 60 * VIEWTIME * 1000);
        }
    } else {
        setInterval(addFlower, 60 * 20 * 1000);
    }
    $(".zaixian_tit a").click(function () {
        $(".zaixian_tit a").removeClass("on");
        $(this).addClass("on");
        if ($.trim($("#user_select.on").text()) == "我的客户") {
            $('#users_online li').each(function () {
                if ($(this).attr('tuijianmid') != MID) {
                    $(this).hide();
                }
            });
        } else if ($.trim($("#user_select.on").text()) == "在线主播") {
            $('#users_online li').each(function () {
                if ($(this).attr('uid') != TUIJIANMID) {
                    $(this).hide();
                    $('#mykefu').show();
                }
            });
        } else {
            $('#users_online').show();
            $('#mykefu').hide();
            $('#users_online li').show();
        }
    });
    $("#liaotianlist").scroll(function () {
        var viewH     = $(this).height();        
        var contentH  = $(this).scrollHeight;//内容高度
        var scrollTop = $(this).scrollTop();
        if (viewH >= scrollTop) {
            $(".load_more").show('fast')
        } else {
            $(".load_more").hide('fast')
        }
    });
    initKecheng();//初始化课程表
    $(".kechengtitle li").click(function () {
        $(".kechengtitle li").removeClass("on");
        $(this).addClass("on");
        $('.kechengopenbox .kechengboxlist').hide();
        $('.kechengopenbox .kechengboxlist').eq($(this).index()).show();
    });
    //var istime = setInterval(init,3000);
});
function formatDate(now) {
    var year   = now.getYear();
    var month  = now.getMonth() + 1;
    var date   = now.getDate();
    var hour   = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (second < 10) {
        second = '0' + second;
    }
    return hour + ":" + minute + ":" + second;
}
function print_r(theObj) {
    var retStr = '';
    if (typeof theObj == 'object') {
        retStr += '<div style="font-family:Tahoma; font-size:7pt;">';
        for (var p in theObj) {
            if (typeof theObj[p] == 'object') {
                retStr += '<div><b>[' + p + '] => ' + typeof(theObj) + '</b></div>';
                retStr += '<div style="padding-left:25px;">' + print_r(theObj[p]) + '</div>';
            } else {
                retStr += '<div>[' + p + '] => <b>' + theObj[p] + '</b></div>';
            }
        }
        retStr += '</div>';
    }
    return retStr;
}
function init() {
    //ws = new WebSocket("ws://118.244.214.62:8852");
    ws = new WebSocket("ws://127.0.0.1:8181");
    //var ws = io.connect('ws://127.0.0.1:8855');
    //console.log("ws://"+WS_HOST+":"+WS_PORT);
    // 创建websocket
    // 当socket连接打开时，输入用户名

    ws.onopen    = function () {
        timeid && window.clearInterval(timeid);
        if (!USERNAME) {
            window.location.reload();
            return ws.close();
        }
        if (reconnect == false) {
            // 登录
            var login_data = JSON.stringify({
              "type": "login",
              "client_name": USERNAME,
              "room_id": FID,
              "mid": MID,
              "adminid": ADMINID,
              "tuijianmid": TUIJIANMID,
              "tuijianusername": TUIJIANUSERNAME,
              "tuijianadminid": TUIJIANADMINID,
              "login_count": LOGIN_COUNT,
              "LOGIN_SWITCH": LOGIN_SWITCH
            });
            //console.log("websocket握手成功，发送登录数据:" + login_data);
            ws.send(login_data);
            reconnect = true;
        }
        else {
            // 断线重连
            var relogin_data = JSON.stringify({
              "type": "login",
              "client_name": USERNAME,
              "room_id": FID,
              "mid": MID,
              "adminid": ADMINID,
              "tuijianmid": TUIJIANMID,
              "tuijianusername": TUIJIANUSERNAME,
              "tuijianadminid": TUIJIANADMINID,
              "login_count": LOGIN_COUNT
            });
            //console.log("websocket握手成功，发送重连数据:" + relogin_data);
            ws.send(relogin_data);
        }
    };
    // 当有消息时根据消息类型显示不同信息
    ws.onmessage = function (e) {      
        var data = JSON.parse(e.data);
        var fangjianid = $("#mythisroom").val();
        switch (data.type) {
            // 服务端ping客户端
            case 'ping':
                ws.send(JSON.stringify({"type": "pong"}));
                break;
                ;
            // 登录 更新用户列表
            case 'login':
                //{"type":"login","client_id":xxx,"client_name":"xxx","client_list":"[...]","time":"xxx"}
                //  alert(data.client_list[0]['adminid']);
                if (LOGIN_TIP == 1) {
                    $('#liaotianlist').append('<div class="liaotian">  <div class="liaotian_right fl"><div>' + data.client_name + '加入了聊天室</div></div></div>');
                }
                if ($("#liaotianlist .liaotian").length > 30) {
                    $("#liaotianlist .liaotian:lt(1)").remove();
                }
                if ($('.bar_gundong').attr('checked')) {
                    $('#liaotianlist').animate({scrollTop: $('#liaotianlist')[0].scrollHeight}, 1000);
                }
                //$("body").html(data.client_list+"<br/><pre>"+print_r(data.client_list));
                //return false;
                flush_client_list(data.client_list);
                break;
            // 断线重连，只更新用户列表
            case 're_login':
                //{"type":"re_login","client_id":xxx,"client_name":"xxx","client_list":"[...]","time":"xxx"}
                flush_client_list(data.client_list);
                //console.log(data['client_name'] + "重连成功");
                break;
            // 登录出错
            case 'login_error':
                alert('对不起，系统检测您的账号已处于登录状态');
                window.location.href = '/sys/off.php';
                break;
            // 发言
            case 'say':
                //{"type":"say","from_client_id":xxx,"to_client_id":"all/client_id","content":"xxx","time":"xxx"}
                say(data,"good");
                //alert(data);
                //console.log(data);
                break;
            // 私聊
            case 'siliao': //{"type":"say","from_client_id":xxx,"to_client_id":"all/client_id","content":"xxx","time":"xxx"}
                //alert(data);
                siliao(data);
                break;
            case 'pubclear':
                $('#liaotianlist').html('');
                break;
            case 'tuijian':
                if (ADMINID == 14 && TUIJIANMID != data.mid && data.mid) {
                    TUIJIANMID = data.mid;
                    $.get("action.php?type=changetuijian", {mid: data.mid}, function (data, status) {
                    });
                }
                break;
            case 'deleteliaotian':
                $("#" + data.lid).remove();
                break;
            case 'logout':
                //{"type":"logout","client_id":xxx,"time":"xxx"}
                //  say(data['from_client_id'], data['from_client_name'], data['from_client_name']+' 退出了', data['time']);
                $("#users_online li").each(function () {
                    if ($(this).attr('uid') == data.mid) {
                        $(this).remove();
                        return false;
                    }
                });
                flush_client_list(data.client_list);
                //$(".renshu b").html("人员");
                $(".renshu b").html(parseInt($("#users_online li").length));
                $(".renshu sj span").html(parseInt($("#users_online li").length))
        }
    };
    ws.onclose   = function () {
        //console.log("连接关闭，定时重连");
        // 定时重连
        window.clearInterval(timeid);
        timeid = window.setInterval(init, 3000);
    };
    ws.onerror   = function () {
        // alert("出现错误");
        window.setTimeout(init, 3000);
    };
}
/*function init(){
    this.socket = io.connect('ws://127.0.0.1:8850');
    
    //告诉服务器端有用户登录
    this.socket.emit('login', {userid:1, username:"123"});
    
    //监听新用户登录
    this.socket.on('login', function(o){
        console.log(o);
    });
    
    //监听用户退出
    this.socket.on('logout', function(o){
        console.log(o);
    });
    
    //监听消息发送
    this.socket.on('message', function(obj){
        
        
    });
    
}*/
function haibao() {
    var pics = $('.set_pic').val();
    $('.haibao #welcome').attr('src', pics);
    $('.haibao').show();
}
function clearVideo() {
    video_html = '<p style="margin-top:350px;">对不起，您的观看时间已到，请联系客服后继续观看</p>';
    $(".shipinchuangkou").html(video_html);
    $.cookie('clearvideo', true, {expires: 1});
}
function addliaotian() {
    WAIT       = FAYAN_LIMIT;

    var roorid = $("#mythisroom").val();
    var tomid, tousername, gid, togid, myadminid;
    var fangjianid = $("#mythisroom").val();
    var siliao = 0;
    if (ADMINID == 14 && WAIT > 0 && WAIT != FAYAN_LIMIT) {
        $("#ts").click();
        return false;
    }
    var content = $('#send_input').getContent();
    $('#send_input').setContent('');
    //console.log(content);
    tomid      = TOMID;
    tousername = TOUSERNAME;
    gid = (ADMINID == 14) ? 1 : "";
    myadminid = ADMINID;
    if ($('#Y_iSend_Input2').text()) {
        content = $('#Y_iSend_Input2').text();
        $('#Y_iSend_Input2').html('');
        siliao = 1;
        togid  = TOADMINID;
    } else {
        tomid       = $('#send_talkto').val();
        tousesrname = $('#send_talkto option[selected]').attr('uname');
        togid       = $('#send_talkto option[selected]').attr('adminid');
    }

    var quanping = $('.bar_quanping').attr('checked') ? 1 : 0;
    if (!content) {
        return false;
    }

    //console.log(gid);
    var roleid   = $("#role_select option:selected").attr('uid');
    var rolename = $("#role_select").val();
    var roleaid  = $("#role_select option:selected").attr('aid');
    if(roleid == undefined){
        var roleid   = MID;
        var rolename = USERNAME;
        var roleaid  = ADMINID;
    }
    
    $.ajax({
              url: ADDCHAT,
              type: "POST",
              async: true,
              data: {
                   content: content,
                   username: USERNAME,
                   mid: MID,
                   tomid: tomid,
                   gid:gid,
                   tousername: tousername,
                   togid: togid,
                   myadminid: myadminid,
                   siliao: siliao,
                   roleid: roleid,
                   roomid:roorid,
                   rolename: rolename,
                   roleaid: roleaid
              },
              dataType: "json",
              error: function () {
                  // alert('Error loading XML document');
              },
              success: function (data) {//如果调用php成功
                   if (data.content) {
                        if (siliao) {
                          ws.send(JSON.stringify({
                            "type": "siliao",
                            "tomid": data.tomid,
                            "tousername": data.tousername,
                            "toadminid": data.toadminid,
                            "content": data.content,
                            "roleid": roleid,
                            "rolename": rolename,
                            "roleaid": roleaid
                          }));
                        } else {
                           if (quanping) {
                               data.quanping = 1;
                           }
                           say(data,"done");
                           //alert("tomid:"+data.tomid+" tousername:"+data.tousername+" toadminid:"+data.toadminid+" lid:"+data.lid+" quanping:"+quanping+" content:"+data.content2+" shstatus:"+data.shstatus+" roleid:"+roleid+" rolename:"+rolename+" roleaid:"+roleaid);
                           ws.send(JSON.stringify({
                              "type": "say",
                              "tomid": data.tomid,
                              "tousername": data.tousername,
                              "toadminid": data.toadminid,
                              "lid": data.lid,
                              "fid":roorid,
                              "togid":togid,
                              "quanping": quanping,
                              "content": data.content2,
                              "shstatus": data.shstatus,
                              "roleid": roleid,
                              "rolename": rolename,
                              "roleaid": roleaid
                          }));//socket发送公聊信息//socket发送公聊信息
                       }
                   } else if (data == 'iphei') {
                       window.location.reload();
                       notice('对不起，因为您多次违规操作使用名师大课堂直播室，管理员已对您进行请出直播室处理！');
                   } else if (data == 'shenhe') {
                       notice('消息审核中。。。');
                   } else if (!isNaN(data)) {
                       WAIT = data;
                       $("#ts").click();
                   } else if (data == 'jinyan') {
                       notice('对不起，您所在的用户组不允许发言');
                   }
               }
           });
    if (!limitCount) {
        limitCount = setInterval(fayanLimit, 1000);
    }
}
// 刷新用户列表框
function flush_client_list(client_list) {
    //alert(client_list);
    if (!client_list) {
        return false;
    }
    var thisroom = $('#mythisroom').val();

    var myurl = window.location.host;
    var imgurl = myurl+'/addons/theme/stv1/_static/style/level';
    $.each(client_list, function (k, v) {
        if(thisroom == v['room_id']) {
          //  alert(JSON.stringify(v));
          if ($("#users_online li[uid='" + v['mid'] + "']").length > 0) {
              $("#users_online  li[uid='" + v['mid'] + "'] .u_l").html('(' + v['login_count'] + ')');
              return true;
          }
          var hasInsert   = 0;
          var user_pingbi = '';
          var userhide    = '';
          if (ADMINID == 3 && $.trim($("#user_select.on").text()) == "我的客户" && v['tuijianmid'] != MID) {
              var userhide = 'style="display:none"';
          }
          if (ADMINID > 3 && $.trim($("#user_select.on").text()) == "在线主播" && v['mid'] != TUIJIANMID) {
              var userhide = 'style="display:none"';
          }
          if (ADMINID == '1' && MID != v['mid']) {
              var u_l     = '<span class="u_l">(' + v['login_count'] + ')</span>';
              var ban_str = '<a href="javascript:void(0)" class="ipban" onclick="ipban()">封IP</a><a class="pingbi">屏蔽</><a href="javascript:void(0)" onclick="pingbi(1)">1小时/</a> <a href="javascript:void(0)"  onclick="pingbi(2)">1天/</a><a href="javascript:void(0)" onclick="pingbi(3)">1周/</a><a href="javascript:void(0)" onclick="pingbi(4)">1个月</a>';
          } else if (ADMINID == '2' && MID != v['mid']) {
              var u_l     = '';
              var ban_str = '<a href="javascript:void(0)" class="ipban" onclick="ipban()">封IP</a><a class="pingbi">屏蔽</><a href="javascript:void(0)" onclick="pingbi(1)">1小时/</a> <a href="javascript:void(0)"  onclick="pingbi(2)">1天/</a><a href="javascript:void(0)" onclick="pingbi(3)">1周/</a><a href="javascript:void(0)" onclick="pingbi(4)">1个月</a>';
          } else if (ADMINID == '3' && MID != v['mid']) {
              var u_l     = '<span class="u_l">(' + v['login_count'] + ')</span>';
              var ban_str = '<a class="pingbi">屏蔽</><a href="javascript:void(0)" onclick="pingbi(1)">1小时/</a> <a href="javascript:void(0)"  onclick="pingbi(2)">1天/</a><a href="javascript:void(0)" onclick="pingbi(3)">1周/</a><a href="javascript:void(0)" onclick="pingbi(4)">1个月</a>';
          } else {
              var u_l     = '';
              var ban_str = '';
          }
          if (v['mid'] == TUIJIANMID || v['tuijianmid'] == MID || v['adminid'] == 1 || ADMINID == 1) {
            if(MID != v['mid']) {
              var sayto_str = '<a href="javascript:void(0)" class="talkto" onclick="sayTo(this)">对TA说</a>';
            }else{
              var sayto_str = '';
            }
          } else {
              var sayto_str = '';
          }
          var str = '<li uid="' + v['mid'] + '" uname="' + v['client_name'] + '" adminid="' + v['adminid'] + '"  tuijianmid="' + v['tuijianmid'] + '" onclick="UBase_Click(this)" ' + userhide + '>  <a href="javascript:void(0)">' + v['client_name'] + u_l + '</a> <span><img src="http://'+imgurl+'/User' + v['adminid'] + '.png"></span> <p>' + sayto_str + ban_str + '</p></li>';
          if ($("#users_online  li").length > 0) {
              $("#users_online  li").each(function () {
                  if (parseInt($(this).attr('adminid')) > parseInt(v['adminid'])) {
                      $(this).before(str);
                      hasInsert = 1;//标记是否插入数据
                      return false;
                  }
              });
          }
        }
        if (!hasInsert) {
            $("#users_online").append(str);
        }
    });
    //$(".renshu b").html(parseInt($(".renshu").attr('rel')) + parseInt($("#users_online li").length));
    //$(".renshu b").html("人员");
    $(".renshu b").html(parseInt($("#users_online li").length));
    $(".renshu sj span").html(parseInt($("#users_online li").length))
}
// 发言
function say(data,fangjianid) {
  // $("#roomname").val("");
    var myroom  = $("#mythisroom").val(); 
    var t       = $('#liaotianlist');
    var d       = new Date(parseInt(data.time) * 1000);

    var shijian = formatDate(d);
    
    var sh_str  = '';
    if ((ADMINID == 3 || ADMINID == 1) && data.shstatus == "0") {
        sh_str = '<a href="javascript:void(0)" rel="' + data.lid + '" onclick="liaotianShenhe(this)" class="lt_sh">审核</a>'
    }
    if (ADMINID == 3 || ADMINID == 1) {
        sh_str += '<a href="javascript:void(0)"; rel="' + data.lid + '" onclick="liaotianDel(this)" class="lt_del">删除</a>'
    }
    if ((ADMINID == 3 || ADMINID == 1) && data.shstatus == "1") {
        if ($(".lt_sh[rel='" + data.lid + "']").length > 0) {
            $(".lt_sh[rel='" + data.lid + "']").remove();
            return false;
        }
    }
    if ($(".liaotian[id='" + data.lid + "']").length > 0 && data.lid) {
        return false;
    }
    if (data.username != '交易提示' && data.username != '系统提示') {
        if (data.tomid && data.tomid != "null" && data.tomid != "undefined" && data.tomid != "0") {
            var To_str = '<a class="user_to">对</a><img src="' + THEME + '/style/level/User' + data.togid + '.png"/><a href="javascript:void)(0)" uid="' + data.tomid + '" uname="' + data.tousername + '"  onclick="User_Click(this)">' + data.tousername + '</a>';
        } else {
            var To_str = '';
        }
        var redbagdiv = '';
        if (data.msgtype == 2) {
            //play('mp3/5103.mp3');
            redbagdiv = "redbagdiv";
        }
        var str = '<div class="liaotian" id="' + data.lid + '" aid="' + data.adminid + '"><div class="liaotian_right fl ' + redbagdiv + '"><Span class="userbase">  <a href="javascript:void(0)" class="lt_time">' + shijian + '</a><img src="' + THEME + '/style/level/User' + data.adminid + '.png"><a href="javascript:void)(0)" uid="' + data.mid + '" uname="' + data.username + '" adminid="' + data.adminid + '" onclick="User_Click(this)">' + data.username + '</a>' + To_str + sh_str + '</Span><div>' + data.content + '</div></div>  </div>';
    } else {
        if (data.username == '交易提示') {
            //play('mp3/5103.mp3');
            var click_str = 'onclick="$(\'#hdtx\').click()"';
            var str       = '<div class="liaotian "> <div class="liaotian_right fl m2"><span class="userbase "><a href="javascript:void(0)" class="lt_time">' + shijian + '</a><a href="javascript:void)(0)" uid="8" uname="' + data.username + '" >' + data.username + ' </a></span>  <div ' + click_str + '>' + data.content + '</div></div>  </div>';
        } else {
            //play('mp3/5103.mp3');
            var str = '<div class="liaotian "> <div class="liaotian_right fl m3"> <div >' + data.content + '</div></div>  </div>';
        }
    }
    
    //判断当前房间号跟返回信息的房间号是否一致
    if(myroom == data.fid) {
      t.append(str);
    } 
    
    
    if ($("#liaotianlist .liaotian").length > 30) {
        $("#liaotianlist .liaotian:lt(1)").remove();
    }
    if ($('.bar_gundong').attr('checked')) {
        t.animate({scrollTop: t[0].scrollHeight}, 1000);
    }
    if (data.quanping) {
        var screenstr = '<div>' + data.content.replace(/<[^>]+>/g, "") + '</div>';
        $('.quanping').append(screenstr);
        init_screen();
    }
}
function siliao(data) {
    $(".loading").hide()
    var t       = $('#liaotianlist');
    //alert("cccccc");
    tomid       = TOMID;
    tousername  = TOUSERNAME;
    var d       = new Date(parseInt(data.time) * 1000);
    var shijian = formatDate(d);
    if (data.mid == tomid || data.tomid == tomid) {
        var str = ' <div class="liaotian"> <div class="liaotian_right fl "><span class="userbase"><a href="javascript:void(0)" class="lt_time">' + shijian + '</a><img src="' + THEME + '/style/level/User' + data.myadminid + '.png"> <a href="javascript:void(0)" >' + data.uname + ' </a><a class="user_to">对</a><img src="' + THEME + '/style/level/User' + data.toadminid + '.png"><a href="javascript:void)(0)" >' + data.touname + ' </a></span>  <div> ' + data.content + '</div>  </div> ';
        $("#Y_PriMes_Div ").append(str);
    } else {
        var uid       = (MID == data.tomid) ? data.mid : data.tomid;
        var uname     = (USERNAME == data.touname) ? data.uname : data.touname;
        var hassiliao = $(".l-tab-links ul li[uid='" + uid + "']");
        if (hassiliao.length == 0) {
            if ($(".l-tab-links ul li").length == 0) {//no body
                TOMID      = uid;
                TOUSERNAME = uname;
                //  sayTo();
                var str    = '<li tabid="" class="l-selected" style="cursor: pointer;" uid="' + TOMID + '" uname="' + TOUSERNAME + '" > <a style="line-height:31px;" onclick="UBase_Click2(this);sayTo();">' + TOUSERNAME + '</a> <div class="l-tab-links-item-left"></div><div class="l-tab-links-item-right"></div> <div class="l-tab-links-item-close" onclick="RemovePrivatePerson(this)"></div></li>';
                var c_str  = ' <div class="liaotian"> <div class="liaotian_right fl "><span class="userbase"><a href="javascript:void(0)" class="lt_time">' + shijian + '</a><img src="' + THEME + '/style/level/User' + data.myadminid + '.png">  <a href="javascript:void(0)" >' + data.uname + ' </a><a class="user_to">对</a><img src="' + THEME + '/style/level/User' + data.toadminid + '.png"><a href="javascript:void)(0)" >' + data.touname + ' </a></span>  <div>' + data.content + '</div>  </div>';
                $("#Y_PriMes_Div ").append(c_str);
            } else {
                var str = '<li tabid="" class="" style="cursor: pointer;" uid="' + uid + '" uname="' + uname + '" onclick="$(this).addClass(\'l-selected\');"> <a style="line-height:31px;color:red" onclick="UBase_Click2(this);sayTo();">' + uname + '</a> <div class="l-tab-links-item-left"></div><div class="l-tab-links-item-right"></div> <div class="l-tab-links-item-close" onclick="RemovePrivatePerson(this)"></div></li>';
            }
            $(".l-tab-links ul").append(str);
        } else {
            hassiliao.find('a').css("color", "red");
        }
    }
    if ($(".whisper").is(":hidden")) {
        $(".whisper").show();
    }
    if ($("#Y_PriMes_Div .liaotian").length > 30) {
        $("#Y_PriMes_Div .liaotian:lt(1)").remove();
    }
    $("#Y_PriMes_Div ").animate({scrollTop: $("#Y_PriMes_Div ")[0].scrollHeight}, 100);
}
function fayanLimit() {
    $('.tishi_content t').html(WAIT);
    WAIT--;
    if (WAIT == 0) {
        clearInterval(limitCount);
        limitCount = '';
        $.fancybox.close();
        WAIT = FAYAN_LIMIT;
    }
}

function notice(content) {
    $("#qtip-growl-container").qtip({
                                        content: {text: content, title: "提示"},
                                        corner: {
                                            target: 'bottomRight',
                                            tooltip: 'topLeft'
                                        },
                                        style: {classes: 'qtip-dark qtip-shadow qtip-rounded'},
                                        show: {
                                            ready: true,
                                            effect: function () {
                                                $(this).slideDown();
                                            }
                                        },
                                        hide: {
                                            event: false,
                                            inactive: 2000,
                                            effect: function () {
                                                $(this).slideUp();
                                            }
                                        }
                                    });
}
function getSiliaodata() {
    var tomid      = TOMID;
    var tousername = TOUSERNAME;
    var toadminid  = TOADMINID;

    $.ajax({
               url: Private_chat,
               type: "POST",
               data: {mid: MID, tomid: tomid, toadminid: toadminid},
               timeout: 8000,
               dataType: "json",
               cache: false,
               success: function (msg) {//msg为返回的数据，在这里做数据绑定
                   $(".loading").hide();
                   //console.log(msg);
                   $('#Y_PriMes_Div .liaotian').remove();
                   if (msg instanceof Array) {
                       for (i in msg) {
                           siliao(msg[i]);
                       }
                   }
               },
               error: function (XMLHttpRequest, textStatus, errorThrown) {
               }
           });
}
function pingbi(t) {
    if (!window.confirm("确认屏蔽此人？")) {
        return false;
    }
    var mid     = TOMID;
    var adminid = TOADMINID;
    if (ADMINID <= 3) {
        $.ajax({
                   url: CORRELATION + "&type=shield",
                   type: "POST",
                   async: true,
                   data: {mid: mid, t: t, adminid: adminid},
                   //dataType: "json",
                   error: function () {
                       // alert('Error loading XML document');
                   },
                   success: function (data) {//如果调用php成功
                       if (data == "true") {
                           notice("屏蔽成功");
                       } else {
                           notice("屏蔽失败");
                       }
                   }
               });
    } else {
        notice('您不具有此权限');
    }
}
function ipban() {
    /*ws.send(JSON.stringify( {"type":"shenhe","tomid":TOMID,"username":'系统提示',"sh_content":'对不起，因为您多次违规操作使用融汇财经直播室，管理员已对您进行请出直播室处理！',"fid":FID} ) );
     return false;*/
    if (!window.confirm("确认封掉此人IP?")) {
        return false;
    }
    var mid     = TOMID;
    var adminid = TOADMINID;

    if (ADMINID <= 3) {
        $.ajax({
                   url: CORRELATION+"&type=ipblack",
                   type: "POST",
                   async: true,
                   data: {mid: mid, adminid: adminid},
                   //dataType: "json",
                   error: function () {
                       // alert('Error loading XML document');
                   },
                   success: function (data) {//如果调用php成功
                       if (data == "true") {
                          notice("屏蔽成功");
                          ws.send(JSON.stringify({
                              "type": "shenhe",
                              "tomid": TOMID,
                              "username": '系统提示',
                              "sh_content": TOUSERNAME + '，被封IP永久踢出直播室！',
                              "fid": FID
                          }));
                       } else {
                           notice("屏蔽失败");
                       }
                   }
               });
    } else {
        notice('您不具有此权限');
    }
}

function liaotianShenhe(e) {
    $.ajax({
               url: "action.php?type=updateliaotian",
               type: "POST",
               data: {lid: e.rel},
               timeout: 8000,
               dataType: "json",
               cache: false,
               success: function (msg) {//msg为返回的数据，在这里做数据绑定
                   if (typeof(msg) == "object") {
                       var lid        = msg.lid;
                       var sh_mid     = msg.mid;
                       var username   = msg.username;
                       var adminid    = msg.adminid;
                       var sh_tomid   = msg.tomid;
                       var tousername = msg.tousername;
                       var toadminid  = msg.toadminid;
                       var sh_content = msg.content;
                       ws.send(JSON.stringify({
                                                  "type": "shenhe",
                                                  "lid": lid,
                                                  "mid": sh_mid,
                                                  "adminid": adminid,
                                                  "username": username,
                                                  "tomid": sh_tomid,
                                                  "tousername": tousername,
                                                  "toadminid": toadminid,
                                                  "shstatus": 1,
                                                  "sh_content": sh_content,
                                                  "fid": FID
                                              }));
                       $(e).remove();
                   } else if (msg == 'yishenhe') {
                       $(e).remove();
                   } else {
                       notice('操作失败');
                   }
               },
               error: function (XMLHttpRequest, textStatus, errorThrown) {
               }
           });
}
function liaotianDel(e) {
    $.ajax({
               url: CORRELATION + "&type=delchat",
               type: "POST",
               data: {mid: e.rel},
               timeout: 8000,
               dataType: "json",
               cache: false,
               success: function (msg) {//msg为返回的数据，在这里做数据绑定
                   if (typeof(msg) == "object") {
                       var lid = msg.lid;
                       ws.send(JSON.stringify({"type": "deleteliaotian", "lid": lid, "fid": FID}));
                       $("#" + lid).remove();
                   } else {
                       notice('操作失败');
                   }
               },
               error: function (XMLHttpRequest, textStatus, errorThrown) {
               }
           });
}
function SendFlower(jid) {
    if (!Flower_NUM) {
        notice('对不起，您没有足够的红包');
        return false;
    }
    $.ajax({
               url: "action.php?type=sendflower",
               type: "POST",
               async: true,
               data: {jid: jid},
               dataType: "json",
               error: function () {
                   // alert('Error loading XML document');
               },
               success: function (data) {//如果调用php成功
                   if (data != "false") {
                       notice("送花成功");
                       $('.FlowerNum span').html(data.num);
                       Flower_NUM--;
                       $(".bar_flower  span").html(Flower_NUM);
                       ws.send(JSON.stringify({"type": "sendflower", "sh_content": data.content}));
                   } else {
                       notice("您已经没有花了");
                   }
               }
           });
}
function GetFlower() {
    $.get("action.php?type=getflower", function (data, status) {
        if (!isNaN(data)) {
            Flower_NUM = data;
        } else {
            setTimeout("GetFlower", 1000);
        }
    });
}
function addFlower() {
    Flower_NUM++;
    $(".bar_flower span").html(Flower_NUM);
    $.get("action.php?type=addflower&mid=" + MID, function (data, status) {
    });
}
function setTeacherId(mid) {
    $.get("action.php?type=setteacherid&mid=" + mid, function (data, status) {
        if (!isNaN(data)) {
            $('.RegBagNum span').html(data);
        }
    });
}
function loadMore() {
    var load_more = $(".load_more");
    $(".load_more a").addClass('wait');
    $(".load_more a").text('');
    var lid = $("#liaotianlist .liaotian[id!='']:first").attr('id');
    $.get(CORRELATION + "&type=loadmore&lid=" + lid, function (msg, status) {
        if (msg != 'false') {
            for (i in msg) {
                data = msg[i];
                if (data.tomid && data.tomid != "null" && data.tomid != "undefined" && data.tomid != "0") {
                    var To_str = '<a class="user_to">对</a><img src="' + THEME + '/style/level/User' + data.toadminid + '.png"/><a href="javascript:void)(0)" uid="' + data.tomid + '" uname="' + data.touname + '" adminid="' + data.toadminid + '"  onclick="User_Click(this)">' + data.touname + '</a>';
                } else {
                    var To_str = '';
                }
                var d         = new Date(parseInt(data.time) * 1000);
                var shijian   = formatDate(d);
                var redbagdiv = data.msgtype == 2 ? 'redbagdiv' : '';
                var str       = '<div class="liaotian" id="' + data.id + '" aid="' + data.myadminid + '"><div class="liaotian_right fl ' + redbagdiv + '"><Span class="userbase"><a href="javascript:void(0)" class="lt_time">' + shijian + '</a><img src="' + THEME + '/style/level/User' + data.myadminid + '.png"><a href="javascript:void)(0)" uid="' + data.mid + '" uname="' + data.uname + '" adminid="' + data.myadminid + '"  onclick="User_Click(this)">' + data.uname + '</a>' + To_str + '</span><div>' + data.content + '</div></div>  </div>';
                $('#liaotianlist').prepend(str);
            }
            $(".load_more a").removeClass('wait');
            $(".load_more a").text('查看更多信息');
            $('#liaotianlist').prepend(load_more);
            $('#liaotianlist').scrollTop($("#liaotianlist .liaotian[id='" + lid + "']").offset().top);
        } else {
            $(".load_more a").removeClass('wait');
            $(".load_more a").text('查看更多信息');
        }
    }, 'json');
}
function changeSkin(e) {
    $('#skin img').attr('src', e.rel);
    $.cookie('bg_img', e.rel, {expires: 365, path: '/'});
    $("#skin img").attr("src", e.rel);
}
function getUserInfo(e) {
    $.get("action.php?type=getuserinfo&mid=" + e.rel, function (data, status) {
        if (data) {
            $(e).html('IP:' + data.ip + ',注册时间:' + data.regtime + ',备注:' + data.beizhu + ',上线:' + data.shangxian);
        }
    }, 'json');
}
function sendRedbag() {
    var _num     = $("#rendbag_num").val();
    var _total   = $('#rendbag_total').val();
    var roleid   = $("#role_select option:selected").attr('uid');
    var rolename = $("#role_select").val();
    var roleaid  = $("#role_select option:selected").attr('aid');
    $.ajax({
               url: CORRELATION + "&type=sendredbag",
               type: "POST",
               async: true,
               data: {num: _num, total: _total},
               dataType: "json",
               error: function () {
               },
               success: function (data) {//如果调用php成功
                   if (typeof(data) == "object") {
                       ws.send(JSON.stringify({
                                                  "type": "say",
                                                  "lid": data.lid,
                                                  "fid": data.fid,
                                                  "content": data.content,
                                                  "shstatus": data.shstatus,
                                                  "msgtype": data.msgtype,
                                                  "roleid": roleid,
                                                  "rolename": rolename,
                                                  "roleaid": roleaid
                                              }));
                       notice("红包已发送");
                       $('.bar_redbag span').html('￥' + data.yue);
                       $("#rendbag_num").val('');
                       $('#rendbag_total').val('');
                       $.fancybox.close();
                   } else if (data == "invalidate_num") {
                       notice("单个红包金额最少为1");
                   } else {
                       notice("对不起，您的账户余额不足");
                       $("#redbag_pay_btn").click();
                   }
               }
           });
}
function getRedbag(e) {
    var redbag = $(e).attr('rel');
    $.ajax({
               url: CORRELATION + "&type=getredbag",
               type: "POST",
               async: true,
               data: {redbag: redbag},
               dataType: "json",
               error: function () {
               },
               success: function (data) {//如果调用php成功
                   if (typeof(data) == "object") {
                       alert("恭喜你，领取了红包￥" + data.count);
                       ws.send(JSON.stringify({"type": "getredbag", "sh_content": data.content}));
                       $('.bar_redbag span').html('￥' + data.yue);
                       getRedbagInfo(redbag)
                   } else if (data == "invalidateadminid") {
                       notice("请登录之后再抢红包");
                       getRedbagInfo(redbag)
                   } else if (data == "hasgot") {
                       notice("您已经领过改红包领了，请下次再领吧");
                       getRedbagInfo(redbag)
                   } else {
                       notice("红包领取完了，请下次再领吧");
                       getRedbagInfo(redbag)
                   }
               }
           });
}
function getRedbagInfo(redbag) {
    $.ajax({
               url: CORRELATION + "&type=getredbaginfo",
               type: "POST",
               async: true,
               data: {redbag: redbag},
               dataType: "json",
               error: function () {
               },
               success: function (data) {//如果调用php成功
                   if (typeof(data) == "object") {
                       var redbag   = data.redbag;
                       var get_list = data.get_list;
                       console.log(get_list);
                       $("#redbag_info ._avatar").html('<img src="' + THEME + '/style/level/User' + redbag.user_group_id + '.png"/>');
                       $("#redbag_info h1").html("已领取" + get_list.length + "/" + redbag.num + "个");
                       $("#redbag_info ._info ._info_total").html('共 ￥' + redbag.total);
                       $("#redbag_info ._info ._info_from").html('来自 ' + redbag.uname);
                       $("#redbag_info table").html('')
                       for (i in get_list) {
                           var d       = new Date(parseInt(get_list[i].time) * 1000);
                           var shijian = formatDate(d);
                           var tr_str  = '<tr> <td style="width:15%"><img src="' + THEME + '/style/level/User' + get_list[i].user_group_id + '.png"></td><td><span>' + get_list[i].uname + '</span><p>' + shijian + '</p></td> <td style="width:30%">￥' + get_list[i].count + '</td> </tr>';
                           $("#redbag_info table").append(tr_str)
                       }
                       $("#redbag_info_btn").click();
                   }
               }
           });
}
function switchVideo(e) {
    $.get("action.php?type=getvideo&vid=" + e.rel, function (data, status) {
        if (data) {
            var switchvideo_html = '<a href="javascript:void(0)" class="switchvideo_btn" ><img src="/images/switchvideo.png" onclick="loadVideo()"/></a>';
            $('.shipinchuangkou').html(data.html + switchvideo_html);
        }
    }, 'json');
}
function initKecheng() {
    var day       = new Date(Date.parse(new Date()));
    var timestamp = Date.parse(new Date());
    var today     = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六');
    var week      = today[day.getDay()];
    var h         = day.getHours();
    var m         = day.getMinutes();
    week == 0 ? 7 : week;
    $(".kechengtitle li").each(function (i) {
        $(this).attr("class", "")
        if ($(this).text().indexOf(week) != -1) {
            $(this).attr("class", "on")
        }
    });
    $('.kechengopenbox .kechengboxlist').eq(day.getDay() - 1).show();
    $('.kechengopenbox .kechengboxlist').eq(day.getDay() - 1).find('.time').each(function () {
        var start = parseInt($(this).attr('start')) * 1000;
        var end   = parseInt($(this).attr('end')) * 1000;
        if (timestamp > start && timestamp <= end) {
            $(this).parent().addClass('online');
        }
    })
}
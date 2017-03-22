<?php
header('Content-type:text/html;charset=utf-8');
/**
 * 直播室控制器
 * @author ashangmanage <ashangmanage@phpzsm.com>
 * @version CY1.0
 */
//session_start();
class LiveAction extends Action
{
	private $_roomidArr_model;			// 直播间模型
	private $_user_model;				// 用户模型字段
	private $livemodel;				    // 直播模型

	/**
	 * 模块初始化
	 * @return void
	 */
	protected function _initialize()
	{
		//实例化模型		
		$this->livemodel        = model('Live');
		$this->_roomidArr_model = model('studioroom');
		$this->_user_model      = model('User');

	}
	
	//首页
	public function index()
	{
		//表前缀
		$tp = C('DB_PREFIX');
		// if(!(model('Passport')->isLogged())){
		// 	$this->error("请先登录!");
		// 	U('index/Index/index','',true);
		// }
		//js变量值
		// echo '<pre>';
		// print_r($_SESSION);exit;
		
		//初始化房间信息
		$user = $this->initializationRoom();

		//用户的id
		$userinfo = $user['uid'] ? array('_'=>$user['uid']) : array('__'=>$user['id']);
		$gundong = "\$(\".bar_gundong\").toggle(function(){\$(this).removeAttr('checked');},function(){\$(this).attr('checked',true);});";
		//换肤的值
		$bg_img = isset($_COOKIE['bg_img']) ? $_COOKIE['bg_img'] : 'http://www.educationonline.com/addons/theme/stv1/_static/style/bj.jpg';
		//换肤图片
		$skin = '';
		for($i=2;$i<25;$i++) {
			$skin .= '<a href="javascript:void(0)" rel="__THEME__/style/skin/w'.$i.'.jpg" onclick="changeSkin(this)"><img src="__THEME__/style/w'.$i.'x.jpg"></a>';
		}

		//分配变量
		$this->assign('gundong',$gundong);
		$this->assign('user',$user);
		$this->assign('skin',$skin);
		$this->assign('userinfo',$userinfo);
		$this->assign('bg_img',$bg_img);
		//print_r($tp);exit;
		$this->display();
	}

	//初始化房间信息
	//判断登录情况
	private function initializationRoom()
	{
		//获取表前缀
		$tp = C('DB_PREFIX');

		//获取静态目录
		$theme = THEME_PUBLIC_URL;
	    $guest =  M ('guest');

		//判断房间号
		$roomid = isset($_GET['roomid']) ? $_GET['roomid'] : '';
		//查询所有房间的id
		$roomidArr = $this->livemodel->getroom();

		//判断当前房间id是否准确
		if(!in_array($roomid, $roomidArr)){
			echo "string";
			$this->redirect('home/Live/index',array('roomid'=>$roomidArr[0]));
			exit;
		}

		//加入ip判断
		$thisip  = get_client_ip();
		$isblack = $this->_roomidArr_model->query("select id from {$tp}ipblacklist where ip = '$thisip'");

		//判断ip是否列入黑名单,查询客服QQ
		if($isblack){
  			$qq_rs = $this->_roomidArr_model->query("select * from {$tp}qqlist");
  			if($qq_rs) { 		
        		echo '<a href="http://wpa.qq.com/msgrd?v=3&uin='.$qq_rs[0]["code"].'&site=qq&menu=yes" target="_blank" ><img src="'.$theme.'/style/QQ.jpg" title="'.$qq_rs[0]["code"].'"/></a>&nbsp;&nbsp;';
     		}  
     		echo "<br/>你的ip已经被屏蔽,请联系管理员";
			exit;
     	}

     	//判断房间是否开放
     	$peizhi = $this->_roomidArr_model->where("roomid = '{$roomid}'")->find();
		if(!$peizhi['onoff']){
			$this->error('当前房间暂时未开放');
			exit;
		}

		//判断是否需要密码
		// if($_GET['pwd'] != $peizhi['password']) {
		// 	$this->redirect('home/Live/showPassword',array('roomid'=>$roomid));
		// 	exit;
		// }

		//判断是否存在登录情况
		$login = $tp.'login';
		if($_SESSION['gid']){
			$guser = $guest->where("id = '$_SESSION[gid]' and roomid = '$roomid'")->find();    		   		
		}else if($_SESSION['mid']){
    		$user = $this->_user_model->where("uid = '$_SESSION[mid]' and roomid = '$roomid'")->find(); 
		}

		if(!$user && !$guser){
			$user = $this->_user_model->where("login = '$_COOKIE[$login]' and roomid = '$roomid'")->find();
    		if(!$user) {
    			$guser = $guest->where("username = '$_COOKIE[$login]' and roomid = '$roomid'")->find();
    		}
		}
		// echo "<pre>";
		// print_r($user);exit;
		//如果没有数据则生成游客身份
		if(!$user && !$guser){
			$pattern = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLOMNOPQRSTUVWXYZ';
		 		for($i = 0; $i < 4; $i ++) {
		        	$returnStr .= $pattern {mt_rand ( 0, 61 )};
				} //生成php随机数
			$arr=array(
			'uname'       => "游客".$returnStr,
			'usergroupid'    => 4,
			'last_logintime' => time(),
			'ctime'          => time(),
			'roomid'         => $roomid,
			'ip'             => $thisip,
			);
			
			//创建数据
			$data = $guest->create($arr);
			//插入数据
			$mid = $guest->add();

			//查询刚插入的数据
			$user = $guest->where("id = '$mid'")->find();
			$_SESSION['gid']      = $mid;
			$_SESSION['username'] = "游客".$returnStr;
			$_SESSION['roomid']   = $user['roomid'];
		}else if($user){
			//更新登录的ip
			$data['ip'] = $thisip;
			$this->_user_model->where("uid = '$user[uid]'")->save($data);

			$_SESSION['username'] = $user['uname'];
			$_SESSION['mid']      = $user['uid'];
			$_SESSION['roomid']   = $user['roomid'];
		}

		$username = $user['login'] ? $user['login'] : $guser['username'];
		cookie('login', $username, time()+8640000);

		$user = $user ? $user : $guser;
		return $user;
	}

	//添加聊天信息
	//$roomid 直播室房间id
	private function addchat($roomid)
	{

	}

	//根据传入的id输出相应的信息
	public function userinfo()
	{
		$guest =  M ('guest');
		if(isset($_GET['_'])) {
			//查询是否是会员
			$user = $this->_user_model->getUserInfo($_GET['_']);
		}else if(isset($_GET['__'])) {
			//如果不是会员，则查询游客列表
			$user = $guest->where("id = '{$_GET["__"]}'")->find();
		}
		
		// echo '<pre>';
		// print_r($user);exit;

		//组别信息
		$groupid = $user['user_group'][0]['user_group_id'] ? $user['user_group'][0]['user_group_id'] : $user['usergroupid'];
		$uid = $user['uid'] ? $user['uid'] : $user['id'];
		//查询会员所对应的房间的配置信息
     	$peizhi = $this->_roomidArr_model->where("roomid = '{$user[roomid]}'")->find();
     	echo "var FID       = '$user[roomid]';
		var MID             = $uid;
		var USERNAME        = '$user[username]';
		var ADMINID         = $groupid;
		var TUIJIANMID      = '';
		var TUIJIANUSERNAME = '';
		var TUIJIANADMINID  = '';
		var LOGIN_COUNT     = '';
		var TOMID           = '';
		var TOUSERNAME      = '';
		var FAYAN_LIMIT     = '$peizhi[speak_interval]';
		var Flower_NUM      = '';
		var VIEWSTATUS      = '$peizhi[viewstatus]';
		var VIEWTIME        = '$peizhi[viewtime]';
		var LOGIN_SWITCH    = 1;
		var LOGIN_TIP       = 1;
		";
	}

	//输入密码页面
	public function showPassword()
	{
		//跳转的链接
		$url = U('home/Live/showPassword');
		//是否有post请求
		if($_POST['pwd']) {
			$pwd    = $_POST['pwd'];     //密码
			$roomid = $_POST['roomid']; //房间号

			//获取房间密码
	     	$password = $this->_roomidArr_model->field('password')->where("roomid = '{$roomid}'")->find();

			//判断密码是否正确
			if($pwd == $password['password']) {
				$this->redirect('home/Live/index',array('roomid'=>$roomid, 'pwd'=>$pwd));
				exit;
			}
		}

		//分配变量
		$this->assign('url', $url);
		$this->display('password');
	}

}
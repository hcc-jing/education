<?php
/**
 * 后台直播管理
 * @author wangjun@chuyouyun.com
 * @version chuyouyun2.0
 */
tsload(APPS_PATH.'/admin/Lib/Action/AdministratorAction.class.php');
class MemberAction extends AdministratorAction
{
	/**
	 * 初始化，
	 */
	public function _initialize() {
		$this->pageTitle['index']    = '会员列表';
		$this->pageTitle['update']   = '修改会员信息';
		$this->pageTitle['setempty'] = '清空游客信息';
		
		$this->pageTab[] = array('title'=>'会员列表','tabHash'=>'index','url'=>U('live/Member/index'));
		// $this->pageTab[] = array('title'=>'修改会员信息','tabHash'=>'update','url'=>U('live/Member/update'));
		$this->pageTab[] = array('title'=>'清空游客信息','tabHash'=>'setempty','url'=>U('live/Member/setempty'));
		parent::_initialize();
	}
	
	//直播间列表（带分页）
	public function index(){
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'index';
		$this->pageKeyList = array('uid','uname','phone','is_del','roomname','is_say','balance','DOACTION');
		// 搜索选项的key值
		$this->searchKey = array('uid','uname','roomid');
		$this->pageButton[] = array('title'=>'搜索会员','onclick'=>"admin.fold('search_form')");
		
		//判断是否搜索
		if($_REQUEST['dosearch']) {
			$uname    = t($_REQUEST['uname']);
			$roomid   = t($_REQUEST['roomid']);
			$list     = M ('user') -> field("{$tp}user.uid,{$tp}user.uname,{$tp}user.phone,{$tp}user.is_del,{$tp}user.roomid,{$tp}user.is_say,a.balance,b.roomname") -> join ("{$tp}zy_learncoin as a on {$tp}user.uid = a.uid") -> join("{$tp}studioroom as b on {$tp}user.roomid = b.roomid") -> where("{$tp}user.uname = '{$uname}' and {$tp}user.roomid = '{$roomid}'") -> findPage();
			if($list['count']) {
				// $list['data'][0] = $info;
			}else {
				$list = M ('user') -> field("{$tp}user.uid,{$tp}user.uname,{$tp}user.phone,{$tp}user.is_del,{$tp}user.roomid,{$tp}user.is_say,a.balance,b.roomname") -> join ("{$tp}zy_learncoin as a on {$tp}user.uid = a.uid") -> join("{$tp}studioroom as b on {$tp}user.roomid = b.roomid") -> findPage();
			}
		}else {
			$list = M ('user') -> field("{$tp}user.uid,{$tp}user.uname,{$tp}user.phone,{$tp}user.is_del,{$tp}user.roomid,{$tp}user.is_say,a.balance,b.roomname") -> join ("{$tp}zy_learncoin as a on {$tp}user.uid = a.uid") -> join("{$tp}studioroom as b on {$tp}user.roomid = b.roomid") -> findPage();
		}

		//查询所有房间的信息
		$allroom = M ('studioroom') -> field('roomid,roomname') ->select();
		foreach($allroom as $key => $val) {
			$this->opt['roomid'][$val['roomid']] = $val['roomname'];
		}

		foreach($list['data'] as &$val){
			//会员列表地址
			$val['is_del']     = ($val['is_del'] == 0) ? '未禁用' : '禁用';
			$val['is_say']     = ($val['is_say'] == 0) ? '禁言' : '未禁言';
			$val['DOACTION']   = '<a href="'.U('live/Member/update',array('uid'=>$val['uid'])).'">编辑</a> | ';
			$val['DOACTION']   .= '<a href="'.U('live/Member/deteleUser',array('uid'=>$val['uid'])).'" onclick="return confirm(\'确认删除该会员吗?\');">删除</a>';
		}

		// echo '<pre>';
		// print_r($list);exit;
		$this->displayList($list);
	}
	
	
	//编辑会员信息
	public function update(){
		if( isset($_POST) ) {
			$uid = t($_REQUEST['uid']);

			if($uid == 1) {
				$this->error('总管理员不允许修改');
			}

			//会员表信息
			if($udata = M ('user') -> create()) {
				$uid = M ('user') -> where("uid = '{$uid}'") -> save($udata);
			}else {
				$this->error(M ('user') -> getError());
			}

			$uid = t($_REQUEST['uid']);
			//余额表信息
			if($zdata = M ('zy_learncoin') -> create()) {
				$zid = M ('zy_learncoin') -> where("uid = '{$uid}'") -> save($zdata);
			}else {
				$this->error(M ('zy_learncoin') -> getError());
			}
			if($uid || $zid) {
				$this->assign( 'jumpUrl', U('live/Member/index') );
				$this->success('修改成功');
			} else {
				$this->error('修改失败');
			}
		} else {
			$_REQUEST['tabHash'] = 'update';

			$uid    = t($_REQUEST['uid']);
			//查询所有房间的信息
			$allroom = M ('studioroom') -> field('roomid,roomname') -> select();
			$this->pageKeyList = array('uid','uname','phone','is_del','roomid','is_say','balance');
			$this->opt['is_del']          = array('1'=>'不禁用','0'=>'禁用'); //
			$this->opt['is_say']     = array('1'=>'不禁言','0'=>'禁言'); //发言限制
			//$this->opt['roomid'][0]     = $myroom['rooname']; //房间号
			foreach($allroom as $key => $val) {
				$this->opt['roomid'][$val['roomid']] = $val['roomname'];
			}
			$list   = $this->memberInfo($uid);
			$this->savePostUrl = U('live/Member/update');
			//print_r($list);exit;
			$this->displayConfig($list['room']);
		}
	}

	//删除直播间信息
	public function deteleUser()
	{
		$roomid = t($_REQUEST['uid']);
		if($roomid == 1){
			$this->error('总管理员不允许删除');
		}
		if(M ('user') -> delete($roomid) ){
			$this->assign( 'jumpUrl', U('live/Member/index') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

	//查找会员的信息
	private function memberInfo($uid)
	{
		//获取表前缀
		$tp = C('DB_PREFIX');
		$list = M ('user') -> field("{$tp}user.uid,{$tp}user.uname,{$tp}user.phone,{$tp}user.is_del,{$tp}user.roomid,{$tp}user.is_say,a.balance") -> join ("{$tp}zy_learncoin as a on {$tp}user.uid = a.uid") -> where("{$tp}user.uid = '{$uid}'") -> find();
		$arr['room'] = $list;

		return $arr;
	}

	//清除游客信息
	public function setempty()
	{
		if(M ('guest') ->where('1')-> delete() ){
			$this->assign( 'jumpUrl', U('live/Member/index') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

}
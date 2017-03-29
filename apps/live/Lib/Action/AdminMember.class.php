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
		$this->pageTitle['index']  = '会员列表';
		$this->pageTitle['update'] = '修改会员信息';
		
		$this->pageTab[] = array('title'=>'会员列表','tabHash'=>'index','url'=>U('live/Admin/index'));
		$this->pageTab[] = array('title'=>'修改会员信息','tabHash'=>'create','url'=>U('live/Admin/create'));
		parent::_initialize();
	}
	
	//直播间列表（带分页）
	public function index(){
		$_REQUEST['tabHash'] = 'index';
		$this->pageKeyList = array('id','roomname','studiourl','password','DOACTION');
		$list = M ('studioroom') -> field('id,roomid,roomname,password') -> findPage(20);
		foreach($list['data'] as &$val){
			//直播间地址
			$val['studiourl']  =  U ('home/Live/index',array('roomid'=>$val['roomid']));
			$val['password']   =  $val['password'];
			$val['roomname']   =  $val['roomname'];
			$val['DOACTION']   = '<a href="'.U('live/Admin/update',array('roomid'=>$val['id'])).'">编辑</a> | ';
			$val['DOACTION']   .= '<a href="'.U('live/Admin/deteleRoom',array('id'=>$val['id'])).'">删除</a>';
		}
		// echo '<pre>';
		// print_r($list);exit;
		$this->displayList($list);
	}
	
	//创建直播间
	public function create(){
		if( isset($_POST) ) {
			$roomid = t($_REQUEST['roomid']);
			if($data = M ('studioroom') -> create()) {
				$pattern = '1234567890ABCDEFGHIJKLOMNOPQRSTUVWXYZ';
			 	for($i = 0; $i < 10; $i ++) {
			        $returnStr .= $pattern {mt_rand ( 0, 36 )}; //随机生成房间id
				} //生成php随机数
				$data['roomid'] = $returnStr;
				$id = M ('studioroom') -> add($data);
			}else {
				$this->error(M ('studioroom') -> getError());
			}
			if($id) {
				$this->assign( 'jumpUrl', U('live/Admin/index') );
				$this->success('创建成功');
			} else {
				$this->error('创建失败');
			}
		} else {
			$_REQUEST['tabHash'] = 'create';
			$this->pageKeyList = array('roomid','roomname','password','room_ak','yy_number','speak_interval','onoff','viewtime','viewstatus','is_guest','sensitive_words');
			$this->opt['onoff']          = array('1'=>'开启','0'=>'不开启'); //房间权限
			$this->opt['viewstatus']     = array('1'=>'不限制','0'=>'限制'); //观看权限
			$this->opt['is_guest']       = array('1'=>'不可以','0'=>'可以'); //游客权限
			$this->savePostUrl = U('live/Admin/create');
			$this->displayConfig();
		}
		
	}
	
	//编辑直播间
	public function update(){
		if( isset($_POST) ) {
			$roomid = t($_REQUEST['roomid']);
			if(M ('studioroom') -> create()) {
				$id = M ('studioroom') -> where("roomid = '{$roomid}'") -> save();
			}else {
				$this->error(M ('studioroom') -> getError());
			}

			if($id) {
				$this->assign( 'jumpUrl', U('live/Admin/index') );
				$this->success('修改成功');
			} else {
				$this->error('修改失败');
			}
		} else {
			$_REQUEST['tabHash'] = 'create';
			$this->pageKeyList = array('roomid','roomname','password','room_ak','yy_number','speak_interval','onoff','viewtime','viewstatus','is_guest','sensitive_words');
			$this->opt['onoff']          = array('1'=>'开启','0'=>'不开启'); //房间权限
			$this->opt['viewstatus']     = array('1'=>'不限制','0'=>'限制'); //观看权限
			$this->opt['is_guest']       = array('1'=>'不可以','0'=>'可以'); //游客权限
			
			$roomid = t($_REQUEST['roomid']);
			$list   = $this->roomInfo($roomid);
			$this->savePostUrl = U('live/Admin/update');
			//print_r($list);exit;
			$this->displayConfig($list['room']);
		}
	}

	//删除直播间信息
	public function deteleRoom()
	{
		$roomid = t($_REQUEST['id']);
		if(M ('studioroom') -> delete($roomid) ){
			$this->assign( 'jumpUrl', U('live/Admin/index') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

}
<?php
/**
 * 后台直播管理
 * @author wangjun@chuyouyun.com
 * @version chuyouyun2.0
 */
tsload(APPS_PATH.'/admin/Lib/Action/AdministratorAction.class.php');
class ServiceAction extends AdministratorAction
{
	/**
	 * 初始化，
	 */
	public function _initialize() {
		$this->pageTitle['index']    = '客服列表';
		$this->pageTitle['create']   = '添加客服';
		$this->pageTitle['update']   = '修改客服';
		
		$this->pageTab[] = array('title'=>'客服列表','tabHash'=>'index','url'=>U('live/Service/index'));
		// $this->pageTab[] = array('title'=>'修改会员信息','tabHash'=>'update','url'=>U('live/Service/update'));
		$this->pageTab[] = array('title'=>'添加客服信息','tabHash'=>'create','url'=>U('live/Service/create'));
		parent::_initialize();
	}
	
	//直播间列表（带分页）
	public function index(){
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'index';
		$this->pageKeyList = array('id','title','code','roomname','DOACTION');
		// 搜索选项的key值
		$this->searchKey = array('id','title','code','roomid');
		$this->pageButton[] = array('title'=>'搜索客服','onclick'=>"admin.fold('search_form')");
		
		//判断是否搜索
		if($_REQUEST['dosearch']) {
			$uname    = t($_REQUEST['uname']);
			$roomid   = t($_REQUEST['roomid']);
			$list     = M ('qqlist') -> field("{$tp}qqlist.uid,{$tp}qqlist.uname,{$tp}qqlist.phone,{$tp}qqlist.is_del,{$tp}qqlist.roomid,{$tp}qqlist.is_say,a.balance") -> join ("{$tp}zy_learncoin as a on {$tp}qqlist.uid = a.uid") -> where("{$tp}qqlist.uname = '{$uname}' and {$tp}qqlist.roomid = '{$roomid}'") -> findPage();
			if($list['count']) {
				// $list['data'][0] = $info;
			}else {
				$list = M ('qqlist') -> findPage();
			}
		}else {
			$list = M ('qqlist')-> field("{$tp}qqlist.*,a.roomname") -> join("{$tp}studioroom as a on {$tp}qqlist.roomid = a.roomid") -> findPage();
		}

		//查询所有房间的信息
		$allroom = M ('studioroom') -> field('roomid,roomname') ->select();
		foreach($allroom as $key => $val) {
			$this->opt['roomid'][$val['roomid']] = $val['roomname'];
		}

		foreach($list['data'] as &$val){
			//客服列表
			$val['DOACTION']   = '<a href="'.U('live/Service/update',array('id'=>$val['id'])).'">编辑</a> | ';
			$val['DOACTION']   .= '<a href="'.U('live/Service/deteleCus',array('id'=>$val['id'])).'" onclick="return confirm(\'确认删除该客服吗?\');">删除</a>';
		}

		// echo '<pre>';
		// print_r($list);exit;
		$this->displayList($list);
	}
	
	
	//编辑会员信息
	public function update(){
		if( isset($_POST) ) {
			$id = t($_REQUEST['id']);

			if(empty($_POST['title'])) {
				$this->error('客服名称不允许为空');
			}else if(empty($_POST['code'])) {
				$this->error('客服QQ号码不允许为空');
			}

			if($data = M('qqlist') -> create($_POST, 2)) {
				$qid = M('qqlist') -> save($data);
			}else {
				$this->error(M ('qqlist') -> getError());
			}
			//如果插入数据成功
			if($qid) {
				$this->assign( 'jumpUrl', U('live/Service/index') );
				$this->success('修改成功');
			} else {
				$this->error('修改失败');
			}
		} else {
			$_REQUEST['tabHash'] = 'update';

			$id    = t($_REQUEST['id']);
			//查询所有房间的信息
			$allroom = M ('studioroom') -> field('roomid,roomname') ->select();
			$this->pageKeyList = array('id','title','code','roomid',);
			foreach($allroom as $key => $val) {
				$this->opt['roomid'][$val['roomid']] = $val['roomname'];
			}
			$list   = $this->memberInfo($id);
			$this->savePostUrl = U('live/Service/update');
			//print_r($list);exit;
			$this->displayConfig($list['room']);
		}
	}

	//添加客服信息
	public function create(){
		if( isset($_POST) ) {
			$uid = t($_REQUEST['uid']);

			if(empty($_POST['title'])) {
				$this->error('请输入客服名称');
			}else if(empty($_POST['code'])) {
				$this->error('请输入客服QQ号码');
			}

			if(M('qqlist') -> create()) {
				$qid = M('qqlist') -> add();
			}else {
				$this->error(M ('qqlist') -> getError());
			}
			//如果插入数据成功
			if($qid) {
				$this->assign( 'jumpUrl', U('live/Service/index') );
				$this->success('添加成功');
			} else {
				$this->error('添加失败');
			}
		} else {
			$_REQUEST['tabHash'] = 'update';

			$id    = t($_REQUEST['id']);
			//查询所有房间的信息
			$allroom = M ('studioroom') -> field('roomid,roomname') ->select();
			$this->pageKeyList = array('title','code','roomid',);
			foreach($allroom as $key => $val) {
				$this->opt['roomid'][$val['roomid']] = $val['roomname'];
			}
			$this->savePostUrl = U('live/Service/create');
			//print_r($list);exit;
			$this->displayConfig();
		}
	}

	//删除直播间信息
	public function deteleCus()
	{
		$cusid = t($_REQUEST['id']);

		if(M ('qqlist') -> delete($cusid) ){
			$this->assign( 'jumpUrl', U('live/Service/index') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

	//查找客服的信息
	private function memberInfo($uid)
	{
		//获取表前缀
		$tp = C('DB_PREFIX');
		$list = M ('qqlist') -> field("{$tp}qqlist.id,{$tp}qqlist.title,{$tp}qqlist.code,{$tp}qqlist.roomid") -> where("{$tp}qqlist.id = '{$uid}'") -> find();
		$arr['room'] = $list;

		return $arr;
	}

}
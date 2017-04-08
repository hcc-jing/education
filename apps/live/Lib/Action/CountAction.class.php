<?php
/**
 * 后台直播管理
 * @author wangjun@chuyouyun.com
 * @version chuyouyun2.0
 */
tsload(APPS_PATH.'/admin/Lib/Action/AdministratorAction.class.php');
class CountAction extends AdministratorAction
{
	/**
	 * 初始化，
	 */
	public function _initialize() {
		$this->pageTitle['index']     = '聊天记录';
		$this->pageTitle['redbag']    = '红包统计';
		$this->pageTitle['flowers']   = '鲜花统计';
		$this->pageTitle['Illegal']   = '违规发言';
		$this->pageTitle['ipblack']   = '黑名单';
		$this->pageTitle['shield']    = '禁言名单';
		$this->pageTitle['setEmpty']    = '清空聊天信息';
		
		$this->pageTab[] = array('title'=>'聊天记录','tabHash'=>'index','url'=>U('live/Count/index'));
		$this->pageTab[] = array('title'=>'红包统计','tabHash'=>'redbag','url'=>U('live/Count/redbag'));
		$this->pageTab[] = array('title'=>'鲜花统计','tabHash'=>'flowers','url'=>U('live/Count/flowers'));
		$this->pageTab[] = array('title'=>'违规发言','tabHash'=>'Illegal','url'=>U('live/Count/Illegal'));
		$this->pageTab[] = array('title'=>'黑名单','tabHash'=>'ipblack','url'=>U('live/Count/ipblack'));
		$this->pageTab[] = array('title'=>'禁言名单','tabHash'=>'shield','url'=>U('live/Count/shield'));
		$this->pageTab[] = array('title'=>'清空聊天信息','tabHash'=>'setEmpty','url'=>U('live/Count/setEmpty'));
		parent::_initialize();
	}
	
	//聊天信息列表（带分页）
	public function index(){
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'index';
		$this->pageKeyList = array('id','uname','touname','time','roomname','content','DOACTION');
		// 搜索选项的key值
		$this->searchKey = array('id','uname','roomid');
		$this->pageButton[] = array('title'=>'搜索聊天信息','onclick'=>"admin.fold('search_form')");
		$this->pageButton[] = array('title'=>'删除聊天信息','onclick'=>"admin.ChatInfoEdit('','delchatinfo','删除','聊天信息')");
		
		//判断是否搜索
		if($_REQUEST['dosearch']) {
			$uname    = t($_REQUEST['uname']);
			$roomid   = t($_REQUEST['roomid']);
			$list     = M ('chatlist') -> field("{$tp}chatlist.*,a.roomname") -> join ("{$tp}studioroom as a on {$tp}chatlist.roomid = a.roomid") -> where("{$tp}chatlist.uname = '{$uname}' and {$tp}chatlist.roomid = '{$roomid}' and {$tp}chatlist.msgtype = 1") -> findPage(50);
			if($list['count']) {
				// $list['data'][0] = $info;
			}else {
				$list = '';
			}
		}else {
			$list = M ('chatlist') -> field("{$tp}chatlist.*,b.roomname") -> join("{$tp}studioroom as b on {$tp}chatlist.roomid = b.roomid") -> where("{$tp}chatlist.msgtype = 1") -> findPage();
		}

		//查询所有房间的信息
		$allroom = M ('studioroom') -> field('roomid,roomname') ->select();
		foreach($allroom as $key => $val) {
			$this->opt['roomid'][$val['roomid']] = $val['roomname'];
		}

		foreach($list['data'] as &$val){
			//客服列表
			$val['time']       = date("Y-m-d H:i:s",$val['time']);
			$val['DOACTION']   .= '<a href="'.U('live/Count/deteleC',array('id'=>$val['id'])).'">删除</a>';
		}

		// echo '<pre>';
		// print_r($list);exit;
		$this->displayList($list);
	}

	//红包列表(带分页)
	public function redbag()
	{
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'redbag';
		$this->pageKeyList = array('s_r_id','uname','num','total','num_balance','total_balance','time');
		// 搜索选项的key值
		$this->searchKey = array('uname');
		$this->pageButton[] = array('title'=>'搜索红包信息','onclick'=>"admin.fold('search_form')");
		
		//判断是否搜索
		if($_REQUEST['dosearch']) {
			$uname    = t($_REQUEST['uname']);
			$list     = M ('redbaglist') -> field("{$tp}redbaglist.*,a.uname") -> join ("{$tp}user as a on {$tp}redbaglist.uid = a.uid") -> where("a.uname = '{$uname}'") -> findPage(50);
			if($list['count']) {
				// $list['data'][0] = $info;
			}else {
				$list = "";
			}
		}else {
			$list = M ('redbaglist') -> field("{$tp}redbaglist.*,b.uname") -> join("{$tp}user as b on {$tp}redbaglist.uid = b.uid") -> findPage();
		}

		foreach($list['data'] as &$val){
			//客服列表
			$val['time']       = date("Y-m-d H:i:s",$val['time']);
		}

		// echo '<pre>';
		// print_r($list);exit;
		$this->displayList($list);
	}

	//鲜花列表(带分页)
	public function flowers()
	{
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'flowers';
		$this->pageKeyList = array('uid','uname','todaycount','monthcount');

		//获取今日开始时间戳和本月开始时间戳
		$start_month=strtotime(date("Y-m",time())); //这个月开始
		$today=strtotime(date("Y-m-d",time())); //今天开始
		
		//先查找老师
		$teather = M ('user_group_link') -> field("{$tp}user_group_link.*,a.uname") -> join("{$tp}user as a on {$tp}user_group_link.uid = a.uid") -> where("{$tp}user_group_link.user_group_id=3") -> select();
		//循环遍历
		if($teather) {
			foreach($teather as $val) {
				$todayflowers = M ('comsumelist') -> where("jid = '{$val["uid"]}' and time > $today") ->count();
				$thismonthflo = M ('comsumelist') -> where("jid = '{$val["uid"]}' and time > $start_month") ->count();
				$val['todaycount'] = $todayflowers;
				$val['monthcount'] = $thismonthflo;
				$list['data'][] = $val;
			}	
		}
		$list['count'] = count($list['data']);
		// echo '<pre>';
		// print_r($list);exit;
		$this->displayList($list);
	}

	//违规信息列表（带分页）
	public function Illegal(){
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'Illegal';
		$this->pageKeyList = array('id','uname','touname','time','roomname','content','DOACTION');
		// 搜索选项的key值
		$this->searchKey = array('id','uname','roomid');
		$this->pageButton[] = array('title'=>'搜索违规信息','onclick'=>"admin.fold('search_form')");
		$this->pageButton[] = array('title'=>'删除违规信息','onclick'=>"admin.SenInfoEdit('','delSeninfo','删除','违规信息')");
		
		//判断是否搜索
		if($_REQUEST['dosearch']) {
			$uname    = t($_REQUEST['uname']);
			$roomid   = t($_REQUEST['roomid']);
			$list     = M ('chatlist_sen') -> field("{$tp}chatlist_sen.*,a.roomname") -> join ("{$tp}studioroom as a on {$tp}chatlist_sen.roomid = a.roomid") -> where("{$tp}chatlist_sen.uname = '{$uname}' and {$tp}chatlist_sen.roomid = '{$roomid}'") -> findPage(50);
			if($list['count']) {
				// $list['data'][0] = $info;
			}else {
				$list = '';
			}
		}else {
			$list = M ('chatlist_sen') -> field("{$tp}chatlist_sen.*,b.roomname") -> join("{$tp}studioroom as b on {$tp}chatlist_sen.roomid = b.roomid") -> findPage();
		}

		//查询所有房间的信息
		$allroom = M ('studioroom') -> field('roomid,roomname') ->select();
		foreach($allroom as $key => $val) {
			$this->opt['roomid'][$val['roomid']] = $val['roomname'];
		}

		foreach($list['data'] as &$val){
			//客服列表
			$val['time']       = date("Y-m-d H:i:s",$val['time']);
			$val['DOACTION']   .= '<a href="'.U('live/Count/deteleCs',array('id'=>$val['id'])).'">删除</a>';
		}

		// echo '<pre>';
		// print_r($list);exit;
		$this->displayList($list);
	}

	//黑名单信息列表（带分页）
	public function ipblack(){
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'ipblack';
		$this->pageKeyList = array('id','uname','ip','makename','mtime','DOACTION');
		// 搜索选项的key值
		$this->searchKey = array('uname');
		$this->pageButton[] = array('title'=>'搜索黑名单信息','onclick'=>"admin.fold('search_form')");
		$this->pageButton[] = array('title'=>'删除黑名单信息','onclick'=>"admin.BlackInfoEdit('','delBlackinfo','删除','黑名单信息')");
		
		//判断是否搜索
		if($_REQUEST['dosearch']) {
			$uname    = t($_REQUEST['uname']);
			$list     = M ('ipblacklist') -> field("{$tp}ipblacklist.*,a.uname") -> join ("{$tp}user as a on {$tp}ipblacklist.mid = a.uid") -> where("a.uname = '{$uname}'") -> findPage();
			if($list['count']) {
				// $list['data'][0] = $info;
			}else {
				$list = '';
			}
		}else {
			$list = M ('ipblacklist') -> field("{$tp}ipblacklist.*,b.uname") -> join("{$tp}user as b on {$tp}ipblacklist.mid = b.uid") -> findPage();
		}

		//查询所有房间的信息
		$allroom = M ('studioroom') -> field('roomid,roomname') ->select();
		foreach($allroom as $key => $val) {
			$this->opt['roomid'][$val['roomid']] = $val['roomname'];
		}

		foreach($list['data'] as &$val){
			//客服列表
			$makeu  =  M ('user') -> field('uname') -> where("uid = '{$val["opuid"]}'") -> find();
			$val['mtime']       = date("Y-m-d H:i:s",$val['mtime']);
			$val['makename']    = $makeu['uname'];
			$val['DOACTION']   .= '<a href="'.U('live/Count/deteleBlack',array('id'=>$val['id'])).'">删除</a>';
		}

		// echo '<pre>';
		// //print_r(M ('ipblacklist')->getLastSql());exit;
		// print_r($list);exit;
		$this->displayList($list);
	}

	//禁言信息列表（带分页）
	public function shield(){
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'shield';
		$this->pageKeyList = array('id','uname','roomname','mtime','DOACTION');
		//删除信息
		$this->pageButton[] = array('title'=>'删除屏蔽信息','onclick'=>"admin.ShieldInfoEdit('','delShieldinfo','删除','屏蔽信息')");
		//查询屏蔽信息
		$list = M ('shield') -> findPage();

		//查询所有房间的信息
		$allroom = M ('studioroom') -> field('roomid,roomname') ->select();
		foreach($allroom as $key => $val) {
			$this->opt['roomid'][$val['roomid']] = $val['roomname'];
		}

		foreach($list['data'] as &$val){
			//客服列表
			if($val['adminid'] != 14) {
				$makeu  =  M ('user') -> field("{$tp}user.uname,a.roomname") -> join("{$tp}studioroom as a on {$tp}user.roomid = a.roomid") -> where("{$tp}user.uid = '{$val["mid"]}'") -> find();
			}else {
				$makeu  =  M ('guest') -> field("{$tp}guest.uname,a.roomname") -> join("{$tp}studioroom as a on {$tp}guest.roomid = a.roomid") -> where("{$tp}guest.id = '{$val["mid"]}'") -> find();
			}
			
			$val['mtime']       = date("Y-m-d H:i:s",$val['expiretime']);
			$val['uname']       = $makeu['uname'];
			$val['roomname']     = $makeu['roomname'];
			$val['DOACTION']   .= '<a href="'.U('live/Count/deteleS',array('id'=>$val['id'])).'">删除</a>';
		}

		// echo '<pre>';
		// print_r(M ('guest')->getLastSql());exit;
		// print_r($list);exit;
		$this->displayList($list);
	}
	
	//清空聊天信息
	public function setEmpty()
	{
		if(M ('chatlist') ->where('1')-> delete() ){
			$this->assign( 'jumpUrl', U('live/Count/index') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}
	//删除聊天信息
	public function deteleC()
	{
		$cusid = t($_REQUEST['id']);

		if(M ('chatlist') -> delete($cusid) ){
			$this->assign( 'jumpUrl', U('live/Count/index') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

	//删除屏蔽信息
	public function deteleS()
	{
		$cusid = t($_REQUEST['id']);

		if(M ('shield') -> delete($cusid) ){
			$this->assign( 'jumpUrl', U('live/Count/shield') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

	//删除黑名单信息
	public function deteleBlack()
	{
		$cusid = t($_REQUEST['id']);

		if(M ('ipblacklist') -> delete($cusid) ){
			$this->assign( 'jumpUrl', U('live/Count/ipblack'));
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

	//删除聊天信息
	public function deteleCs()
	{
		$cusid = t($_REQUEST['id']);

		if(M ('chatlist_sen') -> delete($cusid) ){
			$this->assign( 'jumpUrl', U('live/Count/Illegal') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

	//批量删除聊天信息
	public function delchatinfo()
	{
		$return =  $this->doDeleteChat($_POST['id']);
		
		if($return['status'] == 1){
			$return['data'] = L('PUBLIC_DELETE_SUCCESS');
		}elseif($return['status'] === false){
			$return['data'] = L('PUBLIC_DELETE_FAIL');
		}elseif($return['status'] == 100003){
			$return['data'] = '请选择要删除的内容';
		}else{
			$return['data'] = '操作错误';	
		}
		echo json_encode($return);exit();
	}

	//批量删除屏蔽信息
	public function delShieldinfo()
	{
		$return =  $this->doDeleteShield($_POST['id']);
		
		if($return['status'] == 1){
			$return['data'] = L('PUBLIC_DELETE_SUCCESS');
		}elseif($return['status'] === false){
			$return['data'] = L('PUBLIC_DELETE_FAIL');
		}elseif($return['status'] == 100003){
			$return['data'] = '请选择要删除的内容';
		}else{
			$return['data'] = '操作错误';	
		}
		echo json_encode($return);exit();
	}

	//批量删除聊天信息
	public function delSeninfo()
	{
		$return =  $this->doDeleteSen($_POST['id']);
		
		if($return['status'] == 1){
			$return['data'] = L('PUBLIC_DELETE_SUCCESS');
		}elseif($return['status'] === false){
			$return['data'] = L('PUBLIC_DELETE_FAIL');
		}elseif($return['status'] == 100003){
			$return['data'] = '请选择要删除的内容';
		}else{
			$return['data'] = '操作错误';	
		}
		echo json_encode($return);exit();
	}

	//批量黑名单信息
	public function delBlackinfo()
	{
		$return =  $this->doDeleteBlack($_POST['id']);
		
		if($return['status'] == 1){
			$return['data'] = L('PUBLIC_DELETE_SUCCESS');
		}elseif($return['status'] === false){
			$return['data'] = L('PUBLIC_DELETE_FAIL');
		}elseif($return['status'] == 100003){
			$return['data'] = '请选择要删除的内容';
		}else{
			$return['data'] = '操作错误';	
		}
		echo json_encode($return);exit();
	}


	/**
     * 聊天信息批量操作
     * @param integer|array $id 聊天信息,可以是单个也可以是多个
     * @return array 操作状态【1:删除成功;100003:要删除的ID不合法;false:删除失败】
     */
    private function doDeleteChat($id){
        if(is_array($id)){
            $id = implode(',',$id);
        }
        if(!trim($id)){
            return array('status'=>100003);
        }

        $i = M('chatlist')->where(array('id'=>array('in',(string)$id)))->delete();
        if($i === false){
            return false;
        }else{
            return array('status'=>1);
        }
    }

    /**
     * 屏蔽信息批量操作
     * @param integer|array $id 屏蔽信息,可以是单个也可以是多个
     * @return array 操作状态【1:删除成功;100003:要删除的ID不合法;false:删除失败】
     */
    private function doDeleteShield($id){
        if(is_array($id)){
            $id = implode(',',$id);
        }
        if(!trim($id)){
            return array('status'=>100003);
        }

        $i = M('shield')->where(array('id'=>array('in',(string)$id)))->delete();
        if($i === false){
            return false;
        }else{
            return array('status'=>1);
        }
    }

    /**
     * 黑名单信息批量操作
     * @param integer|array $id 黑名单信息,可以是单个也可以是多个
     * @return array 操作状态【1:删除成功;100003:要删除的ID不合法;false:删除失败】
     */
    private function doDeleteBlack($id){
        if(is_array($id)){
            $id = implode(',',$id);
        }
        if(!trim($id)){
            return array('status'=>100003);
        }

        $i = M('ipblacklist')->where(array('id'=>array('in',(string)$id)))->delete();
        if($i === false){
            return false;
        }else{
            return array('status'=>1);
        }
    }

    /**
     * 聊天信息批量操作
     * @param integer|array $id 聊天信息,可以是单个也可以是多个
     * @return array 操作状态【1:删除成功;100003:要删除的ID不合法;false:删除失败】
     */
    private function doDeleteSen($id){
        if(is_array($id)){
            $id = implode(',',$id);
        }
        if(!trim($id)){
            return array('status'=>100003);
        }

        $i = M('chatlist_sen')->where(array('id'=>array('in',(string)$id)))->delete();
        if($i === false){
            return false;
        }else{
            return array('status'=>1);
        }
    }

}
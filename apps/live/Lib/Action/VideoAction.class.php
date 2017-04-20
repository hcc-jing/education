<?php
/**
 * 后台直播间视频列表
 * @author wangjun@chuyouyun.com
 * @version chuyouyun2.0
 */
tsload(APPS_PATH.'/admin/Lib/Action/AdministratorAction.class.php');
class VideoAction extends AdministratorAction
{
	/**
	 * 初始化，
	 */
	public function _initialize() {
		$this->pageTitle['index']    = '视频列表';
		$this->pageTitle['create']   = '添加视频';
		$this->pageTitle['update']   = '修改视频';
		
		$this->pageTab[] = array('title'=>'视频列表','tabHash'=>'index','url'=>U('live/Video/index'));
		// $this->pageTab[] = array('title'=>'修改会员信息','tabHash'=>'update','url'=>U('live/Video/update'));
		$this->pageTab[] = array('title'=>'添加视频','tabHash'=>'create','url'=>U('live/Video/create'));
		parent::_initialize();
	}
	
	//直播间视频列表（带分页）
	public function index(){
		//获取表前缀
		$tp = C('DB_PREFIX');
		$_REQUEST['tabHash'] = 'index';
		$this->pageKeyList = array('id','videoname','time','DOACTION');
		// 搜索选项的key值
		$this->pageButton[] = array('title'=>'删除视频信息','onclick'=>"admin.VideoInfoEdit('','delvideoinfo','删除','视频信息')");

		//查询所有视频的信息
		$list = M ('videolist') ->findPage();

		foreach($list['data'] as &$val){
			//客服列表
			$val['time']       = date("Y-m-d H:i:s",$val['time']);
			$val['DOACTION']   = '<a href="'.U('live/Video/update',array('id'=>$val['id'])).'">编辑</a> | ';
			$val['DOACTION']   .= '<a href="'.U('live/Video/deteleVideo',array('id'=>$val['id'])).'" onclick="return confirm(\'确认删除该视频吗?\');">删除</a>';
		}

		// echo '<pre>';
		// print_r($list);exit;
		$this->displayList($list);
	}
	
	
	//编辑会员信息
	public function update(){
		if( isset($_POST) ) {
			$id = t($_REQUEST['id']);

			if(empty($_POST['videoname'])) {
				$this->error('请输入视频名称');
			}
			if($_POST['video_url']) {
				$filename              = t($_REQUEST['video_url']);
				$url_id                = trim(t($_REQUEST['video_url_ids']),'|');
				//根据视频id查找相关信息
				$videoinfo = M ('attach') -> field('save_path,save_name') -> where ("attach_id = '{$url_id}'") -> find();
				$data['video_url']     = '/data/upload/'.$videoinfo['save_path'].$videoinfo['save_name'];
				$data['time']          = time();
				$data['attach_id']     = $url_id;;
			}

			$data['videoname']     = t($_REQUEST['videoname']);
			$vid = M('videolist') -> where("id = '{$id}'") -> save($data);
			//print_r(M('videolist')->getLastSql());exit;
			//如果插入数据成功
			if($vid) {
				$this->assign( 'jumpUrl', U('live/Video/index') );
				$this->success('修改成功');
			} else {
				$this->error('修改失败');
			}
		} else {
			$_REQUEST['tabHash'] = 'update';

			$id    = t($_REQUEST['id']);

			$this->pageKeyList = array('id','videoname','video_url');

			$list   = $this->videoInfo($id);
			$this->savePostUrl = U('live/Video/update');
			//print_r($list);exit;
			$this->displayConfig($list['room']);
		}
	}

	//添加视频信息
	public function create(){
		if( isset($_POST) ) {
			$uid = t($_REQUEST['uid']);

			if(empty($_POST['videoname'])) {
				$this->error('请输入视频名称');
			}
			if(empty($_POST['video_url'])) {
				$this->error('请上传视频');
			}
			$data['videoname']     = t($_REQUEST['videoname']);
			$filename              = t($_REQUEST['video_url']);
			$url_id                = trim(t($_REQUEST['video_url_ids']),'|');
			//根据视频id查找相关信息
			$videoinfo = M ('attach') -> field('save_path,save_name') -> where ("attach_id = '{$url_id}'") -> find();
			$data['time']          = time();
			$data['attach_id']     = $url_id;
			$data['video_url']     = '/data/upload/'.$videoinfo['save_path'].$videoinfo['save_name'];
			if(M('videolist') -> create($data)) {
				$vid = M('videolist') -> add();
			}else {
				$this->error(M ('videolist') -> getError());
			}
			//如果插入数据成功
			if($vid) {
				$this->assign( 'jumpUrl', U('live/Video/index') );
				$this->success('添加成功');
			} else {
				$this->error('添加失败');
			}
		} else {
			$_REQUEST['tabHash'] = 'create';

			$this->pageKeyList = array('videoname','video_url');

			$this->savePostUrl = U('live/Video/create');
			//print_r($list);exit;
			$this->displayConfig();
		}
	}

	//删除直播间信息
	public function deteleVideo()
	{
		$veid = t($_REQUEST['id']);
		//查找当前视频所在附件表的id
		$attach = M ('videolist') -> field('video_url,attach_id') -> where("id = '{$veid}'") -> find();
		if(M ('videolist') -> delete($veid)){			
			M ('attach') -> where("attach_id = '{$attach["attach_id"]}'") -> delete();
			//删除上传的文件
			//判断是否存在
			if(file_exists($_SERVER['DOCUMENT_ROOT'].$attach['video_url'])) {
				unlink($_SERVER['DOCUMENT_ROOT'].$attach['video_url']);
			}
			$this->assign( 'jumpUrl', U('live/Video/index') );
			$this->success('删除成功');
		} else {
			$this->error('删除失败');
		}
	}

	//查找客服的信息
	private function videoInfo($uid)
	{
		//获取表前缀
		$tp = C('DB_PREFIX');
		$list = M ('videolist') -> where("id = '{$uid}'") -> find();
		$arr['room'] = $list;

		return $arr;
	}

	//批量删除视频信息
	public function delvideoinfo()
	{
		$return =  $this->doDeleteVideo($_POST['id']);
		
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
     * 视频信息批量操作
     * @param integer|array $id 视频信息,可以是单个也可以是多个
     * @return array 操作状态【1:删除成功;100003:要删除的ID不合法;false:删除失败】
     */
    private function doDeleteVideo($id){
        if(is_array($id)){
        	foreach($ids as $val) {
	        	//查找当前视频所在附件表的id
				$attach = M ('videolist') -> field('video_url,attach_id') -> where("id = '{$val}'") -> find();
				M ('attach') -> where("attach_id = '{$attach["attach_id"]}'") -> delete();
				//删除上传的文件
				//判断是否存在
				if(file_exists($_SERVER['DOCUMENT_ROOT'].$attach['video_url'])) {
					unlink($_SERVER['DOCUMENT_ROOT'].$attach['video_url']);
				}
	        }
            $id = implode(',',$id);
        }
        if(!trim($id)){
            return array('status'=>100003);
        }
        $attach = M ('videolist') -> field('video_url,attach_id') -> where("id = '{$id}'") -> find();
		M ('attach') -> where("attach_id = '{$attach["attach_id"]}'") -> delete();
		//删除上传的文件
		//判断是否存在
		if(file_exists($_SERVER['DOCUMENT_ROOT'].$attach['video_url'])) {
			unlink($_SERVER['DOCUMENT_ROOT'].$attach['video_url']);
		}
        $i = M('videolist')->where(array('id'=>array('in',(string)$id)))->delete();
        if($i === false){
            return false;
        }else{
            return array('status'=>1);
        }
    }

}
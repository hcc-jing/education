<?php
/**
 * @author ashangmanage <ashangmanage@phpzsm.com>
 * @version CY1.0
 */
tsload(APPS_PATH.'/admin/Lib/Action/AdministratorAction.class.php');
class AdminTeacherAction extends AdministratorAction{
    /**
     * 初始化，配置内容标题
     * @return void
     */
    public function _initialize()
    {
        parent::_initialize();
    }
    
/**
	 * 初始化专题配置
	 * 
	 * @return void
	 */
	private function _initTabSpecial() {
		// Tab选项
		$this->pageTab [] = array (
				'title' => '讲师列表',
				'tabHash' => 'index',
				'url' => U ( 'classroom/AdminTeacher/index' ) 
		);
		$this->pageTab [] = array (
				'title' => '添加讲师',
				'tabHash' => 'addTeacher',
				'url' => U ( 'classroom/AdminTeacher/addTeacher' ) 
		);
        $this->pageTab [] = array (
                'title' => '授课课程列表',
                'tabHash' => 'teachingindex',
                'url' => U ( 'classroom/AdminTeacher/teachingindex' ) 
        );
        $this->pageTab [] = array (
                'title' => '添加授课课程',
                'tabHash' => 'addTeachingCourse',
                'url' => U ( 'classroom/AdminTeacher/addTeachingCourse' ) 
        );
       
	}

    public function index(){
    	$id=intval($_POST['id']);//获取讲师id
    	$name=t($_POST['name']);//获取讲师姓名
    	$title=t($_POST['title']);//获取讲师职称
    	$inro=t($_POST['inro']);//获取讲师简介
        // 页面具有的字段，可以移动到配置文件中！！！
        $this->pageKeyList = array(
            'id','uid','name','face','title','inro','DOACTION'
        );
        $this->_initTabSpecial();
        $this->searchKey = array('id','uid','name','title','inro');
        $this->pageButton[] = array('title'=>'删除讲师','onclick'=>"admin.delTeacherAll('delTeacher')");
        $this->pageButton[] = array('title'=>'搜索讲师','onclick'=>"admin.fold('search_form')");
        $this->assign('pageTitle','讲师管理');
        $map=array(
            'is_del'=>0,
        );
        if(!empty($id))$map['id']=$id;
        if(!empty($name))$map['name']=array("like","%$name%");
        if(!empty($title))$map['title']=array("like","%$title%");
        if(!empty($inro))$map['inro']=array("like","%$inro%");        
        $trlist=D("ZyTeacher")->where($map)->order("ctime DESC")->findPage(20);
        // echo "<pre>";
        // print_r($trlist);exit;
        foreach($trlist['data'] as &$val){
        	$val['face']   = "<img src=".getAttachUrlByAttachId($val['head_id'])." width='60px' height='60px'>";
        	$val['inro']  = msubstr($val['inro'], 0,100);
          	$val['DOACTION'].="<a href=".U('classroom/AdminTeacher/addTeacher',array('id'=>$val['id'])).";>编辑</a>";
          	$val['DOACTION'].=" | <a href=javascript:admin.delTeacher(".$val['id'].",'delTeacher');>删除</a>";
        }
        $this->_listpk = 'id';
        $this->displayList($trlist);

    }

    //讲师授课课程列表
    public function teachingindex(){
        //$name=t($_POST['name']);//获取讲师名称
        // 页面具有的字段，可以移动到配置文件中！！！
        $_REQUEST['tabHash'] = 'teachingindex';
        $this->pageKeyList = array(
            'id','course_id','course_name','course_teacher','course_price','course_inro','DOACTION'
        );
        $this->_initTabSpecial();
        //$this->searchKey = array('name');
        $this->pageButton[] = array('title'=>'删除课程','onclick'=>"admin.delCourseAll('delCourse')");
        //$this->pageButton[] = array('title'=>'搜索讲师课程','onclick'=>"admin.fold('search_form')");
        $this->assign('pageTitle','授课课程列表');
        $map=array(
            'is_del'=>0,
        );
        //if(!empty($name))$map['name']=array("like","%$name%");
        $trlist=M("zy_teacher_course")->where($map)->order("ctime DESC")->findPage(20);
        foreach($trlist['data'] as &$val){
            $val['id'] = $val['course_id'];
            $val['course_inro']  = msubstr($val['course_inro'], 0,100);
            $val['DOACTION'].="<a href=".U('classroom/AdminTeacher/addTeachingCourse',array('id'=>$val['course_id'])).";>编辑</a>";
            $val['DOACTION'].=" | <a href=javascript:admin.delCourse(".$val['course_id'].",'delCourse');>删除</a>";
        }
        $this->_listpk = 'id';
        $this->displayList($trlist);

    }

    /**
     * 删除讲师
     */
    public function delTeacher(){
        $ids=implode(",",$_POST['ids']);
        $ids=trim(t($ids),",");
        if($ids==""){
            $ids=intval($_POST['ids']);
        }
        $msg=array();
        $where=array(
            'id'=>array('in',$ids)
        );
        $data['is_del']=1;
        $res=D('ZyTeacher')->where($where)->save($data);

        if($res!==false){
            $msg['data']=L('PUBLIC_DELETE_SUCCESS');
            $msg['status']=1;
            echo json_encode($msg);
        }else{
            $msg['data']="删除失败!";
            echo json_encode($msg);
        }
    }
    /**
     * 删除课程
     */
    public function delCourse(){
        $ids=implode(",",$_POST['ids']);
        $ids=trim(t($ids),",");
        if($ids==""){
            $ids=intval($_POST['ids']);
        }
        $msg=array();
        $where=array(
            'course_id'=>array('in',$ids)
        );
        $data['is_del']=1;
        $res=M('zy_teacher_course')->where($where)->save($data);

        if($res!==false){
            $msg['data']=L('PUBLIC_DELETE_SUCCESS');
            $msg['status']=1;
            echo json_encode($msg);
        }else{
            $msg['data']="删除失败!";
            echo json_encode($msg);
        }
    }
    /**
     * 添加讲师
     * Enter description here ...
     */
    public function addTeacher(){
    	$id   = intval($_GET['id']);
    	
    	$this->_initTabSpecial();
		$this->onsubmit = 'admin.checkTeacher(this)';
        $this->opt['teach_way'] = array('1'=>"线上授课",'2'=>"线下授课",'3'=>"线上/线下均可");
		$this->pageKeyList = array (
			'uid','name','title','head_id','teacher_age','high_school','graduate_school','label','teach_way','Teach_areas','inro','teach_evaluation',
		);
		$this->notEmpty = array (
		        'uid',
				'name',
                'teacher_age',
                'high_school',
                'graduate_school',
                'teach_evaluation',
                'label',
                'teach_way',
				'inro',
				'title',
		        'head_id'
		);
        //print_r($this->notEmpty);exit;
        if($id){
			$this->savePostUrl = U ( 'classroom/AdminTeacher/doAddTeacher','type=save&id='.$id);
			$zyTeacher = D('ZyTeacher')->where( 'id=' .$id )->find ();
            if(empty($zyTeacher['uid'])){
                $zyTeacher['uid']=null;
            }
			$this->assign('pageTitle','编辑讲师-'.$zyTeacher['name']);
			//说明是编辑
			$this->displayConfig($zyTeacher);
		}else{
			$this->savePostUrl = U ('classroom/AdminTeacher/doAddTeacher','type=add');
			$this->assign('pageTitle','添加讲师');
			//说明是添加
			$this->displayConfig();
		}
		
    }
    /**
     * 添加授课课程
     * Enter description here ...
     */
    public function addTeachingCourse(){
        $id   = intval($_GET['id']);
        $this->_initTabSpecial();
        $this->onsubmit = 'admin.checkTeacher(this)';
        $this->pageKeyList = array (
            'course_teacher','course_name','course_price','course_inro',
        );
        $this->notEmpty = array (
                'course_name',
                'course_teacher',
                'course_price',
        );
        //print_r($this->notEmpty);exit;
        if($id){
            $_REQUEST['tabHash'] = 'addTeachingCourse';
            $this->savePostUrl = U ( 'classroom/AdminTeacher/doAddCourse','type=save&id='.$id);
            $zyTeacher = M('zy_teacher_course')->where( 'course_id=' .$id )->find ();
            if(empty($zyTeacher['course_id'])){
                $zyTeacher['course_id']=null;
            }
            //print_r($zyTeacher);exit;
            $this->assign('pageTitle','编辑课程-'.$zyTeacher['course_name']);
            //说明是编辑
            $this->displayConfig($zyTeacher);
        }else{            
            $this->savePostUrl = U ('classroom/AdminTeacher/doAddCourse','type=add');
            $this->assign('pageTitle','添加讲师');
            //说明是添加
            $this->displayConfig();
        }
        
    }
    /**
     * 处理添加讲师
     * Enter description here ...
     */
    public function doAddTeacher(){
    	$id=intval($_GET['id']);
    	$type= t($_GET['type']);
    	//要添加的数据
    	$map=array(
    	'name'=>t($_POST['name']),
    	'inro'=>t($_POST['inro']),
    	'head_id'=>intval($_POST['head_id']),
    	'title'=>t($_POST['title']),
    	'ctime'=>time(),
        'teacher_age'=>t($_POST['teacher_age']),
        'label'=>t($_POST['label']),
        'high_school'=>t($_POST['high_school']),
        'graduate_school'=>t($_POST['graduate_school']),
        'teach_evaluation'=>t($_POST['teach_evaluation']),
        'teach_way'=>t($_POST['teach_way']),
        'Teach_areas'=>t($_POST['Teach_areas']),
        'uid'=>intval($_POST['uid'])
    	);
        //print_r($_POST);exit;
        //数据验证
    	if(!$map ['name']){
			$this->error('讲师姓名不能为空!');
		}
		if(!$map ['inro']){
			$this->error('讲师简介不能为空');
		}
		if(!$map ['head_id']){
			$this->error('请上传讲师的照片!');
		}
   		if(!$map ['title']){
			$this->error('讲师职称不能为空');
		}
    	if($type == 'add'){
            if(M("zy_teacher")->where("uid=".intval($_POST['uid']))->find()){
                $this->error('该讲师已被认证过！');
            }
    		$res=D('ZyTeacher')->add($map);
    		if(!$res)$this->error("对不起，添加失败！");
    		$this->success("添加讲师成功！");
    	}else if($type=='save' && $id){
    		$res=D('ZyTeacher')->where("id=$id")->save($map);
    		if(!$res)$this->error("对不起，修改讲师失败！");
    		$this->success("修改讲师成功!");
    	}
    	
    }

    /**
     * 处理添加课程
     * Enter description here ...
     */
    public function doAddCourse(){
        $id=intval($_GET['id']);
        $type= t($_GET['type']);
        //要添加的数据
        $map=array(
        'course_name'=>t($_POST['course_name']),
        'course_teacher'=>intval($_POST['course_teacher']),
        'course_price'=>intval($_POST['course_price']),
        'course_inro'=>t($_POST['course_inro']),
        'ctime'=>time(),
        );
        //print_r($_POST);exit;
        //数据验证
        if(!$map ['course_name']){
            $this->error('课程名称不能为空!');
        }
        if(!$map ['course_teacher']){
            $this->error('讲师不能为空');
        }
        if(!$map ['course_price']){
            $this->error('价钱不能为空');
        }
        if($type == 'add'){
            $res=M('zy_teacher_course')->add($map);
            if(!$res)$this->error("对不起，添加失败！");
            $this->assign( 'jumpUrl', U('classroom/AdminTeacher/teachingindex') );
            $this->success("添加课程成功！");
        }else if($type=='save' && $id){
            $_REQUEST['tabHash'] = 'teachingindex';
            $res=M('zy_teacher_course')->where("course_id=$id")->save($map);
            if(!$res)$this->error("对不起，修改讲师失败！");
            $this->assign( 'jumpUrl', U('classroom/AdminTeacher/teachingindex') );
            $this->success("修改课程成功!");
        }
        
    }
}
?>
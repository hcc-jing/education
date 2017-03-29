<?php
/**
 * 用户模型 - 数据对象模型
 * @author jason <yangjs17@yeah.net> 
 * @version TS3.0
 */
class StudioRoomModel extends Model {
	protected $tableName = 'studioroom';
	protected $error = '';
	protected $fields = array (
			0  => 'id',
			1  => 'roomid',
			2  => 'roomname',
			3  => 'password',
			4  => 'room_ak',
			5  => 'yy_number',
			6  => 'speak_interval',
			7  => 'onoff',
			8  => 'viewtime',
			9  => 'viewstatus',
			10 => 'is_guest',
			11 => 'sensitive_words',
			'_autoinc' => true,
			'_pk' => 'id' 
	);

	protected $_validate = array(     
		array('roomname','require','房间名称必须！'), //默认情况下用正则进行验证     
		array('roomname','','房间名称已经存在！',0,'unique',1), // 在新增的时候验证name字段是否唯一      
	);
}
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
}
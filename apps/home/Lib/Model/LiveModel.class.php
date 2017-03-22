<?php
/**
 * 直播模型 - 业务逻辑模型
 * @author 
 * @version TS3.0
 */
class LiveModel extends model
{
	/*
	 *	查找所有直播间的信息,用于进入直播间时，判断传入的房间号是否正确
	 *
	 */
	public function getroom()
	{
		//查找房间信息
		//实例化模型
		$roommodel = D ('studioroom');
		$roominfo = $roommodel->order('id asc')->select();
		//所有房间id的集合
		$roomids = array();
		if($roominfo) {
			foreach($roominfo as $val) {
				$roomids[] .= $val['roomid'];
			}
		}
		return $roomids;
	}
}
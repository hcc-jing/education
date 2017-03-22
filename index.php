<?php 
//网站根路径设置
define('SITE_PATH', dirname(__FILE__));

//载入核心文件
require(SITE_PATH.'/core/core.php');
//file_get_contents('http://'.$_SERVER['HTTP_HOST'].'/cleancache.php');
if(isset($_GET['debug'])){
	C('APP_DEBUG', true);
	C('SHOW_RUN_TIME', true);
	C('SHOW_ADV_TIME', true);
	C('SHOW_DB_TIMES', true);
	C('SHOW_CACHE_TIMES', true);
	C('SHOW_USE_MEM', true);
	C('LOG_RECORD', true);
	C('LOG_RECORD_LEVEL',  array (
				'EMERG',
				'ALERT',
				'CRIT',
				'ERR',
		        'SQL'
		));
}

$time_run_start = microtime(TRUE);
$mem_run_start = memory_get_usage();

//实例化一个网站应用实例
$App = new App();
$App->run();

$mem_run_end = memory_get_usage();
$time_run_end = microtime(TRUE);

if(C('APP_DEBUG')){
	//数据库查询信息
	echo '<div align="left">';
	//缓存使用情况
	//print_r(Cache::$log);
	echo '<hr>';
	echo ' Memories: '."<br/>";
	echo 'ToTal: ',number_format(($mem_run_end - $mem_include_start)/1024),'k',"<br/>";
	echo 'Include:',number_format(($mem_run_start - $mem_include_start)/1024),'k',"<br/>";
	echo 'Run:',number_format(($mem_run_end - $mem_run_start)/1024),'k<br/><hr/>';
	echo 'Time:<br/>';
	echo 'ToTal: ',$time_run_end - $time_include_start,"s<br/>";
	echo 'Include:',$time_run_start - $time_include_start,'s',"<br/>";
	echo 'Run:',$time_run_end - $time_run_start,'s<br/><br/>';
	echo '<hr>';
	$log = Log::$log;
	foreach($log as $l){
		$l = explode('SQL:', $l);
		$l = $l[1];
		$l = str_replace(array('RunTime:', 's SQL ='), ' ', $l);
		echo $l.'<br/>';
	}
	$files = get_included_files();
    dump($files);
   echo '</div>';
}

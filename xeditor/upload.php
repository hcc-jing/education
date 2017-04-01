<?php
header("Access-Control-Allow-Origin:*");
error_reporting(0);
$url  = 'http://'.$_SERVER['HTTP_HOST'];
$file = (isset($_POST["file"])) ? $_POST["file"] : '';
$type = (isset($_POST["type"])) ? $_POST["type"] : '';
 if($file && $type )
 {

	$path=date('y-m-d');
	//判断目录存在否，存在给出提示，不存在则创建目录
	if (!is_dir($path)){

		$res=mkdir(iconv("UTF-8", "GBK", $path),0777,true);

	}


    $data = base64_decode($file);

	switch ($type) {
		case 'image/pjpeg' :
		  $data = base64_decode(str_replace('data:image/pjpeg;base64,', '', $file));
			$ext=".jpg";
			break;
		case 'image/jpeg' :
		  $data = base64_decode(str_replace('data:image/jpeg;base64,', '', $file));
			$ext=".jpg";
			break;
		case 'image/gif' :
		  $data = base64_decode(str_replace('data:image/gif;base64,', '', $file));
			$ext=".gif";
			break;
		case 'image/png' :
		$data = base64_decode(str_replace('data:image/png;base64,', '', $file));
		$ext=".png";
			break;

	}

	if(!$ext){
		die;
	}

	$randNum = rand(1, 10000000000) . rand(1, 10000000000);//随机数
    $t = time().$randNum ;
	$t=substr(md5($t),8,6);//6位md5加密
    $name =$t.$ext;
    file_put_contents($path.'/'.$name, $data);
    echo $path.'/'.$name;
    die;
 }
 ?>
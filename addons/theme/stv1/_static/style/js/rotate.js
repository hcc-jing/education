$(function(){
	var $hand = $('.hand');
	$hand.click(function(){
		 $.get("action.php?type=rotate",function(data,status){
		 if(data=='invalidateMobile'){
			$('.rotateMobile').show();
			return false;
		 }
			data=parseInt(data);
		switch(data){
			case 1:
				rotateFunc(1,16,'特伦舒牛奶一箱');
				break;
			case 2:
				rotateFunc(2,47,'自行车一辆');
				break;
			case 3:
				rotateFunc(3,76,'ipaid Aair2');
				break;
			case 4:
				rotateFunc(4,106,'再接再厉');
				break;
			case 5:
				rotateFunc(5,135,'精品棉袜');
				break;
			case 6:
				rotateFunc(6,164,'电饭煲');
				break;
			case 7:
				rotateFunc(7,200,'洗衣液');
				break;
			case 8:
				rotateFunc(8,241,'再接再厉');
				break;
			case 9:
				rotateFunc(9,278,'iphone 6s');
				break;
			case 10:
				rotateFunc(10,326,'再接再厉');
				break;
		
	
			
			}
		});
	});

	var rotateFunc = function(awards,angle,text){
		$hand.stopRotate();
		$hand.rotate({
			angle: 0,
			duration: 8000,
			animateTo: angle + 1800,
			callback: function(){
			   alert(text);
			}
		});
	};
});

function rotateSendMsg(e){
	var tel=$("#rmobile");
	var v=tel.val();
	var isTelephone=/1[34758]{1}\d{9}$/.test(v);
	if(!v){
		alert("手机号不能为空");
		return false;
	}else if(!isTelephone){
		alert('手机号不正确');
		return false;	
	}
	$.ajax({
         url: "duanxin/demo.php?type=sendrotatemsg",  
         type: "POST",
         data:{telephone:v},
         //dataType: "json",
         error: function(){  
             alert('Error loading XML document');  
         },  
         success: function(data,status){ 
			if(data=='success'){
				timeCount=setInterval("waitRotateMsg()",1000);
				alert('发送成功');
			}
         }
     }); 

}

rotateWAIT=60;

function waitRotateMsg(){

	$('.rotateMobile .btn-send').html(rotateWAIT+'秒后重新发送');
	$('.rotateMobile .btn-send').attr('onclick','');
	rotateWAIT--;
	if(rotateWAIT==0){
		clearInterval(timeCount);
		rotateWAIT=60;
		$('.rotateMobile .btn-send').html('获取短信验证码');
		$('.rotateMobile .btn-send').attr('onclick','');
	}
}

function rotateMobile(){
	var mobile=$("#rmobile").val();
	var name=$("#name").val();
	var addre=$("#addre").val();
	var prize_id = $("#lottery1").attr("prize_id");
	var prize_type = $("#lottery1").attr("prize_type");
	var isTelephone=/1[34758]{1}\d{9}$/.test(mobile);
	if(!mobile){
		alert("手机号不能为空");
		return false;
	}else if(!isTelephone){
		alert('手机号不正确');
		return false;	
	}
	$.ajax({
         url: "action.php?type=addmobile",  
         type: "POST",
         data:{mobile:mobile,name:name,addre:addre,mid:MID,prizeid:prize_id,prize_type:prize_type},
         //dataType: "json",
         error: function(){  
             alert('Error loading XML document');  
         },  
         success: function(data,status){ 
			if(data=='success'){
				$('.rotateMobile').hide();
				 $('.hand').click();
				alert('提交成功')
			}else if(data=='invalidatemobile'){
				alert("手机号不正确");
			}else if(data=='invalidatecode'){
				alert("验证码不正确");
			}else if(data=='hasmobile'){
				alert("对不起，该手机已经抽过奖了");
			}
         }
     }); 
}
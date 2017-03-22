function errormessage(obj,message){
	$(obj).addClass('error');
	$(obj).parent().parent().find('.ErrBox').html(message);
	$(obj).parent().parent().find('.ErrBox').show();
	
}

function rightmessage(obj){

	$(obj).removeClass('error');
	$(obj).addClass('right');
	$(obj).parent().parent().find('.ErrBox').html('');
	$(obj).parent().parent().find('.ErrBox').hide();

}


jQuery(function(){
	
	
/*登录验证*/

$("#login_form input[name='account']").blur(function(){
	var obj=$(this);
	var v=obj.val();
	
	var  len=v.replace(/[^\x00-\xff]/g, 'xx').length;
	var isName=/[^\u4e00-\u9fa50-9a-zA-Z]/ig.test(v);
	var isNum=/^\d+$/.test(v);
	
	if(!v){
		errormessage(obj,"账号不能为空");
		return false;
	}else if(len<2||len>15){
		//errormessage(obj, len < 2 ? '账号小于 2 个字符' : '账号超过 15 个字符');
		//return false;
	}else if(isNum){
		errormessage(obj,'账号不能以纯数字组成');
		return false;	
	}else if(isName){
		//errormessage(obj,'账号不能有特殊字符存在');
		//return false;	
	}
	
     $.ajax({
         url: "action.php?type=check_username",  
         type: "POST",
		 
         data:{username:v},
         //dataType: "json",
         error: function(){  
             //alert('Error loading XML document');  
         },  
         success: function(data,status){//如果调用php成功  
			if(data=='noUser'){ //用户名不存在
				errormessage(obj,'账号不存在');
			}
			else{
				rightmessage(obj);
			}
         }
     });  
});


$("#login_form input[name='password']").blur(function(){
	var obj=$(this);
	var v=obj.val();

	if(!v){
		errormessage(obj,"密码不能为空");
		return false;
	}else{
		rightmessage(obj);
	}

});

$("#login_form input[name='validate']").blur(function(){
	var obj=$(this);
	var v=obj.val();

	if(!v){
		errormessage(obj,"验证码不能为空");
		return false;
	}
	
    $.ajax({
         url: "action.php?type=check_validate",  
         type: "POST",
         data:{validate:v},
         //dataType: "json",
         error: function(){  
            // alert('Error loading XML document');  
         },  
         success: function(data,status){//如果调用php成功    
				if(data=='noValidate'){ 
					errormessage(obj,"验证码不正确");
					return false;
				}else{ 
					rightmessage(obj);
					
				}
		 }
	});  
	
});

$("#login_form .form_submit img").click(function(){
	var obj=$(this);
	var success=true;
	$("#login_form input").each(function(){
		if(!$(this).val()){
			errormessage(this,$(this).attr('placeholder'));
			success=false;
			return false;
		}
		if($(this).hasClass('error')){
			//errormessage(this,$(this).attr('placeholder'));
			$(this).blur();
			success = false;
			return false;
		}
		
	});
	if(!success){
		return false;
	}
	$('#login_form .ErrBox').html('登录中...');
	$('#login_form .ErrBox').show();
	var username=$("#login_form input[name='account']").val();
	var password=$("#login_form input[name='password']").val();
	var validate=$("#login_form input[name='validate']").val();
    $.ajax({
         url: "action.php?type=check_account",  
         type: "POST",
         data:{username:username,password:password,validate:validate},
         //dataType: "json",
         error: function(){  
            // alert('Error loading XML document');  
         },  
         success: function(data,status){//如果调用php成功 
		  
				if(data=='success'){ 
					window.location.reload();
				}else if(data=='noUser'){
					$('#login_form .ErrBox').html('无用户...');
				}else if(data=='noPassword'){
					$('#login_form .ErrBox').html('密码错误...');
				}else if(data=='noValidate'){
					$('#login_form .ErrBox').html('验证码错误..');
				}else if(data=='invalidate_room'){
					alert("房间有误，请确认房间后再次登录");
				}else{
					$('#login_form .ErrBox').html('登录失败...');
				}
		 }
	});  
	
});



/*注册验证*/

$("#register_form input[name='account']").blur(function(){
	var obj=$(this);
	var v=obj.val();

	var  len=v.replace(/[^\x00-\xff]/g, 'xx').length;
	var isName=/[^\u4e00-\u9fa50-9a-zA-Z]/ig.test(v);
	var isNum=/^\d+$/.test(v);
	
	if(!v){
		errormessage(obj,"账号不能为空");
		return false;
	}else if(len<2||len>15){
		errormessage(obj, len < 2 ? '账号小于2 个字符' : '账号超过 15 个字符');
		return false;
	}else if(isNum){
		errormessage(obj,'账号不能以纯数字组成');
		return false;	
	}else if(isName){
	//	errormessage(obj,'账号不能有特殊字符存在');
		//return false;	
	}
	
     $.ajax({
         url: "action.php?type=check_username",  
         type: "POST",
		 
         data:{username:v},
         //dataType: "json",
         error: function(){  
             //alert('Error loading XML document');  
         },  
         success: function(data,status){//如果调用php成功  
			if(data=='noUser'){ //用户名不存在
				rightmessage(obj);
			}
			else{
				errormessage(obj,'账号已存在');
			}
         }
     });  
});


$("#register_form input[name='password']").blur(function(){
	var obj=$(this);
	var v=obj.val();
	var rpwd=$("#register_form input[name='rpassword']");
	var  len=v.replace(/[^\x00-\xff]/g, 'xx').length;
	
	var len=v.length;
	
	if(!v){
		errormessage(obj,"密码不能为空");
		return false;
	}else if(len<6){
		errormessage(obj, '密码长度不能小于6个字符');
		return false;
	}else if(rpwd.val() &&(v!=rpwd.val())){
		errormessage(obj,"两次输入的密码不一致");
		return false;
	}
	else if(rpwd.val() &&(v==rpwd.val())){
		rightmessage(obj);
		rightmessage(rpwd);
		return false;
	}
	else {
			rightmessage(obj);
			
			return false;
	}
});



$("#register_form input[name='rpassword']").blur(function(){
	var obj=$(this);
	var v=obj.val();
	var pwd=$("#register_form input[name='password']");
	if(!v){
	errormessage(obj,"确认密码不能为空");
		return false;
	}
	else if(v!=pwd.val()){
		errormessage(obj,"两次输入的密码不一致");
		return false;
	}
	else {
		rightmessage(obj);
		rightmessage(pwd);
		return false;
	}
});

$("#register_form input[name='telephone']").blur(function(){
	var obj=$(this);
	var v=obj.val();
	var isTelephone=/1[34758]{1}\d{9}$/.test(v);
	if(!v){
		errormessage(obj,"手机号不能为空");
		return false;
	}else if(!isTelephone){
		errormessage(obj,'手机号不正确');
		return false;	
	}

     $.ajax({
         url: "action.php?type=check_telephone",  
         type: "POST",
         data:{telephone:v},
         //dataType: "json",
         error: function(){  
             //alert('Error loading XML document');  
         },  
         success: function(data,status){//如果调用php成功    
		if(data=='noTelephone'){ 	//手机号不存在
			rightmessage(obj);
		}else{ 
			errormessage(obj,'手机号已注册');}
         }
     });  
});

$("#register_form input[name='qq']").blur(function(){
	var obj=$(this);
	var v=obj.val();
	var isQq=/[1-9][0-9]{4,}/.test(v);
	if(!v){
		errormessage(obj,"QQ号不能为空");
		return false;
	}else if(!isQq){
		errormessage(obj,'QQ号不正确');
		return false;	
	}

     $.ajax({
         url: "action.php?type=check_qq",  
         type: "POST",
         data:{qq:v},
         //dataType: "json",
         error: function(){  
             //alert('Error loading XML document');  
         },  
         success: function(data,status){//如果调用php成功    
		if(data=='noQq'){ 	//QQ号不存在
			rightmessage(obj);
		}else{ 
			errormessage(obj,'QQ号已注册');}
         }
     });  
});

$("#register_form input[name='validate']").blur(function(){
	var obj=$(this);
	var v=obj.val();

	if(!v){
		errormessage(obj,"验证码不能为空");
		return false;
	}
	
    $.ajax({
         url: "action.php?type=check_validate",  
         type: "POST",
         data:{validate:v},
         //dataType: "json",
         error: function(){  
            // alert('Error loading XML document');  
         },  
         success: function(data,status){//如果调用php成功    
				if(data=='noValidate'){ 
					errormessage(obj,"验证码不正确");
					return false;
				}else{ 
					rightmessage(obj);
					
				}
		 }
	});  
	
});


$("#register_form .form_submit img").click(function(){
	var obj=$(this);
		var success=true;
	$("#register_form input").each(function(){
		//alert($(this).attr('name'));
		
		if(!$(this).val() && $(this).attr('name')!='qq' && $(this).attr('name')!='nickname' && $(this).attr('name')!='ymid'){
			errormessage(this,$(this).attr('placeholder'));
			success= false;
		}
		if($(this).hasClass('error') && $(this).attr('name')!='qq' && $(this).attr('name')!='nickname' && $(this).attr('name')!='ymid'){
			errormessage(this,$(this).attr('placeholder'));
			success= false;
			
		}
	});
	if(!success){
		return false;
	}
	
	var username=$("#register_form input[name='account']").val();
	var password=$("#register_form input[name='password']").val();
	var telephone=$("#register_form input[name='telephone']").val();
	var nickname=$("#register_form input[name='nickname']").val();
	var ymid=$("#register_form input[name='ymid']").val();
	var qq=$("#register_form input[name='qq']").val();
	var validate=$("#register_form input[name='validate']").val();
    $.ajax({
         url: "action.php?type=adduser",  
         type: "POST",
         data:{username:username,password:password,telephone:telephone,qq:qq,validate:validate,fid:FID,tuijianmid:TUIJIANMID,nickname:nickname,ymid:ymid},
         //dataType: "json",
         error: function(){  
            // alert('Error loading XML document');  
         },  
         success: function(data,status){//如果调用php成功    
				if(data=='pingbi'){ 
				 alert("您的IP已被屏蔽，请联系管理员");
				 
				}else if(data=='success'){
					 alert("您已提交了注册信息，正等待管理员审核");
					 window.location.reload();
				}
		 }
	});  
	
});

});

function sendmsg(){
	var tel=$("#register_form input[name='telephone']");
	var v=tel.val();
	tel.blur();
	if(tel.hasClass("error")){
			return false;
	}
	
	$.ajax({
         url: "duanxin/demo.php?type=sendmsg",  
         type: "POST",
         data:{telephone:v},
         //dataType: "json",
         error: function(){  
             alert('Error loading XML document');  
         },  
         success: function(data,status){ 
			if(data=='success'){
			
				timeCount=setInterval("waitMsg()",1000);
				alert('发送成功');
			}else if(data=='invalidate_count'){
				alert('短信超出限度');
			}
         }
     }); 

}

WAIT=60;

function waitMsg(){
	
	$('#sendmsg_btn').val(WAIT+'秒后重新发送');
	$('#sendmsg_btn').attr('disabled','disabled');
	WAIT--;
	if(WAIT==0){
		clearInterval(timeCount);
		WAIT=60;
		$('#sendmsg_btn').val('发送手机验证码');
		$('#sendmsg_btn').removeAttr('disabled');
	}
}
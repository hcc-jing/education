//处理聊天信息
admin.ChatInfoEdit = function(_id,action,title,type){
	var id = ("undefined"== typeof(_id)|| _id=='') ? admin.getChecked() : _id;
    if(id==''){
        ui.error(L('PUBLIC_SELECT_TITLE_TYPE',{'title':title,'type':type}));
        return false;
   }
   if(confirm(L('PUBLIC_CONFIRM_DO',{'title':title,'type':type}))){
	   $.post(U('live/Count/'+action),{id:id},function(msg){
			admin.ajaxReload(msg);
  	 },'json');
   }	
};

//处理违规信息
admin.SenInfoEdit = function(_id,action,title,type){
  var id = ("undefined"== typeof(_id)|| _id=='') ? admin.getChecked() : _id;
    if(id==''){
        ui.error(L('PUBLIC_SELECT_TITLE_TYPE',{'title':title,'type':type}));
        return false;
   }
   if(confirm(L('PUBLIC_CONFIRM_DO',{'title':title,'type':type}))){
     $.post(U('live/Count/'+action),{id:id},function(msg){
      admin.ajaxReload(msg);
     },'json');
   }  
};

//处理黑名单信息
admin.BlackInfoEdit = function(_id,action,title,type){
  var id = ("undefined"== typeof(_id)|| _id=='') ? admin.getChecked() : _id;
    if(id==''){
        ui.error(L('PUBLIC_SELECT_TITLE_TYPE',{'title':title,'type':type}));
        return false;
   }
   if(confirm(L('PUBLIC_CONFIRM_DO',{'title':title,'type':type}))){
     $.post(U('live/Count/'+action),{id:id},function(msg){
      admin.ajaxReload(msg);
     },'json');
   }  
};

//处理屏蔽信息
admin.ShieldInfoEdit = function(_id,action,title,type){
  var id = ("undefined"== typeof(_id)|| _id=='') ? admin.getChecked() : _id;
    if(id==''){
        ui.error(L('PUBLIC_SELECT_TITLE_TYPE',{'title':title,'type':type}));
        return false;
   }
   if(confirm(L('PUBLIC_CONFIRM_DO',{'title':title,'type':type}))){
     $.post(U('live/Count/'+action),{id:id},function(msg){
      admin.ajaxReload(msg);
     },'json');
   }  
};
xeditor_config = {basePath:'xeditor/' };
(function ($) {//阻止浏览器默认行。
	
     $.fn.extend({
        "setup": function () {
		
             $(this).append('<div id="xeditor_content" style="width:100%;height:100%;overflow:auto" contenteditable></div>');
			 
			 $(this).find('#xeditor_content').bind("drop",function(e){
					$(this).find('#xeditor_content').drop(e.originalEvent)
			 });
			 $(this).find('#xeditor_content').bind("paste",function(e){
					$(this).find('#xeditor_content').paste(e.originalEvent);
			 });
			   
      },
	  "getContent":function(){
		  var content=$(this).find('#xeditor_content').html().replace(/\s/g,"").replace(/&nbsp;/g,"");
		  //console.log(content);
		  if(!content){
			return '';
		  }else{
		    return '<span style="'+$(this).find('#xeditor_content').attr('style')+'">'+$(this).find('#xeditor_content').html()+'</span>';
		  }
		
	  },
	   "setContent":function(c){
		  $(this).find('#xeditor_content').html(c);
	  }, 
	   "appendContent":function(c){
		  $(this).find('#xeditor_content').html($(this).find('#xeditor_content').html()+c);
	  }, 
	  "setStyle":function(obj){
		  $(this).find('#xeditor_content').css(obj);
	  },
	  
	  "drop":function(e){
		e.preventDefault(); //取消默认浏览器拖拽效果
		var fileList = e.dataTransfer.files; //获取文件对象
	
		if(fileList.length == 0){
			return false;
		}
		//检测文件是不是图片
		if(fileList[0].type.indexOf('image') === -1){
			
			return false;
		}
		var target=e.target;
		var reader = new FileReader();
		var type=fileList[0].type;
		reader.readAsDataURL(fileList[0]);
	
			//上传
		 reader.onload = function(e) 
        { 
			xhr = new XMLHttpRequest();
			xhr.open('POST', xeditor_config.basePath+'upload.php', true);
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
					
			var fd = new FormData();
			fd.append('file',this.result);
			fd.append('type', type); 	
			xhr.send(fd);
			xhr.onload = function () 
			{
				  $("#xeditor_content").append('<img src="'+xeditor_config.basePath+''+xhr.responseText+'" alt=""/>');
					
			}
		}
	  },  
	  "paste":function(e){
		  if (e.clipboardData && e.clipboardData.items[0].type.indexOf('image') > -1) 
        {	
		
            var reader = new FileReader();
            var file = e.clipboardData.items[0].getAsFile();
			var type = e.clipboardData.items[0].type;
			
            //ajax上传图片
            reader.onload = function(e) 
            {
                var xhr = new XMLHttpRequest(),
                    fd  = new FormData();
                xhr.open('POST', xeditor_config.basePath+'upload.php', true);
                xhr.onload = function () 
                {
					
                     $("#xeditor_content").append('<img src="'+xeditor_config.basePath+''+xhr.responseText+'" alt=""/>');
			
                }
                // this.result得到图片的base64 
	
                fd.append('file', this.result); 
				fd.append('type', type); 
               
                xhr.send(fd);
            }
           reader.readAsDataURL(file);
		 
        }
	  },
	  
   });
   $(document).on({
		dragleave:function(e){		//拖离
			e.preventDefault();
		},
		drop:function(e){			//拖后放
			e.preventDefault();
		},
		dragenter:function(e){		//拖进
			e.preventDefault();
		},
		dragover:function(e){		//拖来拖去
			e.preventDefault();
		}
	});

})(jQuery);
	
	
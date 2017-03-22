

function PubClear()
{
	$('#liaotianlist').html('');
	if(ADMINID==1 || ADMINID==2 ){
		if(!window.confirm("是否清空所有人的屏"))
		{
		 return false;
		}
		ws.send(JSON.stringify({"type":"pubclear","pubclear":true}));
	}
}

function PriClear()
{
	$('#liaotianlist').html('');

}


function RightNav(id){
	$(".main_right_nav li span").removeClass("on");
	$("#"+id).addClass("on");
	$('.main_right_content').hide();
	$('#'+id+'_content').show();
}

function UBase_Click(e)
{	

	TOMID=$(e).attr('uid');	
	TOUSERNAME=$(e).attr('uname');	
	TOADMINID=$(e).attr('adminid');	//用户组id
	var _Parent = $(e).parent();
	_Parent.find('li').removeClass('on');
	$(e).addClass("on");
}

function UBase_Click2(e)
{	
	$(e).parent().addClass('l-selected');
	TOMID=$(e).parent().attr('uid');	
	TOUSERNAME=$(e).parent().attr('uname');	
	
}
//点击用户名称,设置发言
function User_Click(e)
{	if(!$(e).attr('uid') || $(e).attr('uid')==MID){
		return false;
	}
	TOMID=$(e).attr('uid');	//用户id
	TOUSERNAME=$(e).attr('uname');//用户名	
	TOADMINID=$(e).attr('adminid');	//用户组id
	$('#ManageMenu').css({display:'block',top:$(e).offset().top+15,left:$(e).offset().left});
	$(document).bind('mouseup',function(e){
		$('#ManageMenu').css('display','none');
		$(document).unbind('mouseup');
	});
}
//删除发言对象
function RemovePrivatePerson(e)
{
	TOMID=0;
	TOUSERNAME='';
	$(e).parent().remove();
	$("#send_talkto").val('0');
}

function sayTo()
{	
	if(TOMID== MID){return false;}

	if($(".User_List li[uid='"+TOMID+"']").attr('tuijianmid')==MID || $(".User_List li[uid='"+TOMID+"']").attr('uid')==TUIJIANMID || ADMINID==1 || $(".User_List li[uid='"+TOMID+"']").attr('adminid')==1 ){
	
	}else{
		return;
	}
	var tomid =TOMID;
	var tosusername =TOUSERNAME;
	var adminid =$(".User_List li[uid='"+TOMID+"']").attr('adminid');
	var op=$('#send_talkto option[value="'+tomid+'"]');
	if(op && op.length>0){	
		op.remove();
	}
	$("#send_talkto").append('<option value="'+tomid+'" uname="'+tosusername+'" adminid="'+adminid+'" selected=selected>'+tosusername+'</option>');
	
	if($(".whisper").is(":hidden")) { 
		$(".whisper").show();
		
	} else{
		$(".loading").show();
	}
	
	

	

	$(".l-tab-links ul li").removeClass("l-selected");
	var hassiliao=$(".l-tab-links ul li[uid='"+TOMID+"']");
	
	$("#Y_PriMes_Div ul li").remove();

	if(hassiliao.length==0){
		var str='<li tabid="" class="l-selected" style="cursor: pointer;" uid="'+TOMID+'" uname="'+TOUSERNAME+'" adminid="'+adminid+'"> <a style="line-height:31px;" onclick="UBase_Click2(this);sayTo();">'+TOUSERNAME+'</a> <div class="l-tab-links-item-left"></div><div class="l-tab-links-item-right"></div> <div class="l-tab-links-item-close" onclick="RemovePrivatePerson(this)"></div></li>';
		$(".l-tab-links ul").append(str);
	}else{
		hassiliao.addClass("l-selected");
		 hassiliao.find('a').css("color","");
	}
	getSiliaodata();
}


function sayTo2()
{	if(!TOMID){
		return false;
	}
	var tomid =TOMID;
	var tosusername =TOUSERNAME;
	var toadminid =TOADMINID;
	var op=$('#send_talkto option[value="'+tomid+'"]');
	if(op && op.length>0){	
		op.remove();
	}
	$("#send_talkto").append('<option value="'+tomid+'" uname="'+tosusername+'" adminid="'+toadminid+'" selected=selected>'+tosusername+'</option>');
}

function Change_talkto(){
	var select=$('#send_talkto option:selected');
	TOMID=select.val();
	TOUSERNAME=select.attr('uname');
}
//自适应高度
function Page_Height()
{
	$(".Page").height($(window).height()-100);
	$("#LL_bg").height($(window).height()-45);
}

function Main_Height()
{	
	$(".main").height($(window).height()-$('.top').height()-5-10);//12:margin
}

function RightContent_Height()
{
/*$(".shipinchuangkou").height($(".main_right").width()*0.56);
	$(".main_right_content").css('min-height',$(".main_right").height()-$(".shipin").height()-$(".shipinchuangkou").height()-$(".main_right_nav ").height()-5-2-30);//10:margin
		$(".ck-slide").css('height',$(".main_right").width()*0.25);*/
		$(".main_right_content").css('min-height',$(".main_right").height()-$(".shipin").height()-$(".shipinchuangkou").height()-$(".main_right_nav ").height()-5-2-30);//10:margin
		$(".ck-slide").css('height',$(".main_right").height()-$(".shipin").height()-$(".shipinchuangkou").height()-$(".main_right_nav ").height()-5-2-6);
}



function Middle_Height()
{	
	var page = document.getElementById('page'),	nav = window.navigator,
        ua = nav.userAgent,
        isFullScreen = nav.standalone;
		var Safari=0;
			if (/iPhone|iPod|iPad/.test(ua)) {
	
        // 60对应的是Safari导航栏的高度
			//var Safari=60;
			var Safari=0;
		}
	var w=window.innerWidth? window.innerWidth:document.body.clientWidth;
	if(w<580){
		$(".main").height($(".main").height()+36);
		$(".main_middle").height($(".main").height()-$(".main_right").height()-Safari-40);
		$(".main_middle").css('top',$(".main_right").height()+36+4)
	}else{
		$(".main_middle").removeAttr("style");
	}

	$(".liaotiankuang").height($(".main_middle").height()-$(".main_middle1").height()-5-4);

	$("#liaotianlist").height($(".liaotiankuang").height()-$(".gonggao").height()-10);

}

function PubMes_Height()
{
	$("#Y_PubMes_Div").height($(".Y_iMessage").height());//150:Y_PriMes_Div,15:Y_MsgSplit
}



function Userlist_Height()
{	
		
	 $(".zaixian").height($(".main_left").height()-46-$(".zhibo").height()-$(".Y_Global_Control").height()-5-5-10-2+124);
	 $(".User_List").height($(".zaixian").height()-$(".zaixian_tit").height());
	
}
function ShowFaceList(id)
{
	if($('#'+id).css('display')=='none')
	{
		$('#'+id).css({display:'block'});
		$(document).bind('mouseup',function(e){
			if(!$(e.target).attr('isface'))
			{
				$('#Faces').css('display','none');
				$('#caitiao').css('display','none');
				$(document).unbind('mouseup');
			}
			else if($(e.target).attr('isface')=='1')
			{
				
					var face='/'+$(e.target).attr('title')
					$('#send_input').appendContent(face)
				
			}
		});
	}
	else
	{			$('#'+id).css({display:'none'});
	}
}

//关闭fancybox.close()
function FancyBoxClose()
{
	$.fancybox.close();
}
function center(tar) {
     var t = $("#"+tar),
    i = ($(window).width() - t.outerWidth()) / 2;
     t.css({
            left: i
      })
	a = t.height(),
    s = $(window).height();
	if (a > s) t.css("top", "0px");
	else {
            var n = (s - a) / 2;
            t.css("top", n + "px");
      }
   t.show();
}

$(window).resize(function(){

  Main_Height();
  Userlist_Height();
  RightContent_Height();
  Middle_Height();
  PubMes_Height();

});

$(function(){
	
	var w=window.innerWidth? window.innerWidth:document.body.clientWidth;
	if(w<1200){
		$(".Y_Left").hide();
	}else{
		$(".Y_Left").show();
	}
	$('.fsize').change(function(){
		$('#send_input').setStyle({'font-size':parseInt(this.value)})
	});
});
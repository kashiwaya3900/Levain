Init();
/**
 *初期処理
 */
function Init() {
  console.log('Init');
  
  var url = "data/member.json";
  
  $.getJSON(url, (data) => {
  
    var $male_member_list = $('#male_member_list');
    var $female_member_list = $('#female_member_list');
    
    var list = data.member_list;
    for ( var i = 0; i<list.length; i++ ) {
      if(list[i].gender == '0'){
        $male_member_list.append(MemberImageCreate(list[i].name,list[i].image));
      }else{
        $female_member_list.append(MemberImageCreate(list[i].name,list[i].image));
      }
    }
  });
}

function MemberImageCreate(name,image){
  
  var member = "";
  
  if(image != ""){
    member = '<li><img src="images/' 
    + image
    + '" alt="'
    + name
    + '" class="img-thumbnail"><li>';
  }
  return member;
}

$(function(){
  $(".btn-gnavi").on("click", function(){
    // ハンバーガーメニューの位置を設定
    var rightVal = 0;
    if($(this).hasClass("open")) {
      // 位置を移動させメニューを開いた状態にする
      rightVal = -300;
      // メニューを開いたら次回クリック時は閉じた状態になるよう設定
      $(this).removeClass("open");
    } else {
      // メニューを開いたら次回クリック時は閉じた状態になるよう設定
      $(this).addClass("open");
    }
    $("#global-navi").stop().animate({
      right: rightVal
    }, 200);
  });
});

/* 桜を降らせる場合は本メソッドを有効化する
window.addEventListener('DOMContentLoaded', () => {
  // コンテナを指定
  const section = document.querySelector('.cherry-blossom-container');

  // 花びらを生成する関数
  const createPetal = () => {
    const petalEl = document.createElement('span');
    petalEl.className = 'petal';
    const minSize = 10;
    const maxSize = 15;
    const size = Math.random() * (maxSize + 1 - minSize) + minSize;
    petalEl.style.width = `${size}px`;
    petalEl.style.height = `${size}px`;
    petalEl.style.left = Math.random() * innerWidth + 'px';
    section.appendChild(petalEl);

    // 一定時間が経てば花びらを消す
    setTimeout(() => {
      petalEl.remove();
    }, 10000);
  }

  // 花びらを生成する間隔をミリ秒で指定
  setInterval(createPetal, 300);
});
*/

$(document).ready(function() {
  $( 'body' ).flurry({
    //降らせる文字
    character: "|",
    //文字の色
    color: "deepskyblue",
    //高さ（どこまで落ちるか）
    height: 800,
    //落ちる速度
    speed: 1500,
    //回転
    rotation : 0,
    rotationVariance :0,
    startRotation:0,
    //wind: 200,
    variance: 100,
    //最大サイズ
    large: 25,
    //最小サイズ
    small: 10,
    density: 100,
    transparency: 0.4
  });
});

/* 雪を降らせる場合は本メソッドを有効化する
$(document).ready(function() {
  $( 'body' ).flurry({
    character: "❄",
    height: 2000,
    speed: 15000,
    wind: 200,
    variance: 100,
    large: 25,
    small: 10,
    density: 100,
    transparency: 0.4
  });
});
*/

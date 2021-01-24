var memMap;
var selectMemMap;
var isMusicPlay;

Init();
/**
 *初期処理
 */
function Init() {
  console.log('Init');
  isMusicPlay = true;
  var url = "data/member.json";
  
  $.getJSON(url, (data) => {
  
    var $male_list = $('#male_list');
    var $female_list = $('#female_list');
    
    var list = data.member_list;
    memMap = new Map();
    for ( var i = 0; i<list.length; i++ ) {
      if(list[i].gender == '0'){
        $male_list.append(MemberLabelCreate(list[i].name));
      }else{
        $female_list.append(MemberLabelCreate(list[i].name));
      }
      
      var memInfo = new Object();
      memInfo.name = list[i].name;
      memInfo.age = list[i].age;
      memInfo.gender = list[i].gender;
      memInfo.birthday = list[i].birthday;
      memMap.set(list[i].name, memInfo);
    }
  });
}

function MemberLabelCreate(name){
  var member = "";
  member = '<li><label>' 
  + '<input type="checkbox" name="part" value="'
  + name
  + '" onClick="DisChecked();"/>'
  + '<span class="select_member">'
  + name
  + '</span>'
  + '</label></li>';
  
  return member;
}


/**
 * 全選択
 */
function AllChecked(){
  console.log('AllChecked');
  var all = document.form.all.checked;
  for (var i=0; i<document.form.part.length; i++){
    document.form.part[i].checked = all;
  }
}

/**
 * 全選択解除
 */
function DisChecked(){
  console.log('DisChecked');
  var checks = document.form.part;
  var checksCount = 0;
  for (var i=0; i<checks.length; i++){
    if(checks[i].checked == false){
      document.form.all.checked = false;
    }else{
      checksCount += 1;
      if(checksCount == checks.length){
        document.form.all.checked = true;
      }
    }
  }
}

/**
 * 種別選択時
 */
function TypeSelected(){
  console.log('TypeSelected');
  var radioVal = $("input[name='type']:checked").val();
  if(radioVal == "singles") {
    $('#group_pattern').hide('slow');
  }else if(radioVal == "doubles") {
    $('#group_pattern').hide('slow');
  }else{
    $('#group_pattern').show('slow');
  }
}

/**
 * 抽選押下時処理
 */
function Lottery() {
  console.log('Lottery');
  
  //前回結果をクリア
  ResultClear();
  
  //選択メンバーリスト
  var select_member = [];
  var elements = document.getElementsByName("part");
  for (let i=0; i<elements.length; i++){
    if (elements[i].checked){
      //名前をPUSHする
      select_member.push(elements[i].defaultValue);
    }
  }
  
  //抽選方法を取得する
  var radioVal = $("input[name='type']:checked").val();
  
  if(radioVal == "singles") {
    //シングルス
    //2人以上選択していないとシングルスは不可
    if(select_member.length < 2){
      OpenModal(ERROR,MESSAGE_SINGLES_MEM_LACK);
      return;
    }
    
    //シャッフル
    var shuffle_list = CreateShuffleList(select_member);
    
    //メンバ数が奇数の場合は休みの要素を先頭に追加する
    if((shuffle_list.length % 2 ) != 0 ) {
      //奇数の場合
      shuffle_list.unshift(REST);
    }
    
    //組み合わせパターン作成
    var round_robin_list = CreateRoundRobin(shuffle_list);
    
    var singlesStr = "";
    for (let i=0; i<round_robin_list.length; i++){
      singlesStr = singlesStr + ResultCreateSingles(round_robin_list[i][0],round_robin_list[i][1]);
    }
    
    $('div.singles').html(singlesStr);
    
  }else if(radioVal == "doubles"){
    //ダブルス
    //4人以上選択していないとダブルスは不可
    if(select_member.length < 4){
      OpenModal(ERROR,MESSAGE_DOUBLES_MEM_LACK);
      return;
    }
    
    //シャッフル
    var shuffle_list = CreateShuffleList(select_member);
    
    //メンバ数が奇数の場合は休みの要素を先頭に追加する
    if((shuffle_list.length % 2 ) != 0 ) {
      //奇数の場合
      shuffle_list.unshift(REST);
    }
    
    //組み合わせパターン作成
    var round_robin_list = CreateRoundRobin(shuffle_list);
    
    //奇数の場合、先頭の値を末尾にも追加
    if(round_robin_list.length % 2 != 0 ) {
      round_robin_list.push(round_robin_list[0]);
    }
    
    var doublesStr = "";
    
    var count = 0;
    while (count < round_robin_list.length) {
      var west = round_robin_list[count];
      var east = round_robin_list[count + 1];
      doublesStr = doublesStr + ResultCreateDoubles(west[0],west[1],east[0],east[1]);
    
      count = count + 2;
    }
    
    $('div.doubles').html(doublesStr);
    
  }else if(radioVal == "group"){
    //団体戦
    //シングルスの数取得
    var singles_count = $('[name=group_singles]').val();
    //ダブルスの数取得
    var doubles_count = $('[name=group_doubles]').val();
    
    if(singles_count == 0 && doubles_count == 0){
      OpenModal(ERROR,MESSAGE_GROUP_MEM_ZERO);
      return;
    }
    
    //必要な人数の計算
    var minMember = ((singles_count * 1) + (doubles_count * 2)) * 2
    
    //必要な人数以上選択しているか
    if(select_member.length < minMember){
      OpenModal(ERROR,minMember +  MESSAGE_GROUP_MEM_LACK);
      return;
    }
    //シャッフル
    var shuffle_list = CreateShuffleList(select_member);
    
    var singlesStr = "";
    var doublesStr = "";
    
    var member_count = 0;
    var order = "";
    
    for (let j=0; j<singles_count; j++){
      singlesStr = singlesStr + ResultCreateSingles(shuffle_list[member_count],shuffle_list[member_count+1]);
      member_count = member_count + 2;
    }
    for (let k=0; k<doubles_count; k++){
      doublesStr = doublesStr + ResultCreateDoubles(shuffle_list[member_count],shuffle_list[member_count + 1],shuffle_list[member_count + 2],shuffle_list[member_count + 3]);
      member_count = member_count + 4;
    }
    
    $('div.group_doubles').html(doublesStr);
    $('div.group_singles').html(singlesStr);
    
  }else{
    //コーチ
    
    //シングルスの数取得
    var singles_count = $('[name=group_singles]').val();
    //ダブルスの数取得
    var doubles_count = $('[name=group_doubles]').val();
    
    if(singles_count == 0 && doubles_count == 0){
      OpenModal(ERROR,MESSAGE_GROUP_MEM_ZERO);
      return;
    }
    
    //必要な人数の計算
    var minMember = (singles_count * 1) + (doubles_count * 2)
    
    //必要な人数以上選択しているか
    if(select_member.length < minMember){
      OpenModal(ERROR,minMember + MESSAGE_GROUP_MEM_LACK);
      return;
    }
    //シャッフル
    var shuffle_list = CreateShuffleList(select_member);
    
    var singlesStr = "";
    var doublesStr = "";
    var reserveStr = "";
    
    var member_count = 0;
    var order = "";
    for (let j=0; j<singles_count; j++){
      order = "S" + String(singles_count-j);
      singlesStr = singlesStr + ResultCreateTeamSingles(shuffle_list[member_count],order);
      member_count = member_count + 1;
    }
    for (let k=0; k<doubles_count; k++){
      order = "D" + String(doubles_count-k);
      doublesStr = doublesStr + ResultCreateTeamDoubles(shuffle_list[member_count],shuffle_list[member_count + 1],order);
      member_count = member_count + 2;
    }
    
    //ほけつ
    //メンバが余っている場合
    if(member_count < shuffle_list.length){
      //ほけつメンバ数
      var reserve_count = shuffle_list.length - member_count;
      for (let l=0; l<reserve_count; l++){
        reserveStr = reserveStr + ResultCreateTeamReserve(shuffle_list[member_count]);
        member_count = member_count + 1;
      }
    }
    
    $('div.group_doubles').html(doublesStr);
    $('div.group_singles').html(singlesStr);
    $('div.group_reserve').html(reserveStr);
  }
  
  //ボタンの位置取得して画面スクロール
  var $e = $('#lottery');
  var x1 = $e.offset().top;
  $("html,body").animate({scrollTop:x1});
  
  //誕生日チェック
  //現在日時取得
  var nowDate = getNowDateWithString();
  console.log(nowDate);
  var isHappy = false;
  //メンバーMap内チェック
  if(isMusicPlay){
    //初回だけ再生
    memMap.forEach(function (value, key) {
      if(value.birthday == nowDate){
        isHappy = true;
      }
    });
    
    if(isHappy){
      const bgm1 = document.querySelector("#hb");
      if(!bgm1.paused ){
        bgm1.pause();
      }else{
        bgm1.play();
        OpenModal(HAPPY_BIRTHDAY,MESSAGE_HAPPY_BIRTHDAY);
        $('#hbgif').show('slow');
      }
    }
  }

}

/**
 * 閉じるボタン
 */
function PushClose(){
  console.log('PushClose');
  $('#hbgif').hide('slow');
  const bgm1 = document.querySelector("#hb");
  if(!bgm1.paused ){
    bgm1.pause();
    isMusicPlay = false;
  }
}

/**
 * 配列のシャッフル処理
 */
function CreateShuffleList(list) {
  newList = [];
  
  selectMemMap = new Map();
  var num = 1;
  while (list.length > 0) {
    n = list.length;
    k = Math.floor(Math.random() * n);

    newList.push(list[k]);
    selectMemMap.set(num,list[k]);
    num = num + 1;
    list.splice(k, 1);
  }

  return newList;
}

/**
 * 総当たり作成処理
 */
function CreateRoundRobin(shuffle_list){
  console.log("CreateRoundRobin");
  
  var members = shuffle_list.length;

  var round_robin=[];
  var n = members;
  var w = 1;
  var x=[];
  var y=[];
  
  for(i = 0; i < members;i++ ){
    if (i % 2 == 0) {
      y.push(shuffle_list[i]);
    }else {
      x.push(shuffle_list[i]);
    }
  }

  for(i = 0; i < x.length;i++ ){
    if(x[i] != REST &&  y[i] != REST){
      round_robin.push([x[i], y[i]]);
    }
  }
  
  for(j = 2; j < n; j++ ){
    
    x.push(y[x.length-1]);
    y.unshift(x[1]);
    x.splice(1, 1);
    y.pop();
    
    for(k = 0; k < x.length;k++ ){
      if(x[k] != REST &&  y[k] != REST){
        round_robin.push([x[k], y[k]]);
      }
    }
  }

  return round_robin;
}




function ResultCreateSingles(player1,player2){
  var singles = "";
  
  //性別を取得
  var gender1;
  var gender2;
  
   gender1 = memMap.get(player1).gender == '0' ? "result_member_male" : "result_member_female";
   gender2 = memMap.get(player2).gender == '0' ? "result_member_male" : "result_member_female";

  
  singles = '<div class="row">'
  + '<div class="col-4">'
  + '<div class="row">'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender1
  + '">'
  + player1
  + '</label>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '<div class="col-4  align-self-center">'
  + '<label class="vs">VS</label>'
  + '</div>'
  + '<div class="col-4">'
  + '<div class="row">'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender2
  + '">'
  + player2
  + '</label>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '<hr class="line" width="100%" color="#7EB634" noshade>';
  
  return singles;
}

function ResultCreateDoubles(player1,player2,player3,player4){
  var doubles = "";
  
  //性別を取得
  var gender1;
  var gender2;
  var gender3;
  var gender4;
  
   gender1 = memMap.get(player1).gender == '0' ? "result_member_male" : "result_member_female";
   gender2 = memMap.get(player2).gender == '0' ? "result_member_male" : "result_member_female";
   gender3 = memMap.get(player3).gender == '0' ? "result_member_male" : "result_member_female";
   gender4 = memMap.get(player4).gender == '0' ? "result_member_male" : "result_member_female";
  
  doubles = '<div class="row">'
  + '<div class="col-4">'
  + '<div class="row">'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender1
  + '">'
  + player1
  + '</label>'
  + '</div>'
  + '</div>'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender2
  + '">'
  + player2
  + '</label>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '<div class="col-4  align-self-center">'
  + '<label class="vs">VS</label>'
  + '</div>'
  + '<div class="col-4">'
  + '<div class="row">'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender3
  + '">'
  + player3
  + '</label>'
  + '</div>'
  + '</div>'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender4
  + '">'
  + player4
  + '</label>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '<hr class="line" width="100%" color="#7EB634" noshade>';
  
  return doubles;
}

function ResultCreateTeamSingles(player1,order){
  var singles = "";
  
  //性別を取得
  var gender1;
  
   gender1 = memMap.get(player1).gender == '0' ? "result_member_male" : "result_member_female";
  
  singles = '<div class="row">'
  + '<div class="col-3  align-self-center">'
  + '<label class="vs">'
  + order
  +'</label>'
  + '</div>'
  + '<div class="col-9">'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender1
  + '">'
  + player1
  + '</label>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '<hr class="line" width="100%" color="#7EB634" noshade>';
  
  return singles;
}

function ResultCreateTeamDoubles(player1,player2, order){
  var doubles = "";
  
  //性別を取得
  var gender1;
  var gender2;
  
   gender1 = memMap.get(player1).gender == '0' ? "result_member_male" : "result_member_female";
   gender2 = memMap.get(player2).gender == '0' ? "result_member_male" : "result_member_female";
  
  doubles = '<div class="row">'
  + '<div class="col-3  align-self-center">'
  + '<label class="vs">'
  + order
  + '</label>'
  + '</div>'
  + '<div class="col-9">'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender1
  + '">'
  + player1
  + '</label>'
  + '</div>'
  + '</div>'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender2
  + '">'
  + player2
  + '</label>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '<hr class="line" width="100%" color="#7EB634" noshade>';
  
  return doubles;
}

function ResultCreateTeamReserve(player1){
  var doubles = "";
  
  //性別を取得
  var gender1;
  
   gender1 = memMap.get(player1).gender == '0' ? "result_member_male" : "result_member_female";
  
  doubles = '<div class="row">'
  + '<div class="col-3  align-self-center">'
  + '<label class="vs">'
  + RESERVE
  + '</label>'
  + '</div>'
  + '<div class="col-9">'
  + '<div class="col-12">'
  + '<div class="centering">'
  + '<label class="'
  + gender1
  + '">'
  + player1
  + '</label>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '</div>'
  + '<hr class="line" width="100%" color="#7EB634" noshade>';
  
  return doubles;
}

function ResultClear(){
  //
  $('div.singles').html("");
  $('div.doubles').html("");
  
  $('div.group_doubles').html("");
  $('div.group_singles').html("");
  $('div.group_reserve').html("");
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


function OpenModal(title,message){
  $('.modal-title').text(title);
  $('.modal-body').text(message);
  $('#sampleModal').modal();

}


function getNowDateWithString(){
  var dt = new Date();
  //var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth()+1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var result = m + "/" + d;
  
  return result;
}

$(document).ready(function() {
  $( 'body' ).flurry({
    character: "❄",
    height: 1000,
    speed: 15000,
    wind: 200,
    variance: 100,
    large: 25,
    small: 10,
    density: 100,
    transparency: 0.4
  });
});

var memMap;
var selectMemMap;

Init();
/**
 *初期処理
 */
function Init() {
  console.log('Init');
  
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
      memMap.set(list[i].name, list[i].gender);
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
  if(radioVal == "singles" || radioVal == "doubles") {
    $('#type_pattern').hide('slow');
  }else{
    $('#type_pattern').show('slow');
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
  
  var radioVal = $("input[name='type']:checked").val();
  if(radioVal == "singles") {
    //シングルス
    //2人以上選択していないとシングルスは不可
    if(select_member.length < 2){
      alert("2人以上選択してほしいですぅ・・・");
      return;
    }
    
    //シャッフル
    var shuffle_list = CreateShuffleList(select_member,false);
    
    //メンバ数が奇数の場合は休みの要素を先頭に追加する
    if((shuffle_list.length % 2 ) != 0 ) {
      //奇数の場合
      shuffle_list.unshift("休み");
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
      alert("4人以上選択してほしいですぅ・・・");
      return;
    }
    
    //偶数選択していないとNG
    if((select_member.length % 2 ) != 0 ) {
      alert("人数は偶数にしてほしいですぅ・・・");
      return;
    }
    
    //シャッフル
    var shuffle_list = CreateShuffleList(select_member,true);
    
    //メンバ数が奇数の場合は休みの要素を先頭に追加する
    if((shuffle_list.length % 2 ) != 0 ) {
      //奇数の場合
      shuffle_list.unshift("休み");
    }
    
    //組み合わせパターン作成
    var round_robin_list = CreateRoundRobin(shuffle_list);
    
    var doublesStr = "";
    for (let k=0; k<round_robin_list.length; k++){
      var west = round_robin_list[k][0].split(";");
      var east = round_robin_list[k][1].split(";");
      doublesStr = doublesStr + ResultCreateDoubles(west[0],west[1],east[0],east[1]);
    }
    
    $('div.doubles').html(doublesStr);
    
  }else if(radioVal == "group"){
    //団体戦
    //シングルスの数取得
    var singles_count = $('[name=group_singles]').val();
    //ダブルスの数取得
    var doubles_count = $('[name=group_doubles]').val();
    
    if(singles_count == 0 && doubles_count == 0){
      alert("しんぐるすかだぶるすの人数がほしいですぅ・・・");
      return;
    }
    
    //必要な人数の計算
    var minMember = ((singles_count * 1) + (doubles_count * 2)) * 2
    
    //必要な人数以上選択しているか
    if(select_member.length < minMember){
      alert(minMember +  "人以上選択してほしいですぅ・・・");
      return;
    }
    //シャッフル
    var shuffle_list = CreateShuffleList(select_member,false);
    
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
      alert("しんぐるすかだぶるすの人数がほしいですぅ・・・");
      return;
    }
    
    //必要な人数の計算
    var minMember = (singles_count * 1) + (doubles_count * 2)
    
    //必要な人数以上選択しているか
    if(select_member.length < minMember){
      alert(minMember +  "人以上選択してほしいですぅ・・・");
      return;
    }
    //シャッフル
    var shuffle_list = CreateShuffleList(select_member,false);
    
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
  
  //ボタンの位置取得
  var $e = $('#lottery');
  var x1 = $e.offset().top;
  
  //画面スクロール
  $("html,body").animate({scrollTop:x1});
  
  

}

/**
 * 配列のシャッフル処理
 */
function CreateShuffleList(list,doubles) {
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
  
  //ダブルスモード
  if(doubles){
    var pair = newList.length/2;
    var mem_count = 0;
    var doubles_list = [];
    for(i=0;i<pair;i++){
      doubles_list.push(newList[mem_count] + ";" + newList[mem_count+1]);
      mem_count = mem_count + 2;
    }
    newList = doubles_list;
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
    if(x[i] != "休み" &&  y[i] != "休み"){
      round_robin.push([x[i], y[i]]);
    }
  }
  
  for(j = 2; j < n; j++ ){
    
    x.push(y[x.length-1]);
    y.unshift(x[1]);
    x.splice(1, 1);
    y.pop();
    
    for(k = 0; k < x.length;k++ ){
      if(x[k] != "休み" &&  y[k] != "休み"){
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
  
   gender1 = memMap.get(player1) == '0' ? "result_member_male" : "result_member_female";
   gender2 = memMap.get(player2) == '0' ? "result_member_male" : "result_member_female";

  
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
  + '</div>';
  
  return singles;
}

function ResultCreateDoubles(player1,player2,player3,player4){
  var doubles = "";
  
  //性別を取得
  var gender1;
  var gender2;
  var gender3;
  var gender4;
  
   gender1 = memMap.get(player1) == '0' ? "result_member_male" : "result_member_female";
   gender2 = memMap.get(player2) == '0' ? "result_member_male" : "result_member_female";
   gender3 = memMap.get(player3) == '0' ? "result_member_male" : "result_member_female";
   gender4 = memMap.get(player4) == '0' ? "result_member_male" : "result_member_female";

  
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
  + '</div>';
  
  return doubles;
}

function ResultCreateTeamSingles(player1,order){
  var singles = "";
  
  //性別を取得
  var gender1;
  
   gender1 = memMap.get(player1) == '0' ? "result_member_male" : "result_member_female";
  
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
  + '</div>';
  
  return singles;
}

function ResultCreateTeamDoubles(player1,player2, order){
  var doubles = "";
  
  //性別を取得
  var gender1;
  var gender2;
  
   gender1 = memMap.get(player1) == '0' ? "result_member_male" : "result_member_female";
   gender2 = memMap.get(player2) == '0' ? "result_member_male" : "result_member_female";
  
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
  + '</div>';
  
  return doubles;
}

function ResultCreateTeamReserve(player1){
  var doubles = "";
  
  //性別を取得
  var gender1;
  
   gender1 = memMap.get(player1) == '0' ? "result_member_male" : "result_member_female";
  
  doubles = '<div class="row">'
  + '<div class="col-3  align-self-center">'
  + '<label class="vs">'
  + 'ほけつ'
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
  + '</div>';
  
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

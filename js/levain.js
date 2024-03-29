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
      memInfo.no = i;
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
    var round_robin_list = CreateRoundRobinSingles(shuffle_list);
    
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
    
    var memList = shuffle_list;
    //メンバ数が奇数の場合は休みの要素を先頭に追加する
    if((shuffle_list.length % 2 ) != 0 ) {
      //奇数の場合
      shuffle_list.unshift(REST);
    }
    
    //組み合わせパターン作成
    var round_robin_list = CreateRoundRobinDoubles(shuffle_list);
    var pairList = [];
    //2名ずつに組みなおす
    for (let q=0; q<round_robin_list.length; q = q + 2){
      pairList.push([round_robin_list[q],round_robin_list[q+1]]);
    }
    
    var befMap = new Map();
    var gameCountMap = new Map();
    
    //休みを削除
    if(shuffle_list[0] == REST){
      shuffle_list.splice(0,1);
    }
    
    for (let i=0; i<shuffle_list.length; i++){
      gameCountMap.set(shuffle_list[i],0);
    }
    
    var resList = [];
    var pair1_count = 0;
    //試合カウント
    var current_game_count = 1;
    while(pairList.length != 0){
    
      var pair1;
      var pair2;
      var pair1_decision;
      pair1_decision = false;
      var pair1_count = 0;
      var pair2_decision;
      pair2_decision = false;
      var pair2_count = 0;
      
      if(pairList.length == 1){
        //pairList=1の場合
        pair1 = pairList[0];
        for (let i=0; i<resList.length; i++){
          pair2 = [resList[i],resList[i+1]];
          if(pair1[0] == pair2[0] || pair1[0] == pair2[1] || pair1[1] == pair2[0] || pair1[1] == pair2[1]){
            continue;
          }else{
            resList.push(pair1[0]);
            resList.push(pair1[1]);
            resList.push(pair2[0]);
            resList.push(pair2[1]);
            pairList.splice(0,1);
            break;
          }
        }
        continue;
      }
      
      //全員がcurrent_game_countになったら+1する
      if(game_play_Check(shuffle_list,current_game_count,gameCountMap)){
        current_game_count = current_game_count + 1;
      }
      
      //◆◆◆◆◆
      //ルール①
      //◆◆◆◆◆
      //ペア1決定
      for (let i=0; i<pairList.length; i++){
        pair1 = pairList[i];
        
        //ペア1が現在の試合カウントを超えていないかチェック
        if(gameCountMap.get(pair1[0]) > current_game_count){
          continue;
        }
        
        //ペア1が現在の試合カウントを超えていないかチェック
        if(gameCountMap.get(pair1[1]) > current_game_count){
          continue;
        }
        pair1_decision = true;
        pair1_count = i;
        break;
      }
      
      //ペア2決定
      for (let j=0; j<pairList.length; j++){
        pair2 = pairList[j];
        
        //ペア1と同じでないか
        if(pair1[0] == pair2[0] || pair1[0] == pair2[1] || pair1[1] == pair2[0] || pair1[1] == pair2[1]){
          continue;
        }
        
        //ペア2が現在の試合カウントを超えていないか
        if(gameCountMap.get(pair2[0]) > current_game_count){
          continue;
        }
        if(gameCountMap.get(pair2[1]) > current_game_count){
          continue;
        }
        /*
        if(befMap.size > 0){
          //前回対戦していないか
          var pair1bef1;
          if(befMap.has(pair1[0])){
            pair1bef1 = befMap.get(pair1[0]);
            if(pair2[0] == pair1bef1[0] || pair2[0] == pair1bef1[1] || pair2[1] == pair1bef1[0] || pair2[1] == pair1bef1[1]){
              continue;
            }
          }
          var pair1bef2;
          if(befMap.has(pair1[1])){
            pair1bef2 = befMap.get(pair1[1]);
            if(pair2[0] == pair1bef2[0] || pair2[0] == pair1bef2[1] || pair2[1] == pair1bef2[0] || pair2[1] == pair1bef2[1]){
              continue;
            }
          }
        }
        */
        pair2_decision = true;
        pair2_count = j-1;
        break;
      }
      
      if(pair1_decision && pair2_decision){
        //ここまできたら判定1でペア決定
        resList.push(pair1[0]);
        resList.push(pair1[1]);
        resList.push(pair2[0]);
        resList.push(pair2[1]);
        pairList.splice(pair1_count,1);
        pairList.splice(pair2_count,1);
        gameCountMap.set(pair1[0],gameCountMap.get(pair1[0]) + 1);
        gameCountMap.set(pair1[1],gameCountMap.get(pair1[1]) + 1);
        gameCountMap.set(pair2[0],gameCountMap.get(pair2[0]) + 1);
        gameCountMap.set(pair2[1],gameCountMap.get(pair2[1]) + 1);
        befMap.set(pair1[0],pair2);
        befMap.set(pair1[1],pair2);
        befMap.set(pair2[0],pair1);
        befMap.set(pair2[1],pair1);
        
        continue;
      }
      
      //◆◆◆◆◆
      //ルール②
      //◆◆◆◆◆
      pair1_decision = false;
      pair2_decision = false;
      //ペア1決定
      for (let i=0; i<pairList.length; i++){
        pair1 = pairList[i];
        
        //ペア1が現在の試合カウントを超えていないかチェック
        if(gameCountMap.get(pair1[0]) > current_game_count){
          continue;
        }
        
        //ペア1が現在の試合カウントを超えていないかチェック
        if(gameCountMap.get(pair1[1]) > current_game_count){
          continue;
        }
        pair1_decision = true;
        pair1_count = i;
        break;
      }
      
      //ペア2決定
      for (let j=0; j<pairList.length; j++){
        pair2 = pairList[j];
        
        //ペア1と同じでないか
        if(pair1[0] == pair2[0] || pair1[0] == pair2[1] || pair1[1] == pair2[0] || pair1[1] == pair2[1]){
          continue;
        }
        
        //ペア2が現在の試合カウントを超えていないか
        if(gameCountMap.get(pair2[0]) > current_game_count){
          continue;
        }
        if(gameCountMap.get(pair2[1]) > current_game_count){
          continue;
        }
        
        pair2_decision = true;
        pair2_count = j-1;
        break;
      }
      
      if(pair1_decision && pair2_decision){
        //ここまできたら判定1でペア決定
        resList.push(pair1[0]);
        resList.push(pair1[1]);
        resList.push(pair2[0]);
        resList.push(pair2[1]);
        pairList.splice(pair1_count,1);
        pairList.splice(pair2_count,1);
        gameCountMap.set(pair1[0],gameCountMap.get(pair1[0]) + 1);
        gameCountMap.set(pair1[1],gameCountMap.get(pair1[1]) + 1);
        gameCountMap.set(pair2[0],gameCountMap.get(pair2[0]) + 1);
        gameCountMap.set(pair2[1],gameCountMap.get(pair2[1]) + 1);
        befMap.set(pair1[0],pair2);
        befMap.set(pair1[1],pair2);
        befMap.set(pair2[0],pair1);
        befMap.set(pair2[1],pair1);
        continue;
      }
      
      //◆◆◆◆◆
      //ルール③
      //◆◆◆◆◆
      pair1_decision = false;
      pair2_decision = false;
      //ペア1決定
      for (let i=0; i<pairList.length; i++){
        pair1 = pairList[i];
        
        pair1_decision = true;
        pair1_count = i;
        break;
      }
      
      //ペア2決定
      for (let j=0; j<pairList.length; j++){
        pair2 = pairList[j];
        
        //ペア1と同じでないか
        if(pair1[0] == pair2[0] || pair1[0] == pair2[1] || pair1[1] == pair2[0] || pair1[1] == pair2[1]){
          continue;
        }
        
        pair2_decision = true;
        pair2_count = j-1;
        break;
      }
      
      if(pair1_decision && pair2_decision){
        //ここまできたら判定1でペア決定
        resList.push(pair1[0]);
        resList.push(pair1[1]);
        resList.push(pair2[0]);
        resList.push(pair2[1]);
        pairList.splice(pair1_count,1);
        pairList.splice(pair2_count,1);
        gameCountMap.set(pair1[0],gameCountMap.get(pair1[0]) + 1);
        gameCountMap.set(pair1[1],gameCountMap.get(pair1[1]) + 1);
        gameCountMap.set(pair2[0],gameCountMap.get(pair2[0]) + 1);
        gameCountMap.set(pair2[1],gameCountMap.get(pair2[1]) + 1);
        befMap.set(pair1[0],pair2);
        befMap.set(pair1[1],pair2);
        befMap.set(pair2[0],pair1);
        befMap.set(pair2[1],pair1);
        continue;
      }
    }
    
    //リストを描画する
    var doublesStr = "";
    var itemCount = 0;
    var loopCount = Math.floor(resList.length/4);
    
    for (let j=0; j < loopCount; j++){
      var east1 = resList[itemCount];
      var east2 = resList[itemCount+1];
      var west1 = resList[itemCount+2];
      var west2 = resList[itemCount+3];
      
      doublesStr = doublesStr + ResultCreateDoubles(east1,east2,west1,west2);
      
      itemCount = itemCount +4;
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
 * VSボタン選択
 */
function VSChecked(id,enable){
  console.log('VSChecked');
  
  //自分自身の値を取得
  console.log(enable);
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
 * YESボタン
 */
function PushYes(){
  console.log('PushYes');
  
  return true;
}

/**
 * NOボタン
 */
function PushNo(){
  console.log('PushNo');
  
  return false;
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
function CreateRoundRobinSingles(shuffle_list){
  console.log("CreateRoundRobinSingles");
  
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

/**
 * 総当たり作成処理
 */
function CreateRoundRobinDoubles(shuffle_list){
  console.log("CreateRoundRobinDoubles");
  
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
    /*
    if(x[i] != REST){
      round_robin.push(x[i]);
    }
    if(y[i] != REST){
      round_robin.push(y[i]);
    }
    */
    if(x[i] == REST || y[i] == REST){
      console.log(x[i] + ":" + y[i]);
    }else{
      round_robin.push(x[i]);
      round_robin.push(y[i]);
    }
  }
  
  for(j = 2; j < n; j++ ){
    
    x.push(y[x.length-1]);
    y.unshift(x[1]);
    x.splice(1, 1);
    y.pop();
    
    for(k = 0; k < x.length;k++ ){
      /*
      if(x[k] != REST){
        round_robin.push(x[k]);
      }
      if(y[k] != REST){
        round_robin.push(y[k]);
      }
      */
      if(x[k] == REST || y[k] == REST){
        console.log(x[k] + ":" + y[k]);
      }else{
        round_robin.push(x[k]);
        round_robin.push(y[k]);
      }
    }
  }

  return round_robin;
}

/**
 * 全員が試合したかチェック
 */
function game_play_Check(shuffle_list,current_game_count,gameCountMap){
  console.log('game_play_Check');
  
  for (let i=0; i<shuffle_list.length; i++){
    if(gameCountMap.get(shuffle_list[i]) < current_game_count){
      //current_game_count未満があったらまだ全員試合していないのでfalse
      return false;
    }
  }
  return true;
}


function ResultCreateSingles(player1,player2){
  var singles = "";
  
  //キー
  var vsKey = player1 + player2;
  
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
  + '<div class="vs-select">'
  + '<label>'
  + '<input type="checkbox" name="VS'
  + '" value="" onClick="VSChecked(this.id,this.checked);"/>'
  + '<span class="vs-label">VS</span>'
  + '</label>'
  + '</div>'
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
  + '<div class="vs-select">'
  + '<label>'
  + '<input type="checkbox" name="VS'
  + '" value="" onClick="VSChecked(this.id,this.checked);"/>'
  + '<span class="vs-label">VS</span>'
  + '</label>'
  + '</div>'
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

/* 桜を降らせる場合は本メソッドを有効化する */
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


/*
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
*/

/* 雪を降らせる場合は本メソッドを有効化する
$(document).ready(function() {
  $( 'body' ).flurry({
    character: "❄",
    height: 800,
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
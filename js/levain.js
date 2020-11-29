var memMap;

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
    $("#type_pattern").css("display", "block");
  }else{
    $("#type_pattern").css("display", "none");
  }
}

/**
 * 抽選押下時処理
 */
function Lottery() {
  console.log('Lottery');
  
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
      alert("2人以上選択してね");
      return;
    }
    
    //シャッフル
    var shuffle_list = ShuffleList(select_member);
    var round_robin_list = CreateRoundRobin(shuffle_list);
    
    console.log(round_robin_list);
    
    
  }else if(radioVal == "doubles"){
    //ダブルス
    //4人以上選択していないとシングルスは不可
     if(select_member.length < 4){
      alert("4人以上選択してね");
      return;
    }
    //シャッフル
    var shuffle_list = ShuffleList(select_member);
  }else{
    //団体戦
    //10人以上選択していないと団体は不可
    if(select_member.length < 10){
      alert("10人以上選択してね");
      return;
    }
    //シャッフル
    var shuffle_list = ShuffleList(select_member);
    //doubles1
    $('div.group_doubles1').html(ResultCreateDoubles(shuffle_list[0],shuffle_list[1],shuffle_list[2],shuffle_list[3]));
    //doubles2
    $('div.group_doubles2').html(ResultCreateDoubles(shuffle_list[4],shuffle_list[5],shuffle_list[6],shuffle_list[7]));
    //singles1
    $('div.group_singles').html(ResultCreateSingles(shuffle_list[8],shuffle_list[9]));
    
    
    
  }

}

/**
 * 配列のシャッフル処理
 */
function ShuffleList(list) {
  newList = [];

  while (list.length > 0) {
    n = list.length;
    k = Math.floor(Math.random() * n);

    newList.push(list[k]);
    list.splice(k, 1);
  }
  
  return newList;
}

/**
 * 総当たり作成処理
 */
function CreateRoundRobin(list){
  let member1 = list.concat();
  let member2 = list.concat();
  
  var round_robin = [];
  
  for(let m1 of member1){
    member2.shift();
    for(let m2 of member2){
        console.log(m1 + ' vs ' + m2);
        round_robin.push([m1,m2,'']);
    }
  }
  return round_robin;
}

/**
 * 試合順のソート(singles)
 */
function RoundRobinSinglesSort(round_robin_list,offset,player1,player2,beforePlayer1,beforePlayer2,success_list) {
  
}

/**
 * 試合順のソート(doubles)
 */
function RoundRobinDoublesSort(list) {
  
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

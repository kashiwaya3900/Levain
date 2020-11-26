//Init();
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
    for ( var i = 0; i<list.length; i++ ) {
      
      if(list[i].gender == '0'){
        $male_list.append('<li>' + list[i].name + '</li>');
      }else{
        $female_list.append('<li>' + list[i].name + '</li>');
      }
      //console.log(`name=${list[i].name}, age=${list[i].age}, gender=${list[i].gender}`);
    }
  });
}

/**
 *抽選押下時処理
 */
function Lottery() {
  console.log('Lottery');
  alert("Hello");
}


function AllChecked(){
    var all = document.form.all.checked;
    for (var i=0; i<document.form.part.length; i++){
      document.form.part[i].checked = all;
    }
  }

// 一つでもチェックを外すと「全て選択」のチェック外れる
function DisChecked(){
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
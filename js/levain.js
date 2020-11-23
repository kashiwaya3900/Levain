Init();
/**
 *初期処理
 */
function Init() {
  console.log('Init');
  
  var url = "data/member.json";

  $.getJSON(url, (data) => {
    var list = data.member_list;
    for ( var i = 0; i<list.length; i++ ) {
      console.log(`name=${list[i].name}, age=${list[i].age}, gender=${list[i].gender}`);
    }
  });
}
/**
 *抽選押下時処理
 */
function Lottery() {
  console.log('Lottery');
}


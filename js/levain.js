var singleElimination = {
  "teams": [              // Matchups
    ["Team 1", "Team 2"], // First match
    ["Team 3", "Team 4"]  // Second match
  ],
  "results": [            // List of brackets (single elimination, so only one bracket)
    [                     // List of rounds in bracket
      [                   // First round in this bracket
        [1, 2],           // Team 1 vs Team 2
        [3, 4]            // Team 3 vs Team 4
      ],
      [                   // Second (final) round in single elimination bracket
        [5, 6],           // Match for first place
        [7, 8]            // Match for 3rd place
      ]
    ]
  ]
}

var doubleElimination = {
  "teams": [
    ["Team 1", "Team 2"],
    ["Team 3", "Team 4"]
  ],
  "results": [            // List of brackets (three since this is double elimination)
    [                     // Winner bracket
      [[1, 2], [3, 4]],   // First round and results
      [[5, 6]]            // Second round
    ],
    [                     // Loser bracket
      [[7, 8]],           // First round
      [[9, 10]]           // Second round
    ],
    [                     // Final "bracket"
      [                   // First round
        [11, 12],         // Match to determine 1st and 2nd
        [13, 14]          // Match to determine 3rd and 4th
      ],
      [                   // Second round
        [15, 16]          // LB winner won first round (11-12) so need a final decisive round
      ]
    ]
  ]
}

jQuery(document).ready(function(){
  var myelement = jQuery( '.elem' );
  $('.demo').bracket({
  init: singleElimination,
 
});

});

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

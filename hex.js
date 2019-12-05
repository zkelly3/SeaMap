const hexigons = {};


function moveTo(id, animate = false) {
  if (id === undefined) {
    return;
  }
  const y_pos = $('#' + id).offset().top;
  const x_pos = $('#' + id).offset().left;
  const w_height = $(window).height();
  const w_width = $(window).width();
  
  const x = Math.max(0, x_pos - w_width / 2);
  const y = Math.max(0, y_pos - w_height / 2);
  
  $([document.documentElement, document.body]).animate({
      scrollTop: y,
      scrollLeft: x,
  }, animate ? 500 : 0);
}

function updateInfo(hex) {
  $('#info').html('');
  let id_text = '編號：';
  let type_text = '';
  let boss_text = '';
  let suggest_text = '';
  let skill_text = '';
  let property_text = '屬性：';
  let reward_text = '獎勵：'
  
  let total_text = '';
  
  const id = hex['id']
  const type = hex['type']
  
  id_text += (id + 1);
  type_text += type;
  $('#info').append($('<p>').text(id_text + '　' + type_text));
  
  if (type == '戰鬥') {
    const boss = hex['boss'];
    const skill = hex['skill'];
    boss_text += boss;
    skill_text += skill.join(' ');
    $('#info').append($('<p>').text(boss_text));
    $('#info').append($('<p>').text(skill_text));
  } else if (type == '委派') {
    const suggest = hex['suggest'];
    const property = hex['property'];
    suggest_text += suggest.join(' ');
    property_text += property.join(' ');
    $('#info').append($('<p>').text(suggest_text));
    $('#info').append($('<p>').text(property_text));
  }
  
  const reward = hex['reward']
  const reward_type = hex['rewardtype'];
  if (reward_type != '無') {
    reward_text += reward.join(' ');
    $('#info').append($('<p>').text(reward_text));
  }
  
}

function draw() {
    let row = 0;
    let $row = null;
    let start = undefined;
    let pass_cnt = parseInt(0);
    
    let prev = 0;
    Object.keys(hexigons).forEach(function(key) {
        const hex = hexigons[key];
        
        //格子編號、格子種類、格子攻破否
        const id = parseInt(hex['id']);
        const type = hex['type'];
        const r_type = hex['rewardtype'];
        const pass = hex['pass'];
        
        //格子換行
        while (id + 1 > row * 30) {
            prev = row * 30 - 1;
            row += 1;
            $row = $('<div>').addClass('row');
            $('body').append($row).show();
        }
        
        //Ex. #hex1
        var $hex = $('<div>').addClass('hex').attr('id', 'hex' + (id + 1));
        
        //戰鬥格子顯示boss，其餘顯示種類
        let txt = (id + 1);
        if (type == '戰鬥') {
            txt += '<br/>' + hex['boss'];
        } else {
            txt += '<br/>' + type;
        }
        $hex.html(txt);
        
        //跳過沒有用的格子
        if (id - prev > 1) {
            var skip = '--num-skip: ';
            skip += (id - prev - 1);
            $hex.addClass('skip-n')
            $hex.attr('style', skip);
        }
        
        //幫不同種類的格子加邊框
        if (type == '戰鬥') {
            $hex.addClass('red-border');
        } else if (type == '委派') {
            $hex.addClass('green-border');
        } else if (type == '捐獻') {
            $hex.addClass('blue-border');
        } else if (type == '淨化') {
            $hex.addClass('orange-border');
        }
        
        //判斷格子為已攻破 (pass)、不能攻打 (notpass)、正在攻打 (fight)、有在規劃路線上 (route)
        if (pass === 'O') {
          // 起始點特判
          if (type == '起始點') 
            $hex.addClass('start');
          else
            $hex.addClass('pass');
          pass_cnt += 1;
        } else {
          const around = [];
          if (Math.floor(id / 30) % 2 == 0) {
            if (id % 30 > 0) {
              around.push((id - 1) in hexigons ? (id - 1) : -1);
            }
            if (id % 30 < 29) {
              around.push((id + 1) in hexigons ? (id + 1) : -1);
              around.push((id + 30) in hexigons ? (id + 30) : -1);
              around.push((id + 31) in hexigons ? (id + 31) : -1);
            }
            around.push((id - 30) in hexigons ? (id - 30) : -1);
            around.push((id - 29) in hexigons ? (id - 29) : -1);
          } else {
            if (id % 30 > 0) {
              around.push((id - 31) in hexigons ? (id - 31) : -1);
              around.push((id - 1) in hexigons ? (id - 1) : -1) ;
              around.push((id + 29) in hexigons ? (id + 29) : -1);
            }
            if (id % 30 < 29) {
              around.push((id + 1) in hexigons ? (id + 1) : -1);
            }
            around.push((id - 30) in hexigons ? (id - 30) : -1);
            around.push((id + 30) in hexigons ? (id + 30) : -1);
          }
          let fight = false;
          for (let i = 0; i < around.length; i++) {
            let a = around[i]
            if (a != -1 && hexigons[a]['pass'] === 'O') {
              $hex.addClass('fight');
              fight = true;
              break;
            }
          }
          if (!fight) {
            if (hex['route'] === 'O') {
              $hex.addClass('route');
            } else {
              $hex.addClass('notpass');
            }
          }
        }
        
        //sidebar
        if (type == '起始點') {
          start = $hex.attr('id');
          $hex.addClass('important');
          $('#bar起終點').append($('<li>').append($('<a>').text('起始點' + ' ' + (id + 1)).attr('href', '#').bind('click', () => {
            moveTo($hex.attr('id'), animate=true);
            updateInfo(hex);
          }).bind('mouseover', () => {
            $hex.addClass('hover');
          }).bind('mouseout', () => {
            $hex.removeClass('hover');
          })));
        } else if (type == '戰鬥' && hex['boss'] == '偽神') {
          $hex.addClass('important');
          $('#bar起終點').append($('<li>').append($('<a>').text(hex['boss'] + ' ' + (id + 1)).attr('href', '#').bind('click', () => {
            moveTo($hex.attr('id'), animate=true);
            updateInfo(hex);
          }).bind('mouseover', () => {
            $hex.addClass('hover');
          }).bind('mouseout', () => {
            $hex.removeClass('hover');
          })));
        } else if (r_type == '削弱偽神') {
          $hex.addClass('important');
          $('#bar祭憶之城').append($('<li>').append($('<a>').text(hex['boss'] + ' ' + (id + 1)).attr('href', '#').bind('click', () => {
            moveTo($hex.attr('id'), animate=true);
            updateInfo(hex);
          }).bind('mouseover', () => {
            $hex.addClass('hover');
          }).bind('mouseout', () => {
            $hex.removeClass('hover');
          })));
        } else if (r_type == '巫女之魂') {
          $hex.addClass('important');
          $('#bar巫女').append($('<li>').append($('<a>').text(hex['boss'] + ' ' + (id + 1)).attr('href', '#').bind('click', () => {
            moveTo($hex.attr('id'), animate=true);
            updateInfo(hex);
          }).bind('mouseover', () => {
            $hex.addClass('hover');
          }).bind('mouseout', () => {
            $hex.removeClass('hover');
          })));
        } else if (r_type == '幻境據點') {
          $hex.addClass('important');
          $('#bar幻境據點').append($('<li>').append($('<a>').text(hex['boss'] + ' ' + (id + 1)).attr('href', '#').bind('click', () => {
            moveTo($hex.attr('id'), animate=true);
            updateInfo(hex);
          }).bind('mouseover', () => {
            $hex.addClass('hover');
          }).bind('mouseout', () => {
            $hex.removeClass('hover');
          })));
        } else if (r_type == '解鎖') {
          $hex.addClass('important');
          $('#bar解鎖').append($('<li>').append($('<a>').text(hex['reward'][0].substr(2) + ' ' + (id + 1)).attr('href', '#').bind('click', () => {
            moveTo($hex.attr('id'), animate=true);
            updateInfo(hex);
          }).bind('mouseover', () => {
            $hex.addClass('hover');
          }).bind('mouseout', () => {
            $hex.removeClass('hover');
          })));
        } else if (r_type == '祝福') {
          $hex.addClass('important');
          $('#bar祝福').append($('<li>').append($('<a>').text(hex['reward'][0] + ' ' + (id + 1)).attr('href', '#').bind('click', () => {
            moveTo($hex.attr('id'), animate=true);
            updateInfo(hex);
          }).bind('mouseover', () => {
            $hex.addClass('hover');
          }).bind('mouseout', () => {
            $hex.removeClass('hover');
          })));
        }
        
        $hex.bind('click', () => {
          updateInfo(hex);
          if (!$('#slide').prop("checked") == true) {
            $('#slide').trigger('click');
          }
        });
        
        $row.append($hex).append('\n').show();
        prev = id;
    });
    
    //移動至起始點
    $('#passcount').text(pass_cnt);
    moveTo(start);
}

$(function() {
  $.getJSON('hexigon.json', function(data) {
      data.forEach(function(e) {
          hexigons[e['id']] = e;
      });
      draw();
  });
});

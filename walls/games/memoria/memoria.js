$(function(){
  
    function set(key, value) { localStorage.setItem(key, value); }
    function get(key)        { return localStorage.getItem(key); }
    function increase(el)    { set(el, parseInt( get(el) ) + 1); }
    function decrease(el)    { set(el, parseInt( get(el) ) - 1); }
  
    var toTime = function(nr){
      if(nr == '-:-') return nr;
      else { var n = ' '+nr/1000+' '; return n.substr(0, n.length-1)+'s'; }
    };
  
    function updateStats(){
      $('#stats').html('<div class="padded"><h2>Figuras: <span>'+
        '<b>'+get('flip_won')+'</b><i>Ganado</i>'+
        '<b>'+get('flip_lost')+'</b><i>Perdido</i>'+
        '<b>'+get('flip_abandoned')+'</b><i>Abandonado</i></span></h2>'+
        '<ul><li><b>Mejor casual:</b> <span>'+toTime( get('flip_casual') )+'</span></li>'+
        '<li><b>Mejor medio:</b> <span>'+toTime( get('flip_medium') )+'</span></li>'+
        '<li><b>Mejor dificil:</b> <span>'+toTime( get('flip_hard') )+'</span></li></ul>'+
        '<ul><li><b>Total Flips:</b> <span>'+parseInt( ( parseInt(get('flip_matched')) + parseInt(get('flip_wrong')) ) * 2)+'</span></li>'+
        '<li><b>Emparejados:</b> <span>'+get('flip_matched')+'</span></li>'+
        '<li><b>Volteos equivocados:</b> <span>'+get('flip_wrong')+'</span></li></ul></div>');
    };
  
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;
      while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }
      return array;
    };
  
    function startScreen(text){
      $('#g').removeAttr('class').empty();
      $('.logo').fadeIn(250);
  
      $('.c1').text(text.substring(0, 1));
      $('.c2').text(text.substring(1, 2));
      $('.c3').text(text.substring(2, 3));
      $('.c4').text(text.substring(3, 4));
  
      // If won game
      if(text == 'nice'){
        increase('flip_won');
        decrease('flip_abandoned');
      }
  
      // If lost game
      else if(text == 'fail'){
        increase('flip_lost');
        decrease('flip_abandoned');
      }
  
      // Update stats
      updateStats();
    };
  
    /* LOAD GAME ACTIONS */
  
    // Init localStorage
    if( !get('flip_won') && !get('flip_lost') && !get('flip_abandoned') ){
      //Overall Game stats
      set('flip_won', 0);
      set('flip_lost', 0);
      set('flip_abandoned', 0);
      //Best times
      set('flip_casual', '-:-');
      set('flip_medium', '-:-');
      set('flip_hard', '-:-');
      //Cards stats
      set('flip_matched', 0);
      set('flip_wrong', 0);
    }
  
    // Fill stats
    if( get('flip_won') > 0 || get('flip_lost') > 0 || get('flip_abandoned') > 0) {updateStats();}
  
    // Toggle start screen cards
    $('.logo .card:not(".twist")').on('click', function(e){
      $(this).toggleClass('active').siblings().not('.twist').removeClass('active');
      if( $(e.target).is('.playnow') ) { $('.logo .card').last().addClass('active'); }
    });
  
    // Start game
    $('.play').on('click', function(){
      increase('flip_abandoned');
          $('.info').fadeOut();
  
      var difficulty = '',
          timer      = 1000,
          level      = $(this).data('level');
  
      // Set game timer and difficulty   
      if     (level ==  8) { difficulty = 'casual'; timer *= level * 4; }
      else if(level == 18) { difficulty = 'medium'; timer *= level * 5; }
      else if(level == 32) { difficulty = 'hard';   timer *= level * 6; }	    
  
      $('#g').addClass(difficulty);
  
      $('.logo').fadeOut(250, function(){
        var startGame  = $.now(),
            obj = [];
  
        // Create and add shuffled cards to game
        for(i = 0; i < level; i++) { obj.push(i); }
  
        var shu      = shuffle( $.merge(obj, obj) ),
            cardSize = 100/Math.sqrt(shu.length);
  
        for(i = 0; i < shu.length; i++){
          var code = shu[i];
          var emojiCode;

          // Mapear el código de la tarjeta al emoji correspondiente
          switch(code) {
            case 0:
                emojiCode = '\u{1F34E}'; // Manzana
                break;
            case 1:
                emojiCode = '\u{1F352}'; // Cereza
                break;
            case 2:
                emojiCode = '\u{1F47D}'; // Alien
                break;
            case 3:
                emojiCode = '\u{1F638}'; // Gato riendo
                break;
            case 4:
                emojiCode = '\u{1F916}'; // Robot
                break;
            case 5:
                emojiCode = '\u{1F47E}'; // Alien monster
                break;
            case 6:
                emojiCode = '\u{1F47B}'; // Fantasma
                break;
            case 7:
                emojiCode = '\u{1F4A9}'; // Popo
                break;
            case 8:
                emojiCode = '\u{1F480}'; // Calabera
                break;
            case 9:
                emojiCode = '\u{1F913}'; // Nerd
                break;
            case 10:
                emojiCode = '\u{1F3CE}'; // F1
                break;
            case 11:
                emojiCode = '\u{1F48B}'; // Beso
                break;
            case 12:
                emojiCode = '\u{1F98A}'; // Zorro
                break;
            case 13:
                emojiCode = '\u{1FACE}'; // Reno
                break;
            case 14:
                emojiCode = '\u{1F437}'; // Cerdo
                break;
            case 15:
                emojiCode = '\u{1F438}'; // Rana
                break;
            case 16:
                emojiCode = '\u{1F419}'; // Pulpo
                break;
            case 17:
                emojiCode = '\u{1F355}'; // Pizza
                break;
            case 18:
                emojiCode = '\u{1F525}'; // Fuego
                break;
            case 19:
                emojiCode = '\u{1F6B8}'; // Cruce
                break;
            case 20:
              emojiCode = '\u{1F1F5}'; // Peru
              break;



            case 21:
                emojiCode = '\u{1F511}'; // Llave
                break;
            case 22:
                emojiCode = '\u{1F4B0}'; // Dinero
                break;
            case 23:
                emojiCode = '\u{1F319}'; // Luna
                break;
            case 24:
                emojiCode = '\u{1F680}'; // Cohete
                break;
            case 25:
                emojiCode = '\u{1F33C}'; // Flor
                break;
            case 26:
                emojiCode = '\u{1F414}'; // Pollo
                break;
            case 27:
                emojiCode = '\u{1F984}'; // Unicornio
                break;
            case 28:
                emojiCode = '\u{1F608}'; // Diabolo
                break;
            case 29:
                emojiCode = '\u{1F970}'; // Enamorado
                break;
            case 30:
                emojiCode = '\u{1F441}'; // Ojo
                break;
            case 31:
                emojiCode = '\u{1F43}'; // Mono
                break;
            case 32:
                emojiCode = '\u{1F349}'; // Sandia
                break;
            
            default:
                emojiCode = '\u{1F34E}'; // Manzana como valor predeterminado
                break;
        }

          if(code < 10) code = "0" + code;
          if(code == 30) code = 10;
          if(code == 31) code = 21;
          $('<div class="card" style="width:'+cardSize+'%;height:'+cardSize+'%;">'+
              '<div class="flipper"><div class="f"></div><div class="b" data-f="'+ emojiCode +'"></div></div>'+
            '</div>').appendTo('#g');
        }
  
        // Set card actions
        $('#g .card').on({
          'mousedown' : function(){
            if($('#g').attr('data-paused') == 1) {return;}
            var data = $(this).addClass('active').find('.b').attr('data-f');
  
            if( $('#g').find('.card.active').length > 1){
              setTimeout(function(){
                var thisCard = $('#g .active .b[data-f='+data+']');
  
                if( thisCard.length > 1 ) {
                  thisCard.parents('.card').toggleClass('active card found').empty(); //yey
                  increase('flip_matched');
  
                  // Win game
                  if( !$('#g .card').length ){
                    var time = $.now() - startGame;
                    if( get('flip_'+difficulty) == '-:-' || get('flip_'+difficulty) > time ){
                      set('flip_'+difficulty, time); // increase best score
                    }
  
                    startScreen('nice');
                  }
                }
                else {
                  $('#g .card.active').removeClass('active'); // fail
                  increase('flip_wrong');
                }
              }, 401);
            }
          }
        });
  
        // Add timer bar
        $('<i class="timer"></i>')
          .prependTo('#g')
          .css({
            'animation' : 'timer '+timer+'ms linear'
          })
          .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            startScreen('fail'); // fail game
          });
  
        // Set keyboard (p)ause and [esc] actions
        $(window).off().on('keyup', function(e){
          // Pause game. (p)
          if(e.keyCode == 80){
            if( $('#g').attr('data-paused') == 1 ) { //was paused, now resume
              $('#g').attr('data-paused', '0');
              $('.timer').css('animation-play-state', 'running');
              $('.pause').remove();
            }
            else {
              $('#g').attr('data-paused', '1');
              $('.timer').css('animation-play-state', 'paused');
              $('<div class="pause"></div>').appendTo('body');
            }
          }
          // Abandon game. (ESC)
          if(e.keyCode == 27){
            startScreen('flip');
            // If game was paused
            if( $('#g').attr('data-paused') == 1 ){
              $('#g').attr('data-paused', '0');
              $('.pause').remove();
            }
            $(window).off();
          }
        });
      });
    });
    
  });
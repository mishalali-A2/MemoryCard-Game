const avail_cards = [
  "accelgor", "clefairy", "magmar", "panchman", "regice", "shuppet", 
  "silicobra", "snorlax", "sprigatito", "togedemaru", "torchic", "wooper", "petilil"
];

let cards_set = [];
let card_A, card_B = null;
let mistakes = 0; 
let correct=0;
let game_start = false;
let game_lock = false;
const card_back = "/MemoryCard-Game/imgs/back.png";

//fisher-yates algo-> shuffles arr w/i itself
function shuffle_cards(arr) {
  for (let idx = arr.length-1; idx > 0; idx--) {
    const rand_idx = Math.floor(Math.random() * (idx + 1));
    //swaps the idx and random idx generated
    [arr[idx], arr[rand_idx]] = [arr[rand_idx], arr[idx]];
  }
}

function choose_cards() {
  const shuffled = [...avail_cards];
  shuffle_cards(shuffled);
  //choose the first random 8 cards
  return shuffled.slice(0, 8);
}

//triggered by Reshuffle button
function reshuffling() {
  $("#mistake-cnt").text("Oopsies: 0");
  $("#correct-cnt").text("Cards Collected: 0")
  card_A = card_B = null;
  game_start = false;
  game_lock = false;

  const chosen_cards = choose_cards();
  const dup_cards = [...chosen_cards, ...chosen_cards];
  shuffle_cards(dup_cards);

  cards_set = dup_cards.map(name => ({
    name: name,
    matched: false
  }));
  
  $("#board").empty();
  for (let idx = 0; idx < cards_set.length; idx++) {
    //start with back img for each card
    $("#board").append(`
      <div class="col">
        <img src="${card_back}" data-index="${idx}">
      </div>
    `);
  }

  $("#refresh").prop("disabled", true);

  setTimeout(function() {
    $("#board img").each(function(idx) {
      const card_name = cards_set[idx].name;
      $(this).attr("src", "/MemoryCard-Game/imgs/" + card_name + ".png");
    });
  }, 100);

  setTimeout(() => {
    $("#board img").each(function() {
      $(this).attr("src", card_back);
    });
    game_start = true;
    $("#refresh").prop("disabled", false);
  }, 1500);
}

function cards_matched() {
  const name_A = cards_set[parseInt(card_A.data("index"))].name;
  const name_B = cards_set[parseInt(card_B.data("index"))].name;
  //if not matched
  if (name_A !== name_B) {
    mistakes++;
    $("#mistake-cnt").text("Oopsies: " + mistakes);
    //don't allow player to play till cards flipped back
    game_lock = true;
    
    setTimeout(() => {
      card_A.attr("src", card_back);
      card_B.attr("src", card_back);
      card_A = card_B = null;
      //allow user to play again
      game_lock = false;
    }, 1000);
  } 
  else {
    correct++;
    $("#correct-cnt").text("Cards Collected: "+ correct)
    cards_set[card_A.data("index")].matched = true;
    cards_set[card_B.data("index")].matched = true;
    card_A = card_B = null;

    if (all_matched()) {
      setTimeout(() => {
        $("#total-mistakes").text(mistakes);
        const modal = new bootstrap.Modal(document.getElementById('congrats-msg'));
        modal.show();
      }, 500);
    }
  }
}
function all_matched() {
  return cards_set.every(card => card.matched);
}
$(document).ready(function() {
  reshuffling();

  $("#refresh").click(reshuffling);
  $("#play-again").click(function() {
    $("#congrats-msg").modal('hide');
    reshuffling();
  });

  debugger;
  
  $("#board").on("click", "img", function() {
    if (!game_start || game_lock) return;

    const idx = $(this).data("index");
    if (cards_set[idx].matched || this === card_A?.get(0)) return;

    $(this).attr("src", "/MemoryCard-Game/imgs/" + cards_set[idx].name + ".png");

    if (!card_A) {
      card_A = $(this);
    } 
    else if (!card_B) {
      card_B = $(this);
      cards_matched();
    }
  });
});
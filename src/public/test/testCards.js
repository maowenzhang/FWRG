$(function () {
    var deck = (new Deck()).shuffle();
    var hand1 = deck.deal(17).sort(Card.orderByRank);
    var hand2 = deck.deal(17).sort(Card.orderByRank);

    var cards1 = [];
    cards1.push(hand1[0]);
    var suitpattern1 = (new SuitPattern(cards1));

    var cards2 = [];
    cards2.push(hand2[2]);
    var suitpattern2 = (new SuitPattern(cards2));

    if (suitpattern2.IsLargerThan(suitpattern1) == 1) {
    // can serve the cards
    }

});
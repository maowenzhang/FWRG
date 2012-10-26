
// Define a class to represent a playing card
function Card(suit, rank) {
	this.id = suit + '-' + rank;
    this.suit = suit; // Each card has a suit
    this.rank = rank; // and a rank
	this.selected = false;
}

// These enumerated types define the suit and rank values
Card.Suit = enumeration({ Diamonds: 1, Clubs: 2, Hearts: 3, Spades: 4, Jokers: 5});
Card.Rank = enumeration({ Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7,
                          Eight: 8, Nine: 9, Ten: 10, Jack: 11, Queen: 12, King: 13,
                          Ace: 14, Two: 15,  BlackJoker: 16, RedJoker: 17
});

// Define a textual representation for a card
Card.prototype.toString = function () {
    return this.rank.toString() + " of " + this.suit.toString();
};

// Compare the value of two cards as you would in poker
Card.prototype.compareTo = function (that) {
    if (this.rank < that.rank) return -1;
    if (this.rank > that.rank) return 1;
    return 0;
};

// A function for ordering cards as you would in poker
Card.orderByRank = function (a, b) { return a.compareTo(b); };

// A function for ordering cards as you would in bridge 
Card.orderBySuit = function (a, b) {
    if (a.suit < b.suit) return -1;
    if (a.suit > b.suit) return 1;
    if (a.rank < b.rank) return -1;
    if (a.rank > b.rank) return 1;
    return 0;
};

// Define a class to represent a standard deck of cards
function Deck() {
    var cards = this.cards = []; // A deck is just an array of cards
    Card.Suit.foreach(function (s) { // Initialize the array
        Card.Rank.foreach(function (r) {
			if(s.value < 5 && r.value < 16 ||
			   s.value == 5 && r.value > 15) {
				cards.push(new Card(s, r));
			}
        });
		
    });
}

// Shuffle method: shuffles cards in place and returns the deck
Deck.prototype.shuffle = function () {
    // For each element in the array, swap with a randomly chosen lower element
    var deck = this.cards, len = deck.length;
    for (var i = len - 1; i > 0; i--) {
        var r = Math.floor(Math.random() * (i + 1)), temp; // Random number
        temp = deck[i], deck[i] = deck[r], deck[r] = temp; // Swap
    }
    return this;
};

// Deal method: returns an array of cards
Deck.prototype.deal = function (n) {
    if (this.cards.length < n) throw "Out of cards";
    return this.cards.splice(this.cards.length - n, n);
};

//An array of cards which can produce
function SuitPattern(cards) {
    if(cards.length == 0){
        this.pattern = Invalid;
        return;
    }
    this.cards = cards.sort(Card.orderByRank);

    if(this.IsSingle()) this.pattern = 1;
    else if (this.IsDouble()) this.pattern = 2;
    else if (this.IsTreble()) this.pattern = 3;
    else if (this.IsTrebleWithSingle()) this.pattern = 4;
    else if(this.IsTrebleWithDouble()) this.pattern = 5;
    else if(this.IsSingleSequence()) this.pattern = 6;
    else if (this.IsDoubleSequence()) this.pattern = 7;
    else if (this.IsTrebleSequence()) this.pattern = 8;
//    else if(this.IsTrebleWithSingleSequence()) this.pattern = 9;
//    else if(this.IsTrebleWithDoubleSequence()) this.pattern = 10;
    else if (this.IsBomb()) this.pattern = 11;
    else if (this.IsRockets()) this.pattern = 12;
    else this.pattern = 0;

    if(this.pattern != 0)
        this.rank = this.cards[0].rank;
}

SuitPattern.Pattern = enumeration({ Invalid: 0, Single: 1, Double: 2, Treble: 3, TrebleWithSingle: 4, TrebleWithDouble: 5,
                                    SingleSequence: 6, DoubelSequence: 7, TrebleSequence: 8, TrebleWithSingleSequence:9, 
                                    TrebleWithDoubleSequence:10, Bomb:11, Rockets:12});

SuitPattern.prototype.IsSingle = function () {
    return this.cards.length == 1;
}

SuitPattern.prototype.IsDouble = function () {
    if (this.cards.length != 2)
        return false;

    if (this.cards[0].rank == this.cards[1].rank)
        return true;

    return false;
}

SuitPattern.prototype.IsTreble = function () {
    if (this.cards.length !=3)
        return false;

    if (this.cards[0].rank == this.cards[1].rank == this.cards[2].rank)
        return true;

    return false;
}

SuitPattern.prototype.IsTrebleWithSingle = function () {
    if (this.cards.length != 4)
        return false;

    if (this.cards[0].rank == this.cards[1].rank == this.cards[2].rank)
        return true;

    if (this.cards[1].rank == this.cards[2].rank == this.cards[3].rank) {
        var temp = this.cards[0]; this.cards[0] = this.cards[3]; this.cards[3] = temp; // Swap
        return true;
    }

    return false;
}

SuitPattern.prototype.IsTrebleWithDouble = function () {
    if (this.cards.length != 5)
        return false;

    if (this.cards[0].rank == this.cards[1].rank == this.cards[2].rank && this.cards[3].rank == this.cards[4].rank)
        return true;

    if (this.cards[1].rank == this.cards[2].rank && this.cards[3].rank == this.cards[4].rank == this.cards[5].rank) {
        var temp = this.cards[0]; this.cards[0] = this.cards[4]; this.cards[4] = temp; // Swap
        var temp2 = this.cards[1]; this.cards[1] = this.cards[3]; this.cards[3] = temp2; // Swap
        return true;
    }

    return false;
}

SuitPattern.prototype.IsSingleSequence = function () {
    if (this.cards.length < 5)
        return false;

    //The sequence should not contains jokers and "2"
    for (var i = 0; i < this.cards.length; i++)
    {
        if (this.cards[i].suit == 5 || this.cards[i].suit == 15)
        return false;
    }

    for(var i=1; i<cards.length; i++)
    {
        if (this.cards[i].rank - this.cards[i - 1].rank != 1)
            return false;
    }

    return true;
}

SuitPattern.prototype.IsDoubleSequence = function () {
    if (this.cards.length < 6 || this.cards.length % 2 != 0)
        return false;

    //The sequence should not contains jokers and "2"
    for (var i = 0; i < this.cards.length; i++)
    {
        if (this.cards[i].suit == 5 || this.cards[i].suit == 15)
        return false;
    }

    for (var i = 0; i < this.cards.length; i += 2)
    {
        if (this.cards[i].rank != this.cards[i + 1].rank)
            return false;
    }

    for(var i=0; i<cards.length-2; i+=2)
    {
        if (this.cards[i + 2].rank - this.cards[i].rank != 1)
            return false;
    }

    return true;
}

SuitPattern.prototype.IsTrebleSequence = function () {
    if (this.cards.length < 6 || this.cards.length % 3 != 0)
        return false;

    //The sequence should not contains jokers and "2"
    for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].suit == 5 || this.cards[i].suit == 15)
            return false;
    }

    for (var i = 0; i < this.cards.length; i += 3) {
        if (this.cards[i].rank != this.cards[i + 1].rank || this.cards[i].rank != this.cards[i + 2].rank)
            return false;
    }

    for (var i = 0; i < cards.length - 3; i += 3) {
        if (this.cards[i + 3].rank - this.cards[i].rank != 1)
            return false;
    }

    return true;
}

SuitPattern.prototype.IsBomb = function () {
    if (this.cards.length != 4)
        return false;

    if (cards[0].rank == cards[1].rank == cards[2].rank == cards[3].rank)
        return true;

    return false;
}

SuitPattern.prototype.IsRockets = function () {
    if (this.cards.length != 2)
        return false;

    if (this.cards[0].suit == this.cards[1].suit == 5 && this.cards[0].rank != this.cards[1].rank)
        return true;

    return false;
}
// Compare the value of two array cards as you would in poker
SuitPattern.prototype.compareTo = function (that) {
    if (this.cards.length != that.cards.length)
        return 0;
    if (this.pattern != that.pattern)
        return 0;

    if (this.rank > that.rank)
        return 1;
    else
        return -1
    return 0;
};

// Compare the value of two array cards as you would in poker
SuitPattern.prototype.IsLargerThan = function (that) {
    if (this.IsRockets() && !that.IsRockets)
        return 1;
    if (this.IsBomb() && this.pattern > that.pattern)
        return 1;
    else
        return this.compareTo(that);
};

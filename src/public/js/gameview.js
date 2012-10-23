function GameView(paper) {

	// reference the object in paper.js.
	var Point = paper.Point;
	var Raster = paper.Raster;
	var project = paper.project;
	var view = paper.view;

	this.viewSize = view.size;
	this.center = view.center;
	this.margin = 10; //10px
	this.offset = 16;
	var self = this;

	// track the active player, which needs to deliver cards or
	// pass.
	this.activePlayer = null;
	// store the hit test result.
	this.hitObject = null;

	function createImageElem(id, src, style)
	{
		var img = document.createElement("img");
		img.id = id;
		img.src = src;
		img.style = style;
		return img;
	}

	function loadResources()
	{
		var res = [];
		var counter = 0;
		// create image DOM elements for each card image
		var path = "res/card/";
		for(var i = 1; i < 5; ++i) {
			for(var j = 1; j < 14; ++j) {
				var name = i + '-' + j;
				var imgFile = path + name + '.gif';
				res[counter++] = createImageElem(name, imgFile, "display: none;");
			}
		}
		// queen & king
		res[counter++] = createImageElem("s1", path+"s1.gif", "display: none;");
		res[counter++] = createImageElem("s2", path+"s2.gif", "display: none;");
		// rear
		res[counter++] = createImageElem("rear", path+"rear.gif", "display: none;");
		
		// avatar, background & lord
		path = "res/img/";
		res[counter++] = createImageElem("avatar", path+"avatar.png", "display: none;");
		res[counter++] = createImageElem("avatar2", path+"avatar2.png", "display: none;");
		res[counter++] = createImageElem("background", path+"background.png", "display: none;");
		res[counter++] = createImageElem("Lord", path+"Lord.png", "display: none;");
		
		return res;
	}

	function createPlayerSeat(center, size, boundColor, fillColor)
	{
		// offset center to get the top-left point of the round rectangle
		var pt = new Point(center.x-size.width/2, center.y-size.height/2);
		var rect = new Rectangle(pt, size);
		var cornerSize = new Size(5, 5);
		var bound = new Path.RoundRectangle(rect, cornerSize);
		bound.fillColor = fillColor;
		bound.strokeColor = boundColor;
		bound.opacity = 0.4;
		return bound;
	}

	// mock up, we'll get the user info from server
	function getPlayersInfo()
	{
		// mimic 3 player and return to the caller
		var players = [];
		players[0] = new User("Lori");
		players[1] = new User("Andre");
		players[2] = new User("Bruce");
		
		players[0].isLord = true;
		players[0].avatar = 'avatar';
		players[1].avatar = 'avatar2';
		players[2].avatar = 'avatar';
		
		return players;
	}

	// mapping the card to card image element id.
	function getCardImgId(suit, rank)
	{
		suit = 5 - suit;
		var id = suit + '-' + rank;
		if(rank == 14) // Ace
			id = suit + '-1';
		else if(rank == 15) // black joker
			id = 's1';
		else if(rank == 16)	// red joker
			id = 's2';
		return id;
	}

	function drawLordFlag(avatarPos, refVec) {
		var lordImg = document.getElementById('Lord');
		refVec = refVec.normalize(40+lordImg.height);
		var lord = new paper.Raster(lordImg);
		lord.position = new Point(avatarPos.x+refVec.x, avatarPos.y+refVec.y);
		return lord;
	}

	function drawPlayers(players)
	{	
		var cardImg = document.getElementById('1-1');
		//console.log(cardImg);
		
		var cardW = cardImg.width;
		var cardH = cardImg.height;
		//console.log(cardW, cardH);
		
		var card = null;
		var x, y;
		var suit, rank;
		var id;
		var avatarImg, avatarPos, refVec, playerName;
		for(var i = 0; i < players.length; ++i) {
			var player = players[i];
			var cards = player.cards;
			
			// draw the avatar
			avatarImg = document.getElementById(player.avatar);
			avatar = new paper.Raster(avatarImg);
			
			// TODO: Consider drawing the player based on their own view.
			//       One player cannot see other's cards. Temporarily draw
			//       them under the first player's view point.
			if(i == 0) {
				// draw the cards of lord
				var totoalW = (cards.length-1)*self.offset + cardW;
				var yOffset = self.margin + cardH/2;
				// PaperJs will draw raster at the image center,
				// so add a distance of 'cardW/2'. The offset 0.5
				// is to fix the pixel issue of canvas drawing. see
				// http://code.anjanesh.net/2009/05/1-pixel-wide-line-parallel-to-axis-in.html
				x = (self.viewSize.width - totoalW)/2 + cardW/2 + 0.5; 
				y = self.viewSize.height - yOffset;
				for(var j = 0; j < cards.length; ++j) {
					suit = cards[j].suit.value;
					rank = cards[j].rank.value;
					id = getCardImgId(suit, rank);
					//console.log(id);
					card = new paper.Raster(document.getElementById(id));
					card.name = suit + '-' + rank;
					card.position = new Point(x+j*self.offset, y);
				}
				
				// calc the avatar pos for this player
				x = avatarImg.width*2.5;
				y = self.viewSize.height - avatarImg.height/2 - self.margin;
				avatarPos = new Point(x, y);
				refVec = new Point(1, -1);
				
				x = (self.viewSize.width - cardW*3 - self.margin*1.5)/2 + cardW/2;
				y = yOffset;
				/*
				// The last 3 cards should be visible for all players.
				var card1 = cards[cards.length-1];
				id = getCardImgId(card1.suit.value, card1.rank.value);
				card = new paper.Raster(document.getElementById(id));
				card.position = new Point(x, y);
				
				var card2 = cards[cards.length-2];
				id = getCardImgId(card2.suit.value, card2.rank.value);
				card = new paper.Raster(document.getElementById(id));
				card.position = new Point(x+cardW+self.margin/2, y);
				
				var card3 = cards[cards.length-3];
				id = getCardImgId(card3.suit.value, card3.rank.value);
				card = new paper.Raster(document.getElementById(id));
				card.position = new Point(x+2*(cardW+self.margin/2), y);
				*/
			} else {
				var totalH = (cards.length-1)*self.offset + cardH;
				var offset = self.offset+cardW*2.5;
				x = i == 2 ? offset : (self.viewSize.width-offset);
				y = (self.viewSize.height - totalH)/2;
				// draw other players.
				for(var j = 0; j < cards.length; ++j) {
					card = new paper.Raster(document.getElementById('rear'));
					card.name = 'rear'+j;
					card.position = new Point(x, y+j*self.offset);
				}
				
				// calc the avatar pos for this player
				if(i == 2) {
					x = offset/2;
					y = self.viewSize.height/2;
					avatarPos = new Point(x, y);
					refVec = new Point(-1, -1);
				} else {
					x = self.viewSize.width-offset/2;
					y = self.viewSize.height/2;
					avatarPos = new Point(x, y);
					refVec = new Point(1, -1);
				}
			}
			
			// set the position of the avatar
			avatar.position = avatarPos;
			
			// draw the name of the player
			playerName = new paper.PointText(new Point(avatar.position.x-avatarImg.width/2, avatar.position.y + avatarImg.height/2+self.margin));
			playerName.content = player.name;
			playerName.characterStyle = {
				justification: 'center',
				font: 'Arial Black',
				fontSize: 12,
				fillColor: 'white',
			};

			// draw a avartar to represent the lord if the play is lord.
			if(player.isLord) {
				drawLordFlag(avatarPos, refVec);
			}
		}
	}

	var deck;
	var tempPlayers;
	var currentPlayer = 0;
	
	this.init = function()
	{
		// 0. load resources.
		var res = loadResources();
		var resContainer = document.getElementById('resContainer');
		if(resContainer) {
			for(var i = 0; i < res.length; ++i) {
				resContainer.appendChild(res[i]);
			}
		}
		
		// 1. draw background, table
		var bkg = new paper.Raster(document.getElementById("background"));
		bkg.position = view.center;
		bkg.scale(1.3);
		
		//// 2. init seat (comment for game hall)
		//initSeat();
		
		// 3. draw the cards of each players.
		players = getPlayersInfo();
		tempPlayers = players;
		//console.log(players);
		drawPlayers(players);
		
		deck = new Deck();
		deck.shuffle();		
		
		setInterval(this.deliverCards, 10);
		
		return players;
	}


	
	function initSeat()
	{
		var center = view.center;
		var vec = new Point(0, 1);
		var dist = 180;
		var size = new Size(100, 150);
		
		var pt1 = center+vec*dist;
		createPlayerSeat(pt1, size, 'yellow', 'gray');

		var vec2 = vec.rotate(120);
		var pt2 = center+vec2*dist;
		createPlayerSeat(pt2, size, 'yellow', 'gray');
		
		var vec3= vec.rotate(-120);
		var pt3 = center+vec3*dist;
		createPlayerSeat(pt3, size, 'yellow', 'gray');
	}

	this.hitTest = function(point, options) {
		self.hitObject = null;
		var curHitObject = paper.project.hitTest(point, options);
		//console.log(curHitObject);
		if(curHitObject && (curHitObject instanceof HitResult)) {
			self.hitObject = curHitObject.item;
			//console.log(self.hitObject);
		}
		return self.hitObject;
	}
	this.findCard = function(cards, findkey) {
		for (var i = 0; i < cards.length; i++) {
			var card = cards[i];
			if (card.id == findkey)
				return card;
		}
		return null;
	}

	this.deliverCards = function ()
	{
		// new a deck for delivering cards
		
		if(deck.cards.length == 0)
			return;
		
		//console.log(deck.cards.toString());

		// deliver cards to each player		
		var remainCards = 3;	
		if(deck.cards.length == remainCards)
		{
			for(i = 0; i < remainCards; ++i)
			{
				// Assume the first player is the lord.				
				if(tempPlayers[currentPlayer].isLord) {
					tempPlayers[currentPlayer].cards.push(deck.cards[i]);					
				}
			}
			drawCardsWhenDeliver(tempPlayers);
			
			var cardImg = document.getElementById('1-1');
			//console.log(cardImg);
		
			var cardW = cardImg.width;
			var cardH = cardImg.height;
			var yOffset = self.margin + cardH/2;
			var x = (self.viewSize.width - cardW*3 - self.margin*1.5)/2 + cardW/2;
			var y = yOffset;
		
			// The last 3 cards should be visible for all players.
			var card1 = deck.cards[deck.cards.length-1];
			id = getCardImgId(card1.suit.value, card1.rank.value);
			card = new paper.Raster(document.getElementById(id));
			card.position = new Point(x, y);
			
			
			var card2 = deck.cards[deck.cards.length-2];
			id = getCardImgId(card2.suit.value, card2.rank.value);
			card = new paper.Raster(document.getElementById(id));
			card.position = new Point(x+cardW+self.margin/2, y);
			
			var card3 = deck.cards[deck.cards.length-3];
			id = getCardImgId(card3.suit.value, card3.rank.value);
			card = new paper.Raster(document.getElementById(id));
			card.position = new Point(x+2*(cardW+self.margin/2), y);
			
			deck.cards.remove(deck.cards[0]);
			deck.cards.remove(deck.cards[0]);
			deck.cards.remove(deck.cards[0]);
		}
		else
		{
			tempPlayers[currentPlayer].cards.push(deck.cards[0]);
			deck.cards.remove(deck.cards[0]);
			drawCardsWhenDeliver(tempPlayers);
		}

		currentPlayer++;
		if(currentPlayer > 2)
			currentPlayer = 0;
			
		view.draw();
	}

	function drawCardsWhenDeliver(players)
	{	
		var cardImg = document.getElementById('1-1');
		//console.log(cardImg);
		
		var cardW = cardImg.width;
		var cardH = cardImg.height;
		//console.log(cardW, cardH);
		
		var card = null;
		var x, y;
		var suit, rank;
		var id;
		for(var i = 0; i < players.length; ++i) {
			var player = players[i];
			var cards = player.cards;
			
			// TODO: Consider drawing the player based on their own view.
			//       One player cannot see other's cards. Temporarily draw
			//       them under the first player's view point.
			if(i == 0) {
				// draw the cards of lord
				var totoalW = (cards.length-1)*self.offset + cardW;
				var yOffset = self.margin + cardH/2;
				// PaperJs will draw raster at the image center,
				// so add a distance of 'cardW/2'. The offset 0.5
				// is to fix the pixel issue of canvas drawing. see
				// http://code.anjanesh.net/2009/05/1-pixel-wide-line-parallel-to-axis-in.html
				x = (self.viewSize.width - totoalW)/2 + cardW/2 + 0.5; 
				y = self.viewSize.height - yOffset;
				for(var j = 0; j < cards.length; ++j) {
					suit = cards[j].suit.value;
					rank = cards[j].rank.value;
					id = getCardImgId(suit, rank);
					//console.log(id);
					card = new paper.Raster(document.getElementById(id));
					card.name = suit + '-' + rank;
					card.position = new Point(x+j*self.offset, y);
				}
			} else {
				var totalH = (cards.length-1)*self.offset + cardH;
				var offset = self.offset+cardW*2.5;
				x = i == 2 ? offset : (self.viewSize.width-offset);
				y = (self.viewSize.height - totalH)/2;
				// draw other players.
				for(var j = 0; j < cards.length; ++j) {
					card = new paper.Raster(document.getElementById('rear'));
					card.name = 'rear'+j;
					card.position = new Point(x, y+j*self.offset);
				}
			}
		}
	}

	
	// two useful function to extend the Array's functionality.
	Array.prototype.indexOf = function(val) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == val) return i;
		}
		return -1;
	};
	Array.prototype.remove = function(val) {
		var index = this.indexOf(val);
		if (index > -1) {
			this.splice(index, 1);
		}
	};
}
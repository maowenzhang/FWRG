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
	var cardObjects = []; // record raster object of current player

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
		
		// some button resources
		res[counter++] = createImageElem("chupai", path+"chupai.png", "display: none;");
		res[counter++] = createImageElem("active_chupai", path+"active_chupai.png", "display: none;");
		res[counter++] = createImageElem("buchu", path+"buchu.png", "display: none;");
		res[counter++] = createImageElem("active_buchu", path+"active_buchu.png", "display: none;");
		res[counter++] = createImageElem("tishi", path+"tishi.png", "display: none;");
		res[counter++] = createImageElem("active_tishi", path+"active_tishi.png", "display: none;");
		res[counter++] = createImageElem("jiaodizhu", path+"jiaodizhu.png", "display: none;");
		res[counter++] = createImageElem("active_jiaodizhu", path+"active_jiaodizhu.png", "display: none;");
		res[counter++] = createImageElem("bujiao", path+"bujiao.png", "display: none;");
		res[counter++] = createImageElem("active_bujiao", path+"active_bujiao.png", "display: none;");
		
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
		players[0] = new Player("Lori");
		players[1] = new Player("Andre");
		players[2] = new Player("Bruce");
		
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

	// Now this function just draw the players info without the cards.
	function drawPlayers(players)
	{	
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
			
			if(i == 0) {
				// calc the avatar pos for this player
				x = avatarImg.width*2.5;
				y = self.viewSize.height - avatarImg.height/2 - self.margin;
				avatarPos = new Point(x, y);
				refVec = new Point(1, -1);
			} else {
				var offset = self.offset+self.cardW*2.5;
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

	var currentPlayer = 0;
	var timerId;

	this._calcMyPositionInfo = function(numCards) {
		var totalW = (numCards-1)*this.offset + this.cardW;
		var offset = this.margin + this.cardH/2;
		return {
			totoalW: totalW,
			yOffset: offset,
			center: { x: (this.viewSize.width - totalW)/2 + this.cardW/2 + 0.5, y: this.viewSize.height - offset }
		};
	}

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
		
		// get the dimension of the card
		var cardImg = document.getElementById('1-1');
		this.cardW = cardImg.width;
		this.cardH = cardImg.height;
		
		// some other useful location info
		this.myPositionInfo = this._calcMyPositionInfo(20);

		// 1. draw background, table
		var bkg = new paper.Raster(document.getElementById("background"));
		bkg.position = view.center;
		//bkg.scale(1.3);
		
		//// 2. init seat (comment for game hall)
		//initSeat();
		
		// 3. draw the cards of each players.
		players = getPlayersInfo();
		//console.log(players);
		drawPlayers(players);
		
		deck = new Deck();
		deck.shuffle();		
		
		timerId = setInterval(this.deliverCards, 10);
		
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
	findCard = function(cards, findkey) {
		for (var i = 0; i < cards.length; i++) {
			var card = cards[i];
			if (card.id == findkey)
				return card;
		}
		return null;
	}
	
	function getSelectedCards(player)
	{
		var selectedCards = [];
		for (var i = 0; i < player.cards.length; i++) {
			var card = player.cards[i];
			if (card.selected)
				selectedCards.push(card);
		}
		return selectedCards;
	}
	
	var lastOutCards = [];
	
	this.handleMouseDownEvent = function(hitObject)
	{
		if(hitObject) {
			//console.log(hitObject);
			if(hitObject instanceof Raster) {
				if(hitObject.image && hitObject.name && hitObject.name.substring(0, 4) != 'rear') {
				
					if(hitObject.name == "chupai")
					{
						takeCardsOut(players[0]);		
					}
					else
					{
						// active player
						var card = findCard(players[0].cards, hitObject.name);
						if(card) {
							if(card.selected) {
								hitObject.position.y = hitObject.position.y + this.offset;
								card.selected = false;
							} else {
								hitObject.position.y = hitObject.position.y - this.offset;
								card.selected = true;
							}
						}
					}
				}
			} else {
				//hitObject.fillColor = '#EEEEEE';
				hitObject.strokeColor = 'white';
				hitObject.strokeWidth = 4;
				//console.log(hitObject);
			}
		}
	}
	
	this.deliverCards = function ()
	{
		// new a deck for delivering cards
		
		if(deck.cards.length == 0) {			
	
			clearInterval(timerId);			
			sort(players[0]);
			drawButtons();
			return;
		}
		//console.log(deck.cards.toString());

		// deliver cards to each player		
		var remainCards = 3;	
		if(deck.cards.length == remainCards)
		{
			for(i = 0; i < remainCards; ++i)
			{
				// Assume the first player is the lord.				
				if(players[0].isLord) {
					players[0].cards.push(deck.cards[i]);
					drawCard(deck.cards[i], 0);
				}
			}			
			
			var yOffset = self.margin + self.cardH/2;
			var x = (self.viewSize.width - self.cardW*3 - self.margin*1.5)/2 + self.cardW/2;
			var y = yOffset;
		
			// The last 3 cards should be visible for all players.
			var card1 = deck.cards[deck.cards.length-1];
			id = getCardImgId(card1.suit.value, card1.rank.value);
			card = new paper.Raster(document.getElementById(id));
			card.position = new Point(x, y);			
			
			var card2 = deck.cards[deck.cards.length-2];
			id = getCardImgId(card2.suit.value, card2.rank.value);
			card = new paper.Raster(document.getElementById(id));
			card.position = new Point(x+self.cardW+self.margin/2, y);
			
			var card3 = deck.cards[deck.cards.length-3];
			id = getCardImgId(card3.suit.value, card3.rank.value);
			card = new paper.Raster(document.getElementById(id));
			card.position = new Point(x+2*(self.cardW+self.margin/2), y);
			
			deck.cards.remove(deck.cards[0]);
			deck.cards.remove(deck.cards[0]);
			deck.cards.remove(deck.cards[0]);			
		}
		else
		{
			players[currentPlayer].cards.push(deck.cards[0]);
			drawCard(deck.cards[0], currentPlayer);
			deck.cards.remove(deck.cards[0]);			
		}

		currentPlayer++;
		if(currentPlayer > 2)
			currentPlayer = 0;
			
		view.draw();
	}
	
	function sort(player)
	{
		// how to use the native sort function of array? 
		// please correct it if you know
		var sortedCards = [];
		var cards = player.cards;
		if(cards.length <= 1)
			return;

		while(cards.length > 0)
		{
			var minCard = cards[0];
			for(var i = 1; i < cards.length; ++i)
			{
				var thisCard = cards[i];
				if(minCard.rank.value > thisCard.rank.value)
					minCard = thisCard;
			}
			cards.remove(minCard);
			sortedCards.push(minCard);
		}
		
		for(var j = 0; j < sortedCards.length; ++j)
			cards.push(sortedCards[j]);
		
		// it doesn't work
		//player.cards.orderByRank();
		updateCardsPosition(player.cards);
	}
	
	function takeCardsOut(player)
	{
		var selectedCards = getSelectedCards(player);
		if(selectedCards.length > 0)
		{
			while(lastOutCards.length > 0)
			{
				// clear last out cards
				var outCard = lastOutCards[0];
				lastOutCards.remove(outCard);
				outCard.remove();
			}
			
			// calculate the position of the out cards, it must be in the center of the view
			var center = view.center;
			var totalLength = self.cardW + self.offset * selectedCards.length;
			var startW = center.x - totalLength / 2 + self.cardW / 2;
			var startH = center.y;
			
			for(var i = 0; i < selectedCards.length; ++i)
			{
				var card = selectedCards[i];
				id = getCardImgId(card.suit.value, card.rank.value);
				var outCard = new paper.Raster(document.getElementById(id));
				outCard.position = new Point(startW + i*self.offset, startH);
				lastOutCards.push(outCard);	
				
				// remove the card from the player
				player.cards.remove(card);
			}
			
			updateCardsPosition(player.cards);
			
			view.draw();
		}
	}
	
	function updateCardsPosition(cards)
	{
		// just redraw the cards for this player
		while(cardObjects.length > 0)
		{
			var card = cardObjects[0];
			cardObjects.remove(card);
			card.remove();
		}
		
		var x = self.myPositionInfo.center.x; 
		var y = self.myPositionInfo.center.y;
		for(var j = 0; j < cards.length; ++j)
		{
			suit = cards[j].suit.value;
			rank = cards[j].rank.value;
			id = getCardImgId(suit, rank);
			//console.log(id);
			var cardRaster = new paper.Raster(document.getElementById(id));
			cardRaster.name = suit + '-' + rank;
			cardRaster.position = new Point(x+j*self.offset, y);
			cardObjects.push(cardRaster);
		}
	}
	
	function drawCard(card, currentPlayer)
	{
		var cards = players[currentPlayer].cards;
		var x, y;
		
		if(currentPlayer == 0)
		{
			x = self.myPositionInfo.center.x; 
			y = self.myPositionInfo.center.y;
			// always draw the last delived card
			var j = cards.length - 1;
			var suit = card.suit.value;
			var rank = card.rank.value;
			var id = getCardImgId(suit, rank);
			//console.log(id);
			var cardRaster = new paper.Raster(document.getElementById(id));
			cardRaster.name = suit + '-' + rank;
			cardRaster.position = new Point(x+j*self.offset, y);
			
			cardObjects.push(cardRaster);
		}
		else
		{
			var totalH = (cards.length-1)*self.offset + self.cardH;
			var offset = self.offset+self.cardW*2.5;
			x = (currentPlayer == 2) ? offset : (self.viewSize.width-offset);
			y = (self.viewSize.height - totalH)/2;				
			var j = cards.length - 1;
			var cardRaster = new paper.Raster(document.getElementById('rear'));
			cardRaster.name = 'rear'+j;
			cardRaster.position = new Point(x, y+j*self.offset);
		}
	}
	
	function drawButtons() {
		var buttons = ['chupai', 'buchu', 'tishi'];
		var btnImg = document.getElementById(buttons[0]);
		var totalW = btnImg.width*3 + 2*self.offset;
		var x = (self.viewSize.width - totalW)/2 + btnImg.width/2;
		var y = self.viewSize.height - self.cardH - 3*self.offset;
		
		var btn;
		for(var i = 0; i < buttons.length; ++i)
		{
			var x1 = x + i * btnImg.width + i * self.offset;
			btn = new paper.Raster(document.getElementById(buttons[i]));
			btn.position = new Point(x1, y);
			btn.name = buttons[i];
		}
		view.draw();
	}
}
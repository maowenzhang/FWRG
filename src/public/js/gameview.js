function ImageLoader(){
	var self = this;
	self.type="ImageLoader";
	self.loadtype = "";
	self.content = null;
	self.oncomplete = null;
	self.event = {};
};
ImageLoader.prototype = {
	addEventListener:function(type,listener){
		var self = this;
		if(type == 'COMPLETE'){
			self.oncomplete = listener;
		}
	},
	load:function (src,loadtype){
		var self = this;
		self.loadtype = loadtype;
		if(self.loadtype == "image"){
			self.content = new Image();
			// onload event seems not be called automatically, call it directly
			self.content.onload = function(){
				console.log('image loaded');
				if(self.oncomplete){
					self.event.currentTarget = self.content;
					self.oncomplete(self.event);
				}
			};	
			self.content.src = src; 
		}
	}
};

function $ResLoadManager(){};
$ResLoadManager.prototype = {
	load: function($list,$onupdate,$oncomplete){
		this.list=$list,this.onupdate=$onupdate,this.oncomplete=$oncomplete;
		this.loader=null,this.loadIndex=0,this.result=[];
		this.loadStart();
	},
	loadStart: function(){
		var self = resLoadMgr;
		if(self.loadIndex >= self.list.length){
			self.oncomplete(self.result);
			return;
		}
		self.loader = new ImageLoader();
		self.loader.addEventListener('COMPLETE',self.loadComplete);
		self.loader.load(self.list[self.loadIndex].file,"image");
	},
	loadComplete: function(){
		var self = resLoadMgr;
		self.result[self.list[self.loadIndex].id] = self.loader.content;
		self.loadIndex++;
		if(self.onupdate){
			self.onupdate(Math.floor(self.loadIndex*100/self.list.length));
		}
		self.loadStart();
	}
};

(function(){
	resLoadMgr = new $ResLoadManager();
})();

var resImages = {};
function loadImageResources(gameView){
	this.gameView = gameView;
	var self = this;
	
	var imgData = new Array(
		{ id:'background', 			file: './res/img/background.png' },
		{ id:'avatar', 				file: './res/img/avatar.png' },
		{ id:'avatar2', 			file: './res/img/avatar2.png' },
		{ id:'Lord', 				file: './res/img/Lord.png' },
		{ id:'chupai', 				file: './res/img/chupai.png' },
		{ id:'active_chupai', 		file: './res/img/active_chupai.png' },
		{ id:'buchu', 				file: './res/img/buchu.png' },
		{ id:'active_buchu', 		file: './res/img/active_buchu.png' },
		{ id:'tishi', 				file: './res/img/tishi.png' },
		{ id:'active_tishi', 		file: './res/img/active_tishi.png' },
		{ id:'jiaodizhu', 			file: './res/img/jiaodizhu.png' },
		{ id:'active_jiaodizhu',	file: './res/img/active_jiaodizhu.png' },
		{ id:'bujiao', 				file: './res/img/bujiao.png' },
		{ id:'active_bujiao', 		file: './res/img/active_bujiao.png' },
		{ id:'5-16', 				file: './res/card/5-16.gif' },
		{ id:'5-17', 				file: './res/card/5-17.gif' },
		{ id:'rear', 				file: './res/card/rear.gif' }
	);
	path = "./res/card/";
	for(var i = 1; i < 5; ++i) {
		for(var j = 3; j < 16; ++j) {
			var _id = i + '-' + j;
			var _imgFile = path + _id + '.gif';
			imgData[imgData.length] = { id: _id, file: _imgFile };
		}
	}
		
	resLoadMgr.load(
		imgData,
		function(progress){
			// show the progress..
		},
		function(result){
			// store the all image results
			resImages = result;			
			
			self.gameView.resourcesReady = true;
			// now init the game view..
			self.gameView.init();
			
			self.gameView.update();
			
		}
	);
}

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
	this.cardSize = { width:0, height:0};

	// should be input, for test
	this.gameState = null;
	// track the active player, which needs to deliver cards or
	// pass.
	this.activePlayer = null;
	
	// store the hit test result.
	this.hitObject = null;	
	this.sessionPlayer = null;
	this.players = null;//gameSession.joinedPlayers;	
	this.playerViews = [];
	
	this.lastCardObjs = []; // record dipai
	this.resourcesReady = false;
	
	var self = this;

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

	this.update = function(data) {
		if(data) {
			this.gameState = data.gameState;
			this.sessionPlayer = data.sessionPlayer;
		}
		if(!this.resourcesReady)
			return;
		cleanPlayers();
		drawPlayers();
		if(data) {
			updatePlayersView(data);
		}
	}

	function cleanPlayers() {
		if(!self.gameState)
			return;
		var players = self.gameState.players;
		if(!players || players.length==0)
			return;
		var existing, i, j;
		var obsoletes = [];
		for(j = 0; j < self.playerViews.length; ++j) {
			existing = false;
			for(i = 0; i < players.length; ++i) {
				if(players[i].name == self.playerViews[j].playerName) {
					existing = true;
					break;
				}
			}
			if(!existing) {
				obsoletes[obsoletes.length] = j;
			}
		}
		
		var playerview, idx;
		for(i = 0; i < obsoletes.length; ++i) {
			idx = obsoletes[i];
			playerview = self.playerViews[idx];
			playerview.nameObject.remove();
			playerview.avatarObject.remove();
			playerview.nameObject = null;
			playerview.avatarObject = null;
			self.playerViews.splice(idx, 1);
		}
	}
	
	// Now this function just draw the players info without the cards.
	function drawPlayers()
	{
		if(!self.gameState)
			return;
		var sessionPlayer = self.sessionPlayer;
		var players = self.gameState.players;
		if(!players || !sessionPlayer)
			return;

		// create playerView object for each player
		for(var i = 0; i < players.length; ++i)
		{
			var player = players[i];
			var playerView = null;
			for(var j = 0; j < self.playerViews.length; ++j)
			{
				if(player.name == self.playerViews[j].playerName)
				{
					playerView = self.playerViews[j];
					break;
				}
			}
			if(!playerView)
			{
				playerView = new PlayerView(player, self);
				playerView.initProfile();
				self.playerViews.push(playerView);
			}
			else
			{
				// update view if necessary
			}
		}
		
		view.draw();
	}
	
	function updatePlayersView(data)
	{
		if(data.eventType == "deliverCard")
		{
			var activePlayer = data.gameState.activePlayer;
			if(!activePlayer)
				return;
			for(var i = 0; i < self.playerViews.length; ++i)
			{
				var playerView = self.playerViews[i];
				if(playerView.playerName == activePlayer.name)
				{
					// update cards of the player in the view
					playerView.player.cards = activePlayer.cards;
					playerView.player.outcards = activePlayer.outcards;
					// then do UI update..
					playerView.updateCardsView();
				}
				
				// draw remain cards for each view at top
				if(data.gameState.lastCards.length > 0)
				{
					var yOffset = self.margin + self.cardSize.height/2;
					var x = (self.viewSize.width - self.cardSize.width*3 - self.margin*1.5)/2 + self.cardSize.width/2;
					var y = yOffset;
				
					var lastCards = data.gameState.lastCards;
					for(var i = 0; i < lastCards.length; ++i)
					{
						var cardObj = new paper.Raster(resImages[lastCards[i].id]);
						cardObj.position = new Point(x + i*(self.cardSize.width+self.margin/2), y);
						self.lastCardObjs.push(cardObj);
					}
					
					if(activePlayer.isLord)
					{
						// end deliver card, lord is the first one to chupai
						drawButtons();
					}
				}
			}
		}
		else if(data.eventType == "chupai")
		{
			
		}
	}
	
	// PlayerView class to manage player's view initializaiton and update
	function PlayerView(player, gameView)
	{
		this.player = player;
		this.playerName = player.name;
		this.cardObjects = [];
		var gView = gameView;
		// draw profile -
		// name
		// profile
		// lord flag
		this.initProfile = function()
		{
			var x, y;
			var id;
			var avatarPos, refVec;
			
			var length = resImages.length;
			var avatarImg = resImages[this.player.avatar];
			var avatar = new paper.Raster(avatarImg);
			
			if(this.player == gView.sessionPlayer) {
				// calc the avatar pos for this player
				x = avatarImg.width*2.5;
				y = gView.viewSize.height - avatarImg.height/2 - gView.margin;
				avatarPos = new Point(x, y);
				refVec = new Point(1, -1);
			} else {
				var offset = gView.offset+gView.cardSize.width*2.5;
				// calc the avatar pos for this player
				var leftSidePlayer = (this.player.name == gView.sessionPlayer.leftPlayer);
				if(leftSidePlayer) {
					x = offset/2;
					y = gView.viewSize.height/2;
					avatarPos = new Point(x, y);
					refVec = new Point(-1, -1);
				} else {
					x = gView.viewSize.width-offset/2;
					y = gView.viewSize.height/2;
					avatarPos = new Point(x, y);
					refVec = new Point(1, -1);
				}
			}
			
			// set the position of the avatar
			avatar.position = avatarPos;
			
			// draw the name of the player
			var playerName = new paper.PointText(new Point(avatar.position.x-avatarImg.width/2, avatar.position.y + avatarImg.height/2+self.margin));
			playerName.content = this.player.name;
			playerName.characterStyle = {
				justification: 'center',
				font: 'Arial Black',
				fontSize: 12,
				fillColor: 'white',
			};

			// draw a avartar to represent the lord if the play is lord.
			if(this.player.isLord) {
				this.lordObject = drawLordFlag(avatarPos, refVec);
			}
			this.avatarObject = avatar;
			this.nameObject = playerName;
		}
		
		// call this function to draw view when deliver card to this player or chupai
		this.updateCardsView = function()
		{
			if(!this.player)
				return;
			clearCards(this.cardObjects);
			
			var cards = this.player.cards;
			for(var i = 0; i < cards.length; ++i)
			{
				drawCard(this, cards[i], i+1);
			}
		}
		
		// after deliver cards, call this functio to sort
		this.sortCards = function()
		{
			this.player.cards.sort(Card.orderByRank);
			this.updateCardsView();
		}
		
		function drawCard(playerView, card, index)
		{
			if(playerView.playerName == gView.sessionPlayer.name)
			{
				var x = gView.myPositionInfo.center.x; 
				var y = gView.myPositionInfo.center.y;
				// always draw the last delived card
				var cardRaster = new paper.Raster(resImages[card.id]);
				cardRaster.name = card.id;
				cardRaster.position = new Point(x+index*gView.offset, y);
				
				playerView.cardObjects.push(cardRaster);
			}
			else
			{
				var cards = playerView.player.cards;
				var leftSidePlayer = (playerView.player.name == gView.sessionPlayer.leftPlayer)
				var totalH = (cards.length-1)*gView.offset + gView.cardSize.height;
				var offset = gView.offset+gView.cardSize.width*2.5;
				var x = leftSidePlayer ? offset : (gView.viewSize.width-offset);
				var y = (gView.viewSize.height - totalH)/2;
				var cardRaster = new paper.Raster(resImages['rear']);
				cardRaster.name = 'rear'+i;
				cardRaster.position = new Point(x, y+index*gView.offset);
				
				playerView.cardObjects.push(cardRaster);
			}
		}
		
		function drawLordFlag(avatarPos, refVec) {
			var lordImg = resImages['Lord'];
			refVec = refVec.normalize(40+lordImg.height);
			var lord = new paper.Raster(lordImg);
			lord.position = new Point(avatarPos.x+refVec.x, avatarPos.y+refVec.y);
			return lord;
		}
		
		// private function
		function clearCards(cardObjects)
		{
			for(var i = 0; i < cardObjects.length; ++i)
			{
				cardObjects[i].remove();
			}
			cardObjects.splice(0, cardObjects.length);
		}
		
		this.clear = function()
		{
			if(!this.player)
				return;
			clearCards(this.cardObjects);
			if(!this.avatarObject)
				this.avatarObject.remove();
			if(!this.nameObject)
				this.nameObject.remove();
			if(!this.lordObject)
				this.lordObject.remove();
		}
	}	
	
	var currentPlayer = 0;
	var timerId;

	this._calcMyPositionInfo = function(numCards) {
		var totalW = (numCards-1)*this.offset + this.cardSize.width;
		var offset = this.margin + this.cardSize.height/2;
		return {
			totoalW: totalW,
			yOffset: offset,
			center: { x: (this.viewSize.width - totalW)/2 + this.cardSize.width/2 + 0.5, y: this.viewSize.height - offset }
		};
	}

	var waitPlayerTimerId;
	this.init = function()
	{
		// get the dimension of the card
		var cardImg = resImages['1-3'];
		this.cardSize.width = cardImg.width;
		this.cardSize.height = cardImg.height;
		
		// some other useful location info
		this.myPositionInfo = this._calcMyPositionInfo(20);

		var bkgImg = resImages["background"];
		//console.log('background', bkgImg.naturalWidth, bkgImg.naturalHeight);
		
		// 1. draw background, table
		var bkg = new paper.Raster(bkgImg);
		bkg.position = view.center;
		//bkg.scale(1.3);
		view.draw();
		console.log(bkg.position);
		
		project.activeLayer.position = view.center;

		return this.players;
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
				
					var players = this.gameState.players;
					if(!players || players.length == 0)
						return;
					if(hitObject.name == "chupai")
					{
						takeCardsOut(this.sessionPlayer);		
					}
					else
					{
						// active player
						var card = findCard(this.sessionPlayer.cards, hitObject.name);
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

	function sort(player)
	{
		// it doesn't work
		player.cards.sort(Card.orderByRank);
		for(var i = 0; i < self.playerViews.length; ++i)
		{
			if(player.name == self.playerViews[i].playerName)
			{
				var playerView = self.playerViews[i];
				for(var j = 0; j < playerView.cardObjects.length; ++j)
				{
					playerView.cardObjects[j].remove();
				}
				playerView.cardObjects.splice(0, player.cardObjects.length);
				drawCards(player, playerView);
			}
		}
	}
	
	function takeCardsOut(player)
	{
		var selectedCards = getSelectedCards(player);
        var suitpattern = (new SuitPattern(selectedCards));
        if (!suitpattern.IsValid())
            return;

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
			var totalLength = self.cardSize.width + self.offset * selectedCards.length;
			var startW = center.x - totalLength / 2 + self.cardSize.width / 2;
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
			
			updatePlayerView(player);
			
			view.draw();
		}
	}

	function drawButtons() {
		var buttons = ['chupai', 'buchu', 'tishi'];
		var btnImg = resImages[buttons[0]];
		var totalW = btnImg.width*3 + 2*self.offset;
		var x = (self.viewSize.width - totalW)/2 + btnImg.width/2;
		var y = self.viewSize.height - self.cardSize.height - 3*self.offset;
		
		var btn;
		for(var i = 0; i < buttons.length; ++i)
		{
			var x1 = x + i * btnImg.width + i * self.offset;
			var image = resImages[buttons[i]];
			btn = new paper.Raster(image);
			btn.position = new Point(x1, y);
			btn.name = buttons[i];
		}
		view.draw();
	}
}
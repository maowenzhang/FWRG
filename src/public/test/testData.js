$(function() {
	$("#btn-user-adduser").button()
		.click(function() {
			//alert("button clicked");
			var u1 = new Player("Lori");
			$("#user-info").append("<p>added player:" + u1.toString());
		});
	$("#btn-card-getcards").button()
		.click(function() {
			//alert("button clicked");
			var cardeck = new Deck();
			$("#card-info").append("<p>get cards:" + cardeck.cards.toString());
		});
});
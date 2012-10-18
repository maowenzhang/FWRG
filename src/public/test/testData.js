$(function() {
	$("#btn-user-adduser").button()
		.click(function() {
			//alert("button clicked");
			var u1 = new User("Lori");
			$("#user-info").append("<p>added user:" + u1.toString());
		});
	$("#btn-card-getcards").button()
		.click(function() {
			//alert("button clicked");
			var cardeck = new Deck();
			$("#card-info").append("<p>get cards:" + cardeck.cards.toString());
		});
});
$(function() {
	
	// For slide show
	$('#slides').slides({
				preload: true,
				preloadImage: 'res/slideshow/loading.gif',
				play: 5000,
				pause: 2500,
				hoverPause: true,
				animationStart: function(current){
					$('.caption').animate({
						bottom:-35
					},100);
					if (window.console && console.log) {
						// example return of current slide number
						//console.log('animationStart on slide: ', current);
					};
				},
				animationComplete: function(current){
					$('.caption').animate({
						bottom:0
					},200);
					if (window.console && console.log) {
						// example return of current slide number
						//console.log('animationComplete on slide: ', current);
					};
				},
				slidesLoaded: function() {
					$('.caption').animate({
						bottom:0
					},200);
				}
			});
	
	// For login dialog
	//
	var name = $( "#name" ),
			email = $( "#email" ),
			// password = $( "#password" ),
			allFields = $( [] ).add( name ), //.add( email ), 
				//.add( password ),
			tips = $( ".validateTips" );

		function updateTips( t ) {
			tips
				.text( t )
				.addClass( "ui-state-highlight" );
			setTimeout(function() {
				tips.removeClass( "ui-state-highlight", 1500 );
			}, 500 );
		}

		function checkLength( o, n, min, max ) {
			if ( o.val().length > max || o.val().length < min ) {
				o.addClass( "ui-state-error" );
				updateTips( "Length of " + n + " must be between " +
					min + " and " + max + "." );
				return false;
			} else {
				return true;
			}
		}

		function checkRegexp( o, regexp, n ) {
			if ( !( regexp.test( o.val() ) ) ) {
				o.addClass( "ui-state-error" );
				updateTips( n );
				return false;
			} else {
				return true;
			}
		}
		
		$( "#dialog-form" ).dialog({
			autoOpen: false,
			position: 'center',
			// height: 200,
			width: 350,
			modal: true,
			buttons: {
				"Start Game": function() {
					var bValid = true;
					allFields.removeClass( "ui-state-error" );

					bValid = bValid && checkLength( name, "username", 3, 16 );
					// bValid = bValid && checkLength( email, "email", 6, 80 );
					//bValid = bValid && checkLength( password, "password", 5, 16 );

					bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter." );
					// From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
					// bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
					//bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );

					if ( bValid ) {
						$( "#users tbody" ).append( "<tr>" +
						 "<td>" + name.val() + "</td>" +
							// "<td>" + email.val() + "</td>" +
							// "<td>" + password.val() + "</td>" +
						"</tr>" );
						// save user info
						
						setCurUser(name.val(), "unknown"); //email.val());
						// $("#btn_letgo").attr('href', 'gameTable.html');		
						
						$( this ).dialog( "close" );
						// alert(window.location);
						window.open("gametable.html");
						return true;
					}
					return false;
				},
				Cancel: function() {
					$( this ).dialog( "close" );
					return false;
				}
			},
			close: function() {
				allFields.val( "" ).removeClass( "ui-state-error" );
				return false;
			}
		});

		$( "#btn_letgo" )
			.click(function() {
				if (hasUserLogin()) {
					var us = getCurUser();
					$("#name").val(us.name);
					
					// return;
				}
				$( "#dialog-form" ).dialog( "open" );				
			});
		
		$("#editusername").click(function() {
				$( "#dialog-form" ).dialog( "open" );
			});
		
		if (hasUserLogin()) {
			//setCurUser("Lori");
			var us = getCurUser();
			var welcomecontent = 'Welcome ' + us.name +' !<b class="caret"></b>';
			$("#welcomeuser").html(welcomecontent);
			$("#welcomeuser").show();
			$("#signinform").hide();
			return;
		}
		else {
			$("#welcomeuser").hide();
		}
		
	// END For login dialog
});
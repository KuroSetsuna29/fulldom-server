/*

Copyright 2016 AJ Jordan <alex@strugee.net>.

This file is part of fulldom-server.

fulldom-server is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

fulldom-server is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public
License along with fulldom-server. If not, see
<https://www.gnu.org/licenses/>.

*/

var system = require("system");

// https://newspaint.wordpress.com/2013/04/05/waiting-for-page-to-load-in-phantomjs/

function waitFor( page, selector, expiry, callback ) {
	if ( !selector ) {
		callback( true );
		return;
	}

	var interval = setInterval(
		function () {
			// try and fetch the desired element from the page
			var result = page.evaluate(
				function (selector) {
					return document.querySelector( selector );
				}, selector
			);

			// if desired element found then call callback after 50ms
			if ( result ) {
				clearInterval(interval);
				setTimeout(
					function () {
						callback( true );
					},
					50
				);
				return;
			}

			// determine whether timeout is triggered
			var finish = (new Date()).getTime();
			if ( finish > expiry ) {
				clearInterval(interval);
				callback( false );
				return;
			}
		},
		100
	);
}

var args = JSON.parse(system.args[1]);

var page = require('webpage').create();
page.settings.userAgent = args.useragent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36';
page.open(args.url, function(status) {
	if (status == "fail") {
		phantom.exit(1);
		return;
	}
	waitFor(page, args.selector, (new Date()).getTime() + 30000, function(status) {
		if (status) {
			setTimeout(
				function () {
					console.log(page.content);

					phantom.exit();
				},
				args.wait || 1000
			);
		} else {
			phantom.exit(1);
		}
	});
});

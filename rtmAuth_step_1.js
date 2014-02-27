// get a new FROB from the RTM server and register it for our use. 
// Then open a web browser so the user can allow it.
// Prereqs:
//   None
// Result:
//   A Browser window is opened asking you to authorize the API to access
//   your account

// Make sure jQuery is loaded
if( typeof jQuery == 'undefined' ){
	tk.flashLong( 'Please make sure that the jQuery library is included.');
	exit;
}
// Make sure rtmTasker is loaded
if( RTM_URL == 'undefined'){
	tk.flashLong( 'Please make sure the rtmTakser library is included.');
	exit;
}
// Make sure the user has defined their key and secret key
if( tk.global('RTM_API_KEY') == 'undefined' || tk.global('RTM_SECRET') == 'undefined'){
	tk.flashLong( 'Please set your api_key and secret first.  See the documentation.');
	exit;
}

getFrob();

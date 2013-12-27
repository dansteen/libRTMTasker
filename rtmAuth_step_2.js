// get a new TOKEN from the RTM server.
// Prereqs:
//   User has run rtmAuth_step_1 at some point in the past
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
// Make sure we have gotten our FROB
if( tk.getGlobal('RTM_FROB') == 'undefined'){
	tk.flashLong( 'Please run the rtmAuth_step_1 script first.');
	exit;
}

getToken();

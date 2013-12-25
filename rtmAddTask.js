// Adds a task using smartadd
// Prereqs:
//   a local variable %newtask is set to a string containg the data for a new task in
//          the format supported by RTM SmartAdd
// Result:
//   a local variable named %newtask_id is set to the ID of the newly created task
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
if( tk.global('RTM_FROB') == 'undefined'){
	tk.flashLong( 'Please run the rtmAuth_step_1 script first.');
	exit;
}
// Make sure we have gotten our TOKEN
if( tk.global('RTM_TOKEN') == 'undefined'){
	tk.flashLong( 'Please run the rtmAuth_step_2 script first.');
	exit;
}

var newtask_id = addTask(newtask);


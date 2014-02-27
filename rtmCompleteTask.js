// Mark a task "complete"
//
// PreReqs:
//   A local tasker variable %task_id has been set to the ID of the task to operate on 
// Result:
//   A local tasker variable $completed_id is set to the ID of the task operated on
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
if( tk.global('RTM_FROB') == 'undefined'){
	tk.flashLong( 'Please run the rtmAuth_step_1 script first.');
	exit;
}
// Make sure we have gotten our TOKEN
if( tk.global('RTM_TOKEN') == 'undefined'){
	tk.flashLong( 'Please run the rtmAuth_step_2 script first.');
	exit;
}

// Javascript does not allow passing of undefined variables to functions
// so we need to set it if it's not already set
var task_id = typeof task_id == 'undefined' ? '' : task_id ;

var completed_id = completeTask(task_id);


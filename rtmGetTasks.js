// get a list of tasks
// Prereqs:
//    filter - if set, will define the filter to use when getting tasks.
//             defaults to "list:inbox AND status:incompleted AND dueBefore:tomorrow"
//             ( which is basically your default list of tasks due tomorrow )
// Result:
//    rtm_error - set on error
//    tasks - contains an array of tasks.  Each task is a pipe (|) delimited string 
//            in the following format:
//              id | name | tags | # of notes | 
//              completed | priority | url | 
//              postponed | estimate | location_id | 
//              due | created | modified   
function rtmGetTasks(filter){

	// get tasks
	tasks = getTasks(filter);

	// the getTask function above returns an array of Objects
	// This won't work for tasker so we convert it.
	keys = ["id", "name", "tags", "# of notes", "completed", "priority", 
	"url", "postponed", "estimate", "location_id", "due", "created", "modified"];
	$.each( tasks, function( index, task){
		taskArray = [];
		$.each( keys, function( key_index, key){
			taskArray.push(task[key]);
		});
		tasks[index] = taskArray.join('|');
	});

}

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
// create our varaiable so it gets passed back into takser
var tasks = [];
// Javascript does not allow passing of undefined variables to functions
// so we need to set it if it's not already set
var filter = typeof filter == 'undefined' ? '' : filter ;

// Run our stuff
rtmGetTasks(filter);

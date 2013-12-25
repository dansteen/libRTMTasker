// Get the lists available in RTM.
// Note that this only returns active, non-smart, non-deleted lists
// 
// Prereqs:
//   None
// Results:
//   Sets a local tasker variable called lists, that contains an array of list_id|list_name strings
function rtmGetList(){
	lists = getList();
	$.each(lists, function(index, list){
		lists[index] = list.join('|');
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
// create our variable so it is passed back to tasker
var lists = [];
// run our stuff
rtmGetList();

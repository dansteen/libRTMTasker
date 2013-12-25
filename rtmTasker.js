// set a few globals
RTM_URL = 'https://api.rememberthemilk.com/services/rest/'
var rtm_error = '';

// set some defaults up for our web requests
// 1) all of our requests need to by syncronis or things wont work
// 2) the function to handle errors
$.ajaxSetup({
	async: false,
	error: function( jqXHR, textStatus, errorThrown){ _processError( textStatus, errorThrown)}
});	

// This is run when an http get request to RTM fails
// Attributes:
//   textStatus - the text string of the http status
//   errorThrown - the text of the error that is thrown
// Return:
//   none
// SideEffects:
//   Sets local tasker variable 'rtm_error' to the error string
function _processError( textStatus, errorThrown ){
    error = textStatus +': '+errorThrown;
    tk.setLocal('rtm_error', error);
	tk.flashLong(error);
    exit;
}

// RTM returns an HTTP 200 no matter what the outcome of our request is so
// the _processError function above will not be triggered.   We use this function to 
// look through the retunred result and scan for errors
// Attributes:
//   data - the response data sent by the RTM server
// Return:
//   none
// SideEffects:
//   On error, sets the local tasker variable 'rtm_error' to the json text returned
function _processReturn( data ){

	// TODO put in some logic to work if the response is totaly malformed
	if( data['rsp']['stat'] == 'fail'){
        error = JSON.stringify(data['rsp']['err']);
        tk.setLocal('rtm_error', error);
		tk.flashLong( error );
        exit;
	}

}

// Accepts attributes intended for RTM and converts them to the
// format that RTM requires.   
// Attributes:
//   customAttributes - an object containing a attributes you wish to send to the RTM server
// Return:
//   An object containing the attributes you passed in, as well as the additional attributes
//     required by the RTM api
// SideEffects:
//   None 
function _generateAttributes(customAttributes){

    // get the values
    var secret = tk.global('RTM_SECRET');
    var signature = '';
    var attributes = Object.create(null);
    attributes['api_key'] = tk.global('RTM_API_KEY') 
    // we use this function to get our token so we only want to 
    // set this when it exists
    if( tk.global('RTM_TOKEN').length != 0) {
	    attributes['auth_token'] = tk.global('RTM_TOKEN') 
    }
    attributes['format'] = 'json';
    
    // add in our custom attributes
    $.each( Object.keys(customAttributes), function(index, key){
       attributes[key] = customAttributes[key];
    });

    // sort our object and generate our signature
    $.each( Object.keys(attributes).sort(), function( index, key ){
       signature += key+attributes[key];
    });
    signature = secret+signature;

    // add our sig to the attributes list
    attributes['api_sig'] = tk.convert( signature, 'toMd5');
     
    return attributes;
}


// converts date formats from the format used by tasker to unix timestamp
// Attributes:
//   taskDate - the date in RTM format
// Return:
//   the date in seconds since unix epoch
// SideEffects:
//   none
function _convertDatetime(taskDate){
    // break it up
    return Date.parse(taskDate).toString().substr(0,10);
}


// Creates and returns a new timeline
// Attributes:
//   None
// Return:
//   the ID of your new timeline
// SideEffects:
//   1) Calls _processReturn (see that function for additional SideEffects)
function _createTimeline(){
    var attributes = Object.create(null);
    attributes['method'] = 'rtm.timelines.create';
    attributes = _generateAttributes(attributes);
    var timeline = '';
	
    $.getJSON( RTM_URL, attributes, function( data ) {
       _processReturn(data);
       timeline = data['rsp']['timeline'];
    }); 

    return timeline;
}


// get a new FROB from the RTM server
// and register it for our use. 
// It will then open a web browser so the user 
// can allow it.
// Attributes:
//   None
// Return:
//   None
// SideEffects:
//   1) Calls _processReturn (see that function for additional SideEffects)
//   2) Sets the global tasker variable RTM_FROB to the value of your FROB 
//   3) Opens a browser link to allow you to authorize the API to use your account
function getFrob(){
    var attributes = Object.create(null);
    attributes['method'] = 'rtm.auth.getFrob';
    attributes = _generateAttributes(attributes);
        	
    $.getJSON( RTM_URL, attributes, function( data ) {
	_processReturn(data);
	tk.setGlobal('RTM_FROB', data['rsp']['frob']);
    }); 

    // Once we have our frob, we need to authorize it
    attributes = Object.create(null);
    attributes['perms'] = 'delete'; 
    attributes['frob'] = global('RTM_FROB');
    attributes = _generateAttributes(attributes);
  
    // let the user know what is going on
    tk.flashLong("Prior to making your first call against RTM you will need authorize this application.  You will not be taken to rememberthemilk.com.  Please log in and click 'allow'.  You will only need to do this once.");
    tk.browseURL('https://www.rememberthemilk.com/services/auth/?'+$.param(attributes));
}

	

// Retrievs a new auth token from RTM.
// TODO:  Detect missing FROB
// Attributes:
//   None
// Return:
//   None
// SideEffects:
//   1) Calls _processReturn (see that function for additional SideEffects)
//   2) Sets the global tasker variable RTM_TOKEN to the value of your token
function getToken(){
    // clear old values
    tk.setGlobal('RTM_TOKEN', '');

    var attributes = Object.create(null);
    attributes['method'] = 'rtm.auth.getToken';
    attributes['frob'] = tk.global('RTM_FROB');
    attributes = _generateAttributes(attributes);

    $.getJSON( RTM_URL, attributes, function( data ) {
	_processReturn(data);
	tk.setGlobal('RTM_TOKEN', data['rsp']['auth']['token']); 
    }); 
}



// Returns an Array of tasks sorted by priority, due-date, and created-date.
// TODO: Allow sort order to be specified.
// 
// Attributes:
//   filter - the filter to use when requesting tasks. Defaults to:
//            "list:inbox AND status:incompleted AND dueBefore:tomorrow"
//            (which is basically your default todo list for today)
// Return:
//   An Array of Objects containing task data
// SideEffects:
//   1) Calls _processReturn (see that function for additional SideEffects)
function getTasks(filter) {
	// if no filter is specified, set the default
	filter = typeof filter !== 'undefined' && filter.length > 0 ? filter : "list:inbox AND status:incomplete AND dueBefore:tomorrow";
	// set our attributes
	var attributes = Object.create(null);
	attributes['method'] = 'rtm.tasks.getList';
	attributes['filter'] = filter;
	attributes = _generateAttributes(attributes);

	var tasks = [];
	var notecount = 0;
	var tags = '';
	var id = '';
	// get our tasks
	$.getJSON( RTM_URL, attributes, function( data ) {
          _processReturn(data);
	  $.each(data['rsp']['tasks']['list'], function( index, list ) {
	     $.each(list['taskseries'], function( index, series ) {
	       var thisTask = Object.create(null);
	       notecount=0;
	       tags = "";
	       task = series['task'];
	       // if there are notes get them
	       if( ! $.isEmptyObject(series['notes']) ) { 
	         $.each(series['notes']['note'], function( index, note) {
		    notecount++; 
		 });
	       }
	       // if there are tags get them
	       if( ! $.isEmptyObject(series['tags']) ) {
	         if( typeof(series['tags']['tag']) == 'string' ) {
	           tags = series['tags']['tag'];
	         }else{
	           $.each(series['tags']['tag'], function(index, tag) {
		      tags = tags.length != 0 ? tags+","+tag : tag;
		   });
		   }
	       }

	       // build our series line
	       // our id is a composit since we need all three
	       // to edit a task
	       id = list['id']+':'+series['id']+':'+task['id'];
	       // tasker doesnt support multi-dimensional arrays so we 
	       // do a pipe delimeted string.  yuk.
	       thisTask['id'] = id;
	       thisTask['name'] = encodeURI(series['name']);
	       thisTask['tags'] = tags;
	       thisTask['notes'] = notecount;
	       thisTask['completed'] = task['completed'];
	       thisTask['priority'] = task['priority'];
	       thisTask['url'] = encodeURI(series['url']);
	       thisTask['postponed'] = task['postponed'];
	       thisTask['estimate'] = task['estimate'];
	       thisTask['location_id'] = series['location_id'];
	       thisTask['due'] = _convertDatetime(task['due']);
	       thisTask['created'] = _convertDatetime(series['created']);
	       thisTask['modified'] = _convertDatetime(series['modified']);
	       tasks.push(thisTask);
	     });
      });
    });

    // sort our tasks by the priority, duedate and then creation date	
    // TODO: make this configurable
    tasks.sort( function(a, b){
	if( a['priority'] < b['priority']){
	  return -1;
	} else if( a['priority'] > b['priority']){
	  return 1;
	} else if( a['priority'] == b['priority']){
	    if( a['due'] < b['due']){
          return -1;
        } else if( a['due'] > b['due']){
          return 1;
        } else if( a['due'] == b['due']){
		// if they are equal we move on to the next criteria
          if(a['created'] < b['created']){
            return -1;
          } else if( a['created'] > b['created']){
            return 1;
          } else {
             return 0;
          }
        }
    }
    });

    return tasks;

}


// Get the lists available in RTM.
// Note that this only returns active, non-smart, non-deleted lists
// 
// Attributes:
//   none
// Return:
//   An Array of list objects.
// SideEffects:
//   1) Calls _processReturn (see that function for additional SideEffects)
function getLists() {
    // set up our attribugtes
    var attributes = Object.create(null);
    attributes['method'] = 'rtm.lists.getList';
    attributes = _generateAttributes(attributes);

    var lists = [];

    $.getJSON( RTM_URL, attributes, function( data ) {
          _processReturn(data);
            $.each(data['rsp']['lists']['list'], function( index, list ) {
                if( list['deleted'] == 0 && list['archived'] == 0 && list['smart'] == 0 ) {
			listObject = Object.create(null);
			listObject['id'] = list['id'];
			listObject['name'] = list['name'];
                	lists.push( listObject );
                } 
            });
    });
    return lists;
}


// Mark a task "complete"
//
// Attributes:
//   id - task ID to mark complete
// Return:
//   the ID of the task marked complete
// SideEffects:
//   1) Calls _processReturn (see that function for additional SideEffects)
function completeTask(id){
    if( id == 'undefined'){
        error = 'Error: completeTask - please provide a task id.';
        exit;
    }

    var idArray = id.split(':');
    // create a new timeline
    var attributes = Object.create(null);
    attributes['method'] = 'rtm.tasks.complete';
    attributes['timeline'] = _createTimeline();
    attributes['list_id'] = idArray[0];
    attributes['taskseries_id'] = idArray[1];
    attributes['task_id'] = idArray[2];
    attributes = _generateAttributes(attributes);

    $.getJSON( RTM_URL, attributes, function( data ) {
      _processReturn(data);
      list = data['rsp']['list'];
      series = data['rsp']['list']['taskseries'];
      task = data['rsp']['list']['taskseries']['task'];
      newid = list['id'] +':'+ series['id'] +':'+ task['id'];
    });
    return newid;
}

// Mark a task "incomplete"
//
// Attributes:
//   id - task ID to mark incomplete
// Return:
//   the ID of the task marked incomplete
// SideEffects:
//   1) Calls _processReturn (see that function for additional SideEffects)
function uncompleteTask(id){
    if( id == 'undefined'){
        error = 'Error: completeTask - please provide a task id.';
        exit;
    }

    var idArray = id.split(':');
    var attributes = Object.create(null);
    attributes['method'] = 'rtm.tasks.uncomplete';
    attributes['timeline'] = _createTimeline();
    attributes['list_id'] = idArray[0];
    attributes['taskseries_id'] = idArray[1];
    attributes['task_id'] = idArray[2];
    attributes = _generateAttributes(attributes);

    var newid = '';
    $.getJSON( RTM_URL, attributes, function( data ) {
      _processReturn(data);
      list = data['rsp']['list'];
      series = data['rsp']['list']['taskseries'];
      task = data['rsp']['list']['taskseries']['task'];
      newid = list['id'] +':'+ series['id'] +':'+ task['id'];
    });
    return newid;
}


// Adds a task using smartadd
// Attributes:
//   task - a string containing details of the task you want to add in a 
//          format supported by RTM SmartAdd
// Return:
//   the ID of the task added
// SideEffects:
//   1) Calls _processReturn (see that function for additional SideEffects)
function addTask(task){
    if( task == 'undefined'){
        error = 'Error: addTask - please provide a task string.';
        exit;
    }

    var attributes = Object.create(null);
    attributes['method'] = 'rtm.tasks.add';
    attributes['timeline'] = _createTimeline();
    attributes['parse'] = '1';
    attributes['name'] = task;
    attributes = _generateAttributes(attributes);

    var newid = '';
    $.getJSON( RTM_URL, attributes, function( data ) {
       _processReturn(data);

       list = data['rsp']['list'];
       series = data['rsp']['list']['taskseries'];
       task = data['rsp']['list']['taskseries']['task'];
       newid = list['id'] +':'+ series['id'] +':'+ task['id'];
    });
    return newid;
}

(function () {
    var config = {
        apiKey: "AIzaSyAW1FyuzMDEoQzELUilKo1K21F6wCa1bg8",
        authDomain: "realtime-code.firebaseapp.com",
        databaseURL: "https://realtime-code.firebaseio.com",
        projectId: "realtime-code",
        storageBucket: "realtime-code.appspot.com",
        messagingSenderId: "978109384148"
    };

    firebase.initializeApp(config);

    var db = firebase.database();
    var editor = ace.edit('editor');
    var dbCode = db.ref().child('code');
    var dbQueue = db.ref().child('queue')
    var applyingChanges = false; 
    var lastTimestamp = ""; 
    var initialRead = false;
    
    if(!document.cookie){
        document.cookie = Math.random().toString(36).substr(2, 9); //random id generator
    }
    
    //copy data from database when website is loaded
    dbCode.once('value', function(ref){
        console.log(ref.val());
        if(ref.val() !== ""){
            initialRead = true;
            editor.setValue(ref.val(),-1);
        }
    });
    
    //check for change and add data to queue with specic tags to manipulate
    //it further while displaying on screen   
    editor.on('change', function(e){
        
        console.log("change");
        
        if(applyingChanges){
            return;
        }
        
	
        dbCode.set(editor.getValue());
        
        lastTimestamp = Date.now().toString();
         
        if(initialRead){
            initialRead = false;
            dbQueue.child(Date.now().toString()).set({
            event: e,
            by: "initialRead"
            });
            //console.log("initialRead");
        }
        
        else{
            dbQueue.child(Date.now().toString()).set({
                event: e,
                by: document.cookie
            });
            //console.log("generalRead");
        }
        
	//if editor is empty remove queue
        if(!editor.getValue()){
            //console.log("empty");
            dbQueue.remove();
        }
    });

    //add changes only when it is performed by other users
    dbQueue.on('child_added', function(ref){   
        
        if(lastTimestamp > ref.key )
            return;
        
        var value = ref.val();
        
        if(value.by === document.cookie){
            return;
        }
        
        if(value.by === "initialRead"){
            return;
        }
        
        applyingChanges = true;
        editor.getSession().getDocument().applyDeltas([value.event]);
        applyingChanges = false;
    });    
}())

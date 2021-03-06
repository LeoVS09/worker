var exec = require('child_process').exec;

var commandline={
    get:getString,
    run:runCommand
};

function runCommand(command){
    //return refrence to the child process
    return exec(
        command
    );
}

function getString(command,callback,cwd){
    //return refrence to the child process
    return exec(
        command,
        cwd
            ? { cwd }
            : undefined,
        (
            function(){
                return function(err,data,stderr){
                    if(!callback)
                        return;

                    callback(data, err, stderr);
                }
            }
        )(callback)
    );
}

module.exports=commandline;
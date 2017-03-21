const im = require("./import.js");

// process.argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`);
// });
let arguments = process.argv;
let work;
try {
    work = require(`${arguments[2]}/work`);
    if(!work) throw new Error("Not find work file");
    if(typeof work !== "object") throw new Error("Work not export object");
    if(!work.tasks || work.tasks.length == 0) throw new Error("Work not have tasks");
}catch(error) {
    console.error("Error when import work: ", error);
    work = null;
}
async function working(work,arguments) {
    if(work){
        if(arguments[3] == "work"){
            let task = arguments[4];
            if(task && work.tasks[task]){
                let dependencies = {console};
                if(work.requirements && work.requirements.length) {
                    await im(work.requirements);
                    for(let mod of work.requirements)
                        dependencies[mod] = require(mod);
                }
                dependencies = Object.assign(dependencies,work);
                let args = arguments.slice(4);
                if(work.preparation)
                    dependencies = Object.assign(dependencies, work.preparation(dependencies,args));
                args = args.splice(1);
                let result = work.tasks[task](dependencies,args);
                if(work.epilog)
                    work.epilog(dependencies,result);
            }
        }
    }
}

working(work,arguments)
    .then(() => console.log("work completed"))
    .catch(error => console.error(error))
;

// console.log(work.dirname());
const cmd =  require("./cmd");

let download = modules => {
    if(modules.length == 0) return;
    let str = "";
    for(let module of modules)
        str += module + " ";
    return new Promise(resolve =>
        cmd.get("npm install --save " + str,() => {
            console.log("install " + str);
            resolve();
        }, __dirname)
    );

};

const have = element => ({
    in: array => {
        for(let el of array)
            if(el == element) return true;
        return false;
    }
});



const parse = (sieve,converter,separator) => str =>
    str.split(separator).filter(sieve).map(converter);


const filterImports = searchKeys => str => {
    let res = false;
    for(let word of searchKeys)
        res = str.indexOf(word) != -1 || res;
    return res;
};

const getModule = searchKeys => (string = "") => {
    let index = -1;
    searchKeys.forEach(word => index = index == -1 ? string.indexOf(word) : index);
    string = string.substr(index == -1 ? 0 : index);
    let value = getValueOfImport(string);
    if( !value || value[0] == '.') return;
    return value;
};
let searchKeys = ["import","require"];
const importsIn = parse(filterImports(searchKeys), getModule(searchKeys), "\n");

const getFirstAndLast = (str,target) => [str.indexOf(target), str.lastIndexOf(target)];
const getValueOfImport = str => {
    let [first , last] = getFirstAndLast(str,"'");
    let [anotherFirst, anotherLast] = getFirstAndLast(str, '"');
    if((first == -1 || last == -1) || ((anotherFirst != -1 && anotherLast != -1) && (first > anotherFirst)))
        [first,last] = [anotherFirst,anotherLast];
    return str.substring(first + 1, last);
};

const getInstalledModules = command =>
    new Promise(resolve =>
        cmd.get(
            command,
            data => resolve(data.split("\n")
                .filter(str => str[0] == "+" || str[0] == "`")
                .map(str => str.substring(4,str.indexOf("@")))
            ),
            __dirname
        )
    );

const standard = [
    'assert',
    'buffer',
    'child_process',
    'cluster',
    'console',
    'crypto',
    'dns',
    'domain',
    'events',
    'fs',
    'http',
    'https',
    'net',
    'os',
    'path',
    'querystring',
    'readline',
    'repl',
    'stream',
    'string_decoder',
    'timers',
    'tls',
    'tty',
    'dgram',
    'url',
    'util',
    'v8',
    'vm',
    'zlib'
];
module.exports = imports =>
    getInstalledModules("npm ls")
        .then(local =>
            getInstalledModules("npm -g ls")
                .then(global => standard.concat(local.concat(global)))
        ).then(modules =>
            download(imports.filter(el =>
                    !have(el).in(modules)
                ))
        ).catch(error => console.error(error))
;

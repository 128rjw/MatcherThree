// just a second file
// testing interopoobality
var lib2Var = 123; 

console.log(`pre load lib2`); // does not work

window.onload = function() {
    console.log(`lib 2  initiated`); // works
    //console.log(`value of local storage: ${window.localStorage.getItem("zonky")} `); // not working
    console.log(`value of simple lib ${simpleLibVar}`);
}

function lib2_testfunction(){
    console.log(`lib 2 test function...`);
}


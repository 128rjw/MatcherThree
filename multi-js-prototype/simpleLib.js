// just a single library

var simpleLibVar = 1; 

console.log('simplelib: preload script!');  // not working

window.onload = function() {
    console.log(`simple library initiated`);
    //console.log(`value of local storage ${localStorage.getItem("zonky")} `);
    console.log(`value of other libs var: ${lib2Var}`);
}
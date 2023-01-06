

function switchTest(){
    var x = 5;
    switch (x){
        case (x=0):
        {
            console.log('zero');
        }
        case (x>5):
        {
            console.log('more than 5');
        }
        case (x<5):
        {
            console.log('less than 5');
        }
    }
}
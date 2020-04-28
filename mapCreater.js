const backGroundElement = document.querySelector("ban-do-nen");
const layersElement = document.querySelector("layers");

// backGroundElement.on(('singleclick', function (evt))


$(document).ready(function(){
    document.oncontextmenu = function() {return false;};

    $(document).mousedown(function(e){
        if( e.button == 2 ) {
            alert('Right mouse button!');
            return false;
        }
        return true;
    });
});

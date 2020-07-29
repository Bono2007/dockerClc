Big.prototype.toFrench =  function(){
	var s = this.toString();
	var aE=[] ; var aD=[] ; var sD="" ; var sE="";
    aE = s.split('.').length == 2 ? s.split('.')[0].split('') : s.split('');
    if( s.split('.').length == 2 ) {
		aD = s.split('.')[1].split('');
    }
    else {
		sD = "";
    }
    for (var i = aE.length-1 ; i >=0 ; i-- ) {
		sE = ((aE.length - i)%3 === 0 && i > 0) ? " "+aE[i]+sE : aE[i]+sE;
    }
    if ( aD.length > 0) {
        for (var j = 0 ; j < aD.length ; j++ ) {
            sD = (j%3 === 0 && j > 0) ? sD+" "+aD[j] : sD+aD[j];
        }
        sD = ","+sD;
    }
    return sE+sD;
};
'use strict';

module.exports = function(Location) {
	
	Location.search = function(sql,res){
    	var ds  = Location.dataSource;
    	ds.connector.query(sql,function(err,cb){
    		if (err) console.log(err);
    		res(null, cb);
    	})
    }

    Location.remoteMethod('search',{
    	  http: { path : "/search", verb: 'get'},
          accepts: {arg: 'sql', type: 'string'},
          returns: {arg: 'object', arg:"data"}
    });
};

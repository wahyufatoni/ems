app.service("rest",function($http){

	this.service=function(req){
		cb=$http.post("/api/apps/service",req).then(function(res){
			return res.data;
		})
		return cb;
	}

	this.chart=function(req){
		cb=$http.post("/api/apps/chart",req).then(function(res){
			return res.data;
		})
		return cb;
	}

	this.image = function(file,action,label){
        var fd = new FormData();
        fd.append('file', file);
        switch(action){
        	case "create":
		        $http.post("/api/containers/profile/upload", fd, {
		            transformRequest: angular.identity,
		            headers: {'Content-Type': undefined}
		        })
	        break;

	        case "update":
	        	label=label.substr(13);
	        	$http.delete("/api/containers/profile/files/"+label);
	        	$http.post("/api/containers/profile/upload", fd, {
		            transformRequest: angular.identity,
		            headers: {'Content-Type': undefined}
		        })
	        break;

	        case "delete":
	        	label=label.substr(13);
	        	$http.delete("/api/containers/profile/files/"+label);
	        break;
    	}
    }

});

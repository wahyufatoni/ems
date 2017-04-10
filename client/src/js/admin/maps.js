app.controller("controller_ceo",function(
	$scope, 
	$rootScope, 
	$filter, 
	$stateParams, 
	$state, 
	$q, 
	Province, 
	Zone,
	Branch, 
	Location, 
	$compile,
	history
){
	history.get().then(function(res){
		$scope.link=res.link;
		$scope.user=res.usr;
		function metaData(res){
			for (var i = 0; i < res.length; i++) {
				res[i].title	=	res[i].location_name;
			}
			$scope.locations	= res;
			var center=[-1.269160,116.825264]
			$scope.setMarker(res,5,center);
		}
		switch(res.usr.role){
			case "zone":
				$scope.setZone(res.usr.id_user);
				Location.find({filter:{where:{ id_zone:res.usr.id_user}}})
				.$promise.then(function(res){
					metaData(res);
				})
			break;

			case "branch":
				$scope.setBranch(res.usr.id_user);
				Location.find({filter:{where:{ id_branch:res.usr.id_user}}})
				.$promise.then(function(res){
					metaData(res);
				})
			break;

			default:
				Location.find().$promise.then(function(res){
					metaData(res);
				})
			break;	
		}
	});

	// switch ceo or maps
	$scope.showCeo = true;
	$scope.ceo=function () {
		if($scope.showCeo==true){
			$scope.showCeo=false;

		}
		else {
			$scope.showCeo=true;
			$state.go($state.current, {}, {reload: true});
		}
	}
	
	$scope.show 		= false ;
	$scope.store        = [];


	$scope.readProvince=function(){
		// Location.count().$promise.then(function(res){
		// 	$scope.total   = res.count;
		// })
		Province.find().$promise.then(function(res){
			for (var i = 0; i < res.length; i++) {
				res[i].title     = res[i].province_name;
			}
			$scope.provinces = res;
			var center=[-1.269160,116.825264]
			$scope.setMarker(res,5,center);
		})
		$scope.show 		= false ;
	}
	$scope.readProvince();

	$scope.setProvince=function(id){
		Zone.find({filter:{where:{id_province:id}}})
		.$promise.then(function(res){
			$scope.zones       = res;
			$scope.locations   = []; 
			$scope.branches    = [];
			$scope.store 	   = [];
		})

		Location.find({filter:{where:{id_province:id}}}).$promise
		.then(function(res){
			var center=[-1.269160,116.825264]
			for (var j = 0; j < res.length; j++) {
				res[j].title = res[j].location_name;
				res[j].address = res[j].address;
			}
			$scope.locations  = res;
			$scope.setMarker(res,5,center);
			$scope.store      = $scope.locations;
		});
		$scope.show 		  = false ;
	}

	$scope.setZone=function(id){
		Branch.find({filter:{where:{id_zone:id}}}).$promise
		.then(function(res){
			$scope.branches = res;
			$scope.locations = []; 
				
		})
		Location.find({filter:{where:{id_zone:id}}}).$promise
		.then(function(res){
			var center=[-1.269160,116.825264]
			for (var j = 0; j < res.length; j++) {
				res[j].title = res[j].location_name;
				res[j].address = res[j].address;
			}
			$scope.locations = res;
			$scope.setMarker(res,5,center);
			$scope.store = $scope.locations;
		
		})
		$scope.show 		= false;
	}
	
	$scope.setBranch=function(id){
		Location.find({filter:{where:{id_branch:id}}}).$promise
		.then(function(res){
			var center=[-1.269160,116.825264]
			for (var j = 0; j < res.length; j++) {
				res[j].title = res[j].location_name;
				res[j].address = res[j].address;
			}
			$scope.locations = res;
			$scope.setMarker(res,5,center);
			$scope.store = $scope.locations;
		
		})
		$scope.show 		= false;
	}


	$scope.setLocation=function(id){
		for (var i = 0; i < $scope.locations.length; i++) {
			if($scope.locations[i].id==id){
				var lat  = $scope.locations[i].latitude;
				var long = $scope.locations[i].longitude;
				$scope.locations[i].title = $scope.locations[i].location_name;
				$scope.setMarker([$scope.locations[i]],17,[lat,long]);
				$scope.store= [];
				$scope.store[0]=$scope.locations[i];
			}
		}
		$scope.show 		= false;
	}

	$scope.getSearch=function(data){
		$scope.search="";
		var sql="select location.id,location_name,address, location.id_zone, location.id_branch, phone, spacious, manager, phone_manager,"+ 
        "image, location.latitude, location.longitude, id_gateway, start_operation, end_operation,"+
        "location.id_province FROM province inner join location on province.id=location.id_province " +
        "inner join branch on branch.id=location.id_branch "+
		"inner join  zone on zone.id=location.id_zone where location.location_name like '%"+data+"%' or "+
		"province.province_name like '%"+data+"%' or branch.branch_name like '%"+data+"%' or zone.zone_name like '%"+data+"%'";
		// console.log(sql);
		Location.search({sql:sql}).$promise.then(function(res){
			var center=[-1.269160,116.825264]
			for (var j = 0; j < res.data.length; j++) {
				// var lat  = $scope.locations[i].latitude;
				// var long = $scope.locations[i].longitude;
				res.data[j].title = res.data[j].location_name;
				res.data[j].address = res.data[j].address;
			}
			$scope.setMarker(res.data,8,[center]);
			$scope.store=res.data;
		})
		$scope.show = true;
	}



	$scope.setBuilding=function(id){
		$state.go("admin.monitoring");
        for (var i = 0; i < $scope.locations.length; i++) {
        	if($scope.locations[i].id==id){
        		history.post($scope.locations[i]);	
        	}
        }
    }

	$scope.setMarker=function(data,zoom,center){
		 var mapOptions = {
	          zoom: zoom,
	          center: new google.maps.LatLng(center[0],center[1]),
	          mapTypeId: google.maps.MapTypeId.TERRAIN
	      }
	      $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
	      $scope.markers = [];      
	      var infoWindow = new google.maps.InfoWindow();
	      
	      if (data.length != 0) {
	      	for (var i = 0; i <  data.length; i++) {
	      		// console.log(data[i])
	      		var createMarker = function (){
			        var marker = new google.maps.Marker({
			            map: $scope.map,
			            position: new google.maps.LatLng(data[i].latitude, data[i].longitude),
			            title: data[i].title
			        });

			        // var content = '<h4><a ng-click="setBuilding('+data[i].id+')">'+data[i].title+'</a></h4><br>';
			        var content ='<div id="content">'+
							      '<div id="siteNotice">'+
							      '</div>'+
							      '<h3 id="firstHeading" class="firstHeading"><a ng-click="setBuilding('+data[i].id+')">'+data[i].title+'</a></h3>'+
							      '<div id="bodyContent">'+
							      '<p><b>KWH : 2300 Kwh</b><br>' +
							      '<b>W/T/H : 6.8 kW / 24C/ 76%</b><br><br>'+
							      '&nbsp;&nbsp;&nbsp;&nbsp;'+
							      '<button class="btn btn-rounded btn-lg btn-icon btn-danger"> 211</button>&nbsp;'+
							      '<button class="btn btn-rounded btn-lg btn-icon btn-warning"> 212</button>'+
							      '</div>'+
							      '</div>';	       

			        var compiledContent = $compile(content) ($scope)

			        google.maps.event.addListener(marker, 'mouseover', (function(marker, content, scope) {
	                    return function() {
	                        infoWindow.setContent(content);
	                        infoWindow.open($scope.map, marker);
	                    };
	                })(marker, compiledContent[0], $scope));   
			        $scope.markers.push(marker);  
		      	}		 
		      	createMarker(data[i]);
	      	}
	      }

	      $scope.openInfoWindow = function(e, selectedMarker){
	          e.preventDefault();
	          google.maps.event.trigger(selectedMarker, 'click');
	      }
  	}

//end controller
});
app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});
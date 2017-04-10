app.directive('convertToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(val) {
        return parseInt(val, 10);
      });
      ngModel.$formatters.push(function(val) {
        return '' + val;
      });
    }
  };
});

app.controller("controller_setup",function(
	$scope,
	$rootScope,
	history,
	toaster,
	rest,
	$q,
	$filter,
	$state
){

	function getData(){
		history.get().then(function(res){
			$q.all([
				rest.service({action:"read",model:"province",filter:{where:{id_employee:res.usr.id }} }),
				rest.service({action:"read",model:"zone",filter:{where:{id_employee:res.usr.id }} }),
				rest.service({action:"read",model:"branch",filter:{where:{id_employee:res.usr.id }} }),
				rest.service({action:"read",model:"location",filter:{where:{id_employee:res.usr.id }} }),
				rest.service({action:"read",model:"ac"}),
				rest.service({action:"read",model:"infrared"}),
				rest.service({action:"read",model:"temperature"}),
				rest.service({action:"read",model:"chiller"}),
				rest.service({action:"read",model:"pump"}),
				rest.service({action:"read",model:"door"}),
				rest.service({action:"read",model:"lamp"}),
				rest.service({action:"read",model:"employee"}),
				rest.service({action:"read",model:"kwh"}),
				rest.service({action:"read",model:"brand"}),
				rest.service({action:"read",model:"type_alarm"})
			])
			.then(function(list){
				$scope.user     		= res.usr;
				$scope.canvas   		= {};
				$scope.province 		= list[0];
				$scope.zone     		= list[1];
				$scope.branch   		= list[2];
				$scope.location 		= list[3];
				$scope.ac     		    = list[4];
				$scope.infrared   		= list[5];
				$scope.temperature      = list[6];
				$scope.chiller          = list[7];
				$scope.pump             = list[8];
				$scope.door             = list[9];
				$scope.lamp             = list[10];
				$scope.employee         = list[11];
				$scope.kwh              = list[12];
				$scope.brand            = list[13];
				$scope.type_alarm       = list[14];
				tools();
				service();
				$scope.setBuilding=function(data){
					$state.go("admin.monitoring");
					history.post(data);
				}
			})
		})

	}
	getData();


	function tools(){
		$scope.metaData={
		    province : {
				name        : "PROVINCE",
		    	title       : "province",
		    	label       : "province_name",
		    	properties  : [
		    		{ label : "Employee",      model: "id_employee",     type : "number", disabled:true},
		    		{ label : "Province Name", model: "province_name",   type : "text" },
		    		{ label : "Latitude",      model: "latitude",        type : "text" },
		    		{ label : "Longitude", 	   model: "longitude",       type : "text" }
		    	],
		    	data        : $scope.province
			},
			zone : {
				name        : "ZONE",
		    	title       : "zone",
		    	label       : "zone_name",
		    	properties  : [
		    		{ label : "Employee",      model: "id_employee",     type : "number", disabled:true},
		    		{ label : "Zone Name",     model: "zone_name",       type : "text" },
		    		{ label : "Province Name", model: "id_province",     relation : true},
		    		{ label : "Latitude",      model: "latitude",        type : "text" },
		    		{ label : "Longitude", 	   model: "longitude",       type : "text" }
		    	],
		    	data : $scope.zone
			},
			branch : {
				name        : "BRANCH",
		    	title       : "branch",
		    	label       : "branch_name",
		    	properties  : [
		    		{ label : "Employee",      model: "id_employee",     type : "number", disabled:true},
		    		{ label : "Branch Name",   model: "branch_name",     type : "text" },
		    		{ label : "Zone Name",     model: "id_zone",         relation : true},
		    		{ label : "Longitude", 	   model: "longitude",       type : "text"},
		    		{ label : "Latitude",      model: "latitude",        type : "text"}
		    	],
		    	data        : $scope.branch
			},
			location : {
				name        : "LOCATION",
		    	title       : "location",
		    	label       : "location_name",
		    	properties  : [
		    		{ label : "Employee",      model: "id_employee",     type : "number", disabled:true},
		    		{ label : "Location", 	   model: "location_name",   type : "text" },
		    		{ label : "Province",	   model: "id_province",     relation : true, link:true},
		    		{ label : "Zone",    	   model: "id_zone",         relation : true, link:true},
		    		{ label : "Branch",  	   model: "id_branch",       relation : true},
		    		{ label : "Phone",         model: "phone",           type : "text"},
		    		{ label : "Phone Manager", model: "phone_manager",   type : "text", dontShow:true},
		    		{ label : "Address",       model: "address",         type : "text"},
		    		{ label : "Spacious",      model: "spacious",        type : "number", filter:"spacious"},
		    		{ label : "Manager",       model: "manager",         type : "text"},
		    		{ label : "Start",		   model: "start_operation", type : "time" },
		    		{ label : "End ",		   model: "end_operation",   type : "time" },
		    		{ label : "Latitude",      model: "latitude",        type : "text", dontShow:true},
		    		{ label : "Longitude", 	   model: "longitude",       type : "text", dontShow:true},
		    		{ label : "ID Gateway",    model: "id_gateway",      type : "number"},
		    		{ label : "Image",         model: "image",           type : "file", dontShow:true}
		    	],
		    	data        : $scope.location
			},
			kwh : {
 				name        : "KWH",
 				title       : "kwh",
 				label       : "kwh_name",
 				properties  : [
 					{ label : "KWH name",      model: "kwh_name",    type:"text"},
 					{ label : "Province Name", model: "id_province", relation : true, dontShow:true, link:true},
		    		{ label : "Zone Name",     model: "id_zone",     relation : true, dontShow:true, link:true},
		    		{ label : "Branch Name",   model: "id_branch",   relation : true, dontShow:true, link:true},
		    		{ label : "Location Name", model: "id_location", relation : true },
 					{ label : "ID KWH", 	   model: "kwh_id",      type:"number"},
 					{ label : "Brand",         model: "brand",            generate:"brand"},
		    	 	{ label : "Serial Number", model: "serial_number",    type:"text"},
		    	    { label : "Product ID",    model: "part_number", 	  type:"text"},
		    	    { label : "Install Date",  model: "install_date",     hidden:true, filter:"dateOnly", dateNow:true}
 				],
 				data        :  $scope.kwh
			},
			infrared : {
				name        : "INFRARED",
		    	title       : "infrared",
		    	label       : "infrared_name",
		    	properties  : [
		    		{ label : "infrared Name", model: "ir_name",         type : "text" },
		    		{ label : "Province Name", model: "id_province",     relation : true, link:true, dontShow:true, link:true},
		     		{ label : "Zone Name",     model: "id_zone",         relation : true, dontShow:true, link:true},
		     		{ label : "Branch Name",   model: "id_branch",       relation : true, dontShow:true, link:true},
		     		{ label : "Location Name", model: "id_location",     relation:true },
		    		{ label : "Channel",       model: "channel",     	 type : "number", custom:true,
		    		    parent_label : "label", data : [
		    		  		{id:0,label:"Channel 0"},{id:1,label:"Channel 1"},{id:2,label:"Channel 2"},
		    		  		{id:3,label:"Channel 3"},{id:4,label:"Channel 4"},{id:5,label:"Channel 5"}
		    		    ]
		    	    },
		    		{ label : "Set Default",    model: "set_default",  type : "number"},
            { label : "Max Difference",   model: "max_difference",  type : "number"},
		    		{ label : "Brand",          model: "brand", generate:"brand"},
		    	 	{ label : "Serial Number",  model: "serial_number",    type:"text"},
		    	    { label : "Product ID",     model: "part_number", 	   type:"text"},
		    	    { label : "Install Date",   model: "install_date",     hidden:true, filter:"dateOnly", dateNow:true},
		    	],
		    	data        : $scope.infrared
			},
			temperature : {
				name        : "TEMPERATURE",
		    	title       : "temperature",
		    	label       : "temperature_name",
		    	properties  : [
		    		{ label : "Employee",      	  model: "id_employee",   type : "text", disabled:true},
		    		{ label : "Temperature Name", model: "temp_name",	  type : "text" },
		    		{ label : "Province Name",    model: "id_province",   relation : true, dontShow:true, link:true},
		    		{ label : "Zone Name",        model: "id_zone",       relation : true, dontShow:true, link:true},
		    		{ label : "Branch Name",      model: "id_branch",     relation : true, dontShow:true, link:true},
		    		{ label : "Location Name", 	  model: "id_location",	  relation:true },
		    		{ label : "Type", 		      model: "humidity",      custom:true, filter : "temp",
		    			parent_label : "label", data : [
		    				{id:0, label:"Temperature only"},{id:1, label:"Temperature humidity"}
		    			]
		    		},
		    		{ label : "TH ID ",			model: "th_id",		    type : "number" },
		    		{ label : "Threshold", 		model: "threshold",     type :"number", filter:"ampere"},
		    		{ label : "Brand",          model: "brand", generate:"brand"},
		    	 	{ label : "Serial Number",  model: "serial_number",    type:"text"},
		    	    { label : "Product ID",     model: "part_number", 	   type:"text"},
		    	    { label : "Install Date",   model: "install_date",     hidden:true, filter:"dateOnly", dateNow:true},
		    		{ label : "Last Humidity", 	model: "last_humidity",    type :"number", hidden:true, dontShow:true},
		    		{ label : "Last Value", 	model: "last_value",       type :"number", hidden:true, dontShow:true},
		    		{ label : "Last Update",	model: "last_update",      type :"text", hidden:true, dontShow:true}
		    	],
		    	data        : $scope.temperature
			},
			ac : {
				name        : "AC",
		    	title       : "ac",
		    	label       : "ac_name",
		    	properties  : [
		    		{ label : "Employee",   	model: "id_employee",  type : "text", disabled:true},
		    		{ label : "AC Name",    	model: "ac_name",      type : "text" },
		    		{ label : "Province Name",  model: "id_province",  relation : true, dontShow:true,link:true},
		    		{ label : "Zone Name",      model: "id_zone",      relation : true, dontShow:true,link:true},
		    		{ label : "Branch Name",    model: "id_branch",    relation : true, dontShow:true, link:true},
		    		{ label : "Location Name",  model: "id_location",  relation:true, link : true },
		    		{ label : "Kwh Name",     	model: "id_kwh", 	   relation:true },
		    		{ label : "Channel",        model: "channel",      type : "number", custom:true,
		    		    parent_label : "label", data : [
		    		  		{id:0,label:"Channel 0"},{id:1,label:"Channel 1"},{id:2,label:"Channel 2"},
		    		  		{id:3,label:"Channel 3"},{id:4,label:"Channel 4"},{id:5,label:"Channel 5"}
		    		    ]
		    	    },
		    		{ label : "Phasa",          model: "phasa",        type : "text", custom:true,
		    			parent_label : "label", dontConvert:true, data : [
		    		  		{id:"R",label:"Phasa R"},{id:"S",label:"Phasa S"},{id:"T",label:"Phasa T"}
		    		    ]
		    		},
		    		{ label : "Temperature Name",model: "id_temp",	   relation:true },
		    		{ label : "Styles",     	 model: "styles",	   type : "text", custom:true, dontShow:true,
		    			parent_label : "label",  dontConvert:true, data : [
		    		  		{id:"ac-top",label:"AC Top"},{id:"ac-bottom",label:"AC Bottom"},{id:"ac-left",label:"AC Left"},
		    		  		{id:"ac-right",label:"AC Right"}
		    		    ]
		    	    },
		    	    { label : "Brand",          model: "brand", generate:"brand"},
		    	    { label : "Serial Number",  model: "serial_number",    type:"text"},
		    	    { label : "Product ID",     model: "part_number", 	   type:"text"},
		    		{ label : "Infrared Name",  model: "id_ir", 	       relation:true },
		    		{ label : "Start",          model: "start_operation",  type : "time"},
		    		{ label : "End", 	        model: "end_operation",    type : "time" },
		    		{ label : "Install Date",   model: "install_date",     hidden:true, filter:"dateOnly", dateNow:true},
		    		{ label : "Last Update",	model: "last update",      type : "text", hidden:true, dontShow:true},
		    		{ label : "Last Value", 	model: "last_value",       type : "number", hidden:true, dontShow:true },
		    	],
		    	data        : $scope.ac
			},
			chiller : {
				name        : "CHILLER",
		    	title       : "chiller",
		    	label       : "chiller_name",
		    	properties  : [
		    		{ label : "Chiller Name", 	model: "chiller_name",    type : "text" },
		    		{ label : "Province Name",  model: "id_province",     relation : true, dontShow:true, link:true},
		    		{ label : "Zone Name",      model: "id_zone",         relation : true, dontShow:true, link:true},
		    		{ label : "Branch Name",    model: "id_branch",       relation : true, dontShow:true, link:true},
		    		{ label : "Location Name",  model: "id_location",     relation:true},
		    		{ label : "Kwh Name",       model: "id_kwh",          relation:true },
		    		{ label : "Threshold", 	    model: "threshold",       type : "number" },
		    		{ label : "Channel",        model: "channel",      type : "number", custom:true,
		    		    parent_label : "label", data : [
		    		  		{id:0,label:"Channel 0"},{id:1,label:"Channel 1"},{id:2,label:"Channel 2"},
		    		  		{id:3,label:"Channel 3"},{id:4,label:"Channel 4"},{id:5,label:"Channel 5"}
		    		    ]
		    	    },
		    		{ label : "Phasa",          model: "phasa",        type : "text", custom:true,
		    			parent_label : "label", dontConvert:true, data : [
		    		  		{id:"R",label:"Phasa R"},{id:"S",label:"Phasa S"},{id:"T",label:"Phasa T"}
		    		    ]
		    		},
		    		 { label : "Brand",          model: "brand", generate:"brand"},
		    	    { label : "Serial Number",  model: "serial_number",   type:"text"},
		    	    { label : "Product ID",     model: "part_number", 	  type:"text"},
		    	    { label : "Install Date",   model: "install_date",    hidden:true, filter:"dateOnly", dateNow:true},
		    		{ label : "Last Value", 	model: "last_value",      type : "number", hidden:true},
		    		{ label : "Last Update",    model: "last_update",     type:"text", hidden:true, filter:"dateOnly"}

		    	],
		    	data        : $scope.chiller
			},
			pump : {
				name        : "PUMP",
		    	title       : "pump",
		    	label       : "pump_name",
		    	properties  : [
		    		{ label : "Pump Name", 	    model: "pump_name",       type : "text" },
		    		{ label : "Province Name",  model: "id_province",     relation : true, dontShow:true, link:true},
		    		{ label : "Zone Name",      model: "id_zone",         relation : true, dontShow:true, link:true},
		    		{ label : "Branch Name",    model: "id_branch",       relation : true, dontShow:true, link:true},
		    		{ label : "Location Name",  model: "id_location",     relation:true, link : true},
		    		{ label : "Kwh Name",       model: "id_kwh",          relation:true },
		    		{ label : "IO ID",          model: "io_id",           type:"number"},
		    		{ label :  "Channel",        model: "channel",        type : "number", custom:true,
		    		    parent_label : "label", data : [
		    		  		{id:0,label:"Channel 0"},{id:1,label:"Channel 1"},{id:2,label:"Channel 2"},
		    		  		{id:3,label:"Channel 3"},{id:4,label:"Channel 4"},{id:5,label:"Channel 5"}
		    		    ]
		    	    },
		    		{ label : "Brand",          model: "brand", generate:"brand"},
		    	 	{ label : "Serial Number",  model: "serial_number",    type:"text"},
		    	    { label : "Product ID",     model: "part_number", 	   type:"text"},
		    	    { label : "Max Threshold",  model: "max_threshold",    type:"number", filter:"second"},
		    	    { label : "Type IO",        model: "type_io",          type:"number"},
		    	    { label : "Install Date",   model: "install_date",     hidden:true, filter:"dateOnly", dateNow:true}
		    	],
		    	data        : $scope.pump
			},
			door : {
				name        : "DOOR",
		    	title       : "door",
		    	label       : "door_name",
		    	properties  : [
		    		{ label : "Door Name", 	    model: "door_name",       type : "text" },
		    		{ label : "Province Name",  model: "id_province",     relation : true, dontShow:true, link:true},
		    		{ label : "Zone Name",      model: "id_zone",         relation : true, dontShow:true, link:true},
		    		{ label : "Branch Name",    model: "id_branch",       relation : true, dontShow:true, link:true},
		    		{ label : "Location Name",  model: "id_location",     relation:true, link : true},
            { label : "Styles",     	 model: "styles",	   type : "text", custom:true, dontShow:true,
		    			parent_label : "label",  dontConvert:true, data : [
		    		  		{id:"door2_bottom",label:"Door Bottom"},{id:"door2_top",label:"Door Top"},{id:"door2_right",label:"Door Bottom"},
		    		  		{id:"door2_left",label:"Door Left"}
		    		    ]
		    	    },
		    		{ label : "Kwh Name",       model: "id_kwh",          relation:true },
		    		{ label : "IO ID",          model: "io_id",           type:"number"},
		    		{ label : "Channel",        model: "channel",         type : "number", custom:true,
		    		    parent_label : "label", data : [
		    		  		{id:0,label:"Channel 0"},{id:1,label:"Channel 1"},{id:2,label:"Channel 2"},
		    		  		{id:3,label:"Channel 3"},{id:4,label:"Channel 4"},{id:5,label:"Channel 5"}
		    		    ]
		    	    },
		    		{ label : "Brand",          model: "brand", generate:"brand"},
		    	 	{ label : "Serial Number",  model: "serial_number",   type:"text"},
		    	    { label : "Product ID",     model: "part_number", 	  type:"text"},
		    	    { label : "Max Threshold",  model: "max_threshold",   type:"number", filter:"second"},
		    	    { label : "Type IO",        model: "type_io",          type:"number"},
		    	    { label : "Install Date",   model: "install_date",    hidden:true, filter:"dateOnly", dateNow:true}
		    	],
		    	data        : $scope.door
			},
			lamp : {
				name        : "LAMP",
		    	title       : "lamp",
		    	label       : "lamp_name",
		    	properties  : [
		    		{ label : "Lamp Name", 	    model: "lamp_name",       type : "text" },
		    		{ label : "Province Name",  model: "id_province",     relation : true, dontShow:true, link:true},
		    		{ label : "Zone Name",      model: "id_zone",         relation : true, dontShow:true, link:true},
		    		{ label : "Branch Name",    model: "id_branch",       relation : true, dontShow:true, link:true},
		    		{ label : "Location Name",  model: "id_location",     relation:true, link : true },
            { label : "IO ID",          model: "io_id",           type:"number"},
		    		{ label : "Kwh Name",       model: "id_kwh",          relation:true},
		    		{ label : "Channel",        model: "channel",         type : "number", custom:true,
		    		    parent_label : "label", data : [
		    		  		{id:0,label:"Channel 0"},{id:1,label:"Channel 1"},{id:2,label:"Channel 2"},
		    		  		{id:3,label:"Channel 3"},{id:4,label:"Channel 4"},{id:5,label:"Channel 5"}
		    		    ]
		    	    },
		    		{ label : "Brand",          model: "brand", generate:"brand"},
		    	 	{ label : "Serial Number",  model: "serial_number",    type:"text"},
		    	    { label : "Product ID",     model: "part_number", 	   type:"text"},
		    	    { label : "Type IO",        model: "type_io",          type:"number"},
		     		{ label : "Start",model: "start_operation",  type : "time"},
		    		{ label : "End", 	model: "end_operation",    type : "time" },
		    		{ label : "Install Date",   model: "install_date",     hidden:true, filter:"dateOnly", dateNow:true}
		    	],
		    	data        : $scope.lamp
			},
			employee : {
				name        : "USER",
		    	title       : "employee",
		    	label       : "employee_name",
		    	properties  : [
		    		{ label : "Name", 	           model: "name",               type : "text" },
		    		{ label : "Username",          model: "username",           type : "text" },
		    		{ label : "Password",          model: "password",           type:"password", dontShow:true},
		    		{ label : "Email", 	           model: "email",              type : "email" },
		    		{ label : "Role",              model: "role",       	    type : "text", custom:true,
	    			parent_label : "label", dontConvert:true, data : [
	    		  		{id:"superadmin",label:"Super admin"},{id:"admin",label:"Admin"},{id:"branch",label:"Branch"},{id:"zone",label:"Zone"}
	    		    ]
		    		},
		    		{ label : "Image",             model: "image",              type:"img"}
		      	],
		    	data        : $scope.employee
			},
			brand : {
 				name           : "BRAND",
 				title          : "brand",
 				label          : "brand_name",
 				parentGenerate : true,
 				properties     : [
 					{ label    : "Brand Name",      model:"brand_name",     type:"text"},
 				],
 				data           : $scope.brand
			},
			type_alarm  : {
 				name           : "TYPE ALARM",
 				title          : "type_alarm",
 				label          : "alarm_name",
 				properties     : [
 					{ label    : "Alarm Name",      model:"alarm_name",     type:"text"},
 				],
 				data           : $scope.type_alarm
			}
		}


		$scope.link={
			zone : [
			 	{ to : "province", foregn_key : "id_province", parent_label : "province_name" }
			],
			branch : [
			 	{ to : "zone",     foregn_key : "id_zone",     parent_label : "zone_name" }
			],
			location : [
			 	{ to : "province", foregn_key : "id_province", parent_label : "province_name" },
			  	{ to : "zone",     foregn_key : "id_zone",     parent_label : "zone_name" },
			  	{ to : "branch",   foregn_key : "id_branch",   parent_label : "branch_name" }
			],
			infrared : [
				{ to : "province",  foregn_key : "id_province",  parent_label : "province_name" },
				{ to : "zone",      foregn_key : "id_zone",      parent_label : "zone_name" },
				{ to : "branch",    foregn_key : "id_branch",    parent_label : "branch_name" },
			 	{ to : "location",  foregn_key : "id_location",  parent_label : "location_name" },
			 	{ to : "brand",     foregn_key : "brand_name",   parent_label : "brand_name" }
			],
			temperature : [
				{ to : "province",  foregn_key : "id_province",  parent_label : "province_name" },
				{ to : "zone",      foregn_key : "id_zone",      parent_label : "zone_name" },
				{ to : "branch",    foregn_key : "id_branch",    parent_label : "branch_name" },
			 	{ to : "location",  foregn_key : "id_location",  parent_label : "location_name" }
			],
			ac : [
				{ to : "province",  	foregn_key : "id_province",  parent_label : "province_name" },
				{ to : "zone",      	foregn_key : "id_zone",      parent_label : "zone_name" },
				{ to : "branch",    	foregn_key : "id_branch",    parent_label : "branch_name" },
			 	{ to : "location",  	foregn_key : "id_location",  parent_label : "location_name" },
			 	{ to : "temperature",   foregn_key : "id_temp",  	 parent_label : "temp_name" },
			 	{ to : "kwh",           foregn_key : "id_kwh",  	 parent_label : "kwh_name" },
			 	{ to : "infrared",      foregn_key : "id_ir",        parent_label : "ir_name" }
			],
			chiller : [
				{ to : "province",  foregn_key : "id_province",  parent_label : "province_name" },
				{ to : "zone",      foregn_key : "id_zone",      parent_label : "zone_name" },
				{ to : "branch",    foregn_key : "id_branch",    parent_label : "branch_name" },
			 	{ to : "location",  foregn_key : "id_location",  parent_label : "location_name" },
			 	{ to : "kwh",       foregn_key : "id_kwh",  	 parent_label : "kwh_name" }
			],
			pump : [
				{ to : "province",  foregn_key : "id_province",  parent_label : "province_name" },
				{ to : "zone",      foregn_key : "id_zone",      parent_label : "zone_name" },
				{ to : "branch",    foregn_key : "id_branch",    parent_label : "branch_name" },
			 	{ to : "location",  foregn_key : "id_location",  parent_label : "location_name" },
			 	{ to : "kwh",       foregn_key : "id_kwh",  	 parent_label : "kwh_name" }
			],
			door : [
				{ to : "province",  foregn_key : "id_province",  parent_label : "province_name" },
				{ to : "zone",      foregn_key : "id_zone",      parent_label : "zone_name" },
				{ to : "branch",    foregn_key : "id_branch",    parent_label : "branch_name" },
			 	{ to : "location",  foregn_key : "id_location",  parent_label : "location_name" },
			 	{ to : "kwh",       foregn_key : "id_kwh",  	 parent_label : "kwh_name" }
			],
			lamp : [
				{ to : "province",  foregn_key : "id_province",  parent_label : "province_name" },
				{ to : "zone",      foregn_key : "id_zone",      parent_label : "zone_name" },
				{ to : "branch",    foregn_key : "id_branch",    parent_label : "branch_name" },
			 	{ to : "location",  foregn_key : "id_location",  parent_label : "location_name" },
			 	{ to : "kwh",       foregn_key : "id_kwh",  	 parent_label : "kwh_name" }
			],
			kwh : [
				{ to : "province",  foregn_key : "id_province",  parent_label : "province_name" },
				{ to : "zone",      foregn_key : "id_zone",      parent_label : "zone_name" },
				{ to : "branch",    foregn_key : "id_branch",    parent_label : "branch_name" },
			 	{ to : "location",  foregn_key : "id_location",  parent_label : "location_name" }
			]
		}

		$scope.navs=[
			{label : "Province", 	 model:"province",   style:""},
			{label : "Zone",     	 model:"zone",       style:""},
			{label : "Branch",    	 model:"branch",     style:""},
			{label : "Location",  	 model:"location",   style:""},
			{label : "Kwh",    	     model:"kwh",        style:""},
			{label : "Infrared",     model:"infrared",   style:""},
			{label : "Temperature",  model:"temperature",style:""},
			{label : "AC",    	     model:"ac",   		 style:""},
			{label : "Chiller",    	 model:"chiller",    style:""},
			{label : "Pump",    	 model:"pump",       style:""},
			{label : "Door",    	 model:"door",       style:""},
			{label : "Lamp",    	 model:"lamp",       style:""},
			{label : "Brand",    	 model:"brand",      style:""},
			{label : "Type Alarm",   model:"type_alarm", style:""},
			{label : "User",    	 model:"employee",   style:""}

		];
		$scope.relation=function(){
			var list   = $scope.link[$scope.canvas.title];
			if(list != undefined){
				for (var i = 0; i < list.length; i++) {
					var data=$scope.metaData[ list[i].to ].data;
					//action for form to use select option automatic
					for (var j = 0; j < $scope.canvas.properties.length; j++) {
						if($scope.canvas.properties[j].model==list[i].foregn_key){
							$scope.canvas.properties[j]["data"]         = data;
							$scope.canvas.properties[j]["parent_label"] = list[i].parent_label;
						}
					}
					//action for table automatic use parent label
					for (var j = 0; j < $scope.canvas.data.length; j++) {
						for (var k = 0; k < data.length; k++) {
							if(data[k].id==$scope.canvas.data[j][list[i].foregn_key]){
								$scope.canvas.data[j][list[i].parent_label]=data[k][list[i].parent_label];
							}
						}
					}
				}
			}
		}
		$scope.setActive=function(model){
			for (var i = 0; i < $scope.navs.length; i++) {
				if($scope.navs[i].model==model){
					$scope.navs[i].style="active";
					$scope.canvas = $scope.metaData[$scope.navs[i].model];
					$scope.relation();

				}
				else {
					$scope.navs[i].style="";
				}
			}
		}
		$scope.setActive("province");

		$scope.filter=function(type,data){
			var temp;
			switch(type){
				case "second":
					temp=data/1000;
					temp=temp.toFixed(0)+" Second";
				break;

				case "dateOnly":
					if(data!=null){
						temp=$filter("date")(data,"yyyy-MM-dd");
					}
				break;

				case "ampere":
					temp=data+" A";
				break;

				case "spacious":
					temp=data+" M2";
				break;

				case "temp":
					if(data==0){
						temp="only";
					}
					else {
						temp="Humidity";
					}
				break;
			}
			return temp;
		}
	}


	function service(){
		$scope.backup  = {};
		$scope.modal   = [];
		$scope.selectOption= {
			location : {
				clearList      : [ "id_zone","id_branch"],
				id_province    : { in : "zone",   renderTo : "id_zone"},
				id_zone        : { in : "branch", renderTo : "id_branch" }
			},
			infrared : {
				clearList      : [ "id_zone","id_branch","id_location"],
				id_province    : { in : "zone",     renderTo : "id_zone" },
				id_zone        : { in : "branch",   renderTo : "id_branch" },
				id_branch	   : { in : "location", renderTo : "id_location" }
			},
			temperature : {
				clearList      : [ "id_zone","id_branch","id_location"],
				id_province    : { in : "zone",     renderTo : "id_zone" },
				id_zone        : { in : "branch",   renderTo : "id_branch" },
				id_branch	   : { in : "location", renderTo : "id_location" }
			},
			ac : {
				clearList      : [ "id_zone","id_branch","id_location"],
				id_province    : { in : "zone",     renderTo : "id_zone" },
				id_zone        : { in : "branch",   renderTo : "id_branch" },
				id_branch	   : { in : "location", renderTo : "id_location" },
				id_location    : { in : "kwh",      renderTo : "id_kwh" }
			},
			chiller : {
				clearList      : [ "id_zone","id_branch","id_location"],
				id_province    : { in : "zone",     renderTo : "id_zone" },
				id_zone        : { in : "branch",   renderTo : "id_branch" },
				id_branch	   : { in : "location", renderTo : "id_location" },
				id_location    : { in : "kwh",      renderTo : "id_kwh" }
			},
			pump : {
				clearList      : [ "id_zone","id_branch","id_location"],
				id_province    : { in : "zone",     renderTo : "id_zone" },
				id_zone        : { in : "branch",   renderTo : "id_branch" },
				id_branch	   : { in : "location", renderTo : "id_location" },
				id_location    : { in : "kwh",      renderTo : "id_kwh" }
			},
			door : {
				clearList      : [ "id_zone","id_branch","id_location"],
				id_province    : { in : "zone",     renderTo : "id_zone" },
				id_zone        : { in : "branch",   renderTo : "id_branch" },
				id_branch	   : { in : "location", renderTo : "id_location" },
				id_location    : { in : "kwh",      renderTo : "id_kwh" }
			},
			lamp : {
				clearList      : [ "id_zone","id_branch","id_location","id_kwh"],
				id_province    : { in : "zone",     renderTo : "id_zone" },
				id_zone        : { in : "branch",   renderTo : "id_branch" },
				id_branch	   : { in : "location", renderTo : "id_location" },
				id_location    : { in : "kwh",      renderTo : "id_kwh" }
			},
			kwh : {
				clearList      : [ "id_zone","id_branch","id_location"],
				id_province    : { in : "zone",     renderTo : "id_zone" },
				id_zone        : { in : "branch",   renderTo : "id_branch" },
				id_branch	   : { in : "location", renderTo : "id_location" }
			}
		}
		$scope.index;
		$scope.file={};
		$scope.disabled=function(){
			console.log($scope.canvas);
				for (var i = 0; i < $scope.canvas.properties.length; i++) {
					if($scope.canvas.properties[i].disabled==true){
						$scope.canvas.properties[i].placeholder=$scope.user.name;
						$scope.post[$scope.canvas.properties[i].model]=$scope.user.id;
					}
				}
		}
		$scope.cancel=function(){
			if($scope.action=="update"){
				$scope.canvas.data[$scope.index]=$scope.backup;
			}
		}
		$scope.setForm=function(){
			$scope.modal   = angular.copy($scope.canvas.properties);
			//function to clear all data select option if use method change data after select value
			var link=false;
			for (var i = 0; i < $scope.modal.length; i++) {
				if($scope.modal[i].link!=undefined){
					link=true;
				}
			}
			if(link){
				var list=$scope.selectOption[$scope.canvas.title].clearList;
				for (var i = 0; i < list.length; i++) {
					for (var j = 0; j < $scope.modal.length; j++) {
						if($scope.modal[j].model==list[i]){
							if($scope.action!="update"){
								$scope.modal[j].data=[];
							}
						}
					}
				}
			}
			//fungsi untuk membagi data yang ada di modal biar terbagi menjadi 2 kanan dan kiri
			var temp=[];
			var mod=$scope.modal.length%2;
			if(mod==0){
				var space=$scope.modal.length/2;
				for (var i = 0; i < space; i++) {
					temp.push([]);
				}
			}
			else {
				var space=($scope.modal.length-1)/2;
				temp.push([]);
				for (var i = 0; i < space; i++) {
					temp.push([]);
				}
			}
			var index=0;
			for (var i = 0; i < $scope.modal.length; i++) {
				if(temp[index].length==2){
					index++;
				}
				temp[index].push($scope.modal[i]);
			}
			$scope.modal   = temp;
		}
		$scope.linkSelect=function(model,property,id){
			configure={},temp=[];
			// ini data untuk memberi aturan pada model dan pada property mana select option di link
			configure        = $scope.selectOption[model][property];
			data = $scope.metaData[ configure.in ].data;
			for (var i = 0; i < data.length; i++) {
				if(data[i][property]==id){
					temp.push(data[i]);
				}
			}
			for (var i = 0; i < $scope.modal.length; i++) {
				for (var j = 0; j < 2; j++) {
					if($scope.modal[i][j]!=undefined){
						if($scope.modal[i][j].model==configure.renderTo){
							$scope.modal[i][j].data=temp;
						}
					}
				}
			}
		}
		//fungs untuk meset update walaupun property tidak terdapat di table
		$scope.setNotProperty=function(){
			var con={
				infrared : [
					{ model:"id_branch",  dataChild :"location", key:"id_location"},
					{ model:"id_zone",    dataChild :"branch",   key:"id_branch"},
					{ model:"id_province",dataChild :"zone",     key:"id_zone"}
				],
				temperature : [
					{ model:"id_branch",  dataChild :"location", key:"id_location"},
					{ model:"id_zone",    dataChild :"branch",   key:"id_branch"},
					{ model:"id_province",dataChild :"zone",     key:"id_zone"}
				],
				ac : [
					{ model:"id_branch",  dataChild :"location", key:"id_location"},
					{ model:"id_zone",    dataChild :"branch",   key:"id_branch"},
					{ model:"id_province",dataChild :"zone",     key:"id_zone"}
				],
				chiller : [
					{ model:"id_branch",  dataChild :"location", key:"id_location"},
					{ model:"id_zone",    dataChild :"branch",   key:"id_branch"},
					{ model:"id_province",dataChild :"zone",     key:"id_zone"}
				],
				pump : [
					{ model:"id_branch",  dataChild :"location", key:"id_location"},
					{ model:"id_zone",    dataChild :"branch",   key:"id_branch"},
					{ model:"id_province",dataChild :"zone",     key:"id_zone"}
				],
				door : [
					{ model:"id_branch",  dataChild :"location", key:"id_location"},
					{ model:"id_zone",    dataChild :"branch",   key:"id_branch"},
					{ model:"id_province",dataChild :"zone",     key:"id_zone"}
				],
				lamp : [
					{ model:"id_branch",  dataChild :"location", key:"id_location"},
					{ model:"id_zone",    dataChild :"branch",   key:"id_branch"},
					{ model:"id_province",dataChild :"zone",     key:"id_zone"}
				],
				kwh : [
					{ model:"id_branch",  dataChild :"location", key:"id_location"},
					{ model:"id_zone",    dataChild :"branch",   key:"id_branch"},
					{ model:"id_province",dataChild :"zone",     key:"id_zone"}
				]
			}
			var setId=function(value){
				var id=$scope.post[ value.key ];
				var data=$scope.metaData[ value.dataChild ].data;
				for (var i = 0; i < data.length; i++) {
					if(data[i].id==id){
						$scope.post[ value.model ]=data[i][ value.model ];
					}
				}
			}
			var allSet=con[ $scope.model ];
			if(allSet!=undefined){
				for (var i = 0; i < allSet.length; i++) {
					setId(allSet[i]);
				}
			}
		}
		$scope.generateData=function(){
			var list=$scope.canvas.properties;
			var getData=function(value){
				var temp=[];
				var data=$scope.metaData[value].data;
				var label=$scope.metaData[value].label;
				for(var i in data){
					temp.push({id:data[i][label],label:data[i][label]})
				}
				return temp;
			}
			for(var i in list){
				if(list[i].generate!=undefined){
					var data=getData(list[i].generate);
					$scope.canvas.properties[i].data=data;
					$scope.canvas.properties[i].custom=true;
					$scope.canvas.properties[i].parent_label="label";
					$scope.canvas.properties[i].dontConvert=true;
				}
			}
		}
		$scope.create=function(model){
			$scope.generateData();
			$scope.form.$setPristine();
			$scope.post    = {};
			$scope.canvas  = $scope.metaData[model];
			$scope.action  = "create";
			$scope.model   = model;
			$scope.setActive(model);
			$scope.disabled();
			$scope.setForm();
		}
		$scope.update=function(model,data,index){
			$scope.generateData();
			$scope.form.$setPristine();
			$scope.post    = data;
			$scope.canvas  = $scope.metaData[model];
			$scope.action  = "update";
			$scope.model   = model;
			$scope.backup  = angular.copy(data);
			$scope.index   = index;
			$scope.disabled();
			$scope.setForm();
			$scope.setNotProperty();
		}

		$scope.delete=function(model,data,index){
			$scope.post    = data;
			$scope.canvas  = $scope.metaData[model];
			$scope.action  = "delete";
			$scope.model   = model;
			$scope.index   = index;
		}
		$scope.save=function(){
			for(var i in $scope.canvas.properties){
				if($scope.canvas.properties[i].dateNow!=undefined){
					$scope.post[ $scope.canvas.properties[i].model ]=$filter("date")(new Date(),"yyyy-MM-dd hh:mm:ss");
				}
			}
			rest.service({action:$scope.action,model:$scope.model,data:$scope.post})
			.then(function(res){
				if(res[0].status==404){
					toaster.pop("error",res[0].message);
					$scope.cancel();
				}
				else {
					toaster.pop("success",res[0].message);
					$scope.response(res[0]);
				}
			})
		}
		$scope.response=function(res){
			switch($scope.action){
				case "create":
					$scope.canvas.data.push(res.callback);
					$scope.fileUpload(res.callback);
				break;

				case "update":
					$scope.fileUpload($scope.post);
				break;

				case "delete":
					$scope.canvas.data.splice($scope.index,1);
					$scope.fileUpload($scope.post);
				break;
			}
			$scope.relation();
		}
		$scope.fileUpload=function(data){
			var prop=$scope.canvas.properties;
			for (var i = 0; i < prop.length; i++) {
				if(prop[i].type=="file"){
					if($scope.action!="delete"){
						data[ prop[i].model ]="/img/profile/"+$scope.file[ prop[i].model ].name;
						rest.service({action:"update",model:"location",data:data});
					}
					var label;
					if($scope.action=="delete"){
						label=data[ prop[i].model ];
					}
					else{
						label=$scope.backup[ prop[i].model ];
					}
					rest.image($scope.file[ prop[i].model ],$scope.action,label);
				}
			}
		}
	}



})

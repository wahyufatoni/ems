'use strict';

var app=require("../../server/server.js");
module.exports = function(App) {

		App.service=function(action,model,data,filter,res){
			var lib,model,dataset,child;
			lib={
				province     : {
					api              : app.models.province,
					label            : "province_name",
					otherValidation  : ["id_employee"],
					child            : [
						{ in : "location", key : "id_province"},
						{ in : "zone",     key : "id_province"}
					]
			 	},
			 	zone    : {
					api              : app.models.zone,
					label            : "zone_name",
					otherValidation  : ["id_employee"],
					child            : [
						{ in : "location", key : "id_zone"},
						{ in : "branch",   key : "id_zone"}
					]
				},
				branch    : {
					api              : app.models.branch,
					label            : "branch_name",
					otherValidation  : ["id_employee"],
					child            : [
						{ in : "location", key : "id_branch"}
					]
				},
				location    : {
					api              : app.models.location,
					multiple         : ["location_name","id_gateway"],
					otherValidation  : {
						location_name  : ["id_branch"]
					},
					child            : [
						{ in : "lamp",        key : "id_location"},
						{ in : "door", 	   	  key : "id_location"},
						{ in : "pump", 		 		key : "id_location"},
						{ in : "chiller", 	  key : "id_location"},
						{ in : "ac", 		  		key : "id_location"},
						{ in : "temperature", key : "id_location"},
						{ in : "infrared", 	  key : "id_location"}
					]
				},
				infrared   : {
					api              : app.models.infrared,
					label            : "ir_name",
					otherValidation  : ["id_location"],
					child            : [
						{ in : "ac", key : "id_ir"}

					]
				},
				temperature   : {
					api              : app.models.temperature,
					multiple         : ["temp_name","th_id"],
					otherValidation  : {
						temp_name : ["id_location"],
						th_id     : ["id_location"]
					},
					child            : [
						{ in : "ac", key : "id_temp"}

					]
				},
				ac    : {
					api              : app.models.ac,
					label            : "ac_name",
					otherValidation  : ["id_location"]
				},
				chiller  : {
					api              : app.models.chiller,
					label            : "chiller_name",
					otherValidation  : ["id_location"]
				},
				pump  : {
					api              : app.models.pump,
					label            : "pump_name",
					otherValidation  : ["id_location"]
				},
				door  : {
					api              : app.models.door,
					label            : "door_name",
					otherValidation  : ["id_location"]
				},
				lamp  : {
					api              : app.models.lamp,
					label            : "lamp_name",
					otherValidation  : ["id_location"]
				},
				employee  : {
					api              : app.models.employee,
					label            : "name"
				},
				kwh  : {
					api              : app.models.kwh,
					multiple         : ["kwh_name","kwh_id"],
					otherValidation  : {
						 kwh_name : ["id_location"],
						 kwh_id   : ["id_location"]
					},
					child            : [
						{ in : "lamp",        key : "id_kwh"},
						{ in : "door", 	   	  key : "id_kwh"},
						{ in : "pump", 		  	key : "id_kwh"},
						{ in : "chiller", 	  key : "id_kwh"},
						{ in : "ac", 		  		key : "id_kwh"},
						{ in : "temperature", key : "id_kwh"},
						{ in : "infrared", 	  key : "id_kwh"}
					]
				},
				alarm   : {
					api    			 : app.models.alarm,
					notValidate      : true
				},
				building : {
					api  			 : app.models.building,
					notValidate      : true
				},
				total   : {
					api   			 : app.models.total,
					notValidate      : true
				},
				widget  :{
					api   			 : app.models.widget,
					notValidate      : true
				},
				brand : {
					api              : app.models.brand,
					label            : "brand_name"
				},
				type_alarm : {
					api 			 : app.models.type_alarm,
					label            : "alarm_name" 
				}
			};
			if(action!="chart"){
				dataset=lib[model].api;
			}
			function renderChart(item,data){
				res(null,[{item:item,data:data}]);
			}
			function validation(list,label){
				var temp, word, other,valid  = 0;
				if(lib[model].multiple==undefined){
					other = lib[model].otherValidation;
				}
				else{
					other = lib[model].otherValidation[label];
				}
				word=data[label];
				word=word.toString();
				word=word.toLowerCase();
				word=word.split(" ").join("");
				if(other!=undefined){
					for (var i = 0; i < other.length; i++) {
						if(data[other[i]]!=null){
							word=word+data[other[i]].toString();
						}
					}
				}
				for (var j = 0; j < list.length; j++) {
					if(list[j].id!=data.id){
						temp=list[j][label];
						temp=temp.toString();
						temp=temp.toLowerCase();
						temp=temp.split(" ").join("");
						if(other!=undefined){
							for (var i = 0; i < other.length; i++) {
								if(list[j][other[i]] != null){
									temp=temp+list[j][other[i]].toString();
								}
							}
						}
						if(temp==word){
							valid++;
						}
					}
				}
				return valid;
			}
			switch(action){
				case "read":
					if(filter==undefined){
						dataset.find().then(function(cb){
							res(null,cb);
						})
						.catch(function(err){
							res(null,[{status:404,message:"error in model "+model}]);
						})
					}
					else {
						dataset.find(filter).then(function(cb){
							res(null,cb);
						})
					}
				break;

				case "create":
					dataset.find().then(function(list){
						var valid;
						if(list.length!=0){
							if(lib[model].notValidate==undefined && lib[model].multiple==undefined){
								valid=validation(list,lib[model].label);
							}
							else {
								if(lib[model].notValidate==undefined){
									var temp=[],multiple=lib[model].multiple;
									for (var i = 0; i < multiple.length; i++) {
										temp.push(validation(list,multiple[i]));
									}
									valid=0;
									for (var i = 0; i < temp.length; i++) {
										if(temp[i]==1){
											valid = 1
										}
									}
								}
							}
						}
						else {
							valid=0;
						}
						if(valid==0 || (lib[model].label==undefined && lib[model].multiple==undefined)){
							dataset.create(data).then(function(cb){
								res(null,[{status:200,message:"Successfully insert data",callback:cb}]);
							});
						}
						else{
							var message;
							if(lib[model].multiple==undefined){
								var label=lib[model].label
								message="Data "+label.split("_").join(" ")+" "+data[label]+" already exist";
							}
							else{
								var err="";
								for (var i = 0; i < multiple.length; i++) {
									if(temp[i]==1){
										err=err+" "+multiple[i].split("_").join(" ")+" "+data[ multiple[i] ];
									}
								}
								message="Data "+err+" already exist";
							}
							res(null,[{status:404,message:message}]);
						}
					})
				break;

				case "update":
					dataset.find().then(function(list){
						var valid,temp=[];
						if(lib[model].notValidate==undefined && lib[model].multiple==undefined){
							valid=validation(list, lib[model].label);
						}
						else {
							if(lib[model].notValidate==undefined){
								var temp=[],multiple=lib[model].multiple;
								for (var i = 0; i < multiple.length; i++) {
									temp.push(validation(list,multiple[i]));
								}
								valid=0;
								for (var i = 0; i < temp.length; i++) {
									if(temp[i]==1){
										valid = 1
									}
								}
							}
						}
						if(valid==0 || (lib[model].label==undefined && lib[model].multiple==undefined)){
							var id    = data.id;
							data.id   = undefined;
							dataset.replaceById(id,data).then(function(cb){
								res(null,[{status:200,message:"Successfully update data"}]);
							})
						}
						else {
							var message;
							if(lib[model].multiple==undefined){
								var label=lib[model].label
								message="Data "+label.split("_").join(" ")+" "+data[label]+" already exist";
							}
							else{
								var err="";
								for (var i = 0; i < multiple.length; i++) {
									if(temp[i]==1){
										err=err+" "+multiple[i].split("_").join(" ")+" "+data[ multiple[i] ];
									}
								}
								message="Data "+err+" already exist";
							}
							res(null,[{status:404,message:message}]);
						}

					})
				break;

				case "delete":
					if(lib[model].child!=undefined){
						var allChild = lib[model].child,valid=0;
						for (var i = 0; i < allChild.length; i++) {
							var prep={},table=allChild[i].in;
							prep[ allChild[i].key ] =data.id;
							child=lib[ table ].api;
							child.find({where:prep}).then(function(cb){
								if(cb.length!=0){
									valid++;
								}
								if(i==allChild.length){
									if(valid!=0){
										table=table.split("_").join(" ");
										res(null,[{
											status    : 404,
											message   : "You must to delete data relation with this record in table "+table
										}]);
									}
									else {
										dataset.deleteById(data.id).then(function(del){
											res(null,[{status:200,message:"Successfully delete data"}]);
										});
									}
								}
							})
						}
					}
					else {
						dataset.deleteById(data.id).then(function(cb){
							res(null,[{status:200,message:"Successfully delete data"}]);
						});
					}
				break;
			}
		}

		App.remoteMethod("service",{
			http     : { path : "/service", verb:"post"},
			accepts  : [
				{ type : "string", arg : "action" },
				{ type : "string", arg : "model"  },
				{ type : "object", arg : "data"   },
				{ type : "object", arg : "filter" }
			],
			returns  : { type:"array", root : true }
		})



















		App.chart=function(start,end,gateway,res){
			var location  = app.models.location;
			var th        = app.models.th;
			var watt      = app.models.WattPrd_I;
			var kwh       = app.models.kwh;
			var temp   	  = app.models.temperature;
			var ac        = app.models.ac;
			var chiller   = app.models.chiller;
			var setPerHour=function(data){
				var temp=[],hour=[],prep="";
				for (var i = 0; i < data.length; i++) {
					data[i].hour=data[i].date.toString();
					data[i].hour=data[i].hour.substr(0,18);
					if(i==0){
						prep=data[i].hour;
						hour.push(data[i]);
					}
					else{
						if(prep==data[i].hour){
							hour.push(data[i]);
						}
						else{
							temp.push(hour);
							hour=[];
							prep=data[i].hour;
							hour.push(data[i]);
						}
					}
					if(i==(data.length-1)){
						temp.push(hour);
					}
				}
				return temp;
			}
			var getGroupFile=function(type,arr){
				var temp=[];
				switch(type){
					case "th":
						var hash = {}, result = [];
						for ( var i = 0, l = arr.length; i < l; ++i ){
						  if ( !hash.hasOwnProperty(arr[i]) ) {
						        hash[ arr[i] ] = true;
						      result.push(arr[i]);
						  }
						}
						for (var i = 0; i < result.length; i++) {
							temp.push({Th_id:result[i],temp1:[],humidity:[]});
						}
					break;

					case "watt":
						temp = [
							{Channel:0,WattPrdR:[],WattPrdS:[],WattPrdT:[]},
							{Channel:1,WattPrdR:[],WattPrdS:[],WattPrdT:[]},
							{Channel:2,WattPrdR:[],WattPrdS:[],WattPrdT:[]},
							{Channel:3,WattPrdR:[],WattPrdS:[],WattPrdT:[]},
							{Channel:4,WattPrdR:[],WattPrdS:[],WattPrdT:[]},
							{Channel:5,WattPrdR:[],WattPrdS:[],WattPrdT:[]}
						]
					break;
				}
				return temp;
			}
			var mean=function(data){
				var temp=data[0];
				if(data.length!=1){
					for (var i = 1; i < data.length; i++) {
						temp=temp+data[i];
					}
					temp=temp/data.length;
					temp=parseInt(temp.toFixed(0));
				}
				return temp;
			}
			var setGroupData=function(data,type){
				var temp=[],allTh=[];
				var lib = {
					 th : { key : "Th_id",val : ["temp1","humidity"] },
					 watt : { key : "Channel", val : ["WattPrdR","WattPrdS","WattPrdT"]}
				}
				if(type=="th"){
					for (var i = 0; i < data.length; i++) {
						for (var j = 0; j < data[i].length; j++) {
							allTh.push(data[i][j].Th_id);
						}
					}
				}
				for (var i = 0; i < data.length; i++) {
					var file = getGroupFile(type,allTh);
					var list = lib[type].val;
					var key  = lib[type].key;
					for (var j = 0; j < data[i].length; j++) {
						for (var k = 0; k < file.length; k++) {
							if(file[k][key]==data[i][j][key]){
								for (var l = 0; l < list.length; l++) {
									var a;
									if(type=="th"){
										a=data[i][j][ list[l] ]/100;
									}
									else{
										a=data[i][j][ list[l] ]/1000;
									}
									file[k][ list[l] ].push(parseInt(a.toFixed(0)));
								}
								if(type=="watt"){
									file[k].Kwh_id=data[i][j].Kwh_id;
								}
								file[k].date=Date.parse(data[i][j].date);
							}
						}
					}

					for (var j = 0; j < file.length; j++) {
						if(file[j][ list[0] ].length!=0){
							for (var k = 0; k < list.length; k++) {
								file[j][ list[k] ] = mean(file[j][ list[k] ]);
							}
							temp.push(file[j])
						}
					}

				}
				return temp;
			}
			var validateData=function(data,type){
				var temp={th:[],watt:[]};
				var prty={
					th   : ["id","type","Th_id","Gateway_id","temp1","temp2","temp3","humidity","date"],
					watt : ["id","Kwh_id","Gateway_id","WattPrdR","WattPrdS","WattPrdT","IR","IS","IT","Channel","date"]
				}
				for (var i = 0; i < data.length; i++) {
					var valid=0;
					for (var j = 0; j < prty[type].length; j++) {
						if(data[i][ prty[type][j] ]==null){
							valid++;
						}
					}
					if(valid==0){
						temp[type].push(data[i]);
					}
				}
				var hour=setPerHour(temp[type]);
				return setGroupData(hour,type);
			}
			var transformToChart=function(data,item,type){
				var temp = [],kwh=[];
				var lib  = {
					temperature : {category:"device",label : "temp_name" },
					ac          : {category:"equipment",label:"ac_name"},
					chiller     : {category:"equipment", label:"chiller_name"}
				};
				var set = {
					device    : {unit:'°C', axis:0, val:["id","th_id","humidity"]},
					equipment : {unit:"KW", axis:1, val:["id","id_kwh","channel","phasa"]}
				};

				if(lib[type].category=="equipment"){
            		kwh=item.kwh;
            		item=item.data;
            	}
				for (var i = 0; i < item.length; i++) {
					var a=set[ lib[type].category ];
					var file = {
	                    model    : type,
	                    data     : [],
	                    yAxis    : a.axis,
	                    tooltip  : { valueSuffix:  a.unit }
	            	}
	            	for (var j = 0; j < a.val.length; j++) {
	            		if(item[i][ a.val[j] ]!=undefined){
	            			file[ a.val[j] ]=item[i][ a.val[j] ];
	            		}
	            	}
	            	if(lib[type].category=="equipment"){
	            		for (var j = 0; j < kwh.length; j++) {
	            			if(kwh[j].id==file.id_kwh){
	            				file.kwh_id=kwh[j].kwh_id;
	            			}
	            		}
	            	}
	            	file.name = item[i][ lib[type].label ];
	            	file.category = lib[type].category;
	            	temp.push(file);
	            	if(item[i].humidity==1 && item[i].humidity!=undefined){
	            		var hum = {
	            			name     : item[i][ lib[type].label ]+" humidity",
	            			th_id    : item[i].th_id,
		                    model    : type,
		                    data     : [],
		                    yAxis    : a.axis,
		                    type_humidity : true,
		                    tooltip  : { valueSuffix:  ' %' }
		            	}
	            		temp.push(hum);
	            	}
				}
				for (var i = 0; i < data.length; i++) {
					for (var j = 0; j < temp.length; j++) {
						switch(lib[type].category){
							case "device":
								if(data[i].Th_id==temp[j].th_id && temp[j].type_humidity==undefined){
									temp[j].data.push([data[i].date,data[i].temp1]);
								}
								if(data[i].Th_id==temp[j].th_id && temp[j].type_humidity==true){
									temp[j].data.push([data[i].date,data[i].humidity]);
								}
							break;

							case "equipment":
								if(data[i].Channel==temp[j].channel && data[i].Kwh_id==temp[j].kwh_id){
									switch(temp[j].phasa){
										case "R":
											temp[j].data.push([data[i].date,data[i].WattPrdR]);
										break;
										case "S":
											temp[j].data.push([data[i].date,data[i].WattPrdS]);
										break;
										case "T":
											temp[j].data.push([data[i].date,data[i].WattPrdT]);
										break;
									}
								}
							break;
						}
					}
				}
				return temp;
			}
			// res(null,[start,end]);


			th.find({where:{and: [{date:{gte:start}},{date:{lte:end}},{Gateway_id : gateway}]}}).then(function(th){
			watt.find({where:{and: [{date:{gte:start}},{date:{lte:end}},{Gateway_id : gateway}]}}).then(function(watt){
				if(th.length!=0 && watt.length!=0){
					th=validateData(th,"th");
					watt=validateData(watt,"watt");
					location.find({where:{id_gateway:gateway}}).then(function(loc){
						temp.find({where:{id_location:loc[0].id}}).then(function(temp){
						kwh.find({where:{id_location:loc[0].id}}).then(function(kwh){
						chiller.find({where:{id_location:loc[0].id}}).then(function(chiller){
						ac.find({where:{id_location:loc[0].id}}).then(function(ac){
							var chart=[];
							var all=[
								transformToChart(th,temp,"temperature"),
								transformToChart(watt,{kwh:kwh,data:ac},"ac"),
								transformToChart(watt,{kwh:kwh,data:chiller},"chiller")
							]
							for (var i = 0; i < all.length; i++) {
								if(all[i].length!=0){
									for (var j = 0; j < all[i].length; j++) {
										chart.push(all[i][j]);
									}
								}
							}
							res(null,chart);
						})
						})
						})
						})
					})
				}
				else{
					res(null,[]);
				}
			})
			})
		}

		App.remoteMethod("chart",{
			http     : { path : "/chart", verb:"post"},
			accepts  : [
				{ type : "string", arg:"start"  },
				{ type : "string", arg:"end"    },
				{ type : "number", arg:"gateway"}
			],
			returns  : { type:"array", root:true }
		})

























		App.config=function(id_gateway,table,column,res){
			var ac          =  app.models.ac;
			var kwh         =  app.models.kwh;
			var temp   		=  app.models.temperature;
			var ir          =  app.models.infrared;
			var pump        =  app.models.pump;
			var lamp        =  app.models.lamp;
			var door        =  app.models.door;
			var location    =  app.models.location;
			var type        =  app.models.type_alarm;
			var lib         =  {};
			var countTable  = 8,tableRendered=0;

			validateGateway();
			function validateGateway(){
				location.find({where:{id_gateway:id_gateway}}).then(function(log){
					if(log.length!=0){
						otherEquipment(log[0].id);
						acEquipment(log[0].id);
					}
					else{
						res(null,{message:"Location used id gateway "+id_gateway+" is required"});
					}
				})
			}

			function otherEquipment(log){
				pump.find({where:{id_location:log}}).then(function(pump){
				lamp.find({where:{id_location:log}}).then(function(lamp){
				door.find({where:{id_location:log}}).then(function(door){
				type.find({where:{id_location:log}}).then(function(type){
					var temp=[
						{label:"pump",       data:pump},
						{label:"lamp",       data:lamp},
						{label:"door",       data:door},
						{label:"type_alarm", data:type}
					]
					combination(temp);
				})
				})
				})
				})
			}


			function relation(data,config){

				var link=function(item){
					for(var i in config){
						for(var j in config[i].data){
							if(item[config[i].foregn]==config[i].data[j].id){
								for(var k in config[i].merge){
									item[ config[i].merge[k] ]=config[i].data[j][ config[i].merge[k] ]
								}
								item[config[i].label]=config[i].data[j];
							}
						}
					}
					return item;
				}
				for(var i in data){
					data[i]=link(data[i])
				}
				return data;
			}

			function acEquipment(log){
				ac.find({where:{id_location:log}}).then(function(ac){
				kwh.find({where:{id_location:log}}).then(function(kwh){
				temp.find({where:{id_location:log}}).then(function(temp){
				ir.find({where:{id_location:log}}).then(function(ir){
					var config=[
						{label:"kwh", foregn:"id_kwh", data:kwh,  merge:["kwh_id"]},
						{label:"temp",foregn:"id_temp",data:temp, merge:["th_id"]},
						{label:"ir",  foregn:"id_ir",  data:ir,   merge:["set_default"]}
					];
					ac=relation(ac,config);
					combination([
						{label:"ac",data:ac},{label:"kwh",data:kwh},{label:"temperature",data:temp},
						{label:"infrared",data:ir}
					]);
				})
				})
				})
				})
			}

			function combination(temp){
				for(var i in temp){
					tableRendered++;
					lib[temp[i].label]=temp[i].data;
				}
				if(countTable==tableRendered){
					bankData();
				}
			}

			function bankData(){
				var dataset=lib[table];
				var filter=[];
				if(column==undefined){
					res(null,dataset);
				}
				else{
					var temp={};
					for(var i in dataset){
						temp={};
						for(var j in column){
							if(dataset[i][column[j]]!=undefined){
								temp[column[j]]=dataset[i][column[j]];
							}
							else{
								temp[column[j]]="column "+column[j]+" required";
							}
						}
						filter.push(temp);
					}
					res(null,filter);
				}
			}
		}

		App.remoteMethod("config",{
			http : { path : "/config", verb:"post"},
			accepts : [
				{ type :"number", arg:"id_gateway"},
				{ type :"string", arg:"table"},
				{ type :"array",  arg:"column"}
			],
			returns  : {type:"object", root:true}
		})









		App.total=function(id_location,res){
			var total=app.models.total_month;
			var month=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
			var item=[
				{name:"AC",      data:[]},
				{name:"Chiller", data:[]},
				{name:"Other",   data:[]}
			];
			var year=new Date().getFullYear();
			total.find({where:{id_location:id_location,year:year}}).then(function(total){	
				res(null,{total:total,year:year});
			})
		}
		

		App.remoteMethod("total",{
			gttp : {path : "/total", verb:"post"},
			accepts : [
				{type : "number", arg:"id_location"}
			],
			returns : {type:"object",root:true}
		})
};

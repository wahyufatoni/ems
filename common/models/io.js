'use strict';
var app=require("../../server/server.js");
module.exports = function(Io) {
 Io.save=function(data,res){
 	var prop=["Gateway_id","Channel","io_id","type","value"];
 	validation(data);
 	function validation(data){
	 	var temp=[],valid;
	 	for(var i in data){
	 		valid=0;
	 		for(var j in prop){
	 			if(data[i][prop[j]]==null){
	 				valid++;
	 			}
	 		}
	 		if(valid==0){
	 			temp.push(data[i]);
	 		}
	 	}
	 	if(temp.length==0){
	 		res(null,{message:"Semua data tidak valid",data:data});
	 	}
	 	else{
	 		gatewayStatus(data);
	 	}
 	}

 	function gatewayStatus(data){
 		var loc=app.models.location;
 		loc.find({where:{id_gateway:data[0].Gateway_id}}).then(function(loc){
 			if(loc.length==0){
 				res(null,{message:"Gateway ID "+data[0].Gateway_id+" tidak ditemukan di semua lokasi"})
 			}
 			else{
 				itemStatus(loc[0],data);
 			}
 		})
 	}
 	var lamp=app.models.lamp;
	var pump=app.models.pump;
	var door=app.models.door;
 	function itemStatus(loc,data){
 		lamp.find({where:{id_location:loc.id}}).then(function(lamp){
 		pump.find({where:{id_location:loc.id}}).then(function(pump){
 		door.find({where:{id_location:loc.id}}).then(function(door){
 			var temp=[];
 			var countItem=function(data,type){
	 			if(data.length!=0){
	 				for(var i in data){
	 					temp.push({
	 						item     : data[i],
	 						channel  : data[i].channel,
	 						io_id    : data[i].io_id,
	 						type     : type,
	 						type_io  : data[i].type_io
	 					})
	 				}
	 			}
	 		}
	 		countItem(lamp,"lamp");countItem(pump,"pump");countItem(door,"door");
	 		if(temp.length==0){
	 			res(null,{message:"Item Lamp or Pump or Door di lokasi "+loc.location_name+" tidak ditemukan"});
	 		}
	 		else{
	 			var used=[];
	 			for(var i in data){
	 				for(var j in temp){
	 					if(data[i].io_id==temp[j].io_id && data[i].Channel==temp[j].channel &&
	 					   data[i].type==temp[j].type_io
	 					){
	 						used.push({item:temp[j].item,io:data[i],type:temp[j].type})
	 					}
	 				}
	 			}
 				if(used.length==0){
 					res(null,{message:"data io_id dan Channel tidak cocok dengan data di item manapun"});
 				}
 				else{
 					serviceDataset(used);
 				}
 			}
 		})/*end lamp*/})/*end pump*/})/*end door*/
 	}

	function serviceDataset(data){
		var serviceLamp=function(id,item,io){
			lamp.replaceById(id,item);
			Io.create(io);
		}
		var servicePump=function(id,item,io){
			pump.replaceById(id,item);
			Io.create(io);
		}
		var serviceDoor=function(id,item,io){
			door.replaceById(id,item);
			Io.create(io);
		}
		var dataSend=[],dataValid=[];
		for(var i in data){
			var id=data[i].item.id;
			data[i].item.id=undefined;
			data[i].item.last_io=data[i].io.value;
			switch(data[i].type){
				case "lamp":
					serviceLamp(id,data[i].item,data[i].io);
				break;

				case "pump":
					servicePump(id,data[i].item,data[i].io);
				break;

				case "door":
					serviceDoor(id,data[i].item,data[i].io);
				break;
			}
			dataValid.push(data[i].io);
			dataSend.push({type:data[i].type,id:id,data:[{label:"last_io",value:data[i].item.last_io}]})
		}
		var socket=Io.app.io;
		socket.emit("item",dataSend);
		res(null,{message:"data yang valid dan sudah tersimpan semua",data:dataValid});
	}
  }


  Io.remoteMethod("save",{
    http    : { path : "/save", verb : "post"},
    accepts : { arg:"data", type : "array"},
    returns : { type : "object", root : true }
  })

};

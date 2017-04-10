'use strict';
var app=require("../../server/server.js");

module.exports = function(Th){
    var app=require("../../server/server.js");
    Th.save=function(Th_id,type,Gateway_id,temp1,temp2,temp3,humidity,date,res){
        var location = app.models.location;
        var temperature     = app.models.temperature;
        if(Gateway_id!=null){
            location.find({where:{id_gateway:Gateway_id}}).then(function(loc){
                if(loc.length!=0 && Th_id!=null){
                    temperature.find({where:{id_location:loc[0].id, th_id:Th_id }}).then(function(cb){
                        if(cb.length!=0){
                            var id=cb[0].id;
                            var socket=Th.app.io;
                                if (cb[0].humidity!=0) {
                                    cb[0].id          = undefined;
                                    cb[0].last_humidity    = humidity/100;
                                    cb[0].last_value  = temp1/100;
                                    cb[0].last_update = date;
                                    temperature.replaceById(id,cb[0]);
                                    socket.emit("item",[{type:"th",id:id,
                                        data:[
                                            {label:"last_value",value:cb[0].last_value},
                                            {label:"last_humidity",value:cb[0].last_humidity}
                                        ]
                                    }])
                                }else{
                                    cb[0].id          = undefined;
                                    cb[0].last_value  = temp1/100;
                                    cb[0].last_update = date;
                                    temperature.replaceById(id,cb[0]);
                                    socket.emit("item",[{type:"tonly",id:id,
                                        data:[{label:"temp",value:cb[0].last_value}]
                                    }])
                                }
                                    Th.create({
                                    Th_id       : Th_id,
                                    type        : type,
                                    Gateway_id  : Gateway_id,
                                    temp1       : temp1,
                                    temp2       : temp2,
                                    temp3       : temp3,
                                    humidity    : humidity,
                                    date        : date
                            }).then(function(th){
                                res(null,th);
                            })
                        }
                    })
                }
            })
        }
      
    }

    Th.remoteMethod("save",{
        http : {path: "/save", verb : "post"},
        accepts : [
            {arg:"Th_id",      type:"number"},
            {arg:"type",       type:"number"},
            {arg:"Gateway_id", type:"number"},
            {arg:"temp1",      type:"number"},
            {arg:"temp2",      type:"number"},
            {arg:"temp3",      type:"number"},
            {arg:"humidity",   type:"number"},
            {arg:"date",       type:"string"}
        ],
        returns : {type : 'object', root:true}
    })
};
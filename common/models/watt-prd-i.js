'use strict';

module.exports = function(Wattprdi) {

    var app=require("../../server/server.js");
    Wattprdi.save=function(Kwh_id,Gateway_id,WattPrdR,WattPrdS,WattPrdT,IR,IS,IT,Channel,date,res){

        validation();
        function validation(){
            var data={
                Kwh_id   : Kwh_id,   Gateway_id : Gateway_id, WattPrdR : WattPrdR,
                WattPrdS : WattPrdS, WattPrdT   : WattPrdT,   IR       : IR,
                IS       : IS,       IT         : IT,         Channel  : Channel
            }
            var valid=0;
            for(var i in data){
                if(data[i]==null){
                    valid++;
                }
            }
            if(valid==0){
                classification();
            }
            else{
                res(null,{message:"Data tidak valid value property tidak boleh ada yang null"});
            }
        }


        function classification(){
            var location=app.models.location;
            var master_panel=app.models.master_panel;
            location.find({where:{id_gateway:Gateway_id}}).then(function(loc){
            master_panel.find({where:{id_gateway:Gateway_id}}).then(function(mstr){
                if(loc.length!=0 && mstr.length!=0){
                    res(null,{
                        message:"ada location dan master panel memiliki id gateway yang sama",
                        location     : loc,
                        master_panel : mstr
                    })
                }
                else if(loc.length!=0 && mstr.length==0){
                    setItemLocation(loc[0].id,loc[0].location_name);
                }
                else if(loc.length==0 && mstr.length!=0){
                    res(null,{type:"master panel"});
                }
                else{
                    res(null,{message:"tidak ditemukan location atau master panel yang memiliki ID Gateway "+Gateway_id});
                }
            })
            })
        }

        var ac  = app.models.ac;
        var chr = app.models.chiller;
        var kwh = app.models.kwh;

        function setItemLocation(id_location,location_name){
            kwh.find({where:{id_location:id_location}}).then(function(kwh){
            ac.find({where:{id_location:id_location}}).then(function(ac){
            chr.find({where:{id_location:id_location}}).then(function(chr){
                if(ac.length==0 && chr.length==0){
                    res(null,{message:"tidak ada equipment AC maupun Chiller yang di install di lokasi "+location_name});
                }
                else{
                    if(Channel==0){
                        serviceToWidget(id_location);
                    }
                    else{
                        validationItem(kwh,ac,chr);
                    }
                }
            })
            })
            })
        }

        function validationItem(kwh,ac,chr){

            var filter=function(data,config){
               var set={};
               for(var i in config){
                    set[config[i]]=data[config[i]];
               }
               return set;
            }

            var combineKwh=function(item,type){
                var column=["id","kwh_id","phasa","channel"],temp=[],set={};
                for(var i in item){
                    for(var j in kwh){
                         if(item[i].id_kwh==kwh[i].id){
                            item[i].kwh_id = kwh[i].kwh_id;
                            set=filter(item[i],column);
                            set.type=type;
                            set.data=item[i];
                            temp.push(set);
                         }
                    }
                }
                return temp;
            }

            var validation=function(item){
                var temp=[];
                for(var i in item){
                    if(item[i].kwh_id==Kwh_id && item[i].channel==Channel){
                        temp.push(item[i]);
                    }
                }
                if(temp.length==0){
                    res(null,{message:"tidak ada item yang memiliki Channel "+Channel+" dan Kwh ID "+Kwh_id});
                }
                else{
                    serviceToItem(temp);
                }
            }

            ac=combineKwh(ac,"ac");
            chr=combineKwh(chr,"chiller");
            var item=[],valid=[];
            item=ac.concat(chr);
            validation(item);
        }

        function serviceToItem(config){
            var set={},id;
            for(var i in config){
                set = config[i].data;
                switch(config[i].phasa){
                    case "R":
                        set.last_value = WattPrdR/1000;
                    break;

                    case "S":
                        set.last_value = WattPrdS/1000;
                    break;

                    case "T":
                        set.last_value = WattPrdT/1000;
                    break;
                }
                id  = set.id;
                set.id = undefined;
                switch(config[i].type){
                    case "ac":
                        app.models.ac.replaceById(id,set);
                    break;

                    case "chiller":
                        app.models.chiller.replaceById(id,set);
                    break;
                }
            }
            Wattprdi.create({
                Kwh_id   : Kwh_id,   Gateway_id : Gateway_id, WattPrdR : WattPrdR,
                WattPrdS : WattPrdS, WattPrdT   : WattPrdT,   IR       : IR,
                IS       : IS,       IT         : IT,         Channel  : Channel
            }).then(function(cb){
                res(null,cb);
                var socket=Wattprdi.app.io;
                cb.WattPrdR /= 1000;
                cb.WattPrdS /= 1000;
                cb.WattPrdT /= 1000;
                socket.emit("item",[{type:"widget",data:cb}]);
            });
        }


        var widget=app.models.widget;
        function serviceToWidget(id_location){
            widget.find({where:{id_location:id_location}}).then(function(wgt){
                if(wgt.length==0){
                    var prop={
                        id_location : id_location,
                        total : (WattPrdR/1000)+(WattPrdS/1000)+(WattPrdT/1000)
                    }
                    widget.create(prop);
                }
                else{
                    var id=wgt[0].id;
                    wgt[0].id=undefined;
                    wgt[0].total=(WattPrdR/1000)+(WattPrdS/1000)+(WattPrdT/1000);
                    widget.replaceById(id,wgt[0]);
                }
            })
            Wattprdi.create({
                Kwh_id   : Kwh_id,   Gateway_id : Gateway_id, WattPrdR : WattPrdR,
                WattPrdS : WattPrdS, WattPrdT   : WattPrdT,   IR       : IR,
                IS       : IS,       IT         : IT,         Channel  : Channel
            }).then(function(cb){
                res(null,cb);
                var socket=Wattprdi.app.io;
                cb.WattPrdR /= 1000;
                cb.WattPrdS /= 1000;
                cb.WattPrdT /= 1000;
                socket.emit("item",[{type:"widget",data:cb}]);
            });
        }

    }

    Wattprdi.remoteMethod("save",{
        http : {path : "/save", verb:"post"},
        accepts : [
            {arg : "Kwh_id",      type : "number"},
            {arg : "Gateway_id",  type : "number"},
            {arg : "WattPrdR",    type : "number"},
            {arg : "WattPrdS",    type : "number"},
            {arg : "WattPrdT",    type : "number"},
            {arg : "IR",          type : "number"},
            {arg : "IS",          type : "number"},
            {arg : "IT",          type : "number"},
            {arg : "Channel",     type : "number"},
            {arg : "date",        type : "string"}
        ],
        returns : {type : "object", root:true }
    });

};

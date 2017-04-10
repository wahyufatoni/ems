'use strict';
var app=require("../../server/server.js");
module.exports = function(Watthour) {

  Watthour.save=function(data,res){
      
      validation();
      function validation(){
          var prop=["Kwh_id","Gateway_id","Rwh","Swh","Twh","Rvarh","Svarh","Tvarh","Channel"];
          var temp=[],valid;
          var uniqueChannel=function(set){
              var temp=[],valid;
              for(var i in set){
                  if(i==0){
                     temp.push(set[i])
                  }
                  else{
                     valid=0;
                     for(var j in temp){
                        if(set[i].Channel==temp[j].Channel){
                           valid++;
                        }
                     }
                     if(valid==0){
                        temp.push(set[i]);
                     }
                  }
              }
              return temp;
          }
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
              res(null,{message:"semua data tidak valid",data:data});
          }
          else{
              data=uniqueChannel(temp);
              validationGateway();
          }
      }


      function validationGateway(temp){
          var gateway=data[0].Gateway_id; 
          var location=app.models.location;
          location.find({where:{id_gateway:gateway}}).then(function(loc){
               if(loc.length==0){
                    res(null,{message:"tidak ada location yang memiliki ID Gateway "+gateway});        
               }
               else{
                    validationItem(loc[0]);
               }
          })
      }


      function validationItem(loc){
          var ac=app.models.ac;
          var chr=app.models.chiller;
          var kwh=app.models.kwh;
          var combineItem=function(ac,chr,kwh){
              for(var i in ac){
                 ac[i].type = "ac";
              }
              for(var i in chr){
                 chr[i].type = "chiller";
              }
              var temp=ac.concat(chr);
              var cb=[],set={};
              for(var i in temp){
                  set={id:temp[i].id,phasa:temp[i].phasa,channel:temp[i].channel,type:temp[i].type};
                  for(var j in kwh){
                     if(kwh[j].id == temp[i].id_kwh){
                        set.kwh_id = kwh[j].kwh_id;
                     }
                  }
                  cb.push(set);
              }
              return cb;
          }
          
          ac.find({where:{id_location:loc.id}}).then(function(ac){
          chr.find({where:{id_location:loc.id}}).then(function(chr){
          kwh.find({where:{id_location:loc.id}}).then(function(kwh){
              if(ac.length==0 && chr.length==0){
                  res(null,{message:"tidak ada ada AC atau Chiller di lokasi "+loc.location_name});
              }
              else {
                  var item=combineItem(ac,chr,kwh);
                  var kwhId=[];
                  for(var i in kwh){
                     kwhId.push(kwh[i].kwh_id);
                  }
                  validationKwh(item,loc,kwhId);
              }
          })
          })   
          })
      }


      function validationKwh(item,loc,kwh){
          var temp=[],total,valid=[];
          for(var i in data){
             for(var j in kwh){
                if(kwh[j]==data[i].Kwh_id){
                    valid.push(data[i]);
                }
             }
          }
          if(valid.length==0){
             res(null,{message:"KWH tak terdefinisi atau belum terinstall"})
          }
          else {
                for(var i in item){
                    data = valid;
                    for(var j in data){
                        if(data[j].Channel==0){
                            total=data[j].Rwh+data[j].Swh+data[j].Twh;
                        }
                        else{
                            if(
                              item[i].kwh_id == data[j].Kwh_id && 
                              item[i].channel == data[j].Channel
                            ){
                              switch(item[i].phasa){
                                 case "R":
                                    item[i].value = data[j].Rwh;
                                 break;
                                 case "S":
                                    item[i].value = data[j].Swh;
                                 break;
                                 case "T":
                                    item[i].value = data[j].Twh;
                                 break; 
                              }
                              temp.push(item[i]);
                            }
                        }
                    }
                }
                if(temp.length!=0 && total!=undefined){
                    var last_wh=app.models.last_wh;
                    last_wh.find({where:{Gateway_id:loc.id_gateway}}).then(function(last){        
                        serviceToTotalDate(total,temp,loc,last);
                    })
                }
                lastWH();
          }
      }







      /* ***** FUNCTION  FOR UPDATE DATA LAST WH AND CREATE DATA WATTHOUR *****************/ 

      function lastWH(){
          var last_wh=app.models.last_wh,runServiceToTotalDate=0;
          var service=function(temp){
              var id;
              last_wh.find({where:{
                  Gateway_id : temp.Gateway_id,
                  Channel    : temp.Channel,
                  Kwh_id     : temp.Kwh_id
              }})
              .then(function(cb){
                  if(cb.length==0){
                      last_wh.create(temp);
                  }
                  else {
                      id=cb[0].id;
                      cb[0].id=undefined;
                      cb[0].Rwh = temp.Rwh;
                      cb[0].Swh = temp.Swh;
                      cb[0].Twh = temp.Twh;
                      last_wh.replaceById(id,cb[0]);
                  } 
                  
              })
          }
          var prop=["Channel","Kwh_id","Gateway_id","Rwh","Swh","Twh"],set={};
          var test=[];
          for(var i in data){
              set={};
              for(var j in prop){
                  set[prop[j]]=data[i][prop[j]];
              }
              service(set);
          }
          serviceToWatthour();
      } 



      function serviceToWatthour(){
          for(var i in data){
             Watthour.create(data[i]);
          }
          res(null,{message:"success insert all data",data:data});
      }

      /* ***** END FUNCTION  FOR UPDATE DATA LAST WH AND CREATE DATA WATTHOUR *****************/ 
















      /*************  fungsi khusus untuk total_date dan total_month dig u/ chart total ***************/
      function serviceToTotalDate(total,item,loc,last){
            var total_date = app.models.total_date;
            var last_wh    = app.models.last_wh;
            var all        = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            var now        = new Date().toString();
            var date       = now.substr(8,2); date=parseInt(date);
            var month      = now.substr(4,3);
            for(var i=0;i<all.length;i++){
                if(all[i] == month){
                    month = i+1;
                }
            }
            var generate=function(item,total){
                var set={},ac=0,chiller=0;
                for(var i in item){
                   switch(item[i].type){
                      case "ac":
                          ac += item[i].value;
                      break;
                      case "chiller":
                          chiller += item[i].value;
                      break;
                   }
                }
                set = {total:total, ac:ac, chiller:chiller, id_location:loc.id, date:date, month:month};
                return set;
            }
            var service=function(){
               total_date.find({where:{id_location:loc.id,date:date}}).then(function(total){
                    if(total.length==0){
                        total_date.create(item).then(function(cb){
                            serviceToTotalMonth(cb,loc);
                        });
                    }
                    else{
                        var id=total[0].id;
                        total[0].id = undefined;
                        total[0].last_update = undefined;
                        total[0].month = month;
                        total[0].total   += item.total;
                        total[0].ac      += item.ac;
                        total[0].chiller += item.chiller;
                        total_date.replaceById(id,total[0]);
                        //send new data total_date for total_month
                        total[0].id = id;  
                        serviceToTotalMonth(total[0],loc);
                    }
               })
            }

          if(last.length!=0){
              var total_last;
              var differencial=function(watt){
                  for(var i in item){
                     if(item[i].channel == watt.Channel){
                        switch(item[i].phasa){
                           case "R":
                              item[i].value -= watt.Rwh;
                           break;
                           case "S":
                              item[i].value -= watt.Swh;
                           break;
                           case "T":
                              item[i].value -= watt.Rwh;
                           break;
                        }
                        item[i].value /= 1000;
                     }
                  }
              }
              for(var i in last){
                 if(last[i].Channel==0){
                    total_last=last[i].Rwh+last[i].Twh+last[i].Swh;
                    total  -= total_last;
                    total  /= 1000;
                 }
                 else {
                    differencial(last[i]);
                 }
              }
              item=generate(item,total);
              service();
          }
      }



      function serviceToTotalMonth(last_date,loc){
          var temp       = app.models.total_date;
          var total      = app.models.total_month; 
          var now        = new Date().toString();
          var year       = now.substr(11,4);  year=parseInt(year);
          var all        = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];          
          var month      = now.substr(4,3);
          for(var i=0;i<all.length;i++){
              if(all[i] == month){
                  month = i+1;
              }
          }
          var service=function(set){
              total.find({where:{id_location:loc.id,month:month}})
              .then(function(cb){
                  if(cb.length==0){
                      total.create(set);
                  }
                  else {
                      var id=cb[0].id;
                      total.replaceById(id,set);
                  }
              })
          }
          temp.find({where:{id_location:loc.id}}).then(function(cb){
              var set={ac:0,chiller:0,total:0,id_location:loc.id,year:year,month:month};
              if(cb.length!=0){
                  for(var i in cb){
                      if(cb[i].id==last_date.id){
                         cb[i] = last_date;
                      }
                      set.ac += cb[i].ac;
                      set.chiller += cb[i].chiller;
                      set.total += cb[i].total;
                  }
                  service(set);
              }
          })
      }
      /********* end  fungsi khusus untuk total_date dan total_month dig u/ chart total ***************/




  } 

  Watthour.remoteMethod("save",{
    http    : { path : "/save", verb : "post"},
    accepts : { arg:"data", type : "array"},
    returns : { type : "object", root : true }
  })                        

};

app.service("history",function(Employee, $q, rest, $localStorage){
    this.get=function(){
        var usr,log,link;
        usr=Employee.getCurrent().$promise.then(function(usr){
            log=$localStorage.log;
            if(usr.role!="superadmin"){
                usr.id = usr.id_employee;
            }
            return {loc : log , usr : usr, link : link };
        }).catch(function(error){
            return { usr : false };
        });
        return usr;
    }

    this.post=function(data){
        $localStorage.log=data;
    }

    this.getChart=function(){
        var chart=$localStorage.chart;
        if(chart==undefined){
            $localStorage.chart=[];
        }
        return $localStorage.chart
    }

    this.postChart=function(start,end,gateway,data){
        var chart=$localStorage.chart;
        if(chart.length!=0){
            var valid=0;
            var index=[];
            for (var i = 0; i < chart.length; i++) {
                if(chart[i].gateway==gateway && chart[i].start && chart[i].end==end){
                    valid++;
                    index.push(i);
                }
            }
            if(valid==0){
                chart.push({gateway:gateway,start:start,end:end,data:data});
                $localStorage.chart=chart;
            }
            else{
                for (var i = 0; i < index.length; i++) {
                    chart.splice(index[i],1);
                }
                chart.push({gateway:gateway,start:start,end:end,data:data});
                $localStorage.chart=chart;
            }
        }
        else{
            chart.push({gateway:gateway,start:start,end:end,data:data});
            $localStorage.chart=chart;
        }
    }

    this.active=function(){
        this.get().then(function(log){
            $localStorage.logLocation = log.loc;
            $q.all([
                rest.service({model:"temperature",action:"read",filter:{where:{id_location:log.loc.id}}}),
                rest.service({model:"ac",action:"read",filter:{where:{id_location:log.loc.id}}}),
                rest.service({model:"chiller",action:"read",filter:{where:{id_location:log.loc.id}}}),
                rest.service({model:"kwh",action:"read",filter:{where:{id_location:log.loc.id}}}),
                rest.service({model:"total",action:"read",filter:{where:{id_location:log.loc.id,date_one:0}}}),
            ]).then(function(res){
                $localStorage.book=res;
            })
        })
    }

    this.getBook=function(){
        var data=$localStorage.book;
        var log=$localStorage.logLocation;
        var book = {log:log,temperature : data[0],ac:data[1],chiller:data[2],kwh:data[3],total:data[4]}
        return book;
    }

})

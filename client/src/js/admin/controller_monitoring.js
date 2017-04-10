app.controller("controller_monitoring", function(
    $scope,
    $rootScope,
    $interval,
    $filter,
    $q,
    history,
    rest,
    $state,
    $timeout,
    $socket
){

    function response(){
        $scope.change=function(res,data,link){
            if(data.length!=0){
                for(var i in data){
                    if(data[i][link]==res.id){
                        for(var j in res.data){
                            if(res.type=="pump"){
                                data[i].status = res.data[j].value;
                            }
                            data[i][res.data[j].label]=res.data[j].value;
                        }
                    }
                }
            }
        }
        var lib={
            lamp: {type:"change", link:"id",data: $scope.lamps,active:function(){$scope.getLampAlarm()}},
            th  : {type:"change", link:"id",data: $scope.temperatures,active:function(){
                $scope.getRatio(); $scope.widgetTHService();
            }},
            tonly : {type:"change",link:"id_temp", data:$scope.acs, active:function(){
                $scope.widgetTHService(); $scope.renderAc();
            }},
            pump : {type:"timer", link:"id", data:$scope.pumps}
        }
        $scope.timer=function(res){
            var redirectTimeout;
            $timeout.cancel(redirectTimeout);
            redirectTimeout = $timeout(function(){
                if(res.last_io==1){
                    res.status=404;
                    //tinggal ini dikasih ngirim alarm aja ke table alarms
                }
            },res.max_threshold);
        }

        $scope.responseItem=function(res){
            if(res.type!="widget"){
                switch(lib[res.type].type){
                    case "change":
                        $scope.change(res,lib[res.type].data,lib[res.type].link);
                    break;

                    case "timer":
                        $scope.change(res,lib[res.type].data,lib[res.type].link);
                        var data=lib[res.type].data;
                        for(var i in data){
                            if(data[i].last_io==1){
                                $scope.timer(data[i]);
                            }
                        }
                    break;
                }
                if(lib[res.type].active!=undefined){
                    lib[res.type].active();
                }
            }
            else{
                $scope.changeWidget(res.data);
            }
        }
    }
    $socket.on("item",function(res){
      console.log(res);
        for(var i in res){
            $scope.responseItem(res[i]);
        }
    })


    history.get().then(function(log) {
        if (log.loc == undefined) {
            $state.go("access.signin");
        }
    })

    function getData() {
        history.active();
        var a = history.getBook();
        this.temp = a.temperature;
        this.ac = a.ac;
        this.kwh = a.kwh;
        this.chiller = a.chiller;
        this.log = a.log;
        this.total = a.total;
    }
    chartLine()

    function chartLine() {
        $scope.search = function() {
            $scope.dataChart = undefined;
            var start = $filter('date')(new Date($scope.date.startDate), "yyyy-MM-dd") + " 00:00:00";
            var end = $filter('date')(new Date($scope.date.endDate), "yyyy-MM-dd") + " 23:59:59";
            history.get().then(function(log){
                rest.chart({
                    start: start,
                    end: end,
                    gateway: log.loc.id_gateway
                }).then(function(res) {
                    $scope.dataChart = res;
                    $scope.backup    = angular.copy(res);
                    $scope.selectType();
                })
            })
        }

        $scope.selectType = function() {
            var data = $scope.backup;
            var temp = [];
            if ($scope.value_typeItem != "all") {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].model == $scope.value_typeItem) {
                        temp.push(data[i]);
                    }
                }
                $scope.dataChart = temp;
            } else {
                $scope.dataChart = $scope.backup;
            }
        }
        $scope.value_typeItem = "all";
        $scope.typeItem = [{
                value: "all",
                label: "All Type"
            },
            {
                value: "temperature",
                label: "Temperature & Humidity"
            },
            {
                value: "ac",
                label: "AC Split"
            },
            {
                value: "chiller",
                label: "Chiller"
            }
        ];
        $scope.date = {
            startDate: moment().subtract(1, "days"),
            endDate: moment()
        };
        $scope.date.startDate = $filter('date')(new Date(), "yyyy-MM-dd");
        $scope.date.endDate = $filter('date')(new Date(), "yyyy-MM-dd");
        $scope.search();
        $scope.$watch('date', function(newDate) {
            $scope.search();
        }, false);
    }

    chartTotal();

    function chartTotal() {
        var a = new getData();
        res = a.total;
        $scope.dataTotal = [{
            name: 'AC',
            data: []
        }, {
            name: 'Chiller',
            data: []
        }, {
            name: 'Other',
            data: []
        }]
        for (var i = 1; i <= 12; i++) {
            var valid = 0;
            var temp = {};
            for (var j = 0; j < res.length; j++) {
                if (res[j].month == i) {
                    valid++;
                    temp = res[j];
                }
            }
            if (valid == 0) {
                $scope.dataTotal[0].data.push(0);
                $scope.dataTotal[1].data.push(0);
                $scope.dataTotal[2].data.push(0);
            } else {
                var other = temp.total - (temp.ac + temp.chiller);
                $scope.dataTotal[0].data.push(temp.ac);
                $scope.dataTotal[1].data.push(temp.chiller);
                $scope.dataTotal[2].data.push(other);
            }
        }
    }
    //end modul chart total

    itemLamp();

    function itemLamp() {
        history.get().then(function(log) {
            $q.all([
                    rest.service({
                        action: "read",
                        model: "lamp",
                        filter: {
                            where: {
                                id_location: log.loc.id
                            }
                        }
                    })
                ])
                .then(function(res) {

                    var lamp = res[0];
                    $scope.parseIntTime = function(value) {
                        var time = {
                            hour: parseInt(value.substr(0, 2)),
                            minute: parseInt(value.substr(3, 2))
                        }
                        return (time.hour * 60) + time.minute;
                    }

                    for (var i = 0; i < lamp.length; i++) {
                        lamp[i].start = $scope.parseIntTime(lamp[i].start_operation);
                        lamp[i].end = $scope.parseIntTime(lamp[i].end_operation);
                    }

                    $scope.serviceToAlarmLamp = function(data, type) {
                        rest.service({
                                action: "read",
                                model: "alarm",
                                filter: {
                                    where: {
                                        id_location: log.loc.id,
                                        type: type
                                    }
                                }
                            })
                            .then(function(alarm) {
                                var create = function() {
                                    var temp = {
                                        id_item: data.id,
                                        type: type,
                                        start_date: $filter("date")(new Date(), "yyyy-MM-dd hh:mm:ss"),
                                        end_date: null,
                                        count: 0,
                                        status: 0,
                                        id_location: log.loc.id
                                    }
                                    rest.service({
                                        action: "create",
                                        model: "alarm",
                                        data: temp
                                    });
                                }
                                if (alarm.length == 0) {
                                    create();
                                } else {
                                    var valid = 0;
                                    for (var i = 0; i < alarm.length; i++) {
                                        if (alarm[i].id_item == data.id) {
                                            valid++;
                                            alarm[i].count++;
                                            rest.service({
                                                action: "update",
                                                model: "alarm",
                                                data: alarm[i]
                                            });
                                        }
                                    }
                                    if (valid == 0) {
                                        create();
                                    }

                                }
                            })
                    }
                    $scope.getLampAlarm = function() {
                        var now = new Date().toString();
                        now = now.substr(16, 5);
                        now = $scope.parseIntTime(now);
                        for (var i = 0; i < lamp.length; i++) {
                            if (now > lamp[i].end || now < lamp[i].start) {
                                if (lamp[i].last_io == 1) {
                                    lamp[i].last_io = 404;
                                    $scope.serviceToAlarmLamp(lamp[i], "lamp");
                                }
                            }
                        }
                    }
                    $scope.lamps = lamp;
                    response();
                    $scope.getLampAlarm();
                })
        });
    }
    //end function item IO

    area();

    function area() {
        history.get().then(function(log) {
            $q.all([
                rest.service({
                    action: "read",
                    model: "ac",
                    filter: {
                        where: {
                            id_location: log.loc.id
                        }
                    }
                }),
                rest.service({
                    action: "read",
                    model: "building",
                    filter: {
                        where: {
                            id_location: log.loc.id
                        }
                    }
                }),
                rest.service({
                    action: "read",
                    model: "temperature",
                    filter: {
                        where: {
                            id_location: log.loc.id
                        }
                    }
                }),
                rest.service({
                    action: "read",
                    model: "infrared",
                    filter: {
                        where: {
                            id_location: log.loc.id
                        }
                    }
                })
            ]).then(function(res) {
                var acs = res[0];
                $scope.buildings = res[1];
                var temperature = res[2];
                var infrared = res[3];
                var status = [{
                    clas: "ac-top-info"
                }, {
                    clas: "ac-right-info"
                }, {
                    clas: "ac-bottom-info"
                }, {
                    clas: "ac-left-info"
                }, {
                    clas: "ac-top-danger"
                }, {
                    clas: "ac-right-danger"
                }, {
                    clas: "ac-bottom-danger"
                }, {
                    clas: "ac-left-danger"
                }, {
                    clas: "ac-top-off"
                }, {
                    clas: "ac-right-off"
                }, {
                    clas: "ac-bottom-off"
                }, {
                    clas: "ac-left-off"
                }];

                // get data ac
                $scope.getAc = function() {

                    $scope.parseIntTime = function(value) {
                        if(value!=null){
                            var time = {
                                hour: parseInt(value.substr(0, 2)),
                                minute: parseInt(value.substr(3, 2))
                            }
                            return (time.hour * 60) + time.minute;
                        }
                    }

                    for (var i = 0; i < acs.length; i++) {
                        acs[i].start = $scope.parseIntTime(acs[i].start_operation);
                        acs[i].end = $scope.parseIntTime(acs[i].end_operation);
                    }

                    $scope.serviceToAlarmAc = function(data, type) {
                        rest.service({
                                action: "read",
                                model: "alarm",
                                filter: {
                                    where: {
                                        id_location: log.loc.id
                                    }
                                }
                            })
                            .then(function(alarm) {
                                var create = function() {
                                    var temp = {
                                        id_item: data.id,
                                        type: type,
                                        start_date: $filter("date")(new Date(), "yyyy-MM-dd hh:mm:ss"),
                                        end_date: null,
                                        count: 0,
                                        status: 0,
                                        id_location: log.loc.id
                                    }
                                    rest.service({
                                        action: "create",
                                        model: "alarm",
                                        data: temp
                                    });
                                }
                                if (alarm.length == 0) {
                                    create();
                                } else {
                                    var valid = 0;
                                    for (var i = 0; i < alarm.length; i++) {
                                        if (alarm[i].id_item == data.id) {
                                            valid++;
                                            alarm[i].count++;
                                            rest.service({
                                                action: "update",
                                                model: "alarm",
                                                data: alarm[i]
                                            });
                                        }
                                    }
                                    if (valid == 0) {
                                        create();
                                    }
                                }
                            })
                    }

                    $scope.getAcAlarm = function() {
                        var now = new Date().toString();
                        now = now.substr(16, 5);
                        now = $scope.parseIntTime(now);
                        for (var i = 0; i < acs.length; i++) {
                            if (
                                acs[i].styles == "ac-top" ||
                                acs[i].styles == "ac-right" ||
                                acs[i].styles == "ac-bottom" ||
                                acs[i].styles == "ac-left"
                            ) {
                                for (var j = 0; j < temperature.length; j++) {
                                    if (acs[i].id_temp == temperature[j].id && temperature[j].humidity == 0) {
                                        acs[i].temp = temperature[j].last_value;
                                    }
                                }
                                for (var j = 0; j < infrared.length; j++) {
                                    if (acs[i].id_ir == infrared[j].id) {
                                        acs[i].infra = infrared[j].set_default;
                                        acs[i].max_difference = infrared[j].max_difference;
                                    }
                                }
                                var totTemp = [];
                                switch (acs[i].styles) {
                                    case "ac-top":
                                        if (totTemp = acs[i].temp - acs[i].infra) {
                                          if (totTemp < acs[i].max_difference) {
                                              acs[i].classes = status[0].clas; //success
                                          } else {
                                              acs[i].classes = status[4].clas; //danger
                                              $scope.serviceToAlarmAc($scope.acs[i], "ac");
                                          }
                                        }
                                        break;

                                    case "ac-right":
                                        if (totTemp = acs[i].temp - acs[i].infra) {
                                          if (totTemp < acs[i].max_difference) {
                                              acs[i].classes = status[1].clas; //success
                                          } else {
                                              acs[i].classes = status[5].clas; //danger
                                              $scope.serviceToAlarmAc($scope.acs[i], "ac");
                                          }
                                        }
                                        break;

                                    case "ac-bottom":
                                        if (totTemp = acs[i].temp - acs[i].infra) {
                                          if (totTemp < acs[i].max_difference) {
                                              acs[i].classes = status[2].clas; //success
                                          } else {
                                              acs[i].classes = status[6].clas; //danger
                                              $scope.serviceToAlarmAc($scope.acs[i], "ac");
                                          }
                                        }
                                        break;

                                    case "ac-left":
                                        if (totTemp = acs[i].temp - acs[i].infra) {
                                          if (totTemp < acs[i].max_difference) {
                                              acs[i].classes = status[3].clas; //success
                                          } else {
                                              acs[i].classes = status[7].clas; //danger
                                              $scope.serviceToAlarmAc($scope.acs[i], "ac");
                                          }
                                        }
                                        break;
                                }
                            }
                            if (now > acs[i].end || now < acs[i].start) {
                                switch (acs[i].styles) {
                                    case "ac-top":
                                        acs[i].classes = status[8].clas;
                                        break;
                                    case "ac-right":
                                        acs[i].classes = status[9].clas;
                                        break;
                                    case "ac-bottom":
                                        acs[i].classes = status[10].clas;
                                        break;
                                    case "ac-left":
                                        acs[i].classes = status[11].clas;
                                        break;
                                }
                            }
                        }
                    }
                    $scope.getAcAlarm();
                }
                $scope.acs = acs;
                response();
                $scope.getAc();
                $scope.renderAc=function(){
                    for(var i in temperature){
                        for(var j in $scope.acs){
                            if($scope.acs[j].id_temp==temperature[i].th_id){
                                temperature[i].last_value=$scope.acs[j].temp;
                            }
                        }
                    }
                    $scope.getAc();
                }
                $scope.serviceToAlarmPump = function(data, type) {
                    rest.service({
                            action: "read",
                            model: "alarm",
                            filter: {
                                where: {
                                    id_location: log.loc.id
                                }
                            }
                        })
                        .then(function(alarm) {
                            var create = function() {
                                var temp = {
                                    id_item: data.id,
                                    type: type,
                                    start_date: $filter("date")(new Date(), "yyyy-MM-dd hh:mm:ss"),
                                    end_date: null,
                                    count: 0,
                                    status: 0,
                                    id_location: log.loc.id
                                }
                                rest.service({
                                    action: "create",
                                    model: "alarm",
                                    data: temp
                                });
                            }
                            if (alarm.length == 0) {
                                create();
                            } else {
                                var valid = 0;
                                for (var i = 0; i < alarm.length; i++) {
                                    if (alarm[i].id_item == data.id && alarm[i].type == type) {
                                        valid++;
                                        alarm[i].count++;
                                        rest.service({
                                            action: "update",
                                            model: "alarm",
                                            data: alarm[i]
                                        });
                                    }
                                }
                                if (valid == 0) {
                                    create();
                                }
                            }
                        })
                }

                $scope.getPump = function() {
                    rest.service({
                        action: "read",
                        model: "pump",
                        filter: {
                            where: {
                                id_location: log.loc.id
                            }
                        }
                    })
                    .then(function(res) {
                        $scope.pumps = res;
                        response();
                        for (var i = 0; i < $scope.pumps.length; i++) {
                            $scope.pumps[i].status = $scope.pumps[i].last_io;
                        }
                    })
                }
                $scope.getPump();

                $scope.getDoor = function() {
                    rest.service({
                            action: 'read',
                            model: 'door',
                            filter: {
                                where: {
                                    id_location: log.loc.id
                                }
                            }
                        })
                        .then(function(res) {
                            var doors = res;
                            for (var i = 0; i < doors.length; i++) {
                                if (doors[i].styles == 'door2_bottom' ||
                                    doors[i].styles == 'door2_top' ||
                                    doors[i].styles == 'door2_right' ||
                                    doors[i].styles == 'door2_left'
                                ) {
                                    for (var i = 0; i < doors.length; i++) {
                                        doors[i].status = 0;
                                    }
                                }
                            }
                            $scope.serviceToAlarmDoor = function(data, type) {
                                rest.service({
                                        action: "read",
                                        model: "alarm",
                                        filter: {
                                            where: {
                                                id_location: log.loc.id
                                            }
                                        }
                                    })
                                    .then(function(alarm) {
                                        var create = function() {
                                            var temp = {
                                                id_item: data.id,
                                                type: type,
                                                start_date: $filter("date")(new Date(), "yyyy-MM-dd hh:mm:ss"),
                                                end_date: null,
                                                count: 0,
                                                status: 0,
                                                id_location: log.loc.id
                                            }
                                            rest.service({
                                                action: "create",
                                                model: "alarm",
                                                data: temp
                                            });
                                        }
                                        if (alarm.length == 0) {
                                            create();
                                        } else {
                                            var valid = 0;
                                            for (var i = 0; i < alarm.length; i++) {
                                                if (alarm[i].id_item == data.id && alarm[i].type == type) {
                                                    valid++;
                                                    alarm[i].count++;
                                                    rest.service({
                                                        action: "update",
                                                        model: "alarm",
                                                        data: alarm[i]
                                                    });
                                                }
                                            }
                                            if (valid == 0) {
                                                create();
                                            }
                                        }
                                    })
                            }

                            $scope.getDoorAlarm = function() {
                                for (var i = 0; i < doors.length; i++) {
                                    switch (doors[i].styles) {
                                        case "door2_bottom":
                                            var time;
                                            if (doors[i].last_io != 0) {
                                                var status = doors[i];
                                                time = $timeout(function() {
                                                    $scope.serviceToAlarmDoor(status, "door");
                                                }, doors[i].max_threshold)

                                            } else {
                                                $timeout.cancel(time);
                                            }
                                            break;
                                        case "door2_top":
                                            var time;
                                            if (doors[i].last_io != 0) {
                                                var status = doors[i];
                                                time = $timeout(function() {
                                                    $scope.serviceToAlarmDoor(status, "door");
                                                }, doors[i].max_threshold)
                                            } else {
                                                $timeout.cancel(time);
                                            }
                                            break;
                                        case "door2_right":
                                            var time;
                                            if (doors[i].last_io != 0) {
                                                var status = doors[i];
                                                time = $timeout(function() {
                                                    $scope.serviceToAlarmDoor(status, "door");
                                                }, doors[i].max_threshold)
                                            } else {
                                                $timeout.cancel(time);
                                            }
                                            break;
                                        case "door2_left":
                                            var time;
                                            if (doors[i].last_io != 0) {
                                                var status = doors[i];
                                                time = $timeout(function() {
                                                    $scope.serviceToAlarmDoor(status, "door");
                                                }, doors[i].max_threshold)
                                            } else {
                                                $timeout.cancel(time);
                                            }
                                            break;
                                    }
                                }
                            }
                            $scope.door = doors;
                            response();
                            $scope.getDoorAlarm();

                        })
                }
                $scope.getDoor();



                $scope.parseDate = function(value) {
                    if (typeof Object.value == "date") {
                        var date = value.substr(8, 2);
                        var year = value.substr(11, 4);
                        var mount = value.substr(3, 4);
                        var hour = value.substr(16, 2);
                        var minute = value.substr(14, 2);
                        var myDate = date + "/" + mount + "/" + year + " " + hour + ":" + minute;
                        value = myDate;
                    }
                    return value;
                };

                $scope.getTH = function() {
                    rest.service({
                            action: "read",
                            model: "temperature",
                            filter: {
                                where: {
                                    id_location: log.loc.id
                                }
                            }
                        })
                        .then(function(th) {
                            $scope.temperatures = th;
                            response();
                            $scope.getRatio=function(){
                                for (var i = 0; i < $scope.temperatures.length; i++) {
                                    if (
                                        $scope.temperatures[i].humidity == 0 ||
                                        $scope.temperatures[i].humidity == 1
                                    ) {
                                        if ($scope.temperatures[i].last_value == null) {
                                            $scope.temperatures[i].last_value = 0;
                                            $scope.temperatures[i].last_update = $scope.parseDate("Dont Connect");
                                        }
                                        $scope.temperatures[i].last_update = $scope.parseDate($scope.temperatures[i].last_update);
                                        $scope.temperatures[i].ratio = ($scope.temperatures[i].last_value / $scope.temperatures[i].threshold) * 100;
                                    }
                                }
                            }
                            $scope.getRatio();
                        })
                }
                $scope.getTH();

                $scope.th = [{
                    lineWidth: 5,
                    trackColor: '#adadad',
                    barColor: function(percent) {
                        return (percent < 70 ? '#5cb85c' : percent < 90 ? '#f0ad4e' : '#cb3935');
                    },
                    scaleColor: null,
                    size: 40,
                    lineCap: 'butt',
                    animate: 1000
                }, {
                    lineWidth: 5,
                    trackColor: '#adadad',
                    barColor: function(percent) {
                        return (percent < 70 ? '#5cb85c' : percent < 90 ? '#f0ad4e' : '#cb3935');
                    },
                    scaleColor: null,
                    size: 50,
                    lineCap: 'butt',
                    animate: 1000
                }];
                dragnDrop();
            })
        })
    }
    //end item

    function dragnDrop() {
        $scope.dragndrop = "false";
        $scope.id = "";
        $scope.canvas = "";
        $scope.items = "";
        $scope.edit = function(type) {
            $scope.canvas = type;
            $scope.dragndrop = "true";
            for (var i = 0; i < $scope.temperatures.length; i++) {
                if ($scope.temperatures[i].humidity == 1) {
                    $scope.tempTh = $scope.temperatures[i];
                }
            }
            switch (type) {
                case "building":
                    $scope.acs = [];
                    $scope.temperatures = [];
                    $scope.pumps = [];
                    $scope.door = [];
                    $scope.building = $scope.buildings;
                    break;

                case "item":
                    $scope.buildings = [];

                    $scope.items = function(typeItem) {
                        $scope.typeItems = typeItem;
                        switch (typeItem) {
                            case "temperature":
                                $scope.temperature = $scope.tempTh;
                                break;

                            case "door":
                                $scope.doors = $scope.door;
                                break;

                            case "ac":
                                $scope.ac = $scope.acs;
                                break;

                            case "pump":
                                $scope.pump = $scope.pumps;
                                break;
                        }
                    }
                    break;
            }
        }

        $scope.set = function(styles) {
            history.get().then(function(data) {
                var temp = {
                    id_location: data.loc.id,
                    position_left: "1%",
                    position_top: 20,
                    styles: styles
                }
                rest.service({
                    action: "create",
                    model: "building",
                    data: temp
                });
            })

            $scope.buildings.push({
                id: $scope.buildings.length + 1,
                top: "1%",
                left: 20,
                styles: styles

            })
        }

        $scope.startCallback = function(event, ui, title) {
            $scope.id = title.id;
        };

        $scope.dropCallback = function(event, ui) {
            var width, top, left, min, left;
            width = document.getElementById('container').offsetWidth;
            top = ui.position.top;
            left = ui.position.left;
            left = (left / width) * 100;
            min = (left * 5.5) / 100;
            left = left - min;
            left = left + "%";

            switch ($scope.canvas) {
                case "building":
                    for (var i = 0; i < $scope.building.length; i++) {
                        if ($scope.building[i].id == $scope.id) {
                            $scope.building[i].position_top = top;
                            $scope.building[i].position_left = left;
                        }
                    }
                    break;

                case "item":
                    switch ($scope.typeItems) {
                        case "temperature":
                            for (var i = 0; i < $scope.temperature.length; i++) {
                                if ($scope.temperature[i].id == $scope.id) {
                                    $scope.temperature[i].position_top = top;
                                    $scope.temperature[i].position_left = left;
                                }
                            }
                            break;

                        case "door":
                            for (var i = 0; i < $scope.doors.length; i++) {
                                if ($scope.doors[i].id == $scope.id) {
                                    $scope.doors[i].position_top = top;
                                    $scope.doors[i].position_left = left;
                                }
                            }
                            break;

                        case "ac":
                            for (var i = 0; i < $scope.ac.length; i++) {
                                if ($scope.ac[i].id == $scope.id) {
                                    $scope.ac[i].position_top = top;
                                    $scope.ac[i].position_left = left;
                                }
                            }
                            break;

                        case "pump":
                            for (var i = 0; i < $scope.pump.length; i++) {
                                if ($scope.pump[i].id == $scope.id) {
                                    $scope.pump[i].position_top = top;
                                    $scope.pump[i].position_left = left;
                                }
                            }
                            break;
                    }
                    break;
            }
        };

        $scope.save = function() {
            $scope.dragndrop = "false";
            temps = $scope.temperature;
            build = $scope.building;
            ac = $scope.ac;
            pump = $scope.pump;
            door = $scope.doors;
            switch ($scope.canvas) {
                case "building":
                    for (var i = 0; i < build.length; i++) {
                        rest.service({
                            action: "update",
                            model: "building",
                            data: build[i]
                        });
                    }
                    break;

                case "item":
                    switch ($scope.typeItems) {
                        case "temperature":
                            for (var i = 0; i < temps.length; i++) {
                                rest.service({
                                    action: "update",
                                    model: "temperature",
                                    data: temps[i]
                                });
                            }
                            break;

                        case "door":
                            for (var i = 0; i < door.length; i++) {
                                rest.service({
                                    action: "update",
                                    model: "door",
                                    data: door[i]
                                });
                            }
                            break;

                        case "ac":
                            for (var i = 0; i < ac.length; i++) {
                                rest.service({
                                    action: "update",
                                    model: "ac",
                                    data: ac[i]
                                });
                            }
                            break;

                        case "pump":
                            for (var i = 0; i < pump.length; i++) {
                                rest.service({
                                    action: "update",
                                    model: "pump",
                                    data: pump[i]
                                });
                            }
                            break;
                    }
                    break;
            }
            area()
        }

        $scope.cancel = function() {
            $scope.dragndrop = "false";
            area();
        }

        $scope.delete = function() {
            rest.service({
                action: "delete",
                model: "building",
                data: {
                    id: $scope.id
                }
            });
            for (var i = 0; i < $scope.buildings.length; i++) {
                if ($scope.buildings[i].id == $scope.id) {
                    $scope.buildings.splice(i, 1);
                }
            }
        }

    }
    //end dragndrop

    function widget() {
        history.get().then(function(log) {
            rest.service({
                    action: "read",
                    model: "widget",
                    filter: {
                        where: {
                            id_location: log.loc.id
                        }
                    }
                })
                .then(function(res) {
                    $scope.parseWatt = function(value) {
                        if (value < 1000) {
                            return value + " W";
                        } else if (value < 1000000 && value >= 1000) {
                            value = value / 1000;
                            value = value.toFixed(1);
                            return value + " KW";
                        } else {
                            value = value / 1000000;
                            value = value.toFixed(1);
                            return value + " MW";
                        }
                    }
                    $scope.widget = {
                        total: 0,
                        atm: 0,
                        lighting: 0,
                        ac: 0,
                        chiller: 0,
                        temperature: [],
                        humidity: []
                    };
                    for (var i = 0; i < res.length; i++) {
                        $scope.widget.total = res[i].total;
                    }

                    $scope.widgetEnergy = function(value_ac, value_chiller, data) {
                        $q.all([
                            rest.service({
                                action: "read",
                                model: "ac",
                                filter: {
                                    where: {
                                        id_location: log.loc.id
                                    }
                                }
                            }),
                            rest.service({
                                action: "read",
                                model: "chiller",
                                filter: {
                                    where: {
                                        id_location: log.loc.id
                                    }
                                }
                            }),
                            rest.service({
                                action: "read",
                                model: "lamp",
                                filter: {
                                    where: {
                                        id_location: log.loc.id
                                    }
                                }
                            })
                        ]).then(function(energy) {
                            $scope.widget_ac      = energy[0];
                            $scope.widget_chiller = energy[1];
                            $scope.widget_lamp    = energy[2];
                        response();

                    $scope.changeWidget=function(data){
                           var wattR = 0,  wattS = 0 ,wattT = 0;
                           if (data.Gateway_id == log.loc.id_gateway) {
                                if(data.Channel!=0){
                                    for (var i = 0; i < $scope.widget_ac.length; i++) {
                                           if ($scope.widget_ac[i].channel == data.Channel) {
                                                switch($scope.widget_ac[i].phasa){
                                                    case "R":
                                                    wattR = data.WattPrdR;
                                                    break;

                                                    case "S":
                                                    wattS = data.WattPrdS;
                                                    break;

                                                    case "T":
                                                    wattT = data.WattPrdT;
                                                    break;
                                                }

                                            }
                                    }
                                        var dataAC = wattR+wattS+wattT;

                                    var wattR = 0,  wattS = 0 ,wattT = 0;
                                    for (var i = 0; i < $scope.widget_chiller.length; i++) {
                                       if ($scope.widget_chiller[i].channel == data.Channel) {
                                            switch($scope.widget_chiller[i].phasa){
                                                case "R":
                                                wattR = data.WattPrdR;
                                                break;

                                                case "S":
                                                wattS = data.WattPrdS;
                                                break;

                                                case "T":
                                                wattT = data.WattPrdT;
                                                break;
                                            }

                                        }
                                    }
                                        var dataChiller = wattR+wattS+wattT;



                            } //end if channel != 0


                            else{
                                var wattR = data.WattPrdR, wattS = data.WattPrdS , wattT = data.WattPrdT;
                                if (data.Channel == 0) {
                                    $scope.widget.total = wattR + wattS + wattT;
                                }
                            }
                            $scope.widgetEnergy(dataAC, dataChiller, data);

                        } //end if gateway

                    }

                            for (var j = 0; j < $scope.widget_ac.length; j++) {
                                if (value_ac == undefined) {
                                    if (data == undefined) {
                                        if ($scope.widget_ac[j].length != 0) {
                                            $scope.widget.ac = $scope.widget_ac[j].last_value + $scope.widget.ac;
                                        }
                                    }
                                }
                            }
                                if (value_ac != undefined) {
                                    if(value_ac != 0){
                                        data = $scope.widget.ac - $scope.widget.ac
                                        $scope.widget.ac = data;
                                        if ($scope.widget.ac == 0) {
                                            $scope.widget.ac = value_ac;
                                        }
                                    }
                                }

                            for (var j = 0; j < $scope.widget_chiller.length; j++) {
                                if (value_chiller == undefined) {
                                    if (data == undefined) {
                                        if ($scope.widget_chiller[j].length != 0) {
                                             $scope.widget.chiller = $scope.widget_chiller[j].last_value + $scope.widget.chiller;

                                        }
                                    }

                                }
                            }
                                if (value_chiller != undefined) {
                                    if(value_chiller != 0){
                                        data = $scope.widget.chiller - $scope.widget.chiller
                                        $scope.widget.chiller = data;
                                        if ($scope.widget.chiller == 0) {
                                                $scope.widget.chiller = value_chiller;
                                        }
                                    }
                                }

                            $scope.widget.lighting = $scope.widget.total - ($scope.widget.ac + $scope.widget.chiller);
                        })
                }
                $scope.widgetEnergy();

                    $scope.widgetTH = function(temperature, humidity) {
                        // temperature
                        if (temperature != 0) {
                            for (var i = 0; i < temperature.length; i++) {
                                temperature[i] = temperature[i].toFixed(0);
                            }
                            $scope.widget.temperature[0] = Math.min.apply(Math, temperature);
                            $scope.widget.temperature[1] = Math.max.apply(Math, temperature);
                        } else {
                            $scope.widget.temperatures = [0, 0];
                        }
                        // humidity
                        if (humidity != 0) {
                            for (var i = 0; i < humidity.length; i++) {
                                humidity[i] = humidity[i].toFixed(0);
                            }
                            $scope.widget.humidity[0] = Math.min.apply(Math, humidity);
                            $scope.widget.humidity[1] = Math.max.apply(Math, humidity);
                        } else {
                            $scope.widget.humidity = [0, 0];
                        }
                    }
                    $scope.widgetTHService = function() {
                        rest.service({
                                action: "read",
                                model: "temperature",
                                filter: {
                                    where: {
                                        id_location: log.loc.id
                                    }
                                }
                            })
                            .then(function(res) {
                                var temp = [],
                                    hum = [];
                                for (var i = 0; i < res.length; i++) {
                                    if (res[i].last_value != null) {
                                        temp.push(res[i].last_value);
                                    } else {
                                        temp.push(0);
                                    }
                                    if (res[i].humidity == 1) {
                                        if (res[i].last_humidity != null) {
                                            hum.push(res[i].last_humidity);
                                        } else {
                                            hum.push(0);
                                        }
                                    }
                                }
                                $scope.widgetTH(temp, hum);
                            })
                    }
                    $scope.widgetTHService();
                })
        })
    }
    widget();
    //end widget
})

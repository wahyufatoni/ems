app.controller("controller_alarm", function(
    $scope,
    $rootScope,
    $filter,
    $q,
    history,
    rest
) {

    function getAlarm() {
        history.get().then(function(log) {
            $q.all([
                rest.service({
                    action: "read",
                    model: "alarm",
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
                }),
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
                    model: "pump",
                    filter: {
                        where: {
                            id_location: log.loc.id
                        }
                    }
                }),
                rest.service({
                    action: "read",
                    model: "door",
                    filter: {
                        where: {
                            id_location: log.loc.id
                        }
                    }
                })
            ]).then(function(res) {
                var alarm = res[0];
                var lamps = res[1];
                var acs = res[2];
                var pumps = res[3];
                var doors = res[4];

                $scope.tableAlarms = function() {
                    for (var i = 0; i < alarm.length; i++) {
                        for (var j = 0; j < lamps.length; j++) {
                            if (alarm[i].id_item == lamps[j].id && alarm[i].type == 'lamp') {
                                alarm[i].data = lamps[j].lamp_name;
                            }
                        }

                        for (var j = 0; j < acs.length; j++) {
                            if (alarm[i].id_item == acs[j].id && alarm[i].type == 'ac') {
                                alarm[i].data = acs[j].ac_name;
                            }
                        }

                        for (var j = 0; j < pumps.length; j++) {
                            if (alarm[i].id_item == pumps[j].id && alarm[i].type == 'pump') {
                                alarm[i].data = pumps[j].pump_name;
                            }
                        }

                        for (var j = 0; j < doors.length; j++) {
                            if (alarm[i].id_item == doors[j].id && alarm[i].type == 'door') {
                                alarm[i].data = doors[j].door_name;
                            }
                        }
                    }
                }
                $scope.tableAlarms();

                $scope.notification = function() {
                    $scope.parseIntTime = function(value) {
                        var time = {
                            hour: parseInt(value.substr(0, 2)),
                            minute: parseInt(value.substr(3, 2))
                        }
                        return (time.hour * 60) + time.minute;
                    }

                    $scope.notif = 0;
                    for (var i = 0; i < alarm.length; i++) {
                        if (alarm[i].end_date == null) {
                            $scope.notif++;
                            alarm[i].notif = alarm[i];
                        } else {
                            var start = alarm[i].start_date;
                            var end = alarm[i].end_date;
                            start = start.substr(11, 8);
                            end = end.substr(11, 8);
                            start = $scope.parseIntTime(start);
                            end = $scope.parseIntTime(end);
                            var total = end - start;
                            total = total / 60;
                            total = total.toFixed(2);
                            alarm[i].totalHours = total;
                        }
                    }
                }
                $scope.notification();
                $scope.detail = {id_item:null , type:null};
                $scope.detailAlarm = function(table, type, id) {
                    $scope.tableType = table;
                    if (table == 'detail') {
                      for (var i = 0; i < alarm.length; i++) {
                        if (alarm[i].id == id) {
                          alarm[i].detail = alarm[i];
                          $scope.detail = {id:id , type:type};
                        }
                      }
                    }
                }
                $scope.detailAlarm('alarm');
                $scope.alarms = alarm;
            })
        })
    }
    getAlarm();
})

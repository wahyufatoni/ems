app.controller("controller_storeinfo", function($scope, $rootScope, $filter, $q, Ac, Door, Lamp, Pump, Chiller, history) {

    function getData() {
        history.get().then(function(data) {
            $q.all([
                Ac.find({
                    filter: {
                        where: {
                            id_location: data.loc.id
                        }
                    }
                }).$promise,
                Door.find({
                    filter: {
                        where: {
                            id_location: data.loc.id
                        }
                    }
                }).$promise,
                Lamp.find({
                    filter: {
                        where: {
                            id_location: data.loc.id
                        }
                    }
                }).$promise,
                Pump.find({
                    filter: {
                        where: {
                            id_location: data.loc.id
                        }
                    }
                }).$promise,
                Chiller.find({
                    filter: {
                        where: {
                            id_location: data.loc.id
                        }
                    }
                }).$promise


            ]).then(function(res) {
                items(res[0], res[1], res[2], res[3], res[4]);
            })
        })
    }
    getData();

    function items(ac, door, lamp, pump, chiller) {
        $scope.acs = ac;
        $scope.doors = door;
        $scope.lamps = lamp;
        $scope.pums = pump;
        $scope.chillers = chiller;

        $scope.items = [];
        for (var i = 0; i < $scope.acs.length; i++) {
            $scope.items.push($scope.acs[i]);
        }
        for (var i = 0; i < $scope.doors.length; i++) {
            $scope.items.push($scope.doors[i]);
        }
        for (var i = 0; i < $scope.lamps.length; i++) {
            $scope.items.push($scope.lamps[i]);
        }
        for (var i = 0; i < $scope.pums.length; i++) {
            $scope.items.push($scope.pums[i]);
        }
        for (var i = 0; i < $scope.chillers.length; i++) {
            $scope.items.push($scope.chillers[i]);
        }

        for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].styles == "ac-top" ||
                $scope.items[i].styles == "ac-bottom" ||
                $scope.items[i].styles == "ac-left" ||
                $scope.items[i].styles == "ac-right") {
                $scope.items[i].label = $scope.items[i].styles;
                $scope.items[i].label = "AC SPLIT";
            }
            if ($scope.items[i].styles == "ddoor2_top" ||
                $scope.items[i].styles == "door2_bottom" ||
                $scope.items[i].styles == "ddoor2_left" ||
                $scope.items[i].styles == "door2_right") {
                $scope.items[i].label = $scope.items[i].styles;
                $scope.items[i].label = "DOOR";
            }
            if ($scope.items[i].lamp_name != undefined) {
                $scope.items[i].label = $scope.items[i].lamp_name;
            }
            if ($scope.items[i].styles == "pump") {
                $scope.items[i].label = $scope.items[i].styles;
                $scope.items[i].label = "PUMP";
            }
            if ($scope.items[i].chiller_name != undefined) {
                $scope.items[i].label = $scope.items[i].chiller_name;
            }
        }
        // getData();
    }
})

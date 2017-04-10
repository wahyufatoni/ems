app.controller("controller_mapsCeo", function(
    $scope,
    $rootScope,
    $filter,
    $q,
    history,
    rest
){

  function getCeo() {
      history.get().then(function(log) {
          $q.all([
              rest.service({
                  action: "read",
                  model: "location"
              }),
              rest.service({
                  action: "read",
                  model: "province",
                  filter: {
                      where: {
                          id_employee: log.usr.id
                      }
                  }
              }),
              rest.service({
                action: "read",
                model: "widget"
              })
          ]).then(function(res) {
            totLoc(res[0]);
            totKwh(res[2], res[0]);
            totProvince(res[1], res[0], res[2]);
          })
      })
  }
  getCeo();

  function totLoc(loc) {
    $scope.lengLoc = 0;
    var spaci = 0;
      for (var i = 0; i < loc.length; i++) {
        $scope.lengLoc++;
        spaci = spaci + loc[i].spacious;
        $scope.spacious = spaci;
      }
  }

  function totKwh(widget, loc) {
    var datatot = 0;
    $scope.datas = 0;
    $scope.totWidget = 0;
    for (var i = 0; i < loc.length; i++) {
      for (var j = 0; j < widget.length; j++) {
        if (widget[j].id_location == loc[i].id) {
          var data = loc[i].spacious / widget[j].total;
          datatot += data;
          $scope.datas++;
          datatot = datatot/$scope.datas;
          $scope.datatot = datatot;
        }
      }
    }
    for (var i = 0; i < widget.length; i++) {
      $scope.totWidget += widget[i].total;
    }
  }

  function totProvince(province, loc, widget) {

    for (var i = 0; i < loc.length; i++) {
      for (var j = 0; j < province.length; j++) {
        if (loc[i].id_province == province[j].id) {
          loc[i].ProvName = province[j].province_name;
        }
      }
      for (var j = 0; j < widget.length; j++) {
        if (widget[j].id_location == loc[i].id) {
            var data = loc[i].spacious / widget[j].total
            loc[i].spaTot = data;
            loc[i].widget = widget[j].total;
        }
      }
    }
    $scope.location = loc;
  }
})

app.controller("controller_signin",function(
    $rootScope,
    $scope,
    $state,
    Employee,
    toaster,
    $cookieStore
){
    $scope.login = function() {
        $scope.authError = null;
        Employee.login({
            username  : $scope.post.username,
            password  : $scope.post.password
        }).$promise
        .then(function(cb) {
            $scope.post="";
            toaster.pop('success','Success',"Welcome in EMS Aplication "+cb.user.name);
            $state.go("access.ceo");             
        })
        .catch(function(error) {
            toaster.pop('error',"Failed","Username or your password is incorrect");
            $scope.post="";
        });
    }

    $scope.logout=function(){
        toaster.pop('info',"info","Logout is Successfully");
        Employee.logout();
        $cookieStore.remove("log");
        $state.go("access.signin");
    }
})
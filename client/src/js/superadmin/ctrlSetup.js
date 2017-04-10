app.controller("CtrlSetups",function($scope,$rootScope,$filter,$q,$state,toaster,Facility,fileUpload,Customer,Employee){

$q.all([
    Facility.find({filter: [{order : 'id DESC'}]}).$promise,
    Customer.find().$promise 
    // Employee.find().$promise
])
.then(function(result){
    $scope.facility         = result[0];
    $scope.customer         = result[1];
    $scope.action           = "";
    $scope.table            = "";
    $scope.type_item        = [];
    $scope.post             = "";

    $scope.equipment = $filter('filter')($scope.facility,{type:"equipment"});
    $scope.device = $filter('filter')($scope.facility,{type:"device"});

    $scope.validation=function(data,value){
            var valid=true;
            if(data.length > 1){
                value=value.split(' ').join('');
                value=value.toLowerCase();
                for(i=0;i<data.length;i++){
                    data[i]=data[i].split(' ').join('');
                    data[i]=data[i].toLowerCase();
                    if(data[i]==value){
                        valid=false;
                    }
                }
            }
            return valid;
    }

    // var temp=[];
    // for(i=0;i<$scope.facility.length;i++){
    //     var string=$scope.facility[i].type.toString();
    //     var string1=$scope.facility[i].type_item.toString();
    //     temp[i]=$scope.facility[i].brand+string+string1;
    // }
    // console.log(temp);

    // var a = $scope.post.brand+$scope.post.type+$scope.post.type_item;
    // var noExist= $scope.validation(temp,a);

    // if(noExist==false){
    //     toaster.pop('error',"Failed","Data already exists");
    // }
    // else{
    //     toaster.pop('success',"successfully");
    // }

    $scope.moment = function(date) {
        return moment(date).format('MMM Do YYYY, hh:mm:ss');
    }

    $scope.momentFromnow = function(date) {
        return moment(date).fromNow();
    }


    $scope.insert=function(type){
        $scope.post="";
        $scope.action="insert";
        switch(type){
            case "equipment":
                $scope.formEquipment.$setPristine();
                $scope.table="equipment";
            break;

            case "device":
                $scope.formDevice.$setPristine();
                $scope.table="device";
            break;

            case "customer":
                $scope.formCustomer.$setPristine();
                $scope.table="customer";
            break;
        }
    }

    $scope.update=function(type,data){
        $scope.post=data;
        $scope.action="update";
        switch(type){
            case "equipment":
                $scope.formEquipment.$setPristine();
                $scope.table="equipment";
            break;

            case "device":
                $scope.formDevice.$setPristine();
                $scope.table="device";
            break;

            case "customer":
                $scope.formCustomer.$setPristine();
                $scope.table="customer";
            break;
        }
   }

   $scope.delete=function(type,data){
        $scope.post=data;
        $scope.action="delete";
        switch(type){
            case "equipment":
                $scope.table="equipment";
            break;

            case "device":
                $scope.table="device";
            break;

            case "customer":
                $scope.table="customer";
            break;
        }
   } 


    $scope.processInsert=function(Model){
        switch(Model){
            case "equipment":
                    toaster.pop('success',"Success","Data Equipment successfully saved");
                    $scope.post.cooling_cap     = parseInt($scope.post.cooling_cap);
                    Facility.create({
                        type                    : "equipment",
                        equipment_type          : $scope.post.equipment_type,
                        brand                   : $scope.post.brand,
                        equipment_part_number   : $scope.post.equipment_part_number,
                        max_operating_current   : $scope.post.max_operating_current,
                        cooling_cap             : $scope.post.cooling_cap
                    })
                    .$promise.then(function(data){
                        var temp={
                                id                      : data.id,
                                equipment_type          : data.equipment_type,
                                brand                   : data.brand,
                                equipment_part_number   : data.equipment_part_number,
                                max_operating_current   : data.max_operating_current,
                                cooling_cap             : data.cooling_cap
                            };
                    $scope.equipment.push(temp);
                    })
            break;

            case "device":
                    toaster.pop('success',"Success","Data Device successfully saved");
                    Facility.create({
                        type                    : "device",
                        equipment_type          : $scope.post.equipment_type,
                        brand                   : $scope.post.brand,
                        equipment_part_number   : $scope.post.equipment_part_number
                    })
                    .$promise.then(function(data){
                        var temp={
                                id                      : data.id,
                                equipment_type          : data.equipment_type,
                                brand                   : data.brand,
                                equipment_part_number   : data.equipment_part_number
                            };
                        $scope.device.push(temp);
                    })
            break;

            case "customer":
                    toaster.pop('success',"Success","Customer successfully created");
                    // $scope.post.type_item = parseInt($scope.post.type_item);
                    // $scope.post.id_employee = parseInt($scope.post.id_employee);
                    // var file = $scope.post.myFile;
                       
                    // var uploadUrl = "/api/containers/container2/upload";
                    // fileUpload.uploadFileToUrl(file, uploadUrl);

                    Customer.create({
                        phone           : $scope.post.phone,
                        customer_name   : $scope.post.customer_name,
                        customer_type   : $scope.post.customer_type,
                        customer_id     : $scope.post.customer_id,
                        billing_type    : $scope.post.billing_type,
                        customer_pic    : $scope.post.customer_pic,
                        join_date       : $scope.post.join_date,
                        username        : $scope.post.username,
                        password        : $scope.post.password,
                        email           : $scope.post.email
                    })
                    .$promise.then(function(data){
                        Employee.create({
                            username    : $scope.post.username,
                            password    : $scope.post.password,
                            email       : $scope.post.email,
                            role        : "admin",
                            name        : $scope.post.customer_name
                        },function(success){});
                        var temp={
                                phone           : data.phone,
                                customer_name   : data.customer_name,
                                customer_type   : data.customer_type,
                                customer_id     : data.customer_id,
                                billing_type    : data.billing_type,
                                customer_pic    : data.customer_pic,
                                join_date       : data.join_date,
                                username        : data.username,
                                email           : data.email
                            };
                        $scope.customer.push(temp);
                    })
            break;
        }
    }

    $scope.processUpdate=function(Model){
        switch(Model){
            case "equipment":
                    toaster.pop('success',"Success","Data Equipment successfully updated");
                    $scope.post.equipment_type  = parseInt($scope.post.equipment_type);
                    $scope.post.cooling_cap     = parseInt($scope.post.cooling_cap);
                    Facility.replaceById({id:$scope.post.id},{
                        type                    : 2, 
                        equipment_type          : $scope.post.equipment_type,
                        brand                   : $scope.post.brand,
                        equipment_part_number   : $scope.post.equipment_part_number,
                        max_operating_current   : $scope.post.max_operating_current,
                        cooling_cap             : $scope.post.cooling_cap
                    });
            break;

            case "device":
                    toaster.pop('success',"Success","Data Device successfully updated");
                        $scope.post.equipment_type = parseInt($scope.post.equipment_type);
                        Facility.replaceById({id:$scope.post.id},{
                        type                    : 1, 
                        equipment_type          : $scope.post.equipment_type,
                        brand                   : $scope.post.brand,
                        equipment_part_number   : $scope.post.equipment_part_number
                    });
            break;
        }
    }

    $scope.processDelete=function(Model){
        switch(Model){
            case "equipment":
                toaster.pop('success',"Success","Data Equipment successfully deleted");
                Facility.deleteById({id:$scope.post.id});
                for(i=0;i<$scope.equipment.length;i++){
                    if($scope.equipment[i].id==$scope.post.id){
                        $scope.equipment.splice(i,1);                        
                    }
                }
            break;

            case "device":
            toaster.pop('success',"Success","Data Device successfully deleted");
            Facility.deleteById({id:$scope.post.id});
            for(i=0;i<$scope.device.length;i++){
                if($scope.device[i].id==$scope.post.id){
                    $scope.device.splice(i,1);                        
                }
            }
            // console.log($scope.device);
            // console.log($scope.post.id);
            break;
        }
    }


    $scope.save=function(){
        switch($scope.action){
            case "insert":
                $scope.processInsert($scope.table);
                console.log("insert");
            break;

            case "update":
                $scope.processUpdate($scope.table);
                console.log("update");
            break;

            case "delete":
                $scope.processDelete($scope.table);
                console.log("delete");
            break;
        }
    }

    })
})




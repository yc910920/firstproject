var md=require("../../module/common");

md.directive("pagedList",questionHistory);

questionHistory.$inject=["$parse"];

function questionHistory($parse){

    return {
        restrict:"AE",
        link:linkFn,
        templateUrl:"template/pagedList.html",
        scope:{total:"=total",pagesize:"=pagesize"}
    }

    function linkFn($scope,$ele,$attr){
        var bindFn=angular.noop;;
        var changeFn=angular.noop;

        $ele.addClass("pagedList");


        var beforeOpen=angular.noop;

        if($attr.beforeOpen){
            beforeOpen=$parse($attr.beforeOpen);
        }

        var pagedFn=angular.noop;
        if($attr.paged){
            pagedFn=$parse($attr.paged);
        }


        $scope.$parent.$watch($attr.pagedList,function(v){
            if(angular.isArray(v)){
                $scope.current=v[0];
            }
            render(v);
        });


        if($attr.value){
            bindFn=$parse($attr.value+"=v");
            $scope.$parent.$watch($attr.value,function(v){
                $scope.current=v;

            })
        }
        if($attr.change){
            changeFn=$parse($attr.change);
        }


        $scope.handleSelect=function($event){
            $scope.show=true;
            $scope.first=true;
            beforeOpen($scope.$parent);
        }
        $scope.paged=function(page){
            pagedFn($scope.$parent,{value:page})
        }

        $scope.stop=function($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.navTo=function(item){
            bindFn($scope.$parent,{v:item});
            changeFn($scope.$parent,{v:item})
            $scope.show=false;
        }

        function render(v){
            $scope.datas=v;
        }

        $scope.$on("hit",function(){
            if(!$scope.first){
                setTimeout(function(){
                    $scope.show=false;
                    $scope.$apply();
                },50); 

            }else{
                $scope.first=false;
            }

        })

    }
}
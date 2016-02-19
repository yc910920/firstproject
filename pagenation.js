var md=require("../../module/common");

md.directive("pagebar",pagerDirective);

pagerDirective.$inject=["$parse"];
 
function pagerDirective($parse){

    var tpl=`
        <ul class='pagebar' ng-if='pages>=1' >
            <li ng-repeat='n in navs' ng-class='currentClass(n)' ng-click='nav(n)'>
            <span html-bind='format(n.page)' ></span>
            </li>
        </ul>
    `;

    return {
        restrict:"AE",
        link:linkFn,
        template:tpl,
        scope:true
    };

    function linkFn($scope,$ele,$attr){
        var changeFn=$parse($attr.change);
        var total=0;
        var page=0;
        var pageSize=$parse($attr.pagesize)($scope.$parent)||10;
        var navSize=$parse($attr.navsize)($scope.$parent)||3;
        var showFirstLast=$parse($attr.firstlast)($scope.$parent)||false;
        var showNav=$parse($attr.nav)($scope.$parent)||true;

        var defaults={home:"首页",last:"尾页",forward:"下一页",previous:"上一页",pageForward:"•••",pagePrevious:"•••"};
        var configs=$parse($attr.config)($scope.$parent)||defaults;
        $scope.currentPage=$parse($attr.current)($scope.$parent)||0;

        $scope.$parent.$watch($attr.total,function(v){
            total=v;
            render();
        });

        // $scope.$parent.$watch($attr.current,function(v){
        //     $scope.currentPage=v;
        //     $scope.navTo(v);
        // });
        $scope.$parent.$watch($attr.pagesize,function(v){
            pageSize=v||10;
            render();
        });

        $scope.format=function(v){
            if(typeof(v)=="number"){
                return v+1;
            }
            return v;
        }

        $scope.currentClass=function(item){
            if(item.page===$scope.currentPage){
                return "page-item current";
            }else{
                return "page-item";
            }
        };


        $scope.navTo=function(count){
            count=count<0?0:count>=$scope.pages?$scope.pages:count;
            $scope.currentPage=count;
            page=Math.floor(count/navSize);  //reset page.
            render(true);
        };

        $scope.nav=function(nav){
            var count=$scope.currentPage;
            var pages=getPages(total,pageSize);

            switch(nav.type){
                case "home":
                    page=0;
                    count=0;
                    break;
                case "last":
                    page=Math.ceil(pages/navSize);
                    count=pages;
                    break;
                case "previous":
                    count--;
                    break;
                case "forward":
                    count++;
                    break;
                case "pagePrevious":
                    count=(page-1)*navSize;
                    break;
                case "pageForward":
                    count=(page+1)*navSize;
                    break;
                default:
                    count=nav.page;
            }
            
            $scope.navTo(count);
        };

        var currentFn=angular.noop;
        if($attr.current){
            currentFn= $parse($attr.current+"=value");
        }


        function render(change){
            $scope.pages=getPages(total,pageSize);
            var current=$scope.currentPage;
            $scope.navs=makeArray(current);
            currentFn($scope.$parent,{value:current});
            var fromTo={from:page*pageSize,to:page*pageSize};
            return change&&changeFn($scope.$parent,{value:current,fromTo:fromTo});

        }

        function makeArray(current){
            var pages=getPages(total,pageSize);
            var minIndex=getStart(pages,current);

            var navs=[],nav;

            for(var i=minIndex;i<minIndex+navSize&&i<=pages;i++){
                nav={};
                nav.type="page";
                nav.page=i;
                navs.push(nav);
            }


            if(minIndex>1){
                nav={};
                nav.type="pagePrevious";
                nav.page=configs.pagePrevious;
                navs=[nav].concat(navs);
            }

            if(minIndex+navSize<=pages){
                nav={};
                nav.type="pageForward";
                nav.page=configs.pageForward;
                navs.push(nav);
            }





            //warp forward previous
            

            if(showNav){
                if(pages>1&&$scope.currentPage!=0){
                    nav={};
                    nav.type="previous";
                    nav.page=configs.previous;
                    navs=[nav].concat(navs);
                }

                if(pages>1&&$scope.currentPage<$scope.pages){
                    nav={};
                    nav.type="forward";
                    nav.page=configs.forward;
                    navs.push(nav);
                }
            }


            //warp home last
            if(showFirstLast){
                if(minIndex>1){
                    nav={};
                    nav.type="home";
                    nav.page=configs.home;
                    navs=[nav].concat(navs);
                }

                if(minIndex+navSize<pages){
                    nav={};
                    nav.type="last";
                    nav.page=configs.last;
                    navs.push(nav);
                }
            }

            return navs;
        }

        function getStart(totalPage,current){
            //var start=Math.floor(navSize/2);
            //var small=current-start;
            //var small=(page-1)*navSize+1;

            //var smallShouldBe=current-navSize;

            //return Math.max(small,smallShouldBe)+1;
            return page*navSize;
        }

        function getPages(total,pageSize){
            return Math.floor(total/pageSize);
        }

    }
}

module.exports=md;

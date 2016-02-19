var md=require("../../module/common");
md.directive("pagemode", pagemodeDirective);

/** 属性说明
    totalpage 总页数
    totalcount 总记录数
    currentpage 当前页
    change="XX(page)" 回调函数 page当前页
    
*/
pagemodeDirective.$inject=["$parse","$rootScope"];

var t = `
    <span class="pagemode">
        <span class="blue">共：{{totalPage}}页/</span>
        <span class="blue">{{totalCount}}份&nbsp;&nbsp;</span>
        <span class="blue">当前页:{{corruntPage}}&nbsp;&nbsp;</span>
        <button class="btn" ng-class="{true: 'grey'}[corruntPage === 1]" ng-click="prevPage()">
            <span>上一页</span>
        </button>
        <button class="btn" ng-class="{true: 'grey'}[(corruntPage === totalPage) || (totalPage === 0)]" ng-click="nextPage()">
            <span>下一页</span>
        </button>
    </span>
`;

function pagemodeDirective($parse,$rootScope){

    return {
        restrict:"AE",
        template:t,
        scope:{},
        link:linkFn
    };

    function linkFn($scope,$ele,$attr){
        $scope.$parent.$watch($attr.totalpage, function(n) {
            if(n) {
                $scope.totalPage = n;
            } else {
                $scope.totalPage = 0;
            }
        });
        $scope.$parent.$watch($attr.totalcount, function(n) {
            if(n) {
                $scope.totalCount = n;
            } else {
                $scope.totalCount = 0;
            }
        });
        $scope.$parent.$watch($attr.currentpage, function(n) {
            if(n) {
                $scope.corruntPage = n;
            } else {
                $scope.corruntPage = 1;
            }
        });
        $scope.prevPage = function() {
            if($scope.corruntPage <= 1) return;
            $scope.corruntPage = $scope.corruntPage - 1;
            $parse($attr.change)($scope.$parent, {page: $scope.corruntPage});
        }
        $scope.nextPage = function() {
            if($scope.corruntPage >= $scope.totalPage) return;
            $scope.corruntPage = $scope.corruntPage + 1;
            $parse($attr.change)($scope.$parent, {page: $scope.corruntPage});
        }
    }
}

module.exports = md;
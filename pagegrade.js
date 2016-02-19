var md=require("../../module/common");
md.directive("pagegrade", pagegradeDirective);

/** 属性说明
    pagegrade 分页数组
    pagesize  分页大小
    custom true自定义显示标签　false根据分页数组序号显示标签
    attribute 分页数组里单个元素是对象的话　取这个属性值来显示分页
    pagecurrent 当前位置
    change="XX(page)" 回调函数 page当前页
    
*/
pagegradeDirective.$inject=["$parse","$rootScope"];

var t = `
    <div class="pagegrade clear">
        <ul>
            <li class="pagegrade-item" ng-click="beforeClick()">
                <span>
                    <i class="icon icon-previous h5"></i>
                </span>
            </li>
            <li class="pagegrade-item" ng-click="choiceClick()" ng-class="{true: 'active'}[pagecurrentActive === -1]">
                <span>
                    选择题
                </span>
            </li>
            <li class="pagegrade-item" ng-repeat="list in lists track by $index" ng-class="{true: 'active'}[pagecurrentActive === $index]" ng-click="listClick(list)">
                <span ng-if="custom">
                    {{list === "..." ? "..." : list[attribute]}}
                </span>
                <span ng-if="!custom">
                    {{$index + 1}}
                </span>
            </li>
            <li class="pagegrade-item" ng-click="afterClick()">
                <span>
                    <i class="icon icon-forward h5"></i>
                </span>
            </li>
        </ul>
    </div>
`;

function pagegradeDirective($parse,$rootScope){

    return {
        restrict:"AE",
        template:t,
        scope: true,
        link:linkFn
    };

    function linkFn($scope,$ele,$attr){
        $scope.custom    = ($attr.custom === "true");
        $scope.attribute = $attr.attribute;
        $scope.pagesize  = $attr.pagesize ? Number($attr.pagesize) : 9;

        $scope.$parent.$watch($attr.pagegrade, function(n) {
            if(n) {
                $scope.allLists = n;
                getPagination();
            }
        });

        $scope.$parent.$watch($attr.pagecurrent, function(n) {
            if(Number(n) >= 0) {
                $scope.pagecurrent = Number(n); //传过来的pagecurrent
            } else {
                $scope.pagecurrentActive = $scope.pagecurrent = -1;
            }
            getPagination();
        });

        /**
         * [listClick 列表点击]
         * @param  {[type]} list [description]
         * @return {[type]}      [description]
         */
        $scope.listClick = function(list) {
            if(list === "...") return;

            var i, index = -1;
            for(i = 0; i < $scope.allLists.length; i++) {
                if(list === $scope.allLists[i]) {
                    index = i;
                    break;
                }
            }

            if(index !== -1) {
                $parse($attr.change)($scope.$parent, {params: list, index: index, isChoice: false});
            }
        };

        /**
         * [choiceClick 选择题点击]
         * @return {[type]} [description]
         */
        $scope.choiceClick = function() {
            $scope.pagecurrentActive = $scope.pagecurrent = -1;
            $parse($attr.change)($scope.$parent, {params: null, index: -1, isChoice: true});
        };

        /**
         * [beforeClick 上一题点击]
         * @return {[type]} [description]
         */
        $scope.beforeClick = function() {
            if($scope.pagecurrent > 0) {
                $parse($attr.change)($scope.$parent, {params: $scope.allLists[$scope.pagecurrent - 1], index: $scope.pagecurrent - 1, isChoice: false});
            }
        };

        /**
         * [afterClick 下一题点击]
         * @return {[type]} [description]
         */
        $scope.afterClick = function() {
            if($scope.pagecurrent < $scope.allLists.length - 1) {
                $parse($attr.change)($scope.$parent, {params: $scope.allLists[$scope.pagecurrent + 1], index: $scope.pagecurrent + 1, isChoice: false});
            }
        };

        /**
         * [getPagination 组合显示的分页数组]
         * @return {[type]} [description]
         */
        function getPagination() {
            if(!$scope.allLists || $scope.allLists.length <= 0) return;

            var pages = [], i;
            for(i = 0; i < $scope.allLists.length; i++) {
                pages.push(i + 1);
            }

            var fold = foldpages(pages, $scope.pagecurrent, $scope.pagesize);
            var lists = [];
            for(i = 0; i < fold.length; i++) {
                if(fold[i] === "...") {
                    lists[i] = "...";
                } else {
                    lists[i] = $scope.allLists[Number(fold[i]) - 1];
                    if(Number(fold[i]) - 1 === $scope.pagecurrent) {
                        $scope.pagecurrentActive = i;
                    }
                }
            }

            $scope.lists = lists;
        }

        /**
         * [foldpages 数组折叠]
         * @param  {[type]} pages    [待折叠的数组从１开始计数]
         * @param  {[type]} current  [当前选中的元素位置]
         * @param  {[type]} viewsize [折叠数组的长度]
         * @return {[type]}          [折叠后的数组]
         * 参看　http://myunlessor.me/blog/2014/06/19/one-way-to-implement-pagination-folding-logic/
         */
        function foldpages(pages, current, viewsize) {
            var ret  = [].concat(pages),
                min  = 1,
                max  = ret.length,
                dots = '...',
                remain;

            current = Math.max(min, Math.min(current, max));

            if (max <= viewsize) {
                ret[current - 1] = '' + ret[current - 1];
                return ret;
            }

            viewsize = Math.max(5, viewsize || 7);
            ret      = ['' + current];
            remain   = viewsize - 1;

            while (true) {
                var first = +ret[0], last = +ret[ret.length - 1];

                if (first > min)  {
                    ret.unshift(first - 1);
                    if (!--remain) break;
                }

                if (last < max) {
                    ret.push(last + 1);
                    if (!--remain) break;
                }
            }

            switch (true) {
            case +ret[0] === min:
                ret.splice(ret.length - 2, 2, dots, max);
                break;
            case +ret[ret.length - 1] === max:
                ret.splice(0, 2, min, dots);
                break;
            default:
                ret.splice(0, 2, min, dots);
                ret.splice(ret.length - 2, 2, dots, max);
                break;
            }

            return ret;
        }
    }
}

module.exports = md;
var md=require("../../module/common");
md.directive("pageckeck", pageckeckDirective);

/** 属性说明
    pageckeck 判卷图片标记
    
*/
pageckeckDirective.$inject=["$parse","$rootScope"];

function pageckeckDirective($parse,$rootScope){

    return {
        restrict:"AE",
        templateUrl:"template/pagecheck.html",
        scope: {
            question    : "=",
            imgCache    : "=",
            showImg     : "=",
            formDisplay : "=",
            score       : "=",
            flag        : "=",
            font        : "="
        },
        link:linkFn
    };

    function linkFn($scope,$ele,$attr) {
        $scope.$watchCollection("question", function(question) {
            if(question) {
                $scope.question = question;
                initImg();
                initKnowledge();
                initMark();
            }
        });

        function initImg() {
            $scope.noImg    = false; //是否没有图片
            $scope.imgError = false; //是否图片加载失败
            if($scope.question.checkResult && $scope.question.checkResult.imgPath) {
                var imgPath = $scope.question.checkResult.imgPath;

                var i, index = -1;
                for(i = 0; i < $scope.imgCache.length; i++) {
                    if($scope.imgCache[i].questionId === $scope.question.questionId) {
                        index = i;
                        break;
                    }
                }
                if(index !== -1) { //查询到图片被缓存了
                    $scope.imgPath = $scope.imgCache[index].img.src;
                    $scope.showImg = true;
                    return;
                }

                var img = new Image();
                img.src = $rootScope.serverFileAddressAndPath + imgPath + "?access_token=" + $rootScope.encodeToken;
                img.onload = function() {
                    $scope.width    = img.width;
                    $scope.height   = img.height;
                    $scope.imgPath  = img.src;
                    $scope.showImg  = true;

                    //缓存图片对象
                    $scope.imgCache.push({
                        questionId: $scope.question.questionId,
                        img: img
                    });

                    $scope.$apply();
                };
                img.onerror = function (error) {
                    console.log("本题图片获取失败");
                    $scope.showImg  = false;
                    $scope.imgError = true;
                    $scope.width    = 600;
                    $scope.height   = 400;
                    $scope.$apply();
                };

            } else {
                $scope.width  = 600;
                $scope.height = 400;
                $scope.noImg  = true; //学生未作答
            }
        }

        /**
         * [initKnowledge 初始化知识点]
         * @return {[type]} [description]
         */
        function initKnowledge() {
            var knowledges = [];
            angular.forEach($scope.question.stdAnswers, function(item) { 
                if(item.knowledges && item.knowledges.length > 0) {
                    angular.forEach(item.knowledges, function(ite) {
                        var index = -1;
                        angular.forEach(knowledges, function(it, i) {
                            if(ite.knowledgePointId === it.knowledgePointId) {
                                index = i;
                            }
                        });
                        if(index === -1) {
                            knowledges.push(ite);
                        }
                    });
                }
            });
            $scope.knowledges = knowledges;
        }

        /**
         * [initMark 初始化标记数组]
         * @return {[type]} [description]
         */
        function initMark() {
            $scope.question.checkResult             = $scope.question.checkResult || {};
            $scope.question.checkResult.judgeResult = $scope.question.checkResult.judgeResult || [];
            $scope.markList                         = $scope.question.checkResult.judgeResult;
        }

        /**
         * [target 标记点击]
         * @param  {[type]} $event [description]
         * @param  {[type]} item   [description]
         * @param  {[type]} $index [description]
         * @return {[type]}        [description]
         */
        $scope.target = function($event, item, $index) {
            angular.forEach($scope.markList, function(ite) { //去掉全部边框 隐藏知识点
                ite.showBorder    = false;
                ite.showKnowledge = false;
            });

            item.showBorder = true; //加边框                          
            if($scope.knowledges && $scope.knowledges.length > 0) {
                item.showKnowledge = true;
            } else {
                item.showKnowledge = false;
            }

            angular.forEach($scope.knowledges, function(ite) {
                ite.selected = false;
            });
            
            angular.forEach($scope.knowledges, function(ite) {
                angular.forEach(item.konwledges, function(it) { //这里单词有错
                    if(it.value === ite.knowledgePointId) {
                        ite.selected = true;
                    } 
                });
            });

            $event.stopPropagation();
        };

        /**
         * [selectedChange 知识点点击]
         * @param  {[type]} item      [description]
         * @param  {[type]} knowledge [description]
         * @return {[type]}           [description]
         */
        $scope.selectedChange = function(item, knowledge) {
            if(knowledge.selected) { //添加
                item.konwledges.push({
                    value: knowledge.knowledgePointId,
                    name: knowledge.knowledgePointName
                });
            } else {
                var index = -1;// 删除
                angular.forEach(item.konwledges, function(ite, i) { //这里单词有错
                    if(ite.value === knowledge.knowledgePointId) {
                        index = i;
                    }
                });
                if(index !== -1) {
                    item.konwledges.splice(index, 1);
                }
            }
        };

        /**
         * [selectedAllClick 知识点全选]
         * @param  {[type]} item      [description]
         * @return {[type]}           [description]
         */
        $scope.selectedAllClick = function(item) {
            item.konwledges = [];
            angular.forEach($scope.knowledges, function(ite) {
                ite.selected = true;
                item.konwledges.push({
                    value: ite.knowledgePointId,
                    name:  ite.knowledgePointName
                });
            });
        };

        /**
         * [selectedNoneClick 知识点全取消]
         * @param  {[type]} item      [description]
         * @return {[type]}           [description]
         */
        $scope.selectedNoneClick = function(item) {
            item.konwledges = [];
            angular.forEach($scope.knowledges, function(ite) {
                ite.selected = false;
            });
        };

        /**
         * [selectedCloseClick 知识点隐藏]
         * @param  {[type]} item      [description]
         * @return {[type]}           [description]
         */
        $scope.selectedCloseClick = function(item, $event) {
            item.showKnowledge = false;
            item.showBorder    = false;
            $event.stopPropagation();
        };

        /**
         * [tab 画布点击]
         * @param  {[type]} $event [description]
         * @return {[type]}        [description]
         */
        $scope.tab = function($event) {
            if(!$scope.flag) return; //没有任何标记类型　直接返回
            // debugger
            //删除大勾　大叉
            var index = -1;
            angular.forEach($scope.question.checkResult.judgeResult, function(item, i) {
                if(item.bigLog === "bigRight" || item.bigLog === "bigWrong") {   
                    index = i;

                    if($scope.formDisplay) {
                        $scope.score = null;
                    } else {
                        $scope.score = 0;
                    }
                }
            });
            if(index !== -1) {  //有大勾　大叉 就直接删除
                $scope.question.checkResult.judgeResult.splice(index, 1);
            }

            var mark        = {};
            mark.type       = $scope.flag;
            mark.konwledges = [];
            mark.x          = $event.pageX;
            mark.y          = $event.pageY;
            mark.width      = 30;
            mark.height     = 30;
            mark.itemWidth  = 60;
            mark.itemHeight = 50;
            mark.font       = $scope.font; //文本
            mark.other      = !$scope.font;//非文本
            mark.check      = false;

            var left, top;
            var parentId = $($event.target).parent()[0].id;
            if(parentId){
                top  = $('#' + parentId).offset().top;
                left = $('#' + parentId).offset().left;
            } else {
                top  = $('#' + $event.target.id).offset().top;
                left = $('#' + $event.target.id).offset().left;
            }

            mark.x  = mark.x - left - 20;
            mark.y  = mark.y - top - 20;

            if(mark.font) {
                mark.itemWidth  = 255;
                mark.itemMinWidth = 200;
            }

            angular.forEach($scope.markList, function(item) { //去掉全部边框 隐藏知识点
                item.showBorder    = false;
                item.showKnowledge = false;
            });

            angular.forEach($scope.knowledges, function(item) { //去掉知识点选中状态
                item.selected = false;
            });

            mark.showBorder    = true;
            mark.showKnowledge = true;
            $scope.markList.push(mark);

            $event.stopPropagation();
        };

        /**
         * [dismiss 删除标记]
         * @param  {[type]} $event [description]
         * @param  {[type]} item   [description]
         * @param  {[type]} $index [description]
         * @return {[type]}        [description]
         */
        $scope.dismiss = function($event, item, $index) {
            $scope.markList.splice($index, 1);
            $event.stopPropagation();
        }
    }
}

module.exports = md;
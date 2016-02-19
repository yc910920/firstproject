var md=require("../../module/common");
md.directive("pagemark", pagemarkDirective);

/** 属性说明
    pagemark 判卷操作栏
    
*/
pagemarkDirective.$inject=["$parse","$rootScope"];

function pagemarkDirective($parse,$rootScope){

    return {
        restrict:"AE",
        templateUrl: "template/pagemark.html",
        scope: {
            showChoicePage     : "=",
            flag               : "=",
            question           : "=",
            score              : "=",
            font               : "=",
            saveQuestionResult : "="
        },
        link:linkFn
    };

    function linkFn($scope,$ele,$attr) {
        keyBind(); //键盘快捷键绑定

        /**
         * [wrongClick 大勾点击]
         * @return {[type]} [description]
         */
        $scope.rightClick = function() {
            $scope.flag = "bigRight";
            $scope.question.checkResult = $scope.question.checkResult || {};
            $scope.question.checkResult.judgeResult = $scope.question.checkResult.judgeResult || [];

            var indexBigRight = -1, indexBigWrong = -1;
            angular.forEach($scope.question.checkResult.judgeResult, function(item, i) {
                if(item.bigLog === "bigRight") {   
                    indexBigRight = i;
                }
                if(item.bigLog === "bigWrong") {   
                    indexBigWrong = i;
                }
            });
            if(indexBigRight !== -1) return; //有大勾　就直接返回
            if(indexBigWrong !== -1) {       //有大叉　就直接删除
                $scope.question.checkResult.judgeResult.splice(indexBigWrong, 1);
            }

            $scope.score = $scope.question.score;

            var mark = {};

            var width  = $('#hb-map-wrap').css('width');
                width  = parseInt(width || 0, 10);
            var height =  $('#hb-map-wrap').css('height');
                height = parseInt(height || 0, 10);

            mark.x      = width / 2;
            mark.y      = height / 4;
            mark.width  = height / 5;
            mark.height = height / 5;
            mark.type   = "right";
            mark.font   = false;
            mark.other  = true;
            mark.check  = true;
            mark.bigLog = 'bigRight';

            $scope.question.checkResult.judgeResult.push(mark);
        };
        
        /**
         * [successClick 大叉点击]
         * @return {[type]} [description]
         */
        $scope.wrongClick = function() {
            $scope.flag = "bigWrong";
            $scope.question.checkResult = $scope.question.checkResult || {};
            $scope.question.checkResult.judgeResult = $scope.question.checkResult.judgeResult || [];

            //这里和大勾相反
            var indexBigRight = -1, indexBigWrong = -1;
            angular.forEach($scope.question.checkResult.judgeResult, function(item, i) {
                if(item.bigLog === "bigRight") {   
                    indexBigRight = i;
                }
                if(item.bigLog === "bigWrong") {   
                    indexBigWrong = i;
                }
            });
            if(indexBigWrong !== -1) return; //有大叉　就直接返回
            if(indexBigRight !== -1) {       //有大勾　就直接删除
                $scope.question.checkResult.judgeResult.splice(indexBigRight, 1);
            }

            //分数置为0
            $scope.score = 0;

            var mark = {};

            var width  = $('#hb-map-wrap').css('width');
                width  = parseInt(width || 0, 10);
            var height =  $('#hb-map-wrap').css('height');
                height = parseInt(height || 0, 10);

            mark.x      = width / 2;
            mark.y      = height / 4;
            mark.width  = height / 5;
            mark.height = height / 5;
            mark.type   = "error";
            mark.font   = false;
            mark.other  = true;
            mark.check  = true;
            mark.bigLog = 'bigWrong';

            $scope.question.checkResult.judgeResult.push(mark);

            //大叉就加入全部知识点
            initKnowledge();
            mark.konwledges = []; //名字有黑魔法
            angular.forEach($scope.knowledges, function(item) {
                mark.konwledges.push({
                    value: item.knowledgePointId,
                    name: item.knowledgePointName
                });
            });
        };
        
        /**
         * [successClick 正确点击]
         * @return {[type]} [description]
         */
        $scope.successClick = function() {
            $scope.flag = "right"; //标记类型
            $scope.font = false;　 //是否是文本
        };
        
        /**
         * [errorClick 错误点击]
         * @return {[type]} [description]
         */
        $scope.errorClick = function() {
            $scope.flag = "error";
            $scope.font = false;
        };
        
        /**
         * [helpClick 疑问点击]
         * @return {[type]} [description]
         */
        $scope.helpClick = function() {
            $scope.flag = "help";
            $scope.font = false;　
        };
        
        /**
         * [wrightClick 半勾点击]
         * @return {[type]} [description]
         */
        $scope.wrightClick = function() {
            $scope.flag = "wright";
            $scope.font = false;
        };

        /**
         * [textClick 文本点击]
         * @return {[type]} [description]
         */
        $scope.textClick = function() {
            $scope.flag = "font";
            $scope.font = true;　 //是否是文本
        };

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
         * [keyBind 快捷键绑定]
         * @return {[type]} [description]
         */
        function keyBind() {
            window.addEventListener("keydown", doKeyDown, false);

            $scope.$on("$destroy", function() {
                window.removeEventListener("keydown", doKeyDown, false);
            });
        }

        /**
         * [doKeyDown 键盘事件]
         * @param  {[type]} event [description]
         * @return {[type]}       [description]
         */
        function doKeyDown(event) {
            if(event.keyCode === 13) {
                $scope.saveQuestionResult();
            } else {
                switch(event.keyCode) {
                    case 49:
                        $scope.successClick();
                        $scope.$apply();
                        break;
                    case 50:
                        $scope.errorClick();
                        $scope.$apply();
                        break;
                    case 51:
                        $scope.helpClick();
                        $scope.$apply();
                        break;
                    case 52:
                        $scope.wrightClick();
                        $scope.$apply();
                        break;
                    case 53:
                        $scope.textClick();
                        $scope.$apply();
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

module.exports = md;
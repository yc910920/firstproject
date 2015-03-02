/**
 * MTOUCH JS核心库
 */
(function(undefined){

	var pMethod = {
			extend: function(target, settings, overwrite) {

				for(var key in settings) {
					target[key] = overwrite ? settings[key] : target.hasOwnProperty(key) ? target[key] : settings[key];
				}

				return target;
			},

			/**
	         * 获取参数的类似
	         * -1:非法参数
	         * 0: 取值
	         * 1：K-V赋值
	         * 2：对象赋值
	         */
	        getArgType: function(k, v){
	            if(arguments.length < 1) {
	            	return -1;
	            }

	            var type0 = typeof k;
	            var type1 = typeof v;
	            if(type0 === "string" && type1 === "undefined"){
	                return 0;
	            }

	            if(type0 === "object"){
	                return 2;
	            }

	            if(type0 === "string" && (type1 === "string"||type1==="number")){
	                return 1;
	            }

	            return -1;
	        },

	        /**
	         * 设置dom样式
	         * 替换掉“-”， 并且第一个字母大写.
	         * background-color -> backgroundColor
	         */
	        setStyle: function(ele, k, v) {
	            if(k.indexOf("-") !== -1) {
	                k = k.replace(/\-[a-z]/g, function(m) { return m[1].toUpperCase();});
	            }

	            ele.style[k] = v;
	        },

	        /**
	         * 获取样式值
	         * 获取样式, 替换掉所有大写字母并增加一个"-"在前面。
	         * backgroundColor -> background-color
	         */
	        getStyle: function(ele,k){
	            k = k.replace(/[A-Z]/g, function(m) { return '-' + m.toLowerCase();});
	            return document.defaultView.getComputedStyle(ele, "").getPropertyValue(k);
	        },

	        css: function(ele,k,v){
	        	return pMethod.attrHandler(ele, k, v, pMethod.getStyle, pMethod.setStyle);
	        },
	        attr: function(ele,k,v){
	        	return pMethod.attrHandler(ele, k, v, pMethod.handler.attrRead, pMethod.handler.attrWrite);
	        },
	        /**
	         *  设置获取值
	         */
	        handler: {
	        	attrRead : function(ele, k){
	        		return ele.getAttribute(k);
	        	},
	        	attrWrite : function(ele,k,v){
	        		ele.setAttribute(k, v);
	        	}
	        },
	        attrHandler: function(cxt, k, v, getMethod, putMethod){
	             var argsType = pMethod.getArgType(k, v), ele;

	             //string做key，无value，直接取值
	             if(argsType === 0) {
	                ele = (cxt.length>=0)?cxt[0]:cxt;
	                return ele ? getMethod(ele, k) : null;
	             }

	             if(cxt.length>=0){
		             for(var i=0; i < cxt.length; i++){
		                 ele = cxt[i];
		                 //对象赋值
		                 if(argsType === 2){
		                    for(var key in k){
		                    	putMethod(ele, key, k[key]);
		                    }
		                 }
		                 else {
		                	 putMethod(ele, k, v);
		                 }
		              }
	        	}else{
	        		//对象赋值
	                 if(argsType === 2){
	                    for(var key in k){
	                    	putMethod(cxt, key, k[key]);
	                    }
	                 }
	                 else {
	                	 putMethod(cxt, k, v);
	                 }
	        	}
	             return cxt;
	        },


	        valHooks: {
                select: {
                    get: function(ele){
                        var values=[],options = ele.options;
                        for(var i=0;i<options.length;i++){
                            if(options[i].selected){
                                values.push(options[i].value);
                            }
                        }

                        if(values.length==1)
                          return values[0];
                        else if(values.length==0)
                          return null;
                        else
                          return values;
                    },

                    set: function(ele,v){
                        var options = ele.options
                        var isM = ele.getAttribute("multiple")?true:false;

                        for(var i=0;i<options.length;i++){
                            var o = options[i];
                            o.selected = false;

                            if(isM){
                                if(MTOUCH.inArray(v,o.value))
                                  o.selected = true;
                            }
                            else{
                                // 单选
                               if(v==o.value){
                                   o.selected = true;
                                   return;
                               }
                            }
                        }
                    }
                }
	        },
	        data: {
				uuid: 1,
				dataKey: "internalKey",
				cache: {},

				put: function(el, key, value) {
					var dataKey = pMethod.data.dataKey,
						id = el[dataKey],
						cache = pMethod.data.cache;

					if(!id) {
						id = el[dataKey] = pMethod.data.uuid++;
						cache[id] = {};
					}

					cache[id][key] = value;
				},

				get: function(el, key) {
					var dataKey = pMethod.data.dataKey,
						id = el[dataKey],
						cache = pMethod.data.cache;

					return id ? cache[id][key] : null;
				}
			},
			dataset: function(el, k){
				if(el.dataset){
					return el.dataset[k]; 
				}else{
					return el.getAttribute("data-" + k);
				}
			},
			hasClass: function(ele,v){
	            var machClass = " " + v + " ";
	            if((" " + ele.className + " ").indexOf(machClass) != -1)
	                return true;

	            return false;
	        },

	        addClass: function(ele,v){
	            var classNames = v.split(" "),oldName;

                oldName = MTOUCH.trim(ele.className);
                if(!ele.className){
                    ele.className = v;
                    return;
                }

                oldName = " " + oldName + " ";
                for(var k=0;k<classNames.length;k++){
                    if(oldName.indexOf(" " + classNames[k] + " ") == -1){
                        oldName += classNames[k] + " ";
                    }
                }

                ele.className = MTOUCH.trim(oldName);
	        },

	        removeClass: function(ele,v){
	            var oldName = ele.className;
                if(oldName){
                    ele.className = MTOUCH.trim(oldName.replace(v,"").replace(/[ ]+/g," "));
                }
	        },

	        toggleClass: function(ele,v){
	            if(pMethod.hasClass(ele,v)){
	                pMethod.removeClass(ele,v);
	            }else{
	            	pMethod.addClass(ele,v);
	            }
	        }
	};

    window.MTOUCH = window.$ = MTOUCH = function(q,context){
        return new MTOUCH.fn.find(q,context);
    };
    MTOUCH._instance = function(eles){
    	if(eles && eles.length){
	    	// 转化成类数组
	        for(var i=0;i<eles.length;i++){
	            this[i] = eles[i];
	        }
	        this.length = eles.length;
    	}
        return this;
    };
    // 每次都$查询都重复使用这个数组，防止每次new1个导致的gc
    MTOUCH._emptyArray = [];
    MTOUCH.getEmptyArray = function(){
    	MTOUCH._emptyArray.length = 0;
    	return MTOUCH._emptyArray; 
    };
    /**
     * 替换prototype，不需要使用原型继承
     */
    MTOUCH.fn = MTOUCH.prototype = {
        length : 0,
        selector:"",
        /**
         * 通过该方法构造MTOUCH对象
         */
        find : function(q, context){
            var eles=MTOUCH.getEmptyArray();
            // empty selector,and this.length=0
            if(!q && !this.length){
                return new MTOUCH._instance();
            }

            // DOM元素
            if(q && (q.nodeType || q === window)){
            	eles[0] = q;
                return new MTOUCH._instance(eles);
            }
            // $("exp").find("exp")
            if(!context && this.length){
                var tmpEles;
                for(var i=0;i<this.length;i++){
                    if(q){
                	  tmpEles = this[i].querySelectorAll(q);
                	}else{
                	    //empty q,get children
                	  tmpEles = this[i].childNodes;
                	}
            		for(var i=0;i<tmpEles.length;i++){
            		    if(tmpEles[i].nodeType === 1)
            			    eles.push(tmpEles[i]);
            		}
                }
            }else{
                context = context || document;
                if(typeof q === "string"){
                    eles = context.querySelectorAll(q);
                }
            }
            return new MTOUCH._instance(eles);
        },

        children: function(tag) {
        	if(this.length == 0) {
        		return this;
        	}

        	if(tag){
        	    return this.find("* > " + tag);
        	}else{
                return this.find();
        	}
        },

        parent: function(){
        	if(this.length == 0) {
        		return this;
        	}
        	
        	var eles=MTOUCH.getEmptyArray();
        	for(var i=0;i<this.length;i++){
    		    if(this[i].nodeType === 1)
    			    eles.push(this[i].parentNode);
    		}
        	return new MTOUCH._instance(eles);
        },
        /**
         * 循环操作
         */
        each: function( callback ) {
           for(var i=0;i<this.length;i++){
               if(callback.call(this[i],i,this[i]) === false)
                    break;
           }

           return this;
        },
        /*********** 事件绑定和解绑************/
        bind: function(eventName,fn){
            for(var i=0;i<this.length;i++){
                this[i].addEventListener(eventName, fn, false);
            }
            return this;
        },
        unbind: function(eventName,fn){
            for(var i=0;i<this.length;i++){
                this[i].removeEventListener(eventName, fn,false);
            }
            return this;
        }
    };

    /**
     * MTOUCH最终是通过的是find对象，需要防止find对象的原型继承
     */
    MTOUCH._instance.prototype = MTOUCH.fn;

    /**
     * 继承扩展，这里只不做深度copy
     */
    MTOUCH.extend = MTOUCH.fn.extend = function(o){
        var obj = o;
        if(typeof o === "function"){
            // 函数，则获取函数返回的结果对象
            obj = o.call(null,MTOUCH);
        }

        if(!obj) return;

        for(var key in obj){
            MTOUCH.fn[key] = obj[key];
        }
    };
    
    MTOUCH.ready = function(fn){
    	if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
    		// 需要立刻触发的
            fn.call(null);
            return;
        }else{
        	document.addEventListener("DOMContentLoaded", fn,false);
        }
    };

    /************属性操作扩展**********/
    MTOUCH.extend({
        html: function(v){
            if(v === undefined){
                // 取值，只取第1个值
                var ele = this[0];
                return (ele && ele.nodeType === 1) ? this[0].innerHTML : null;
            }

            for(var i=0;i<this.length;i++){
               this[i].innerHTML = v;
            }

            return this;
        },
        text: function(v){
            if(v === undefined){
                return MTOUCH.decodeHTML(this.html(v));
            }

            this.html(MTOUCH.encodeHTML(v));

            return this;
        },
        val:function(v){
            if(v === undefined) { //get
                var ele = this[0];
                if(!ele) return null;

                var hook = pMethod.valHooks[ele.nodeName.toLowerCase()];
                return hook ? hook.get(ele) : ele.value;
            }

            // set
            for(var i=0;i<this.length;i++){
                var ele = this[i];
                var hook = pMethod.valHooks[ele.nodeName.toLowerCase()];

                if(hook) {
                    hook.set(ele,v);
                }
                else{
                    ele.value = v;
                }
            }
            return this;
        },

        hasClass: function(v){
            for(var i=0;i<this.length;i++){
            	if(pMethod.hasClass(this[i],v))
                    return true;
            }
            return false;
        },

        addClass: function(v){
            for(var i=0;i<this.length;i++){
            	pMethod.addClass(this[i],v);
            }

            return this;
        },

        removeClass: function(v){
            for(var i=0;i<this.length;i++){
            	pMethod.removeClass(this[i],v);
            }
            return this;
        },

        toggleClass: function(v){
        	for(var i=0;i<this.length;i++){
        		pMethod.toggleClass(this[i],v);
        	}
        	return this;
        },

         /**
         * attr仅支持类似下面的操作，不支持函数操作
         * attr("src");
         * attr("src","1.htm");
         * attr({"src":"1.thm","width":"100%";})
         */
        attr:function(k, v){
        	return pMethod.attr(this,k,v);
        },

        /**
         * css仅支持类似下面的操作，不支持函数操作
         * css("top");
         * css("top","12px");
         * css({"left":"5px","top":"5px";})
         */
        css: function(k, v){
        	return pMethod.css(this,k,v);
        },

        blur: function() {
        	this[0].blur();
        	return this;
        },


        focus: function() {
        	this[0].focus();
        	return this;
        },

        size: function() {
        	return this.length;
        },
        remove: function(){
            var ele;
            for(var i=0;i<this.length;i++){
                ele = this[i];
                if(ele.parentNode)
                    ele.parentNode.removeChild(ele);
            }
            return this;
        },
        append: function(value){
        	if(value === undefined){
                return this;
            }

            var ele,isNode=value.nodeType;
            for(var i=0;i<this.length;i++){
                ele = this[i];
                if(isNode)
                    ele.appendChild(value);
                else
                    ele.innerHTML += value;
            }

            return this;
        },
        after: function(value){
        	if(value === undefined){
                return this;
            }
        	
        	var targetEl = this[0];
        	var parentEl = targetEl.parentNode;
             
            if(parentEl.lastChild == targetEl){
                 parentEl.appendChild(value);
            }else{
                 parentEl.insertBefore(value,targetEl.nextSibling);
            }            

            return this;
        }
    });

    /************属性行为扩展**********/
   MTOUCH.extend({
      /**
       * 直接去掉diplay属性来显示。
       */
      show: function(display){
    	  var ele,style,resetEle = [];
    	  display = display || "block";

          for(var i=0;i<this.length;i++){
        	ele = this[i];
        	style = ele.style;
        	if(style.display === "none"){
        		style.display = "";
        	}

        	if(style.display === "" && pMethod.css(ele,"display") === "none"){
        		// 直接显示block
        		resetEle.push(ele);
        	}
          }
          // 防止回流
          for(var i=0;i<resetEle.length;i++){
        	  resetEle[i].style.display = display;
          }

          return this;
      },

      hide: function(){
          for(var i=0;i<this.length;i++){
            this[i].style.display = "none";
          }
          return this;
      },
      // 隐藏和显示(可以占据当前位置)
      visibility: function(ret){
    	  for(var i=0;i<this.length;i++){
              this[i].style.visibility = (ret==true)?"inherit":"hidden";
          }
          return this;
      }
   });
   /****数据操作扩展***/
   MTOUCH.extend({
	   data: function(key, value) {
	   		var args1 = typeof value !== "undefined";
	
	   		if(args1) {
	   			pMethod.data.put(this[0], key, value);
	   			return this;
	   		}
	   		else {
	   			return pMethod.data.get(this[0], key);
	   		}
	   	},
	   /*
	    * 支持读取dom中的data-x 这样的数据
	    */
       dataset: function(k){
       	 return pMethod.dataset(this[0],k);
       }
   });
   /*********************************其他公用方法***************************/
  MTOUCH.encodeHTML = function(v){
      return v.replace ? v.replace(/</g,"&lt;").replace(/>/g,"&gt;") : v;
  };

  MTOUCH.decodeHTML = function(v){
      return v.replace ? v.replace(/&lt;/g,"<").replace(/&gt;/g,">") : v;
  };

  /*判断值是否在数组中*/
  MTOUCH.inArray = function(arrays,v){
      if(!arrays.length){   // 非数组
          return arrays == v;
      }
      for(var i=0;i<arrays.length;i++){
          if(arrays[i]==v){
              return true;
          }
      }

      return false;
  };

  MTOUCH.trim = function(str){
	  if(!str) return "";
      if(str.trim)
        return str.trim();
      else
        return str.replace(/^[\s\t ]+|[\s\t ]+$/g, '');
  };
  // string对象解析成json
  MTOUCH.parseJSON = function(data){
    if(typeof data !== "string" || !data) {
		return null;
	}

	if (window.JSON && window.JSON.parse) {
		try{
			return window.JSON.parse( data );
		}catch(e){
			return (new Function( "return " + MTOUCH.trim(data)))();
		}
	}

	return (new Function( "return " + MTOUCH.trim(data)))();
  };
  // json对象解析成string
  MTOUCH.stringify = function(obj){
	  if (window.JSON) {
          return JSON.stringify(obj);
      }
	  var t = typeof (obj);
      if (t != "object" || obj === null) {
          // simple data type
          if (t == "string") obj = '"' + obj + '"';
          return String(obj);
      } else {
          // recurse array or object
          var n, v, json = [], arr = (obj && obj.constructor == Array);

          // fix.
          var self = arguments.callee;

          for (n in obj) {
              v = obj[n];
              t = typeof(v);
              if (obj.hasOwnProperty(n)) {
                  if (t == "string") 
                	  v = '"' + v + '"'; 
                  else if (t == "object" && v !== null)
                      v = self(v);
                  json.push((arr ? "" : '"' + n + '":') + String(v));
              }
          }
          return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
      }
  };
  MTOUCH.pMethod = pMethod;
})();
/********************
*MTOUCH的ajax库
***********************/
(function(){
	/**
	 * ajax 相关的私有方法及默认设置支持
	 */
	var ajaxOptions = {
		processCount:0,

		//ajax 默认参数
		settings: {
			url: "",
			type: "GET",
			async: true,
			timeout: 0,
			cache:false,
			dataType: "html",
			data:null,
			start: null,
			end: null,
			complete: null,
			error: null,
			success: null,
			abort: null
		},

		accepts: {
			html: "text/html",
			json: "application/json, text/javascript"
		},

		converters: {
			"json": function(data) {
				return MTOUCH.parseJSON(data);
			}
		},

		getRequest: function(o) {
			var req = new XMLHttpRequest(),url = o.url;
			if(o.cache === false){
				if(url.indexOf("?") == -1){
					url += "?"+ (new Date()).getTime();
				}else{
					url += "&"+ (new Date()).getTime();
				}
			}
			req.open(o.type, url, o.async);
			if (o.type.toLowerCase() === 'post') {
				req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
			}
			
			req.setRequestHeader("Accept", ajaxOptions.accepts[o.dataType] + ", */*; q=0.01" || "*/*");
			return req;
		},

		json2QueryString: function(json) {
			  if(json == null) {
				  return null;
			  }

			  var s = [],
			  	type = typeof json,
			  	value;

			  if(type === "string") {
			      return json;
			  }

			  for(var k in json) {
			      value = json[k];
			      s.push(k + "=" + (value instanceof Array ? value.join(",") : encodeURIComponent(value)));
			  }

			  return s.join("&");
		}
	};
	
   /***********************************AJAX 功能扩展**********************************
    *AJAX因为不需要selector，所以不需要使用extend扩展到find对象中，直接写MTOUCH的属性就OK。
    */

   // 覆盖基本设置
   MTOUCH.ajaxSetup = function(settings){
	   $.pMethod.extend(ajaxOptions.settings, settings, true);
   };

   MTOUCH.getJSON = function(url, data, callback){
      return MTOUCH.get(url, data, callback, "json");
   };

   MTOUCH.get = function(url, data, callback, type){
       var options = {"url":url},
           tBack = typeof callback,
           tData = typeof data,
           success = (tBack === "function") ? callback : ((tData === "function") ? data : null),
           data = (tData === "object" || tData === "string") ? data : null,
           type = (typeof type === "string") ? type : ((tBack === "string") ? callback : ajaxOptions.settings.dataType);

           options.data = data;
           options.dataType = type;
           options.success = success;

       return MTOUCH.ajax(options);
   };


   MTOUCH.ajax = function(options){
	   options = $.pMethod.extend(options, ajaxOptions.settings);
	   if(options.data){
		   options.type = "POST";
	   }
       var req = ajaxOptions.getRequest(options),
           timeHandler,
           done = function() {
	    	   if(req.readyState === 4) {
	               if(timeHandler && timeHandler > 0) {
	                   window.clearTimeout(timeHandler);
	               }

	               delete req;

	               if((req.status >= 200 && req.status < 300) || req.status === 0) {
	                   if(options.success) {
	                       var data = req.responseText,
	                           parse = ajaxOptions.converters[options.dataType.toLowerCase()];
	                       // 204不需要解析
	                       if(parse && req.status != 204){
	                           data = parse(data);
	                       }

	                       // 成功回调
	                       options.success.call(null,data);
	                   }
	               }
	               else if(options.error) {
	               		options.error.call(null, options, req.status, req.responseText);
	               }

	               // fire complate
	               if(options.complete) {
	                   options.complete.call(null, options);
	               }

	               ajaxOptions.processCount -= 1;
	               if(ajaxOptions.processCount == 0) {
	            	   if(options.end) {
	            		   options.end.call(null, options);
	            	   }
	               }
	           }
           };

       if(options.async){
           req.onreadystatechange = done;

           // 异步设置超时才有意义
           if(options.timeout > 0){
               timeHandler = setTimeout(function(){
                   window.clearTimeout(timeHandler);
                   timeHandler = null;

                   // try abort
                   req.onreadystatechange = null;
                   if(req.abort) req.abort();

                   delete req;

                   //fire abort callback
                   if(options.abort) {
                      options.abort.call(null, options);
                   }
                    // fire complate
                   if(options.complete) {
                     options.complete.call(null, options);
                   }

                   //fire end
                   ajaxOptions.processCount -= 1;
	               if(ajaxOptions.processCount == 0) {
	            	   if(options.end) {
	            		   options.end.call(null, options);
	            	   }
	               }
               }, options.timeout);
           }
       }

       ajaxOptions.processCount += 1;
       // fire start event
       if(options.start) {
    	   options.start.call(null, options);
       }

       req.send(ajaxOptions.json2QueryString(options.data));
       if(!options.async) {
    	   done();
       }

       return this;
   };
})();
/*
 * 对CSS3动画效果的封装
 */
(function(){
	/**********************************动画效果*******************************/
	 MTOUCH.extend({
	    /**
	     * 采用CSS3的transition实现动画效果，目前仅支持webkit内核的浏览器，以后其他的浏览器再加
	     * cssProps : css属性值，JSON格式
	     * time: 动画时间(毫秒),默认400
	     * easing ：动画效果，linear(default),ease,ease-in,ease-out,ease-in-out,cubic-bezier
	     */
	    animate : function(cssProps,time,easing,callback){
	        var typeT = typeof time,typeE = typeof easing,
	            _time = (typeT==="number") ? time : 400,
	            _easing = (typeT === "string") ? time : ((typeE === "string") ? easing : "linear");
	            _callback = (typeT === "function") ? time : ((typeE === "function") ? easing : callback);
	            cssValue = "all " + _time + "ms " + _easing,
	            count = this.length,
	            callbacker = this,
	            transitionEnd = function() { //局部变量不会暴露到外部去的吧...
	                count--;
	                if(count == 0){
	                    // remove -webkit-transition propties
	                    for(var i=0;i<callbacker.length;i++){
	                        callbacker[i].style.removeProperty("-webkit-transition");
	                    }
	                    // unbind
	                    callbacker.unbind("webkitTransitionEnd", transitionEnd);
	                    // all transition end;
	                    if(_callback) _callback.call(callbacker);
	                }
	            };

	        for(var i=0;i<this.length;i++){
	            this[i].style["-webkit-transition"] = cssValue;
	        }
	        this.bind("webkitTransitionEnd", transitionEnd);
	        this.css(cssProps);
	    }
	 });
})();

/*
 * 对本地存储的封装，1个借口支持读、写
 * 删除接口支持正则
 */
(function(){
  MTOUCH.storage = {	
		  _storage : localStorage || null,
		  // 获取存储数据
		  val :	function(key,value){
			  var t_storage = MTOUCH.storage._storage;
			  if(!t_storage)
				  return null;
			  
			  var type = $.pMethod.getArgType(key,value);
			  if(type === 0)
				  return t_storage.getItem(key);
			  else if(type === 1){
				  t_storage.setItem(key,value);
				  return MTOUCH.storage;
			  }
		  },
		  /**
		   * 删除
		   * @key 字符串，直接删除key，可以支持正则表达式删除,"*"表示删除全部
		   */
		  remove : function(key){
			  var t_storage = MTOUCH.storage._storage;
			  if(!t_storage)
				  return null;
			  
			  if(typeof key === "string"){
				  if(key === "*")
					  t_storage.clear();
				  else
					  t_storage.removeItem(key);
			  }else if(key instanceof RegExp){
				  for(var i=t_storage.length-1;i>=0;i--){
					  var k = t_storage.key(i);
					  if(key.test(k)){
						  // 删除
						  t_storage.removeItem(k);
					  }
				  }
			  }
			  return MTOUCH.storage;
		  }
	  };
})();
/*
* hash的bind实现，支持bind某个函数触发某个函数，支持所有未bind的hash触发某个公用函数
* 在不支持hashchange的浏览器下，支持定时检测
*/
(function(){
	  /**
	   * 绑定hash改变
	   */
	  var xHash = {};
	  MTOUCH.bindHashChange = function(hash,fn){
		  xHash[hash] = fn;
	  };
	  /**
	   * 除了bindHashChange绑定后的hash可以用这个来触发
	   */
	  MTOUCH.bindOtherHashChange = function(fn){
		  xHash["__all__"] = fn;	
	  }; 		
	  MTOUCH.ready(function(){
		  var lastHash;
		  function doHashChange(){
			  var hash = location.hash.match(/#([^\?]+)/);
			  if(hash){
				  hash = hash[1];
			  }
		
			  if(xHash[hash]){
				  xHash[hash].call(null,hash);
			  }else if(xHash["__all__"]){
				  xHash["__all__"].call(null,hash);
			  }
		  }
		  function hashChangeCheck(){
			  if(location.hash!=lastHash){
				  doHashChange();
				  lastHash = location.hash;
			  }
		  }
		  if("onhashchange" in window){
			  
			  window.addEventListener("hashchange",doHashChange);
			  // 开始触发一次
			  doHashChange();
			  
		  }else{
			  // 老设备不支持hashchange，定时检查
			  window.setInterval(hashChangeCheck,200);
		  }
	  });
})();

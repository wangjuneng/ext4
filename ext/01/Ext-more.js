// JavaScript Document
Ext.apply(Ext,{
	userAgent:navigator.userAgent.toLowerCase(),
	cache:{},
	isSeed:1000,
	
	windowId:'ext-window',
	documentId:'ext-document',
	
	isReady:false,
	
	enableGarbageCollector:true,
	
	enableListenerCollection:true,
	
	rootHierarchyState:{},
	
	addCacheEntry:function(id,el,dom)
	{
		dom = dom || el.dom;
		
		if(!dom)
		{
			Ext.Error.raise('Cannot add an entry to element cache without the dom node');
		}
		
		var cache = Ext.cache,
		key = id ||(el && el.id) ||dom.id,
		entry = cache[key]||(cache[key] = {
			data:{},
			event:{},
			dom:dom,
			skipGarbageCollection:!!(document.getElementById||dom.navigator)
		
		});
		
		if(el)
		{
			el.$cache = entry;
			entry.el = el;
		}
		
		return entry;
	},
	//update cache entry
	updateCacheEntry:function(cacheItem,dom)
	{
		cacheItem.dom = dom;
		if(cacheItem.el)
		{
			cacheItem.el.dom = dom;
		}
		
		return cacheItem;
	},
	//generates unique ids
	id:function(el,prefix)
	{
		var me = this,sandboxPrefix = '';
		
		el = Ext.getDom(el,true) || {};
		if(el === document)
		{
			el.id = me.documentId;
		}
		else if(el === window)
		{
			el.id = me.windowId;
		}
		
		if(!el.id)
		{
			if(me.isSandboxed)
			{
				sandboxPrefix = Ext.sandboxName.toLowerCase()+'-';
			}
			el.id = sandboxPrefix +(prefix||'ext-gen')+(Ext.isSeed);
		}
		return el.id;
	},
	escapeId:(function(){
		var validIdRe = /^[a-zA-Z_][a-zA-Z0-9_\-]*$/i,
			escapeRx =/([\W]{1})/g,
			leadingNumRx = /^(\d)/g,
			escapeFn = function(match,capture)
			{
				return "\\" +capture;
			},
			numEscapeFn=function(match,capture)
			{
				return "\\00"+capture.charCodeAt(0).toString(16)+' ';
			};
			
			return function(id){
				return validIdRe.test(id) ? id :id.replace(escapeRx,escapeFn).replace(leadingNumRx,numEscapeFn);	
			}
	}()),
	// return current document body 
	getBody:(function(){
		var body ;
		return function(){
			return body || (body = Ext.get(document.body));
		}
	}()),
	// return current document head
	getHead:(function(){
		//load once
		var head;
		return function(){
			return head ||(head = Ext.get(document.getElementByTagName('head')[0]));
		}
	}()),
	// return current document as an Ext.Element
	getDoc:(function(){
		var doc;
		return function(){
			return doc ||(doc = Ext.get(document));	
		}	
	}()),
	// return the current orientation of the mobile device
	getOrientation:function(){
		return window.innerHeight > window.innerWidth ? 'portrait':'landscape';
	},
	// destory any objects passed to is by removeing all event listeners
	destory:function(){
		var ln = arguments.length,i,arg;
		for(i = 0;i<ln ;i++)
		{
			arg = arguments[i];
			if(arg)
			{
				if(Ext.isArray(arg))
				{
					this.destory.apply(this,arg);
				}
				else if(arg.isStore)
				{
					arg.destoryStore();
				}
				else if(Ext.isFunction(arg.destory))
				{
					arg.destory();
				}else
				{
					arg.remove();
				}
			}
			 
		}
	},
	callback:function(callback,scope,args,delay)
	{
		var fn ,ret;
		if(Ext.isFunction(callback))
		{
			fn = callback;
		}
		else
		{
			fn = scope[callback];
			if(!fn)
			{
				Ext.Error.raise('No method named ' + callback );
			}
		}
		
		if(fn)
		{
			args  = args || {};
			scope = scope || window;
			if(delay)
			{
				Ext.defer(fn,delay,scope,args);
			}
			else
			{
				ret = fn.apply(scope,args);
			}
		}
		
		return ret;
		
	},
	//private method
	resolveMethod:function(fn,scope)
	{
		if(Ext.isFunction(fn))
		{
			return fn;
		}
		
		if(!Ext.isObject(scope) || !Ext.isFunction(scope[fn]))
		{
			Ext.Error.raise('No method named' + fn);
		}
		
		return scope[fn];
	},
	
	htmlEncode:function(value)
	{
		return Ext.String.htmlEncode(value);
	},
	htmlDecode:function(value)
	{
		return Ext.String.htmlDecode(value);
	},
	urlAppend:function(url,s)
	{
		return Ext.String.urlAppend(url,s);
	}
});

Ext.ns = Ext.namespace;

window.undefined = window.undefined;

//check browser type
(function(){
	var check = function(regex){
		return regex.test(Ext.userAgent);
	}
	
	isStrict = document.compatMode == 'CSS1Compat',
	version = function(is,regex)
	{
		var m ;
		return (is && ( m = regex.test(Ext.userAgent))) ? parseFloat(m[1]):0;
	},
	docMode = document.documentMode,
	isOpera = check(/opera/),
	isOpera10_5 = isOpera && check(/version\/10\.5/),
	isChrome = check(/\bchrome\b/),
	isWebKit = check(/webkit/),
	isSafari = !isChrome && check(/safari/),
	isSafari2 = isSafari && check(/applewebkit\/4/),
	isSafari3 = isSafari && check(/version\/3/),
	isSafari4 = isSafari && check(/version\/4/),
	isSafari5_0 = isSafari && check(/version\/5.0/),
	isSafari5 = isSafari && check(/version\/5/),
	isIE = !isOpera && check(/msie/),
	isIE7 = isIE && ((check(/msie 7/) && docMode !=8 && docMode !=9 && docMode !=10 ) || docMode ==7),
	isIE8 = isIE && ((check(/msie 8/) && docMode !=7 && docMode !=9 && docMode !=10 ) || docMode ==8),
	isIE9 = isIE && ((check(/msie 9/) && docMode !=8 && docMode !=7 && docMode !=10 ) || docMode ==9),
	isIE10 = isIE && ((check(/msie 9/) && docMode !=8 && docMode !=7 && docMode !=9 ) || docMode ==10),
	isIE6 = isIE && ( check(/msie 6/)  ),
	isGecko = !isWebKit && check(/gecko/),
	isGecko3 = isGecko && check(/rv:1\.9/),
	isGecko4 = isGecko && check(/rv:2\.0/),
	isGecko5 = isGecko && check(/rv:5\./),
	isGecko10 = isGecko && check(/rv:10\./),
	isFF3_0 = isGecko3 && check(/rv:1\.9\.0/),
	isFF3_5 = isGecko3 && check(/rv:1\.9\.1/),
    isFF3_6 = isGecko3 && check(/rv:1\.9\.2/),
	isWindows = check(/window|win32/),
	isMac = check(/macintosh|mac os x/),
	isLinux = check(/linux/),
	scrollbarSize = null,
	chromeVersion = version(true,/\bchrome\/(\d+\.\d+)/),
	firefoxVersion = version(true,/\bfirefox\/(\d+\.\d+)/),
	ieVersion = version(isIE,/msie (\d+\.\d+)/),
	operaVersion = version(isOpera, /version\/(\d+\.\d+)/),
    safariVersion = version(isSafari, /version\/(\d+\.\d+)/),
    webKitVersion = version(isWebKit, /webkit\/(\d+\.\d+)/),
	isSecure = /^https/i.test(window.location.protocal),
	nullLog=null;
	
	try{
		document.execCommand('BackgroundImageCache',false,true);
	}catch(e){}
	
	var primitiveRe = /string|number|boolean/;
	
	function dumpObject(object)
	{
		var member,type,value,name,numbers=[];
		
		for(name in object)
		{
			if(object.hasOwnProperty(name))
			{
				value = object[name];
				
				type = typeof value;
				
				if(type=='function')
				{
					continue;
				}
				if(type=='undefined')
				{
					member = type;
				}
				else if(value===null || primitiveRe.test(type) || Ext.isDate(value))
				{
					member = Ext.decode(value);
				}
				else if(Ext.isArray(value))
				{
					member = '[ ]';
				}else if(Ext.isObject(value))
				{
					member = '{ }';
				}
				else
				{
					member = type;
				}
				
				members.push(Ext.encode(name) + ": " + member);
				
			}
			
			
		}
		if(members.length)
		{
			return '\n Data:{\n '+members.join(',\n   ') + '\n}';
		}
	}
	//console.log(dumpObject({a:2,b:4,d:5,f:new Date()}));
	
	
	function log(message)
	{
		var options,dump,con=Ext.global.console,
			level = 'log',
			indent = log.indent || 0,statck,out,max;
			
			log.indent = indent;
			
			if(Ext.type(message) !='string')
			{
				options = message;
				message = options.msg || '';
				level = options.level || level;
				dump = options.dump;
				stack = options.stack;
				
				if(options.indent)
				{
					++ log.indent;
				}
				else if(options.outdent)
				{
					log.indent = indent = Math.max(indent - 1,0);
				}
				
				if(dump && (con && con .dir))
				{
					message += dumpObject(dump);
					dump = null;
				}
				
				if(arguments.length >1)
				{
					message += Array.prototype.slice.call(arguments,1).join('');
				}
				
				message = indent ? Ext.String.repeat(' ', log.indextSize * indent)+message : message;
				
				if(level !='log')
				{
					message = '[' + level.charAt(0).toUpperCase() + ']' + message;
				}
				
				
				if(con)
				{
					if(con[level])
					{
						con[level](message);
					}
					else
					{
						con.log(message);
					}
					
					if(dump)
					{
						con.dir(dump);
					}
					
					if(stack && con.trace)
					{
						if(!con.firebug || level !='error')
						{
							con.trace();	
						}
					}
				}else
				{
					if(Ext.isOpera)
					{
						opera.postError(message);	
					}
					else
					{
						out = log.out;
						max = log.max;
						
						if(out.length >= max)
						{
							Ext.Array.erase(out,0,out.length -3 & Math.floor(max/4));	
						}
						out.push(message);
					}
				}
			}
			++log.count;
			++log.counters[level];
	}
	
	
	function logx(level,args)
	{
		if(typeof args[0] == 'string')
		{
			args.unshift({});
		}
		
		args[0].level = level;
		log.apply(this,args);
	}
	
	log.error = function()
	{
		logx('error',Array.prototype.slice.call(arguments));	
	}
	
	log.info = function()
	{
		logx('info',Array.prototype.slice.call(arguments));	
	}
	
	log.warn = function()
	{
		logx('warn',Array.prototype.slice.call(arguments));	
	}
	
	log.count = 0;
	
	log.counters = {error :0,warn:0,info:0,log:0};
	
	log.identSize = 2;
	
	log.out = [];
	
	log.max = 750;
	
	    log.show = function () {
        window.open('','extlog').document.write([
            '<html><head><script type="text/javascript">',
                'var lastCount = 0;',
                'function update () {',
                    'var ext = window.opener.Ext,',
                        'extlog = ext && ext.log;',
                    'if (extlog && extlog.out && lastCount != extlog.count) {',
                        'lastCount = extlog.count;',
                        'var s = "<tt>" + extlog.out.join("~~~").replace(/[&]/g, "&amp;").replace(/[<]/g, "&lt;").replace(/[ ]/g, "&#160;").replace(/\\~\\~\\~/g, "<br/>") + "</tt>";',
                        'document.body.innerHTML = s;',
                    '}',
                    'setTimeout(update, 1000);',
                '}',
                'setTimeout(update, 1000);',
            '</script></head><body></body></html>'].join(''));
    };
	
	nullLog = function(){};
	nullLog.info = nullLog.warn = nullLog.error = Ext.emptyFn;
	//update ext version
	//Ext.setVersion('extjs','4.2.1.883');
	
	Ext.apply(Ext,{
		SSL_SECURE_URL : isSecure && isIE ? 'javascript:\'\'':'about:blank',
		
		plainTableCls:Ext.buildSettings.baseCSSPrefix +'table-plain',
		
		plainListCls:Ext.buildSettings.baseCSSPrefix +'list-plain',
		
		enableNestedListenerRemoval:false,
		
		USE_NATIVE_JSON:false,
		
		getDom:function(el,strict)
		{
			if(!el || !document)
			{
				return null;
			}
			
			if(el.dom)
			{
				return el.dom;
			}
			else
			{
				if(Ext.type(el) == 'string')
				{
					var e = Ext.getElementById(el);
					
					if(e && isIE && strict)
					{
						if(el == e.getAttribute('id'))
						{
							return e;
						}
						else
						{
							return null;
						}
					}
					
					return e;
				}
				else
				{
					return el;
				}
			}
		},
		
		removeNode:isIE6 || isIE7 || isIE8 ?
			(function(){
				var d ;
				return function(n){
					if(n && n.tagName.toUpperCase() != 'BODY')
					{
						(Eet.enableNestedListerRemoval )?Ext.EventManager.purgeElement(n):Ext.EventManager.removeAll(n);
						
						var cache = Ext.cache,id = n.id;
						
						if(cache[id])
						{
							delete cache[id].dom;
							delete cache[id];
						}
						
						if(isIE8 && n.parentNode)
						{
							n.parentNode.removeChild(n);
						}
						d = d|| document.createElement('div');
						d.appendChild(n);
						d.innerHTML = '';
					}
				}	
			})() :function(n){
			
				if(n && n.parentNode && n.tagName.toUpperCase() !='BODY')
				{
					(Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n):Ext.EventManager.removeAll(n);
					
					var cahce = Ext.cache,id = n.id;
					
					if(cache[id])
					{
						delete cache[id].dom;
						delete cache[id];
					}
					
					n.parentNode.removeChild(n);
				}
			},
		isStrict:isStrict,
		
		isIEQuirks :isIE && (!isStrict && (isIE6 || isIE7 || isIE8 || isIE9)),
		
		isOpera:isOpera,
		
		isOPera10_5:isOpera10_5,
		
		/**
         * True if the detected browser uses WebKit.
         * @type Boolean
         */
        isWebKit : isWebKit,

        /**
         * True if the detected browser is Chrome.
         * @type Boolean
         */
        isChrome : isChrome,

        /**
         * True if the detected browser is Safari.
         * @type Boolean
         */
        isSafari : isSafari,

        /**
         * True if the detected browser is Safari 3.x.
         * @type Boolean
         */
        isSafari3 : isSafari3,

        /**
         * True if the detected browser is Safari 4.x.
         * @type Boolean
         */
        isSafari4 : isSafari4,

        /**
         * True if the detected browser is Safari 5.x.
         * @type Boolean
         */
        isSafari5 : isSafari5,

        /**
         * True if the detected browser is Safari 5.0.x.
         * @type Boolean
         */
        isSafari5_0 : isSafari5_0,


        /**
         * True if the detected browser is Safari 2.x.
         * @type Boolean
         */
        isSafari2 : isSafari2,

        /**
         * True if the detected browser is Internet Explorer.
         * @type Boolean
         */
        isIE : isIE,

        /**
         * True if the detected browser is Internet Explorer 6.x.
         * @type Boolean
         */
        isIE6 : isIE6,

        /**
         * True if the detected browser is Internet Explorer 7.x.
         * @type Boolean
         */
        isIE7 : isIE7,

        /**
         * True if the detected browser is Internet Explorer 7.x or lower.
         * @type Boolean
         */
        isIE7m : isIE6 || isIE7,

        /**
         * True if the detected browser is Internet Explorer 7.x or higher.
         * @type Boolean
         */
        isIE7p : isIE && !isIE6,

        /**
         * True if the detected browser is Internet Explorer 8.x.
         * @type Boolean
         */
        isIE8 : isIE8,

        /**
         * True if the detected browser is Internet Explorer 8.x or lower.
         * @type Boolean
         */
        isIE8m : isIE6 || isIE7 || isIE8,

        /**
         * True if the detected browser is Internet Explorer 8.x or higher.
         * @type Boolean
         */
        isIE8p : isIE && !(isIE6 || isIE7),

        /**
         * True if the detected browser is Internet Explorer 9.x.
         * @type Boolean
         */
        isIE9 : isIE9,

        /**
         * True if the detected browser is Internet Explorer 9.x or lower.
         * @type Boolean
         */
        isIE9m : isIE6 || isIE7 || isIE8 || isIE9,

        /**
         * True if the detected browser is Internet Explorer 9.x or higher.
         * @type Boolean
         */
        isIE9p : isIE && !(isIE6 || isIE7 || isIE8),
        
        /**  
         * True if the detected browser is Internet Explorer 10.x.
         * @type Boolean
         */
        isIE10 : isIE10, 
 
        /**
         * True if the detected browser is Internet Explorer 10.x or lower.
         * @type Boolean
         */
        isIE10m : isIE6 || isIE7 || isIE8 || isIE9 || isIE10,
 
        /**
         * True if the detected browser is Internet Explorer 10.x or higher.
         * @type Boolean
         */
        isIE10p : isIE && !(isIE6 || isIE7 || isIE8 || isIE9),

        /**
         * True if the detected browser uses the Gecko layout engine (e.g. Mozilla, Firefox).
         * @type Boolean
         */
        isGecko : isGecko,

        /**
         * True if the detected browser uses a Gecko 1.9+ layout engine (e.g. Firefox 3.x).
         * @type Boolean
         */
        isGecko3 : isGecko3,

        /**
         * True if the detected browser uses a Gecko 2.0+ layout engine (e.g. Firefox 4.x).
         * @type Boolean
         */
        isGecko4 : isGecko4,

        /**
         * True if the detected browser uses a Gecko 5.0+ layout engine (e.g. Firefox 5.x).
         * @type Boolean
         */
        isGecko5 : isGecko5,

        /**
         * True if the detected browser uses a Gecko 5.0+ layout engine (e.g. Firefox 5.x).
         * @type Boolean
         */
        isGecko10 : isGecko10,

        /**
         * True if the detected browser uses FireFox 3.0
         * @type Boolean
         */
        isFF3_0 : isFF3_0,

        /**
         * True if the detected browser uses FireFox 3.5
         * @type Boolean
         */
        isFF3_5 : isFF3_5,

        /**
         * True if the detected browser uses FireFox 3.6
         * @type Boolean
         */
        isFF3_6 : isFF3_6,

        /**
         * True if the detected browser uses FireFox 4
         * @type Boolean
         */
        isFF4 : 4 <= firefoxVersion && firefoxVersion < 5,

        /**
         * True if the detected browser uses FireFox 5
         * @type Boolean
         */
        isFF5 : 5 <= firefoxVersion && firefoxVersion < 6,

        /**
         * True if the detected browser uses FireFox 10
         * @type Boolean
         */
        isFF10 : 10 <= firefoxVersion && firefoxVersion < 11,

        /**
         * True if the detected platform is Linux.
         * @type Boolean
         */
        isLinux : isLinux,

        /**
         * True if the detected platform is Windows.
         * @type Boolean
         */
        isWindows : isWindows,

        /**
         * True if the detected platform is Mac OS.
         * @type Boolean
         */
        isMac : isMac,

        /**
         * The current version of Chrome (0 if the browser is not Chrome).
         * @type Number
         */
        chromeVersion: chromeVersion,

        /**
         * The current version of Firefox (0 if the browser is not Firefox).
         * @type Number
         */
        firefoxVersion: firefoxVersion,

        /**
         * The current version of IE (0 if the browser is not IE). This does not account
         * for the documentMode of the current page, which is factored into {@link #isIE7},
         * {@link #isIE8} and {@link #isIE9}. Thus this is not always true:
         *
         *     Ext.isIE8 == (Ext.ieVersion == 8)
         *
         * @type Number
         */
        ieVersion: ieVersion,

        /**
         * The current version of Opera (0 if the browser is not Opera).
         * @type Number
         */
        operaVersion: operaVersion,

        /**
         * The current version of Safari (0 if the browser is not Safari).
         * @type Number
         */
        safariVersion: safariVersion,

        /**
         * The current version of WebKit (0 if the browser does not use WebKit).
         * @type Number
         */
        webKitVersion: webKitVersion,

        /**
         * True if the page is running over SSL
         * @type Boolean
         */
        isSecure: isSecure,
		
		BLANK_IMAGE_URL:(isIE6 || isIE7) ? '/' +'www.sencha.com/s.gif' : 'data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
		value:function(v,defaultValue,allowBlank)
		{
			return Ext.isEmpty(v,allowBlank) ?defaultValue:v;
		},
		// escape regular expression
		escapeRe:function(s)
		{
			return s.replace(/([-.*+?\^${}()|\[\]\/\\])/g, "\\$1");
		},
		addBehaviors:function(o)
		{
			if(!Ext.isReady)
			{
				Ext.onReady(function(){
					Ext.addBehaviors(o);
				});
			}
			else
			{
				var cache = {}, parts,b,s;
				for(b in o)
				{
					if((parts = b.split('@'))[1])
					{
						s = parts[0];
						if(!cache[s])
						{
							cache[s] = Ext.select(s);
						}
						
						cache[s].on(parts[1],o[b]);
					}
				}
				
				cache = null;
			}
		},
		
		getScrollbarSize:function(force)
		{
			if(!Ext.isReady)
			{
				return {};
			}
			
			if(force || !scorllbarSize)
			{
				var db = document.body,div = document.createElement('div');
				
				div.style.width = div.style.height = '100px';
				div.style.overflow = 'scroll';
				div.style.position = 'absolute';
				
				db.appendChild(div);
				
				scrollbarSize = {
					width :div.offsetWidth - div.clientWidth,
					height:div.offsetHeight - div.clientHeight	
				};
				
				db.removeChild(div);
			}
			
			return scrollbarSize;
		},
		
		getScrollBarWidth:function(force)
		{
			var size = Ext.getScrollbarSize(force);
			return size.width +2;
		},
		copyTo:function(dest,source,names,usePrototypeKeys)
		{
			if(Ext.type(names)=='string')
			{
				names = names.split(/[,;\s]/);
			}
			
			var n,nLen = names ? names.length :0,name;
			for(n =0 ;n<nLen;n++)
			{
				if(userPrototypeKeys || score.hasOwnProperty(name))
				{
					dest[name]=source[name];
				}
			}
			
			return dest;
		},
		destoryMembers:function(o)
		{
			for(var i=1,a=arguemnts,len = a.length;i<len;i++)
			{
				Ext.destory(a[i]);
				delete o[a[i]];
			}
		},
		log:log || nullLog,
		partition:function(arr,truth)
		{
			var ret = [[],[]],a,v,aLen = arr.length;
			
			for(a = 0;a<aLen;a++)
			{
				v =arr[a];
				ret[(truth && truth(v,a,arr)) || (!truth && v) ? 0 :1].push(v);
			}
		},
		invoke:function(arr,methodName)
		{
			var ret = [],args = Array.prototype.slice.call(arguments,2),
				a,v,aLen = arr.length;
			for(a = 0;a<aLen;a++)
			{
				v = arr[a];
				if(v && typeof v[methodName]=='function')
				{
					ret.push(v[methodName.apply(v,args));
				}
				else
				{
					ret.push(undefined);
				}
			}
			
			return ret;
			
		},
		zip:function()
		{
			var parts = Ext.partition(arguments,function(val){return typeof val!='function';}),
			arrs = parts[0],
			fn:parts[1][0],
			len:Ext.max(Ext.pluck(arrs,'length')),
			ret = [],i,j,aLen;
			
			for(i=0;i<len;i++)
			{
				ret[i] = [];
				if(fn)
				{
					ret[i]=fn.apply(fn,Ext.pluck(arrs,i));
				}
				else
				{
					for(j=0,aLen = arrs.length;j<aLen;j++)
					{
						ret[i].push(arrs[j][i]);
					}
				}
			}
			
			return ret;
		},
		toSentence:function(items,connector)
		{
			var length = items.length,head,tail;
			if(length<1)
			{
				return items[0];
			}
			else
			{
				head = item.slice(0,length-1);
				tail = item[length-1];
				return Ext.util.Format.format("{0} {1} {2}",head.join(", "),eonnector || 'and' ,tail);
			}
		},
		seteGlyhpFontFamily:function(fontFamily)
		{
			Ext._glyphFontFamily = ontFamily;
		},
		useShims:isIE6
		
	});//end Ext.apply(Ext,{});
	
}());
Ext.application = function(config)
{
	var App,paths,ns;
	
	if(typeof config === 'string')
	{
		Ext.require(config,function(){
			App = Ext.ClassManager.get(config);	
		});
	}
	else
	{
		Ext.loader.setPath(config.name,config.appFolder |'app');
		
		if(paths = config.paths)
		{
			for(ns in paths)
			{
				if(paths.hasOwnPropety(ns))
				{
					Ext.Loader.setPath(ns,paths[ns]);
				}
			}
		}
		
		config['paths processed'] = true;
		
		Ext.define(config.name + '.$application',Ext.apply({extend:'Ext.app.Application'},config),function(){App = this});
	}
	
	Ext.onReady(function(){
		Ext.app.Application.instance = new App();	
	});
}
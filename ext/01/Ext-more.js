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
	isSafari_5 = isSafari && check(/version\/5/),
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
	isWindow = check(/window|win32/),
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
	console.log(dumpObject({a:2,b:4,d:5,f:new Date()}));
}());
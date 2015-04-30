// JavaScript Document
//定义全局Ext变量
var Ext = Ext ||{};
Ext._startTime = new Date().getTime();
(function(){
	var global = this,
	     objectPrototype = Object.prototype,
		 toString = objectPrototype.toString,
		 //是否支持for循环可枚举
		 enumerables = true,
		 enumberablesTest = {toString:1},
		 //定义空函数
		 emptyFn = function(){},
		 
		 //调用被子类覆盖的父方法
		 callOverrideParent = function(){
			 //返回方法调用者
			 var method = callOverrideParent.caller.caller;
			 
			 //调用父类方法
			 return method.$owner.prototype[method.name].apply(this,arguments);
		 },
		 i,
		 nonWhitespaceRe = /\S/,
		 ExtApp,
		 iterableRe = /\[object\s*(?:Array|Arguments|\w*Collection|\w*List|Html\s+document\.all\s+class)\]/;
		
	Function.prototype.$extIsFunciton = true,
	 Ext.global = global;
	
	for(i in enumberablesTest)
	{
		enumberables = null;
	}
	
	if(enumberables)
	{
		enumberables = ['hasOwnProperty','valueOf','isPrototypeOf','propertyIsEnumberable','toLocaleString','toString','constructor'];
	}
	
	Ext.enumberables = enumberables;
	
	//Ext 潜拷贝
	Ext.apply = function(object,config,defaults)
	{
		if(defaults)
		{
		   Ext.apply(object,defaults);	
		}
		
		if(object && config && typeof config === 'object')
		{
			var i , j ,k;
			for(i in config)
			{
				object[i] = config[i];
			}
			
			if(enumberables)
			{
				for(j=enumerables.length;j--;)
				{
					k = enumberables[j];
					if(config.hasOwnProperty(k))
					{
						object[k] = config[k];
					}
				}
			}
		}
		
		return object;
		
	}
	
	//设置css前缀
	Ext.buildSettings = Ext.apply({
		baseCSSPrefix : 'x-'
	},Ext.buildSettings ||{});
	
	//扩展Ext基本属性 name,emptyFn identifyFn,emptyString
	Ext.apply(Ext,{
		
		name:Ext.sandboxName || 'Ext',
		
		emptyFn:emptyFn,
		
		identifyFn:function(o){
			return o;	
		},
		
		//空字符串
		emptyString:new String(),
		
		baseCssPrefix:Ext.buildSettings.baseCSSPrefix,
		
		//copy  若目标对象中没有此属性 则从原对象中复制属性
		applyIf:function(object,config){
			var property;
			
			if(object){
				for(property in config){
					if(object[property] === undefined)
					{
						object[property] = config[property];	
					}
				}	
			}
			
			return object;
		},
		
		//test Ext.applyOf
		//var aaa = {a:123},bbb={a:1,b:12};
		//console.log(Ext.apply(aaa,bbb));
		//console.log(Ext.applyIf(aaa,bbb));
		
		//遍历 array or object
		iterate:function(object,fn,scop)
		{
			if(Ext.isEmpty(object))
			{
				return;
			}
			
			if(scope === undefined)
			{
				scope = object;
			}
			
			//判断对象是否为Array
			if(Ext.isIterator(object))
			{
				Ext.Array.each.call(Ext.Array,object,fn,scope);
			}
			else
			{
				Ext.Object.each.call(Ext.Object,object,fn,scope);
			}
			
		}

	});
	

	Ext.apply(Ext,{
		
		//此方法已被Ext.define 代替
		extend:(function(){
			var objectConstructor = objectPrototype.constructor,
			    inlineOverrides = function(o){
					for(var m in o){
						if(o.hasOwnProperty(m))
						{
							this[m]=o[m];
						}
					} 
				};
				
			 return function(subclass,supperclass,overrides){
				if(Ext.isObject(supperclass))
				{
					overrides = supperclass;
					supperclass = subclass;
					subclass = overrides.constructor != objectConstructor ? overrides.constructor:function(){
						supperclass.apply(this,arguments);
   					}
				}
				if(!supperclass){
					Ext.Error.raise({
						sourceClass:'Ext',
						sourceMethod:'extend',
						msg:'页面未加载完成进行调用'
					});	
				}
				
				var F = function(){},
					subclassProto,superclassProto = superclass.prototype;
				
				F.prototype = supperclassProto;
				subclassProto = subclass.prototype=new F();
				subclass.supperclass = supperclassProto;
				
				if(superclassProto.constructor === objectConstructor){
					supperclassProto.constructor = supperclass;	
				}
				
				subclass.override = function(overrides){
					Ext.override(subclass,overrides);	
				};
				
				
				subclassProto.override = inlineOverrides;
				
				subclassProto.proto = subclassProto;
				
				subclass.verride(overrides);
				
				subclass.extend = function(o)
				{
					return Ext.extend(subclass,o);	
				}
				
				return subclass;
				
			 }
		})(),
		
		override:function(target,overrides)
		{
			if(target.$isClass)
			{
				target.override(overrides);	
			}
			else if(typeof target == 'function')
			{
				Ext.apply(target.prototype,overrides);
			}
			else
			{
				var owner = target.self,name,value;
				
				if(owner  && owner.$isClass)
				{
					for(name in overrides)
					{
						if(overrides.hasOwnProperty(name))
						{
							value = overrides[name];
							
							if(typeof value == 'function')
							{
								if(owner.$className){
									value.displayName = owner.$className +"#"+name;
								}
								value.$name = name;
								
								value.$owner = owner;
								
								value.$previous = target.hasOwnProperty(name)?target[name] : callOverrideParent;
							}
							target[name] = value;
						}
					}
				}
				else
				{
					Ext.apply(target,overrides);
				}
			}
			
			return target;
		}
	
	});
	
	//添加静态方法
	Ext.apply(Ext,{
	
		valueForm:function(value,defaultValue,allowBlank)
		{
			return Ext.isEmpay(value,allowBlank) ? defaultValue : value;
		},
		
		typeOf:function(value)
		{
			var type,typeToString;
			
			if(value===null)
			{
				return 'null';
			}
			
			type = typeof value;
			
			if(type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean')
			{
				return type;
			}
			
			typeToString = toString.call(value);
			
			switch(typeToString)
			{
				case '[object Array]':
					return 'array';
				case '[object Date]':
					return 'date';
				case '[object Bollean]':
					return 'boolean';
				case '[object Number]':
					return 'number';
				case '[object RegExp]':
					return 'regexp';
			}
			
			if(type === 'function')
			{
				return 'function';
			}
			
			if(type === 'object')
			{
				if(value.nodeType !== undefined)
				{
					if(value.nodeType === 3)
					{
						return (nonWhitespaceRe).test(value.nodeValue)?'textnode':'whitespace';
					}
					else
					{
						return 'element';
					}
				}
				
				return 'object';
			}
		},
		coerce:function(from,to)
		{
			var fromType = Ext.typeOf(from),
				toType = Ext.typeOf(to),
				isString = typeof from === 'string';
				
			if(fromType !== toType)
			{
				switch(toType)
				{
					case 'string':
						return String(from);
					case 'number':
						return Number(from);
					case 'boolean':
						return isString && (!from || from==='false') ? false :Boolean(from);
					case 'null':
						return isString && (!form || from=== 'null') ? null :from;
					case 'undefined':
						return isString && (!from || from==='undefinded')?'undefined':from;
					case 'date':
						return isString && isNaN(from) ? Ext.Date.parse(from,Ext.Date.defaultFormat):Date(Number(from));
				}
			}
			
			return from;
		},
		//判断字符串是否为空，数组是否有数据
		isEmpty:function(value,allowEmptyString)
		{
			return (value===null) || (value=== undefined) || (!allowEmptyString ? value==='' :false)||(Ext.isArray(value) && value.length===0);
		},
		//判断数组
		isArray:('isArray' in Array) ? Array.isArray:function(value)
		{
			return toString.call(value) === '[object Array]';
		},
		isDate:function(value)
		{
			return Ext.typeOf(value) === 'date';
		},
		isObject:function(value)
		{
			return Ext.typeOf(value)=='object';
		},
		isSimpleObject:function(value)
		{
			return value instanceof Object && value.constructor === Object;
		},
		//判断基本数据类型,
		isPrimitive:function(value)
		{
			var type = typeof value;
			return type === 'string' || type==='number' || type ==='boolean';
		},
		isFunction:function(value)
		{
			return !!(value && value.$extIsFunction);
		},
		isNumber:function(value)
		{
			return typeof value ==='number' && isFinite(value);
		},
		isNumberic:function(value)
		{
			return !isNaN(parseFlost(value)) && isFinite(value);
		},
		isString:function(value)
		{
			return Ext.typeOf(value) ==='string';
		},
		isBoolean:function(value)
		{
			return Ext.typeOf(value) ==='boolean';
		},
		isElement:function(value)
		{
			return Ext.typeOf(value) === 'element';
		},
		isTextNode:function(value)
		{
			return Ext.typeOf(value) === 'textnode' || Ext.typeOf(value)==='whitespace'
		},
		isDefined:function(value)
		{
			return Ext.typeOf(value) !== 'undefined';
		},
		isIterable:function(value)
		{
			if(!value || typeof value.length !== 'number' || typeof value==='string' || value.$extIsFunction)
			{
				return false;
			}
			
			if(!value.propertyIsEnumberable)
			{
				return !!value.item;
			}
			
			if(value.hasOwnProperty('length') && !value.propertyIsEnumberable('length'))
			{
				return true;
			}
			
			return iterableRe.test(toString.call(value));
		}
		
		 //console.log(Ext.isIterable(new Date()));	
	});
	
	
	Ext.apply(Ext,{
		clone:function(item)
		{
			var type,i,j,k,clone,key;
			if(item === null || item === undefined)
			{
				return item;
			}
			
			//clone document element
			if(item.nodeType && item.cloneNode)
			{
				return item.cloneNode(true);
			}
			
			type = Ext.typeOf(item);
			if(type==='date')
			{
				return new Date(item.getTime());
			}
			
			if(type==='array')
			{
				i = item.length;
				clone = [];
				while(i--)
				{
					clone[i] = Ext.clone(item[i]);
				}
				
			}
			else if(type==='object' && item.construcator === Object)
			{
				clone = {};
				for(key in item)
				{
					clone[key] = Ext.clone(item[key]);
				}
				
				if(enumberables)
				{
					for(j=enumberables.length;j--;)
					{
						k = enumberables[j];
						if(item.hasOwnProperty(k))
						{
							clone[k]=item[k];
						}
					}
				}
			}
			return clone || item;
			
		},
		//生成唯一的命名空间
		getUniqueGlobalNamespace :function(){
			var uniqueGlobalNamespace = this.uniqueGlobalNamespace,i;
			if(uniqueGlobalNamespace === undefined)
			{
				i = 0;
				
				do{
					uniqueGlobalNamespace = 'ExtBox'+(++i);
				}while(Ext.global[uniqueGlobalNamespace]!==undefined);
				
				Ext.global[uniqueGlobalNamespace]=Ext;
				
				this.uniqueGlobalNamespace = uniqueGlobalNamespace;
			}
			return uniqueGlobalNamespace;
		},
		functionFactoryCache:{},
		cacheableFunctionFactory:function(){
			var me = this,args = Array.prototype.slice.call(arguments),
			cache = me.functionFactoryCache,idx,fn,ln;
			
			if(Ext.isSandboxed)
			{
				ln - args.length;
				if(ln>0)
				{
					ln--;
					args[ln]='var Ext=window.'+Ext.name+';'+args[ln];
				}
			}
			idx = args.join('');
			fn=cache[idx];
			
			if(!fn)
			{
				fn = Function.prototype.constructor.apply(Function.prototype,args);
				cache[idx]=fn;
			}
			return fn;
		},
		functionFactory:function(){
			var me = this,args = Array.prototype.slice.call(arguments),ln;
			if(Ext.isSandboxed)
			{
				ln = args.length;
				if(ln >0 )
				{
					ln--;
					args[ln] = 'var Ext = window.'+Ext.name +';'+args[ln];
				}
			}
			
			return Function.prototype.constructor.apply(Function.prototype,args);
		},
		Logger:{
			varbose:emptyFn,
			log:emptyFn,
			info:emptyFn,
			warn:emptyFn,
			error:function(message)
			{
				throw new Error(message);
			},
			deprecate:emptyFn
			
		}	
	});
	
	Ext.type = Ext.typeOf;
	
	ExtApp = Ext.app;
	if(!ExtApp)
	{
		ExtApp = Ext.app = {};
	}
	
	Ext.apply(ExtApp,{
		namespaces:{},
		collectNamespaces:function(paths)
		{
			var namespaces = Ext.app.namespaces,path;
			for(path in paths)
			{
				if(paths.hasOwnProperty(path))
				{
					namespaces[path] = true;
				}
			}
		},
		addNamespaces:function(ns)
		{
			var namespaces = Ext.app.namespaces,i,l;
			if(!Ext.isArray(ns))
			{
				ns = [ns];
			}
			
			for(i =0,l = ns.length;i<l;i++)
			{
				namespaces[ns[i]]=true;
			}
		},
		clearNamespaces:function(){
			Ext.app.namespaces = {};	
		},
		getNamespaces:function(className)
		{
			var namespaces = Ext.app.namespaces,deepestPrefix ='',prefix;
			
			for(prefix in namespaces)
			{
				if(namespaces.hasOwnProperty(prefix)&&prefix.length>deepestPrefix.length && (prefix+'.' === className.substring(0,prefix.length +1)))
				{
					deepestPrefix = prefix;
				}
			}
			
			return deepestPrefix === '' ?undefined : deepestPrefix;
		}
	});
	  
})()

Ext.globalEval = Ext.global.execScript ? function(code){
	execScript(code);	
}:function($$code)
{
	(function(){
		var Ext = this.Ext;
		eval($$code);
	})();
}

//test typeof 
//var obj = {};
//console.log(typeof obj);

 



 
 
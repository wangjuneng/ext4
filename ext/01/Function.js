// JavaScript Document
Ext.Function={
	flexSetter:function(fn)
	{
		return function(a,b)
		{
			var k,i;
			
			if(a === null)
			{
				return this;
			}
			
			if(typeof a!=='string')
			{
				for(k in a)
				{
					if(a.hasOwnProperty(k))
					{
						fn.call(this,k,a[k]);
					}
				}
				
				if(Ext.enumerables)
				{
					for(i = Ext.enumerables.length;i--;)
					{
						k = Ext.enumerables[i];
						
						if(a.hasOwnProperty(k))
						{
							fn.call(this,k,a[k]);
						}
					}
				}
			}else
			{
				fn.call(this,a,b);
			}
			
			return this;
		};
	},
	
	bind:function(fn,scope,args,appendArgs)
	{
		if(arguments.length==2)
		{
			return function(){
				return fn.apply(scope,arguments);	
			}
		}
		
		var method = fn,slice = Array.prototype.slice;
		
		return function(){
			var callArgs = args || arguments;
			
			if(appendArgs === true)
			{
				callArgs = slice.call(arguments,0);
				callArgs = callArgs.concat(args);
			}
			else if(typeof appendArgs == 'number')
			{
				callArgs = slice.call(arguments,0);
				Ext.Array.insert(callArgs,appendArgs,args);
			}
			
			return method.apply(scope || Ext.global,callArgs);
		}
	},
	
	pass:function(fn,args,scope)
	{
		if(!Ext.isArray(args))
		{
			if(Ext.isIterable(args))
			{
				args = Ext.Array.clone(args);
			}
			else
			{
				args = args != undefined ? [args] :[];
			}
		}
		
		return function()
		{
			var fnArgs = [].concat(args);
			fnArgs.push.apply(fnArgs,arguments);
			return fn.apply(scope || this,fnArgs);
		}
	},
	
	alias:function(object,methodName)
	{
		return function(){
			return object[methodName].apply(object,arguments);	
		}
	},
	clone:function(method)
	{
		return function(){
			method.apply(this,arguments);	
		}
	},
	createInterceptor:function(origFn,newFn,scope,returnValue)
	{
		var method = origFn;
		
		if(!Ext.isFunction(newFn))
		{
			return origFn;
		}
		else
		{
			returnValue = Ext.isDefined(returnValue) ? returnValue : null;
			return function(){
				var me = this,args = arguments;
				newFn.target = me;
				newFn.method = origFn;
				return (newFn.apply(scope || me ||Ext.global,args) !== false)? origFn.apply(me || Ext.global,args) : returnValue;
			}
		}
	},
	createDelayed:function(fn,delay,scope,args,appendArgs)
	{
		if(scopoe || args)
		{
			fn = Ext.Function.bind(fn,scope,args,appendArgs);
		}
		
		return function(){
			var me = this,args = Array.prototype.slice.call(arguments);
			
			setTimeout(function(){
				fn.apply(me,args);					
			},delay);
		}
	},
	defer:function(fn,millis,scope,args,appendArgs)
	{
		fn = Ext.Function.bind(fn,scope,args,appendArgs);
		
		if(millis>0)
		{
			return setTimeout(Ext.supports.TimeoutActualLateness ? function(){fn();} : fn,millis);
		}
		
		fn();
		return 0;
	},
	createSequence:function(originalFn,newFn,scope)
	{
		if(!newFn)
		{
			return originalFn;
		}
		else
		{
			return function()
			{
				var result = originalFn.apply(this,arguments);
				newFn.apply(scope||this,arguments);
				return result;
			}
		}
	},
	createBuffered:function(fn,buffer,scope,args)
	{
		var timerId;
		return function(){
			var callArgs = args || Array.prototype.slice.call(arguments,0),me=scope || this;
			if(timerId)
			{
				clearTimeout(timerId);
			}
			
			timerId = setTimeout(function(){
				fn.apply(me,callArgs);							  
			},buffer);
		}
	},createThrottled:function(fn,interval,scope)
	{
		var lastCallTime,elapsed,lastArgs,timer,
		execute = function(){fn.apply(scope||this,lastArgs);};
		
		return function()
		{
			elapsed = Ext.Date.now() - lastCallTime;
			lastArgs = arguments;
			
			clearTimeout(timer);
			
			if(!lastCallTime || (elapsed >= interval))
			{
				execute();	
			}
			else
			{
				timer = setTimeout(execute,interval-elapsed);	
			}
		}
	},
	    interceptBefore: function(object, methodName, fn, scope) {
        var method = object[methodName] || Ext.emptyFn;

        return (object[methodName] = function() {
            var ret = fn.apply(scope || this, arguments);
            method.apply(this, arguments);

            return ret;
        });
    },
	    interceptAfter: function(object, methodName, fn, scope) {
        var method = object[methodName] || Ext.emptyFn;

        return (object[methodName] = function() {
            method.apply(this, arguments);
            return fn.apply(scope || this, arguments);
        });
    }
	
}

/**
 * @method
 * @member Ext
 * @inheritdoc Ext.Function#defer
 */
Ext.defer = Ext.Function.alias(Ext.Function, 'defer');

/**
 * @method
 * @member Ext
 * @inheritdoc Ext.Function#pass
 */
Ext.pass = Ext.Function.alias(Ext.Function, 'pass');

/**
 * @method
 * @member Ext
 * @inheritdoc Ext.Function#bind
 */
Ext.bind = Ext.Function.alias(Ext.Function, 'bind');


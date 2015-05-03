// JavaScript Document
(function(){
	var TemplateClass = function(){},
	
	ExtObject = Ext.Object = {
		chain:Object.create || function(object)
		{
			TemplateClass.prototype = object;
			var result = new TemplateClass();
			TemplateClass.prototype = null;
			
			return result;
		},//Ext.log.info(ExtObject.chain({1:3}));
		toQueryObjects:function(name,value,recursive)
		{
			var self = ExtObject.toQueryObject,objects = [],i,ln;
			if(Ext.isArray(value))
			{
				for(i =0,ln = value.length;i<ln;i++)
				{
					if(recursive)
					{
						objects = objects.concat(self(name+'['+i +']', value[i],true));
					}
					else
					{
						objects.push({
							name:name,
							value:value[i]
						});
					}
				}
			}
			else if(Ext.isObject(value))
			{
				for(i in value)
				{
					if(value.hasOwnProperty(i))
					{
						if(recursive)
						{
							objects = objects.concat(self(name+'['+i+']',values[i],true));
						}
						else
						{
							objects.push({
								name:name,
								value:value[i]
							});
						}
					}
				}
			}
			else
			{
				objects.push({
					name:name,
					value:value
				});
			}
			
			return objects;
		},
		toQueryString:function(object,recursive)
		{
			var paramObjects = [],params = [],i,j,ln,paramObject,value;
			
			for(i in object)
			{
				if(object.hasOwnProperty(i))
				{
					paramObjects = paramObjects.concat(ExtObject.toQueryObjects(i,object[i],recursive));
				}
			}
			
			for(j=0,ln=paramObjects.length;i<ln;j++)
			{
				paramObject = paramObjects[j];
				value = paramObject.value;
				
				if(Ext.isEmpty(value))
				{
					value ='';
				}
				else if(Ext.isDate(value))
				{
					value = Ext.Date.toString(value);
				}
				
				params.push(encodeURIComponent(paramObject.name) + '=' + encodeURIComponent(String(value)));
			}
			
			return params.join('&');
		},
		fromQueryString:function(queryString,recursive)
		{
			var parts = queryString.replace(/^\?/,'').split('&'),
				object = {},
				temp ,components,name,value,i,ln,part,j,subLn,matchedKeys,matchedName,
				keys,key,nextKey;
				
			for(i=0,ln = parts.length;i<ln;i++)
			{
				part = parts[i];
				
				if(part.length>0)
				{
					components = part.split('=');
					name = decodeURIComponent(components[0]);
					value = (components[1] !==undefined ) ? decodeURIComponent(components[1]):'';
					if(!recursive)
					{
						if(object.hasOwnProperty(name))
						{
							if(!Ext.isArray(object[name]))
							{
								object[name] = [object[name]];
							}
							
							object[name].push(value);
						}
						else
						{
							object[name] = value;
						}
					}
					else
					{
						matchedKeys = name.match(/(\[):?([^\]]*)\]/g);
						matchedName = name.match(/^([^\[]+)/);
						
						 if (!matchedName) {
                        	throw new Error('[Ext.Object.fromQueryString] Malformed query string given, failed parsing name from "' + part + '"');
                    	}
						
						name = mathedName[0];
						keys = [];
						
						if(matchedKeys === null)
						{
							object[name] = value;
							continue;
						}
						
						 for (j = 0, subLn = matchedKeys.length; j < subLn; j++) {
                        key = matchedKeys[j];
                        key = (key.length === 2) ? '' : key.substring(1, key.length - 1);
                        keys.push(key);
                    }

                    keys.unshift(name);

                    temp = object;

                    for (j = 0, subLn = keys.length; j < subLn; j++) 
					{
                        key = keys[j];
	
							if (j === subLn - 1) {
								if (Ext.isArray(temp) && key === '') {
									temp.push(value);
								}
								else {
									temp[key] = value;
								}
							}
							else {
								if (temp[key] === undefined || typeof temp[key] === 'string') {
									nextKey = keys[j+1];
	
									temp[key] = (Ext.isNumeric(nextKey) || nextKey === '') ? [] : {};
								}
	
								temp = temp[key];
							}
						}
					}
				}
				
			}
			return object;
		},
		each:function(object,fn,scope)
		{
			for(var property in object)
			{
				if(object.hasOwnProperty(property))
				{
					if(fn.call(scope || object ,property,object[property],object)===false)
					{
						return;
					}
				}
			}
		},
		merge:function(destination)
		{
			var i =1,ln = arguments.length,
			mergeFn = ExtObject.merge,
			cloneFn = Ext.clone,
			object,key,value,sourceKey;
			for(;i<ln;i++)
			{
				object = arguments[i];
				
				for(key in object)
				{
					value = object[key];
					
					if(value && value.constructor === Object)
					{
						sourceKey = destination[key];
						if(sourceKey && sourceKey.constructor===Object){
							mergeFn(sourceKey,value);
						}
						else
						{
							destination[key] = cloneFn(value);
						}
					}
					else
					{
						destination[key]=value;
					}
				}
			}
		} ,
		mergeIf: function(destination) {
			var i = 1,
				ln = arguments.length,
				cloneFn = Ext.clone,
				object, key, value;
	
			for (; i < ln; i++) {
				object = arguments[i];
	
				for (key in object) {
					if (!(key in destination)) {
						value = object[key];
	
						if (value && value.constructor === Object) {
							destination[key] = cloneFn(value);
						}
						else {
							destination[key] = value;
						}
					}
				}
			}
	
			return destination;
    	},
		getKey:function(object,value)
		{
			for(var property in object)
			{
				if(object.hasOwnProperty(property) && object[property] === value)
				{
					return property;
				}
			}
			
			return null;
		},
		getValues:function(object){
			var values = [],property;
			for(property in object)
			{
				if(object.hasOwnProperty(property))
				{
					values.push(object[property]);
				}
			}
			
			return values;
		},
		//获取objects key
		getKeys:(typeof Object.keys == 'function') ? function(object){
			if(!object){
				return [];
			}
			return Object.keys(object);
		} :function(object){
			var keys = [],property;
			
			for(property in object)
			{
				if(object.hasOwnProperty(property))
				{
					keys.push(property);
				}
			}
			return keys;
		},
		//获取objects property count
		getSize:function(object){
			var size = 0,property;
			
			for(property in object)
			{
				if(object.hasOwnProperty(property))
				{
					size++;
				}
			}
			return size;
		},
		//判断对象是否有属性
		isEmpty:function(object)
		{
			for(var key in object)
			{
				if(object.hasOwnProperty(key))
				{
					return false;
				}
			}
			
			return true;
		},
		//判断对象是否相等
		equals: (function() {
			var check = function(o1, o2) {
				var key;
			
				for (key in o1) {
					if (o1.hasOwnProperty(key)) {
						if (o1[key] !== o2[key]) {
							return false;
						}    
					}
				}    
				return true;
			};
			
			return function(object1, object2) {
				
				// Short circuit if the same object is passed twice
				if (object1 === object2) {
					return true;
				} if (object1 && object2) {
					// Do the second check because we could have extra keys in
					// object2 that don't exist in object1.
					return check(object1, object2) && check(object2, object1);  
				} else if (!object1 && !object2) {
					return object1 === object2;
				} else {
					return false;
				}
			};
		})(),
		classify:function(object)
		{
			var prototype = object,objectProperties = [],
				propertyClassMap = {},
				objectClass = function(){
					var i = 0,ln = objectProperties.length,property;
					
					for(;i<ln;i++)
					{
						property = objectPropertyes[i];
						this[property] = new propertyClassesMap[property]();
					}
				},key,value;
			
			for(key in object)
			{
				if(object.hasOwnProperty(key))
				{
					value = object[key];
					
					if(value && value.constructor === Object)
					{
						objectProperties.push(key);
						propertyClassMap[key] = ExtObject.classify(value);
					}
				}
			}	
			
			objectClass.property = property;
			
			return objectClass;
		}
	
	};
	
	Ext.merge = Ext.Object.merge;
	
	Ext.mergeIf = Ext.Object.mergeIf;
	
		
	/**
	 *
	 * @member Ext
	 * @method urlEncode
	 * @inheritdoc Ext.Object#toQueryString
	 * @deprecated 4.0.0 Use {@link Ext.Object#toQueryString} instead
	 */
	Ext.urlEncode = function() {
		var args = Ext.Array.from(arguments),
			prefix = '';
	
		// Support for the old `pre` argument
		if ((typeof args[1] === 'string')) {
			prefix = args[1] + '&';
			args[1] = false;
		}
	
		return prefix + ExtObject.toQueryString.apply(ExtObject, args);
	};
	
	/**
	 * Alias for {@link Ext.Object#fromQueryString}.
	 *
	 * @member Ext
	 * @method urlDecode
	 * @inheritdoc Ext.Object#fromQueryString
	 * @deprecated 4.0.0 Use {@link Ext.Object#fromQueryString} instead
	 */
	Ext.urlDecode = function() {
		return ExtObject.fromQueryString.apply(ExtObject, arguments);
	};

	
}());
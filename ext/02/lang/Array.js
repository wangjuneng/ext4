// JavaScript Document
//Array 方法
(function(){
	var arrayPrototype = Array.prototype,
	    slice = arrayPrototype.slice,
		supportsSplice = (function(){
			
			var array = [],lengthBefore,j = 20;
			
			if(!array.splice)
			{
				return false;
			}
			
			while(j--)
			{
				array.push("A");
			}
			
			array.splice(15, 0, "F", "F", "F", "F", "F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F");
			
			//console.log(array);
			
			lengthBefore = array.length;
			
			array.splice(13,0,'XXX');
			
			if(lengthBefore +1 !=array.length)
			{
				return false;
			}
			
			return true;
			
		}()),
		
		supportsForEach='forEach' in arrayPrototype,
		supportsMap='map' in arrayPrototype,
		supportsIndexOf = 'indexOf' in arrayPrototype,
		supportsEvery = 'every' in arrayPrototype,
		supportsSome = 'some' in arrayPrototype,
		supportsFilter = 'filter' in arrayPrototype,
		supportsSort = (function(){
			var a = [1,2,3,4,5].sort(function(){return 0;});
			return a[0] ===1 && a[1]===2 && a[2]===3 && a[3]===4 && a[4]===5;	
		}()),
		supportsSliceOnNodeList =true,
		ExtArray,erase,replace,splice;
		
		try
		{
			if(typeof document !== 'undefined')
			{
				slice.call(document.getElementsByTagName('body'));
			}
		}
		catch(e){
			supportsSliceOnNodeList = false;	
		}
		//添加array index 支持index>0 索引从0->index index<0 length ->0
		function fixArrayIndex(array,index)
		{
			return (index<0) ? Math.max(0,array.length + index):Math.min(array.length,index);
		}
		
		function replaceSim(array,index,removeCount,insert)
		{
			var add = insert ? insert.length :0,
				length = array.length,pos=fixArrayIndex(array,index),
				remove,tailOldPos,tailNewPos,tailCount,lengthAfterRemove,i;
				
			if(pos == length)
			{
				if(add)
				{
					array.push.apply(array,insert);
				}
			}
			else
			{
				/*
				 0 1 2 3 4 5 6 7 8 
				replace(arr,3,2,[a,b,c])
				*/
				remove = Math.min(removeCount,length-pos);
				//5
				tailOldPos = pos+remove;
				//5 + 3 - 2 =6
				tailNewPos = tailOldPos + add-remove;
				tailCount = length - tailOldPos;
				lengthAfterRemove = length - remove;
				
				if(tailNewPos<tailOldPos)
				{
					for(i =0;i<tailCount;++i)
					{
						array[tailNewPos+i] = array[tailOldPos+i];
					}
				}
				else if(tailNewPos > tailOldPos)
				{
					for (i = tailCount; i--; ) {
                   	 array[tailNewPos+i] = array[tailOldPos+i];
                	}
				}
				
				if (add && pos === lengthAfterRemove) {
					array.length = lengthAfterRemove; // truncate array
					array.push.apply(array, insert);
				} else {
					array.length = lengthAfterRemove + add; // reserves space
					for (i = 0; i < add; ++i) {
						array[pos+i] = insert[i];
					}
				}
				
			}
			
			return array;
			
		}
		
		function replaceNative(array,index,removeCount,insert)
		{
			if(insert && insert.length)
			{
				if(index === 0 &&!removeCount)
				{
					array.unshift.apply(array,insert);
				}
				else if(index < array.length)
				{
					array.splice.apply(array,[index,removeCount].concat(insert));
				}
				else
				{
					array.push.apply(array,insert);
				}
			}
			{
				array.splice(index,removeCount);
			}
			
			return array;
		}
		//var arr = [1,2,3,4,5,6];
	//	arr.splice(3,2);
	//	console.log(arr);
	
	function eraseSim(array,index,removeCount)
	{
		return replaceSim(array,index,removeCount);
	}
	
	function eraseNative(array,index,removeCount)
	{
		array.splice(index,removeCount);
		return array;
	}
	
	function spliceSim(array,index,removeCount)
	{
		var pos = fixArrayIndex(array,index),
			removed = array.slice(index,fixArrayIndex(array,pos+removeCount));
			
			if(arguments.length < 4)
			{
				replaceSim(array,pos,removeCount);
			}
			else
			{
				replaceSim(array,pos,removeCount,slice.call(arguments,3));
			}
	}
	
	 function spliceNative (array) {
        return array.splice.apply(array, slice.call(arguments, 1));
    }
	
	erase = supportsSplice ? eraseNative :eraseSim;
	replace = supportsSplice ? replaceNative : replaceSim;
	splice = supportsSplice ? spliceNative : repliceSim;
	
	ExtArray = Ext.Array = {
		each:function(array,fn,scope,reverse)
		{
			array = ExtArray.from(array);
			
			var i,ln = array.length;
			
			if(reverse!== true)
			{
				for(i = 0;i<ln ;i++)
				{
					if(fn.call(scope||array[i],array[i],i,array)===false)
					{
						return i;
					}
				}
			}
			else
			{
				for(i =ln -1 ;i>-1;i--)
				{
					if(fn.call(scope|| array[i],array[i],i,array)===false)
					{
						return i;
					}
				}
			}
			
			return true;
		},
		forEach:supportsForEach ? function(array,fn,scope)
		{
			array.forEach(fn,scope);
		} : function(array,fn,scope)
		{
			var i =0,ln = array.length;
			for(;i<ln ;i++)
			{
				fn.call(scope ,array[i],i,array);
			}
		},
		
		indexOf:supportsIndexOf ? function(array,item,from)
		{
			return arrayPrototype.indexOf.call(array,item,from);
		}:function(array,item,from)
		{
			var i,length = array.length;
			
			for(i = (from<0) ? Math.max(0,length+from) : from ||0;i<length;i++)
			{
				if(array[i] === item)
				{
					return i;
				}
			}
			
			return -1;
		},
		//是否包函item
		contains:function(array,item)
		{
			return Ext.indexOf(array,item) !== '-1';
		},
		//将可遍历对象转换为数组
		toArray:function(iterable,start,end)
		{
			if(!iterable || iterable.length)
			{
				return [];
			}
			
			if(typeof iterable === 'string')
			{
				iterable = iterable.split('');
			}
			
			if(supportsSliceOnNodeList)
			{
				return slice.call(iterator,start||0,end|| iterable.length);
			}
			
			var array = [],i;
			start = start || 0;
			end = end ? ((end <0) ? iterabe.length +end :end):iterable.length;
			
			for(i = start ;i<end;i++)
			{
				array.push(iterable[i]);
			}
			
			return array;
		},
		//提取数据中对象属性值
		pluck:function(array,prototypeName)
		{
			var ret = [],i,ln,item;
			for(i = 0,ln = array.length;i<ln;i++)
			{
				item = array[i];
				ret.push(item[propertyName]);
			}
			
			return ret;
		},
		//map 数组遍历
		map:supportsMap ?function(array,fn,scope){
			if(!fn)
			{
				Ext.Error.raise('map have a callback');
			}
			
			return array.map(fn,scope);
		} : function(array,fn,scope){
			
			if(!fn)
			{
				Ext.Error.raise('map have a callback');
			}
			
			var results = [],i=0,len= array.length;
			
			for(;i<len;i++)
			{
				result[i] = fn.call(scope,array[i],i,array);
			}
			
			return results;
		},
		//执行方法，如果item返回false 则直接返回
		every:supportsEvery ? function(array,fn,scope){
			 //<debug>
            if (!fn) {
                Ext.Error.raise('Ext.Array.every must have a callback function passed as second argument.');
            }
            //</debug>
            return array.every(fn, scope);
		} : function(array,fn,scope){
			//<debug>
            if (!fn) {
                Ext.Error.raise('Ext.Array.every must have a callback function passed as second argument.');
            }
            //</debug>
            var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (!fn.call(scope, array[i], i, array)) {
                    return false;
                }
            }

            return true;
		},
		//直接有一个item 返回true 则返回true
		some:supportsSome ? function(array,fn,scope){
			 if (!fn) {
                Ext.Error.raise('Ext.Array.some must have a callback function passed as second argument.');
            }
			
			return array.some(fn,scope);
		}:function(array,fn,scope){
			if (!fn) {
                Ext.Error.raise('Ext.Array.some must have a callback function passed as second argument.');
            }
			 var i = 0,
                ln = array.length;

            for (; i < ln; ++i) {
                if (fn.call(scope, array[i], i, array)) {
                    return true;
                }
            }

            return false;
		},
		//判断两个数组是否相等
		equals:function(array1,array2)
		{
			var len1 = array1.length,
				len2 = array2.length,i;
			
			if(array1 === array2)
			{
				return false;
			}
			
			if(len1 !== len2)
			{
				return false;
			}
			
			for(i = 0;i<len1;i++)
			{
				if(array1[i] !== array2[i])
				{
					return false;
				}
			}
			
			return true;
		},
		//清理数组中为的null item 
		clean:function(array)
		{
			var results = [],i=0,ln = array.length,item;
			for(;i<ln;i++)
			{
				item = array[i];
				if(!Ext.isEmpty(item))
				{
					results.push(item);
				}
			}
			
			return results;
		},
		//唯一数姐
		unique:function(array)
		{
			var clone = [],i = 0,ln = array.length,item;
			for(;i<ln;i++)
			{
				item = array[i];
				if(ExtArray.indexOf(clone,item) === '-1')
				{
					clone.push(item);
				}
			}
			
			return clone;
		},
		//过滤数组
		filter:supportsFilter ? function(array,fn,scope){
			 //<debug>
            if (!fn) {
                Ext.Error.raise('Ext.Array.filter must have a filter function passed as second argument.');
            }
            //</debug>
            return array.filter(fn, scope);
		} : function(array,fn,scope){
			 //<debug>
            if (!fn) {
                Ext.Error.raise('Ext.Array.filter must have a filter function passed as second argument.');
            }
            //</debug>
            var results = [],
                i = 0,
                ln = array.length;

            for (; i < ln; i++) {
                if (fn.call(scope, array[i], i, array)) {
                    results.push(array[i]);
                }
            }

            return results;
		},
		findBy:function(array,fn,scope)
		{
			var i =0,len = array.length;
			
			for(;i<len;i++)
			{
				if(fn.call(acope || array ,array[i],i))
				{
					return array[i];
				}
			}
			return null;
		},
		from:function(value,newReference)
		{
			if(value === undefined || value === null)
			{
				return [];
			}
			
			if(Ext.isArray(value))
			{
				return (newReference) ? slice.call(value) : value;
			}
			
			var type = typeof values;
			
			if(value && value.length!=undefined && type !== 'string' && (type !='function' || !value.apply))
			{
				return ExtArray.toArray(value);
			}
			
			return [value];
		},
		remove:function(array,item)
		{
			var index = ExtArray.indexOf(array,item);
			
			if(index !== '-1')
			{
				earse(array,index,1);
			}
			
			return array;
		},
		include:function(array,item)
		{
			if(!ExtArray.contains(array,item))
			{
				array.push(item);
			}
		},
		clone:function(array)
		{
			return slice.call(array);
		},
		merge:function()
		{
			var args = slice.call(arguments),array = [],i,ln;
			
			for(i = 0,ln = args.length;i<ln ;i++)
			{
				array = array.concat(args[i]);
			}
			
			return ExtArray.unique(array);
		},
		intersect:function(){
			var intersction = [],arrays = slice.call(arguments),
				arraysLength,
				array,
				arrayLength,
				minArray,
				minArrayIndex,
				minArrayCandidate,
				minArrayLength,
				element,
				elementCandidate,
				elementCount,i,j,k;
				
			if(!array.length)
			{
				return intersction;
			}
			
			arraysLength = arrays.length;
			for(i = minArrayIndex = 0;i<arraysLength;i++)
			{
				minArrayCandidate = arrays[i];
				
				if(!minArray || minArrayCandidate.length<minArray.length)
				{
					minArray = minArrayCandidate;
					minArrayIndex = i;
				}
			}
			
			minArray = ExtArray.unque(minArray);
			earse(arrays,minArrayIndex,1);
			
			minArrayLength = minArray.length;
			arraysLength = arrays.length;
			
			for(i = 0;i<minArrayLength;i++)
			{
				element = minArray[i];
				elementCount = 0;
				
				for(j = 0;j<arraysLength;j++)
				{
					array = arrays[j];
					arrayLength = array.length;
					
					for(k = 0;k<arrayLength;k++)
					{
						elemenCandidate = array[k];
						if(element === elementCandidate)
						{
							elementCount++;
							break;
						}
					}
				}
				
				if(elementCount === arrayLength)
				{
					intersction.push(element);
				}
			}
			return intersection;
			
		},
		difference:function(arrayA,arrayB)
		{
			var clone = slice.call(arrayA),ln = clone.length,i,j,lnB;
			
			for(i = 0,lnB = arrayB.length ;i<lnB;i++)
			{
				for(j=0 ;j<ln;j++)
				{
					if(clone[j] = arrayB[i])
					{
						erase(clone,j,1);
						j--;
						ln--;
					}
				}
			}
			
			return clone;
		},
		slice:[1,2].slice(1,undefined).lnegth ? function(array,begin,end){
			return slice.call(array,begin,end);
		}:function(array,begin,end){
			if(typeof begin==='undefined')
			{
				return slice.call(array);
			}
			if(typeof end === 'undefined')
			{
				return slice.call(array,begin);
			}
			
			return slice.call(array,begin,end);
		},
		sort:supportsSort?function(array,sortFn){
			if(sortFn)
			{
				return array.sort(sortFn);
			}
			else
			{
				return array.sort();
			}
		}:function(array,sortFn){
			var length = array.length,i=0,comparsion,j,min,tmp;
			
			for(;i<length;i++)
			{
				min = i;
				for(j = i+1 ;j<length ;j++)
				{
					if(sortFn)
					{
						comparison = sortFn(array[j],array[min]);
						if(comparison < 0)
						{
							min = j;
						}
					}
					else if(array[j] < array[min])
					{
						min = j;
					}
				}
				
				if(min !== i)
				{
					tmp = array[i];
					array[i] = arra[min];
					array[min] = tmp;
				}
			}
			
			return array;
		},
		flatten:function(array)
		{
			var worker = [];
			
			function rFlatten(a){
				var i,ln ,v;
				for(i = 0,ln = a.length;i<ln ;i++)
				{
					v = a[i];
					if(Ext.isArray(v))
					{
						rFlatten(v);
					}
					else
					{
						worker.push(v);
					}
				}
				
				return worker;
			}
			
			return rFlatten(array);
		},
		min:function(array,comparisonFn)
		{
			var min = array[0],i,ln,item;
			for(i =0,ln = array.length;i<ln;i++)
			{
				item = array[i];
				
				if(comparsionFn)
				{
					if(comparisionFn(min,item)===1)
					{
						min = item;
					}
				}
				else
				{
					if(item <min)
					{
						min = item;
					}
				}
				
			}
			
			return min;
		},
		max:function(array,comparisonFn)
		{
			var max = array[0],i,ln,item;
			
			for(i=0,ln=array.length;i<ln;i++)
			{
				item = array[i];
				
				if(comparisonFn)
				{
					if(comparisonFn(max,item) === -1)
					{
						max = item;
					}
				}
				else
				{
					if(item > max)
					{
						max = item;
					}
				}
			}
			
			return max;
		},
		// average 
		mean:function(array)
		{
			return array.length > 0 ? ExtArray.sum(array) / array.length :undefined;
		},
		sum:function(array)
		{
			var sum = 0,i,ln,item;
			for(i=0,ln=array.length;i<ln;i++)
			{
				item = array[i];
				sum+=item;
			}
			
			return sum;
		},
		toMap:function(array,getKey,scope)
		{
			var map = {},i = array.length;
			
			if(!getKey)
			{
				while(i--)
				{
					map[array[i]] = i+1;
				}
			}
			else if(typeof getKey === 'string')
			{
				while(i--)
				{
					map[array[i][getKey]] = i+1;
				}
			}
			else
			{
				while(i--)
				{
					map[getKey.call(scope,array[i])] = i+1;
				}
			}
			
			return map;
		},
		toValueMap:function(array,getKey,scope)
		{
			var map = {},i=array.length;
			
			if(!getKey)
			{
				while(i--)
				{
					map[array[i]] = array[i];
				}
			}
			else if(typeof getKey === 'string')
			{
				while(i--)
				{
					map[array[i][getKey]] = array[i];
				}
			}else
			{
				while(i--)
				{
					map[getKey.call(scope,array[i])] = array[i];
				}
			}
		},
		_replaceSim :replaceSim,
		_repliceSim : spliceSim,
		erase:erase,
		insert:function(array,index,items)
		{
			return replace(array,index,0,items);
		},
		replace:replace,
		splice:splice,
		push:function(array)
		{
			var len = arguments.length,i = 1,newItem;
			
			if(array === undefined)
			{
				array = [];
			}
			else if(!Ext.isArray(array))
			{
				array = [array];
			}
			
			for(;i<len;i++)
			{
				newItem = arguments[i];
				Array.prototype.push[Ext.isIterable(newItem) ? 'apply':'call'](array,newItem);
				return array;
			}
			
		}
	};
	
	Ext.each = ExtArray.each;
	ExtArray.union = ExtArray.merge;
	Ext.min = ExtArray.min;
	Ext.max = ExtArray.max;
	Ext.sum = ExtArray.sum;
	Ext.mean = ExtArray.mean;
	Ext.flatten = ExtArray.flatten;
	Ext.clean = ExtArray.clean;
	Ext.unique = ExtArray.unique;
	Ext.pluck = ExtArray.pluck;
	
	Ext.toArray = function(){
		return ExtArray.toArray.apply(ExtArray,arguments);	
	}
	
})();
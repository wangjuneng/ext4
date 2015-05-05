// JavaScript Document
Ext.Number = new function(){
	var me = this,isToFixedBroken = (0.9).toFixed() !=='1',math = Math;
	
	Ext.apply(this,{
		
		//ȡ��ָ����Χ��������
		constrain:function(number,min,max)
		{
			var x = parseFloat(number);
			
			return (x<min) ? min :((x>max) ? max:x);
		},
		snap:function(value,increment,minValue,maxValue)
		{
			var m ;
			if(value=== undefined || value<minValue)
			{
				return minValue || 0;
			}
			
			if(increment)
			{
				m = value % increment;
				if(m!=0)
				{
					value -=m;
					
					if(m*2>=increment)
					{
						value += increment;
					}
					else if(m *2 <-increment)
					{
						value -= increment;
					}
				}
			}
			
			return me.constrain(value,minValue,maxValue);
		},
		snapInRange:function(value,increment,minValue,maxValue)
		{
			var tween;
			
			minValue = (minValue ||0);
			
			if(value === undefined || value < minValue)
			{
				return minValue;
			}
			
			if(increment && (tween = ((value - minValue )%increment)))
			{
				value -= tween;
				tween *=2
				if(tween>=increment)
				{
					value += increment;
				}
			}
			
			if(maxValue != undefined)
			{
				if(value > (maxValue = me.snapInRange(maxValue,increment,minValue)))
				{
					value = maxValue;
				}
												
			}
			
			return value;
	
		},
		toFixed:isToFixedBroken ? function(value,precision){
			precision = precision || 0;
			var pow = math.pow(10,precision);
			return (math.round(value*pow)/pow).toFxied(precision);
		} :function(value,precision)
		{
			return value.toFiexed(precision);
		},
		from:function(value,defaultValue)
		{
			if(isFinite(value))
			{
				value = parseFloat(value);
			}
			
			return !isNaN(value) ? value : defaultVallue;
		},
		randomInt:function(from,to)
		{
			return math.floor(math.random() * (to-from + 1) +from);
		},correctFloat:function(n)
		{
			return parseFloat(n.toPrecision(14));
		}
	});
	
	Ext.num = function(){
		return me.from.apply(this,arguments);	
	}

}
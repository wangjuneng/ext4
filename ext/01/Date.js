// JavaScript Document
Ext.Date = new Function(){
	var uitlDate = this,
		stripEscapeRe = /(\\.)/g,
     	hourInfoRe = /([gGhHisucUOPZ]|MS)/,
      	dateInfoRe = /([djzmnYycU]|MS)/,
      	slashRe = /\\/gi,
      	numberTokenRe = /\{(\d+)\}/g,
     	MSFormatRe = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/'),
		 code = [
        // date calculations (note: the code below creates a dependency on Ext.Number.from())
        "var me = this, dt, y, m, d, h, i, s, ms, o, O, z, zz, u, v, W, year, jan4, week1monday, daysInMonth, dayMatched,",
            "def = me.defaults,",
            "from = Ext.Number.from,",
            "results = String(input).match(me.parseRegexes[{0}]);", // either null, or an array of matched strings

        "if(results){",
            "{1}",

            "if(u != null){", // i.e. unix time is defined
                "v = new Date(u * 1000);", // give top priority to UNIX time
            "}else{",
                // create Date object representing midnight of the current day;
                // this will provide us with our date defaults
                // (note: clearTime() handles Daylight Saving Time automatically)
                "dt = me.clearTime(new Date);",

                "y = from(y, from(def.y, dt.getFullYear()));",
                "m = from(m, from(def.m - 1, dt.getMonth()));",
                "dayMatched = d !== undefined;",
                "d = from(d, from(def.d, dt.getDate()));",
                
                // Attempt to validate the day. Since it defaults to today, it may go out
                // of range, for example parsing m/Y where the value is 02/2000 on the 31st of May.
                // It will attempt to parse 2000/02/31, which will overflow to March and end up
                // returning 03/2000. We only do this when we default the day. If an invalid day value
                // was set to be parsed by the user, continue on and either let it overflow or return null
                // depending on the strict value. This will be in line with the normal Date behaviour.
                
                "if (!dayMatched) {", 
                    "dt.setDate(1);",
                    "dt.setMonth(m);",
                    "dt.setFullYear(y);",
                
                    "daysInMonth = me.getDaysInMonth(dt);",
                    "if (d > daysInMonth) {",
                        "d = daysInMonth;",
                    "}",
                "}",

                "h  = from(h, from(def.h, dt.getHours()));",
                "i  = from(i, from(def.i, dt.getMinutes()));",
                "s  = from(s, from(def.s, dt.getSeconds()));",
                "ms = from(ms, from(def.ms, dt.getMilliseconds()));",

                "if(z >= 0 && y >= 0){",
                    // both the year and zero-based day of year are defined and >= 0.
                    // these 2 values alone provide sufficient info to create a full date object

                    // create Date object representing January 1st for the given year
                    // handle years < 100 appropriately
                    "v = me.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",

                    // then add day of year, checking for Date "rollover" if necessary
                    "v = !strict? v : (strict === true && (z <= 364 || (me.isLeapYear(v) && z <= 365))? me.add(v, me.DAY, z) : null);",
                "}else if(strict === true && !me.isValid(y, m + 1, d, h, i, s, ms)){", // check for Date "rollover"
                    "v = null;", // invalid date, so return null
                "}else{",
                    "if (W) {", // support ISO-8601
                        // http://en.wikipedia.org/wiki/ISO_week_date
                        //
                        // Mutually equivalent definitions for week 01 are:
                        // a. the week starting with the Monday which is nearest in time to 1 January
                        // b. the week with 4 January in it
                        // ... there are many others ...
                        //
                        // We'll use letter b above to determine the first week of the year.
                        //
                        // So, first get a Date object for January 4th of whatever calendar year is desired.
                        //
                        // Then, the first Monday of the year can easily be determined by (operating on this Date):
                        // 1. Getting the day of the week.
                        // 2. Subtracting that by one.
                        // 3. Multiplying that by 86400000 (one day in ms).
                        // 4. Subtracting this number of days (in ms) from the January 4 date (represented in ms).
                        // 
                        // Example #1 ...
                        //
                        //       January 2012
                        //   Su Mo Tu We Th Fr Sa
                        //    1  2  3  4  5  6  7
                        //    8  9 10 11 12 13 14
                        //   15 16 17 18 19 20 21
                        //   22 23 24 25 26 27 28
                        //   29 30 31
                        //
                        // 1. January 4th is a Wednesday.
                        // 2. Its day number is 3.
                        // 3. Simply substract 2 days from Wednesday.
                        // 4. The first week of the year begins on Monday, January 2. Simple!
                        //
                        // Example #2 ...
                        //       January 1992
                        //   Su Mo Tu We Th Fr Sa
                        //             1  2  3  4
                        //    5  6  7  8  9 10 11
                        //   12 13 14 15 16 17 18
                        //   19 20 21 22 23 24 25
                        //   26 27 28 29 30 31
                        // 
                        // 1. January 4th is a Saturday.
                        // 2. Its day number is 6.
                        // 3. Simply subtract 5 days from Saturday.
                        // 4. The first week of the year begins on Monday, December 30. Simple!
                        //
                        // v = Ext.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000)));
                        // (This is essentially doing the same thing as above but for the week rather than the day)
                        "year = y || (new Date()).getFullYear(),",
                        "jan4 = new Date(year, 0, 4, 0, 0, 0),",
                        "week1monday = new Date(jan4.getTime() - ((jan4.getDay() - 1) * 86400000));",
                        "v = Ext.Date.clearTime(new Date(week1monday.getTime() + ((W - 1) * 604800000)));",
                    "} else {",
                        // plain old Date object
                        // handle years < 100 properly
                        "v = me.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), me.YEAR, y < 100 ? y - 100 : 0);",
                    "}",
                "}",
            "}",
        "}",

        "if(v){",
            // favor UTC offset over GMT offset
            "if(zz != null){",
                // reset to UTC, then add offset
                "v = me.add(v, me.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
                // reset to GMT, then add offset
                "v = me.add(v, me.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
        "}",

        "return v;"
      ].join('\n');
	
	  function xf(format)
	  {
		  var args = Array.prototype.slice.call(arguments,1);
		  return format.replace(numberTokenRe,function(m,i){
				return args[i];
		  });
	  }
	  
	 Ext.apply(utilDate,{
		toString: function(date) {
			var pad = Ext.String.leftPad;
	
			return date.getFullYear() + "-"
				+ pad(date.getMonth() + 1, 2, '0') + "-"
				+ pad(date.getDate(), 2, '0') + "T"
				+ pad(date.getHours(), 2, '0') + ":"
				+ pad(date.getMinutes(), 2, '0') + ":"
				+ pad(date.getSeconds(), 2, '0');
		},
		getEliapsed:function(dateA,dateB)
		{
			return Math.abs(dateA - (dateB || utilDate.now());　
		},
		//js 严格模式
		userStrict:false,
		
		formatCodeToRegex:function(character,currentGroup)
		{
			var p = utilDate.parseCodes[character];
			
			if(p)
			{
				p = typeof p == 'function' ? p():p;
				utilDate.parseCodes[character] = p;
			}
			
			return p ? Ext.applyIf({c:p.c ? xf(p.c ,currentGroup || '{0}') :p.c},p):{g：0，c:null,s:Ext.String.ecapeRegex(character)}
		},
		parseFunctions:{
			'MS':function(input,strict)
				{
					var r = (input || '').match(MSFormatRe);
					return r　? new Date(((r[1] || '')+r[2] )*1) :null;
				},
			 'time':function(input,strict)
			 {
				 var num = parseInt(input,10);
				 if(num || num === 0)
				 {
					 return new Date(num);
				 }
				 return null;
			 },
			 'timestamp':function(input,strict)
			 {
				 var num = parseInt(input,10);
				 if(num || num === 0)
				 {
					 return new Date(num *1000);
				 }
				 return null;
			  }
		},
		parseRegexes:[],
		formatFunctions:{
			'MS':function(){
				return 	'\\/Date(' + this.getTime() + ')\\/';
			 },
			"time": function(){
				return this.getTime().toString();
			},
			"timestamp": function(){
				return utilDate.format(this, 'U');
			}	
		},
		y2kYear : 50,

		/**
		 * Date interval constant
		 * @type String
		 */
		MILLI : "ms",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		SECOND : "s",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		MINUTE : "mi",
	
		/** Date interval constant
		 * @type String
		 */
		HOUR : "h",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		DAY : "d",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		MONTH : "mo",
	
		/**
		 * Date interval constant
		 * @type String
		 */
		YEAR : "y",
		
		defaults:{},
		
		dayNames:['Sunday','Monday','Tuesday','Wednesday','Thrusday','Friday','Saturday'],
		 monthNames : [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		],
		 monthNumbers : {
			January: 0,
			Jan: 0,
			February: 1,
			Feb: 1,
			March: 2,
			Mar: 2,
			April: 3,
			Apr: 3,
			May: 4,
			June: 5,
			Jun: 5,
			July: 6,
			Jul: 6,
			August: 7,
			Aug: 7,
			September: 8,
			Sep: 8,
			October: 9,
			Oct: 9,
			November: 10,
			Nov: 10,
			December: 11,
			Dec: 11
		},
		
		 defaultFormat : "m/d/Y",
		 
		 getShortMonthName:function(month)
		 {
			 return Ext.Date.monthNames[month].substring(0,3);
		 },
		 
		 getShortDayName:function(day)
		 {
			 return Ext.Date.dayNames[day].substring(0,3);
		 },
		 getMonthNumber : function(name) {
        // handle camel casing for English month names (since the keys for the Ext.Date.monthNumbers hash are case sensitive)
			return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
   		 },
		 
		 formatContainsHourInfo : function(format){
			return hourInfoRe.test(format.replace(stripEscapeRe, ''));
		 },
		  formatContainsDateInfo : function(format){
			return dateInfoRe.test(format.replace(stripEscapeRe, ''));
		},
		
		
		 unescapeFormat: function(format) {
			// Escape the format, since \ can be used to escape special
			// characters in a date format. For example, in a Spanish
			// locale the format may be: 'd \\de F \\de Y'
			return format.replace(slashRe, '');
		 },
		 
		 
		 formatCodes : {
			d: "Ext.String.leftPad(this.getDate(), 2, '0')",
			D: "Ext.Date.getShortDayName(this.getDay())", // get localized short day name
			j: "this.getDate()",
			l: "Ext.Date.dayNames[this.getDay()]",
			N: "(this.getDay() ? this.getDay() : 7)",
			S: "Ext.Date.getSuffix(this)",
			w: "this.getDay()",
			z: "Ext.Date.getDayOfYear(this)",
			W: "Ext.String.leftPad(Ext.Date.getWeekOfYear(this), 2, '0')",
			F: "Ext.Date.monthNames[this.getMonth()]",
			m: "Ext.String.leftPad(this.getMonth() + 1, 2, '0')",
			M: "Ext.Date.getShortMonthName(this.getMonth())", // get localized short month name
			n: "(this.getMonth() + 1)",
			t: "Ext.Date.getDaysInMonth(this)",
			L: "(Ext.Date.isLeapYear(this) ? 1 : 0)",
			o: "(this.getFullYear() + (Ext.Date.getWeekOfYear(this) == 1 && this.getMonth() > 0 ? +1 : (Ext.Date.getWeekOfYear(this) >= 52 && this.getMonth() < 11 ? -1 : 0)))",
			Y: "Ext.String.leftPad(this.getFullYear(), 4, '0')",
			y: "('' + this.getFullYear()).substring(2, 4)",
			a: "(this.getHours() < 12 ? 'am' : 'pm')",
			A: "(this.getHours() < 12 ? 'AM' : 'PM')",
			g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
			G: "this.getHours()",
			h: "Ext.String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
			H: "Ext.String.leftPad(this.getHours(), 2, '0')",
			i: "Ext.String.leftPad(this.getMinutes(), 2, '0')",
			s: "Ext.String.leftPad(this.getSeconds(), 2, '0')",
			u: "Ext.String.leftPad(this.getMilliseconds(), 3, '0')",
			O: "Ext.Date.getGMTOffset(this)",
			P: "Ext.Date.getGMTOffset(this, true)",
			T: "Ext.Date.getTimezone(this)",
			Z: "(this.getTimezoneOffset() * -60)",
	
			c: function() { // ISO-8601 -- GMT format
				var c, code, i, l, e;
				for (c = "Y-m-dTH:i:sP", code = [], i = 0, l = c.length; i < l; ++i) {
					e = c.charAt(i);
					code.push(e == "T" ? "'T'" : utilDate.getFormatCode(e)); // treat T as a character literal
				}
				return code.join(" + ");
			},
			U: "Math.round(this.getTime() / 1000)"
		 },
		 
		 
		     isValid : function(y, m, d, h, i, s, ms) {
				// setup defaults
				h = h || 0;
				i = i || 0;
				s = s || 0;
				ms = ms || 0;
		
				// Special handling for year < 100
				var dt = utilDate.add(new Date(y < 100 ? 100 : y, m - 1, d, h, i, s, ms), utilDate.YEAR, y < 100 ? y - 100 : 0);
		
				return y == dt.getFullYear() &&
					m == dt.getMonth() + 1 &&
					d == dt.getDate() &&
					h == dt.getHours() &&
					i == dt.getMinutes() &&
					s == dt.getSeconds() &&
					ms == dt.getMilliseconds();
			},
			
			 parse : function(input, format, strict) {
					var p = utilDate.parseFunctions;
					if (p[format] == null) {
						utilDate.createParser(format);
					}
					return p[format].call(utilDate, input, Ext.isDefined(strict) ? strict : utilDate.useStrict);
			},
			
			parseDate:function(input,format,strict)
			{
				return utilDate.parse(input,format,strict);
			},
			getFormatCode:function(character)
			{
				var f = utilDate.formatCodes[character];
				
				if(f)
				{
					f = typeof f == 'function' ? f() :f;
				}
				
				return f || ("'" +Ext.String.excape(character) +"'");
			},
			createFormat:function(format)
			{
				var code =[],special = false,ch ='',i;
				
				for(i =0;i<format.length;i++)
				{
					ch = format.charAt(i);
					
					if(!special && ch =='\\')
					{
						special = true;
					}
					else if(special)
					{
						special =false;
						code.push("'" + Ext.String.excape(ch) +"'");
					}
					else
					{
						code.push(utilDate.getFormatCode(ch));
					}
				}
				
				utilDate.formatFunctions[format] = Ext.functionFactory('return '+ code.join('+');
			},
			createParser:function(format)
			{
				var regexNum = utilDate.parseRegexes.length,
				     currentGroup = 1,
					 calc = [],
					 regex = [],
					 special = false,
					 ch = '',
					 i = 0,
					 len = format.length,
					 atEnd = [],
					 obj;
					 
				        for (; i < len; ++i) {
					ch = format.charAt(i);
					if (!special && ch == "\\") {
						special = true;
					} else if (special) {
						special = false;
						regex.push(Ext.String.escape(ch));
					} else {
						obj = utilDate.formatCodeToRegex(ch, currentGroup);
						currentGroup += obj.g;
						regex.push(obj.s);
						if (obj.g && obj.c) {
							if (obj.calcAtEnd) {
								atEnd.push(obj.c);
							} else {
								calc.push(obj.c);
							}
						}
					}
				}
		
				calc = calc.concat(atEnd);
		
				utilDate.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", 'i');
				utilDate.parseFunctions[format] = Ext.functionFactory("input", "strict", xf(code, regexNum, calc.join('')));
		   },
		   
		   parseCodes:{
		   		d: {
					g:1,
					c:"d = parseInt(results[{0}], 10);\n",
					s:"(3[0-1]|[1-2][0-9]|0[1-9])" // day of month with leading zeroes (01 - 31)
				},
				j: {
					g:1,
					c:"d = parseInt(results[{0}], 10);\n",
					s:"(3[0-1]|[1-2][0-9]|[1-9])" // day of month without leading zeroes (1 - 31)
				},
				D: function() {
					for (var a = [], i = 0; i < 7; a.push(utilDate.getShortDayName(i)), ++i); // get localised short day names
					return {
						g:0,
						c:null,
						s:"(?:" + a.join("|") +")"
					};
				},
				l: function() {
					return {
						g:0,
						c:null,
						s:"(?:" + utilDate.dayNames.join("|") + ")"
					};
				},
				N: {
					g:0,
					c:null,
					s:"[1-7]" // ISO-8601 day number (1 (monday) - 7 (sunday))
				},
				//<locale type="object" property="parseCodes">
				S: {
					g:0,
					c:null,
					s:"(?:st|nd|rd|th)"
				},
				//</locale>
				w: {
					g:0,
					c:null,
					s:"[0-6]" // JavaScript day number (0 (sunday) - 6 (saturday))
				},
				z: {
					g:1,
					c:"z = parseInt(results[{0}], 10);\n",
					s:"(\\d{1,3})" // day of the year (0 - 364 (365 in leap years))
				},
				W: {
					g:1,
					c:"W = parseInt(results[{0}], 10);\n",
					s:"(\\d{2})" // ISO-8601 week number (with leading zero)
				},
				F: function() {
					return {
						g:1,
						c:"m = parseInt(me.getMonthNumber(results[{0}]), 10);\n", // get localised month number
						s:"(" + utilDate.monthNames.join("|") + ")"
					};
				},
				M: function() {
					for (var a = [], i = 0; i < 12; a.push(utilDate.getShortMonthName(i)), ++i); // get localised short month names
					return Ext.applyIf({
						s:"(" + a.join("|") + ")"
					}, utilDate.formatCodeToRegex("F"));
				},
				m: {
					g:1,
					c:"m = parseInt(results[{0}], 10) - 1;\n",
					s:"(1[0-2]|0[1-9])" // month number with leading zeros (01 - 12)
				},
				n: {
					g:1,
					c:"m = parseInt(results[{0}], 10) - 1;\n",
					s:"(1[0-2]|[1-9])" // month number without leading zeros (1 - 12)
				},
				t: {
					g:0,
					c:null,
					s:"(?:\\d{2})" // no. of days in the month (28 - 31)
				},
				L: {
					g:0,
					c:null,
					s:"(?:1|0)"
				},
				o: { 
					g: 1,
					c: "y = parseInt(results[{0}], 10);\n",
					s: "(\\d{4})" // ISO-8601 year number (with leading zero)
		
				},
				Y: {
					g:1,
					c:"y = parseInt(results[{0}], 10);\n",
					s:"(\\d{4})" // 4-digit year
				},
				y: {
					g:1,
					c:"var ty = parseInt(results[{0}], 10);\n"
						+ "y = ty > me.y2kYear ? 1900 + ty : 2000 + ty;\n", // 2-digit year
					s:"(\\d{1,2})"
				},
				/*
				 * In the am/pm parsing routines, we allow both upper and lower case
				 * even though it doesn't exactly match the spec. It gives much more flexibility
				 * in being able to specify case insensitive regexes.
				 */
				//<locale type="object" property="parseCodes">
				a: {
					g:1,
					c:"if (/(am)/i.test(results[{0}])) {\n"
						+ "if (!h || h == 12) { h = 0; }\n"
						+ "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
					s:"(am|pm|AM|PM)",
					calcAtEnd: true
				},
				//</locale>
				//<locale type="object" property="parseCodes">
				A: {
					g:1,
					c:"if (/(am)/i.test(results[{0}])) {\n"
						+ "if (!h || h == 12) { h = 0; }\n"
						+ "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
					s:"(AM|PM|am|pm)",
					calcAtEnd: true
				},
				//</locale>
				g: {
					g:1,
					c:"h = parseInt(results[{0}], 10);\n",
					s:"(1[0-2]|[0-9])" //  12-hr format of an hour without leading zeroes (1 - 12)
				},
				G: {
					g:1,
					c:"h = parseInt(results[{0}], 10);\n",
					s:"(2[0-3]|1[0-9]|[0-9])" // 24-hr format of an hour without leading zeroes (0 - 23)
				},
				h: {
					g:1,
					c:"h = parseInt(results[{0}], 10);\n",
					s:"(1[0-2]|0[1-9])" //  12-hr format of an hour with leading zeroes (01 - 12)
				},
				H: {
					g:1,
					c:"h = parseInt(results[{0}], 10);\n",
					s:"(2[0-3]|[0-1][0-9])" //  24-hr format of an hour with leading zeroes (00 - 23)
				},
				i: {
					g:1,
					c:"i = parseInt(results[{0}], 10);\n",
					s:"([0-5][0-9])" // minutes with leading zeros (00 - 59)
				},
				s: {
					g:1,
					c:"s = parseInt(results[{0}], 10);\n",
					s:"([0-5][0-9])" // seconds with leading zeros (00 - 59)
				},
				u: {
					g:1,
					c:"ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
					s:"(\\d+)" // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
				},
				O: {
					g:1,
					c:[
						"o = results[{0}];",
						"var sn = o.substring(0,1),", // get + / - sign
							"hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
							"mn = o.substring(3,5) % 60;", // get minutes
						"o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
					].join("\n"),
					s: "([+-]\\d{4})" // GMT offset in hrs and mins
				},
				P: {
					g:1,
					c:[
						"o = results[{0}];",
						"var sn = o.substring(0,1),", // get + / - sign
							"hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", // get hours (performs minutes-to-hour conversion also, just in case)
							"mn = o.substring(4,6) % 60;", // get minutes
						"o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n" // -12hrs <= GMT offset <= 14hrs
					].join("\n"),
					s: "([+-]\\d{2}:\\d{2})" // GMT offset in hrs and mins (with colon separator)
				},
				T: {
					g:0,
					c:null,
					s:"[A-Z]{1,5}" // timezone abbrev. may be between 1 - 5 chars
				},
				Z: {
					g:1,
					c:"zz = results[{0}] * 1;\n" // -43200 <= UTC offset <= 50400
						  + "zz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
					s:"([+-]?\\d{1,5})" // leading '+' sign is optional for UTC offset
				},
				c: function() {
					var calc = [],
						arr = [
							utilDate.formatCodeToRegex("Y", 1), // year
							utilDate.formatCodeToRegex("m", 2), // month
							utilDate.formatCodeToRegex("d", 3), // day
							utilDate.formatCodeToRegex("H", 4), // hour
							utilDate.formatCodeToRegex("i", 5), // minute
							utilDate.formatCodeToRegex("s", 6), // second
							{c:"ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"}, // decimal fraction of a second (minimum = 1 digit, maximum = unlimited)
							{c:[ // allow either "Z" (i.e. UTC) or "-0530" or "+08:00" (i.e. UTC offset) timezone delimiters. assumes local timezone if no timezone is specified
								"if(results[8]) {", // timezone specified
									"if(results[8] == 'Z'){",
										"zz = 0;", // UTC
									"}else if (results[8].indexOf(':') > -1){",
										utilDate.formatCodeToRegex("P", 8).c, // timezone offset with colon separator
									"}else{",
										utilDate.formatCodeToRegex("O", 8).c, // timezone offset without colon separator
									"}",
								"}"
							].join('\n')}
						],
						i,
						l;
		
					for (i = 0, l = arr.length; i < l; ++i) {
						calc.push(arr[i].c);
					}
		
					return {
						g:1,
						c:calc.join(""),
						s:[
							arr[0].s, // year (required)
							"(?:", "-", arr[1].s, // month (optional)
								"(?:", "-", arr[2].s, // day (optional)
									"(?:",
										"(?:T| )?", // time delimiter -- either a "T" or a single blank space
										arr[3].s, ":", arr[4].s,  // hour AND minute, delimited by a single colon (optional). MUST be preceded by either a "T" or a single blank space
										"(?::", arr[5].s, ")?", // seconds (optional)
										"(?:(?:\\.|,)(\\d+))?", // decimal fraction of a second (e.g. ",12345" or ".98765") (optional)
										"(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", // "Z" (UTC) or "-0530" (UTC offset without colon delimiter) or "+08:00" (UTC offset with colon delimiter) (optional)
									")?",
								")?",
							")?"
						].join("")
					};
				},
				U: {
					g:1,
					c:"u = parseInt(results[{0}], 10);\n",
					s:"(-?\\d+)" // leading minus sign indicates seconds before UNIX epoch
				}
			}
		   
		   },
		   dataFormat:function(date,format)
		   {
			   return utilDate.format(date,format);
		   },
		   isEqual: function(date1, date2) {
        // check we have 2 date objects
				if (date1 && date2) {
					return (date1.getTime() === date2.getTime());
				}
				// one or both isn't a date, only equal if both are falsey
				return !(date1 || date2);
			},
			 format: function(date, format) {
				var formatFunctions = utilDate.formatFunctions;
		
				if (!Ext.isDate(date)) {
					return '';
				}
		
				if (formatFunctions[format] == null) {
					utilDate.createFormat(format);
				}
		
				return formatFunctions[format].call(date) + '';
			},
			getTimezone : function(date) {
				return date.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,5})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
			},
			getGMTOffset : function(date, colon) {
				var offset = date.getTimezoneOffset();
				return (offset > 0 ? "-" : "+")
					+ Ext.String.leftPad(Math.floor(Math.abs(offset) / 60), 2, "0")
					+ (colon ? ":" : "")
					+ Ext.String.leftPad(Math.abs(offset % 60), 2, "0");
    		},
			getDayOfYear: function(date) {
				var num = 0,
					d = Ext.Date.clone(date),
					m = date.getMonth(),
					i;
		
				for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
					num += utilDate.getDaysInMonth(d);
				}
				return num + date.getDate() - 1;
			},
			
		   getWeekOfYear : (function() {
				// adapted from http://www.merlyn.demon.co.uk/weekcalc.htm
				var ms1d = 864e5, // milliseconds in a day
					ms7d = 7 * ms1d; // milliseconds in a week
		
				return function(date) { // return a closure so constants get calculated only once
					var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d, // an Absolute Day Number
						AWN = Math.floor(DC3 / 7), // an Absolute Week Number
						Wyr = new Date(AWN * ms7d).getUTCFullYear();
		
					return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
				};
			}()), 
		   isLeapYear : function(date) {
				var year = date.getFullYear();
				return !!((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
			},
			
			getLastDayOfMonth : function(date) {
				return utilDate.getLastDateOfMonth(date).getDay();
			},
			
			getFirstDayOfMonth:function(date)
			{
				return new Date(date.getFullYear(),date.getMonth(),1);	
			},
			getLastDateOfMonth:function(date)
			{
				return new Date(date.getFullYear(),date.getMonth(),utilDate.getDaysInMonth(date));
			},
			getDaysInMonth: (function() {
				var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		
				return function(date) { // return a closure for efficiency
					var m = date.getMonth();
		
					return m == 1 && utilDate.isLeapYear(date) ? 29 : daysInMonth[m];
				};
			}()),
			
		getSuffix : function(date) {
			switch (date.getDate()) {
				case 1:
				case 21:
				case 31:
					return "st";
				case 2:
				case 22:
					return "nd";
				case 3:
				case 23:
					return "rd";
				default:
					return "th";
			}
		},
		clone:function(date)
		{
			return new Date(date.getTime());
		},
		isDST : function(date) {
        // adapted from http://sencha.com/forum/showthread.php?p=247172#post247172
        // courtesy of @geoffrey.mcgill
				return new Date(date.getFullYear(), 0, 1).getTimezoneOffset() != date.getTimezoneOffset();
		},
	    clearTime : function(date, clone) {
			if (clone) {
				return Ext.Date.clearTime(Ext.Date.clone(date));
			}
	
			// get current date before clearing time
			var d = date.getDate(),
				hr,
				c;
	
			// clear time
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
	
			if (date.getDate() != d) { // account for DST (i.e. day of month changed when setting hour = 0)
				// note: DST adjustments are assumed to occur in multiples of 1 hour (this is almost always the case)
				// refer to http://www.timeanddate.com/time/aboutdst.html for the (rare) exceptions to this rule
	
				// increment hour until cloned date == current date
				for (hr = 1, c = utilDate.add(date, Ext.Date.HOUR, hr); c.getDate() != d; hr++, c = utilDate.add(date, Ext.Date.HOUR, hr));
	
				date.setDate(d);
				date.setHours(c.getHours());
			}
	
			return date;
		},
		add : function(date, interval, value) {
        var d = Ext.Date.clone(date),
            Date = Ext.Date,
            day, decimalValue, base = 0;
        if (!interval || value === 0) {
            return d;
        }

        decimalValue = value - parseInt(value, 10);
        value = parseInt(value, 10);

        if (value) {
            switch(interval.toLowerCase()) {
                // See EXTJSIV-7418. We use setTime() here to deal with issues related to
                // the switchover that occurs when changing to daylight savings and vice
                // versa. setTime() handles this correctly where setHour/Minute/Second/Millisecond
                // do not. Let's assume the DST change occurs at 2am and we're incrementing using add
                // for 15 minutes at time. When entering DST, we should see:
                // 01:30am
                // 01:45am
                // 03:00am // skip 2am because the hour does not exist
                // ...
                // Similarly, leaving DST, we should see:
                // 01:30am
                // 01:45am
                // 01:00am // repeat 1am because that's the change over
                // 01:30am
                // 01:45am
                // 02:00am
                // ....
                // 
                case Ext.Date.MILLI:
                    d.setTime(d.getTime() + value);
                    break;
                case Ext.Date.SECOND:
                    d.setTime(d.getTime() + value * 1000);
                    break;
                case Ext.Date.MINUTE:
                    d.setTime(d.getTime() + value * 60 * 1000);
                    break;
                case Ext.Date.HOUR:
                    d.setTime(d.getTime() + value * 60 * 60 * 1000);
                    break;
                case Ext.Date.DAY:
                    d.setDate(d.getDate() + value);
                    break;
                case Ext.Date.MONTH:
                    day = date.getDate();
                    if (day > 28) {
                        day = Math.min(day, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(date), Ext.Date.MONTH, value)).getDate());
                    }
                    d.setDate(day);
                    d.setMonth(date.getMonth() + value);
                    break;
                case Ext.Date.YEAR:
                    day = date.getDate();
                    if (day > 28) {
                        day = Math.min(day, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(date), Ext.Date.YEAR, value)).getDate());
                    }
                    d.setDate(day);
                    d.setFullYear(date.getFullYear() + value);
                    break;
            }
        }

        if (decimalValue) {
            switch (interval.toLowerCase()) {
                case Ext.Date.MILLI:    base = 1;               break;
                case Ext.Date.SECOND:   base = 1000;            break;
                case Ext.Date.MINUTE:   base = 1000*60;         break;
                case Ext.Date.HOUR:     base = 1000*60*60;      break;
                case Ext.Date.DAY:      base = 1000*60*60*24;   break;

                case Ext.Date.MONTH:
                    day = utilDate.getDaysInMonth(d);
                    base = 1000*60*60*24*day;
                    break;

                case Ext.Date.YEAR:
                    day = (utilDate.isLeapYear(d) ? 366 : 365);
                    base = 1000*60*60*24*day;
                    break;
            }
            if (base) {
                d.setTime(d.getTime() + base * decimalValue); 
            }
        }

        return d;
    },
    
    /**
     * Provides a convenient method for performing basic date arithmetic. This method
     * does not modify the Date instance being called - it creates and returns
     * a new Date instance containing the resulting date value.
     * 
     * Examples:
     *
     *     // Basic usage:
     *     var dt = Ext.Date.subtract(new Date('10/29/2006'), Ext.Date.DAY, 5);
     *     console.log(dt); // returns 'Tue Oct 24 2006 00:00:00'
     *
     *     // Negative values will be added:
     *     var dt2 = Ext.Date.subtract(new Date('10/1/2006'), Ext.Date.DAY, -5);
     *     console.log(dt2); // returns 'Fri Oct 6 2006 00:00:00'
     *
     *      // Decimal values can be used:
     *     var dt3 = Ext.Date.subtract(new Date('10/1/2006'), Ext.Date.DAY, 1.25);
     *     console.log(dt3); // returns 'Fri Sep 29 2006 06:00:00'
     * 
     * @param {Date} date The date to modify
     * @param {String} interval A valid date interval enum value.
     * @param {Number} value The amount to subtract from the current date.
     * @return {Date} The new Date instance.
     */
    subtract: function(date, interval, value){
        return utilDate.add(date, interval, -value);
    },

    /**
     * Checks if a date falls on or between the given start and end dates.
     * @param {Date} date The date to check
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} `true` if this date falls on or between the given start and end dates.
     */
    between : function(date, start, end) {
        var t = date.getTime();
        return start.getTime() <= t && t <= end.getTime();
    },

    //Maintains compatibility with old static and prototype window.Date methods.
    compat: function() {
        var nativeDate = window.Date,
            p,
            statics = ['useStrict', 'formatCodeToRegex', 'parseFunctions', 'parseRegexes', 'formatFunctions', 'y2kYear', 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'MONTH', 'YEAR', 'defaults', 'dayNames', 'monthNames', 'monthNumbers', 'getShortMonthName', 'getShortDayName', 'getMonthNumber', 'formatCodes', 'isValid', 'parseDate', 'getFormatCode', 'createFormat', 'createParser', 'parseCodes'],
            proto = ['dateFormat', 'format', 'getTimezone', 'getGMTOffset', 'getDayOfYear', 'getWeekOfYear', 'isLeapYear', 'getFirstDayOfMonth', 'getLastDayOfMonth', 'getDaysInMonth', 'getSuffix', 'clone', 'isDST', 'clearTime', 'add', 'between'],
            sLen    = statics.length,
            pLen    = proto.length,
            stat, prot, s;

        //Append statics
        for (s = 0; s < sLen; s++) {
            stat = statics[s];
            nativeDate[stat] = utilDate[stat];
        }

        //Append to prototype
        for (p = 0; p < pLen; p++) {
            prot = proto[p];
            nativeDate.prototype[prot] = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this);
                return utilDate[prot].apply(utilDate, args);
            };
        }
    }
	 });
		 
}
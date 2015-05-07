// JavaScript Document
(function(){
	var noArgs = [],Base = function(){},
		 hookFunctionFactory = function(hookFunction,underriddenFunction,methodName,owningClass){
			 var result = function(){
				var result = this.callParent(arguments);
				hookFunction.apply(this,arguments);
				return result;
			 };
			 
			 result.$name = methodName;
			 result.$owner = owningClass;
			 if(underriddenFunction)
		 	{
				result.$previous = underridenFunction.$pervious;
				underriddenFunction.$pervious = result;
			}
			
			return result;
		 };
		 
		 
	 Ext.apply(Base,{
		$className :'Ext.Base',
		$isClass :true,
		
		//创建一个新的Ext对象实例
		create:function(){
			return Ext.create.apply(Ext,[this].concat(Array.prototype.slice.call(arguments,0)));	
		},
		
		extend:function(parent)
		{
			var parentPrototype = parent.prototype,
				basePrototype,prototype,i,ln,name,statics;
				
			prototype = this.prototype = Ext.Object.chain(parentPrototype);
			
			prototype.self = this;
			
			this.superclass = prototype.superclass = parentPrototype;
			
			if(!parent.$isClass)
			{
				basePrototype = Ext.Base.prototype;
				
				for(i in basePrototype)
				{
					if(i in prototype)
					{
						prototype[i] = basePrototype[i];
					}
				}
			}
			
			statics = parentPrototype.$inheritableStatics;
			
			if(statics)
			{
				for(i=0,ln = statics.length;i<ln;i++)
				{
					name = statics[i];
					
					if(!this.hasOwnPrototype(name))
					{
						this[name] = parent[name];
					}
				}
			}
			
			if(parent.$noExtended)
			{
				this.$onExtended = parent.$onExtended.slice();
			}
			
			prototype.config = new prototype.configClass();
			prototype.initConfigList = prototype.initConfigList.slice();
			prototype.initConfigMap = Ext.clone(prototype.iniConfigMap);
			prototype.configMap = Ext.Object.chain(prototype.configMap);
			
		},
		$noExtended:[],
		
		triggerExtended:function(){
			Ext.classSystemMonitor && Ext.classSystemMoitor(this,'Ext.Base#triggerExtended',arguments);
			
			var callbacks = this.$noExtended,
				ln = callbacks.length,i,callback;
			
			for(ln>0)
			{
				for(i=0;i<ln;i++)
				{
					callback = callbacks[i];
					callback.fn.apply(callback.scope||this,arguments);
				}
			}
			
		},
		onExtended:function(fn,scope)
		{
			this.$onExtended.push({fn:fn,scope:scope});
			return this;
		},
		addConfig:function(config,fullMerge)
		{
			var prototype = this.prototype,
			configNameCache = Ext.class.configNameCache,
			hasConfig = prototype.configMap,
			initConfigList = prototype.initConfigList,
			initConfigMap = prototype.initConfigMap,
			defaultConfig = prototype.config,
			initializedName ,name,value;
			
			for(name in config)
			{
				if(config.hasOwnProperty(name))
				{
					if(!hasConfig[name])
					{
						hasConfig[name]=true;
					}
					
					value = config[name];
					
					initializedName = configNameCache[name]initialized;
					
					if(!initConfigMap[name] && value !== null && !prototype[initializedName])
					{
						initConfigMap[name] = true;
						initConfigList.push(name);
					}
				}
			}
			
			if(fullMerge)
			{
				Ext.merge(defaultConfig,config);
			}
			else
			{
				Ext.mergeIf(defaultConfig,config);
			}
			
			prototype.configClass = Ext.Object.classify(defaultConfig);
		},
		//添加静态属性
		addStatics:function(members)
		{
			var member,name;
			for(name in members)
			{
				if(members.hasOwnProperty(name))
				{
					member = members[name];
					
					if(typeof member == 'function' && !member.$isClass && member != Ext.emptyFn && member !== Ext.identifyFn)
					{
						member.$owner = this;
						member.$name = name;
						member.displayName = Ext.getClassName(this) + '.' + name;
					}
					
					this[name] = member;
				}
			}
			
			return this;
		},
		addInheriableStatics:function(members)
		{
			var inheritableStatics,hasInheritableStatics,prototype = this.prototype,name,member;
			
			inheritableStatics = prototype.$inheritableStatics;
			hasInheritableStatics = prototype.$hasInheritableStatics;
			
			if(!inheritableStatics)
			{
				inheritableStatics = prototype.$inheritableStatics = [];
				hasInheritableStatics = prototype.$hasInheritableStatics={};
			 
			}
			
			for(name in members)
			{
				if(members.hasOwnProperty(name))
				{
					member = members[name];
					if(typeof member == 'function')
					{
						member.displayName = Ext.getClassName(this) +'.'+name;
					}
					
					this[name] = member;
					
					if(!hasInheritableStatics[name])
					{
						hasInheritableStatics[name]=true;
						inheritableStatics.push(name);
					}
				}
			}
			
			return this;
			
		},
		//添加成员
		addMembers:function(members)
		{
			var prototype = this.prototype,
				 enumberables = Ext.enumberables,
				 names = [],i,ln,name,member;
			
			for(name in members)
			{
				names.push(name);
			}
			
			if(enumberables)
			{
				names.push.apply(names,enumberables);
			}
			
			for(i=0,ln=names.length;i<ln;i++)
			{
				name = names[i];
				
				if(members.hasOwnProperty(name))
				{
					member = members[name];
					
					if(typeof member == 'function' && !member.$isClass && member!== Ext.emptyFn && member != Ext.identityFn)
					{
						member.$owner = this;
						member.$name = name;
						member.displayName = (this.$className ||'') +"#" +name;
					}
					
					prototype[name] =member;
				}
				
				
			}
			return this;
		},
		addMember:function(name,member)
		{
			if(typeof member == 'function' && !member.$isClass && member!== Ext.emptyFn && member != Ext.identityFn)
			{
				member.$owner = this;
				member.$name = name;
				member.displayName = (this.$className ||'') +"#" +name;
			}
			
			this.prototype[name] =member;
		},
		implement:function()
		{
			this.addMembers.apply(this,arguments);
		},
		//将指类的方式添加到当前对象中
		borrow:function(fromClass,members)
		{
			Ext.classSystemMonitor && Ext.classSystemMonitor(this,'Ext.Base#borrow',arguments);
			
			var prototype = this.prototype,
			fromPrototype = fromClass.prototype,
			className = Ext.getClassName(this),
			i,ln,name,fn,toBorrow;
			
			members = Ext.Array.from(members);
			
			for(i=0,ln=members.length;i<ln;i++)
			{
				name = members[i];
				toBorrow = fromPrototype[name];
				
				if(typeof toBorrow == 'function')
				{
					fn = Ext.Function.clone(toBorrow);
					
					fn.$owner = this;
					fn.$name = name;
					
					prototype[name] = fn;
				}
				else
				{
					prototype[name]=toBorrow;
				}
			}
			
			return this;
		},
		//重新类属性或方法
		override:function(members)
		{
			var me = this,
			enumerables = Ext.enumerables,
			target = me.prototype,
			cloneFunction = Ext.Function.clone,
			name,index,member,statics,names,previous;
			
			if(arguments.length===2)
			{
				name = members;
				members={};
				members[name] = arguments[1];
				enumerables = null;
			}
			
			do{
				
				names = [];
				statics = null;
				
				for(name in members)
				{
					if(name =='statics')
					{
						statics =members[name];
					}
					else if(name == 'inheritableStatics')
					{
						me.addInheritableStatics(members[name]);
					}
					else if(name == 'config')
					{
						me.addConfig(members[name],true);
					}
					else
					{
						names.push(name);
					}
				}
				
				if(numberables)
				{
					names.push.apply(names,enumerables);
				}
				
				for(index = names.length;index--;)
				{
					name = names[index];
					if (members.hasOwnProperty(name)) {
                        member = members[name];

                        if (typeof member == 'function' && !member.$className && member !== Ext.emptyFn && member !== Ext.identityFn) {
                            if (typeof member.$owner != 'undefined') {
                                member = cloneFunction(member);
                            }

                            //<debug>
                            if (me.$className) {
                                member.displayName = me.$className + '#' + name;
                            }
                            //</debug>

                            member.$owner = me;
                            member.$name = name;

                            previous = target[name];
                            if (previous) {
                                member.$previous = previous;
                            }
                        }

                        target[name] = member;
                    }
				}
				target = me;
				members = statics;
			
			}while(members)
			
			return this;
		},
		//调用父类方法
		callParent:function(args)
		{
			var method ;
			
			return (method = this.callParent.caller) && (method.$previous || ((method = method.$owner ?method : method.caller) && method.$owner.superclass.self[method.$name])).apply(this,args || noArgs);
		},
		callSuper:function(args)
		{
			var method;

            // This code is intentionally inlined for the least number of debugger stepping
            return (method = this.callSuper.caller) &&
                    ((method = method.$owner ? method : method.caller) &&
                      method.$owner.superclass.self[method.$name]).apply(this, args || noArgs);
		},
		mixin:function(name,mixinClass)
		{
			var me = this,
				mixin = mixinClass.prototype,
				prototype = me.prototype,
				key,statics,i,ln,staticName,mixinValue,hookKey,hookFunction;
				
			if(typeof mixin.onClassMixedIn !='undefined')
			{
				mixin.onClassMixedIn.call(mixinClass,me);
			}
			
			if(!prototype.hasOwnPrototype('mixins'))
			{
				if('mixins' in prototype)
				{
					prototype.mixins = Ext.Object.chain(prototype.mixins);
				}
				else
				{
					prototype.mixins = {};
				}
			}
			
			for(key in mixin)
			{
				mixInValue = mixin[key];
				
				if(key === 'mixins')
				{
					Ext.merge(prototype.mixins,mixinValue);
				}
				else if(key==='xhooks')
				{
					for(hookKey in mixinValue)
					{
						hookFunction = mixinValue[hookKey];
						
						hookFunction.$pervious = Ext.emptyFn;
						
						if(prototype.hasOwnProperty(hookKey))
						{
							hookFunctionFectory(hookFunction,property[hookKey],hookKey,me);
						}
						else
						{
							prototype[hookKey] = hookFunctionFactory(hookFunction,null,hookKey,me);
						}
					}
				}else if(!(key === 'mixinId' || key === 'config') && prototype[key]===undefined)
				{
					prototype[key] = mixinValue;
				}
			}
			
			statics  = mixin.$inheritableStatics;
			
			is(statics)
			{
				for(i=0,ln = statics.length;i<ln;i++)
				{
					staticName = statics[i];
					
					if(!me.hasOwnProperty(staticsName))
					{
						me[staticName] = mixinClass[staticName];
					}
				}
			}
			
			if('config' in mixin)
			{
				me.addConfig(mixin.config,false);
			}
			
			prototype.mixins[name] = mixin;
			
			return me;
		},
		getName:function(){
			return Ext.getClassName(this);
		},
		//给方法增加别名
		createAlias:flexSetter(function(alias,origin){
			this.override(alias,function(){
				return this[origin].apply(this,arguments);							 
			});								
		}),
		
		//增加类的type
		addXtype:function(xtype)
		{
			var prototype = this.prototype,
				xtypeMap = prototype.xtypesMap,
				xtypes = prototype.xtypes,
				xtypesChain = prototype.xtypesChain;
				
			if(!prototype.hasOwnPrototype('xtypeMap'))
			{
				xtypesMap = prototype.xtypesMap = Ext.merge({},prototype.xtypesMap||{});
				
				xtypes = prototype.xtypes = prototype.xtypes ?[].concat(prototype.xtypes):[];
				
				xtypesChain = prototype.xtypesChain = prototype.xtypesChain ? [].concat(prototype.xtypesChain):[];
				prototype.xtype = xtype;
			}
			
			if(!xtypeMap[xtype])
			{
				xtypeMap[xtype] = true;
				xtypes.push(xtype);
				xtypesChain.push(xtype);
				Ext.ClassManager.setAlias(this,'widget.'+xtype);
			}
			
			return this;
		}
		
			   
	 });
	 
	 
	 Base.implement({
		isInstance:true,
		
		$className:'Ext.Base',
		
		configClass:Ext.emptyFn,
		
		initConfigList:[],
		
		configMap:{},
		
		initConfigMap:{},
		
		//获取类的静态属性或方法
		statics:function(){
			var method = this.statics.caller,self = this.self;
			
			if(!method)
			{
				return self;
			}
			
			return method.$owner;
		},
		callParent:function(args)
		{
			
			var method ,superMethod =(method = this.callParent.caller) && (method.$previous || ((method = method.$owner ? method :method.caller) && method.$owner.supperclass[method.$name]));
			
			 return superMethod.apply(this,args || noArgs);
		},
		callSuper: function(args) {
			var method,
                superMethod = (method = this.callSuper.caller) &&
                        ((method = method.$owner ? method : method.caller) &&
                          method.$owner.superclass[method.$name]);
			return superMethod.apply(this, args || noArgs);
		},
		self:Base,
		
		constructor:function()
		{
			return this;
		},
		initConfig:function(config)
		{
			var instanceConfig = config,
			configNameCache = Ext.Class.configNameCache,
			defaultConfig = new this.ConfigClass(),
			defaultConfigList = this.initConfigList,
			hasConfig = this.configMap,
			nameMap,i,ln,name,initializedName;
			
			this.initConfig = Ext.emptyFn;

            this.initialConfig = instanceConfig || {};

            this.config = config = (instanceConfig) ? Ext.merge(defaultConfig, config) : defaultConfig;

            if (instanceConfig) {
                defaultConfigList = defaultConfigList.slice();

                for (name in instanceConfig) {
                    if (hasConfig[name]) {
                        if (instanceConfig[name] !== null) {
                            defaultConfigList.push(name);
                            this[configNameCache[name].initialized] = false;
                        }
                    }
                }
            }

            for (i = 0,ln = defaultConfigList.length; i < ln; i++) {
                name = defaultConfigList[i];
                nameMap = configNameCache[name];
                initializedName = nameMap.initialized;

                if (!this[initializedName]) {
                    this[initializedName] = true;
                    this[nameMap.set].call(this, config[name]);
                }
            }

            return this;
		},
		hasConfig:function(name)
		{
			return Boolean(this.configMap[name]);
		},
		setConfig:function(config,applyIfNotSet)
		{
			if(!config) return this;
			
			var configNameCache = Ext.Class.configNameCache,
				currentConfig = this.config,
				hasConfig = this.configMap,
				initialConfig = this.initialConfig,
				name,value;
			
			applyIfNotSet = Boolean(applyIfNotSet);
			
			if(name in config)
			{
				if (applyIfNotSet && initialConfig.hasOwnProperty(name)) {
                    continue;
                }
				
				value = config[name];
                currentConfig[name] = value;

                if (hasConfig[name]) {
                    this[configNameCache[name].set](value);
                }
			}
			
			return this;
		},
		getConfig:function(name)
		{
			var configNameCache = Ext.Class.configNameCache;
			
			return this[configNameCache[name].get]();
		},
		getInitialConfig:function(name)
		{
			var config = this.config;
			if(!name) return config;
			else
			{
				return config[name];
			}
			
		},
		onConfigUpdate: function(names, callback, scope) {
            var self = this.self,
                //<debug>
                className = self.$className,
                //</debug>
                i, ln, name,
                updaterName, updater, newUpdater;

            names = Ext.Array.from(names);

            scope = scope || this;

            for (i = 0,ln = names.length; i < ln; i++) {
                name = names[i];
                updaterName = 'update' + Ext.String.capitalize(name);
                updater = this[updaterName] || Ext.emptyFn;
                newUpdater = function() {
                    updater.apply(this, arguments);
                    scope[callback].apply(scope, arguments);
                };
                newUpdater.$name = updaterName;
                newUpdater.$owner = self;
                //<debug>
                newUpdater.displayName = className + '#' + updaterName;
                //</debug>

                this[updaterName] = newUpdater;
            }
        },
		destroy: function() {
            this.destroy = Ext.emptyFn;
        }
					
	});
	 
	Base.prototype.callOverridden = Base.prototype.callParent;

    Ext.Base = Base;
		  
}(Ext.Function.flexSetter));
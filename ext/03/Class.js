// JavaScript Document
(function(){
	var ExtClass ,Base = Ext.Base,
		baseStaticMembers = [],
		baseStaticMember,baseStaticMemberLength;
		
		for(baseStaticMember in Base)
		{
			if(Base.hasOwnProperty(baseStaticMember))
			{
				baseStaticMembers.push(baseStaticMember);
			}
		}
		
		baseStaticMemberLength = baseStaticMembers.length;
		
		//���ɹ��캯��
		function makeCtor(className)
		{
			function constructor()
			{
				return this.construnctor.apply(this,arguments) || null;
			}
			
			if(className)
			{
				constructor.displayName = className;
			}
			
			return constructor;
		}
		
		//����һ��������
		Ext.Class = ExtClass = function(Class,data,onCreated)
		{
			if(typeof Class !='function')
			{
				onCreated = data;
				data = Class;
				Class = null;
			}
			
			if(!data)
			{
				data = {};
			}
			
			Class = ExtClass.create(Class,data);
			ExtClass.process(Class,data,onCreated);
			
			return Class;
		}
		
		Ext.apply(ExtClass,{
			
			onBeforeCreated:function(Class,data,hooks)
			{
				Class.addMembers(data);
				
				hooks.onCreate.call(Class,Class);
			},
			//����һ����
			create:function(Class,data)
			{
				var name ,i;
				if(!Class)
				{
					Class = mackCtro(data.$className);
				}
				
				for(i=0;i<baseStaticMemberLength;i++)
				{
					name = baseStaticMemebers[i];
					Class[name]= Base[name];
				}
				
				return Class;
			},
			process:function(Class,data,onCreated)
			{
				var preprocessorStatck = data.preprocessors || ExtClass.defaultPreprocessors,
					registeredProcessors = this.preprocessors,
					hooks = {onBeforeCreated:this.onBeforeCreated},
					preprocessors = [],
					preprocessor,preprocessorsProperties,i,ln,j,subLn,preprocessorProperty;
					
					delete data.preprocessors;
					
					for(i=0,ln=preprocessorStack.length;i<ln;i++)
					{
						preprocessor = preprocessorStack[i];
						
						if (typeof preprocessor == 'string') {
							preprocessor = registeredPreprocessors[preprocessor];
							preprocessorsProperties = preprocessor.properties;
		
							if (preprocessorsProperties === true) {
								preprocessors.push(preprocessor.fn);
							}
							else if (preprocessorsProperties) {
								for (j = 0,subLn = preprocessorsProperties.length; j < subLn; j++) {
									preprocessorProperty = preprocessorsProperties[j];
		
									if (data.hasOwnProperty(preprocessorProperty)) {
										preprocessors.push(preprocessor.fn);
										break;
									}
								}
							}
						}
						else {
							preprocessors.push(preprocessor);
						}
					}
					
					hooks.onCreated = onCreated ?onCreated :Ext.emptyFn;
					hooks.preprocessors = preprocessors;
					this.doProcess(Class,data,hooks);
			},
			
			doProcess:function(Class,data,hooks)
			{
				var me = this,preprocessors = hooks.proprocessors,
					 preprocessor = preprocessors.shift(),
					 doProcess = me.doProcess;
					 
				for(;preprocessor;preprocessor = preprocessors.shift())
				{
					if(preprocessor.call(me,Class,data,hooks,doProcess)===false)
					{
						return ;
					}
				}
				hooks.onBeforeCreated.apply(me,arguments);
			},
			
			preprocessors:{},
			
			registerPreprocessor:function(name,fn,properties,position,relativeTo)
			{
				if(!position) position = 'last';
				
				if(!properties) properties = [name];
				
				this.preprocessors[name]={name:name,properties:properties || false,fn:fn};
				
				this.setDefaultPreprocessorPosition(name,position,relativeTo);
				
				return this;
			},
			getPreprocessor:function(name)
			{
				return this.preprocessors[name];
			},
			getPreprocessors:function(){
				return this.preprocessors;	
			},
			defaultPreprocessors:[],
			
			getDefaultPreprocessors:function()
			{
				return this.defaultPreProcessors;
			},
			setDefaultPreprocessors:function(preprocessors)
			{
				this.defaultPreprocess = Ext.Array.from(preprocessors);
				
				return this;
			},
			setDefaultPreprocessorPosition:function(name,offset,relativeName)
			{
				var defaultPreprocessors = this.defaultPreprocessors,index;
				
				if(typeof offset== 'string')
				{
					if(offset==='first')
					{
						defaultPreprocessors.unshift(name);
						return this;
					}
					else if(offset==='last')
					{
						defaultPreprocessors.push(name);
						return this;
					}
					
					offset = (offset === 'after') ? 1:-1;
				}
				
				index = Ext.Array.indexOf(defaultPreprocessors,relativeName);
				
				if(index!==-1)
				{
					Ext.Array.splice(defaultPrepreprocessors,Math.max(0,index+offset),0,name);
				}
				return this;
			},
			configNameCache:{},
			getConfigNameMap:function(name){
				var cache = this.configNameCache,
				map = cache[name],
				capitalizedName;
				
				if(!map)
				{
					capitalizedName = name.charAt(0),toUpperCase()+name.substr(1);
					
					map = cache[name]={
						internal:name,
						initialized:'_is'+capitalizedName+'Initialized',
						apply:'apply'+capitalizedName,
						update:'update'+cptializedName,
						'set':'set'+capitalizedName,
						'get':'get'+capitalizedName,
						doSet:'doSet'+capitalizedName,
						changeEvent:name.toLowerCase() +'change'
					}
				}
				
				return map;
			}
		
		
		});
		
	ExtClass.registerPreprocessor('extend',function(Class,data,hooks){
		var Base  = Ext.Base,
		basePrototype = Base.prototype,
		extend = data.extend,Parent,parentPrototype,i;
		
		delete data.extend;
		
		if(extend && extend !== Object)
		{
			Parent = extend;
		}
		else
		{
			Parent = Base;
		}
		
		parentPrototype = Parent.prototype;
		
		if (!Parent.$isClass) {
            for (i in basePrototype) {
                if (!parentPrototype[i]) {
                    parentPrototype[i] = basePrototype[i];
                }
            }
        }
		
		 Class.extend(Parent);
		 
		 Class.triggerExtended.apply(Class, arguments);

        if (data.onClassExtended) {
            Class.onExtended(data.onClassExtended, Class);
            delete data.onClassExtended;
        }
	},true);
	
	//ע�ᾲ̬���Դ�����
	 ExtClass.registerPreprocessor('statics', function(Class, data) {
        //<debug>
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#staticsPreprocessor', arguments);
        //</debug>
        
        Class.addStatics(data.statics);

        delete data.statics;
    });
	 
	 ExtClass.registerPreprocessor('inheritableStatics', function(Class, data) {
        //<debug>
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#inheritableStaticsPreprocessor', arguments);
        //</debug>
        
        Class.addInheritableStatics(data.inheritableStatics);

        delete data.inheritableStatics;
    });
	 
	 ExtClass.registerPreprocessor('config', function(Class, data) {
        //<debug>
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#configPreProcessor', arguments);
        //</debug>
        
        var config = data.config,
            prototype = Class.prototype;

        delete data.config;

        Ext.Object.each(config, function(name, value) {
            var nameMap = ExtClass.getConfigNameMap(name),
                internalName = nameMap.internal,
                initializedName = nameMap.initialized,
                applyName = nameMap.apply,
                updateName = nameMap.update,
                setName = nameMap.set,
                getName = nameMap.get,
                hasOwnSetter = (setName in prototype) || data.hasOwnProperty(setName),
                hasOwnApplier = (applyName in prototype) || data.hasOwnProperty(applyName),
                hasOwnUpdater = (updateName in prototype) || data.hasOwnProperty(updateName),
                optimizedGetter, customGetter;

            if (value === null || (!hasOwnSetter && !hasOwnApplier && !hasOwnUpdater)) {
                prototype[internalName] = value;
                prototype[initializedName] = true;
            }
            else {
                prototype[initializedName] = false;
            }

            if (!hasOwnSetter) {
                data[setName] = function(value) {
                    var oldValue = this[internalName],
                        applier = this[applyName],
                        updater = this[updateName];

                    if (!this[initializedName]) {
                        this[initializedName] = true;
                    }

                    if (applier) {
                        value = applier.call(this, value, oldValue);
                    }

                    if (typeof value != 'undefined') {
                        this[internalName] = value;

                        if (updater && value !== oldValue) {
                            updater.call(this, value, oldValue);
                        }
                    }

                    return this;
                };
            }

            if (!(getName in prototype) || data.hasOwnProperty(getName)) {
                customGetter = data[getName] || false;

                if (customGetter) {
                    optimizedGetter = function() {
                        return customGetter.apply(this, arguments);
                    };
                }
                else {
                    optimizedGetter = function() {
                        return this[internalName];
                    };
                }

                data[getName] = function() {
                    var currentGetter;

                    if (!this[initializedName]) {
                        this[initializedName] = true;
                        this[setName](this.config[name]);
                    }

                    currentGetter = this[getName];

                    if ('$previous' in currentGetter) {
                        currentGetter.$previous = optimizedGetter;
                    }
                    else {
                        this[getName] = optimizedGetter;
                    }

                    return optimizedGetter.apply(this, arguments);
                };
            }
        });

        Class.addConfig(config, true);
    });
	    ExtClass.registerPreprocessor('mixins', function(Class, data, hooks) {
        //<debug>
        Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#mixinsPreprocessor', arguments);
        //</debug>
        
        var mixins = data.mixins,
            name, mixin, i, ln;

        delete data.mixins;

        Ext.Function.interceptBefore(hooks, 'onCreated', function() {
            //<debug>
            Ext.classSystemMonitor && Ext.classSystemMonitor(Class, 'Ext.Class#mixinsPreprocessor#beforeCreated', arguments);
            //</debug>
        
            if (mixins instanceof Array) {
                for (i = 0,ln = mixins.length; i < ln; i++) {
                    mixin = mixins[i];
                    name = mixin.prototype.mixinId || mixin.$className;

                    Class.mixin(name, mixin);
                }
            }
            else {
                for (var mixinName in mixins) {
                    if (mixins.hasOwnProperty(mixinName)) {
                        Class.mixin(mixinName, mixins[mixinName]);
                    }
                }
            }
        });
    }); 
	
	Ext.extend = function(Class,Parent,members)
	{
		if(arguments.length === 2 && Ext.isObject(Parent))
		{
			members = Parent;
			Parent = Class;
			Class = null
		}
		
		var cls ;
		
		members.extend = Parent;
		
		members.preprocessors = ['extend','statics','inheritableStatics','mixns','config'];
		
		if(Class)
		{
			cls = new ExtClass(Class,members);
			cls.prototype.contructor = Class;
		}
		else
		{
			cls = new ExtClass(members);	
		}
		
		cls.prototype.override = function(o)
		{
			for(var m in o)
			{
				if(o.hasOwnProperty(m))
				{
					this[m] = o[m];
				}
			}
		}
		
		return cls;
		
	};
	 
	 
}())

// JavaScript Document
Ext.Error = Ext.extend(Error,{
	statics:{
		ignore:false,
		
		raise:function(err)
		{
			err = err || {};
			
			if(Ext.isString(err))
			{
				err = {msg:err};
			}
			
			var method = this.raise.caller,msg;
			
			if(method)
			{
				if(method.$name)
				{
					err.sourceMethod = method.$nam;
				}
				
				if(method.$owner)
				{
					err.sourceClass = method.$owner.$className;
				}
			}
			
			if(Ext.Error.handle(err)!=true)
			{
				msg = Ext.Error.prototype.toString.call(err);
				
				Ext.log({msg:msg,level:'error',dump:err,stack:true});
				
				throw new Ext.Error(error);
			}
		},
		
		handle:function(){
			return Ext.Error.ignore;	
		},
		name:'Ext.Error',
		constructor:function(config)
		{
			if(Ext.isString(config))
			{
				config = {msg:config};
			}
			
			var me = this;
			
			Ext.apply(me,config);
			
			me.message = me.message || me.msg;
		},
		toString:function()
		{
			var me = this,
				className = me.sourceClass ? me.sourceClass :'',
				methodName = me.sourceMethod ? '.' +me.sourceMethod + '()£º' :'',
				msg = me.msg || 'no description provided';
				
				return className+methodName + msg;
		}
	}					   
});

Ext.deprecated = function(suggestion)
{
	return Ext.emptyFn;
}

(function () {
    var timer, errors = 0,
        win = Ext.global,
        msg;

    if (typeof window === 'undefined') {
        return; // build system or some such environment...
    }

    // This method is called to notify the user of the current error status.
    function notify () {
        var counters = Ext.log.counters,
            supports = Ext.supports,
            hasOnError = supports && supports.WindowOnError; // TODO - timing

        // Put log counters to the status bar (for most browsers):
        if (counters && (counters.error + counters.warn + counters.info + counters.log)) {
            msg = [ 'Logged Errors:',counters.error, 'Warnings:',counters.warn,
                        'Info:',counters.info, 'Log:',counters.log].join(' ');
            if (errors) {
                msg = '*** Errors: ' + errors + ' - ' + msg;
            } else if (counters.error) {
                msg = '*** ' + msg;
            }
            win.status = msg;
        }

        // Display an alert on the first error:
        if (!Ext.isDefined(Ext.Error.notify)) {
            Ext.Error.notify = Ext.isIE6 || Ext.isIE7; // TODO - timing
        }
        if (Ext.Error.notify && (hasOnError ? errors : (counters && counters.error))) {
            Ext.Error.notify = false;

            if (timer) {
                win.clearInterval(timer); // ticks can queue up so stop...
                timer = null;
            }

            alert('Unhandled error on page: See console or log');
            poll();
        }
    }

    // Sets up polling loop. This is the only way to know about errors in some browsers
    // (Opera/Safari) and is the only way to update the status bar for warnings and other
    // non-errors.
    function poll () {
        timer = win.setInterval(notify, 1000);
    }

    // window.onerror sounds ideal but it prevents the built-in error dialog from doing
    // its (better) thing.
   // poll();
}());
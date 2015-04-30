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
	}
});
(function(){
	
	var seq = function seq(func){
		var current = undefined;
		var yieldCalled = false;
		var stopCalled = false;
		var yield = function(item){
			yieldCalled = true;
			current = item;
		};
		var stop = function(){
			stopCalled = true;
		};
		var next = function(){
			yieldCalled = false;
			while(!stopCalled && !yieldCalled)
				func(yield, stop);
			return yieldCalled;
		};
	
		var enumerate = function enumerate(action, term){
			while(next())
				action(current);
			else if(typeof term === 'function'){
				term();
			}
		};
		return {
			enumerate: enumerate
		};
	};
	var wrap = function wrap(list){
		var idx = 0;
		var enumerate = function (action, term){
			if(idx < list.length){
				action(list[idx++]);
			}
			else if(typeof term === "function"){
				term();
			}
		};
		return {
			enumerate: enumerate
		};
	};
	var linq = function(seq){
		var toList = function(){
			var stopCalled = false;
			var list = [];
			while(!stopCalled){
				seq.enumerate(function (item){
					list.push(item);
				}, function(){
					stopCalled = true;
				});
			}
			return list;
		};
		var select = function select(func){
			return linqSeq(function (yield,stop){
				seq.enumerate(function (item){
					yield(func(item));
				}, stop);
			});
		};
		var where = function where(func){
			return linqSeq(function (yield,stop){
				seq.enumerate(function (item){
					if(func(item)){
						yield(item);
					}
				}, stop);
			})			
		};
		
		return {
			toList: toList,
			linqSeq: linqSeq,
			select: select,
			where: where
		};
	};
	var linqSeq = function(func){
		return linq(seq(func));
	};
	var linqWrap = function(list){
		return linq(wrap(list));
	};
	
	var generator = function (yield, stop){
		var i = Math.ceil(Math.random() * 5);
		if(i < 5)
			yield(i);
		else
			stop();
	};
	var someseq = seq(generator);
	
	console.log(linq(someseq).toList());
	console.log(linqSeq(generator).toList());
	console.log(linqWrap([1,2,3,4]).toList());
	console.log(linq(wrap([1,2,3,4])).toList());

	console.log("select", linqSeq(generator)
		.select(function (item) { return item*10; })
		.toList());
	console.log("where", linqSeq(generator)
		.where(function (item) { return item % 3 !== 0; })
		.toList());
	console.log("SWS", linqSeq(generator)
		.select(function (item) { return item * 8; })
		.where(function (item) { return item % 3 !== 0 ; })
		.select(function (item) { return item / 8; })
		.toList());
	console.log("wrap SWS", linq(wrap([1,2,3,4]))
		.select(function (item) { return item * 8; })
		.where(function (item) { return item % 3 !== 0 ; })
		.select(function (item) { return item / 8; })
		.toList());
})()
(function(){


	var seq = function(generator){

		var stopCalled = false;
		var stop = function(){
			stopCalled = true;
		}
		var yield = function(action){
			return function yielder(item){
				if(!stopCalled){
					action(item);
				}
				return stopCalled;
			};
		};

		return function seqWrapper(action, term){
			var yielder = yield(action);
			generator(yielder, stop);
		};
	};


	var linq = function linq(seqFunc){
		var toList = function toList(item){
			var list = [];
			seqFunc(function yielder(item){
				list.push(item);
			});
			return list;
		};
		var select = function select(transform){
			return linq(seq(function generate(yield, stop){
				seqFunc(function yielder(item){
					yield(transform(item));
				});
			}));
		};
		var where = function where(filter){
			return linq(seq(function generate(yield, stop){
				seqFunc(function yielder(item){
					if(filter(item))
						yield(item);
				});
			}));
		};
		return {
			toList: toList,
			select: select,
			where: where
		};
	};

	var wrap = function wrap(list){
		var idx = 0;
		return seq(function listWrapper(yield, stop){
			while(idx < list.length){
				yield(list[idx++]);
			}
		});
	};

	var theSeq = function (yield){
		var i = 0;
		while(i < 10){
			yield(i++);
		}
	};
	var theSeqStopped = function (yield, stop){
		var i = 0;
		while(i < 10){
			yield(i++);
			if(i == 5)
				stop();
		}
	};

	console.log(linq(seq(theSeq)).toList());
	console.log(linq(seq(theSeqStopped)).toList());
	console.log(linq(wrap([1,2,3,4])).toList());

	console.log("seq S", linq(seq(theSeq))
		.select(function (item) { return item*10; })
		.toList());
	console.log("stopped S", linq(seq(theSeqStopped))
		.select(function (item) { return item*10; })
		.toList());

	console.log("seq W", linq(seq(theSeq))
		.where(function (item) { return item % 2 == 0; })
		.toList());
	console.log("stopped W", linq(seq(theSeqStopped))
		.where(function (item) { return item % 2 == 0; })
		.toList());

	console.log("seq SWS", linq(seq(theSeq))
		.select(function (item) { return item*10; })
		.where(function (item) { return item % 2 == 0; })
		.select(function (item) { return item*10; })
		.toList());
	console.log("stopped SWS", linq(seq(theSeqStopped))
		.select(function (item) { return item*10; })
		.where(function (item) { return item % 2 == 0; })
		.select(function (item) { return item*10; })
		.toList());

})();	
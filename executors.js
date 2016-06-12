(function (global) {
	'use strict';

	var aa = require('aa'), Channel = aa.Channel;

	var slice = [].slice;
	var CANCEL_ERROR = new Error('Cancel');

	// Executors
	function Executors(n) {
		if (arguments.length === 0) n = 1;
		if (typeof n !== 'number')
			throw new TypeError('maximum threads must be a number');
		if (n < 1 || n !== n)
			throw new TypeError('maximum threads must be a positive finite number');

		var executorChannel = Channel();
		var closed = false;
		var canceled = false;

		var allExecutors = aa(startExecutors);
		executor.end = closeExecutors;
		executor.cancel = cancelExecutors;
		return executor;

		// startExecutors
		function *startExecutors() {
			var shadowExecutors = [];
			for (var i = 0; i < n; ++i)
				shadowExecutors.push(shadowExecutor);
			yield shadowExecutors;
		}

		// closeExecutors
		function *closeExecutors() {
			if (closed) return;
			closed = true;
			for (var i = 0; i < n; ++i)
				executorChannel(); // send end of channel to executor's queue
			yield allExecutors;
		}

		// cancelExecutors
		function *cancelExecutors() {
			if (canceled) return;
			canceled = true;
			closeExecutors();
		}

		// shadowExecutor
		function *shadowExecutor() {
			var elem;
			while (!canceled && (elem = yield executorChannel)) {
				try {
					elem.result(yield elem.fn.apply(elem.ctx, elem.args));
				} catch (e) {
					elem.result(e);
				}
			}
			while (elem = yield executorChannel)
				elem.result(CANCEL_ERROR);
		}

		// executor
		function *executor(fn) {
			var result = Channel();
			executorChannel({fn:fn, ctx:this, args:slice.call(arguments, 1), result:result});
			return yield result;
		}

	} // Executors

	if (typeof module === 'object' && module && module.exports)
		module.exports = Executors;
	else
		global.executors = global.Executors = Executors;

})(Function('return this')());

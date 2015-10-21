	try {
		var Executors = require('../executors');
	} catch (e) {
		var Executors = require('executors');
	}
	var aa = require('aa');
	var thunkify = aa.thunkify;
	var promisify = aa.promisify;

	var concurrent = 0;
	function sleep(ms, arg, cb) {
		console.log('++', arg, ++concurrent);
		setTimeout(function () {
			console.log('--', arg, --concurrent);
			cb(null, arg);
		}, ms);
	}

	var delay = thunkify(sleep);
	var wait = promisify(sleep);

	aa(function* main() {
		console.log('\n** a1++ max 1 execution (sequentioal)');
		yield delay(100, 'a1-0');
		yield wait(100, 'a1-1');
		yield delay(100, 'a1-2');
		yield wait(100, 'a1-3');
		console.log('** a1-- max 1 execution (sequentioal)');

		console.log('\n** a4++ max 4 parallel execution');
		yield [delay(100, 'a4-0'), wait(100, 'a4-1'), delay(100, 'a4-2'), wait(100, 'a4-3')];
		console.log('** a4-- max 4 parallel execution');

		console.log('\n** a10++ max 10 parallel execution (no limitter)');
		var par = [];
		for (var i = 0; i < 5; ++i) {
			par.push(delay(100, 'a10-' + (i * 2)));
			par.push(wait(100, 'a10-' + (i * 2 + 1)));
		}
		yield par;
		console.log('** a10-- max 10 parallel execution (no limitter)');

		console.log('\n** a2++ max 2 parallel execution');
		var executor2 = Executors(2);
		var par = [];
		for (var i = 0; i < 5; ++i) {
			par.push(executor2(delay, 100, 'a2-' + (i * 2)));
			par.push(executor2(wait, 100, 'a2-' + (i * 2 + 1)));
		}
		yield par;
		console.log('** a2-- max 2 parallel execution');

		console.log('\n** a3++ max 3 parallel execution');
		var executor3 = Executors(3);
		par = [];
		for (var i = 0; i < 5; ++i) {
			par.push(executor3(delay, 100, 'a3-' + (i * 2)));
			par.push(executor3(wait, 100, 'a3-' + (i * 2 + 1)));
		}
		yield par;
		console.log('** a3-- max 3 parallel execution');
	});

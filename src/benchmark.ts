// @ts-nocheck
/*!
 * Benchmark.js
 * Copyright Aras Abbasi
 * Based on Benchmark.js, copyright Mathias Bynens
 * Based on JSLitmus.js, copyright Robert Kieffer
 * Modified by John-David Dalton
 * Available under MIT license
 */

import { delay } from "./bench/delay";
import { enqueue } from "./bench/enqueue";
import { getFirstArgument } from "./functions/getFirstArgument";
import { cloneDeep } from "./helpers/cloneDeep";
import { each } from "./helpers/each";
import { entries } from "./helpers/entries";
import { formatNumber } from "./helpers/formatNumber";
import { forOwn } from "./helpers/forOwn";
import { has } from "./helpers/has";
import { indexOf } from "./helpers/indexOf";
import { isArrayLikeObject } from "./helpers/isArrayLikeObject";
import { isHostType } from "./helpers/isHostType";
import { isPlainObject } from "./helpers/isPlainObject";
import { isStringable } from "./helpers/isStringable";
import { map } from "./helpers/map";
import { noop } from "./helpers/noop";
import { reduce } from "./helpers/reduce";
import { toArray } from "./helpers/toArray";
import { join } from "./invoke/join";
import { getMean } from "./math/getMean";
import { getU } from "./math/getU";
import { getVariance } from "./math/getVariance";
import { getZ } from "./math/getZ";
import { divisors } from "./statistics/divisors";
import { getMinimumResolution } from "./statistics/getMinimumResolution";
import { tTable } from "./statistics/tTable";
import { uTable } from "./statistics/uTable";
import { getSupport } from "./Support";
import { Context, getContext } from "./types/Context";
import { toString } from "./bench/toString";
import { destroyElement } from "./browser/destroyElement";
import { getSource } from "./functions/getSource";

; (function () {
  'use strict';

  var version = '2.1.4';

  /** Used as a safe reference for `undefined` in pre ES5 environments. */
  var undefined: undefined;

  /** Used as a reference to the global object. */
  var root = ((typeof window === 'function' || typeof window === 'object') && window) || this;

  /** Detect free variable `define`. */
  var freeDefine = typeof define === 'function' && typeof define.amd === 'object' && define.amd && define;

  /** Detect free variable `exports`. */
  var freeExports = (typeof exports === 'function' || typeof exports === 'object') && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = (typeof module === 'function' || typeof module === 'object') && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof global === 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /** Detect free variable `require`. */
  var freeRequire = typeof require === 'function' && require;

  /** Used to assign each benchmark an incremented id. */
  var counter = 0;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Used to make every compiled test unique. */
  var uidCounter = 0;

  function runInContext(context?: Context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? Object.assign({}, root.Object(), context, getContext(root)) : root;

    /** Native constructor references. */
    let Array = context.Array,
      Date = context.Date,
      Function = context.Function,
      Math = context.Math,
      Object = context.Object,
      RegExp = context.RegExp,
      String = context.String;

    /** Used for `Array` and `Object` method references. */
    var arrayRef = [],
      objectProto = Object.prototype;

    /** Native method shortcuts. */
    var abs = Math.abs,
      clearTimeout = context.clearTimeout,
      floor = Math.floor,
      max = Math.max,
      min = Math.min,
      pow = Math.pow,
      push = arrayRef.push,
      setTimeout = context.setTimeout,
      shift = arrayRef.shift,
      slice = arrayRef.slice,
      sqrt = Math.sqrt,
      unshift = arrayRef.unshift;

    /** Detect DOM document object. */
    var doc = isHostType(context, 'document') && context.document;

    /** Used to access Node.js's high resolution timer. */
    var processObject = isHostType(context, 'process') && context.process;

    /** Used to prevent a `removeChild` memory leak in IE < 9. */
    var trash = doc && doc.createElement('div');

    /** Used to integrity check compiled tests. */
    var uid = 'uid' + (+Date.now());

    /** Used to avoid infinite recursion when methods call each other. */
    var calledBy = {};

    var support = getSupport(context);

    /**
     * Timer object used by `clock()` and `Deferred#resolve`.
     */
    var timer = {

      /**
       * The timer namespace object or constructor.
       */
      'ns': Date,

      /**
       * Starts the deferred timer.
       */
      'start': null, // Lazy defined in `clock()`.

      /**
       * Stops the deferred timer.
       */
      'stop': null // Lazy defined in `clock()`.
    };

    function Benchmark(name, fn, options) {
      var bench = this;

      // Allow instance creation without the `new` operator.
      if (!(bench instanceof Benchmark)) {
        return new Benchmark(name, fn, options);
      }
      // Juggle arguments.
      if (isPlainObject(name)) {
        // 1 argument (options).
        options = name;
      }
      else if (typeof name === 'function') {
        // 2 arguments (fn, options).
        options = fn;
        fn = name;
      }
      else if (isPlainObject(fn)) {
        // 2 arguments (name, options).
        options = fn;
        fn = null;
        bench.name = name;
      }
      else {
        // 3 arguments (name, fn [, options]).
        bench.name = name;
      }
      setOptions(bench, options);

      bench.id || (bench.id = ++counter);
      bench.fn == null && (bench.fn = fn);

      bench.stats = cloneDeep(bench.stats);
      bench.times = cloneDeep(bench.times);
    }

    function Deferred(clone) {
      var deferred = this;
      if (!(deferred instanceof Deferred)) {
        return new Deferred(clone);
      }
      deferred.benchmark = clone;
      clock(deferred);
    }

    function Event(type) {
      var event = this;
      if (type instanceof Event) {
        return type;
      }
      return (event instanceof Event)
        ? Object.assign(event, { 'timeStamp': (+Date.now()) }, typeof type === 'string' ? { 'type': type } : type)
        : new Event(type);
    }

    function Suite(name, options) {
      var suite = this;

      // Allow instance creation without the `new` operator.
      if (!(suite instanceof Suite)) {
        return new Suite(name, options);
      }
      // Juggle arguments.
      if (isPlainObject(name)) {
        // 1 argument (options).
        options = name;
      } else {
        // 2 arguments (name [, options]).
        suite.name = name;
      }
      setOptions(suite, options);
    }

    /**
     * Creates a function from the given arguments string and body.
     */
    function createFunction() {
      // Lazy define.
      createFunction = function (args, body) {
        var result,
          anchor = freeDefine ? freeDefine.amd : Benchmark,
          prop = uid + 'createFunction';

        runScript((freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '=function(' + args + '){' + body + '}');
        result = anchor[prop];
        delete anchor[prop];
        return result;
      };
      // Fix JaegerMonkey bug.
      // For more information see http://bugzil.la/639720.
      createFunction = support.browser && support.canInjectScript && (createFunction('', 'return"' + uid + '"') || noop)() === uid ? createFunction : Function;
      return createFunction.apply(null, arguments);
    }

    /**
     * Runs a snippet of JavaScript via script injection.
     */
    function runScript(code) {
      var anchor = freeDefine ? define.amd : Benchmark,
        script = doc.createElement('script'),
        sibling = doc.getElementsByTagName('script')[0],
        parent = sibling.parentNode,
        prop = uid + 'runScript',
        prefix = '(' + (freeDefine ? 'define.amd.' : 'Benchmark.') + prop + '||function(){})();';

      // Firefox 2.0.0.2 cannot use script injection as intended because it executes
      // asynchronously, but that's OK because script injection is only used to avoid
      // the previously commented JaegerMonkey bug.
      try {
        // Remove the inserted script *before* running the code to avoid differences
        // in the expected script element count/order of the document.
        script.appendChild(doc.createTextNode(prefix + code));
        anchor[prop] = function () { destroyElement(script, trash); };
      } catch (e) {
        parent = parent.cloneNode(false);
        sibling = null;
        script.text = code;
      }
      parent.insertBefore(script, sibling);
      delete anchor[prop];
    }

    var onEventRE = /^on[A-Z]/;

    /**
     * A helper function for setting options/event handlers.
     */
    function setOptions(object, options) {
      options = object.options = Object.assign({}, cloneDeep(object.constructor.options), cloneDeep(options));

      var keys = Object.keys(options);
      for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i],
          value = options[keys[i]];
        if (value != null) {
          // Add event listeners.
          if (onEventRE.test(key)) {
            var onEventKeys = key.indexOf(' ') === -1
              ? [key]
              : key.split(' ');

            each(onEventKeys, function (key) {
              object.on(key.slice(2).toLowerCase(), value);
            });
          } else if (!has(object, key)) {
            object[key] = cloneDeep(value);
          }
        }
      }
    }

    function resolve() {
      var deferred = this,
        clone = deferred.benchmark,
        bench = clone._original;

      if (bench.aborted) {
        // cycle() -> clone cycle/complete event -> compute()'s invoked bench.run() cycle/complete.
        deferred.teardown();
        clone.running = false;
        cycle(deferred);
      }
      else if (++deferred.cycles < clone.count) {
        clone.compiled.call(deferred, context, timer);
      }
      else {
        timer.stop(deferred);
        deferred.teardown();
        delay(clone, function () { cycle(deferred); });
      }
    }

    function reject(err) {
      // make sure error not a void like value
      var error = err || new Error(err);
      error.originError = err;

      var deferred = this,
        clone = deferred.benchmark;

      var event = new Event('error');
      clone.error = error;
      clone.message = error && error.message;
      clone.emit(event);
    }

    function filter(array, callback) {
      if (callback === 'successful') {
        // Callback to exclude those that are errored, unrun, or have hz of Infinity.
        callback = function (bench) {
          return bench.cycles && Number.isFinite(bench.hz) && !bench.error;
        };
      }
      else if (callback === 'fastest' || callback === 'slowest') {
        // Get successful, sort by period + margin of error, and filter fastest/slowest.
        var result = filter(array, 'successful').sort(function (a, b) {
          a = a.stats; b = b.stats;
          return (a.mean + a.moe > b.mean + b.moe ? 1 : -1) * (callback === 'fastest' ? 1 : -1);
        });

        return result.filter(function (bench) {
          return result[0].compare(bench) === 0;
        });
      }
      if (Array.isArray(array)) {
        return array.filter(callback);
      } else if (isArrayLikeObject(array)) {
        var result = [];
        for (var i = 0, il = array.length; i < il; ++i) {
          if (callback(array[i], i, array)) {
            result.push(array[i]);
          }
        }
        return result;
      }
      throw new TypeError('Expected Array or Array-like-Object.');
    }

    function invoke(benches, name) {
      var args,
        bench,
        queued,
        index = -1,
        eventProps = { 'currentTarget': benches },
        options = { 'onStart': noop, 'onCycle': noop, 'onComplete': noop },
        result = toArray(benches);

      /**
       * Invokes the method of the current object and if synchronous, fetches the next.
       */
      function execute() {
        var listeners,
          async = isAsync(bench);

        if (async) {
          // Use `getNext` as the first listener.
          bench.on('complete', getNext);
          listeners = bench.events.complete;
          listeners.splice(0, 0, listeners.pop());
        }
        // Execute method.
        result[index] = typeof (bench && bench[name]) === 'function' ? bench[name].apply(bench, args) : undefined;
        // If synchronous return `true` until finished.
        return !async && getNext();
      }

      /**
       * Fetches the next bench or executes `onComplete` callback.
       */
      function getNext(event) {
        var cycleEvent,
          last = bench,
          async = isAsync(last);

        if (async) {
          last.off('complete', getNext);
          last.emit('complete');
        }
        // Emit "cycle" event.
        eventProps.type = 'cycle';
        eventProps.target = last;
        cycleEvent = new Event(eventProps);
        options.onCycle.call(benches, cycleEvent);

        // Choose next benchmark if not exiting early.
        if (!cycleEvent.aborted && raiseIndex() !== false) {
          bench = queued ? benches[0] : result[index];
          if (isAsync(bench)) {
            delay(bench, execute);
          }
          else if (async) {
            // Resume execution if previously asynchronous but now synchronous.
            while (execute()) { }
          }
          else {
            // Continue synchronous execution.
            return true;
          }
        } else {
          // Emit "complete" event.
          eventProps.type = 'complete';
          options.onComplete.call(benches, Event(eventProps));
        }
        // When used as a listener `event.aborted = true` will cancel the rest of
        // the "complete" listeners because they were already called above and when
        // used as part of `getNext` the `return false` will exit the execution while-loop.
        if (event) {
          event.aborted = true;
        } else {
          return false;
        }
      }

      /**
       * Checks if invoking `Benchmark#run` with asynchronous cycles.
       */
      function isAsync(object) {
        // Avoid using `instanceof` here because of IE memory leak issues with host objects.
        var async = args[0] && args[0].async;
        return name === 'run' && (object instanceof Benchmark) &&
          ((async == null ? object.options.async : async) && support.timeout || object.defer);
      }

      /**
       * Raises `index` to the next defined index or returns `false`.
       */
      function raiseIndex() {
        index++;

        // If queued remove the previous bench.
        if (queued && index > 0) {
          shift.call(benches);
        }
        // If we reached the last index then return `false`.
        return (queued ? benches.length : index < result.length)
          ? index
          : (index = false);
      }
      // Juggle arguments.
      if (typeof name === 'string') {
        // 2 arguments (array, name).
        args = slice.call(arguments, 2);
      } else {
        // 2 arguments (array, options).
        options = Object.assign(options, name);
        name = options.name;
        args = Array.isArray(args = 'args' in options ? options.args : []) ? args : [args];
        queued = options.queued;
      }
      // Start iterating over the array.
      if (raiseIndex() !== false) {
        // Emit "start" event.
        bench = result[index];
        eventProps.type = 'start';
        eventProps.target = bench;
        options.onStart.call(benches, Event(eventProps));

        // End early if the suite was aborted in an "onStart" listener.
        if (name === 'run' && (benches instanceof Suite) && benches.aborted) {
          // Emit "cycle" event.
          eventProps.type = 'cycle';
          options.onCycle.call(benches, Event(eventProps));
          // Emit "complete" event.
          eventProps.type = 'complete';
          options.onComplete.call(benches, Event(eventProps));
        }
        // Start method execution.
        else {
          if (isAsync(bench)) {
            delay(bench, execute);
          } else {
            while (execute()) { }
          }
        }
      }
      return result;
    }

    function abortSuite() {
      var event,
        suite = this,
        resetting = calledBy.resetSuite;

      if (suite.running) {
        event = new Event('abort');
        suite.emit(event);
        if (!event.cancelled || resetting) {
          // Avoid infinite recursion.
          calledBy.abortSuite = true;
          suite.reset();
          delete calledBy.abortSuite;

          if (!resetting) {
            suite.aborted = true;
            invoke(suite, 'abort');
          }
        }
      }
      return suite;
    }

    function add(name, fn, options) {
      var suite = this,
        bench = new Benchmark(name, fn, options),
        event = new Event({ 'type': 'add', 'target': bench });

      if (suite.emit(event), !event.cancelled) {
        suite.push(bench);
      }
      return suite;
    }

    function cloneSuite(options) {
      var suite = this,
        result = new suite.constructor(Object.assign({}, suite.options, options));

      // Copy own properties.
      var keys = Object.keys(suite);
      for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i],
          value = suite[keys[i]];
        if (!has(result, key)) {
          result[key] = typeof (value && value.clone) === 'function'
            ? value.clone()
            : cloneDeep(value);
        }
      }
      return result;
    }

    function filterSuite(callback) {
      var suite = this,
        result = new suite.constructor(suite.options);

      result.push.apply(result, filter(suite, callback));
      return result;
    }

    function resetSuite() {
      var event,
        suite = this,
        aborting = calledBy.abortSuite;

      if (suite.running && !aborting) {
        // No worries, `resetSuite()` is called within `abortSuite()`.
        calledBy.resetSuite = true;
        suite.abort();
        delete calledBy.resetSuite;
      }
      // Reset if the state has changed.
      else if ((suite.aborted || suite.running) &&
        (suite.emit(event = new Event('reset')), !event.cancelled)) {
        suite.aborted = suite.running = false;
        if (!aborting) {
          invoke(suite, 'reset');
        }
      }
      return suite;
    }

    function runSuite(options) {
      var suite = this;

      suite.reset();
      suite.running = true;
      options || (options = {});

      invoke(suite, {
        'name': 'run',
        'args': options,
        'queued': options.queued,
        'onStart': function (event) {
          suite.emit(event);
        },
        'onCycle': function (event) {
          var bench = event.target;
          if (bench.error) {
            suite.emit({ 'type': 'error', 'target': bench });
          }
          suite.emit(event);
          event.aborted = suite.aborted;
        },
        'onComplete': function (event) {
          suite.running = false;
          suite.emit(event);
        }
      });
      return suite;
    }

    function emit(type) {
      var listeners,
        object = this,
        event = new Event(type),
        events = object.events,
        args = (arguments[0] = event, arguments);

      event.currentTarget || (event.currentTarget = object);
      event.target || (event.target = object);
      delete event.result;

      if (events && (listeners = has(events, event.type) && events[event.type])) {
        var listenersClone = listeners.slice();

        for (var i = 0, il = listenersClone.length; i < il; ++i) {
          if ((event.result = listenersClone[i].apply(object, args)) === false) {
            event.cancelled = true;
          }
          if (event.aborted) {
            break;
          };
        }
      }
      return event.result;
    }

    function listeners(type) {
      var object = this,
        events = object.events || (object.events = {});

      return has(events, type) ? events[type] : (events[type] = []);
    }

    function off(type, listener) {
      var events = this.events;

      if (!events) {
        return this;
      }

      function callback(listeners, type) {
        var index;
        if (typeof listeners === 'string') {
          type = listeners;
          listeners = has(events, type) && events[type];
        }
        if (listeners) {
          if (listener) {
            index = listeners.indexOf(listener);
            if (index !== -1) {
              listeners.splice(index, 1);
            }
          } else {
            listeners.length = 0;
          }
        }
      }

      if (typeof type === 'string') {
        var types = type.indexOf(' ') === -1
          ? [type]
          : type.split(' ');

        for (var i = 0, il = types.length; i < il; ++i) {
          callback(types[i]);
        }
        return this;
      }

      var keys = Object.keys(events);
      for (var i = 0, il = keys.length; i < il; ++i) {
        callback(events[keys[i]]);
      }

      return this;
    }

    function on(type, listener) {
      var events = this.events || (this.events = {});

      var types = type.indexOf(' ') === -1
        ? [type]
        : type.split(' ');

      for (var i = 0, il = types.length; i < il; ++i) {
        var type = types[i];
        if (!events.hasOwnProperty(type)) {
          events[type] = [];
        }
        events[type].push(listener);
      }

      return this;
    }

    function abort() {
      var event,
        bench = this,
        resetting = calledBy.reset;

      if (bench.running) {
        event = new Event('abort');
        bench.emit(event);
        if (!event.cancelled || resetting) {
          // Avoid infinite recursion.
          calledBy.abort = true;
          bench.reset();
          delete calledBy.abort;

          if (support.timeout) {
            clearTimeout(bench._timerId);
            delete bench._timerId;
          }
          if (!resetting) {
            bench.aborted = true;
            bench.running = false;
          }
        }
      }
      return bench;
    }

    function clone(options) {
      var bench = this,
        result = new bench.constructor(Object.assign({}, bench, options));

      // Correct the `options` object.
      result.options = Object.assign({}, cloneDeep(bench.options), cloneDeep(options));

      // Copy own custom properties.
      var keys = Object.keys(bench);
      for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i],
          value = bench[keys[i]];
        if (!has(result, key)) {
          result[key] = cloneDeep(value);
        }
      }

      return result;
    }

    function compare(other) {
      var bench = this;

      // Exit early if comparing the same benchmark.
      if (bench === other) {
        return 0;
      }
      var critical,
        zStat,
        sample1 = bench.stats.sample,
        sample2 = other.stats.sample,
        size1 = sample1.length,
        size2 = sample2.length,
        maxSize = max(size1, size2),
        minSize = min(size1, size2),
        u1 = getU(sample1, sample2),
        u2 = getU(sample2, sample1),
        u = min(u1, u2);

      // Reject the null hypothesis the two samples come from the
      // same population (i.e. have the same median) if...
      if (size1 + size2 > 30) {
        // ...the z-stat is greater than 1.96 or less than -1.96
        // http://www.statisticslectures.com/topics/mannwhitneyu/
        zStat = getZ(u, size1, size2, context);
        return abs(zStat) > 1.96 ? (u === u1 ? 1 : -1) : 0;
      }
      // ...the U value is less than or equal the critical U value.
      critical = maxSize < 5 || minSize < 3 ? 0 : uTable[maxSize][minSize - 3];
      return u <= critical ? (u === u1 ? 1 : -1) : 0;
    }

    function reset() {
      var bench = this;
      if (bench.running && !calledBy.abort) {
        // No worries, `reset()` is called within `abort()`.
        calledBy.reset = true;
        bench.abort();
        delete calledBy.reset;
        return bench;
      }
      var event,
        index = 0,
        changes = [],
        queue = [];

      // A non-recursive solution to check if properties have changed.
      // For more information see http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4.
      var data = {
        'destination': bench,
        'source': Object.assign({}, cloneDeep(bench.constructor.prototype), cloneDeep(bench.options))
      };

      do {
        each(entries(data.source), function (entry) {
          var key = entry[0];
          var value = entry[1];
          var changed,
            destination = data.destination,
            currValue = destination[key];

          // Skip pseudo private properties and event listeners.
          if (/^_|^events$|^on[A-Z]/.test(key)) {
            return;
          }
          if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
              // Check if an array value has changed to a non-array value.
              if (!Array.isArray(currValue)) {
                changed = true;
                currValue = [];
              }
              // Check if an array has changed its length.
              if (currValue.length != value.length) {
                changed = true;
                currValue = currValue.slice(0, value.length);
                currValue.length = value.length;
              }
            }
            // Check if an object has changed to a non-object value.
            else if (typeof currValue !== 'object' || currValue === null) {
              changed = true;
              currValue = {};
            }
            // Register a changed object.
            if (changed) {
              changes.push({ 'destination': destination, 'key': key, 'value': currValue });
            }
            queue.push({ 'destination': currValue, 'source': value });
          }
          // Register a changed primitive.
          else if (!(currValue === value || (currValue !== currValue && value !== value)) && value !== undefined) {
            changes.push({ 'destination': destination, 'key': key, 'value': value });
          }
        });
      }
      while ((data = queue[index++]));

      // If changed emit the `reset` event and if it isn't cancelled reset the benchmark.
      if (changes.length &&
        (bench.emit(event = new Event('reset')), !event.cancelled)) {
        for (var i = 0, il = changes.length; i < il; ++i) {
          var data = changes[i];
          data.destination[data.key] = data.value;
        }
      }
      return bench;
    }

    /**
     * Clocks the time taken to execute a test per cycle (secs).
     */
    function clock() {
      var options = Benchmark.options,
        templateData = {},
        timers = [{ 'ns': timer.ns, 'res': max(0.0015, getMinimumResolution(timer, 'ms')), 'unit': 'ms' }];

      // Lazy define for hi-res timers.
      clock = function (clone) {
        var deferred;

        if (clone instanceof Deferred) {
          deferred = clone;
          clone = deferred.benchmark;
        }
        var bench = clone._original,
          stringable = isStringable(bench.fn),
          count = bench.count = clone.count,
          decompilable = stringable || (support.decompilation && (clone.setup !== noop || clone.teardown !== noop)),
          id = bench.id,
          name = bench.name || (typeof id === 'number' ? '<Test #' + id + '>' : id),
          result = 0;

        // Init `minTime` if needed.
        clone.minTime = bench.minTime || (bench.minTime = bench.options.minTime = options.minTime);

        // Compile in setup/teardown functions and the test loop.
        // Create a new compiled test, instead of using the cached `bench.compiled`,
        // to avoid potential engine optimizations enabled over the life of the test.
        var funcBody = deferred
          ? 'var d#=this,${fnArg}=d#,m#=d#.benchmark._original,f#=m#.fn,su#=m#.setup,td#=m#.teardown;' +
          // When `deferred.cycles` is `0` then...
          'if(!d#.cycles){' +
          // set `deferred.fn`,
          'd#.fn=function(){var ${fnArg}=d#;if(typeof f#=="function"){try{${fn}\n}catch(e#){f#(d#)}}else{${fn}\n}};' +
          // set `deferred.teardown`,
          'd#.teardown=function(){d#.cycles=0;if(typeof td#=="function"){try{${teardown}\n}catch(e#){td#()}}else{${teardown}\n}};' +
          // execute the benchmark's `setup`,
          'if(typeof su#=="function"){try{${setup}\n}catch(e#){su#()}}else{${setup}\n};' +
          // start timer,
          't#.start(d#);' +
          // and then execute `deferred.fn` and return a dummy object.
          '}d#.fn();return{uid:"${uid}"}'

          : 'var r#,s#,m#=this,f#=m#.fn,i#=m#.count,n#=t#.ns;${setup}\n${begin};' +
          'while(i#--){${fn}\n}${end};${teardown}\nreturn{elapsed:r#,uid:"${uid}"}';

        var compiled = bench.compiled = clone.compiled = createCompiled(bench, decompilable, deferred, funcBody),
          isEmpty = !(templateData.fn || stringable);

        try {
          if (isEmpty) {
            // Firefox may remove dead code from `Function#toString` results.
            // For more information see http://bugzil.la/536085.
            throw new Error('The test "' + name + '" is empty. This may be the result of dead code removal.');
          }
          else if (!deferred) {
            // Pretest to determine if compiled code exits early, usually by a
            // rogue `return` statement, by checking for a return object with the uid.
            bench.count = 1;
            compiled = decompilable && (compiled.call(bench, context, timer) || {}).uid === templateData.uid && compiled;
            bench.count = count;
          }
        } catch (e) {
          compiled = null;
          clone.error = e || new Error(String(e));
          bench.count = count;
        }
        // Fallback when a test exits early or errors during pretest.
        if (!compiled && !deferred && !isEmpty) {
          funcBody = (
            stringable || (decompilable && !clone.error)
              ? 'function f#(){${fn}\n}var r#,s#,m#=this,i#=m#.count'
              : 'var r#,s#,m#=this,f#=m#.fn,i#=m#.count'
          ) +
            ',n#=t#.ns;${setup}\n${begin};m#.f#=f#;while(i#--){m#.f#()}${end};' +
            'delete m#.f#;${teardown}\nreturn{elapsed:r#}';

          compiled = createCompiled(bench, decompilable, deferred, funcBody);

          try {
            // Pretest one more time to check for errors.
            bench.count = 1;
            compiled.call(bench, context, timer);
            bench.count = count;
            delete clone.error;
          }
          catch (e) {
            bench.count = count;
            if (!clone.error) {
              clone.error = e || new Error(String(e));
            }
          }
        }
        // If no errors run the full test loop.
        if (!clone.error) {
          compiled = bench.compiled = clone.compiled = createCompiled(bench, decompilable, deferred, funcBody);
          result = compiled.call(deferred || bench, context, timer).elapsed;
        }
        return result;
      };

      /*----------------------------------------------------------------------*/

      /**
       * Creates a compiled function from the given function `body`.
       */
      function createCompiled(bench, decompilable, deferred, body) {
        var fn = bench.fn,
          fnArg = deferred ? getFirstArgument(fn) || 'deferred' : '';

        templateData.uid = uid + uidCounter++;

        Object.assign(templateData, {
          'setup': decompilable ? getSource(bench.setup, support.decompilation) : interpolate('m#.setup()'),
          'fn': decompilable ? getSource(fn, support.decompilation) : interpolate('m#.fn(' + fnArg + ')'),
          'fnArg': fnArg,
          'teardown': decompilable ? getSource(bench.teardown, support.decompilation) : interpolate('m#.teardown()')
        });

        // Use API of chosen timer.
        if (timer.unit === 'ns') {
          Object.assign(templateData, {
            'begin': interpolate('s#=n#()'),
            'end': interpolate('r#=n#(s#);r#=r#[0]+(r#[1]/1e9)')
          });
        }
        else if (timer.unit === 'us') {
          if (timer.ns.stop) {
            Object.assign(templateData, {
              'begin': interpolate('s#=n#.start()'),
              'end': interpolate('r#=n#.microseconds()/1e6')
            });
          } else {
            Object.assign(templateData, {
              'begin': interpolate('s#=n#()'),
              'end': interpolate('r#=(n#()-s#)/1e6')
            });
          }
        }
        else if (timer.ns.now) {
          Object.assign(templateData, {
            'begin': interpolate('s#=(+n#.now())'),
            'end': interpolate('r#=((+n#.now())-s#)/1e3')
          });
        }
        else {
          Object.assign(templateData, {
            'begin': interpolate('s#=new n#().getTime()'),
            'end': interpolate('r#=(new n#().getTime()-s#)/1e3')
          });
        }
        // Define `timer` methods.
        timer.start = createFunction(
          interpolate('o#'),
          interpolate('var n#=this.ns,${begin};o#.elapsed=0;o#.timeStamp=s#')
        );

        timer.stop = createFunction(
          interpolate('o#'),
          interpolate('var n#=this.ns,s#=o#.timeStamp,${end};o#.elapsed=r#')
        );

        // Create compiled test.
        return createFunction(
          interpolate('window,t#'),
          'var global = window, clearTimeout = global.clearTimeout, setTimeout = global.setTimeout;\n' +
          interpolate(body)
        );
      }

      var interpolationRegExp = {
      };
      /**
       * Interpolates a given template string.
       */
      function interpolate(string) {
        // Replaces all occurrences of `#` with a unique number and template tokens with content.
        var result = string.replace(/\#/g, /\d+/.exec(templateData.uid));
        var keys = Object.keys(templateData);
        for (var i = 0, il = keys.length; i < il; ++i) {
          if (result.indexOf('${' + keys[i] + '}') === -1) {
            continue;
          }

          result = result.replace(
            interpolationRegExp[keys[i]] || (interpolationRegExp[keys[i]] = new RegExp('\\$\\{' + keys[i] + '\\}', 'g')),
            templateData[keys[i]]
          );
        }
        return result;
      }

      /*----------------------------------------------------------------------*/

      // Detect Chrome's microsecond timer:
      // enable benchmarking via the --enable-benchmarking command
      // line switch in at least Chrome 7 to use chrome.Interval
      try {
        if ((timer.ns = new (context.chrome || context.chromium).Interval)) {
          timers.push({ 'ns': timer.ns, 'res': getMinimumResolution(timer, 'us'), 'unit': 'us' });
        }
      } catch (e) { }

      // Detect Node.js's nanosecond resolution timer available in Node.js >= 0.8.
      if (processObject && typeof (timer.ns = processObject.hrtime) === 'function') {
        timers.push({ 'ns': timer.ns, 'res': getMinimumResolution(timer, 'ns'), 'unit': 'ns' });
      }
      // Pick timer with highest resolution.
      timer = timers.reduce(function (a, b) { return a.res <= b.res ? a : b }, {});

      // Error if there are no working timers.
      if (timer.res === Infinity) {
        throw new Error('Benchmark.js was unable to find a working timer.');
      }
      // Resolve time span required to achieve a percent uncertainty of at most 1%.
      // For more information see http://spiff.rit.edu/classes/phys273/uncert/uncert.html.
      options.minTime || (options.minTime = max(timer.res / 2 / 0.01, 0.05));
      return clock.apply(null, arguments);
    }

    /**
     * Computes stats on benchmark results.
     */
    function compute(bench, options) {
      options || (options = {});

      var async = options.async,
        elapsed = 0,
        initCount = bench.initCount,
        minSamples = bench.minSamples,
        queue = [],
        sample = bench.stats.sample;

      /**
     * Updates the clone/original benchmarks to keep their data in sync.
     */
      function update(event) {
        var clone = this,
          type = event.type;

        if (bench.running) {
          if (type === 'start') {
            // Note: `clone.minTime` prop is inited in `clock()`.
            clone.count = bench.initCount;
          }
          else {
            if (type === 'error') {
              bench.error = clone.error;
            }
            if (type === 'abort') {
              bench.abort();
              bench.emit('cycle');
            } else {
              event.currentTarget = event.target = bench;
              bench.emit(event);
            }
          }
        } else if (bench.aborted) {
          // Clear abort listeners to avoid triggering bench's abort/cycle again.
          clone.events.abort.length = 0;
          clone.abort();
        }
      }

      /**
       * Determines if more clones should be queued or if cycling should stop.
       */
      function evaluate(event) {
        var critical,
          df,
          mean,
          moe,
          rme,
          sd,
          sem,
          variance,
          clone = event.target,
          done = bench.aborted,
          now = (+Date.now()),
          size = sample.push(clone.times.period),
          maxedOut = size >= minSamples && (elapsed += now - clone.times.timeStamp) / 1e3 > bench.maxTime,
          times = bench.times;

        // Exit early for aborted or unclockable tests.
        if (done || clone.hz === Infinity) {
          maxedOut = !(size = sample.length = queue.length = 0);
        }

        if (!done) {
          // Compute the sample mean (estimate of the population mean).
          mean = getMean(sample);
          // Compute the sample variance (estimate of the population variance).
          variance = getVariance(sample, mean, size, context);
          // Compute the sample standard deviation (estimate of the population standard deviation).
          sd = sqrt(variance);
          // Compute the standard error of the mean (a.k.a. the standard deviation of the sampling distribution of the sample mean).
          sem = sd / sqrt(size);
          // Compute the degrees of freedom.
          df = size - 1;
          // Compute the critical value.
          critical = tTable[Math.round(df) || 1] || tTable.infinity;
          // Compute the margin of error.
          moe = sem * critical;
          // Compute the relative margin of error.
          rme = (moe / mean) * 100 || 0;

          Object.assign(bench.stats, {
            'deviation': sd,
            'mean': mean,
            'moe': moe,
            'rme': rme,
            'sem': sem,
            'variance': variance
          });

          // Abort the cycle loop when the minimum sample size has been collected
          // and the elapsed time exceeds the maximum time allowed per benchmark.
          // We don't count cycle delays toward the max time because delays may be
          // increased by browsers that clamp timeouts for inactive tabs. For more
          // information see https://developer.mozilla.org/en/window.setTimeout#Inactive_tabs.
          if (maxedOut) {
            // Reset the `initCount` in case the benchmark is rerun.
            bench.initCount = initCount;
            bench.running = false;
            done = true;
            times.elapsed = (now - times.timeStamp) / 1e3;
          }
          if (bench.hz != Infinity) {
            bench.hz = 1 / mean;
            times.cycle = mean * bench.count;
            times.period = mean;
          }
        }
        // If time permits, increase sample size to reduce the margin of error.
        if (queue.length < 2 && !maxedOut) {
          enqueue(queue, bench, update);
        }
        // Abort the `invoke` cycle when done.
        event.aborted = done;
      }

      // Init queue and begin.
      enqueue(queue, bench, update);
      invoke(queue, {
        'name': 'run',
        'args': { 'async': async },
        'queued': true,
        'onCycle': evaluate,
        'onComplete': function () { bench.emit('complete'); }
      });
    }

    /**
     * Cycles a benchmark until a run `count` can be established.
     */
    function cycle(clone, options) {
      options || (options = {});

      var deferred;
      if (clone instanceof Deferred) {
        deferred = clone;
        clone = clone.benchmark;
      }
      var clocked,
        cycles,
        divisor,
        event,
        minTime,
        period,
        async = options.async,
        bench = clone._original,
        count = clone.count,
        times = clone.times;

      // Continue, if not aborted between cycles.
      if (clone.running) {
        // `minTime` is set to `Benchmark.options.minTime` in `clock()`.
        cycles = ++clone.cycles;
        clocked = deferred ? deferred.elapsed : clock(clone);
        minTime = clone.minTime;

        if (cycles > bench.cycles) {
          bench.cycles = cycles;
        }
        if (clone.error) {
          event = new Event('error');
          event.message = clone.error;
          clone.emit(event);
          if (!event.cancelled) {
            clone.abort();
          }
        }
      }
      // Continue, if not errored.
      if (clone.running) {
        // Compute the time taken to complete last test cycle.
        bench.times.cycle = times.cycle = clocked;
        // Compute the seconds per operation.
        period = bench.times.period = times.period = clocked / count;
        // Compute the ops per second.
        bench.hz = clone.hz = 1 / period;
        // Avoid working our way up to this next time.
        bench.initCount = clone.initCount = count;
        // Do we need to do another cycle?
        clone.running = clocked < minTime;

        if (clone.running) {
          // Tests may clock at `0` when `initCount` is a small number,
          // to avoid that we set its count to something a bit higher.
          if (!clocked && (divisor = divisors[clone.cycles]) != null) {
            count = floor(4e6 / divisor);
          }
          // Calculate how many more iterations it will take to achieve the `minTime`.
          if (count <= clone.count) {
            count += Math.ceil((minTime - clocked) / period);
          }
          clone.running = count != Infinity;
        }
      }
      // Should we exit early?
      event = new Event('cycle');
      clone.emit(event);
      if (event.aborted) {
        clone.abort();
      }
      // Figure out what to do next.
      if (clone.running) {
        // Start a new cycle.
        clone.count = count;
        if (deferred) {
          clone.compiled.call(deferred, context, timer);
        } else if (async) {
          delay(clone, function () { cycle(clone, options); });
        } else {
          cycle(clone);
        }
      }
      else {
        // Fix TraceMonkey bug associated with clock fallbacks.
        // For more information see http://bugzil.la/509069.
        if (support.browser && support.canInjectScript) {
          runScript(uid + '=1;delete ' + uid);
        }
        // We're done.
        clone.emit('complete');
      }
    }

    function run(options) {
      var bench = this,
        event = new Event('start');

      // Set `running` to `false` so `reset()` won't call `abort()`.
      bench.running = false;
      bench.reset();
      bench.running = true;

      bench.count = bench.initCount;
      bench.times.timeStamp = (+Date.now());
      bench.emit(event);

      if (!event.cancelled) {
        options = { 'async': ((options = options && options.async) == null ? bench.async : options) && support.timeout };

        // For clones created within `compute()`.
        if (bench._original) {
          if (bench.defer) {
            Deferred(bench);
          } else {
            cycle(bench, options);
          }
        }
        // For original benchmarks.
        else {
          compute(bench, options);
        }
      }
      return bench;
    }

    // Firefox 1 erroneously defines variable and argument names of functions on
    // the function itself as non-configurable properties with `undefined` values.
    // The bugginess continues as the `Benchmark` constructor has an argument
    // named `options` and Firefox 1 will not assign a value to `Benchmark.options`,
    // making it non-writable in the process, unless it is the first property
    // assigned by for-in loop of `Object.assign()`.
    Object.assign(Benchmark, {
      'options': {

        'async': false,
        'count': 0,
        'defer': false,
        'delay': 0.005,
        'id': undefined,
        'initCount': 1,
        'maxTime': 5,
        'minSamples': 5,
        'minTime': 0,
        'name': undefined,
        'onAbort': undefined,
        'onComplete': undefined,
        'onCycle': undefined,
        'onError': undefined,
        'onReset': undefined,
        'onStart': undefined
      },
      'version': version
    });

    Object.assign(Benchmark, {
      'filter': filter,
      'formatNumber': formatNumber,
      'invoke': invoke,
      'join': join,
      'runInContext': runInContext,
      'support': support
    });

    // Add lodash methods to Benchmark.
    Benchmark.each = each;
    Benchmark.forEach = each;
    Benchmark.forOwn = forOwn;
    Benchmark.has = has;
    Benchmark.indexOf = indexOf;
    Benchmark.map = map;
    Benchmark.reduce = reduce;

    Object.assign(Benchmark.prototype, {
      'count': 0,
      'cycles': 0,
      'hz': 0,
      'compiled': undefined,
      'error': undefined,
      'fn': undefined,
      'aborted': false,
      'running': false,
      'setup': noop,
      'teardown': noop,
      'stats': {
        'moe': 0,
        'rme': 0,
        'sem': 0,
        'deviation': 0,
        'mean': 0,
        'sample': [],
        'variance': 0
      },
      'times': {
        'cycle': 0,
        'elapsed': 0,
        'period': 0,
        'timeStamp': 0
      }
    });

    Object.assign(Benchmark.prototype, {
      'abort': abort,
      'clone': clone,
      'compare': compare,
      'emit': emit,
      'listeners': listeners,
      'off': off,
      'on': on,
      'reset': reset,
      'run': run,
      'toString': toString.bind(Benchmark.prototype)
    });

    Object.assign(Deferred.prototype, {
      'benchmark': null,
      'cycles': 0,
      'elapsed': 0,
      'timeStamp': 0
    });

    Object.assign(Deferred.prototype, {
      'resolve': resolve,
      'reject': reject
    });

    Object.assign(Event.prototype, {
      'aborted': false,
      'cancelled': false,
      'currentTarget': undefined,
      'result': undefined,
      'target': undefined,
      'timeStamp': 0,
      'type': ''
    });

    Suite.options = {
      'name': undefined
    };

    Object.assign(Suite.prototype, {
      'length': 0,
      'aborted': false,
      'running': false
    });

    Object.assign(Suite.prototype, {
      'abort': abortSuite,
      'add': add,
      'clone': cloneSuite,
      'emit': emit,
      'filter': filterSuite,
      'join': arrayRef.join,
      'listeners': listeners,
      'off': off,
      'on': on,
      'pop': arrayRef.pop,
      'push': push,
      'reset': resetSuite,
      'run': runSuite,
      'reverse': arrayRef.reverse,
      'shift': shift,
      'slice': slice,
      'sort': arrayRef.sort,
      'splice': arrayRef.splice,
      'unshift': unshift,
      'each': function (iteratee) { return each(this, iteratee) },
      'forEach': function (iteratee) { return each(this, iteratee) },
      'indexOf': function (value, position) { return indexOf(this, value, position) },
      'map': function (var1) { return map(this, var1) },
      'reduce': function (iteratee, initialValue) { return reduce(this, iteratee, initialValue) }
    });

    // Expose Deferred, Event, and Suite.
    Object.assign(Benchmark, {
      'Deferred': Deferred,
      'Event': Event,
      'Suite': Suite
    });
    // Avoid array-like object bugs with `Array#shift` and `Array#splice`
    // in Firefox < 10 and IE < 9.
    ['pop', 'shift', 'splice'].forEach(function (methodName) {
      var func = arrayRef[methodName];

      Suite.prototype[methodName] = function () {
        var value = this,
          result = func.apply(value, arguments);

        if (value.length === 0) {
          delete value[0];
        }
        return result;
      };
    });

    // Avoid buggy `Array#unshift` in IE < 8 which doesn't return the new
    // length of the array.
    Suite.prototype.unshift = function () {
      var value = this;
      unshift.apply(value, arguments);
      return value.length;
    };

    return Benchmark;
  }

  /*--------------------------------------------------------------------------*/

  // Export Benchmark.
  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    // Define as an anonymous module so, through path mapping, it can be aliased.
    define('benchmark', function () {
      return runInContext();
    });
  }
  else {
    var Benchmark = runInContext();

    // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
    if (freeExports && freeModule) {
      // Export for Node.js.
      if (moduleExports) {
        (freeModule.exports = Benchmark).Benchmark = Benchmark;
      }
      // Export for CommonJS support.
      freeExports.Benchmark = Benchmark;
    }
    else {
      // Export to the global object.
      root.Benchmark = Benchmark;
    }
  }
}.call(this));

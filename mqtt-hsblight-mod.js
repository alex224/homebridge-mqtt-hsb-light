const mqtt = require('mqtt');

function clean(input) { /*
	var buf = Buffer.alloc(input.length + 4);
	buf.write(input);
	buf.writeUInt32BE(0);
	return buf; */
	return input;
}

module.exports = function (log, config, stateChangedListener) {
	console.log(JSON.stringify(config));
	var module = {};
	module.stateChangedListener = stateChangedListener || function() {};
	module.originalLog = typeof log === 'function' ? log : console.log;
	module.log = function(msg) { module.originalLog("[MQTT-LED] " + msg); }

	var brokerUrl = getParam(log, config, 'broker.url', true, null);
	module.log("Connecting to mqtt broker: " + brokerUrl + "...");
	var client = mqtt.connect(brokerUrl);
	client.on('connect', function () {
		module.log("Connected to mqtt broker: " + brokerUrl + ".");
		var topic = getParam(log, config, 'topics.stateAnswer', true, null);
		if (topic) {
			module.log("Registering on topic " + topic);
			client.subscribe(topic);
		}
	});

	client.on('message', function (topic, message) {
		module.log("Received message on topic: " + topic + ": " + message);
		var stateTopic = getParam(log, config, 'topics.stateAnswer', true, null);
		if (topic == stateTopic) {
			try {
				var state = JSON.parse(message.toString());
				if (state) {
					module.state.power = state.power;
					module.state.hue = parseInt(state.hue);
					module.state.saturation = parseInt(state.saturation);
					module.state.brightness = parseInt(state.brightness);
					module.stateChangedListener(module.state);
				}
			} catch (err) {
				module.log("" + err + " - Invalid mqtt payload? " + message.toString());
			}
		}
	});

	module.config = config;
	module.state = {
		power : false,
		hue : 100,
		brightness : 100,
		saturation : 100,
	}

	module.requestState = function(requestId) {
		var topic = getParam(log, config, 'topics.stateRequest', true, null);
		if (topic) {
			client.publish(topic, clean('homebridge-' + requestId), null, function(err) { if (err) module.log(err); });
		}
	}

    module.getPowerState = function () {
		this.requestState('getPowerState');
		return module.state.power;
	}

    module.setPowerState = function (state, callback) {
		var topic = getParam(log, config, 'topics.power', true, null);
		if (topic) {
			client.publish(topic, state ? clean('1') : clean('0'), null, function(err) {
				callback(!err);
			});
			module.state.power = state ? 1 : 0;
		}
    };

	module.getBrightness = function() {
		this.requestState('getBrightness');
		return module.state.brightness;
	}

	module.setBrightness = function (value, callback) {
		var topic = getParam(log, config, 'topics.brightness', true, null);
		if (topic) {
			client.publish(topic, clean("" + value.toFixed(0)), null, function(err) {
				callback(!err);
			});
			module.state.brightness = value;
		}
    };

	module.getHue = function() {
		this.requestState('getHue');
		return module.state.hue;
	}

	module.setHue = function (value, callback) {
		var topic = getParam(log, config, 'topics.hue', true, null);
		if (topic) {
			client.publish(topic, clean("" + (value).toFixed(0)), null, function(err) {
				callback(!err);
			});
			module.state.hue = value;
		}
    };

	module.getSaturation = function() {
		this.requestState('getSaturation');
		return module.state.saturation;
	}

	module.setSaturation = function (value, callback) {
		var topic = getParam(log, config, 'topics.saturation', true, null);
		if (topic) {
			client.publish(topic, clean("" + (value).toFixed(0)), null, function(err) {
				callback(!err);
			});
			module.state.saturation = value;
		}
    };

	function fetchFromObject(obj, prop) {
		if(typeof obj === 'undefined') {
			return null;
		}
	
		var _index = prop.indexOf('.')
		if(_index > -1) {
			return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
		}
	
		return obj[prop];
	}
	
	function getParam(log, configObject, paramName, mandatory, defaultValue) {
		var value = fetchFromObject(configObject, paramName);
		if (typeof value === 'undefined' || value == null) {
			if (mandatory) {
				module.log("ERROR: Missing param " + paramName);
			}
			return defaultValue;
		} else {
			return value;
		}
	}

    return module;
};


# homebridge-mqtt-hsb-light

Plugin for HSB Lights controlled by MQTT topics for Homebridge 

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g git+https://github.com/alex224/homebridge-mqtt-hsb-light.git
3. Update your configuration file. See sample-config.json in this repository for a sample. 

# Requirement for opposite part - the led controller
- the controller supports topics for setting the on/off-state (power), the hue, the saturation and the brightness
- the controller supports a topic to request the current state (stateRequest) and sends the answer on another topic (stateAnswer)

# Configuration

Configuration sample file:

 ```
	"accessories": [
		{
			"accessory": "MQTT-HSB-LIGHT",
			"name": "Bed light",

			"broker" : {
				"url": "mqtt://docker"
			},

			"topics" : {
				"power" : "/home/device/esp-bedroom/power",
				"hue" : "/home/device/esp-bedroom/hue",
				"saturation" : "/home/device/esp-bedroom/saturation",
				"brightness" : "/home/device/esp-bedroom/brightness",
				"stateRequest" : "/home/device/esp-bedroom/getstate",
				"stateAnswer" : "/home/device/esp-bedroom/state"
			}
		}
	]
```

# Gydam

Gydam is a real-time IoT platform which allows you to send whatever data you want from one device to another.

# Usage
Run Docker to initialize the platform.
```
docker-compose up
```

Use `gydam-agent` to create your own projects with this platform.

Take a look at [raspberry-temperature](https://github.com/maximomartinezsoria/gydam/tree/master/gydam-agent/examples/raspberry-temperature) example. Where the platform is reading temperature from a `ds18b20` sensor connected to a Raspberry Pi 4 and sending it through the MQTT server.

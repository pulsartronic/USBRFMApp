# USBRFMApp
smartphone LoRa device connection - Android - USB - Arduino - LoRa

Instructions on how to make it work can be found here https://www.hackster.io/pulsartronic/lorawan-gateway-esp8266-rfm95-arduino-4914a8

# Contribute
An open source project is a forever Work In Progress. Feel free to be constructive.

Default configuration is in:
```sh
ArduinoIDE/USBRFMApp/Defaults.h
```
You should change it before uploading it to your board, based on your hardware, though you can later change it through the web interface.  
Values are in hexadecimal, i bet you can handle them.  
The data structure is a compact object/array/binary model, i should write documentation for it and i will, the module where it is handled is called CDS,
which stands for Compact Data Structure.
```sh
ArduinoIDE/USBRFMApp/libraries/CDS
```
The main goal is to work with a balance between
1) binary data
2) object data model, based in JSON
3) and limited RAM



# TODO
There are many todo's, one example is: CAD (Channel Activity Detection) is not supported yet, if you want
to implement it, it would be fantastic, if you don't know how, you can open an issue asking for implementation
in the following repo: https://github.com/sandeepmistry/arduino-LoRa



# Credits
An Arduino library for sending and receiving data using LoRa radios.  
https://github.com/sandeepmistry/arduino-LoRa

Usb serial controller for Android  
https://github.com/felHR85/UsbSerial

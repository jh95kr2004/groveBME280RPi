#
# Measure temperature(F), humidity(%), pressure(hPa) from Grove BME280 every 1 second.
# This code works only for Raspberry pi.
#
# Written by Junghoon Jang
# E-mail: jh95kr2003@gmail.com
#

import grove_bme280
import sys, time

bme280 = grove_bme280.BME280()

while True :
	data = bme280.getAll()
	print("Temperature: %.2fF, Humidity: %.2f%%, Pressure: %.2fhPa" %(data['T'] * 9 / 5 + 32, data['H'], data['P']))
	time.sleep(1)

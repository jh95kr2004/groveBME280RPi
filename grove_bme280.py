#!/usr/bin/env python
#
# GrovePi Library for using the Grove - Temp&Humi&Barometer Sensor (BME280) (https://www.seeedstudio.com/Grove-Temp%26Humi%26Barometer-Sensor-(BME280)-p-2653.html)
# The GrovePi connects the Raspberry Pi and Grove sensors.  You can learn more about GrovePi here:  http://www.dexterindustries.com/GrovePi
# Have a question about this library?  Ask on the forums here:  http://forum.dexterindustries.com/c/grovepi
#
# Written by Junghoon Jang based on C library of Grove BME280 sensor for Arduino. (https://github.com/Seeed-Studio/Grove_BME280)
# This code is ONLY for Raspberry pi.
#

import RPi.GPIO as GPIO
import smbus
import numpy as np

# Use the bus that matches your Raspberry pi version.
rev = GPIO.RPI_REVISION
if rev == 2 or rev == 3: bus = smbus.SMBus(1)
else: bus = smbus.SMBus(0)

class BME280 :	
	BME280_ADDRESS = 0x76

	BME280_REG_DIG_T1 = 0x88
	BME280_REG_DIG_T2 = 0x8A
	BME280_REG_DIG_T3 = 0x8C

	BME280_REG_DIG_P1 = 0x8E
	BME280_REG_DIG_P2 = 0x90
	BME280_REG_DIG_P3 = 0x92
	BME280_REG_DIG_P4 = 0x94
	BME280_REG_DIG_P5 = 0x96
	BME280_REG_DIG_P6 = 0x98
	BME280_REG_DIG_P7 = 0x9A
	BME280_REG_DIG_P8 = 0x9C
	BME280_REG_DIG_P9 = 0x9E

	BME280_REG_DIG_H1 = 0xA1
	BME280_REG_DIG_H2 = 0xE1
	BME280_REG_DIG_H3 = 0xE3
	BME280_REG_DIG_H4 = 0xE4
	BME280_REG_DIG_H5 = 0xE5
	BME280_REG_DIG_H6 = 0xE7

	BME280_REG_CHIPID = 0xD0
	BME280_REG_VERSION = 0xD1
	BME280_REG_SOFTRESET = 0xE0

	BME280_REG_CAL26 = 0xE1

	BME280_REG_CONTROLHUMID = 0xF2
	BME280_REG_CONTROL = 0xF4
	BME280_REG_CONFIG  = 0xF5
	BME280_REG_PRESSUREDATA = 0xF7
	BME280_REG_TEMPDATA = 0xFA
	BME280_REG_HUMIDITYDATA = 0xFD

	def __init__(self) :
		self.chipid, self.version = bus.read_i2c_block_data(self.BME280_ADDRESS, self.BME280_REG_CHIPID, 2)
		self.dig_T1 = self.BME280Read16LE(self.BME280_REG_DIG_T1)
		self.dig_T2 = self.BME280ReadS16LE(self.BME280_REG_DIG_T2)
		self.dig_T3 = self.BME280ReadS16LE(self.BME280_REG_DIG_T3)

		self.dig_P1 = self.BME280Read16LE(self.BME280_REG_DIG_P1)
		self.dig_P2 = self.BME280ReadS16LE(self.BME280_REG_DIG_P2)
		self.dig_P3 = self.BME280ReadS16LE(self.BME280_REG_DIG_P3)
		self.dig_P4 = self.BME280ReadS16LE(self.BME280_REG_DIG_P4)
		self.dig_P5 = self.BME280ReadS16LE(self.BME280_REG_DIG_P5)
		self.dig_P6 = self.BME280ReadS16LE(self.BME280_REG_DIG_P6)
		self.dig_P7 = self.BME280ReadS16LE(self.BME280_REG_DIG_P7)
		self.dig_P8 = self.BME280ReadS16LE(self.BME280_REG_DIG_P8)
		self.dig_P9 = self.BME280ReadS16LE(self.BME280_REG_DIG_P9)

		self.dig_H1 = self.BME280Read8(self.BME280_REG_DIG_H1)
		self.dig_H2 = self.BME280Read16LE(self.BME280_REG_DIG_H2)
		self.dig_H3 = self.BME280Read8(self.BME280_REG_DIG_H3)
		self.dig_H4 = (self.BME280Read8(self.BME280_REG_DIG_H4) << 4) | (0x0F & self.BME280Read8(self.BME280_REG_DIG_H4 + 1))
		self.dig_H5 = (self.BME280Read8(self.BME280_REG_DIG_H5 + 1) << 4) | (0x0F & self.BME280Read8(self.BME280_REG_DIG_H5) >> 4)
		self.dig_H6 = self.BME280Read8(self.BME280_REG_DIG_H6)

		bus.write_byte_data(self.BME280_ADDRESS, self.BME280_REG_CONTROLHUMID, 0x05) # Choose 16X oversampling
		bus.write_byte_data(self.BME280_ADDRESS, self.BME280_REG_CONTROL, 0xB7) # Choose 16X oversampling
	
	def BME280Read8(self, reg) :
		return bus.read_i2c_block_data(self.BME280_ADDRESS, reg, 1)[0]

	def BME280Read16(self, reg) :
		data = bus.read_i2c_block_data(self.BME280_ADDRESS, reg, 2)
		return np.uint16(data[0] << 8 | data[1])
	
	def BME280Read16LE(self, reg) :
		data = self.BME280Read16(reg)
		return np.uint16((data >> 8) | (data << 8))
	
	def BME280ReadS16(self, reg) :
		return np.int16(self.BME280Read16(reg))
	
	def BME280ReadS16LE(self, reg) :
		return np.int16(self.BME280Read16LE(reg))
	
	def readADC(self) :
		adc = bus.read_i2c_block_data(self.BME280_ADDRESS, self.BME280_REG_PRESSUREDATA, 8)
		adc_P = np.int32((adc[0] << 12) | (adc[1] << 4) | (adc[2] >> 4))
		adc_T = np.int32((adc[3] << 12) | (adc[4] << 4) | (adc[5] >> 4))
		adc_H = np.int32((adc[6] << 8) | adc[7])
		return {"adc_T": adc_T, "adc_H": adc_H, "adc_P": adc_P}

	def getAll(self) :
		adc = self.readADC()
		T = self.getTemperature(adc["adc_T"])
		H = self.getHumidity(adc["adc_H"])
		P = self.getPressure(adc["adc_P"])
		return {"T": T, "H": H, "P": P}

	def getTemperature(self, adc_T = None) :
		if adc_T == None : adc_T = self.readADC()["adc_T"]
		var1 = (((adc_T >> 3) - (np.int32((self.dig_T1 << 1)))) * np.int32(self.dig_T2)) >> 11;
		var2 = (((((adc_T >> 4) - np.int32(self.dig_T1)) * ((adc_T >> 4) - np.int32(self.dig_T1))) >> 12) * np.int32(self.dig_T3)) >> 14;
		self.t_fine = np.int32(var1 + var2);
		T = (self.t_fine * 5 + 128) >> 8;
		return T / 100
		
	def getHumidity(self, adc_H = None) :
		if adc_H == None :
			adc = self.readADC()
			adc_H = adc["adc_H"]
			self.getTemperature(adc["adc_T"])
		v_x1_u32r = (self.t_fine - (np.int32(76800)))
		v_x1_u32r = (((((adc_H << 14) - ((np.int32(self.dig_H4)) << 20) - ((np.int32(self.dig_H5)) * v_x1_u32r)) + (np.int32(16384))) >> 15) * (((((((v_x1_u32r * (np.int32(self.dig_H6))) >> 10) * (((v_x1_u32r * (np.int32(self.dig_H3))) >> 11) + (np.int32(32768)))) >> 10) + (np.int32(2097152))) * (np.int32(self.dig_H2)) + 8192) >> 14))
		v_x1_u32r = (v_x1_u32r - (((((v_x1_u32r >> 15) * (v_x1_u32r >> 15)) >> 7) * (np.int32(self.dig_H1))) >> 4))
		if v_x1_u32r < 0 : v_x1_u32r = 0
		if v_x1_u32r > 419430400 : v_x1_u32r = 419430400
		return np.int32(v_x1_u32r >> 12) / 1024.0

	def getPressure(self, adc_P = None) :
		if adc_P == None :
			adc = self.readADC()
			adc_P = adc["adc_P"]
			self.getTemperature(adc["adc_T"])
		var1 = (np.int64(self.t_fine)) - 128000;
		var2 = var1 * var1 * np.int64(self.dig_P6);
		var2 = var2 + ((var1 * np.int64(self.dig_P5)) << 17);
		var2 = var2 + ((np.int64(self.dig_P4)) << 35);
		var1 = ((var1 * var1 * np.int64(self.dig_P3)) >> 8) + ((var1 * np.int64(self.dig_P2)) << 12);
		var1 = ((((np.int64(1)) << 47) + var1)) * (np.int64(self.dig_P1)) >> 33;
		if var1 == 0 : return 0
		p = np.int64(1048576 - adc_P);
		p = (((p << 31) - var2) * 3125) // var1;
		var1 = ((np.int64(self.dig_P9)) * (p >> 13) * (p >> 13)) >> 25;
		var2 = ((np.int64(self.dig_P8)) * p) >> 19;
		p = ((p + var1 + var2) >> 8) + ((np.int64(self.dig_P7)) << 4);
		return np.uint32(p) / 25600

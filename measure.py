#
# Measure temperature(F), humidity(%), pressure(hPa) from Grove BME280 and store measurement data in the MongoDB.
# Make sure that you installed MongoDB service on your Raspberry Pi before run this script.
# This code works only for Raspberry Pi.
#
# Written by Junghoon Jang
# E-mail: jh95kr2003@gmail.com
#

import grove_bme280
#import boto3
import pymongo
from datetime import datetime
# from decimal import *

bme280 = grove_bme280.BME280()
cur = datetime.now()

data = bme280.getAll()
data['T'] = data['T'] * 9 / 5 + 32
data['Dew Point'] = data['T'] - (9 / 25 * (100 - data['H']))
data['Date'] = cur.strftime("%Y-%m-%d")
data['Time'] = cur.timestamp()
# data['Air Temperature Mean'] = Decimal(str(data['Air Temperature Mean']))
# data['Humidity Mean'] = Decimal(str(data['Humidity Mean']))
# data['Air Pressure Mean'] = Decimal(str(data['Air Pressure Mean']))

# dynamodb = boto3.resource('dynamodb', region_name = 'us-west-1',
#		aws_access_key_id = 'AKIAIAPWYAVOCAQCISQQ',
#		aws_secret_access_key = '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')

# table = dynamodb.Table('grove_BME280') # Student have to write their own table name
# response = table.put_item(Item = data)

client = pymongo.MongoClient('mongodb://localhost:27017/')
db = client.grove_bme280
result = db.raw_datas.insert_one(data)
print("Date: {}, Time: {}, Temperature: {:.2f}, Humidity: {:.2f}, Pressure: {:.2f}, Dew Point: {:.2f}".format(data['Date'], data['Time'], data['T'], data['H'], data['P'], data['Dew Point']))
print("Data stored at MongoDB with ID: %s" %result.inserted_id)

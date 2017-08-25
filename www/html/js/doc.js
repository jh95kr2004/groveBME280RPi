var SERVER_IP = "10.15.36.58"

var chartData, chart;
var lastTimestamp = 0;

function drawChart(data) {
	chartData = data;
	chart = AmCharts.makeChart("chartdiv", {
		"type": "serial",
		"theme": "none",
		"dataProvider": data,
		"valueAxes": [{
			"id": "v1",
			"title": "Temperature(℉)",
			"axisAlpha": 0.2,
			"dashLength": 1,
			"position": "left",
		}, {
			"id": "v2",
			"title": "Humidity(%)",
			"position": "right",
			"gridAlpha": 0,
			"autoGridCount": false,
			"minimum": 0,
			"maximum": 100,
		}],
		"mouseWheelZoomEnabled": true,
		"graphs": [{
			"id": "g1",
			"valueAxis": "v1",
			"balloonText": "[[value]]",
			"bullet": "round",
			"bulletSize": 5,
			"bulletBorderAlpha": 1,
			"bulletColor": "#FFFFFF",
			"hideBulletsCount": 50,
			"title": "Temperature",
			"valueField": "T",
			"useLineColorForBulletBorder": true,
			"legendValueText": "[[value]]℉",
			"balloonText": "[[title]]<br /><b style='font-size: 130%'>[[value]]℉</b>",
		}, {
			"id": "g2",
			"valueAxis": "v2",
			"balloonText": "[[value]]",
			"bullet": "round",
			"bulletSize": 5,
			"bulletBorderAlpha": 1,
			"bulletColor": "#FFFFFF",
			"hideBulletsCount": 50,
			"title": "Humidity",
			"valueField": "H",
			"useLineColorForBulletBorder": true,
			"legendValueText": "[[value]]%",
			"balloonText": "[[title]]<br /><b style='font-size: 130%'>[[value]]%</b>"
		}],
		"chartScrollbar": {
			"autoGridCount": true,
			"graph": "g1",
			"scrollbarHeight": 40
		},
		"chartCursor": {
			"pan": true,
			"valueLineEnabled": true,
			"valueLineBalloonEnabled": true,
			"cursorAlpha": 0,
			"valueLineAlpha": 0.2
		},
		"categoryField": "Date",
		"categoryAxis": {
			"parseDates": true,
			"dateFormats": [{ period: 'fff', format: 'JJ:NN:SS' },
			{ period: 'ss', format: 'JJ:NN:SS' },
			{ period: 'mm', format: 'JJ:NN' },
			{ period: 'hh', format: 'JJ:NN' },
			{ period: 'DD', format: 'MMM DD' },
			{ period: 'WW', format: 'MMM DD' },
			{ period: 'MM', format: 'MMM YYYY' },
			{ period: 'YYYY', format: 'MMM YYYY' }],
			"minPeriod": "mm",
			"axisColor": "#DADADA",
			"dashLength": 1,
			"minorGridEnabled": true,
		},
		"balloon": {
			"borderThickness": 1,
			"shadowAlpha": 0
		},
		"legend": {
			"useGraphSettings": true,
			"position": "bottom"
		},
		"export": {
			"enabled": true
		}
	});
	zoomChart();
}

function zoomChart() {
	var offset = Math.round(50 * window.innerWidth / 1920);
	if(offset <= 1) offset = 2;
	chart.zoomToIndexes(chartData.length - offset, chartData.length - 1);
}

function getDataAndDrawChart() {
	$.getJSON( "http://" + SERVER_IP + ":3000/api/grove_bme280/json/all", function(data) {
		for(i = 0; i < data.length; i++) {
			data[i].T = Number(data[i].T.toFixed(2));
			data[i].H = Number(data[i].H.toFixed(2));
			data[i].Date = new Date(data[i].Time * 1000);
			if(i == data.length - 1) lastTimestamp = data[i].Time;
		}
		drawChart(data);
	});
}

$(function() {
	getDataAndDrawChart();
	var drawTimer = setInterval(getDataAndDrawChart, 60000);
	$(window).resize(function() {
		zoomChart();
	});

	$("button#predictButton").click(function() {
		var date = new Date($("#predictDate").val());
		date.setHours(date.getHours() + date.getTimezoneOffset() / 60);
		date.setDate(date.getDate() - 1);
		$.getJSON("http://" + SERVER_IP + ":3000/api/grove_bme280/json/" + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(), function(data) {
			if(data == null || data.length <= 0) return;
			var temp_mean = temp_max = temp_min = data[0].T;
			var humid_mean = humid_max = humid_min = data[0].H;
			var dew_mean = data[0].T - (9 / 25) * (100 - data[0].H);
			for(var i = 1; i < data.length; i++) {
				temp_mean += data[i].T;
				temp_max = (temp_max < data[i].T) ? data[i].T : temp_max;
				temp_min = (temp_min > data[i].T) ? data[i].T : temp_min;
				humid_mean += data[i].H;
				humid_max = (humid_max < data[i].H) ? data[i].H : humid_max;
				humid_min = (humid_min > data[i].H) ? data[i].H : humid_min;
				dew_mean += (data[i].T - (9 / 25) * (100 - data[i].H));
			}
			temp_mean /= data.length;
			humid_mean /= data.length;
			dew_mean /= data.length;

			var input = {
				"Inputs": {
					"input1": {
						"ColumnNames": [
							"year",
							"month",
							"day",
							"mean_temperature",
							"minimum_temperature",
							"maximum_temperature",
							"mean_humidity",
							"minimum_humidity",
							"maximum_humidity",
							"mean_dewpoint",
							"maximum_temperature_forecast"
						],
						"Values": [
							[
								date.getFullYear(),
								(date.getMonth() + 1),
								date.getDate(),
								temp_mean,
								temp_min,
								temp_max,
								humid_mean,
								humid_min,
								humid_max,
								dew_mean,
								"0"
							]
						]
					}
				},
				"GlobalParameters": {}
			};
			input = JSON.stringify(input);

			$.ajax({
				url: $("input#APIAddress").val(),
				type: "POST",
				data: input,
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + $("input#APIKey").val(),
					"Accept": "application/json"
				},
				error: function() {
				},
				success: function(data) {
				}
			});
		});
	});
});

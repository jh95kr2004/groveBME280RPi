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

$(function() {
	$.getJSON( "http://" + SERVER_IP + ":3000/api/grove_bme280/json/all", function(data) {
		for(i = 0; i < data.length; i++) {
			data[i].T = Number(data[i].T.toFixed(2));
			data[i].H = Number(data[i].H.toFixed(2));
			data[i].Date = new Date(data[i].Time * 1000);
			if(i == data.length - 1) lastTimestamp = data[i].Time;
		}
		drawChart(data);
	});
	
	$( window ).resize(function() {
		zoomChart();
	});
});

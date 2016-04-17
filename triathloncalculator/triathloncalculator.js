// Defaults
  
// 				[ssprint,	sprint, olympic,half,	ironman,custom	];
var swimDist =  [ .4, 		.75, 	1.5,	1.9,	3.8,	1.5		];
var cycleDist = [ 10,		20,		40,		90,		180,	40		];
var runDist =   [2.5,   	5,		10,		21.1,	42.2,	10		];

var unitMult = {km: .62, mi: 1.61};

var swim = {min: "0:30", start: "1:50", max: "4:00", inc: 5};
var t1 = {min: "0:00", start: "2:00", max: "10:00", inc: 10};
var cycle = {min: "10.0", start: "36.0", max: "60.0", inc: .5};
var t2 = {min: "0:00", start: "2:00", max: "10:00", inc: 10};
var run = {min: "2.5", start: "4:45", max: "15:00", inc: 5};

var hour = 3600;
var min = 60;
var kphText = "kph";
var mphText = "mph";
var perKmText = "/km";
var perMiText = "/mi";
var kmText = "km";
var miText = "mi";

// (end Defaults)
  
var main = function() {

  setStartVals();
  refreshCalcs();

  /* Events
   */
   
  //*** UP/DOWN buttons ***//
  $('.btn-up').on('click', function() {updateVal($(this).closest("div").attr("id"), 1); refreshCalcs();});
  $('.btn-down').on('click', function() {updateVal($(this).closest("div").attr("id"),-1); refreshCalcs();});
  
  //*** Distance dropdown ***//
  $('.dropdown-menu').on( "click", function(event) {distanceHandler(event)});
  
  //*** Text inputs  ***//
  $('.form-control').on('blur', function() {
    textInputHandler($(this).closest("div").attr("id"))
  });
  $('.form-control').keyup(function(event){
    if (event.keyCode === 13) textInputHandler($(this).closest("div").attr("id")); //enter key
  });
	
  //km/mi buttons
  $('#btn-km').on('click', function() {unitsHandler(true) });
  $('#btn-mi').on('click', function() {unitsHandler(false)});
  
  //reset button
  $('#btn-reset').on('click', function() {
  	unitsHandler(true); //revert to KMH
	distanceHandler(); //revert distance to Olympic

    swimDist[5]  = swimDist[2]; //reset custom values to Olympic
	cycleDist[5] = cycleDist[2];
	runDist[5] = runDist[2];

	setStartVals();
  });
}

function textInputHandler(inputId){
	// If custom inputs, we need to update the distance arrays
	var unit = isKm() ? 1 : unitMult.mi;
	if (inputId === "cust-swim-group") 			swimDist[5]  = $('#cust-swim-group input').val() * unit;
	else if (inputId === "cust-cycle-group")	cycleDist[5] = $('#cust-cycle-group input').val() * unit;
	else if (inputId === "cust-run-group")		runDist[5] 	 = $('#cust-run-group input').val() * unit;
	
	refreshCalcs();
}
	
function distanceHandler(event){

	//if item not specified, we revert to default (Olympic distance)
	var clickedItem;
	//if (!event) event= window.event; //Firefox special (http://stackoverflow.com/questions/11240874/event-is-not-defined-error-in-javascript-only-firefox)
	if(typeof event === "undefined") {
		clickedItem = $('.dropdown-menu #2')[0];
	}
	else clickedItem = event.target;
	
    // remove active class
	var c = $('.dropdown-menu')[0].childNodes;
	for (i = 0; i < c.length; i++) {
      c[i].className = "";
    }
	// selected child class="active"
	clickedItem.parentNode.className = "active";
	
	// dropdown title = selected child value
	$('#distanceText').text(clickedItem.textContent);
	
	// If custom, show custom inputs and populate fields
	var distanceNum = clickedItem.id;
	if (distanceNum === "5"){
		var unit = isKm() ? 1 : unitMult.km;
		//$('#custom-inputs').hide(); //change hide/show manipulation to jQuery
		$('#custom-inputs').removeClass('hidden').animate({height: 'toggle'},1000);;
		//$('#custom-inputs').show().animate({height: 'toggle	'});//.slideDown(500); //no longer hidden
		
		$('#custom-inputs #cust-swim-group input').val((swimDist[distanceNum] * unit).toFixed(2));
		$('#custom-inputs #cust-cycle-group input').val((cycleDist[distanceNum] * unit).toFixed(2));
		$('#custom-inputs #cust-run-group input').val((runDist[distanceNum] * unit).toFixed(2));
	}	
	else {
		$('#custom-inputs').addClass('hidden');
	}
	refreshCalcs(distanceNum);
}

function unitsHandler(buttonIsKm){
	//Don't continue if already active
	if ((buttonIsKm && isKm()) || (!buttonIsKm && !isKm())) return; 
	
	$('#btn-km')[0].className = 					buttonIsKm ? 'btn btn-primary btn-sm' : 'btn btn-default btn-sm';
	$('#btn-mi')[0].className = 					buttonIsKm ? 'btn btn-default btn-sm' : 'btn btn-primary btn-sm';
	$('#cycle-group #suffix')[0].textContent = 		buttonIsKm ? kphText : mphText;
	$('#run-group #suffix')[0].textContent = 		buttonIsKm ? perKmText : perMiText;
	$('#cust-swim-group #suffix')[0].textContent = 	buttonIsKm ? kmText : miText;
	$('#cust-cycle-group #suffix')[0].textContent = buttonIsKm ? kmText : miText;
	$('#cust-run-group #suffix')[0].textContent = 	buttonIsKm ? kmText : miText;
	
	toggleInputs(buttonIsKm ? unitMult.km : unitMult.mi);
	
	refreshCalcs();
}

function isKm(){
	return $('#btn-km')[0].className === 'btn btn-primary btn-sm';
}

function toggleInputs(mult){

	// update pace inputs
	
	$('#cycle-group input').val(($('#cycle-group input').val() / mult).toFixed(2));
	
	$('#run-group input').val( function() {
		//need to convert timestamp to seconds, then multiply and revert
		return updateInput($('#run-group input').val(), mult, "mult", run.min, run.max);
	});
	
	// update custom inputs
	if ($('#custom-inputs')[0].className === "table-condensed"){ //not hidden
		$('#cust-swim-group input').val(($('#cust-swim-group input').val() / mult).toFixed(2));
		$('#cust-cycle-group input').val(($('#cust-cycle-group input').val() / mult).toFixed(2));
		$('#cust-run-group input').val(($('#cust-run-group input').val() / mult).toFixed(2));
	}
}	

function setStartVals(){
	$('#swim-group input').val(swim.start);
	$('#t1-group input').val(t1.start);
	$('#cycle-group input').val(cycle.start);
	$('#t2-group input').val(t2.start);
	$('#run-group input').val(run.start);
}

/* Based on inputs, calculate the segment and total times
 */
function refreshCalcs(distance){

    //Is input km or mi? This affects cycle and run only
	var mult = isKm() ? 1 : unitMult.km;
	
	//if no distance specified, we will retrieve it
	if(typeof distance === "undefined") {
		distance = $('.dropdown-menu .active')[0].firstElementChild.id;
	}
	
	// Swim
	swimTime = parseDate($('#swim-group input').val()) * swimDist[distance] * 10 / 1000;
	swimOut = getOutput(swimTime);
	
	// T1
	t1Out = $('#t1-group input').val();
	t1Time = parseDate(t1Out) / 1000;
	
	// Cycle
	cycleTime = cycleDist[distance] * mult / $('#cycle-group input').val() * hour;
	cycleOut = getOutput(cycleTime)
	
	// T2
	t2Out = $('#t2-group input').val();
	t2Time = parseDate(t2Out) / 1000;
	
	// Run
	runTime = runDist[distance] * mult * parseDate($('#run-group input').val())/1000;
	runOut = getOutput(runTime);
	
	// Total
	totalOut = getOutput(swimTime + t1Time + cycleTime + t2Time + runTime);
	
	// Update Times
	$('#swimText').text(swimOut);
	$('#t1Text').text(t1Out);
	$('#cycleText').text(cycleOut);
	$('#t2Text').text(t2Out);
	$('#runText').text(runOut);
	$('#totalText').text(totalOut);
	
	// Update Increment Text
	$('#inc-swim').text('Every ' + swim.inc*2 + ' seconds /100m saved in the Swim will reduce time by '
		+ getOutput(swimDist[distance] * 10 * swim.inc*2));
	$('#inc-cycle').text('Every ' + cycle.inc*2 + ' ' + (isKm() ? kphText : mphText) + ' faster on the ride will reduce time by '
		+ getOutput(cycleTime - cycleDist[distance] * mult / (parseFloat($('#cycle-group input').val()) + cycle.inc*2) * hour));
	$('#inc-run').text('Every ' + run.inc*2 + ' seconds ' + (isKm() ? perKmText : perMiText) + ' faster on the run will reduce time by '
		+ getOutput(runDist[distance] * mult * run.inc*2));
	
	// Update Distance Text
	$('#swim-distance').text((swimDist[distance] * 1000).toFixed(0) + 'm');
	$('#cycle-distance').text((cycleDist[distance] * mult).toFixed(1) + (isKm() ? kmText : miText));
	$('#run-distance').text((runDist[distance] * mult).toFixed(1) + (isKm() ? kmText : miText));
	
	function getOutput(segmentTime){
		hours = Math.floor(segmentTime / hour);
		minutes = Math.floor((segmentTime - hours * hour) / min);
		seconds = Math.floor(segmentTime - hours * hour - minutes * min);
		return ((hours > 0) ? hours + ":" : "") + ((minutes < 10 && hours > 0) ? "0" : "") + minutes + ((seconds < 10) ? ":0" : ":") + seconds;
	}
}

function updateVal(inputGroup, direction) {
	//get parent group (S, T1, C, T2, R)
	var outputVal = $('#' + inputGroup + ' input').val();
	switch (inputGroup) {
		case 'swim-group': 	
			outputVal = updateInput(outputVal, swim.inc * direction, "add", swim.min, swim.max);
		break;
		case 't1-group': 
			outputVal = updateInput(outputVal, t1.inc * direction, "add", t1.min, t1.max);
		break;
		case 'cycle-group': // This is decimal, not a datetime like the others
			outputVal = (parseFloat(outputVal) + cycle.inc * direction).toFixed(1);
			outputVal = Math.max(Math.min(outputVal, cycle.max), cycle.min);
		break;
		case 't2-group': 
			outputVal = updateInput(outputVal, t2.inc * direction, "add", t2.min, t2.max);
		break;
		case 'run-group': 
			outputVal = updateInput(outputVal, run.inc * direction, "add", run.min, run.max);
		break;
		default: console.log("ERROR: Unable to recognise inputGroup: " + inputGroup);
	}
    $('#' + inputGroup + ' input').val(outputVal);
}

function updateInput(input, operand, operator, minInput, maxInput) {
  var min = new Date(parseDate(minInput));
  var max = new Date(parseDate(maxInput));
  var d;
  if (operator === "add")
	d = new Date(parseDate(input) + operand*1000);
  else if (operator === "mult")
	d = new Date(parseDate(input) * operand);
  else
	console.log("ERROR: Invalid operator: " + operator);
 
  //limit to min and max
  if (d > max) d = max;
  else if (d < min) d = min;
  
  return d.getMinutes() + ((d.getSeconds() < 10) ? ":0" : ":") + d.getSeconds();
}

/* We treat all min:sec formats as a datetime,
 * starting at the beginning of time (1970/1/1)
 */
function parseDate(input){
	input += (input.indexOf(":") >= 0) ? "" : ":00"; //Can't use input.includes in Firefox
	var res = input.split(":");
	return (Number(res[0])*60+Number(res[1]))*1000;
}

$(document).ready(main);
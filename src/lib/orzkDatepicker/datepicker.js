/*
	 Options
		- showTitle Boolean [true,false] Default true
	 	- mode	String [date, time, datetime]	Default 'datetime'
		- lang	String [en, es, fr] Default 'en'
		- startDay Integer [0 - Sunday, 1 - Monday, ... 6 - Saturday]	Default 1
		- minDate	Date [Date object] Default null
		- maxDate	Date [Date object] Default null
		- blockWeekdays	Array<String> [mon,tue,wed,thu,fri,sat,sun] Default []
		- blockDates	{<Array<Date>} Default {}	Single date / Date range: [min date, max date]
		- display	String [full, compact] Default 'full'
		- showMsg	Boolean [true, false]	Default true
		- dateFormat	String ['ymd[/-]','ydm[/-]','mdy[/-]','dmy[/-]'] Default 'dmy/'
		- timeFormat	String ['h','hm','hms']
		- position	String['free','attach','fixed']	Default 'free'
		- showDate	Boolean [true,false] Default true
	
	 Methods
		Public
			show()						-	Draws the datepicker DOM elements.
			close()						-	Removes the datepicker object's DOM elements. The selected date and time will be kept on the object and will be shown if the show() function is called again.
			getDate()					-	Returns a Date object containing the selected date.
			setOptions(options)			-	Sets the options for this instance. The 'options' parameter is a javascript object containing the pairs of key:value whose default values must be overwritten.
			getFullDateString()			-	Returns a string containing the selected date formatted based on the dateFormat and timeFormat options.
			setDate(d)					-	Sets the initial date of the datepicker object. By default, if an input DOM element id is passed as parameter on the datepicker's constructor, and it 
											contains a valid date string, this date will be set as the initial one. Otherwise, the initial date will be the current local date. If this date is blocked,
											the initial date will be empty and the user must select one manually on the calendar widget in order to be able to push the 'OK' button.
			printDate()					-	Prints a formatted date string based on the selected date on the input DOM element referenced by the id passed as parameter on the datepicker's constructor.
											If this parameter contains null or a non valid id, nothing will be printed.
			onSubmit(d)					-	This function is called when the user press the 'OK' button. By default it calls the printDate() function.
		Private		
			updateDisplay()				-	Redraw all the display elements 
			daysInMonth()				-	Returns the number of days of the selected month.
			firstDay()					-	Returns the position on the weekdays o the month's first day. Used to calculate the first row's offset when printing the calendar. 
			clearCalendarContainer()	-	Remove the elements on the calendar container.
			clearTimeContainer()		-	Remove the elements on the time container (Clock elements)
			clearMsgContainer()			-	Remove the elements on the debug section (errors and warnings)
			printCalendar()				-	Draws the calendar
			printMonthList()			-	Draws the month list that allows to quickly one. 
			printYearList(decade)		-	Draws the year list. This window allows to scroll over the years in groups of 20 and select one of them. The 'decade' parameter indicates the offset 
											to know which group of years must be printed.
			printAnalogTime(type)		-	Draws the analog clock to pick hours / minutes / seconds. The 'type' parameter indicates which one is being picked.
			drawClockHand(line,x2,y2)	-	Draws the clock's hand, starting from the center of the widget. 
			hideClockHand(line)			-	Hide the clock's hand passed as parameter.
			showCalendar()				-	Show the calendar container window
			showTime()					-	Show the clock container window
			getDateString(d)			-	Returns a formatted string based on the date 'd' passed as parameter and the dateFormat option passed when the object was created.
			getTimeString(d)			-	Returns a formatted string based on the date 'd' passed as parameter and the timeFormat option passed when the object was created.
			updateTime(d)				-	Redraws the display item containing the time.
			createDate(d)				-	Returns a date object based on the string 'd' passed as parameter. If the string doesn't fit the dateFormat and timeFormat options, returns false.
			padInteger(number,max)		-	Returns a string of 'max' characters containing 'number' and filled with zeros on the left. Ej. padInteger(2,4) -> '0002'
			rad2deg(x)					-	Converts radians to degrees.
			deg2rad(x)					-	Converts degrees to radians.
			isDate(date)				-	Checks if the 'date' parameter is a Date object. Returns a boolean.
			dateInRange(date,type)		-	Checks if the 'date' parameter is bigger than the minDate option and smaller than the maxDate option. The 'type' can be 'day' for the printCalendar() 
											function, 'month' for the printMonthList() function or 'year' for the printYearList() function
			dateIsBlocked(date)			-	Checks if the 'date' parameter is present on the blockDates option.
	*/
export class Datepicker  {
	constructor(dateField,title,options) {	
		
		this.setOptions = this.setOptions.bind(this)
		this.reset = this.reset.bind(this)
		this.show = this.show.bind(this)
		this.updateDisplay = this.updateDisplay.bind(this)
		this.daysInMonth = this.daysInMonth.bind(this)
		this.firstDay = this.firstDay.bind(this)
		this.clearCalendarContainer = this.clearCalendarContainer.bind(this)
		this.clearTimeContainer = this.clearTimeContainer.bind(this)
		this.clearMsgContainer = this.clearMsgContainer.bind(this)
		this.printCalendar = this.printCalendar.bind(this)
		this.printMonthList = this.printMonthList.bind(this)
		this.printYearList = this.printYearList.bind(this)
		this.printAnalogTime = this.printAnalogTime.bind(this)
		this.drawClockHand = this.drawClockHand.bind(this)
		this.hideClockHand = this.hideClockHand.bind(this)
		this.close = this.close.bind(this)
		this.printDate = this.printDate.bind(this)
		this.getFullDateString = this.getFullDateString.bind(this)
		this.showCalendar = this.showCalendar.bind(this)
		this.showTime = this.showTime.bind(this)
		this.getDateString = this.getDateString.bind(this)
		this.getTimeString = this.getTimeString.bind(this)
		this.updateTime = this.updateTime.bind(this)
		this.getDate = this.getDate.bind(this)
		this.createDate = this.createDate.bind(this)
		this.setStartDate = this.setStartDate.bind(this)
		this.setDate = this.setDate.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
		this.padInteger = this.padInteger.bind(this)
		this.rad2deg = this.rad2deg.bind(this)
		this.deg2rad = this.deg2rad.bind(this)
		this.isDate = this.isDate.bind(this)
		this.dateInRange = this.dateInRange.bind(this)
		this.dateIsBlocked = this.dateIsBlocked.bind(this)
	
		this.initialized = false;	
		this._version = '0.1';
		
		this.defOptions = options;
		this.dpMode = "datetime";	
		this.inputDate = null;
		this.showDate = true;
		this.language = "en";
		this.startDay = 1;	// Monday
		this.minDate = null;
		this.maxDate = null;
		this.showTitle = true;
		this.blockdays = [];
		this.display = "full";
		this.showMsg = true;
		this.blockDates = [];
		this.dateFormat = "dmy/";
		this.timeFormat = "hm";
		this.position = "free";
		
		this.error = [];
		this.warning = [];
		this.info = [];
		
		this.lang = {
			"en":	{
				month:		["January","February","March","April","May","June","July","August","September","October","November","December"],
				monthShort:	["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
				day:		["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
				dayShort:	["Su","Mo","Tu","We","Th","Fr","Sa"],
				btncancel:	"Cancel",
				btnok:		"OK",
				errTitle:	"Invalid 'showTitle' value. Default value will be used.",
				errMode:	"Unknown 'mode' value. Default value will be used.",
				errLang:	"Unknown 'lang' value. Default value will be used.",
				errStart:	"Invalid 'startDay' value. Default value will be used.",
				errMin:		"Invalid minimum date. This parameter will be ignored.",
				errMax:		"Invalid maximum date. This parameter will be ignored.",
				errMinMax:	"Minimun date is higher than maximum date. Both will be ignored.",
				errDisplay:	"Invalid 'display' value. This parameter will be ignored.",
				errMsg:		"Invalid 'showMsg' value. Default value will be used.",
				errWeekDay:	"Unknown 'blockWeekdays' argument on position ",
				errWeekDay2:"The 'blockWeekdays' parameter expects an array as argument.",
				errInputField:	"DOM element not found",
				errDateFormat:	"Invalid date format",			
				errBlockDate:	"Invalid date in 'blockDates' parameter at position ",
				errFormat:		"Invalid 'dateFormat' value. Default value will be used: 'mdy/'",
				errTimeFormat:	"Invalid 'timeFormat' value. Default value will be used: 'hm'",
				errPosition:	"Invalid element id to bind the widget position. Default value will be used: 'free'",
				errPosition2:	"Ivalid 'position' value. Default value will be used: 'free'",
				errShowDate:	"Invalid 'showDate' value. Default value will be used: 'true'"
				
			},
			"es":	{
				month:		["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
				monthShort:	["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
				day:		["Domingo","Lunes","Martes","Mi\xe9rcoles","Jueves","Viernes","S\xe1bado"],
				dayShort:	["Do","Lu","Ma","Mi","Ju","Vi","S\xe1"],
				btncancel:	"Cancelar",
				btnok:		"OK",
				errTitle:	"Valor de 'showTitle' no v\xe1lido. Se usar\xe1 el valor por defecto.",
				errMode:	"Valor de 'mode' desconocido. Se usar\xe1 el valor por defecto.",
				errLang:	"Valor de 'lang' desconocido. Se usar\xe1 el valor por defecto.",
				errStart:	"Valor de 'startDay' no v\xe1lido. Se usar\xe1 el valor por defecto.",
				errMin:		"Fecha m\xednima no v\xe1lida. Este par\xe1metro ser\xe1 ignorado.",
				errMax:		"Fecha m\xe1xima no v\xe1lida. Este par\xe1metro ser\xe1 ignorado.",
				errMinMax:	"La fecha m\xednima es posterior a la fecha m\xe1xima. Ambos par\xe1metros ser\xe1n ignorados.",
				errDisplay:	"Valor de 'display' no v\xe1lido. Este par\xe1metro ser\xe1 ignorado.",
				errMsg:		"Valor de 'showMsg' no v\xe1lido. Se usar\xe1 el valor por defecto.",
				errWeekDay:	"Valor de 'blockWeekdays' desconocido en la posici\xf3n ",
				errWeekDay2:"El par\xe1metro 'blockWeekdays' debe ser un array.",
				errInputField:	"No se ha encontrado el campo de entrada en la p\xe1gina.",
				errDateFormat:	"Formato de fecha no v\xe1lido.",			
				errBlockDate:	"Fecha no v\xe1lida en el par\xe1metro 'blockDates' en la posici\xf3n ",
				errFormat:		"Valor de 'dateFormat' no v\xe1lido. Se usar\xe1 el valor por defecto: 'mdy/'",
				errTimeFormat:	"Valor de 'timeFormat' no v\xe1lido. Se usar\xe1 el valor por defecto: 'hm'",
				errPosition:	"ID del elemento no v\xe1lida. No se puede enlazar el objeto con este valor de 'position'. Se usar\xe1 el valor por defecto: 'free'",
				errPosition2:	"Valor de 'position' no v\xe1lido. Se usar\xe1 el valor por defecto: 'free'",
				errShowDate:	"Valor de 'showDate' no v\xe1lido. Se usar\xe1 el valor por defecto: 'true'"
			}		
		};
		
		// Set input/output field
		if(typeof(dateField) != "undefined" && dateField != null){
			this.inputDate = document.getElementById(dateField);
			if(this.inputDate == null){
				this.error.push(this.lang[this.language].errInputField);
			}
		}
		
		this.setOptions(options);
		
			
		this.fecha = null;
		this.nuevaFecha = null;
		
		this.contenedor = null;
		this.dp = null;
		
		this.titleContainer = null;
		this.titleTxt = null;
		this.title = title;
		
		this.ymcontainer = null;
		this.yearContainer = null;
		this.year = null;
		this.yearTxt = null;
		this.yearPrev = null;
		this.yearNext = null;
		
		this.monthContainer = null;
		this.month = null;
		this.monthTxt = null;
		
		this.daySelected = null;
		this.daySelectedTxt = null;
		
		this.dayWeek = null;
		this.dayWeekTxt = null;	
		
		this.timeTxt = null;	
		
		this.btnCalendar = null;
		this.btnHour = null;
		
		this.msgContainer = null;
		this.msgTxt = null;
		this.msgList = null;
		this.msgArrow = null;
		
		this.tableContainer = null;
		this.dpCurrWindow = "calendar";	// calendar / time
		
		this.calendarContainer = null;
		this.calendar = null;
		this.monthList = null;
		this.yearList = null;
		this.decadeListContainer = null;
		this.decadeList = null;
		this.decadeShift = 0;
		
		this.timeContainer = null;
		this.clockType = "analog";
		// Analog clock variables
		this.timeWindow = null;
		this.timeMinutesContainer = null;
		this.svgNS = null;
		this.analogClockSVG = null;
		this.clockHandSelected = null;
		this.clockHand = null;	
		
		// Digital clock variables
		this.dcHour = null;
		this.dcbtnHourUp = null;
		this.dcbtnHourDown = null;
		this.dcMinute = null;
		this.dcbtnMinUp = null;
		this.dcbtnMinDown = null;
		
		this.btnCancel = null;
		this.btnOK = null;
	}

	setOptions(options){	
	
		// Validate the options passed as argument and load them.
		if(typeof(options) != "undefined" && options != null){
			var tmplang = options['lang'];
			var tmptitle = options['showTitle'];
			var tmpmode = options['mode'];
			var tmpdateformat = options['dateFormat'];
			var tmptimeformat = options['timeFormat'];
			var tmpstartday = options['startDay'];
			var tmpmindate = options['minDate'];
			var tmpmaxdate = options['maxDate'];
			var tmpdisplay = options['display'];
			var tmpshowmsg = options['showMsg'];
			var tmpblockweekdays = options['blockWeekdays'];
			var tmpblockdates = options['blockDates'];
			var tmpposition = options['position'];
			var tmpshowdate = options['showDate'];
			
			// Select language
			if(typeof(tmplang) != "undefined" && tmplang != null){			
				if(this.lang[tmplang] == null){				
					this.language = "en";
					this.warning.push(this.lang[this.language].errLang);
				}else{						
					this.language = tmplang;
				}
			}
			
			// Print the date in the input field on submit
			if(typeof(tmpshowdate) != "undefined" && tmpshowdate != null){			
				if(typeof(tmpshowdate) === 'boolean'){				
					this.showDate = tmpshowdate;
				}else{
					this.warning.push(this.lang[this.language].errShowDate);
					this.showDate = true;
				}
			}
			
			// Show/hide title		
			if(typeof(tmptitle) != "undefined" && tmptitle != null){
				if(typeof(tmptitle) === 'boolean'){
					this.showTitle = tmptitle;				
				}else{
					this.warning.push(this.lang[this.language].errTitle);
					this.showTitle = true;
				}
			}
			
			// Set the datepicker mode
			if(typeof(tmpmode) != "undefined" && tmpmode != null){
				if(tmpmode === "date"){
					this.dpMode = "date";
				}else if(tmpmode === "time"){
					this.dpMode = "time";
				}else if(tmpmode === "datetime"){
					this.dpMode = "datetime";			
				}else{
					this.dpMode = "datetime";
					this.warning.push(this.lang[this.language].errMode);
				}
			}		
			
			// Set date format
			if(typeof(tmpdateformat) != "undefined" && tmpdateformat != null){			
				if(typeof(tmpdateformat) === 'string' && tmpdateformat.length === 4){				
					var sep = tmpdateformat.substr(3);
					if(sep !== '/' && sep !== '-'){					
						this.error = this.lang[this.language].errFormat;
					}else{					
						var p = tmpdateformat.substr(0,3);					
						if(p === 'ymd' || p === 'ydm' || p === 'dmy' || p === 'mdy'){
							this.dateFormat = tmpdateformat;
						}else{
							this.error = this.lang[this.language].errFormat;
						}
					}
				}else{
					this.error = this.lang[this.language].errFormat;
				}
			}
			
			// Set time format
			if(typeof(tmptimeformat) != "undefined" && tmptimeformat != null){			
				if(tmptimeformat === 'h' || tmptimeformat === 'hm' || tmptimeformat === 'hms'){
					this.timeFormat = tmptimeformat;
				}else{
					this.error = this.lang[this.language].errTimeFormat;
				}
				
			}
			
			// Set the starting day of the week
			if(typeof(tmpstartday) != "undefined" && tmpstartday != null){
				if(tmpstartday >= 0 && tmpstartday < 7){				
					this.startDay = tmpstartday;			
				}else{
					this.warning.push(this.lang[this.language].errStart);
				}
			}
			
			// Set the minimum date that can be picked
			if(typeof(tmpmindate)!= "undefined" && tmpmindate != null && this.dpMode !== "time"){
				
				this.minDate = this.createDate(tmpmindate);
				if(!this.isDate(this.minDate)){				
					this.minDate = null;
					this.warning.push(this.lang[this.language].errMin);
				}
			}
			
			// Set the maximum date that can be picked
			if(typeof(tmpmaxdate)!= "undefined" && tmpmaxdate != null && this.dpMode !== "time"){
				
				this.maxDate = this.createDate(tmpmaxdate);
				if(!this.isDate(this.maxDate)){
					this.maxDate = null;
					this.warning.push(this.lang[this.language].errMax);
				}
			}		
			
			// Set the type of display
			if(typeof(tmpdisplay)!= "undefined" && tmpdisplay != null){
				if(tmpdisplay === "compact"){				
					this.display = "compact";			
				}else if(tmpdisplay === "full"){
					this.display = "full";
				}else{
					this.warning.push(this.lang[this.language].errDisplay);
				}
			}		
			
			// Show / hide the error and warning messages
			if(typeof(tmpshowmsg)!= "undefined" && tmpshowmsg != null){
				if(tmpshowmsg === true){
					this.showMsg = true;
				}else if (tmpshowmsg === false){
					this.showMsg = false;
				}else{
					this.warning.push(this.lang[this.language].errMsg);
				}
			}
			
			// Set the position of the widget
			if(typeof(tmpposition)!= "undefined" && tmpposition != null){
				if(tmpposition === "free"){
					this.position = tmpposition;
				}else if (tmpposition === "attach" || tmpposition === "fixed"){
					if(this.inputDate !== null ){
						this.position = tmpposition;
					}else{					
						this.warning.push(this.lang[this.language].errPosition);
						this.position = "free";									
					}			
				}else{
					this.warning.push(this.lang[this.language].errPosition2);
				}
			}
			
			// Set the weekdays that are blocked
			if(typeof(tmpblockweekdays) != "undefined" && tmpblockweekdays != null && this.dpMode !== "time"){
				// Checks if the object passed is an array
				if(Object.prototype.toString.call(tmpblockweekdays) === '[object Array]'){
					this.blockdays = [];
					for(var i=0;i<tmpblockweekdays.length;i++){
						switch(tmpblockweekdays[i]){
							case "mon":
								this.blockdays.push(1);
								break;
							case "tue":
								this.blockdays.push(2);
								break;
							case "wed":
								this.blockdays.push(3);
								break;
							case "thu":
								this.blockdays.push(4);
								break;
							case "fri":
								this.blockdays.push(5);
								break;
							case "sat":
								this.blockdays.push(6);
								break;
							case "sun":
								this.blockdays.push(0);
								break;
							default:
								this.error.push(this.lang[this.language].errWeekDay + i);							
						}
					}
				}else{
					this.error.push(this.lang[this.language].errWeekDay);
				}
			}
			
			
			// Set the dates blocked
			if(typeof(tmpblockdates) != "undefined" && tmpblockdates != null && this.dpMode !== "time"){			
				for(var i = 0; i< tmpblockdates.length; i++){
						
					if(tmpblockdates[i].length === 1){		
						
						var d = this.createDate(tmpblockdates[i][0]);
						
						if(this.isDate(d)){						
							this.blockDates.push([d]);						
						}else{						
							this.warning.push(this.lang[this.language].errBlockDate + i);
						}
					}else if(tmpblockdates[i].length === 2){					
						var daterange = tmpblockdates[i];
						var d1 = this.createDate(daterange[0]);
						var d2 = this.createDate(daterange[1]);
						if(this.isDate(d1) && this.isDate(d2)){
							if(d1<= d2){
								this.blockDates.push([d1,d2]);
							}else{
								this.warning.push(this.lang[this.language].errBlockDate + i);
							}
						}else{						
							this.warning.push(this.lang[this.language].errBlockDate + i);
						}
					}else{
						this.warning.push(this.lang[this.language].errBlockDate + i);
					}
				}
			}
			
			
		}	
		
		// Validates min and max dates
		if(this.minDate != null && this.maxDate != null){
			if(this.minDate.getTime() > this.maxDate.getTime()){
				this.minDate = null;
				this.maxDate = null;
				this.warning.push(this.lang[this.language].errMinMax);			
			}
		}
		
		
		// Validates the block dates
		for(var i = 0; i< this.blockDates.length; i++){
			if(this.blockDates[i].length === 1){			
				if(!this.dateInRange(this.blockDates[i][0],"day")){					
					this.blockDates.splice(i);				
					this.warning.push(this.lang[this.language].errBlockDate + i);
				}
			}else{
				if( ( (this.maxDate != null && this.blockDates[i][0] > this.maxDate) || (this.minDate != null && this.blockDates[i][1] < this.minDate)) || 
					this.blockDates[i][1] < this.blockDates[i][0]
				){					
					this.blockDates.splice(i);
					this.warning.push(this.lang[this.language].errBlockDate + i);
				}
			}
		}		
		
		
		// Updates the weekdays positions in the array depending on the start day.
		for(var i=0; i<this.startDay;i++){
			this.lang[this.language].day.push(this.lang[this.language].day.shift());
			this.lang[this.language].dayShort.push(this.lang[this.language].dayShort.shift());				
		}	
	}

	reset (){
		this.dpMode = "datetime";	
		//this.inputDate = null;
		this.showDate = true;
		this.language = "en";
		this.startDay = 1;	// Monday
		this.minDate = null;
		this.maxDate = null;
		this.showTitle = true;
		this.blockdays = [];
		this.display = "full";
		this.showMsg = true;
		this.blockDates = [];
		this.dateFormat = "dmy/";
		this.timeFormat = "hm";
		this.position = "free";
		
		this.error = [];
		this.warning = [];
		this.info = [];
		
		this.fecha = null;
		this.nuevaFecha = null;
		
		this.setOptions(this.defOptions);
		this.dpCurrWindow = "calendar";
		
	}
	show (){
		var dpInstance = this;	
		
		if(this.initialized){		
			return false;
		}
		
		this.error = [];
		
		
		if(this.inputDate != null && this.showDate === true){		
			this.fecha =  this.setStartDate();		
		}
		
		// Check if the setDate method returns a valid date. If the returned value is not a valid date, sets the current date.
		if(!this.isDate(this.fecha)){
			this.fecha = new Date();
		}
		
		if(this.minDate != null && this.fecha < this.minDate){
			this.fecha = new Date(this.minDate.getTime());
		}
		if(this.maxDate != null && this.fecha > this.maxDate){
			this.fecha = new Date(this.maxDate.getTime());
		}
		
		this.nuevaFecha = new Date(this.fecha.getTime());
		
		this.contenedor = document.createElement("div");
		if(this.position === "attach"){		
			this.contenedor.className = "orzk-dp_contenedor_attach";		
			var coord = this.inputDate.getBoundingClientRect();	
			
			//this.contenedor.style.top = (coord.top + coord.height + (this.inputDate.offsetTop - coord.top))+'px';	
			this.contenedor.style.top = (window.scrollY + coord.top + coord.height)+'px';
			this.contenedor.style.left = (window.scrollX + coord.left)+'px';		
				
		}else{
			this.contenedor.className = "orzk-dp_contenedor";
		}
		this.contenedor.id = "datepicker";
		this.contenedor.onclick = function(){
			//this.parentNode.removeChild(this);
		};
		
		this.dp = document.createElement("div");
		if(this.position === "attach"){
			this.dp.className = "orzk-dp_datepicker_attach";
		}else{
			this.dp.className = "orzk-dp_datepicker";
		}
		
		if(this.title != null && this.showTitle){
			this.titleContainer = document.createElement("div");
			this.titleContainer.className = "orzk-dp_title";
			this.titleTxt = document.createTextNode(this.title);
			this.titleContainer.appendChild(this.titleTxt);
		}
		
		if(this.dpMode !== "time"){
			// Year - month container
			this.ymcontainer = document.createElement("div");
			
			// Year block
			this.yearContainer = document.createElement("div");
			this.yearContainer.className = "orzk-dp_year_month_container";
			
			this.yearPrev = document.createElement("div");		
			this.yearPrev.className = "orzk-dp_arrow orzk-dp_left";
			this.yearPrev.id = "dp_year_prev";
			this.yearPrev.onclick = function() {			
				var year = dpInstance.nuevaFecha.getFullYear()-1;	
				
				dpInstance.nuevaFecha.setFullYear(year);
				
				dpInstance.updateDisplay();
			};	
			
			this.yearNext = document.createElement("div");		
			this.yearNext.className = "orzk-dp_arrow orzk-dp_right";
			this.yearNext.id = "dp_year_next";
			this.yearNext.onclick = function() {			
				var year = dpInstance.nuevaFecha.getFullYear()+1;	
				
				dpInstance.nuevaFecha.setFullYear(year);
				
				dpInstance.updateDisplay();
			};		
			
			this.year = document.createElement("div");
			this.year.className = "orzk-dp_year_month";
			this.yearTxt = document.createTextNode(this.lang[this.language].month[this.fecha.getMonth()]);
			this.year.onclick = function(){
				dpInstance.showCalendar();
				if(document.getElementById("dp-year-list")== null || dpInstance.dpCurrWindow === "time"){				
					dpInstance.printYearList(0);
				}else{				
					dpInstance.updateDisplay();
				}
			};
			this.year.appendChild(this.yearTxt);
			
			this.yearContainer.appendChild(this.yearPrev);		
			this.yearContainer.appendChild(this.year);
			this.yearContainer.appendChild(this.yearNext);
			
			// Month block		
			this.monthContainer = document.createElement("div");
			this.monthContainer.className="orzk-dp_year_month_container";
			
			this.monthPrev = document.createElement("div");
			this.monthPrev.className = "orzk-dp_arrow orzk-dp_left";
			this.monthPrev.id = "dp_month_prev";
			this.monthPrev.onclick = function() {
				var month = dpInstance.nuevaFecha.getMonth() - 1;
				var year = dpInstance.nuevaFecha.getFullYear();
				
				if(month < 0){
					month = 11;
					year--;
				}
				dpInstance.nuevaFecha.setMonth(month);
				dpInstance.nuevaFecha.setFullYear(year);
				
				dpInstance.updateDisplay();			
			};	
			
			this.monthNext = document.createElement("div");
			this.monthNext.className = "orzk-dp_arrow orzk-dp_right";
			this.monthNext.id = "dp_month_next";		
			this.monthNext.onclick = function() {
				var month = dpInstance.nuevaFecha.getMonth() + 1;
				var year = dpInstance.nuevaFecha.getFullYear();
				
				if(month > 11){
					month = 0;
					year++;
				}
				dpInstance.nuevaFecha.setMonth(month);
				dpInstance.nuevaFecha.setFullYear(year);
				
				dpInstance.updateDisplay();
			};		
			
			this.month = document.createElement("div");
			this.month.className = "orzk-dp_year_month";
			this.monthTxt = document.createTextNode(this.lang[this.language].month[this.fecha.getMonth()]);
			this.month.onclick = function(){
				dpInstance.showCalendar();
				
				if(document.getElementById("dp-month-list")== null || dpInstance.dpCurrWindow === "time"){				
					dpInstance.printMonthList();
				}else{				
					dpInstance.updateDisplay();
				}
				
			};
			this.month.appendChild(this.monthTxt);
			
			this.monthContainer.appendChild(this.monthPrev);
			this.monthContainer.appendChild(this.month);
			this.monthContainer.appendChild(this.monthNext);
			
			this.ymcontainer.appendChild(this.monthContainer);
			this.ymcontainer.appendChild(this.yearContainer);
			
			
			// Day block
			this.daySelected = document.createElement("div");
			this.daySelected.className="orzk-dp_day";		
			this.daySelectedTxt = document.createTextNode(this.fecha.getDate());
			this.daySelected.appendChild(this.daySelectedTxt);
			
			// Day of the week block
			this.dayWeek = document.createElement("div");
			this.dayWeek.className="orzk-dp_dayweek";
			this.dayWeekTxt = document.createTextNode(this.lang[this.language].day[this.fecha.getDay()]);
			this.dayWeek.appendChild(this.dayWeekTxt);
		}
		
		if(this.dpMode !== "date"){
			// Time block	
			this.timeTxt = document.createElement("div");
			this.timeTxt.className = "orzk-dp_time";		
		}
		
		var dayhourContainer = null;
		if(this.dpMode === "datetime"){
			// Calendar / hour buttons
			dayhourContainer = document.createElement("div");
			dayhourContainer.className = "orzk-dp_dayhourcontainer";
			this.btnCalendar = document.createElement("div");
			this.btnCalendar.className = "orzk-dp-icon-calendar orzk-dp_calendar_button orzk-dp_dayhour_button_selected";
			this.btnCalendar.onclick = function (){
				dpInstance.showCalendar();
			};
			
			this.btnHour = document.createElement("div");
			this.btnHour.className = "orzk-dp-icon-time orzk-dp_hour_button";
			this.btnHour.onclick = function (){
				dpInstance.showTime();			
			};
			
			dayhourContainer.appendChild(this.btnCalendar);
			dayhourContainer.appendChild(this.btnHour);
		}
		
		// Message block
		this.msgContainer = document.createElement("div");
		this.msgContainer.className = "orzk-dp_msg orzk-dp_hide";
		this.msgContainer.onclick = function(){
			if(dpInstance.msgTxt.className.indexOf("hide") !== -1){
				dpInstance.msgTxt.style.top = dpInstance.msgContainer.style.top + dpInstance.msgContainer.height;
				dpInstance.msgTxt.className = dpInstance.msgTxt.className.replace(/\borzk-dp_hide\b/,"");
				dpInstance.msgArrow.className = "orzk-dp_up";
			}else{
				dpInstance.msgTxt.className += " orzk-dp_hide";	
				dpInstance.msgArrow.className = "orzk-dp_down";
			}
		};
		this.msgTxt = document.createElement("div");
		this.msgTxt.className = "orzk-dp_msg_list orzk-dp_hide";
		this.msgTxt.onclick = function(){
			dpInstance.msgTxt.className += " orzk-dp_hide";
			dpInstance.msgArrow.className = "orzk-dp_down";
		};
		
		
		if(this.dpMode !== "date"){
			// Clock block
			this.timeContainer = document.createElement("div");
			this.timeContainer.className = "orzk-dp_time_container orzk-dp_hide";
			if(this.clockType === "analog"){
				this.timeWindow = "hour";	
				
				this.timeMinutesContainer = document.createElement("div");
				this.timeMinutesContainer.className = "orzk-dp_time_minutes";		
				
				this.analogClockSVG = document.createElementNS("http://www.w3.org/2000/svg","svg");
				this.svgNS = this.analogClockSVG.namespaceURI;
				this.analogClockSVG.setAttribute("class","orzk-dp_clock_svg orzk-dp_hide");
				this.clockHand = document.createElementNS(this.svgNS,"line");
				this.clockHandSelected = document.createElementNS(this.svgNS,"line");			
				
				this.analogClockSVG.appendChild(this.clockHand);
				this.analogClockSVG.appendChild(this.clockHandSelected);
				
				
			}/*else if(this.clockType == "digital"){
				
			}*/
		}
		
		if(this.dpMode !== "time"){
			// Calendar block
			this.calendarContainer = document.createElement("div");		
			this.printCalendar();
		}
		
		this.tableContainer = document.createElement("div");
		this.tableContainer.className = "orzk-dp_table_container";
		if(this.dpMode !== "time"){
			this.tableContainer.appendChild(this.calendarContainer);
		}
		if(this.dpMode !== "date"){
			this.tableContainer.appendChild(this.timeContainer);
			this.tableContainer.appendChild(this.analogClockSVG);
		}
		
		// Buttons
		var btnContainer = document.createElement("div");
		btnContainer.className = "orzk-dp_btn_container";
		
		this.btnCancel = document.createElement("div");
		this.btnCancel.className = "orzk-dp_button";
		this.btnCancel.appendChild(document.createTextNode(this.lang[this.language].btncancel));
		this.btnCancel.onclick = function(){
			dpInstance.nuevaFecha = dpInstance.fecha;
			dpInstance.close();
			
		};
		
		this.btnOK = document.createElement("div");
		this.btnOK.className = "orzk-dp_button";
		this.btnOK.appendChild(document.createTextNode(this.lang[this.language].btnok));
		this.btnOK.onclick = function(){		
			dpInstance.fecha = new Date(dpInstance.nuevaFecha.getTime());		
			dpInstance.onSubmit(dpInstance.fecha);			
			dpInstance.close();		
		};
		
		btnContainer.appendChild(this.btnCancel);
		btnContainer.appendChild(this.btnOK);
		
		
		if(this.showTitle){
			this.dp.appendChild(this.titleContainer);
		}
		
		this.dp.appendChild(this.msgContainer);
		this.dp.appendChild(this.msgTxt);
		
		if(this.dpMode !== "time"){
			this.dp.appendChild(this.ymcontainer);
			if(this.display === "full"){
				this.dp.appendChild(this.dayWeek);	
				this.dp.appendChild(this.daySelected);
			}
		}
		if((this.dpMode !== "date") || this.dpMode === "time"){		
			this.dp.appendChild(this.timeTxt);
		}
		if(this.dpMode === "datetime"){
			this.dp.appendChild(dayhourContainer);
		}
		
		this.dp.appendChild(this.tableContainer);
		this.dp.appendChild(btnContainer);
		
		if(this.position === "attach"){		
			var arrow = document.createElement("div");
			arrow.className = "orzk-dp_arrow_attach";		
			this.contenedor.appendChild(arrow);
		}
		this.contenedor.appendChild(this.dp);	
		
		document.body.appendChild(this.contenedor);
		if(this.dpMode === "time"){
			this.dpCurrWindow = "time";
		}else{
			this.dpCurrWindow = "calendar";
		}
		this.updateDisplay();
		
		this.initialized = true;
	}

	
	updateDisplay (){	
		if(this.dpMode !== "time"){
			this.yearTxt.nodeValue = this.nuevaFecha.getFullYear();
			this.monthTxt.nodeValue = this.lang[this.language].month[this.nuevaFecha.getMonth()];
			if(this.dateInRange(this.nuevaFecha,"day") && !this.dateIsBlocked(this.nuevaFecha)){
				this.daySelectedTxt.nodeValue = this.nuevaFecha.getDate();
				this.dayWeekTxt.nodeValue = this.lang[this.language].day[(this.nuevaFecha.getDay()+6)%7];
			}else{
				this.daySelectedTxt.nodeValue = "--";
				this.dayWeekTxt.nodeValue = "-";
			}
			
			this.printCalendar();
			if(this.daySelectedTxt != null && this.daySelectedTxt.nodeValue !== "--"){			
				document.getElementById("datepicker_d_"+this.daySelectedTxt.nodeValue).className = "orzk-dp_calendar_day_selected";
			}		
		}
		if(this.dpMode !== "date"){
			this.updateTime(this.nuevaFecha);		
		}
		
		if(this.dpCurrWindow === "time"){		
			this.showTime();
		}
		
		if(this.dpMode === "time" || (this.dpMode !== "time" && (this.dateInRange(this.nuevaFecha,"day") && !this.dateIsBlocked(this.nuevaFecha))) ){
			this.btnOK.className = this.btnOK.className.replace(/\borzk-dp_invisible\b/,"");
		}else{
			if(this.btnOK.className.indexOf("orzk-dp_invisible") === -1){
				this.btnOK.className += " orzk-dp_invisible";
			}
		}		
		
		if(this.showMsg === true && (this.info.length >0 || this.error.length > 0 || this.warning.length > 0)){
			this.clearMsgContainer();		
			var icon;
			/*
			if(this.info.length > 0){
				
			}*/
			
			if(this.error.length>0){
				icon = document.createElement("div");
				icon.className = "orzk-dp_error_icon";
				icon.appendChild(document.createTextNode(this.error.length + " error"));
				this.msgContainer.appendChild(icon);			
				
				for(var i=0; i< this.error.length; i++){
					var msg = document.createElement("div");
					msg.className = "orzk-dp_msg_error";
					msg.appendChild(document.createTextNode(this.error[i]));
					this.msgTxt.appendChild(msg);
				}				
			}
			
			if(this.warning.length > 0){	
				icon = document.createElement("div");
				icon.className = "orzk-dp_warning_icon";
				icon.appendChild(document.createTextNode(this.warning.length + " warning"));
				this.msgContainer.appendChild(icon);	
				
				for(var i=0; i< this.warning.length; i++){
					var msg = document.createElement("div");
					msg.className = "orzk-dp_msg_warning";
					msg.appendChild(document.createTextNode(this.warning[i]));
					this.msgTxt.appendChild(msg);
				}
			}
			this.msgArrow = document.createElement("div");
			this.msgArrow.className = "orzk-dp_down";
			this.msgContainer.appendChild(this.msgArrow);
			this.msgContainer.className = this.msgContainer.className.replace(/\borzk-dp_hide\b/,"");	
		}
	}
	
	daysInMonth(){
		return 32 - new Date(this.nuevaFecha.getFullYear(),this.nuevaFecha.getMonth(),32).getDate();
	}
	
	firstDay (){
		var wd = new Date(this.nuevaFecha.getFullYear(),this.nuevaFecha.getMonth()).getDay();	
		return (wd +(7-this.startDay))%7;
	}
	
	clearCalendarContainer (){
		// Elimina los elementos anteriores
		while(this.calendarContainer.firstChild){
			this.calendarContainer.removeChild(this.calendarContainer.firstChild);
		}
	}
	
	clearTimeContainer (){
		// Elimina los elementos anteriores
		while(this.timeContainer.firstChild){
			this.timeContainer.removeChild(this.timeContainer.firstChild);
		}
	}

	clearMsgContainer (){	
		// Elimina los elementos anteriores
		while(this.msgContainer.firstChild){
			this.msgContainer.removeChild(this.msgContainer.firstChild);
		}
		while(this.msgTxt.firstChild){
			this.msgTxt.removeChild(this.msgTxt.firstChild);
		}		
	}

	printCalendar (){
		var dpInstance = this;
		this.clearCalendarContainer();
		
		this.calendar = document.createElement("table");
		this.calendar.className="orzk-dp_days";
		
		var week = document.createElement("tr");
		for(var i = 0; i< this.lang[this.language].day.length;i++){
			var day = document.createElement("th");
			day.appendChild(document.createTextNode(this.lang[this.language].dayShort[i]));
			day.id = "wd_"+i;
			week.appendChild(day);
		}
		this.calendar.appendChild(week);
		
		var first = this.firstDay();
		var numDays = this.daysInMonth();			
		var numWeeks = Math.ceil((first + numDays)/7);
		
		var currDate = null;
		var dayCount = 1;
		for(var i=0;i<numWeeks;i++){
			week = document.createElement("tr");
			for(var j=0; j<=6;j++){
				var day = document.createElement("td");
				if(	(i===0 && first > j) ||														//No imprime los días de la primera semana anteriores al día 1 del mes
					(i===numWeeks-1 && ((first+numDays)%7) > 0 && j >= ((first + numDays)%7))	// No imprime los días de la última semana posteriores al último día del mes
				){
					
				}else{						
					day.appendChild(document.createTextNode(dayCount));
					day.id = "datepicker_d_"+dayCount;
					
					currDate = new Date(this.nuevaFecha.getTime());
					currDate.setDate(dayCount);
					if( this.dateInRange(currDate,'day') && !this.dateIsBlocked(currDate) ){
						day.className = "orzk-dp_pickable";
						day.onclick = function(){
							var oldDaySelected = document.getElementById("datepicker_d_"+dpInstance.daySelectedTxt.nodeValue);
							if(oldDaySelected != null){
								oldDaySelected.className = oldDaySelected.className.replace(/\borzk-dp_calendar_day_selected\b/g,"");
							}
							
							dpInstance.nuevaFecha.setDate(this.id.substr(13));
							dpInstance.updateDisplay();
						};
					}else{
						day.className = "orzk-dp_not_pickable";
					}
					dayCount++;
				}
				week.appendChild(day);
			}
			this.calendar.appendChild(week);
		}
		
		this.calendarContainer.appendChild(this.calendar);
	}
	
	printMonthList (){
		var dpInstance = this;
		this.clearCalendarContainer();
		
		this.monthList = document.createElement("table");
		this.monthList.className = "orzk-dp_days";
		this.monthList.id = "dp-month-list";
		for(var i = 0; i < 4;i++){
			var row = document.createElement("tr");
			for(var j = 0; j < 3; j++){
				let currMonth = i*3 + j;
				var element = document.createElement("td");				
				element.appendChild(document.createTextNode(this.lang[this.language].monthShort[currMonth]));
				if(currMonth === this.nuevaFecha.getMonth()){
					element.className = "orzk-dp_calendar_day_selected";
				}
				element.id = "datepicker_m_"+currMonth;
				var currDate = new Date(this.nuevaFecha.getTime());
				currDate.setMonth(currMonth);
				
				if(this.dateInRange(currDate,'month')){
					element.className += " orzk-dp_pickable";
					element.onclick = function(){				
						dpInstance.nuevaFecha.setMonth(currMonth);				
						dpInstance.updateDisplay();
					};
				}else{
					element.className = "orzk-dp_not_pickable";
				}
				row.appendChild(element);
			}
			this.monthList.appendChild(row);
		}
		
		this.calendarContainer.appendChild(this.monthList);
	}
	
	printYearList (decade){
		var dpInstance = this;
		this.clearCalendarContainer();
		
		var decades = Math.floor(this.nuevaFecha.getFullYear() / 20);
		// Removes the effect of rounding with Math.floor, that caused to show the next twenty years block when the year is multiple of 20.
		if(this.nuevaFecha.getFullYear() % 20 === 0){
			decades--;
		}
		this.decadeShift = this.decadeShift + decade;
		
		var minYear = (decades + this.decadeShift) * 20 + 1;
		var currYear = minYear;		
		
		this.decadeListContainer = document.createElement("div");
		this.decadeListContainer.className = "orzk-dp_decade_list_container";
		this.decadeList = document.createElement("div");
		this.decadeList.className = "orzk-dp_decade_list";
		var decadeListTxt = document.createTextNode(minYear + " - " + (minYear+19));
		this.decadeList.appendChild(decadeListTxt);
		
		var decadePrev = document.createElement("div");
		decadePrev.className = "orzk-dp_arrow orzk-dp_left";	
		decadePrev.id = "dp_decade_prev";
		decadePrev.onclick = function() {
			dpInstance.printYearList(-1);
		};	
		
		var decadeNext = document.createElement("div");
		decadeNext.className = "orzk-dp_arrow orzk-dp_right";	
		decadeNext.id = "dp_decade_next";		
		decadeNext.onclick = function() {
			dpInstance.printYearList(1);
		};
		this.decadeListContainer.appendChild(decadePrev);
		this.decadeListContainer.appendChild(this.decadeList);
		this.decadeListContainer.appendChild(decadeNext);
		
		this.yearList = document.createElement("table");
		this.yearList.className = "orzk-dp_days";
		this.yearList.id = "dp-year-list";
		for(var i = 0; i < 5; i++){
			var row = document.createElement("tr");
			for(var j=0; j<4;j++){
				var element = document.createElement("td");
				element.appendChild(document.createTextNode(currYear));
				var tmp = new Date(this.nuevaFecha.getTime());
				tmp.setFullYear(currYear);
				if(this.dateInRange(tmp,"year")){
					element.className = "orzk-dp_pickable";
					if(currYear === this.nuevaFecha.getFullYear()){
						element.className += " orzk-dp_calendar_day_selected";
					}				
					element.id = "datepicker_y_"+currYear;
					element.onclick = function(){					
						dpInstance.nuevaFecha.setFullYear(this.id.substr(13));
						dpInstance.decadeShift = 0;
						dpInstance.updateDisplay();
					};
				}else{
					element.className += " orzk-dp_not_pickable";
				}
				currYear++;
				row.appendChild(element);
			}
			this.yearList.appendChild(row);
		}
		
		this.calendarContainer.appendChild(this.decadeListContainer);
		this.calendarContainer.appendChild(this.yearList);
			
	}


	printAnalogTime (type){	
		var dpInstance = this;
		
		var pos = this.timeContainer.getBoundingClientRect();		
		var radius = 110;
		var sradius = 70;
		var centerX = (pos.right - pos.left)/2 - radius - 15;
		var scenterX = (pos.right - pos.left)/2 - sradius - 15;
		var angle = 360 / 12;
		var selectedItem = null;
		
		var pTop, pLeft;
		
		
		this.clearTimeContainer();	
		this.hideClockHand(this.clockHand);
		
		if(type === "hour"){			
			selectedItem = this.nuevaFecha.getHours();
			for(var i = 0; i< 12; i++){
				// 12h
				var h = document.createElement("div");
				h.className = "orzk-dp_time_element";			
				h.appendChild(document.createTextNode(i+1));
				h.id = "dp_hourelement_"+(i+1);
				pTop = (10 + radius + -radius*Math.cos((i+1)*(angle/180)*Math.PI));
				pLeft = (centerX + radius + radius*Math.sin((i+1)*(angle/180)*Math.PI));
				h.style.top = pTop+'px';
				h.style.left = pLeft+'px';
				
				if(selectedItem === i+1){
					h.className += " orzk-dp_time_item_selected";
					this.drawClockHand(this.clockHandSelected,pLeft+15,pTop+15);
				}
				h.onmouseover = function (e){
					var pos = this.getBoundingClientRect();
					var dims = dpInstance.timeContainer.getBoundingClientRect();
					var x = (pos.left - dims.left) +((pos.right-pos.left)/2)   ;
					var y = pos.top-dims.top + ((pos.bottom-pos.top)/2);
					
					dpInstance.drawClockHand(dpInstance.clockHand, x,y);
					var tmpFecha = new Date(dpInstance.nuevaFecha.getTime());					
					tmpFecha.setHours(this.id.substr(15));				
					dpInstance.updateTime(tmpFecha);
				};
				h.onmouseout = function(e){
					dpInstance.hideClockHand(dpInstance.clockHand);
					dpInstance.updateTime(dpInstance.nuevaFecha);
				};
				h.onclick = function(){
					dpInstance.nuevaFecha.setHours(this.id.substr(15));					
					if(dpInstance.timeFormat === 'hm' || dpInstance.timeFormat === 'hms'){					
						dpInstance.timeWindow = "minutes";				
						dpInstance.printAnalogTime("minutes");
					}else{
						dpInstance.printAnalogTime("hour");
					}
					dpInstance.updateDisplay();				
				};
				this.timeContainer.appendChild(h);
				
				// 24h
				h = document.createElement("div");
				h.className = "orzk-dp_time_element";
				var value = i+13;
				if(value === 24)
					value = 0;
				
				h.appendChild(document.createTextNode(this.padInteger(value,2)));
				h.id = "dp_hourelement_"+(value);
				pTop = (50 + sradius + -sradius*Math.cos((i+1)*(angle/180)*Math.PI));				
				pLeft = (scenterX + sradius + sradius*Math.sin((i+1)*(angle/180)*Math.PI));
				h.style.top = pTop+'px';
				h.style.left = pLeft+'px';
				if(selectedItem === value){
					h.className += " orzk-dp_time_item_selected";
					this.drawClockHand(this.clockHandSelected,pLeft+15,pTop+15);
				}
				h.onmouseover = function (){
					var pos = this.getBoundingClientRect();
					var dims = dpInstance.timeContainer.getBoundingClientRect();
					var x = (pos.left - dims.left) +((pos.right-pos.left)/2)   ;
					var y = pos.top-dims.top + ((pos.bottom-pos.top)/2);
					
					dpInstance.drawClockHand(dpInstance.clockHand, x,y);
					var tmpFecha = new Date(dpInstance.nuevaFecha.getTime());					
					tmpFecha.setHours(this.id.substr(15));				
					dpInstance.updateTime(tmpFecha);
				};
				h.onmouseout = function(e){
					dpInstance.hideClockHand(dpInstance.clockHand);
					dpInstance.updateTime(dpInstance.nuevaFecha);
				};
				h.onclick = function(){
					dpInstance.nuevaFecha.setHours(this.id.substr(15));				
					if(dpInstance.timeFormat === 'hm' || dpInstance.timeFormat === 'hms'){
						dpInstance.timeWindow = "minutes";				
						dpInstance.printAnalogTime("minutes");
					}else{
						dpInstance.printAnalogTime("hour");
					}
					
					dpInstance.updateDisplay();
				};
				this.timeContainer.appendChild(h);
			}
			
		}else{
			
			if(type==="minutes"){
				selectedItem = this.nuevaFecha.getMinutes();
			}else if(type==="seconds"){
				selectedItem = this.nuevaFecha.getSeconds();
			}			
			
			for(var i = 0; i< 60; i++){
				angle = 360/60;	
				var e = document.createElement("div");
				e.className = "orzk-dp_time_min_element";
				e.id = "dp_minuteelement_"+(i);
				e.style.webkitTransform = 'rotate('+(angle*i)+'deg)'; 
				e.style.mozTransform    = 'rotate('+(angle*i)+'deg)'; 
				e.style.msTransform     = 'rotate('+(angle*i)+'deg)'; 
				e.style.oTransform      = 'rotate('+(angle*i)+'deg)'; 
				e.style.transform       = 'rotate('+(angle*i)+'deg)'; 
				
				if(i%5 === 0){
					var h = document.createElement("div");
					h.id = "dp_minute_"+(i);
					h.className = "orzk-dp_time_element";				
					h.appendChild(document.createTextNode(this.padInteger(i,2)));	
					pTop = (10 + radius + -radius*Math.cos((i)*(angle/180)*Math.PI));				
					pLeft = (centerX + radius + radius*Math.sin((i)*(angle/180)*Math.PI));
					if(selectedItem === i){
						h.className += " orzk-dp_time_item_selected";					
					}
					h.style.top = pTop+'px';
					h.style.left = pLeft+'px';				
					
					this.timeContainer.appendChild(h);
				}			
				
				pTop = (5 + radius + -radius*Math.cos((i)*(angle/180)*Math.PI));				
				pLeft = (centerX + 10 + radius + radius*Math.sin((i)*(angle/180)*Math.PI));
				if(selectedItem === i){				
					this.drawClockHand(this.clockHandSelected,pLeft+5,pTop+20);
				}
				
				e.style.top = pTop+'px';
				e.style.left = pLeft+'px';
				e.onmouseover = function (){
					var pos = this.getBoundingClientRect();
					var dims = dpInstance.timeContainer.getBoundingClientRect();
					var x = (pos.left - dims.left) +((pos.right-pos.left)/2)   ;
					var y = pos.top-dims.top + ((pos.bottom-pos.top)/2);
					
					dpInstance.drawClockHand(dpInstance.clockHand, x,y);
					
					var tmpFecha = new Date(dpInstance.nuevaFecha.getTime());
					if(type==="minutes"){
						tmpFecha.setMinutes(this.id.substr(17));
					}else if(type==="seconds"){
						tmpFecha.setSeconds(this.id.substr(17));
					}
					dpInstance.updateTime(tmpFecha);
				};
				e.onmouseout = function(e){
					dpInstance.hideClockHand(dpInstance.clockHand);	
					dpInstance.updateTime(dpInstance.nuevaFecha);
				};
				e.onclick = function(){
					var id = this.id.substr(17);
					if(dpInstance.timeFormat === 'hm'){
						dpInstance.nuevaFecha.setMinutes(id);
						dpInstance.timeWindow = "hour";
						dpInstance.printAnalogTime("hour");
					}else if(dpInstance.timeFormat === 'hms'){					
					
						if(type==="minutes"){
							dpInstance.nuevaFecha.setMinutes(id);
							dpInstance.timeWindow = "seconds";
							dpInstance.printAnalogTime("seconds");
						}else if(type==="seconds"){
							dpInstance.nuevaFecha.setSeconds(id);
							dpInstance.timeWindow = "hour";
							dpInstance.printAnalogTime("hour");
						}
					}					
					dpInstance.updateDisplay();
										
				};
				this.timeMinutesContainer.appendChild(e);
				this.timeContainer.appendChild(this.timeMinutesContainer);
			}
		}
	}

	drawClockHand (line,x2,y2){
		var dims = this.timeContainer.getBoundingClientRect();
		
		this.analogClockSVG.setAttribute('width',dims.right - dims.left);
		this.analogClockSVG.setAttribute('height',dims.bottom - dims.top);	
		
		var x1 = (dims.right - dims.left)/2;
		var y1 = ((dims.bottom - dims.top)/2)+5;
		
		line.setAttribute('x1',x1);
		line.setAttribute('y1',y1);
		line.setAttribute('x2',x2);
		line.setAttribute('y2',y2);
		line.setAttribute('stroke','#8bb6cf');
		line.setAttribute('stroke-width', 4);
	}

	hideClockHand (line){
		line.setAttribute('stroke-width',0);
	}

	close (){
		this.initialized = false;
		this.contenedor.parentNode.removeChild(this.contenedor);
	}
	
	printDate (){	
		if(this.inputDate != null && this.showDate === true){
			this.inputDate.value = this.getFullDateString();
		}else{
		}
	}

	getFullDateString (){	
		if(this.dpMode === 'date'){
			return this.getDateString(this.fecha);
		}else if(this.dpMode === 'time'){				
			return this.getTimeString(this.fecha);
		}else{
			return (this.getDateString(this.fecha)+" "+this.getTimeString(this.fecha));									
		}		
	}
	
	showCalendar (){	
		if((this.dpMode === "datetime" && this.dpCurrWindow === "time") || this.dpMode === "date"){
			if(this.dpMode === "datetime"){
				this.timeContainer.className += " orzk-dp_hide";
				this.analogClockSVG.setAttribute('class','orzk-dp_clock_svg orzk-dp_hide');
				this.btnHour.className = this.btnHour.className.replace(/\borzk-dp_dayhour_button_selected\b/,"");
				this.btnCalendar.className += " orzk-dp_dayhour_button_selected";
			}
			this.calendarContainer.className = this.calendarContainer.className.replace(/\borzk-dp_hide\b/,"");
			this.dpCurrWindow = "calendar";
			//this.updateTime(this.nuevaFecha);
			this.updateDisplay();
		}
	}

	showTime (){
		if((this.dpMode === "datetime" && this.dpCurrWindow === "calendar") || (this.dpMode === "time")){
			if(this.dpMode === "datetime"){
				this.calendarContainer.className += " orzk-dp_hide";
				this.btnCalendar.className = this.btnCalendar.className.replace(/\borzk-dp_dayhour_button_selected\b/,"");
				this.btnHour.className += " orzk-dp_dayhour_button_selected";
			}
			this.timeContainer.className = this.timeContainer.className.replace(/\borzk-dp_hide\b/,"");		
			this.analogClockSVG.setAttribute('class','orzk-dp_clock_svg');
			if(this.dpMode === 'datetime'){
				this.timeWindow = "hour";
				this.printAnalogTime("hour");
			}else{
				this.printAnalogTime(this.timeWindow);
			}
			this.dpCurrWindow = "time";
			this.updateTime(this.nuevaFecha);
		}
	}

	getDateString (d){
		var sep = this.dateFormat.substr(3);
		var year = d.getFullYear();
		var month = this.padInteger(d.getMonth()+1,2);
		var day = this.padInteger(d.getDate(),2);
		
		switch(this.dateFormat.substr(0,3)){
			case "ymd":
				return year+sep+month+sep+day;
			case "ydm":
				return year+sep+day+sep+month;
			case "mdy":
				return month+sep+day+sep+year;
			case "dmy":
				return day+sep+month+sep+year;
			default:
				return false;
		}
	}	

	getTimeString (d,format=false){
		var time = '';
		switch (this.timeFormat.length){		
			case 3:
				if(format===true && this.dpCurrWindow === "time" && this.timeWindow==="seconds"){
					time = ':<span class="orzk-dp_time_display_selected">'+this.padInteger(d.getSeconds(),2)+'</span>';
				}else{				
					time = ':'+this.padInteger(d.getSeconds(),2);
				}
			case 2:
				if(format===true && this.dpCurrWindow === "time" && this.timeWindow==="minutes"){
					time = ':<span class="orzk-dp_time_display_selected">'+this.padInteger(d.getMinutes(),2)+'</span>' + time;
				}else{		
					time = ':'+this.padInteger(d.getMinutes(),2) + time;
				}
			case 1:
				if(this.timeFormat === 'h'){
					time += ":00";
				}
				if(format===true && this.dpCurrWindow === "time" && this.timeWindow==="hour"){
					time = '<span class="orzk-dp_time_display_selected">'+this.padInteger(d.getHours(),2)+'</span>'	+ time;
				}else{		
					time = this.padInteger(d.getHours(),2) + time;
				}
		}
		return time;
	}

	updateTime (d){	
		this.timeTxt.innerHTML = this.getTimeString(d,true);	
	}

	getDate (){
		if(this.fecha !== null){
			return new Date(this.fecha.getTime());
		}else{
			return null;
		}
	}

	createDate (d){
		if(this.isDate(d)){
			return d;
		}else{		
			if(typeof(d) === 'string'){
				var sep = this.dateFormat.substr(3);			
				var fecha = [];
				var hora = [];
				
				if(this.dpMode === 'date'){
					fecha = d.split(sep);
					if(fecha.length !== 3){
						return false;
					}
					hora = [0,0,0,0];
				}else if(this.dpMode === 'datetime'){
					var fh = d.split(" ");
					if(fh.length > 2){
						return false;
					}
					fecha = fh[0].split(sep);
					if(fh.length === 2){
						hora = fh[1].split(":");
					}
					
					if(fecha.length !== 3){
						return false;
					}
					for(var i = 0; i< 4; i++){
						if(typeof(hora[i]) == "undefined" || this.timeFormat.length <= i){
							hora.push(0);
						}
					}
				}else{
					fecha = new Date();
					hora = d.split(":");
					
					for(var i = 0; i< 4; i++){
						if(typeof(hora[i]) == "undefined" || this.timeFormat.length <= i){
							hora.push(0);
						}
					}
					fecha.setHours(hora[0],hora[1],hora[2],hora[3]);				
					return fecha;
					
				}			
				
				switch(this.dateFormat.substr(0,3)){
					case "ymd":					
						return new Date(fecha[0],fecha[1]-1,fecha[2],hora[0],hora[1],hora[2],hora[3]);
					case "ydm":
						return new Date(fecha[0],fecha[2]-1,fecha[1],hora[0],hora[1],hora[2],hora[3]);
					case "dmy":					
						return new Date(fecha[2],fecha[1]-1,fecha[0],hora[0],hora[1],hora[2],hora[3]);
					case "mdy":					
						return new Date(fecha[2],fecha[0]-1,fecha[1],hora[0],hora[1],hora[2],hora[3]);
					default:
						return false;
				}
			}else{
				return false;
			}
		}
	}

	setStartDate (){
		var result = new Date();
		
		if(this.inputDate !== null){			
			if(this.inputDate.value.length > 0){
				var result = this.createDate(this.inputDate.value);				
				if(result !== false){
					if(!this.isDate(result)){
						result = new Date();					
					}
				}else{
					this.error.push(this.lang[this.language].errDateFormat);
				}
						
			}
		}	
		
		return result;
	}

	setDate (d){
		if(this.isDate(d)){
			this.fecha = new Date(d.getTime());
			return true;
		}else{
			return false;
		}
	}

	onSubmit (){
		this.printDate();
	}

	padInteger (number,max){
		if(number < Math.pow(10,(max-1))){
			var z = '';
			for(var i = 0;i< max; i++)
				z += '0';
			number = (z + number).slice(max*-1);
		}
		return number;
	}

	rad2deg (x){
		return x * (180/Math.PI);
	}

	deg2rad (x){
		return x * (Math.PI/180);
	};


	// Checks if a date object contains is a valid date
	isDate (date) {
		return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
	};

	// Checks if a date is allowed comparing it with the min and max dates, and the restricted dates list
	dateInRange (date,type){
		
		if(type === "year"){			
			if(	(this.minDate == null || (this.minDate.getFullYear() <= date.getFullYear()) ) &&
				(this.maxDate == null || (this.maxDate.getFullYear() >= date.getFullYear()) ) ){				
					return true;
			}else{			
				return false;
			}
			
		}
		if(type === 'month'){		
			
			var tmpdate = new Date(date.getFullYear(),date.getMonth());
			var tmpmindate = null;
			var tmpmaxdate = null;
			
			if(this.minDate !== null)		
				tmpmindate = new Date(this.minDate.getFullYear(),this.minDate.getMonth());
			
			if(this.maxDate !== null)
				tmpmaxdate = new Date(this.maxDate.getFullYear(),this.maxDate.getMonth());
			
			if( (tmpmindate === null || (tmpdate >= tmpmindate)) &&
				(tmpmaxdate === null || (tmpdate <= tmpmaxdate)) )
			{
				return true;
			}else{
				return false;
			}		
			
		}
		if(type === 'day'){
			if( (this.minDate == null || (this.minDate != null && date >= this.minDate)) && 
				(this.maxDate == null || (this.maxDate != null && date <= this.maxDate)) )
			{			
				return true;
			}else{
				return false;
			}
		}
		
	}

	dateIsBlocked (date){
		// Checks if the date is one of the blocked days
		if(this.blockdays.length > 0 && this.blockdays.indexOf(date.getDay()) > -1){
			return true;
		}	
		
		var tmpdate = new Date(date.getTime());
		tmpdate.setHours(0,0,0,0);
		
		// Checks if the date is in the list of blocked dates
		for(var i = 0; i< this.blockDates.length; i++){
			if(this.blockDates[i].length === 1){			
				var tmp = this.blockDates[i][0];
				if (tmp.getFullYear() === date.getFullYear() &&
					tmp.getMonth() === date.getMonth() &&
					tmp.getDate() === date.getDate()){
					return true;
				}
			}else{
				
				if(tmpdate.getTime() >= this.blockDates[i][0].getTime() && (tmpdate.getTime() <= this.blockDates[i][1].getTime())){	
					return true;
				}
			}
		}
		
		return false;
	}
}

/* Exports public methods for Google Closure Compiler */
/*
window['Datepicker'] = Datepicker;
Datepicker.prototype['show'] = Datepicker.prototype.show;
Datepicker.prototype['reset'] = Datepicker.prototype.reset;
Datepicker.prototype['close'] = Datepicker.prototype.close;
Datepicker.prototype['setOptions'] = Datepicker.prototype.setOptions;
Datepicker.prototype['getDate']	= Datepicker.prototype.getDate;
Datepicker.prototype['setDate']	= Datepicker.prototype.setDate;	
Datepicker.prototype['setStartDate']	= Datepicker.prototype.setStartDate;	
Datepicker.prototype['printDate'] =	Datepicker.prototype.printDate;
Datepicker.prototype['onSubmit'] = Datepicker.prototype.onSubmit;
Datepicker.prototype['getFullDateString'] = Datepicker.prototype.getFullDateString;
Datepicker.prototype['isDate'] = Datepicker.prototype.isDate;*/
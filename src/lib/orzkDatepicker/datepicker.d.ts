export class Datepicker {
    initialized: boolean	
	_version: string	
	defOptions: any;
	dpMode: string;	
	inputDate: any;
	showDate: boolean;
	language: string;
	startDay: number;	
	minDate: Date | null;
	maxDate: Date | null
	showTitle: boolean
	blockdays: Array<any>
	display: string
	showMsg: boolean
	blockDates: Array<Date>
	dateFormat: string
	timeFormat: string
	position: string	
	error: Array<string>
	warning: Array<string>
    info: Array<string>
    constructor(dateField?, type?, options?): any
    setOptions(options: any): void
    reset(): void
    show(): void
    updateDisplay(): void
    daysInMonth(): number
    firstDay(): number
    clearCalendarContainer(): void
    clearTimeContainer(): void
    clearMsgContainer(): void
    printCalendar(): void
    printMonthList(): void
    printYearList(): void
    printAnalogTime(): void
    drawClockHand(): void
    hideClockHand(): void
    close(): void
    printDate(): void
    getFullDateString(): string
    showCalendar(): void
    showTime(): void
    getDateString(d: Date): string | boolean
    getTimeString(d: Date): string
    updateTime(d: Date): void
    getDate(): Date | null
    createDate(d: Date | string): Date | boolean
    setStartDate(): Date
    setDate(d: Date): boolean
    onSubmit(d: Date): void
    padInteger(number: number, max: number): string
    rad2deg(x: number): number
    deg2rad(x: number): number
    isDate(d: Date): boolean
    dateInRange(d: Date, type: string): boolean | undefined
    dateIsBlocked(d: Date): boolean
}
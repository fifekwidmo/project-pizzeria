import { select, templates, classNames, settings } from '/js/settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '/js/utils.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
export class Booking {
    constructor(container) {
        const thisBooking = this;
        thisBooking.render(container);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.initActions();
    }
    getData() {
        const thisBooking = this;
        thisBooking.selectedTable;
        thisBooking.date = this.datePicker.value;
        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.datePicker.minDate);
        const endDateparam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.datePicker.maxDate);
        const params = {
            booking: [
                startDateParam,
                endDateparam,
            ],
            eventCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateparam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateparam,
            ],
        };
        const urls = {
            booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
            eventCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
        };
        Promise.all([
                fetch(urls.booking),
                fetch(urls.eventCurrent),
                fetch(urls.eventsRepeat),
            ])
            .then(allResponse => {
                const bookingsResponse = allResponse[0];
                const eventCurrentResponse = allResponse[1];
                const eventsRepeatResponse = allResponse[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(allResponse => {
                const [bookings, eventCurrent, eventsRepeat] = allResponse;
                this.parseData(bookings, eventCurrent, eventsRepeat);
            });
    }
    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this;
        thisBooking.booked = {};
        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;
        for (let eventCurrent of eventsCurrent) {
            thisBooking.makeBooked(eventCurrent.date, eventCurrent.hour, eventCurrent.duration, eventCurrent.table);
        }
        for (let booking of bookings) {
            thisBooking.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
        }
        for (let eventRepeat of eventsRepeat) {
            if (eventRepeat.repeat == 'daily') {
                for (let dayStart = minDate; dayStart <= maxDate; dayStart = utils.addDays(dayStart, 1)) {
                    thisBooking.makeBooked(utils.dateToStr(dayStart), eventRepeat.hour, eventRepeat.duration, eventRepeat.table);
                }
            }
        }
        thisBooking.updateDOM();
    }
    makeBooked(date, hour, duration, table) {
        const thisBooking = this;
        const startHour = utils.hourToNumber(hour);
        if (typeof thisBooking.booked[date] == 'undefined') {
            thisBooking.booked[date] = {};
        }
        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock = hourBlock + 0.5) {
            if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }
            thisBooking.booked[date][hourBlock].push(table);
        }
    }
    updateDOM() {
        const thisBooking = this;
        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
        for (let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }
            if (
                typeof thisBooking.booked[thisBooking.date] !== 'undefined' &&
                typeof thisBooking.booked[thisBooking.date][thisBooking.hour] !== 'undefined' &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ) {
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
        const openHour = 12;
        const endHour = 24;
        const midnight = 0;
        const half = .5;
        let slider = document.getElementsByClassName('rangeSlider')[0];
        let color = '';
        for (let index = openHour; index <= endHour; index = index + half) {
            let hour = index;
            if (hour === endHour) {
                hour = midnight;
            }
            let tables = 0;
            if (
                typeof thisBooking.booked[thisBooking.date] === 'undefined' ||
                typeof thisBooking.booked[thisBooking.date][hour] === 'undefined'
            ) {
                tables = 0;
            } else {
                tables = thisBooking.booked[thisBooking.date][hour].length;
            }
            if (tables === 0) {
                color = color + ', #78e08f ';
            } else if (tables === 1) {
                color = color + ', yellow ';
            } else if (tables === 2) {
                color = color + ', orange ';
            } else {
                color = color + ', red ';
            }
        }
        let newColor = 'linear-gradient(to right' + color + ')';
        slider.style.backgroundImage = newColor;
        // console.log(newColor);
    }
    render(paramElem) {
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {};
        thisBooking.dom.wrapper = paramElem;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    }
    initWidgets() {
        const thisBooking = this;
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
        thisBooking.dom.wrapper.addEventListener('updated', function() {
            thisBooking.updateDOM();
        });
    }
    initActions() {
        const thisBooking = this;
        let nameTable;
        for (let table of thisBooking.dom.tables) {
            table.addEventListener('click', function() {
                table.classList.add(classNames.booking.tableBooked);
                nameTable = table.innerHTML.slice(6, 7);
                thisBooking.selectedTable = parseInt(nameTable);
            });
        }
        thisBooking.dom.form.addEventListener('submit', function(event) {
            event.preventDefault();
            thisBooking.sendBooking();
        });
    }
    sendBooking() {
        const thisBooking = this;
        const url = settings.db.url + '/' + settings.db.booking;
        const payload = {
            date: thisBooking.datePicker.value,
            table: thisBooking.selectedTable,
            hour: thisBooking.hourPicker.value,
            repeat: false,
            duration: thisBooking.hoursAmount.value,
            ppl: thisBooking.peopleAmount.value
        };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };
        fetch(url, options)
            .then(function(response) {
                return response.json();
            })
            .then(function(parsedResponse) {
                console.log('parsedresponse', parsedResponse);
            });

        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
    }
}
export default Booking;
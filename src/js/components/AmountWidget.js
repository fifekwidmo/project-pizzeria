import { select, settings } from '/js/settings.js';

class AmountWidget {
    constructor(element) {
        const thisWidget = this;
        thisWidget.value = settings.amountWidget.defaultValue;
        thisWidget.getElements(element);
        thisWidget.setValue(thisWidget.input.value);
        thisWidget.initActions();
    }
    getElements(element) {
        const thisWidget = this;
        thisWidget.element = element;
        thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
        thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
        const thisWidget = this;
        const newValue = parseInt(value);
        if (newValue != thisWidget.value &&
            newValue >= settings.amountWidget.defaultMin &&
            newValue <= settings.amountWidget.defaultMax) {
            thisWidget.value = newValue;
            thisWidget.announce();
        }
        thisWidget.input.value = thisWidget.value;
    }
    initActions() {
        const thisWidget = this;
        thisWidget.input.addEventListener('change', function() {
            thisWidget.setValue(thisWidget.input.value);
        });
        thisWidget.linkDecrease.addEventListener('click', function() {
            thisWidget.setValue(thisWidget.value - 1);
            event.preventDefault();
        });
        thisWidget.linkIncrease.addEventListener('click', function() {
            thisWidget.setValue(thisWidget.value + 1);
            event.preventDefault();
        });
    }
    announce() {
        const thisWidget = this;
        const event = new Event('updated', {
            bubbles: true
        });
        thisWidget.element.dispatchEvent(event);
    }
}
export default AmountWidget;
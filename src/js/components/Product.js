import { select, classNames, templates } from '/js/settings.js';
import utils from '/js/utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
    constructor(id, data) {
        const thisProduct = this;
        thisProduct.id = id;
        thisProduct.data = data;
        thisProduct.readerInMenu();
        thisProduct.getElements();
        thisProduct.initAccordion();
        thisProduct.initOrderForm();
        thisProduct.initAmountWidget();
        thisProduct.processOrder();
    }
    readerInMenu() {
        const thisProduct = this;
        const generatedHTML = templates.menuProduct(thisProduct.data);
        thisProduct.element = utils.createDOMFromHTML(generatedHTML);
        const menuContainer = document.querySelector(select.containerOf.menu);
        menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
        const thisProduct = this;
        thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
        thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
        thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
        thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
        thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
        thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    }
    initAccordion() {
        const thisProduct = this;
        let clicked = thisProduct.accordionTrigger;
        clicked.addEventListener('click', function(event) {
            event.preventDefault();
            thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
            let allActiveProducts = document.querySelectorAll(select.all.menuProducts);
            for (let activeProduct of allActiveProducts) {
                if (activeProduct != thisProduct.element) {
                    activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
                }
            }
        });
    }
    initOrderForm() {
        const thisProduct = this;
        thisProduct.form.addEventListener('submit', function(event) {
            event.preventDefault();
            thisProduct.processOrder();
        });
        for (let input of thisProduct.formInputs) {
            input.addEventListener('change', function() {
                thisProduct.processOrder();
            });
        }
        thisProduct.cartButton.addEventListener('click', function(event) {
            event.preventDefault();
            thisProduct.processOrder();
            thisProduct.addToCart();
        });
    }
    initAmountWidget() {
        const thisProduct = this;
        thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
        thisProduct.amountWidgetElem.addEventListener('updated', function() {
            thisProduct.processOrder();
        });
    }
    processOrder() {
        const thisProduct = this;
        const formData = utils.serializeFormToObject(thisProduct.form);
        thisProduct.params = {};
        let price = thisProduct.data.price;
        for (let paramId in thisProduct.data.params) {
            const param = thisProduct.data.params[paramId];
            for (let optionId in param.options) {
                const option = param.options[optionId];
                const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
                if (!option.default && optionSelected) {
                    price = price + option.price;
                } else if (!optionSelected && option.default) {
                    price = price - option.price;
                }
                const imageSelectors = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
                if (optionSelected) {
                    if (!thisProduct.params[paramId]) {
                        thisProduct.params[paramId] = {
                            label: param.label,
                            options: {},
                        };
                    }
                    thisProduct.params[paramId].options[optionId] = option.label;
                    for (let imageSelector of imageSelectors) {
                        imageSelector.classList.add('active');
                    }
                } else {
                    for (let imageSelector of imageSelectors) {
                        imageSelector.classList.remove('active');
                    }
                }
            }
        }
        thisProduct.priceSingle = price;
        thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
        thisProduct.priceElem.innerHTML = thisProduct.price;
    }
    addToCart() {
        const thisProduct = this;
        thisProduct.name = thisProduct.data.name;
        thisProduct.amount = thisProduct.amountWidget.value;
        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct,
            }
        });
        thisProduct.element.dispatchEvent(event);
    }
}
export default Product;
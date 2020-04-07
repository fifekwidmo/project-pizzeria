import { select, settings, classNames, templates } from '/js/settings.js';
import utils from '/js/utils.js';
import CartProduct from './CartProduct.js';

class Cart {
    constructor(element) {
        const thisCart = this;
        thisCart.products = [];
        thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.getElements(element);
        thisCart.initActions();
    }
    getElements(element) {
        const thisCart = this;
        thisCart.dom = {};
        thisCart.dom.wrapper = element;
        thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
        thisCart.dom.productList = document.querySelector(select.cart.productList);
        //added line task4
        thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
        //added line task4
        thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
        thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
        console.log(thisCart.dom.phone, thisCart.dom.address);
        // console.log(thisCart.dom.toggleTrigger);
        // new Array
        thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
        for (let key of thisCart.renderTotalsKeys) {
            thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
        }
    }
    update() {
        const thisCart = this;
        thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.totalNumber = 0;
        thisCart.subtotalPrice = 0;
        for (const product of thisCart.products) {
            thisCart.subtotalPrice = thisCart.subtotalPrice + product.price;
            thisCart.totalNumber = thisCart.totalNumber + product.amount;
        }
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
        for (let key of thisCart.renderTotalsKeys) {
            for (let elem of thisCart.dom[key]) {
                elem.innerHTML = thisCart[key];
            }
        }
    }
    initActions() {
        const thisCart = this;
        thisCart.dom.toggleTrigger.addEventListener('click', function() {
            thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });
        thisCart.dom.productList.addEventListener('updated', function() {
            thisCart.update();
        });
        thisCart.dom.productList.addEventListener('remove', function() {
            thisCart.remove(event.detail.cartProduct);
        });
        thisCart.dom.form.addEventListener('submit', function() {
            event.preventDefault();
            thisCart.sendOrder();
        });
    }
    sendOrder() {
        const thisCart = this;
        const url = settings.db.url + '/' + settings.db.order;
        const payload = {
            address: thisCart.dom.address.value,
            phone: thisCart.dom.phone.value,
            totalPrice: thisCart.totalPrice,
            totalNumber: thisCart.totalNumber,
            subtotalPrice: thisCart.subtotalPrice,
            deliveryFee: thisCart.deliveryFee,
            products: [],
        };
        for (const product of thisCart.products) {
            payload.products.push(product.getData());
        }
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
            }).then(function(parsedResponse) {
                console.log('parsedResponse', parsedResponse);
            });
    }
    add(menuProduct) {
        const thisCart = this;
        const generatedHTML = templates.cartProduct(menuProduct);
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        thisCart.dom.productList.appendChild(generatedDOM);
        thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
        thisCart.update();
    }
    remove(cartProduct) {
        const thisCart = this;
        const index = thisCart.products.indexOf(cartProduct);
        thisCart.products.splice(index, 1);
        console.log(cartProduct.dom.wrapper);
        console.log(thisCart.dom.productList);
        thisCart.dom.productList.removeChild(cartProduct.dom.wrapper);
        thisCart.update();
    }
}
export default Cart;
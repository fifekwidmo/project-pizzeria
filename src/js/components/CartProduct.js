import { select } from '/js/settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
    constructor(menuProduct, element) {
        const thisCartProduct = this;
        thisCartProduct.id = menuProduct.id;
        thisCartProduct.name = menuProduct.name;
        thisCartProduct.price = menuProduct.price;
        thisCartProduct.priceSingle = menuProduct.priceSingle;
        thisCartProduct.amount = menuProduct.amount;
        thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
        thisCartProduct.getElements(element);
        thisCartProduct.initAmountWidget();
        thisCartProduct.initActions();
        // console.log('new CartProduct', thisCartProduct);
        // console.log('productData', menuProduct);
    }
    getElements(element) {
        const thisCartProduct = this;
        thisCartProduct.dom = {};
        thisCartProduct.dom.wrapper = element;
        thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
        thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
        thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
        thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
    getData() {
        const thisCartProduct = this;
        return {
            id: thisCartProduct.id,
            amount: thisCartProduct.amount,
            price: thisCartProduct.price,
            singlePrice: thisCartProduct.singlePrice,
            params: thisCartProduct.params,
        };
    }
    initAmountWidget() {
        const thisCartProduct = this;
        thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
        thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
            // thisCartProduct.processOrder();
            thisCartProduct.amount = thisCartProduct.amountWidget.value;
            thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
            // potencjalny blad
            thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        });
    }

    initActions() {
        const thisCartProduct = this;
        thisCartProduct.dom.edit.addEventListener('click', function() {
            event.preventDefault();
        });
        thisCartProduct.dom.remove.addEventListener('click', function() {
            event.preventDefault();
            thisCartProduct.remove();
            console.log('remove');
        });
    }
    remove() {
        const thisCartProduct = this;
        const event = new CustomEvent('remove', {
            bubbles: true,
            detail: {
                cartProduct: thisCartProduct,
            }
        });
        thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
}

export default CartProduct;
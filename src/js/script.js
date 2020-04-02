/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
            cartProduct: '#template-cart-product',
        },
        containerOf: {
            menu: '#product-list',
            cart: '#cart',
        },
        all: {
            menuProducts: '#product-list > .product',
            menuProductsActive: '#product-list > .product.active',
            formInputs: 'input, select',
        },
        menuProduct: {
            clickable: '.product__header',
            form: '.product__order',
            priceElem: '.product__total-price .price',
            imageWrapper: '.product__images',
            amountWidget: '.widget-amount',
            cartButton: '[href="#add-to-cart"]',
        },
        widgets: {
            amount: {

                input: 'input.amount', // CODE CHANGED
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
        // CODE ADDED START
        cart: {
            productList: '.cart__order-summary',
            toggleTrigger: '.cart__summary',
            totalNumber: `.cart__total-number`,
            totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
            subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
            deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
            form: '.cart__order',
            formSubmit: '.cart__order [type="submit"]',
            phone: '[name="phone"]',
            address: '[name="address"]',
        },
        cartProduct: {
            amountWidget: '.widget-amount',
            price: '.cart__product-price',
            edit: '[href="#edit"]',
            remove: '[href="#remove"]',
        },
        // CODE ADDED END
    };


    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
        // CODE ADDED START
        cart: {
            wrapperActive: 'active',
        },
        // CODE ADDED END
    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        }, // CODE CHANGED
        // CODE ADDED START
        cart: {
            defaultDeliveryFee: 20,
        },
        // CODE ADDED END
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
        // CODE ADDED START
        cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
        // CODE ADDED END
    };

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
            // console.log('new Product:', thisProduct);
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
            let price = dataSource.products[thisProduct.id].price;
            for (let param in dataSource.products[thisProduct.id].params) {
                for (let option in dataSource.products[thisProduct.id].params[param].options) {
                    const img = this.imageWrapper.querySelector(`.${param}-${option}`);
                    if (img) {
                        img.classList.remove(classNames.menuProduct.imageVisible);
                    }
                    if (formData[param]) {
                        if (formData[param].includes(option) && img) {
                            img.classList.add(classNames.menuProduct.imageVisible);
                        }
                        // przed petla gdzie dodaje obrazek
                        if (!thisProduct.params[param]) {
                            thisProduct.params[param] = {
                                label: dataSource.products[this.id].params[param].label,
                                options: {},
                            };
                        }
                        thisProduct.params[param].options[option] = dataSource.products[this.id].params[param].options[option].label;
                        if (formData[param].includes(option) && !dataSource.products[thisProduct.id].params[param].options[option].default) {
                            price = price + dataSource.products[thisProduct.id].params[param].options[option].price;
                        } else if (!formData[param].includes(option) && dataSource.products[thisProduct.id].params[param].options[option].default) {
                            price = price - dataSource.products[thisProduct.id].params[param].options[option].price;
                        }
                    } else if (dataSource.products[thisProduct.id].params[param].options[option].default) {
                        price = price - dataSource.products[thisProduct.id].params[param].options[option].price;
                    }
                }
            }
            /*multiply price by amount*/
            thisProduct.priceSingle = price;
            thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
            /* set the contents of thisProduct.priceElem to be the value of variable price */
            thisProduct.priceElem.innerHTML = thisProduct.price;
            // console.log(thisProduct.params);
        }

        addToCart() {
            const thisProduct = this;
            thisProduct.name = thisProduct.data.name;
            thisProduct.amount = thisProduct.amountWidget.value;
            app.cart.add(thisProduct);
        }
    }
    class AmountWidget {
        constructor(element) {
            const thisWidget = this;
            thisWidget.value = settings.amountWidget.defaultValue;
            // console.log(thisWidget.value);
            thisWidget.getElements(element);
            thisWidget.setValue(thisWidget.input.value);
            thisWidget.initActions();
            // console.log('AmountWidget:', thisWidget);
            // console.log('AmountWidget:', element);
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

    class Cart {
        constructor(element) {
            const thisCart = this;
            thisCart.products = [];
            thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
            thisCart.getElements(element);
            // console.log('new Cart', thisCart);
            thisCart.initActions();
        }
        getElements(element) {
            const thisCart = this;
            thisCart.dom = {};
            thisCart.dom.wrapper = element;
            thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
            this.dom.productList = document.querySelector(select.cart.productList);
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
            // console.log(thisCart.totalNumber, thisCart.subtotalPrice, thisCart.totalPrice);
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
        }
        add(menuProduct) {
            const thisCart = this;
            const generatedHTML = templates.cartProduct(menuProduct);
            const generatedDOM = utils.createDOMFromHTML(generatedHTML);
            thisCart.dom.productList.appendChild(generatedDOM);
            thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
            // console.log('thisCart.product', thisCart.products);
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

    const app = {
        initMenu: function() {
            const thisApp = this;
            // console.log('thisApp.data:', thisApp.data);
            for (let productData in thisApp.data.products) {
                new Product(productData, thisApp.data.products[productData]);
            }
        },
        initData: function() {
            const thisApp = this;
            thisApp.data = dataSource;
        },

        initCart: function() {
            const thisApp = this;
            const cartElem = document.querySelector(select.containerOf.cart);
            thisApp.cart = new Cart(cartElem);
        },
        init: function() {
            const thisApp = this;
            // console.log('*** App starting ***');
            // console.log('thisApp:', thisApp);
            // console.log('classNames:', classNames);
            // console.log('settings:', settings);
            // console.log('templates:', templates);
            thisApp.initData();
            thisApp.initMenu();
            thisApp.initCart();
        },
    };
    app.init();
}
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    'use strict';

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
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
                input: 'input[name="amount"]',
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        }
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
            thisProduct.processOrder();
            console.log('new Product:', thisProduct);
        }
        readerInMenu() {
            const thisProduct = this;
            // generate HTML based on template
            const generatedHTML = templates.menuProduct(thisProduct.data);
            // create element using utills.CreateElementFromHTML
            thisProduct.element = utils.createDOMFromHTML(generatedHTML);
            // find menu containerOf
            const menuContainer = document.querySelector(select.containerOf.menu);
            // add element to menu
            menuContainer.appendChild(thisProduct.element);
        }
        getElements() {
            const thisProduct = this;
            thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
            thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
            thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
            thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
            thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
        }
        initAccordion() {
            const thisProduct = this;
            let product = document.querySelector('.product');
            console.log(product);
            let clicked = thisProduct.accordionTrigger;
            clicked.addEventListener('click', function(event) {
                console.log('clicked');
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
            });

        }
        processOrder() {
            const thisProduct = this;
            const formData = utils.serializeFormToObject(thisProduct.form);
            let price = dataSource.products[thisProduct.id].price;
            for (let param in dataSource.products[thisProduct.id].params) {
                for (let option in dataSource.products[thisProduct.id].params[param].options) {
                    if (formData[param]) {
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
            thisProduct.element.querySelector('.price').innerHTML = price;
        }
    }
    const app = {
        initMenu: function() {
            const thisApp = this;
            console.log('thisApp.data:', thisApp.data);
            for (let productData in thisApp.data.products) {
                new Product(productData, thisApp.data.products[productData]);
            }
        },
        initData: function() {
            const thisApp = this;

            thisApp.data = dataSource;
        },
        init: function() {
            const thisApp = this;
            console.log('*** App starting ***');
            console.log('thisApp:', thisApp);
            console.log('classNames:', classNames);
            console.log('settings:', settings);
            console.log('templates:', templates);
            thisApp.initData();
            thisApp.initMenu();
        },
    };
    app.init();
}
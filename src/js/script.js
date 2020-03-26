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

            // Na koniec, w konstruktorze klasy Produkt wywołaj tę metodę, tuż przed wywołaniem metody processOrder.
            thisProduct.initAmountWidget();

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
            thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
            // W metodzie getElements dodaj właściwość thisProduct.amountWidgetElem
            thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
        }
        initAccordion() {
            const thisProduct = this;
            // console.log(product);
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
                });

            }
            // Następnie, w klasie Product tworzymy nową metodę initAmountWidget
        initAmountWidget() {
            const thisProduct = this;

            thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);



        }


        processOrder() {
            const thisProduct = this;
            const formData = utils.serializeFormToObject(thisProduct.form);
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
    // Dodajemy deklarację klasy przed obiektem app.
    class AmountWidget {
        constructor(element) {
                const thisWidget = this;
                // W konstruktorze, nad console.log, dodajemy wywołanie tej metody:
                thisWidget.getElements(element);
                // Następnie wywołamy tę metodę w konstruktorze, pod wywołaniem metody getElements.
                thisWidget.setValue(thisWidget.input.value);


                console.log('AmountWidget:', thisWidget);
                console.log('AmountWidget:', element);
            }
            // Podobnie jak w klasie Product, stworzymy metodę getElements
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
            // To do add valdiation
            thisWidget.value = newValue;
            thisWidget.input.value = thisWidget.value;
            thisWidget.announce();
        }

        //zdefiniowalem powyzej setValue to czemu jest zle?

        initActions() {
            const thisWidget = this;
            thisWidget.input.addEventListener('change', thisWidget.setValue(thisWidget.input.value));

            thisWidget.linkDecrease.addEventListener('click', thisWidget.setValue(thisWidget.value - 1), event);
            event.preventDefault();
            thisWidget.linkIncrease.addEventListener('click', thisWidget.setValue(thisWidget.value + 1), event);
            event.preventDefault();


        }

        announce() {
            const thisWidget = this;
            const event = new Event('updated');
            thisWidget.element.dispatchEvent(event);
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
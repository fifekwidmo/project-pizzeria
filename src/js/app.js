import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
/* global Glide */

const app = {
    initPages: function() {
        const thisApp = this;
        thisApp.pages = document.querySelector(select.containerOf.pages).children;
        thisApp.navLinks = document.querySelectorAll(select.nav.links);
        thisApp.navLinksHome = document.querySelectorAll(select.nav.linksHome);
        thisApp.buttonLinks = document.querySelectorAll('.links');
        console.log(thisApp.buttonLinks);
        const idFromHash = window.location.hash.replace('#/', '');
        let pageMatchingHash = thisApp.pages[0].id;
        for (let page of thisApp.pages) {
            if (page.id == idFromHash) {
                pageMatchingHash = page.id;
                break;
            }
        }
        thisApp.activatePage(pageMatchingHash);
        for (let link of thisApp.navLinks) {
            link.addEventListener('click', function(event) {
                const clickedElement = this;
                event.preventDefault();
                // get id from href attrubite
                const id = clickedElement.getAttribute('href').replace('#', '');
                // run thisApp.activatePage with that id
                thisApp.activatePage(id);
                //change URL hash
                window.location.hash = '#/' + id;
            });
        }
        for (let link of thisApp.buttonLinks) {
            link.addEventListener('click', function(event) {
                const clickedElement = this;
                event.preventDefault();
                // get id from href attrubite
                const id = clickedElement.getAttribute('href').replace('#', '');
                // run thisApp.activatePage with that id
                thisApp.activatePage(id);
                //change URL hash
                window.location.hash = '#/' + id;
            });
        }
    },

    activatePage: function(pageId) {
        const thisApp = this;
        for (let page of thisApp.pages) {
            page.classList.toggle(classNames.pages.active, page.id == pageId);
        }
        for (let link of thisApp.navLinks) {
            link.classList.toggle(classNames.nav.active,
                link.getAttribute('href') == '#' + pageId
            );
        }
    },

    initBooking: function() {
        const thisApp = this;
        const bookingContainer = document.querySelector(select.containerOf.booking);
        thisApp.booking = new Booking(bookingContainer);
    },

    initMenu: function() {
        const thisApp = this;
        for (let productData in thisApp.data.products) {
            new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        }
    },
    initData: function() {
        const thisApp = this;
        thisApp.data = { products: '' };
        const url = settings.db.url + '/' + settings.db.product;
        fetch(url)
            .then(rawResponse => rawResponse.json())
            .then(parsedResponse => {
                console.log('parsedResponse', parsedResponse);
                thisApp.data.products = parsedResponse;
                thisApp.initMenu();
            });
        console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function() {
        const thisApp = this;
        const cartElem = document.querySelector(select.containerOf.cart);
        thisApp.cart = new Cart(cartElem);
        thisApp.productList = document.querySelector(select.containerOf.menu);
        thisApp.productList.addEventListener('add-to-cart', function(event) {
            app.cart.add(event.detail.product);
        });
    },
    init: function() {
        const thisApp = this;
        // console.log('*** App starting ***');
        // console.log('thisApp:', thisApp);
        // console.log('classNames:', classNames);
        // console.log('settings:', settings);
        // console.log('templates:', templates);
        thisApp.initPages();
        thisApp.initSlider();
        thisApp.initData();
        thisApp.initCart();
        thisApp.initBooking();
    },
    initSlider: function() {
        const config = {
            type: 'carousel',
            autoplay: 5000,
            dots: '.dots',
        };
        new Glide('.glide', config).mount();
    },
};






app.init();
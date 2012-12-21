/*jslint nomen:true*/
/*global Y, $*/

var NS = Y.namespace('com.javcly.designer.utils');

NS.SlideShow = Y.Base.create('designer_slideshow', Y.Widget, [], {

    initializer : function() {'use strict';
        this.on('*:slide', this.onSlide, this);
    },

    onSlide : function(e) {

        var slides = this.get('slides'), toSlideName, slideEntry, nextSlide, currentSession, newSession, newSessionData, Session = NS.SlideShow.Session, key;

        if (!slides) {
            throw new Error('No slides have been registered for the slideshow.');
        }

        toSlideName = e.toSlide;

        if (!toSlideName) {
            throw new Error('Must specify the name of the slide you are switching to.');
        }

        slideEntry = slides[toSlideName];
        if (!slideEntry) {
            throw new Error('The slide "' + toSlideName + '" is not found in the slideshow.');
        }

        nextSlide = slideEntry.slide;

        if (e.newSession) {
            currentSession = this.get('session');
            if (currentSession) {
                currentSession.destroy();
                currentSession = null;
            }

            newSession = new Session();

            newSessionData = e.newSessionData;
            if (newSessionData) {
                for (key in newSessionData) {
                    if (newSessionData.hasOwnProperty(key)) {
                        newSession.set(key, newSessionData[key]);
                    }
                }
            }
            this.set('session', newSession);
        }

        nextSlide.set('session', this.get('session'));

        nextSlide.fire('show', {
            data : e.data
        });

        this.get('slidesInstance').slide(slideEntry.index);

    },

    addSlide : function(slide) {'use strict';
        var slides = this.get('slides'), slideName = slide.get('slideName'), numberOfSlides;

        if (slides[slideName]) {
            throw new Error('Slide with name "' + slideName + '" has been registered.');
        }

        numberOfSlides = this.get('numberOfSlides');
        slides[slideName] = {
            slide : slide,
            index : numberOfSlides
        };
        this.set('numberOfSlides', numberOfSlides + 1);
    },

    renderUI : function() {'use strict';

        var slides, srcNode, html, slidesContainer, firstSlide, key, slideNode, entry, slide;

        slides = this.get('slides');

        if (!slides) {
            return;
        }

        srcNode = this.get('srcNode');
        html = '<div id="slides_wrapper"><div id="slides_container" class="slides_container"></div></div>';
        srcNode.setHTML(html);

        slidesContainer = srcNode.one('#slides_container');

        for (key in slides) {
            if (slides.hasOwnProperty(key)) {

                slideNode = Y.Node.create('<div class="slide_wrapper"></div>');
                slideNode.generateID();
                slidesContainer.appendChild(slideNode);

                entry = slides[key];
                slide = entry.slide;

                if (entry.index === 0) {
                    firstSlide = slide;
                }

                slide.set('node', slideNode);
                slide.addTarget(this);
            }
        }

        this.buildSilde();
        firstSlide.render();
    },

    buildSilde : function() {'use strict';

        var slidesInstance = $('#slides_wrapper').slides({
            generatePagination : false,
            slideSpeed : 280
        });

        this.set('slidesInstance', slidesInstance);
    },

    destructor : function() {'use strict';

        var session = this.get('session'), slides, key, entry;
        if (session) {
            session.destroy();
        }

        slides = this.get('slides');

        if (!slides) {
            return;
        }

        this.get('slidesInstance').destroy();

        for (key in slides) {
            if (slides.hasOwnProperty(key)) {
                slides[key].slide.destroy({
                    remove : true
                });
            }
        }

    }
}, {
    ATTRS : {
        slides : {
            value : []
        },
        container : null,
        slidesInstance : null,
        numberOfSlides : {
            value : 0
        },
        session : {
            value : null
        }
    }
});

NS.SlideShow.Session = function() {'use strict';
    this._attrs = [];
};

NS.SlideShow.Session.prototype = {

    set : function(attr, value) {'use strict';
        this._attrs[attr] = value;
    },

    get : function(attr) {'use strict';
        return this._attrs[attr];
    },

    destroy : function() {'use strict';
        var key, attrs = this._attrs;
        for (key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                attrs[key] = null;
            }
        }
        attrs.length = 0;
        delete this._attrs;
    }
};


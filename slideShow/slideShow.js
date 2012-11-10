var NS = Y.namespace('com.javcly.designer');

NS.SlideShow = Y.Base.create('designer_slide_show', NS.PageElement, [], {

    initializer : function() {
        this.after('resize-end', this.updateSlidelWidth, this);
    },

    renderUIWitoutExistingHtml : function() {

        var node = this.get('srcNode'), slidesBox = Y.Node.create('<div class="slides_container"></div>');

        node.append(slidesBox);

        var model = this.get('model'), slides = model.get('images'), html = '', key, slide;

        for (key in slides) {
            slide = slides[key];

            html += '<div class="slideWrapper"><img src="/javcly/designer/upload/' + slide + '/false/getImage.jspx"/></div>';
        }

        var imagesNodes = slidesBox.all('img');

        imagesNodes.once('load', this.onImageLoadOrError, this);
        imagesNodes.once('error', this.onImageLoadOrError, this);
        slidesBox.append(Y.Node.create(html));
        this.buildSlideShow();

    },

    renderUIUsingExistingHtml : function() {

        var srcNode = this.get('srcNode'), images = this.get('model').get('images');

        srcNode.all('.slides_container img').each(function(node, index) {
            node.once('load', this.onImageLoadOrError, this);
            node.once('error', this.onImageLoadOrError, this);
            node.setAttribute('src', '/javcly/designer/upload/' + images[index] + '/false/getImage.jspx');
        }, this);

        this.buildSlideShow();

    },

    buildSlideShow : function() {

        var model = this.get('model'), slidelWidth = model.get('width');

        this.set('slide', $(this.get('srcNode').getDOMNode()).slides({
            slideWidth : slidelWidth,
            play : model.get('playSpeed'),
            pause : model.get('pauseTime'),
            effect : model.get('playEffect'),
            generatePagination : model.get('generatePagination'),
            hoverPause : model.get('hoverPause')
        }));

    },

    onImageLoadOrError : function() {

        var loadedSlides = this.get('loadedSlides'), total = this.get('model').get('images').length;

        loadedSlides++;

        if (loadedSlides >= total) {
            this.fire('contentReady')
        };
        this.set('loadedSlides', loadedSlides);

    },

    updateSlidelWidth : function() {
        var width = this.get('model').get('width');
        ;
        this.get('slide').updateSlideWidth(width);
    },
    add : function(slide) {

        this.get('model').add(slide);
        var identifier = slide;

        var html = '<div style="width:100%"><img src="/javcly/designer/upload/' + identifier + '/false/getImage.jspx"/></div>';
        this.get('slide').addSlide($(html));

    },

    remove : function(index) {
        this.get('model').remove(index);

        var node = this.get('srcNode').one('.slides_container>div :nth-child(' + (parseInt(index) + 1) + ')').getDOMNode();
        //idex +1 for real postion
        this.get('slide').removeSlide($(node));

    },

    update : function(index, imgIdentifier) {
        var slides = this.get('model').get('images');
        slides[index] = imgIdentifier;
        //model

        var image = this.get('srcNode').one('.slides_container div:nth-child(' + (index + 1) + ')').one('img');
        //dom
        image.setAttribute('src', '/javcly/designer/upload/' + imgIdentifier + '/false/getImage.jspx');
    },
    setSlideEffect : function(newVal) {

        this.get('model').set('playEffect', newVal);
        this.get('slide').setEffect(newVal);
    },
    setPlaySpeed : function(newVal) {

        this.get('model').set('playSpeed', newVal);
        this.get('slide').setPlaySpeed(newVal);
    },
    setHoverPause : function(newVal) {
        this.get('model').set('hoverPause', newVal);
        this.get('slide').setHoverPause(newVal);
    },
    move : function(from, to) {

        if (from == to) {
            return;
        }
        var slides = this.get('model').get('images');
        var slide = slides[from];

        slides.splice(from, 1);
        slides.splice(to, 0, slide);

        this.get('slide').moveSlide(from, to);
    }
}, {
    ATTRS : {
        loadedSlides : {
            value : 0
        },
        slide : null
    }

});


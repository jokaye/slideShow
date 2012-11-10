var NS = Y.namespace('com.javcly.designer.dialogs');

NS.OrganizeImagesDialogImage = Y.Base.create('designer_organize_images', Y.com.javcly.designer.utils.ImageBase, [], {

    initializer : function() {

        this.on('select', this.select, this);

        this.publish('deselect');
        this.publish('drag-start');
        this.publish('drop-over');
        this.publish('drag');
        this.publish('drag-end');
        this.set('showRemoveIconOnHover', false);
        this.publish('edit');

    },
    renderUI : function() {

        NS.OrganizeImagesDialogImage.superclass.renderUI.call(this);
        var node = this.get('boundingBox');

        var dd = new Y.DD.Drag({
            node : node,
            target : {
                padding : '0 0 0 20'
            }
        }).plug(Y.Plugin.DDProxy, {
            moveOnEnd : false
        }).plug(Y.Plugin.DDConstrained, {
            constrain2node : this.get('container')
        });

        var drop = new Y.DD.Drop({
            node : node
        });

        this.set('drag', dd);
        this.set('drop', drop);

        dd.on('start', function() {
            this.fire('drag-start')
        }, this);
        dd.on('drag', function() {
            this.fire('drag')
        }, this);
        drop.on('over', function(e) {
            this.fire('drop-over', {
                drag : e.drag,
                drop : e.drop
            })
        }, this);
        dd.on('end', function() {
            this.fire('drag-end')
        }, this);

        this.get('srcNode').one('.img_control_box').on('dblclick', function() {
            this.edit();
            this.fire('edit');
        }, this)

    },
    generateImage : function() {
        var identifier = this.get('identifier');
        var image = new Image();
        image.src = "/javcly/designer/upload/" + identifier + "/true/getImage.jspx";
        image.width = this.get('imageWidth');
        image.height = this.get('imageHeight');
        image.setAttribute('identifier', identifier);
        return image;
    },

    edit : function() {
        this.set('editing', true);
        // add class;
    },

    select : function() {

        if (this.get('editing')) {
            return;
        }

        var lastSelectTime = this.get('lastSelectTime');
        var currentTime = new Date().getTime();
        if (lastSelectTime && (currentTime - lastSelectTime) <= 500) {
            return;
        }

        var selected = this.get('selected');
        if (!selected) {
            var box = this.get('boundingBox');
            box.addClass('imageSelected');
            box.one('.removeImageIcon').setStyle('display', 'block');
            this.set('selected', true);
            this.set('lastSelectTime', currentTime);
        } else {
            this.deselect();
        }
    },

    deselect : function() {
        var box = this.get('boundingBox');
        box.removeClass('imageSelected');
        box.one('.removeImageIcon').hide();
        this.set('selected', false);
        this.fire('deselect');
    },

    destructor : function() {
        var drag = this.get('drag');
        if (drag) {
            drag.destroy();
        }

        var drop = this.get('drop');
        if (drop) {
            drop.destroy();
        }
    }
}, {
    ATTRS : {
        identifier : null,
        selected : {
            value : false
        },

        drag : null,
        drop : null,
        editing : {
            value : false
        },
        lastSelectTime : null
    }

});


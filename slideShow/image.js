/*jslint nomen:true*/
/*global Y, Translator*/
var NS = Y.namespace('com.javcly.designer.dialogs'), OrganizeImagesDialogImage = NS.OrganizeImagesDialogImage, ImagePicker = Y.com.javcly.designer.utils.ImagePicker, Overlay = Y.Overlay;

NS.ImageOrganizer = Y.Base.create('designer_image_organizer', Y.View, [], {

    initializer : function() {"use strict";
        this.on('designer_organize_images:removeImage', this.remove, this);
        this.on('designer_organize_images:select', this.onImageSelect, this);
        this.on('designer_organize_images:deselect', this.onImageDeselect, this);
        this.on('designer_image_album:confirmSelection', this._insertConfirm, this);
        this.on('designer_image_album:cancel_upload', this._insertCancel, this);

        this.on('designer_organize_images:drag-start', this._dragStart, this);
        this.on('designer_organize_images:drop-over', this._dropOver, this);
        this.on('designer_organize_images:drag', this._draging, this);
        this.on('designer_organize_images:drag-end', this._dragEnd, this);

        this.on('designer_album_image:confirmRemove', this.onAlbumImageRemove, this);

        this.on('designer_organize_images:edit', this.editImage, this);

    },
    render : function() {"use strict";

        var node = Y.Node.create('<div class="organize_images_box" style="width:508px;height:350px;"><div class="organize_images_list" style="border:1px solid #888; height:300px; overflow-y:auto;"></div><div><button class="organize_images_add">' + Translator.get('designer.slideShow.addSlide') + '</button><button class="organize_images_change" disabled="disable">' + Translator.get('designer.changeImage') + '</button><p class="dialog_erro_tips" style="display:none;">you can delete imgaes above two </p></div></div>'), images, identifier, key, identifiers, events;

        images = this.get('element').get('model').get('images');
        identifiers = [];
        for ( key = 0; key < images.length; key += 1) {
            identifiers.push(images[key]);
        }
        events = this.get('events');
        this._load(identifiers);
        events.push(node.one('.organize_images_add').on('click', this._add, this));
        events.push(node.one('.organize_images_change').on('click', this._change, this));
        this.get('container').append(node);
        this.set('node', node);
    },

    _load : function(identifiers) {"use strict";

        if (identifiers.length <= 0) {
            return;
        }

        Y.io('/javcly/designer/upload/listSome.jspx', {
            method : 'POST',
            context : this,
            data : {
                identifiers : identifiers
            },
            on : {
                complete : function(id, xhr) {

                    var images = Y.JSON.parse(xhr.responseText), index, data, image;

                    for ( index = 0; index < images.length; index += 1) {

                        data = images[index];

                        image = new OrganizeImagesDialogImage({
                            container : this.get('node').one('.organize_images_list'),
                            identifier : data.identifier,
                            fileName : data.fileName,
                            imageWidth : parseInt(data.thumbnailWidth, 10),
                            imageHeight : parseInt(data.thumbnailHeight, 10),
                            realWidth : parseInt(data.width, 10),
                            realHeight : parseInt(data.height, 10)
                        });
                        image.render();
                        image.show();
                        image.addTarget(this);
                        this.get('images').push(image);
                    }

                }
            }
        });
    },

    _add : function() {"use strict";
        var identifier = Y.com.javcly.designer.utils.Utils.getImagePlaceHolderIdentifer();
        Y.io('/javcly/designer/upload/' + identifier + '/get.jspx', {
            method : 'GET',
            context : this,
            on : {
                complete : function(id, xhr) {

                    var data = Y.JSON.parse(xhr.responseText), image;

                    image = new OrganizeImagesDialogImage({
                        container : this.get('node').one('.organize_images_list'),
                        identifier : identifier,
                        fileName : data.fileName,
                        imageWidth : parseInt(data.thumbnailWidth, 10),
                        imageHeight : parseInt(data.thumbnailHeight, 10),
                        realWidth : parseInt(data.width, 10),
                        realHeight : parseInt(data.height, 10)
                    });
                    image.render();
                    image.show();
                    image.addTarget(this);
                    this.get('element').add(identifier);

                    this.get('images').push(image);

                }
            }
        });
    },
    editImage : function() {"use strict";
        if (this.get('overlay')) {
            this.get('overlay').show();
            return;
        }
        var box = Y.one('.fancybox-outer'), content, imagePicker, overlay, x = box.getX(), y = box.getY(), width = parseInt(box.get('clientWidth'), 10);
        content = Y.Node.create('<div id="organize_images_insert" style="position:absolute; z-index:8040; width:550px;height:410px;border:1px solid red;background:white;"></div>');
        box.append(content);
        Y.Base.mix(Overlay, [Y.WidgetAutohide]);
        overlay = new Overlay({
            modal : true,
            visible : true,
            width : "560px",
            height : "420px",
            x : x + width + 15,
            y : y,
            zIndex : 500,
            headerContent : '',
            bodyContent : '',
            footerContent : '',
            srcNode : '#organize_images_insert',
            hideOn : [{
                eventName : 'key',
                keyCode : 'esc',
                node : Y.one('document')
            }, {
                eventName : 'clickoutside'
            }]
        });
        overlay.get('boundingBox').setStyles({
            'backgroundColor' : '#eee'
        });
        overlay.render();

        overlay.after('visibleChange', function() {
            if (this.get('currentSelected') && overlay.get('visible') === false) {
                this.get('currentSelected').set('editing', false);
            }
        }, this);

        imagePicker = new ImagePicker({
            multiSelect : false
        });

        imagePicker.render();
        overlay.get('boundingBox').one('.yui3-widget-bd').append(imagePicker.get('boundingBox'));
        imagePicker.addTarget(this);
        this.set('overlay', overlay);
        this.set('imagePicker', imagePicker);
    },

    remove : function(e) {"use strict";

        var identifier = e.target.get('identifier'), images, key;

        images = this.get('images');

        if (images.length <= 2 && !e.forceRemove) {
            this.showErroTips();
            return;
        }

        for ( key = 0; key < images.length; key += 1) {
            if (images[key] === e.target) {
                this.get('element').remove(key);
                images.splice(key, 1);
                break;
            }
        }

        if (this.get('currentSelected') === e.target) {
            this.set('currentSelected', null);
            this.set('fistSelected', true);

        }

        e.target.destroy();

    },

    onAlbumImageRemove : function(e) {"use strict";

        var identifier = e.target.get('identifier'), images, key;

        images = this.get('images');
        for ( key = 0; key < images.length; key += 1) {
            if (images[key].get('identifier') === identifier) {
                images[key].fire('removeImage', {
                    forceRemove : true
                });

            }
        }

    },

    onImageSelect : function(e) {"use strict";
        var node = this.get('node').one('.organize_images_change'), currentSelected;

        if (this.get('multiSelect')) {
            return;
        }

        if (this.get('fistSelected')) {
            node.removeAttribute('disabled');
            this.set('fistSelected', false);
        }

        currentSelected = this.get('currentSelected');
        if (currentSelected) {
            if (e.target !== currentSelected) {
                currentSelected.set('editing', false);
                currentSelected.deselect();
                this.set('currentSelected', e.target);
                node.removeAttribute('disabled');
            } else {
                node.removeAttribute('disabled');
            }

        } else {
            this.set('currentSelected', e.target);

        }

    },
    onImageDeselect : function(e) {"use strict";
        if (this.get('multiSelect')) {
            return;
        }

        if (this.get('currentSelected') === e.target) {
            this.set('currentSelected', null);
            this.get('node').one('.organize_images_change').setAttribute('disabled', 'disabled');
        }

    },
    _insertConfirm : function(e) {"use strict";
        if (!e.selectedImages[0]) {
            return;
        }

        var selectedImage = e.selectedImages[0], identifier, width, height, node, index;
        identifier = selectedImage.get('identifier');
        width = selectedImage.get('imageWidth');
        height = selectedImage.get('imageHeight');
        node = this.get('currentSelected').get('srcNode').one('img');

        this.get('currentSelected').set('identifier', identifier);
        node.setAttribute('src', '/javcly/designer/upload/' + identifier + '/false/getImage.jspx');
        node.setStyles({
            width : width,
            height : height
        });
        this.get('overlay').hide();
        //hide overlay
        index = this.get('node').all('.organize_images_list>div').indexOf(this.get('currentSelected').get('boundingBox'));
        this.get('element').update(index, identifier);

        this.get('currentSelected').set('editing', false);

    },
    _insertCancel : function() {"use strict";//image picker
        // destroy
        this.get('overlay').hide();
        this.get('currentSelected').set('editing', false);
    },
    showErroTips : function() {"use strict";
        var node = this.get('node');
        node.one('.dialog_erro_tips').show(true);
        setTimeout(function() {
            node.one('.dialog_erro_tips').hide(true);
        }, 2000);
    },

    //build list reorder
    _dragStart : function(e) {"use strict";
        var drag = e.target, node;
        node = this.get('node');

        this.set('currentDragNodeIndex', node.all('.organize_images_list>div').indexOf(drag.get('boundingBox')));
        //Set some styles here
        drag.get('boundingBox').setStyle('opacity', '.25');
        drag.get('drag').get('dragNode').set('innerHTML', drag.get('boundingBox').get('innerHTML'));
        drag.get('drag').get('dragNode').setStyles({
            opacity : '.5',
            borderColor : drag.get('boundingBox').getStyle('borderColor'),
            backgroundColor : drag.get('boundingBox').getStyle('backgroundColor')
        });
    },
    _dropOver : function(e) {"use strict";

        var drag = e.drag, drop = e.drop, dragNode, dropNode;
        dragNode = drag.get('node');
        dropNode = drop.get('node');
        if (!this.get('goingUp')) {
            dropNode = dropNode.get('nextSibling');
        }
        //Add the node to this list
        e.target.get('boundingBox').get('parentNode').insertBefore(dragNode, dropNode);
        //Resize this nodes shim, so we can drop on it later.
        drop.sizeShim();

    },
    _draging : function(e) {"use strict";
        var y = e.target.get('drag').lastXY[1];
        //is it greater than the lastY var?
        if (y < this.get('lastY')) {
            //We are going up
            this.set('goingUp', true);
        } else {
            //We are going down.
            this.set('goingUp', false);
        }
        //Cache for next check
        this.set('lastY', y);
    },
    _dragEnd : function(e) {"use strict";
        var drag = e.target, node, index;
        node = this.get('node');

        index = node.all('.organize_images_list>div').indexOf(drag.get('boundingBox'));
        this.get('element').move(this.get('currentDragNodeIndex'), index);
        //Put our styles back
        drag.get('boundingBox').setStyles({
            visibility : '',
            opacity : '1'
        });
    },
    destructor : function() {"use strict";
        var images = this.get('images'), events = this.get('events'), key, i;
        for ( key = 0; key < images.length; key += 1) {
            images[key].destroy();
        }

        for ( i = 0; i < events.length; i += 1) {
            events[i].detach();
        }

        events.length = 0;

        if (this.get('imagePicker')) {
            this.get('imagePicker').destroy(true);
        }

        if (this.get('overlay')) {
            this.get('overlay').destroy(true);
        }
    }
}, {
    ATTRS : {
        images : {
            value : []
        },
        node : null,
        element : null,
        container : null,
        imagePicker : null,
        overlay : null,
        currentSelected : null,
        fistSelected : {
            value : true
        },
        currentDragNodeIndex : {
            value : 0
        },
        goingUp : {
            value : false
        },
        lastY : {
            value : 0
        },
        events : {
            value : []
        }
    }

});


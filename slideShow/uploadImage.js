var NS = Y.namespace('com.javcly.designer.utils');

NS.Image = Y.Base.create('designer_image_uploader_image', NS.ImageBase, [], {

    initializer : function() {

        this.publish('uploadStart');
        this.publish('uploadComplete', {
            defaultFn : this.uploadComplete
        });
        this.publish('uploadFail');

        this.on('removeImage', this.remove, this);

    },

    uploadComplete : function() {

        this.destroy();
    },

    upload : function() {

        if (!this.get('validForUpload')) {
            return;
        }

        var tempFileKey = this.get('tempFileKey');
        var tempThumbnailFileKey = this.get('tempThumbnailFileKey');

        var url = '/javcly/designer/upload/upload.jspx';
        Y.io(url, {
            method : 'POST',
            context : this,
            data : {
                tempFileKey : tempFileKey,
                tempThumbnailFileKey : tempThumbnailFileKey,
                fileName : this.get('file').get('name')

            },
            on : {

                start : function() {
                    this.fire('uploadStart');
                },
                complete : function() {
                    var data = Y.JSON.parse(arguments[1].responseText);
                    this.fire('uploadComplete', {
                        identifier : data.identifier,
                        fileName : this.get('file').get('name'),
                        width : parseInt(data.thumbnailWidth),
                        height : parseInt(data.thumbnailHeight)
                    });
                },

                failure : function() {
                    alert('upload failed.');
                }
            }
        });
    },
    retryUpload : function() {

    },

    destructor : function() {
        this.get('file').destroy();
    },

    generateImage : function(width, height) {

        var previewImage = new Image();
        previewImage.src = "/javcly/designer/upload/" + this.get('tempThumbnailFileKey') + "/getTempThumbnail.jspx";
        previewImage.width = width;
        previewImage.height = height;
        previewImage.setAttribute('tempFileKey', this.get('tempFileKey'));
        return previewImage;
    },

    onImageLoad : function() {
        this.set('validForUpload', true);

    },

    remove : function() {
        Y.io('/javcly/designer/upload/removeTempImageAndThumbnail.jspx', {

            data : {
                tempFileKey : this.get('tempFileKey'),
                tempThumbnailFileKey : this.get('tempThumbnailFileKey'),
            },
            method : 'POST',
            context : this,
            on : {
                complete : this.destroy
            }
        });
    }
}, {
    ATTRS : {

        tempFileKey : null,
        tempThumbnailFileKey : null,
        file : null,
        validForUpload : {
            value : false
        }
    }

});

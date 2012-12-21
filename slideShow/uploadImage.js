/*jslint nomen:true*/
/*global Y, Translator*/

var NS = Y.namespace('com.javcly.designer.utils');

NS.Image = Y.Base.create('designer_image_uploader_image', NS.ImageBase, [], {

    initializer : function() {'use strict';

        this.publish('uploadStart');
        this.publish('uploadComplete', {
            defaultFn : this.uploadComplete
        });
        this.publish('uploadFail');

        this.on('removeImage', this.remove, this);

    },

    uploadComplete : function() {'use strict';

        this.destroy();
    },

    upload : function() {'use strict';
        if (!this.get('validForUpload')) {
            return;
        }

        var tempFileKey = this.get('tempFileKey'), tempThumbnailFileKey = this.get('tempThumbnailFileKey'), url = '/javcly/designer/upload/upload.jspx';

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
                complete : function(id, xhr) {
                    var data = Y.JSON.parse(xhr.responseText);
                    this.fire('uploadComplete', {
                        identifier : data.identifier,
                        fileName : this.get('file').get('name'),
                        width : parseInt(data.thumbnailWidth, 10),
                        height : parseInt(data.thumbnailHeight, 10)
                    });
                },

                failure : function() {
                    alert('upload failed.');
                }
            }
        });
    },
    retryUpload : function() {'use strict';

    },

    destructor : function() {'use strict';
        this.get('file').destroy();
    },

    generateImage : function(width, height) {'use strict';
        var previewImage = new Image();
        previewImage.width = width;
        previewImage.height = height;
        previewImage.setAttribute('tempFileKey', this.get('tempFileKey'));
        return previewImage;
    },

    getImageSrc : function() {'use strict';
        return "/javcly/designer/upload/" + this.get('tempThumbnailFileKey') + "/getTempThumbnail.jspx";
    },

    onImageLoad : function() {'use strict';
        this.set('validForUpload', true);

    },

    remove : function() {'use strict';
        Y.io('/javcly/designer/upload/removeTempImageAndThumbnail.jspx', {

            data : {
                tempFileKey : this.get('tempFileKey'),
                tempThumbnailFileKey : this.get('tempThumbnailFileKey')
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

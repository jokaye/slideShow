/*jslint nomen:true*/
/*global Y, Translator*/
var NS = Y.namespace('com.javcly.designer.dialogs'), ImageOrganizer = NS.ImageOrganizer, SlideShowSetting = NS.SlideShowSetting, AlbumBoxSetting = NS.AlbumBoxSetting;

NS.OrganizeImagesDialog = Y.Base.create('designer_organize_images_dialog', NS.Dialog, [], {

    initializer : function() {"use strict";

    },

    generateContents : function() {"use strict";
        var element = this.get('element'), content = this.get('srcNode'), organizer, setting;

        organizer = new ImageOrganizer({
            element : element,
            container : content
        });
        organizer.render();

        if (element.get('slide')) {// for slide show

            setting = new SlideShowSetting({
                element : element,
                container : content
            });
            setting.render();
        } else if (element.get('albumBox')) {// for album box
            //
            // setting = new AlbumBoxSetting({
            // element : element,
            // container : content
            // });
            // setting.render();

        }
        this.organizer = organizer;
        //  this.set('setting', setting);
    },

    changeTab : function(e) {"use strict";
        if (e.target.hasClass('menu_selected')) {
            return;
        }
        var node = this.get('srcNode');

        e.target.addClass('menu_selected').siblings().removeClass('menu_selected');
        if (e.target.hasClass('organize_images_button')) {
            node.one('.organize_setting_box').hide();
            node.one('.organize_images_box').setStyle('display', 'block');
        } else {
            node.one('.organize_images_box').hide();
            node.one('.organize_setting_box').setStyle('display', 'block');
        }

    },

    _onConfirm : function() {"use strict";
        this.destroy();

    },
    _onCancel : function(e) {"use strict";
        this.destroy();
    },

    destructor : function() {"use strict";

        if (this.organizer) {
            this.organizer.destroy();
        }

    }
});


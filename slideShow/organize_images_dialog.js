var NS = Y.namespace('com.javcly.designer.dialogs');

NS.OrganizeImagesDialog = Y.Base.create('designer_organize_images_dialog', NS.Dialog, [], {

    initializer : function() {

    },

    renderHeader : function() {

        var header = NS.OrganizeImagesDialog.superclass.renderHeader.call(this);
        var html = '<div class="organize_images_button menu_selected">'+Translator.get('designer.image.organizer.title')+'</div><div class="setting_slides_button">'+Translator.get('designer.setting')+'</div>';
        header.set('innerHTML', html);
        header.all('div').on('click', this.changeTab, this);
    },

    renderContent : function() {
        var element = this.get('element');
        var content = NS.OrganizeImagesDialog.superclass.renderContent.call(this);

        var organizer = new Y.com.javcly.designer.dialogs.ImageOrganizer({
            element : element,
            container : content
        }).render();
        
        if(element.get('slide')){          // for slide show 
            
        var setting = new Y.com.javcly.designer.dialogs.SlideShowSetting({
            element : element,
            container : content
        }).render();
        } else if (element.get('albumnBox')){   // for albumn box
            
        var setting = new Y.com.javcly.designer.dialogs.AlbumnBoxSetting({
            element : element,
            container : content
        }).render();
        };
    },

    renderFooter : function(node, type, label) {
        var footer = NS.OrganizeImagesDialog.superclass.renderFooter.call(this);
        var node = Y.Node.create('<button id="delete_cancel">'+Translator.get('designer.cancel')+'</button>')
        footer.append(node);
        footer.one('#delete_cancel').on('click', this._onCancel, this);
    },

    changeTab : function(e) {
        if (e.target.hasClass('menu_selected')) {
            return;
        }
        var node = this.get('srcNode');

        e.target.addClass('menu_selected').siblings().removeClass('menu_selected');
        if (e.target.hasClass('organize_images_button')) {
            node.one('.organize_setting_box').hide();
            node.one('.organize_images_box').setStyle('display', 'block')
        } else {
            node.one('.organize_images_box').hide();
            node.one('.organize_setting_box').setStyle('display', 'block');
        }

    },

    _onConfirm : function(e) {
        this.destroy();

    },
    _onCancel : function(e) {
        this.destroy();
    }
}, {
    ATTRS : {

    }

});


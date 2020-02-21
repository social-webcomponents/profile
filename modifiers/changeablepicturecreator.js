function createChangeablePicture (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  var BasicModifier = applib.BasicModifier,
    DivElement = applib.getElementType('DivElement'),
    o = templateslib.override,
    m = htmltemplateslib;


  function ShouldUploadElement (id, options) {
    DivElement.call(this, id, options);
    this.editShown = this.createBufferableHookCollection(); //new lib.HookCollection();
    this.shouldUpload = this.createBufferableHookCollection(); //new lib.HookCollection();
  }
  lib.inherit(ShouldUploadElement, DivElement);
  ShouldUploadElement.prototype.__cleanUp = function () {
    if (this.shouldUpload) {
      this.shouldUpload.destroy();
    }
    this.shouldUpload = null;
    if (this.editShown) {
      this.editShown.destroy();
    }
    this.editShown = null;
    DivElement.prototype.__cleanUp.call(this);
  };
  ShouldUploadElement.prototype.set_picture = function (picname) {
    //this.updateHashField('picture', this.getConfigVal('cdnUrl')+picname);
    var image, nopic;
    image = this.getElement('Image');
    nopic = this.getElement('NoPicture');
    if (!image) {
      return;
    }
    if (!picname) {
      image.set('src', '');
      if (nopic) {
        image.set('actual', false);
        nopic.set('actual', true);
      }
      return;
    }
    if (nopic) {
      nopic.set('actual', false);
    }
    image.set('src', this.picName(picname));//this.getConfigVal('cdnUrl')+picname); 
    image.set('actual', true);
  };
  ShouldUploadElement.prototype.get_picture = function () {
    this.getElement('Image').get('src');
  };
  ShouldUploadElement.prototype.picName = function (picname) {
    var ret, cdnurl, ps;
    if (!picname) {
      return '';
    }
    cdnurl = this.getConfigVal('cdnUrl');
    if (!cdnurl) {
      return '';
    }
    ret = cdnurl+picname;
    ps = this.getConfigVal('picSize');
    if (ps) {
      ret += ('-'+ps);
    }
    return ret;
  };
  applib.registerElementType('ShouldUploadElement', ShouldUploadElement);


  function ChangeablePictureModifier (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit(ChangeablePictureModifier, BasicModifier);

  ChangeablePictureModifier.prototype.doProcess = function (name, options, links, logic, resources) {
    var formname = this.config.name,
      pictureeditorname = this.config.pictureeditorname || 'EditPicture',
      shupelements;
    options.elements = options.elements || [];
    shupelements = [{
      type: 'ImgElement',
      name: 'Image',
      options: lib.extend({}, this.config.picture, {
        actual: true,
        self_selector: 'attrib:profileelement'
      })
    },{
      type: 'FileInputElement',
      name: 'Change',
      options: lib.extend({}, this.config.change, {
        actual: true,
        self_selector: 'attrib:profileelement'
      })
    },{
      type: 'SocialEditPictureElement',
      name: pictureeditorname,
      options: lib.extend({}, this.config.edit, { 
      }),
      modifiers: [{
        name: 'SocialProfileEditPictureModifier',
        options: this.config.edit
      }]
    }];
    if (this.config.no_picture) {
      shupelements.push({
        name: 'NoPicture',
        type: 'WebElement',
        options: lib.extend({
        }, this.config.no_picture)
      });
    }
    options.elements.push({
      type: 'ShouldUploadElement',
      name: formname,
      options: {
        actual: this.config.actual,
        self_selector: '.',
        default_markup_wrapper: this.config.default_markup_wrapper,
        target_on_parent: this.config.target_on_parent,
        cdnUrl: this.config.cdnurl,
        picSize: this.config.picsize,
        div: this.config.div,
        elements: shupelements
      },
      links: [{
        source: pictureeditorname+':actual',
        target: '.!editShown'
      },{
        source: pictureeditorname+'!OK',
        target: '.!shouldUpload'
      }],
      logic: [{
        triggers: 'Change!gotFiles',
        references: pictureeditorname,
        handler: function (ep, gfs) {
          if (!(lib.isArray(gfs) && gfs.length>0)) {
            ep.set('actual', false);
            return;
          }
          ep.set('data', lib.pickExcept(gfs[0], ['contents']));
          ep.set('picture', gfs[0].contents);
        }
      },{
        triggers: [pictureeditorname+'!Cancel',pictureeditorname+'!OK'],
        references: 'Change',
        handler: function (change, evnt) {
          change.resetInput();
        }
      }]
    });
  };
  ChangeablePictureModifier.prototype.DEFAULT_CONFIG = function () {
    return {};
  };

  applib.registerModifier('SocialProfileChangeablePicture', ChangeablePictureModifier);
}

module.exports = createChangeablePicture;

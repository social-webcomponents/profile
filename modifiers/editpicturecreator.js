function createEditPicture (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  var BasicModifier = applib.BasicModifier,
    DivElement = applib.getElementType('DivElement'),
    o = templateslib.override,
    m = htmltemplateslib;

  function EditPictureElement (id, options) {
    DivElement.call(this, id, options);
    this.OK = this.createBufferableHookCollection(); //new lib.HookCollection();
    this.Cancel = this.createBufferableHookCollection(); //new lib.HookCollection();
    this.data = null;
  }
  lib.inherit(EditPictureElement, DivElement);
  EditPictureElement.prototype.__cleanUp = function () {
    this.data = null;
    if (this.Cancel) {
      this.Cancel.destroy();
    }
    this.Cancel = null;
    if (this.OK) {
      this.OK.destroy();
    }
    this.OK = null;
    DivElement.prototype.__cleanUp.call(this);
  };
  EditPictureElement.prototype.get_picture = function () {
    var edel = this.getEdit();
    if (!edel) {
      return null;
    }
    return edel.get('src');
  };
  EditPictureElement.prototype.set_picture = function (picsrc) {
    var edel = this.getEdit();
    if (!edel) {
      return false;
    }
    return edel.set('src', picsrc);
  };
  EditPictureElement.prototype.fireOK = function () {
    var edel = this.getEdit();
    if (!edel) {
      return;
    }
    if (!(edel.cropper && edel.cropper.imageData)) {
      return;
    }
    if (!this.data) {
      return;
    }
    this.OK.fire({pic: edel.cropper.getData(), contents: edel.src, data: this.data});
    this.set('actual', false);
    edel.set('edit', false);
    edel.set('src', '');
  };
  EditPictureElement.prototype.getEdit = function () {
    if (!this.destroyed) {
      return null;
    }
    return this.getElement('Edit');
  };

  applib.registerElementType('SocialEditPictureElement', EditPictureElement);

  function EditPictureModifier (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit(EditPictureModifier, BasicModifier);
  EditPictureModifier.prototype.doProcess = function (name, options, links, logic, resources) {
    options.elements = options.elements || [];
    options.elements.push({
      type: 'ImageModifierElement',
      //type: 'ImgElement',
      name: 'Edit',
      options: lib.extend({}, this.config.edit, {
        actual: true,
        self_selector: 'attrib:profileelement'
      })
    },{
      type: 'ClickableElement',
      name: 'OK',
      options: lib.extend({}, this.config.ok, {
        actual: true,
        self_selector: 'attrib:profileelement'
      })
    },{
      type: 'ClickableElement',
      name: 'Cancel',
      options: lib.extend({}, this.config.cancel, {
        actual: true,
        self_selector: 'attrib:profileelement'
      })
    });
    links.push({
      source: 'OK!clicked',
      target: '.>fireOK'
    });
    logic.push({
      triggers: 'Cancel!clicked',
      references: '., Edit',
      handler (me, edit) {
        me.set('actual', false);
        edit.set('edit', false);
        edit.set('src', '');
        me.Cancel.fire(true);
      }
    },{
      triggers: 'Edit!imgLoaded',
      references: '., Edit',
      handler: function (me, edit, evnt_ignored) {
        me.set('actual', true);
        lib.runNext(edit.set.bind(edit, 'edit', true), 100);
      }
    });
  };
  EditPictureModifier.prototype.DEFAULT_CONFIG = function () {
    return {};
  };

  applib.registerModifier('SocialProfileEditPictureModifier', EditPictureModifier);
}
module.exports = createEditPicture;

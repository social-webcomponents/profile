(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (execlib) {
  'use strict';

  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    lR = execSuite.libRegistry,
    applib = lR.get('allex_applib'),
    templateslib = lR.get('allex_templateslitelib'),
    htmltemplateslib = lR.get('allex_htmltemplateslib');

  require('./modifiers')(lib, applib, templateslib, htmltemplateslib);
  require('./prepreprocessors')(lib, applib, templateslib, htmltemplateslib);
})(ALLEX);

},{"./modifiers":7,"./prepreprocessors":8}],2:[function(require,module,exports){
function createChangeableElement (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  var BasicModifier = applib.BasicModifier,
    AngularFormLogic = applib.getElementType('AngularFormLogic'),
    o = templateslib.override,
    m = htmltemplateslib;


  function createMarkup (options) {
    return o(m.form
    );
  }

  function createElementInfo(options){
    var ret;
    /* TODO
    if (!!options.valueMap){
      ret = options.valueMap['{{_ctrl.data.' + options.profileProperty + '}}'];
    }else{
      ret = '{{_ctrl.data.' + options.profileProperty + '}}';
    }
    */
    ret = '<div class="profileElementInfo">{{_ctrl.data.' + options.profileProperty + '}}</div>';
    return ret;
  }

  function createElementDescription(options){
    console.log('da vidimo options kad se radi createElementDescription',options);
    var ret;
    if (!options.description){
      ret = '';
    }else{
      ret = '<div class="profileElementDescription">' + options.description + '</div>';
    }
    return ret;
  }

  function createInputField(options){
    var ret, optionArry = [];
    switch(options.inputType){
      case 'select':
        if (lib.isArray(options.selectOptions)){
          for (var i=0; i<options.selectOptions.length; i++){
            var option = options.selectOptions[i];
            optionArry.push(
              o(m.option,
                'CLASS', 'profile-info-option',
                'ATTRS', 'value="' + option + '" ng-selected= "{{_ctrl.data.' + options.profileProperty + ' == ' + option+ '}}"',
                'CONTENTS', options.valueMap[option]+' '+'{{_ctrl.data.' + options.profileProperty+'}}' //TODO uppercase first letter
              )
            );
          }
        }
        ret = o(m.select,
          'CLASS', 'form-control hers-profile-form-control',
          'NAME', options.profileProperty,
          'CONTENTS', optionArry
        );
        break;
      case 'text':
      default:
        ret = o(m.textinput,
          'CLASS', 'form-control hers-profile-form-control',
          'NAME', options.profileProperty,
          'ATTRS', 'placeholder="{{_ctrl.data.' + options.profileProperty + '}}"'
        );
        break;
    }
    return ret;
  }

  function ProfileInfoElement (id, options) {
    var profileProperty = options.profileProperty;
    AngularFormLogic.call(this, id, options);
    ProfileInfoElement.prototype['set_' + profileProperty] = this.genericSetter.bind(this, options, profileProperty);
    ProfileInfoElement.prototype['get_' + profileProperty] = this.genericGetter.bind(this, profileProperty);
    //this.shouldUpload = new lib.HookCollection(); //submit event will do this job
  }
  lib.inherit(ProfileInfoElement, AngularFormLogic);
  ProfileInfoElement.prototype.__cleanUp = function () {
    AngularFormLogic.prototype.__cleanUp.call(this);
  };
  ProfileInfoElement.prototype.set_data = function (data) {
    return AngularFormLogic.prototype.set_data.call(this, data);
  };
  ProfileInfoElement.prototype.genericSetter = function (options, pp, value) {
    this.updateHashField(pp, value);
  };
  ProfileInfoElement.prototype.genericGetter = function (pp) {
    return this.get('data')[pp];
  };
  applib.registerElementType('ProfileInfoElement', ProfileInfoElement);

  function ChangeableElementModifier (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit(ChangeableElementModifier, BasicModifier);

  ChangeableElementModifier.prototype.doProcess = function (name, options, links, logic, resources) {
    var formname = this.config.name;
    if (!this.config || !this.config.profileProperty){
      throw new lib.Error('NO_PROFILE_PROPERTY_SPECIFIED', 'Profile property must be specified for ChangableElement');
    }
    var profileProperty = this.config.profileProperty;
    var valueMap = this.config.valueMap;
    options.elements = options.elements || [];
    options.elements.push({
      type: 'ProfileInfoElement',
      name: formname,
      options: {
        actual: this.config.actual,
        self_selector: '.',
        default_markup: createMarkup(this.config),
        target_on_parent: this.config.target_on_parent,
        onInitialized: function (me) {
          me.set('data', {disabled: true});
        },
        profileProperty: profileProperty,
        valueMap: valueMap,
        elements: [
          {
            name: 'changeableelementchange',
            type: 'ClickableElement',
            options: lib.extend({
              actual: true,
              clickable: {
                type: 'a',
                text: 'Change'
              }
            }, this.config.change, {
              self_selector: '.'
            })
          },
          {
            name: 'changeableelementdisplay',
            type: 'DivElement',
            options: lib.extend({
              actual: true,
              div: {
                text: o(m.div,
                  'CONTENTS', [
                    createElementInfo(this.config),
                    createElementDescription(this.config)
                  ]
                )
              }
            }, this.config.display, {
              self_selector: '.'
            })
          },
          {
            name: 'changeableelementedit',
            type: 'DivElement',
            options: lib.extend({
              actual: false,
              div: {
                class: 'form-row hers-profile-form-row',
                text: [
                  createInputField(this.config),
                  o(m.button,
                    'CLASS', 'changeableelementcontainersubmit btn btn-info',
                    'ATTRS', 'type="submit"',
                    'CONTENTS', 'Update'
                  )
                ]
              }
            }, this.config.edit, {
              self_selector: '.',
              /*
              elements: [{
                type: 'ClickableElement',
                name: 'Submit',
                options: lib.extend({
                },this.config.editsubmit,{
                }
              }]
              */
            })
          }
        ]
      }
    });
    /*
    logic.push({
      triggers: formname+'.changeableelementchange.$element!click',
      references: formname+'.changeableelementdisplay, '+formname+'.changeableelementedit',
      handler: function(infoEl, editEl){
        var infoActual, editActual;
        infoActual = infoEl.get('actual');
        editActual = editEl.get('actual');
        infoEl.set('actual', !infoActual);
        editEl.set('actual', !editActual);
      }
    });
    */
  };
  ChangeableElementModifier.prototype.DEFAULT_CONFIG = function () {
    return {};
  };

  applib.registerModifier('SocialProfileChangeableElement', ChangeableElementModifier);
}

module.exports = createChangeableElement;

},{}],3:[function(require,module,exports){
function createChangeableElementIntegrator (lib, applib) {
  'use strict';

  var BasicModifier = applib.BasicModifier;
  
  function ChangeableElementIntegrator (options) {
    BasicModifier.call(this, options);
    if (!options.profileProperty){
      throw new lib.Error('NO_PROFILE_PROPERTY_SPECIFIED', 'Profile property must be specified for ChangableElementIntegrator');
    }
  }
  lib.inherit(ChangeableElementIntegrator, BasicModifier);
  ChangeableElementIntegrator.prototype.doProcess = function (name, options, links, logic, resources) {
    var profileProperty = this.config.profileProperty, ph;
    ph = {
      source: 'datasource.'+this.config.elementdatasourcename+':data',
      target: 'element.'+this.config.changeableelementcontainername+':' + profileProperty
    };
    links.push(ph);
    logic.push({
      triggers: 'element.'+this.config.changeableelementcontainername+'!submit',
      references: '.>updateProfile',
      handler: function (upfunc, submitdata) {
        upfunc([profileProperty, submitdata[profileProperty]]);
      }
    });
  };
  ChangeableElementIntegrator.prototype.DEFAULT_CONFIG = function () {
    return {};
  }

  applib.registerModifier('SocialProfileChangeableElementIntegrator', ChangeableElementIntegrator);
}

module.exports = createChangeableElementIntegrator;

},{}],4:[function(require,module,exports){
function createChangeablePicture (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  var BasicModifier = applib.BasicModifier,
    DivElement = applib.getElementType('DivElement'),
    o = templateslib.override,
    m = htmltemplateslib;


  function ShouldUploadElement (id, options) {
    DivElement.call(this, id, options);
    this.editShown = new lib.HookCollection();
    this.shouldUpload = new lib.HookCollection();
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

},{}],5:[function(require,module,exports){
function createChangeablePictureIntegrator (lib, applib) {
  'use strict';

  var BasicModifier = applib.BasicModifier;
  
  function ChangeablePictureIntegrator (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit(ChangeablePictureIntegrator, BasicModifier);
  ChangeablePictureIntegrator.prototype.doProcess = function (name, options, links, logic, resources) {
    var bound_fields = this.config.bound_fields;
    links.push({
      source: 'datasource.'+this.config.picturedatasourcename+':data',
      target: 'element.'+this.config.changeablepicturecontainername+':picture'
    });
    logic.push({
      triggers: 'element.'+this.config.changeablepicturecontainername+'!shouldUpload',
      references: 'element.'+this.config.changeablepicturecontainername+',element.'+this.config.uploaderelementname,
      handler: function (pic, pictureUploadURL, file) {
        console.log('pictureUploadURL.upload?', pic, pictureUploadURL, file, bound_fields);
        var blob;
        if (!file.contents) {
          console.warn('no contents in', file);
          return;
        }
        blob = srcToBlob(file.contents);
        blob.name = file.data.name;
        console.log('blob.size', blob.size);
        lib.request(pictureUploadURL.url, {
          method: 'POST',
          parameters: lib.extend({
            file: blob
          }, bound_fields, file.pic),
          onComplete: console.log.bind(console, 'request'),
          onError: console.error.bind(console, 'request')
        });
      }
    });
  };
  ChangeablePictureIntegrator.prototype.DEFAULT_CONFIG = function () {
    return {};
  }

  function srcToB64 (src) {
    var commaindex = src.indexOf(','),
      b64 = src.substr(commaindex+1);
    return b64;
  }

  function srcToBlob (src) {
    var commaindex = src.indexOf(','),
      b64 = src.substr(commaindex+1),
      colonindex = src.indexOf(':'),
      semicolonindex = src.indexOf(';'),
      type = src.substring(colonindex+1, semicolonindex),
      b64b = atob(b64),
      bytess = [],
      bytes,
      chunksize = 512,
      processsize,
      i,
      j;
    //console.log('type', type);
    //console.log('length', b64b.length);
    for (i=0; i<b64b.length; i+=chunksize) {
      processsize = (i+chunksize>b64b.length ? b64b.length-i : chunksize);
      bytes = new Array(processsize);
      for (j=0; j<processsize; j++) {
        bytes[j] = b64b.charCodeAt(i+j);
      }
      bytess.push(new Uint8Array(bytes));
      //console.log('pushed', bytes.length, 'bytes');
    }
    //console.log('all bytes', bytess.reduce(chunker, 0));
    return new Blob(bytess);//, {type: type});
  }
  function chunker (result, chunk) {
    //console.log('chunk size', chunk.length);
    return result+chunk.length;
  }

  applib.registerModifier('SocialProfileChangeablePictureIntegrator', ChangeablePictureIntegrator);
}

module.exports = createChangeablePictureIntegrator;

},{}],6:[function(require,module,exports){
function createEditPicture (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  var BasicModifier = applib.BasicModifier,
    DivElement = applib.getElementType('DivElement'),
    o = templateslib.override,
    m = htmltemplateslib;

  function EditPictureElement (id, options) {
    DivElement.call(this, id, options);
    this.OK = new lib.HookCollection();
    this.Cancel = new lib.HookCollection();
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

},{}],7:[function(require,module,exports){
function createModifiers (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  require('./changeableelementcreator')(lib, applib, templateslib, htmltemplateslib);
  require('./changeableelementintegratorcreator')(lib, applib);
  require('./editpicturecreator')(lib, applib, templateslib, htmltemplateslib);
  require('./changeablepicturecreator')(lib, applib, templateslib, htmltemplateslib);
  require('./changeablepictureintegratorcreator')(lib, applib);
  //require('./chatwidgetcreator')(lib, applib, templateslib, htmltemplateslib);
}

module.exports = createModifiers;

},{"./changeableelementcreator":2,"./changeableelementintegratorcreator":3,"./changeablepicturecreator":4,"./changeablepictureintegratorcreator":5,"./editpicturecreator":6}],8:[function(require,module,exports){
function createPrePreprocessors (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  require('./initcreator')(lib, applib);
  require('./profiledatasourcecreator')(lib, applib);
}

module.exports = createPrePreprocessors;

},{"./initcreator":9,"./profiledatasourcecreator":10}],9:[function(require,module,exports){
function createInitPrePreprocessor (lib, applib) {
  'use strict';
  var BasicProcessor = applib.BasicProcessor;

  function ProfileInitPrePreprocessor () {
    BasicProcessor.call(this);
  }
  lib.inherit(ProfileInitPrePreprocessor, BasicProcessor);
  ProfileInitPrePreprocessor.prototype.process = function (desc) {
    var _environmentname, _profilefields;
    
    _environmentname = this.config.environment;
    desc.preprocessors = desc.preprocessors || [];
    desc.preprocessors.Command = desc.preprocessors.Command || [];
    desc.preprocessors.Command.push({
      environment: _environmentname,
      entity: {
        name: 'updateProfile',
        options: {
          sink: '.',
          name: 'updateProfile'
        }
      }
    },{
      environment: _environmentname,
      entity: {
        name: 'updateProfileFromHash',
        options: {
          sink: '.',
          name: 'updateProfileFromHash'
        }
      }
    });

    _profilefields = this.config.profilefields;
    if (lib.isArray(_profilefields)) {
      desc.preprocessors.DataSource = desc.preprocessors.DataSource || [];
      desc.preprocessors.DataSource.push.apply(desc.preprocessors.DataSource, _profilefields.map(datasourcer.bind(null, _environmentname)));
    }

    this.firePrePreprocessor('ProfileDataSource', this.config, desc);

    _environmentname = null;
  };

  function datasourcer (_environmentname, profilefieldname) {
    var pn = 'profile_'+profilefieldname;
    return {
      environment: _environmentname,
      entity: {
        name: pn,
        type: 'allexstate',
        options: {
          path: pn,
          sink: '.'
        }
      }
    }
  }

  applib.registerPrePreprocessor('SocialProfileInit', ProfileInitPrePreprocessor);
}
module.exports = createInitPrePreprocessor;

},{}],10:[function(require,module,exports){
function profilizer (item) {
  return 'datasource.profile_'+item+':data';
}

function createProfileDataSourcePrePrerocessor (lib, applib) {
  'use strict';

  function profileUpdater (profflds) {
    var env, ds, data, profile, i;
    env = arguments[1];
    ds = env.dataSources ? env.dataSources.get('profile') : null;
    if (!ds) {
      return;
    }
    data = Array.prototype.slice.call(arguments, 2);
    profile = {};
    /*
    console.log('profileUpdater!');
    console.log('profile fields', profflds);
    console.log('datasource', ds);
    console.log('data', data);
    */
    for (i=0; i<profflds.length; i++) {
      profile[profflds[i]] = data[i];
    }
    ds.setData(profile);
  }

  var BasicProcessor = applib.BasicProcessor;

  function ProfileDataSourcePrePreprocessor () {
    BasicProcessor.call(this);
  }
  lib.inherit(ProfileDataSourcePrePreprocessor, BasicProcessor);
  ProfileDataSourcePrePreprocessor.prototype.process = function (desc) {
    var _environmentname = this.config.environment;
    var _pflds = this.config.profilefields;
    desc.preprocessors = desc.preprocessors || {};
    desc.preprocessors.DataSource = desc.preprocessors.DataSource || [];
    desc.preprocessors.DataSource.push({
      environment: _environmentname,
      entity: {
        name: 'profile',
        type: 'jsdata',
        options: {
          data: null
        }
      }
    });
    if (lib.isArray(_pflds) && _pflds.length>0) {
      var tstr = _pflds.map(profilizer).join(',');
      console.log('triggers?', tstr);
      desc.logic = desc.logic || [];
      desc.logic.push({
        triggers:tstr,
        references: 'environment.'+_environmentname,
        handler: profileUpdater.bind(null, _pflds)
      });
    }
  };

  applib.registerPrePreprocessor('ProfileDataSource', ProfileDataSourcePrePreprocessor);
}
module.exports = createProfileDataSourcePrePrerocessor;

},{}]},{},[1]);

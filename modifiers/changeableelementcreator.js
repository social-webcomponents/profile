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

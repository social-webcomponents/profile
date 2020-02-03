function createChangeableElement (lib, applib, templateslib, htmltemplateslib) {
  'use strict';

  var BasicModifier = applib.BasicModifier,
    AngularFormLogic = applib.getElementType('AngularFormLogic'),
    o = templateslib.override,
    m = htmltemplateslib;


  function createMarkup (options) {
    return o(m.div,
      'CONTENTS', o(m.div,
        'CLASS', 'changeableelementcontainer',
        'CONTENTS', [
          o(m.button,
            'CLASS', 'changeableelement-change',
            'CONTENTS', 'Change'
          ),
          o(m.div,
            'CLASS', 'changeableelement-info',
            'CONTENTS', [
              o(m.div,
                'CONTENTS', options.profileProperty + ': ' + createElementInfo(options)
              )
            ]
          ),
          o(m.form,
            'CLASS', 'changeableelement-edit',
            'CONTENTS', [
              createInputField(options),
              o(m.button,
                'CLASS', 'changeableelementcontainersubmit',
                'ATTRS', 'type="submit"',
                'CONTENTS', 'Update'
              )
            ]
          )
        ]
      )
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
    ret = '{{_ctrl.data.' + options.profileProperty + '}}';
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
          'NAME', options.profileProperty,
          'CONTENTS', optionArry
        );
        break;
      case 'text':
      default:
        ret = o(m.textinput,
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
  ProfileInfoElement.prototype.genericSetter = function (options, pp, value) {
    this.updateHashField(pp, value);
  };
  ProfileInfoElement.prototype.genericGetter = function (pp) {
    return this.get('data')[pp];
  };
  /*
  ProfileInfoElement.prototype.set_nick = function (nick) {
    this.updateHashField('nick', nick);
  };
  ProfileInfoElement.prototype.get_nick = function () {
    return this.get('data').nick;
  };
  */
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
        onInitialized: function (me) {
          me.set('data', {disabled: true});
        },
        profileProperty: profileProperty,
        valueMap: valueMap,
        elements: [
          {
            name: 'changeableelement-change',
            type: 'WebElement',
            options: {
              self_selector: '.',
              actual: true
            }
          },
          {
            name: 'changeableelement-info',
            type: 'WebElement',
            options: {
              self_selector: '.',
              actual: true
            }
          },
          {
            name: 'changeableelement-edit',
            type: 'WebElement',
            options: {
              self_selector: '.',
              actual: false
            }
          }
        ]
      }
    });
    logic.push({
      triggers: formname+'.changeableelement-change.$element!click',
      references: formname+'.changeableelement-info, '+formname+'.changeableelement-edit',
      handler: function(infoEl, editEl){
        var infoActual, editActual;
        infoActual = infoEl.get('actual');
        editActual = editEl.get('actual');
        infoEl.set('actual', !infoActual);
        editEl.set('actual', !editActual);
      }
    });
  };
  ChangeableElementModifier.prototype.DEFAULT_CONFIG = function () {
    return {};
  };

  applib.registerModifier('SocialProfileChangeableElement', ChangeableElementModifier);
}

module.exports = createChangeableElement;

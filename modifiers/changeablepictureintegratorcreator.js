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

sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
  "use strict";
  return UIComponent.extend("com.d3.demo.Component", {
    metadata: {
      // instantiates the resource model thanks to the app descriptor
      manifest: "json"
    },

    init: function() {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      // set local data model (schedule.json)
      //var oConfig = this.getMetadata().getConfig();
      //var sNamespace = this.getMetadata().getManifestEntry("sap.app").id;
      
      // mapping to the property "modelLocal" in the "config" property of the app descriptor
      //var oLocalModel = new JSONModel(jQuery.sap.getModulePath(sNamespace, oConfig.modelLocal));
      //this.setModel(oLocalModel);
      // create the views based on the url/hash
      this.getRouter().initialize();
    }
  });
});
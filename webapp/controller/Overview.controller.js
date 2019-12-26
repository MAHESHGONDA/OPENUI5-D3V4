sap.ui.define(['sap/ui/core/mvc/Controller'
], function(Controller) {
	'use strict';
	return Controller.extend('com.d3.demo.controller.Overview', {

		onInit: function() {
			var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("com.d3.demo.model", "/data.json"));
			this.getView().setModel(oModel);

			var uiModel = new sap.ui.model.json.JSONModel({
				"name": "",
				"street": "",
				"houseNumber": "",
				"zipCode": "",
				"city": "",
				"country": ""
			});
			this.getView().setModel(uiModel, "uimodel");
		},
		onNodeClickTrigger: function(evt) {
			var oModel = this.getView().getModel("uimodel");
			oModel.setProperty("/", evt.getParameter('data'));
		}

	});
});
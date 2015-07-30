
  /**
  * mainApp Module
  *
  * Just an app for testing out the module
  */
  angular.module('mainApp', ["componentModule"]).controller("TestCtrl", function(){
    this.selectedDate = new Date();
  });
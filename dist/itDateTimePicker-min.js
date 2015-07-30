!function(){angular.module("component-templates",[]),angular.module("componentModule",["component-templates"]).filter("numberFixedLen",function(){return function(a,b){var c=parseInt(a,10);if(b=parseInt(b,10),isNaN(c)||isNaN(b))return a;for(c=""+c;c.length<b;)c="0"+c;return c}}).directive("arrowRight",function(){return{retrict:"E",templateUrl:"component/templates/arrow_right.svg"}}).directive("arrowLeft",function(){return{retrict:"E",templateUrl:"component/templates/arrow_left.svg"}}).directive("itTimePicker",function(){return{restrict:"E",require:"?ngModel",templateUrl:"component/templates/time.tpl.html",link:function(a,b,c,d){a.options={showHours:!0,selectedHour:10,selectedMinute:20},a.isAM=!1,a.setAM=function(b){a.isAM!=b&&(b?a.selectedDate.setHours(a.selectedDate.getHours()-12):a.selectedDate.setHours(a.selectedDate.getHours()+12),a.isAM=b)},d&&(d.$render=function(){a.selectedDate=d.$modelValue,a.isAM=a.selectedDate.getHours()<12,a.options.selectedHour=(a.selectedDate.getHours()+11)%12+1,a.options.selectedMinute=a.selectedDate.getMinutes()},a.$watch("options.selectedMinute",function(b){void 0!==b&&a.selectedDate.setMinutes(b)}),a.$watch("options.selectedHour",function(b){void 0!==b&&(a.isAM?12==b?a.selectedDate.setHours(0):a.selectedDate.setHours(b):a.selectedDate.setHours(b+12))}))}}}).directive("clockFace",["$filter",function(a){function b(a,b,c){var d=document.createElementNS(q,"text");d.setAttributeNS(null,"x",b),d.setAttributeNS(null,"y",c),d.setAttributeNS(null,"font-size",p),d.setAttributeNS(null,"text-anchor","middle"),0===a&&(a="00");var e=document.createTextNode(a);return d.appendChild(e),d}function c(a,c,e,f,g,h){var i=[];e=e||1,f=void 0!=f?f:1,c.html("");for(var j=0;a>j;j+=e){var k,l=d(a,j,o,g);k=h&&j%h!=0?"":r(f+j);var m=b(k,l.x,l.y);i.push({element:m,radians:l.radians,value:f+j}),c.append(m)}return i}function d(a,b,c,d){d=void 0!=d?d:Math.PI/3;var e=2*Math.PI*b/a-d;return{radians:e,x:Math.cos(e)*c+l,y:Math.sin(e)*c+m+5}}function e(a){var b=document.createElementNS(q,"circle");b.setAttributeNS(null,"cx",""+l),b.setAttributeNS(null,"cy",""+m),b.setAttributeNS(null,"r",""+n),a.append(b)}function f(a){a[0].style.transform="rotate(90deg)",a[0].style["transform-origin"]="100px 100px";var b=document.createElementNS(q,"circle");b.setAttributeNS(null,"cx",""+l),b.setAttributeNS(null,"cy",""+m),b.setAttributeNS(null,"r","2"),a.append(b);var c=document.createElementNS(q,"circle");c.setAttributeNS(null,"cx",""+(l+n-21)),c.setAttributeNS(null,"cy",""+m),c.setAttributeNS(null,"r","20"),a.append(c);var d=document.createElementNS(q,"line");d.setAttributeNS(null,"x1",""+l),d.setAttributeNS(null,"y1",""+m),d.setAttributeNS(null,"x2",""+(l+n-1)),d.setAttributeNS(null,"y2",""+m),a.append(d)}function g(){for(var a=0;a<k.length;a++){var b=k[a];b.selected?b.element.style.fill="white":b.element.style.fill="grey"}}function h(a){for(var b,c=Number.MAX_VALUE,d=0;d<k.length;d++){var e=k[d];e.selected=!1;var f=Math.min(Math.abs(Math.abs(a-e.radians)-2*Math.PI),Math.abs(a-e.radians));c>f&&(c=f,b=e)}return b.selected=!0,g(),b}function i(a,b){a[0].style.transform="rotate("+b+"rad)"}var j,k,l=100,m=100,n=100,o=80,p="15",q="http://www.w3.org/2000/svg",r=(Math.PI,a("numberFixedLen"));return{restrict:"E",templateUrl:"component/templates/clock_face.svg",scope:{options:"="},link:function(a,b,d){function l(){if(!u){u=!0,a.options&&(a.options.showHours=u),k=p,s[0].style.opacity=1,s[0].style.transform="scale(1)",t[0].style.opacity=0,t[0].style.transform="scale(1.5)";var b=n(p,a.options.selectedHour);i(r,b.radians)}}function m(){if(u){u=!1,a.options&&(a.options.showHours=u),a.$apply(),k=o,s[0].style.opacity=0,s[0].style.transform="scale(1.5)",t[0].style.opacity=1,t[0].style.transform="scale(1)";var b=n(o,a.options.selectedMinute);i(r,b.radians)}}function n(a,b){for(var c=0;c<a.length;c++){var d=a[c];if(d.selected=!1,parseInt(d.value)==b)return d.selected=!0,d}}var o,p,q=angular.element(b.find("g")[0]),r=angular.element(b.find("g")[1]),s=angular.element(b.find("g")[2]),t=angular.element(b.find("g")[3]),u=!1;e(q),f(r),p=c(12,s,1,1,Math.PI/3),o=c(60,t,1,0,Math.PI/2,5),l(),a.$watch("options.showHours",function(b){void 0!==b&&(r[0].style.transition="all linear .2s",setTimeout(function(){a.options.showHours===!0?l():u&&setTimeout(m,0),setTimeout(function(){r[0].style.transition="none"},500)},0))}),a.$watch("options.selectedHour",function(b){if(void 0!==b){var c=n(p,a.options.selectedHour);g(),u&&i(r,c.radians)}}),a.$watch("options.selectedMinute",function(b){if(void 0!==b){var c=n(o,a.options.selectedMinute);g(),u||i(r,c.radians)}}),q.on("click",function(b){if(!j){var c=Math.atan2(b.offsetY-100,b.offsetX-100),d=h(c);i(r,d.radians),u?(a.options.selectedHour=d.value,a.$apply(),setTimeout(m,1e3)):(a.options.selectedMinute=d.value,a.$apply())}j=!1});var v;q.on("mousedown touchstart",function(){q.on("mousemove touchmove",function(b){b.preventDefault(),j=!0;var c,d;b.touches?(c=b.touches[0].clientX-b.target.getBoundingClientRect().left,d=b.touches[0].clientY-b.target.getBoundingClientRect().top):(c=b.offsetX,d=b.offsetY),v=Math.atan2(d-100,c-100);var e=h(v);i(r,e.radians),u?a.options.selectedHour=e.value:a.options.selectedMinute=e.value,a.$apply()}),b.on("mouseup mouseout touchend",function(){if(j){var c=h(v);i(r,c.radians),u?setTimeout(m,500):a.options.selectedMinute=c.value}q.off("mousemove touchmove"),b.off("mouseup mouseout touchend")})})}}}]).directive("itDateTimePicker",function(){return{restrict:"E",require:"?ngModel",templateUrl:"component/templates/calendar.tpl.html",link:function(a,b,c,d){d&&(a.increaseMonth=function(){d.$modelValue.setMonth(d.$modelValue.getMonth()+1)},a.decreaseMonth=function(){d.$modelValue.setMonth(d.$modelValue.getMonth()-1)},a.increaseYear=function(){d.$modelValue.setYear(1900+d.$modelValue.getYear()+1)},a.decreaseYear=function(){d.$modelValue.setYear(1900+d.$modelValue.getYear()-1)},d.$render=function(){a.selectedDate=d.$modelValue})}}}).directive("datesContainer",["$compile",function(a){function b(a,b){return new Date(b,a+1,0).getDate()}function c(a,c){for(var d="",e=new Date(c+1900,a,1).getDay(),f=b(a,c+1900),g=Math.ceil((e+f)/7),h=1,i=0;g>i;i++){d+='<div flex layout="row" layout-fill>';var j=0;if(0==i)for(;e>j;j++)d+="<span flex></span>";for(;7>j&&f>=h;j++)if(d+='<span flex layout-align="center center" layout="row"><button class="date-button" ng-class="{\'selected-date\':isDateSelected('+h+')}">'+h+"</button></span>",h++,h>f)for(j+=1;7>j;j++)d+="<span flex></span>";d+="</div>"}return d}var d,e,f;return{restrict:"E",scope:{selectedDate:"="},link:function(b,g,h){function i(d,e){g.html(""),g.append(a(c(d,e))(b))}g.on("click",function(a){a.target instanceof HTMLButtonElement&&(d=a.target.innerHTML,b.selectedDate.setDate(d),b.$apply())}),b.$watch("selectedDate",function(){var a=b.selectedDate.getMonth(),c=b.selectedDate.getYear();(e!=a||f!=c)&&(i(a,c),e=a,f=c),d=b.selectedDate.getDate()},!0),b.isDateSelected=function(a){return d==a}}}}])}(),angular.module("component-templates",["component/templates/arrow_left.svg","component/templates/arrow_right.svg","component/templates/calendar.tpl.html","component/templates/clock_face.svg","component/templates/testTemplate.tpl.html","component/templates/time.tpl.html"]),angular.module("component/templates/arrow_left.svg",[]).run(["$templateCache",function(a){a.put("component/templates/arrow_left.svg",'<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"\n  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg\n   width="40"\n   height="40"\n   viewBox="0 0 100 100"\n   version="1.1"\n   xmlns="http://www.w3.org/2000/svg">\n  <g>\n    <path\n       class="arrow-left"\n       d="m 100,0 -75,50 75,50 z"/>\n  </g>\n</svg>\n')}]),angular.module("component/templates/arrow_right.svg",[]).run(["$templateCache",function(a){a.put("component/templates/arrow_right.svg",'<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"\n  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg\n   width="40"\n   height="40"\n   viewBox="0 0 100 100"\n   version="1.1"\n   xmlns="http://www.w3.org/2000/svg">\n  <g>\n    <path\n       class="arrow-right"\n       d="m 0,0 75,50 -75,50 z"/>\n  </g>\n</svg>\n')}]),angular.module("component/templates/calendar.tpl.html",[]).run(["$templateCache",function(a){a.put("component/templates/calendar.tpl.html",'<!--Selected Date Display-->\n<div flex="33" layout="column">\n\n  <div    class="selected-date-display md-whiteframe-z1"\n          flex="33"\n          layout="column"\n          layout-align="center center">\n\n    <div    class="day"\n            layout-fill\n            layout="row"\n            layout-align="center center">\n      <span>{{selectedDate | date:\'EEEE\'}}</span>\n    </div>\n    <div    class="month"\n            layout-fill\n            layout="row"\n            layout-align="center center">\n      <arrow-left ng-click="decreaseMonth()">\n      </arrow-left>\n      <span>{{selectedDate | date:\'MMM\'}}</span>\n      <arrow-right ng-click="increaseMonth()">\n      </arrow-right>\n    </div>\n    <div    class="date"\n            layout-fill\n            layout="row"\n            layout-align="center center">\n      {{selectedDate | date:\'d\'}}\n    </div>\n    <div    class="year"\n            layout-fill\n            layout="row"\n            layout-align="center center">\n      <arrow-left ng-click="decreaseYear()">\n      </arrow-left>\n      <span>{{selectedDate | date:\'yyyy\'}}</span>\n      <arrow-right ng-click="increaseYear()">\n      </arrow-right>\n    </div>\n\n  </div>\n  <div class="date-picker-area"\n       flex\n          layout="column"\n       layout-fill\n          layout-align="center center">\n    <div class="month-year-header" flex="100">\n      {{selectedDate | date:\'MMMM yyyy\'}}\n    </div>\n    <div class="days-of-week" flex="100" layout="row" layout-fill>\n      <span flex style="text-align: center">S</span>\n      <span flex style="text-align: center">M</span>\n      <span flex style="text-align: center">T</span>\n      <span flex style="text-align: center">W</span>\n      <span flex style="text-align: center">T</span>\n      <span flex style="text-align: center">F</span>\n      <span flex style="text-align: center">S</span>\n    </div>\n    <dates-container flex layout-fill selected-date="selectedDate">\n    </dates-container>\n  </div>\n</div>')}]),angular.module("component/templates/clock_face.svg",[]).run(["$templateCache",function(a){a.put("component/templates/clock_face.svg",'<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"\n  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg\n   width="200"\n   height="200"\n   viewBox="0 0 200 200"\n   version="1.1"\n   xmlns="http://www.w3.org/2000/svg">\n  <g class="clock-background"></g>\n  <g class="circle-layer"></g>\n  <g class="numbers-container"></g>\n  <g class="numbers-container2"></g>\n</svg>\n')}]),angular.module("component/templates/testTemplate.tpl.html",[]).run(["$templateCache",function(a){a.put("component/templates/testTemplate.tpl.html","<div>testing</div>")}]),angular.module("component/templates/time.tpl.html",[]).run(["$templateCache",function(a){a.put("component/templates/time.tpl.html",'<!--Selected Date Display-->\n<div flex="33" layout="column" class="material-time">\n\n  <div    class="selected-time-display md-whiteframe-z1"\n          flex="33"\n          layout="column"\n          layout-align="center center">\n\n    <div    layout-fill\n            layout="row"\n            layout-align="center end">\n      <span class="time" ng-class="{\'active\':options.showHours}" ng-click="options.showHours = true">{{options.selectedHour}}:</span>\n      <span class="time" ng-class="{\'active\':!options.showHours}" ng-click="options.showHours = false">{{options.selectedMinute|numberFixedLen:2}}</span>\n      <div layout="column">\n\n        <span class="am" ng-class="{\'active\':isAM}" ng-click="setAM(true)">AM</span>\n        <span class="pm" ng-class="{\'active\':!isAM}" ng-click="setAM(false)">PM</span>\n      </div>\n    </div>\n\n  </div>\n  <div    class="circle-time-selection"\n          layout-fill\n          flex\n          layout="column"\n          layout-align="center center">\n    <clock-face options="options">\n    </clock-face>\n  </div>\n\n</div>')}]);
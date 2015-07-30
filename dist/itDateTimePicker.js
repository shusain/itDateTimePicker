(function(){

  /**
   * componentModule Module
   *
   * Description
   */
  angular.module('component-templates',[]);
  angular.module('componentModule', ['component-templates'])
    .filter('numberFixedLen', function () {
      return function (n, len) {
        var num = parseInt(n, 10);
        len = parseInt(len, 10);
        if (isNaN(num) || isNaN(len)) {
          return n;
        }
        num = ''+num;
        while (num.length < len) {
          num = '0'+num;
        }
        return num;
      };
    })
    //Simply loads some SVG but as opposed to an img this allows the elements to be styled using CSS and classes in the
    //SVG itself
    .directive('arrowRight', function(){
      return {
        retrict:'E',
        templateUrl:'component/templates/arrow_right.svg'
      }
    })

    .directive('arrowLeft', function(){
      return {
        retrict:'E',
        templateUrl:'component/templates/arrow_left.svg'
      }
    })


    .directive('itTimePicker', function(){
      return {
        restrict:'E',
        require: '?ngModel', // get a hold of NgModelController
        templateUrl:'component/templates/time.tpl.html',
        link:function(scope, iElem, iAttrs, ngModel){
          scope.options = {
            showHours:true,
            selectedHour:10,
            selectedMinute:20
          };
          scope.isAM = false;

          scope.setAM = function(val){
            if(scope.isAM == val) return;

            if(val)
              scope.selectedDate.setHours(scope.selectedDate.getHours()-12)
            else
              scope.selectedDate.setHours(scope.selectedDate.getHours()+12)

            scope.isAM = val;
          }

          if(!ngModel) return;

          // Specify how UI should be updated
          ngModel.$render = function(){
            //console.log(ngModel.$modelValue);
            scope.selectedDate = ngModel.$modelValue;

            scope.isAM = scope.selectedDate.getHours() < 12;

            scope.options.selectedHour = ((scope.selectedDate.getHours() + 11) % 12) + 1;
            scope.options.selectedMinute = scope.selectedDate.getMinutes();
          }
          scope.$watch('options.selectedMinute', function(newVal){
            if(newVal===undefined) return;
            scope.selectedDate.setMinutes(newVal);
          })
          scope.$watch('options.selectedHour', function(newVal){
            if(newVal===undefined) return;
            if(scope.isAM){
              if(newVal==12)
                scope.selectedDate.setHours(0);
              else
                scope.selectedDate.setHours(newVal);
            }
            else
              scope.selectedDate.setHours(newVal+12);

          })


          // Write data to the model
          function read() {
            var html = element.html();
            // When we clear the content editable the browser leaves a <br> behind
            // If strip-br attribute is provided then we strip this out
            if ( attrs.stripBr && html == '<br>' ) {
              html = '';
            }
            ngModel.$setViewValue(html);
          }
        }
      }
    })

    //Used for drawing the circular time selection element
    .directive('clockFace', ['$filter', function($filter){
      var cx = 100;
      var cy = 100;
      var backgroundRadius = 100;
      var numRadius = 80;
      var fontSize = "15";
      var svgNS = "http://www.w3.org/2000/svg";
      var mouseMoved;
      var PI = Math.PI;
      var TAU = 2*PI;
      var showingElements;
      var numberFunction = $filter('numberFixedLen');

      function createTextElement(text,x,y){
        var newText = document.createElementNS(svgNS,"text");
        newText.setAttributeNS(null,"x",x);
        newText.setAttributeNS(null,"y",y);
        newText.setAttributeNS(null,"font-size",fontSize);
        newText.setAttributeNS(null,"text-anchor","middle");

        if(text === 0)
          text = "00";
        var textNode = document.createTextNode(text);
        newText.appendChild(textNode);
        return newText;
      }

      function addNumbers(max, container, offset, skip, radianOffset, displayOffset){
        var textElements = [];
        offset = offset || 1;
        skip = skip!=undefined?skip:1;
        //Empty the container out
        container.html('');

        for(var i=0; i < max; i+=offset){
          var textValue;
          var point = computePosition(max, i, numRadius,radianOffset);

          if(!displayOffset || i%displayOffset==0)
            textValue = numberFunction(skip+i);
          else
            textValue = '';

          var textElement = createTextElement(textValue, point.x, point.y);
          textElements.push({element:textElement, radians:point.radians, value:skip+i});
          container.append(textElement);
        }
        return textElements;
      }

      function computePosition(max,current,distance,radianOffset){
        radianOffset=radianOffset!=undefined?radianOffset:Math.PI/3;
        var radians = 2 * Math.PI * current/max-radianOffset;
        return {
          radians:radians,
          x:Math.cos(radians)*distance +cx,
          y:Math.sin(radians)*distance +cy+5
        };
      }

      function createClockBackground(container){
        var circle = document.createElementNS(svgNS,"circle");
        circle.setAttributeNS(null,"cx",""+cx);
        circle.setAttributeNS(null,"cy",""+cy);
        circle.setAttributeNS(null,"r",""+backgroundRadius);
        container.append(circle);
      }

      function createCirclesAndLine(container){
        container[0].style['transform'] = "rotate(90deg)";
        container[0].style['transform-origin'] = "100px 100px";
        var circle1 = document.createElementNS(svgNS,"circle");
        circle1.setAttributeNS(null,"cx",""+cx);
        circle1.setAttributeNS(null,"cy",""+cy);
        circle1.setAttributeNS(null,"r",""+2);
        container.append(circle1);

        var circle2 = document.createElementNS(svgNS,"circle");
        circle2.setAttributeNS(null,"cx",""+(cx+backgroundRadius-21));
        circle2.setAttributeNS(null,"cy",""+cy);
        circle2.setAttributeNS(null,"r",""+20);
        container.append(circle2);

        var line = document.createElementNS(svgNS,"line");
        line.setAttributeNS(null,"x1",""+cx);
        line.setAttributeNS(null,"y1",""+cy);
        line.setAttributeNS(null,"x2",""+(cx+backgroundRadius-1));
        line.setAttributeNS(null,"y2",""+(cy));
        container.append(line);
      }
      function highlightText(){

        for(var i=0; i<showingElements.length;i++){
          var curElement = showingElements[i];
          if(curElement.selected)
            curElement.element.style.fill="white"
          else
            curElement.element.style.fill="grey"
        }
      }
      function findClosest(checkAngle){
        var minAngle = Number.MAX_VALUE;
        var closest;

        for(var i=0; i<showingElements.length;i++){
          var curElement = showingElements[i];
          curElement.selected = false;
          var difference = Math.min(Math.abs(Math.abs(checkAngle-curElement.radians)-2*Math.PI), Math.abs(checkAngle-curElement.radians));
          if(difference<minAngle){
            minAngle = difference;
            closest = curElement;
          }
        }

        closest.selected = true;
        highlightText();
        return closest;

      }

      function animateTo(container, angle){
        //console.log(angle);
        container[0].style['transform'] = "rotate("+angle+"rad)";
      }

      return {
        restrict:'E',
        templateUrl:'component/templates/clock_face.svg',
        scope:{
          options:'='
        },
        link:function(scope, iElem, iAttrs){
          var clockBackground = angular.element(iElem.find('g')[0]);
          var selectedCircleLayer = angular.element(iElem.find('g')[1]);
          var hourTextContainer = angular.element(iElem.find('g')[2]);
          var minuteTextContainer = angular.element(iElem.find('g')[3]);
          var showingHours = false;
          var minuteElements, hourElements;

          // Creates the clock face background
          createClockBackground(clockBackground);

          // Creates the indicator for pointing to the selected value
          createCirclesAndLine(selectedCircleLayer);


          // Shows the hour text values and sets the array to check positions against to the hours array
          function showHours(){
            if(showingHours) return;
            showingHours = true;
            if(scope.options){
              scope.options.showHours = showingHours;
            }
            showingElements = hourElements;
            hourTextContainer[0].style.opacity = 1;
            hourTextContainer[0].style.transform = "scale(1)";
            minuteTextContainer[0].style.opacity = 0;
            minuteTextContainer[0].style.transform = "scale(1.5)";

            var foundElement = findInElements(hourElements, scope.options.selectedHour);
            animateTo(selectedCircleLayer, foundElement.radians);
          }

          // Shows the minute text values and sets the array to check positions against to the minutes array
          function showMinutes(){
            if(!showingHours) return;

            showingHours = false;

            if(scope.options){
              scope.options.showHours = showingHours;
            }
            scope.$apply();

            showingElements = minuteElements;

            hourTextContainer[0].style.opacity = 0;
            hourTextContainer[0].style.transform = "scale(1.5)";
            minuteTextContainer[0].style.opacity = 1;
            minuteTextContainer[0].style.transform = "scale(1)";

            var foundElement = findInElements(minuteElements, scope.options.selectedMinute);
            animateTo(selectedCircleLayer, foundElement.radians);
          }

          function findInElements(elements,value){
            for(var i=0; i<elements.length; i++){
              var curElement = elements[i];
              curElement.selected = false;
              if(parseInt(curElement.value) == value){
                curElement.selected = true;
                return curElement;
              }
            }
          }

          hourElements = addNumbers(12, hourTextContainer, 1, 1, Math.PI/3);
          minuteElements = addNumbers(60, minuteTextContainer, 1, 0, Math.PI/2, 5);
          showHours();

          // Watch for changes to showHours on the scope in case a parent scope wants to indicate that the hours should
          // be shown again (ie a user clicks the hour)
          scope.$watch('options.showHours', function(newVal){
            if(newVal === undefined) return;

            selectedCircleLayer[0].style['transition'] = "all linear .2s";

            setTimeout(function(){

              if(scope.options.showHours === true){
                showHours();
              }
              else if(showingHours){
                setTimeout(showMinutes, 0);
              }
              setTimeout(function(){
                selectedCircleLayer[0].style['transition'] = "none";
              },500)
            },0)
          });

          // Watch for changes to showHours on the scope in case a parent scope wants to indicate that the hours should
          // be shown again (ie a user clicks the hour)
          scope.$watch('options.selectedHour', function(newVal){
            //console.log('selectedHour', newVal)
            if(newVal === undefined) return;
            var foundElement = findInElements(hourElements, scope.options.selectedHour);
            highlightText();
            if(showingHours){
              animateTo(selectedCircleLayer, foundElement.radians);
            }
          });

          // Watch for changes to showHours on the scope in case a parent scope wants to indicate that the hours should
          // be shown again (ie a user clicks the hour)
          scope.$watch('options.selectedMinute', function(newVal){
            //console.log('selectedMinute', newVal)
            if(newVal === undefined) return;
            var foundElement = findInElements(minuteElements, scope.options.selectedMinute);
            highlightText();
            if(!showingHours)
              animateTo(selectedCircleLayer, foundElement.radians);
          });

          clockBackground.on('click',function(event){
            if(!mouseMoved){
              var angle = Math.atan2(event.offsetY-100,event.offsetX-100);
              //console.log('click', angle);
              var closest = findClosest(angle);
              animateTo(selectedCircleLayer, closest.radians);

              if(showingHours){
                scope.options.selectedHour = closest.value;
                scope.$apply();
                setTimeout(showMinutes, 1000);
              }
              else{
                scope.options.selectedMinute = closest.value;
                scope.$apply();
              }
            }
            mouseMoved = false;

          });
          var curAngle;
          clockBackground.on('mousedown touchstart',function(){
            clockBackground.on('mousemove touchmove', function(event){
              event.preventDefault();
              mouseMoved = true;
              var x, y;
              if(event.touches){

                x = event.touches[0].clientX - event.target.getBoundingClientRect().left;
                y = event.touches[0].clientY - event.target.getBoundingClientRect().top;
              }
              else{
                x = event.offsetX;
                y = event.offsetY;
              }
              curAngle = Math.atan2(y-100,x-100);
              var closest = findClosest(curAngle);

              animateTo(selectedCircleLayer, closest.radians);

              if(showingHours){
                scope.options.selectedHour = closest.value;
              }else{
                scope.options.selectedMinute = closest.value;
              }
              scope.$apply();

            })
            iElem.on('mouseup mouseout touchend', function(){
              if(mouseMoved){
                var closest = findClosest(curAngle);
                animateTo(selectedCircleLayer, closest.radians);

                if(showingHours){
                  setTimeout(showMinutes, 500);
                }
                else{
                  scope.options.selectedMinute = closest.value;
                }
              }

              clockBackground.off('mousemove touchmove');
              iElem.off('mouseup mouseout touchend');
            })
          })
        }
      }
    }])


    .directive('itDateTimePicker', function(){
      return {
        restrict:'E',
        require: '?ngModel', // get a hold of NgModelController
        templateUrl:'component/templates/calendar.tpl.html',
        link:function(scope, iElem, iAttrs, ngModel){

          if(!ngModel) return;
          scope.increaseMonth = function(){
            ngModel.$modelValue.setMonth(ngModel.$modelValue.getMonth()+1);
          }
          scope.decreaseMonth = function(){
            ngModel.$modelValue.setMonth(ngModel.$modelValue.getMonth()-1);
          }
          scope.increaseYear = function(){
            ngModel.$modelValue.setYear(1900+ngModel.$modelValue.getYear()+1);
          }
          scope.decreaseYear = function(){
            ngModel.$modelValue.setYear(1900+ngModel.$modelValue.getYear()-1);
          }

          // Specify how UI should be updated
          ngModel.$render = function(){
            //console.log(ngModel.$modelValue);
            scope.selectedDate = ngModel.$modelValue;
          }


          // Write data to the model
          function read() {
            var html = element.html();
            // When we clear the content editable the browser leaves a <br> behind
            // If strip-br attribute is provided then we strip this out
            if ( attrs.stripBr && html == '<br>' ) {
              html = '';
            }
            ngModel.$setViewValue(html);
          }
        }
      }
    })

    .directive('datesContainer', ['$compile', function($compile){

      function getDaysInMonth(m, y) {
        //console.log('days in ',m,y)
        return new Date(y, m+1, 0).getDate();
      }

      function changeDisplayedDates(m,y){
        var datesDisplay = '';
        var firstDay = new Date(y+1900, m, 1).getDay(); //Gets the number of spacer boxes needed before the first day
        var daysInMonth = getDaysInMonth(m,y+1900);

        //console.log(m,y,firstDay,daysInMonth)

        var numberOfRows =  Math.ceil((firstDay+daysInMonth)/7);

        //Create rows
        var dateInMonth = 1;
        for(var i=0;i<numberOfRows;i++){
          datesDisplay += '<div flex layout="row" layout-fill>';

          var j=0;
          if(i==0){
            //Adds some empties before the first date
            for(;j<firstDay;j++){
              datesDisplay+='<span flex></span>';
            }
          }
          for(;j<7&&dateInMonth<=daysInMonth;j++){
            datesDisplay+='<span flex layout-align="center center" layout="row">' +
                          '<button class="date-button" ng-class="{\'selected-date\':isDateSelected('+dateInMonth+')}">' +
                          dateInMonth +
                          '</button>' +
                          '</span>';
            dateInMonth++;
            if(dateInMonth>daysInMonth)
            {
              for(j=j+1;j<7;j++){
                datesDisplay+='<span flex></span>';
              }
            }
          }
          datesDisplay += '</div>';
        }
        return datesDisplay;
      }


      var _selectedDate, old_m, old_y;
      return {
        restrict:'E',
        scope:{
          selectedDate:'='
        },
        link:function(scope,iElem,iAttrs){
          iElem.on('click', function(event){
            if(event.target instanceof HTMLButtonElement){
              _selectedDate = event.target.innerHTML;
              scope.selectedDate.setDate(_selectedDate);
              scope.$apply();
            }
          });

          function rebuildCalendar(m,y){
            //console.log('rebuilding calendar')
            iElem.html('');
            iElem.append($compile(changeDisplayedDates(m,y))(scope));
          }
          scope.$watch('selectedDate', function(){
            var new_m = scope.selectedDate.getMonth();
            var new_y = scope.selectedDate.getYear();
            // Only rebuild the calendar if the month or year changed
            // otherwise bindings will update the view
            if(old_m!=new_m || old_y!=new_y){
              rebuildCalendar(new_m,new_y);
              old_m=new_m;
              old_y=new_y;
            }
            _selectedDate = scope.selectedDate.getDate();
          }, true);

          scope.isDateSelected = function(date){
            return _selectedDate == date;
          }
        }
      }
    }])

  ;

})()
;angular.module('component-templates', ['component/templates/arrow_left.svg', 'component/templates/arrow_right.svg', 'component/templates/calendar.tpl.html', 'component/templates/clock_face.svg', 'component/templates/testTemplate.tpl.html', 'component/templates/time.tpl.html']);

angular.module("component/templates/arrow_left.svg", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("component/templates/arrow_left.svg",
    "<?xml version=\"1.0\" standalone=\"no\"?>\n" +
    "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n" +
    "  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
    "<svg\n" +
    "   width=\"40\"\n" +
    "   height=\"40\"\n" +
    "   viewBox=\"0 0 100 100\"\n" +
    "   version=\"1.1\"\n" +
    "   xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "  <g>\n" +
    "    <path\n" +
    "       class=\"arrow-left\"\n" +
    "       d=\"m 100,0 -75,50 75,50 z\"/>\n" +
    "  </g>\n" +
    "</svg>\n" +
    "");
}]);

angular.module("component/templates/arrow_right.svg", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("component/templates/arrow_right.svg",
    "<?xml version=\"1.0\" standalone=\"no\"?>\n" +
    "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n" +
    "  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
    "<svg\n" +
    "   width=\"40\"\n" +
    "   height=\"40\"\n" +
    "   viewBox=\"0 0 100 100\"\n" +
    "   version=\"1.1\"\n" +
    "   xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "  <g>\n" +
    "    <path\n" +
    "       class=\"arrow-right\"\n" +
    "       d=\"m 0,0 75,50 -75,50 z\"/>\n" +
    "  </g>\n" +
    "</svg>\n" +
    "");
}]);

angular.module("component/templates/calendar.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("component/templates/calendar.tpl.html",
    "<!--Selected Date Display-->\n" +
    "<div flex=\"33\" layout=\"column\">\n" +
    "\n" +
    "  <div    class=\"selected-date-display md-whiteframe-z1\"\n" +
    "          flex=\"33\"\n" +
    "          layout=\"column\"\n" +
    "          layout-align=\"center center\">\n" +
    "\n" +
    "    <div    class=\"day\"\n" +
    "            layout-fill\n" +
    "            layout=\"row\"\n" +
    "            layout-align=\"center center\">\n" +
    "      <span>{{selectedDate | date:'EEEE'}}</span>\n" +
    "    </div>\n" +
    "    <div    class=\"month\"\n" +
    "            layout-fill\n" +
    "            layout=\"row\"\n" +
    "            layout-align=\"center center\">\n" +
    "      <arrow-left ng-click=\"decreaseMonth()\">\n" +
    "      </arrow-left>\n" +
    "      <span>{{selectedDate | date:'MMM'}}</span>\n" +
    "      <arrow-right ng-click=\"increaseMonth()\">\n" +
    "      </arrow-right>\n" +
    "    </div>\n" +
    "    <div    class=\"date\"\n" +
    "            layout-fill\n" +
    "            layout=\"row\"\n" +
    "            layout-align=\"center center\">\n" +
    "      {{selectedDate | date:'d'}}\n" +
    "    </div>\n" +
    "    <div    class=\"year\"\n" +
    "            layout-fill\n" +
    "            layout=\"row\"\n" +
    "            layout-align=\"center center\">\n" +
    "      <arrow-left ng-click=\"decreaseYear()\">\n" +
    "      </arrow-left>\n" +
    "      <span>{{selectedDate | date:'yyyy'}}</span>\n" +
    "      <arrow-right ng-click=\"increaseYear()\">\n" +
    "      </arrow-right>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "  <div class=\"date-picker-area\"\n" +
    "       flex\n" +
    "          layout=\"column\"\n" +
    "       layout-fill\n" +
    "          layout-align=\"center center\">\n" +
    "    <div class=\"month-year-header\" flex=\"100\">\n" +
    "      {{selectedDate | date:'MMMM yyyy'}}\n" +
    "    </div>\n" +
    "    <div class=\"days-of-week\" flex=\"100\" layout=\"row\" layout-fill>\n" +
    "      <span flex style=\"text-align: center\">S</span>\n" +
    "      <span flex style=\"text-align: center\">M</span>\n" +
    "      <span flex style=\"text-align: center\">T</span>\n" +
    "      <span flex style=\"text-align: center\">W</span>\n" +
    "      <span flex style=\"text-align: center\">T</span>\n" +
    "      <span flex style=\"text-align: center\">F</span>\n" +
    "      <span flex style=\"text-align: center\">S</span>\n" +
    "    </div>\n" +
    "    <dates-container flex layout-fill selected-date=\"selectedDate\">\n" +
    "    </dates-container>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("component/templates/clock_face.svg", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("component/templates/clock_face.svg",
    "<?xml version=\"1.0\" standalone=\"no\"?>\n" +
    "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\"\n" +
    "  \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n" +
    "<svg\n" +
    "   width=\"200\"\n" +
    "   height=\"200\"\n" +
    "   viewBox=\"0 0 200 200\"\n" +
    "   version=\"1.1\"\n" +
    "   xmlns=\"http://www.w3.org/2000/svg\">\n" +
    "  <g class=\"clock-background\"></g>\n" +
    "  <g class=\"circle-layer\"></g>\n" +
    "  <g class=\"numbers-container\"></g>\n" +
    "  <g class=\"numbers-container2\"></g>\n" +
    "</svg>\n" +
    "");
}]);

angular.module("component/templates/testTemplate.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("component/templates/testTemplate.tpl.html",
    "<div>testing</div>");
}]);

angular.module("component/templates/time.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("component/templates/time.tpl.html",
    "<!--Selected Date Display-->\n" +
    "<div flex=\"33\" layout=\"column\" class=\"material-time\">\n" +
    "\n" +
    "  <div    class=\"selected-time-display md-whiteframe-z1\"\n" +
    "          flex=\"33\"\n" +
    "          layout=\"column\"\n" +
    "          layout-align=\"center center\">\n" +
    "\n" +
    "    <div    layout-fill\n" +
    "            layout=\"row\"\n" +
    "            layout-align=\"center end\">\n" +
    "      <span class=\"time\" ng-class=\"{'active':options.showHours}\" ng-click=\"options.showHours = true\">{{options.selectedHour}}:</span>\n" +
    "      <span class=\"time\" ng-class=\"{'active':!options.showHours}\" ng-click=\"options.showHours = false\">{{options.selectedMinute|numberFixedLen:2}}</span>\n" +
    "      <div layout=\"column\">\n" +
    "\n" +
    "        <span class=\"am\" ng-class=\"{'active':isAM}\" ng-click=\"setAM(true)\">AM</span>\n" +
    "        <span class=\"pm\" ng-class=\"{'active':!isAM}\" ng-click=\"setAM(false)\">PM</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "  <div    class=\"circle-time-selection\"\n" +
    "          layout-fill\n" +
    "          flex\n" +
    "          layout=\"column\"\n" +
    "          layout-align=\"center center\">\n" +
    "    <clock-face options=\"options\">\n" +
    "    </clock-face>\n" +
    "  </div>\n" +
    "\n" +
    "</div>");
}]);

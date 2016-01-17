var CalagatorWidget = function(config) {
  this.container = config.container;
  this.eventsURL = config.eventsURL;

  this.eventTemplate = config.eventTemplate ||
    this.container.querySelector('.event');

  var numDays = config.numDays || 14;
  var startDate = config.startDate || moment(); // today
  var endDate = config.endDate || startDate.clone().add(numDays, 'days')

  this.fetchURL = this.eventsURL + '.json'
    + "?date[start]=" + startDate.format('YYYY-MM-DD')
    + "&date[end]=" + endDate.format('YYYY-MM-DD');
}

CalagatorWidget.forElement = function(elem) {
  return new CalagatorWidget({
    container: elem,
    eventsURL: elem.getAttribute('data-url'),
    numDays: parseInt(elem.getAttribute('data-days'))
  });
};

CalagatorWidget.prototype = {
  load: function() {
    loadingElem = this.container.querySelector('.loading')

    this.eventTemplate.style.display = 'none';
    loadingElem.style.display = '';

    this.fetchEvents(this.fetchURL, this.populateEvents);

    loadingElem.style.display = 'none';
  },

  fetchEvents: function(url, success) {
    var jsonpCallback = 'c' + Math.random().toString(36).substring(8);

    var that = this;
    window[jsonpCallback] = function(data) {
      delete(window[jsonpCallback]);
      success.call(that, data);
    }

    var scriptElem = document.createElement('script');
    scriptElem.setAttribute('src', url + '&callback=' + jsonpCallback);
    document.body.appendChild(scriptElem);
  },

  populateEvents: function(events) {
    var container = this.container;
    var eventTemplate = this.eventTemplate;

    var that = this;
    events.forEach(function(event) {
      var eventElem = eventTemplate.cloneNode(true);
      var elem;

      ['title', 'description'].forEach(function(field) {
        var elem = eventElem.querySelectorAll('.' + field)
        that.populateText(elem, event[field]);
      });

      elems = eventElem.querySelectorAll('.venue-title');
      that.populateText(elems, (event.venue||{}).title);

      elems = eventElem.querySelectorAll('.show-link');
      value = that.eventsURL + '/' + encodeURIComponent(event.id);
      that.populateHref(elems, value);

      elems = eventElem.querySelectorAll('.url');
      that.populateHref(elems, value);

      elems = eventElem.querySelectorAll('.start-time');
      that.populateDate(elems, event.start_time);

      elems = eventElem.querySelectorAll('.end-time');
      that.populateDate(elems, event.end_time);

      container.appendChild(eventElem);
      eventElem.style.display = '';
    });
  },

  populateText: function(elems, value) {
    if (elems.length === 0 || !value) { return }

    Array.prototype.forEach.call(elems, function(elem) {
      if ((limit = elem.getAttribute('data-limit'))) {
        value = value.substr(0, parseInt(limit));
      }

      elem.textContent = value;
    });
  },

  populateDate: function(elems, value) {
    if (elems.length === 0 || !value) { return }

    Array.prototype.forEach.call(elems, function(elem) {
      format = elem.getAttribute('data-format') || 'LLLL';
      elem.textContent = moment(value).format(format);
    });
  },

  populateHref: function(elems, value) {
    if (elems.length === 0 || !value) { return }

    Array.prototype.forEach.call(elems, function(elem) {
      elem.setAttribute('href', value);
    });
  }

}

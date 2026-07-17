(function () {
  'use strict';

  const API_BASE = '/api/v1/notifications';

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const csrftoken = getCookie('csrftoken');

  const NotificationBadge = {
    init: function () {
      this.container = document.getElementById('notification-container');
      if (!this.container) return;

      this.badge = this.container.querySelector('.notification-badge');

      this.fetchUnreadCount();
      this.startPolling();
    },

    startPolling: function () {
      var self = this;
      setInterval(function () { self.fetchUnreadCount(); }, 30000);
    },

    fetchUnreadCount: function () {
      var self = this;
      fetch(API_BASE + '/unread_count/')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var count = data.unread_count || 0;
          if (count > 0) {
            self.badge.textContent = count > 99 ? '99+' : count;
            self.badge.style.display = 'flex';
          } else {
            self.badge.style.display = 'none';
          }
        })
        .catch(function () {});
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    NotificationBadge.init();
  });
})();

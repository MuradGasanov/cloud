/**
 * Author: Murad Gasanov
 */

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

(function($) {
    $(function (e) {
        window.k_noty = $("#k-notification").kendoNotification({
            autoHideAfter: 0,
            stacking: "down",
            templates: [
                {
                    type: "error",
                    template: $("#errorTemplate").html()
                },
                {
                    type: "wait",
                    template: $("#keepCalmTemplate").html()
                },
                {
                    type: "done",
                    template: $("#doneTemplate").html()
                }
            ],
            show: function (e) {
                var margin = "-{0}px 0 0 -{1}px".format(
                    Math.floor(e.element.height() / 2),
                    Math.floor(e.element.width() / 2)
                );
                e.element.parent().css({left: "50%", top: "50%", margin: margin});
            }
        }).data("kendoNotification");

        var last_time_out_id = 0;

        window.noti = function(option, type, time) {
            if (option == "hide") {
                k_noty.hide();
                return false;
            }
            time =  typeof time === 'undefined' ? 3000 : time;
            k_noty.hide();
            k_noty.show(option, type);
            clearTimeout(last_time_out_id);
            last_time_out_id = setTimeout(function() {
                k_noty.hide();
            }, time);
            return false;
        }
    })
})(jQuery);
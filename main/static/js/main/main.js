/**
 * Author: Murad Gasanov.
 */

var App = (function(){

    $(window).on("show_nii", function() {
        $(".tree.section").slideUp();
        $(".nii.section").slideDown();
    });

    $(window).on("show_tree", function() {
        $(".tree.section").slideDown();
        $(".nii.section").slideUp();
    });

    return {
        init: function(){
            Project_tree.run();
            Nii.run();
        }
    }
})();

(function ($) {
    $(function() {
        App.init();
    })
})(jQuery);
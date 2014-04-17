/**
 * Author: Murad Gasanov.
 */
var Nii = (function () {
    return {
        run: function () {
            $("#back").click(function () {
                $(window).trigger("show_tree");
            });

            $("#nii").kendoComboBox({
                data: new kendo.dataSource({
                    transport: {
                        read: function(options) {
                            $.ajax({
                                url: PROJECT_TREE_BASE_URL + "nii/read/",
                                dataType: "json",
                                type: "POST",
                                data: { },
                                success: function (result) {
                                    options.success.(result);
                                },
                                error: function (result) {
                                    options.error(result);
                                }
                            });
                        }
                    }
                })
            });
        }
    }
})();
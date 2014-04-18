/**
 * Author: Murad Gasanov.
 */
var Nii = (function () {
    return {
        run: function () {
            $("#back").click(function () {
                $(window).trigger("show_tree");
            });

            var validator_option = {
                rules: {
                    required: function (input) {
                        if (input.is("[required]")) {
                            input.val($.trim(input.val())); //удалить обертывающиепробелы
                            return input.val() !== "";
                        } else return true;
                    }
                },
                messages: {
                    required: "Поле не может быть пустым"
                }
            };

            var MESSAGE = {
                error: "Ошибка: ",
                wait: "Загрузка...",
                done: "Выполнено"
            };

             var PROJECT_TREE_BASE_URL = "project_tree/",
                 NII_BASE_URL = "nii";

            $("#nii").kendoComboBox({
                dataSource: {
                    transport: {
                        read: function(options) {
                            $.ajax({
                                url: PROJECT_TREE_BASE_URL + "nii/read/",
                                dataType: "json",
                                type: "POST",
                                data: {},
                                success: function (result) {
                                    options.success(result);
                                },
                                error: function (result) {
                                    noti({title: MESSAGE.error + result.status, message: result.statusText}, "error");
                                    options.error(result);
                                }
                            });
                        }
                    }
                },
                dataTextField: "name",
                dataValueField: "id",
                filter: "contains",
                change: function(e) {
                    var that = this;
                    var val = that.value();
                    console.log(val);
                }
            });

            var direction_model = kendo.observable({
                is_edit: false,
                o: {
                    id: 0,
                    university: null,
                    university_list: [],
                    name: ""
                }
            });
            var $change_direction = $("#change_direction");
            kendo.bind($change_direction, direction_model);
            var direction_validator = $change_direction.kendoValidator(validator_option).data("kendoValidator");
            var $change_direction_window = $("#change_direction_window");
        }
    }
})();
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

            var DONE_TIME_OUT = 1500;

            var PROJECT_TREE_BASE_URL = "project_tree/",
                NII_BASE_URL = "nii/";

            var $nii_name = $("#nii_name"),
                $nii_university = $("#nii_university");

            var nii_projects = $("#nii_projects").kendoGrid({
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: function (options) {
                            var data = options.data;
                            data = typeof data == "undefined" ? {} : data;
                            $.ajax({
                                type: "POST",
                                url: NII_BASE_URL + "get_project/",
                                data: { item: JSON.stringify(data) },
                                dataType: "json",
                                success: function (result) {
                                    options.success(result);
                                },
                                error: function (result) {
                                    noti({title: MESSAGE.error + result.status, message: result.statusText}, "error");
                                    options.error(result);
                                }
                            });
                        }
                    },
                    schema: {
                        model: {
                            id: "id",
                            fields: { name: {type: "string"} }
                        }
                    }
                },
                height: 400,
                sortable: true,
                editable: {
                    mode: "inline",
                    confirmation: "Вы уверены, что хотите удалить запись?",
                    confirmDelete: "Да",
                    cancelDelete: "Нет"
                },
                columns: [
                    { field: "name", title: "Название" }
                ]
            }).data("kendoGrid");

            var nii_employee = $("#nii_employee").kendoGrid({
                autoBind: false,
                dataSource: {
                    type: "json",
                    transport: {
                        read: {},
                        destroy: {},
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                return {item: kendo.stringify(options)};
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "subdivision_id",
                            fields: { name: {type: "string"}, tel: {type: "string"} }
                        }
                    }
                },
                toolbar: [
                    { template: kendo.template($("#nii_employee_header_template").html()) }
                ],
                height: 500,
                sortable: true,
                editable: {
                    mode: "inline",
                    confirmation: "Вы уверены, что хотите удалить запись?",
                    confirmDelete: "Да",
                    cancelDelete: "Нет"
                },
                columns: [
                    { field: "name", title: "Название" },
                    { field: "tel", title: "Телефон", width: "300px", attributes: {title: "#=tel#"} },
                    { command: [
                        {   text: "Редактировать",
                            click: function (e) {
                            }
                        },
                        { name: "destroy", text: "Удалить" }
                    ], width: "250px", attributes: { style: "text-align: center;"} }
                ]
            }).data("kendoGrid");

            var nii = $("#nii").kendoComboBox({
                dataSource: {
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: NII_BASE_URL + "read/",
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
                cascade: function () {
                    var that = this;
                    var val = that.value();
                    var dataItem = that.dataSource.get(val);
                    if (dataItem) {
                        $nii_name.text("Пректы " + (dataItem.name ? dataItem.name : ""));
                        nii_projects.dataSource.read({id: dataItem.id});
                        $(".add_nii_employee").data("nii-id", dataItem.id);

                    }
                    console.log(dataItem);
                }
            }).data("kendoComboBox");

            var employee_model = kendo.observable({
                is_edit: false,
                post_list: new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: "post/read/",
                                dataType: "json",
                                type: "POST",
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
                }),
                o: {
                    id: 0,
                    name: "",
                    surname: "",
                    patronymic: "",
                    tel: "",
                    mail: "",
                    post: null,
                    nii_id: null
                }
            });
            var $change_employee = $("#change_employee");
            kendo.bind($change_employee, employee_model);
            var employee_validator = $change_employee.kendoValidator(validator_option).data("kendoValidator");
            var $change_employee_window = $("#change_employee_window");

            var nii_model = kendo.observable({
                is_edit: false,
                university_list: new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: "university/read/",
                                dataType: "json",
                                type: "POST",
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
                }),
                o: {
                    id: 0,
                    university: null,
                    name: ""
                }
            });
            var $change_nii = $("#change_nii");
            kendo.bind($change_nii, nii_model);
            var nii_validator = $change_nii.kendoValidator(validator_option).data("kendoValidator");
            var $change_nii_window = $("#change_nii_window");

            $(".nii_new").click(function () {
                nii_model.set("is_edit", false);
                nii_model.get("university_list").read();
                nii_model.set("o", {
                    id: 0,
                    name: "",
                    university: null
                });
                $change_nii_window.modal("show");
            });

            $(".nii_edit").click(function () {
                var val = nii.value(),
                    dataItem = nii.dataSource.get(val);
                if (typeof dataItem == "undefined") return false;

                nii_model.set("is_edit", true);
                nii_model.set("o", {
                    id: dataItem.id,
                    name: dataItem.name,
                    university: dataItem.university
                });
                $change_nii_window.modal("show");
            });

            function nii_response_handler(data) {
                noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                nii.dataSource.read();
                nii_model.get("university_list").read();
                $change_nii_window.modal("hide");

                $(window).trigger("nii_update_complete", data);

                var val = nii.value();
                if (typeof nii.dataSource.get(val) == "undefined") {
                    nii.value(data.id);
                }
            }

            $("#nii_save").click(function () {
                if (!nii_validator.validate()) return false;
                var send = nii_model.get("o");
                noti({message: MESSAGE.wait}, "wait");
                $.post(NII_BASE_URL + (nii_model.get("is_edit") ? "update/" : "create/"),
                    {item: JSON.stringify(send) }, nii_response_handler, "json").fail(function (data) {
                        noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                        $change_nii_window.modal("hide");
                    });
                return false;
            });

            $(window).on("show_nii", function (e, id) {
                nii.value(id);
            });

        }
    }
})();
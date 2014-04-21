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
                detailTemplate: kendo.template($("#nii_projects_detail_template").html()),
                detailInit: function (e) {
                    var detailRow = e.detailRow;
                    detailRow.find("p").text(e.data.description);
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
                        read: function (options) {
                            var data = options.data;
                            data = typeof data == "undefined" ? {} : data;
                            $.ajax({
                                type: "POST",
                                url: "employee/read",
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
                        },
                        destroy: function (options) {
                            var data = options.data;
                            data = typeof data == "undefined" ? {} : data;
                            $.ajax({
                                type: "POST",
                                url: "employee/destroy",
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
                            fields: {
                                name: { type: "string" },
                                surname: { type: "string"  },
                                patronymic: { type: "string" },
                                tel: { type: "string" },
                                mail: { type: "string" },
                                post__id: { type: "string" },
                                post__name: { type: "string" },
                                nii__id: { type: "string" },
                                nii__name: { type: "string" }
                            }
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
                    { command: [
                        {  name: "custom-edit",
                            click: function (e) {
                                var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                                $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                                employee_model.set("is_edit", "true");
                                employee_model.set("o", {
                                    id: dataItem.id,
                                    name: dataItem.name,
                                    surname: dataItem.surname,
                                    patronymic: dataItem.patronymic,
                                    tel: dataItem.tel,
                                    mail: dataItem.mail,
                                    post: dataItem.post__id,
                                    nii_id: dataItem.nii__id
                                });
                                $change_employee_window.modal("show");
                                return false;
                            },
                            template: "<a class='k-button k-grid-custom-edit'><span class='k-icon k-edit '></span></a>"
                        }
                    ], title: " ", width: 46 },
                    { field: "surname", title: "ФИО", template: "#= [surname, name, patronymic].join(' ') #" },
                    { field: "post__name", title: "Должность", attributes: {title: "#=post__name#"} },
                    { command: [
                        { name: "destroy",
                            template: "<a class='k-button k-grid-delete'><span class='k-icon k-delete'></span></a>"
                        }
                    ], title: " ", width: 46 }
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
                        $nii_name.text(
                            "Пректы " +
                                (dataItem.name ? dataItem.name : "") +
                                (dataItem.university_name !== "" ? " ("+dataItem.university_name+")": "")
                        );
                        nii_projects.dataSource.read({id: dataItem.id});
                        nii_employee.dataSource.read({id: dataItem.id});
                        $(".add_nii_employee").data("nii-id", dataItem.id)
                            .removeClass("k-state-disabled");
                        $(".nii_edit").removeClass("k-state-disabled");
                        $(".nii_delete").removeClass("k-state-disabled");
                    } else {
                        $(".add_nii_employee").addClass("k-state-disabled");
                        $(".nii_edit").addClass("k-state-disabled");
                        $(".nii_delete").addClass("k-state-disabled");
                    }
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

            $(".add_nii_employee").click(function() {
                if ($(this).hasClass("k-state-disabled")) { return false; }
                $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                var nii_id = $(this).data("nii-id");
                employee_model.set("is_edit", false);
                employee_model.set("o", {
                    id: 0,
                    name: "",
                    surname: "",
                    patronymic: "",
                    tel: "",
                    mail: "",
                    post: null,
                    nii_id: nii_id
                });
                $change_employee_window.modal("show");
                return false;
            });

            function employee_response_handler(d) {
                var data = nii_employee.dataSource;
                var item = data.get(d.id);
                if (item) {
                    item.name = d.name;
                    item.surname = d.surname;
                    item.patronymic = d.patronymic;
                    item.tel = d.tel;
                    item.mail = d.mail;
                    item.post__id = d.post__id;
                    item.post__name = d.post__name;
                    item.nii__id = d.nii__id;
                    item.nii__name = d.nii__name;
                } else {
                    item = {
                        id : d.id,
                        name: d.name,
                        surname: d.surname,
                        patronymic: d.patronymic,
                        tel: d.tel,
                        mail: d.mail,
                        post__id: d.post__id,
                        post__name: d.post__name,
                        nii__id: d.nii__id,
                        nii__name: d.nii__name
                    };
                    data.add(item);
                }
                nii_employee.refresh();
                employee_model.get("post_list").read();
                noti();
                $change_employee_window.modal("hide");
            }

            $("#employee_save").click(function () {
                if (!employee_validator.validate()) return false;
                var send = employee_model.get("o");
                noti({message: MESSAGE.wait}, "wait");
                $.post("employee/" + (employee_model.get("is_edit") ? "update/" : "create/"),
                    { item: JSON.stringify(send) }, employee_response_handler, "json").fail(function (data) {
                        noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                        $change_employee_window.modal("hide");
                    });
                return false;
            });

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
                return false;
            });

            $(".nii_edit").click(function () {
                if ($(this).hasClass("k-state-disabled")) return false;
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
                return false;
            });

            $(".nii_delete").click(function () {
                if ($(this).hasClass("k-state-disabled")) return false;
                var val = nii.value(),
                    dataItem = nii.dataSource.get(val);
                if (typeof dataItem == "undefined") return false;
                if (!confirm("Вы уверены, что хотите удалить запись?")) return false;
                noti({message: MESSAGE.wait}, "wait");
                $.post(NII_BASE_URL + "destroy/", { item: JSON.stringify({ id: dataItem.id }) }, function(data) {
                    noti();

                    nii.dataSource.read();
                    nii.value(null);
                    $nii_name.text("");
                    nii_projects.dataSource.data("");
                    nii_employee.dataSource.data("");

                    $(window).trigger("nii_delete_complete", data);

                }, "json").fail(function (data) {
                    noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                    $change_nii_window.modal("hide");
                });
                return false;
            });

            function nii_response_handler(data) {
                noti();
                nii.dataSource.read();
                nii_model.get("university_list").read();
                $change_nii_window.modal("hide");

                $(window).trigger("nii_update_complete", data);

                var val = nii.value();
                if (typeof nii.dataSource.get(val) == "undefined") {
                    nii.value(data.id);
                }
                return false;
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
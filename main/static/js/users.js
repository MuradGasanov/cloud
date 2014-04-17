/**
 * Author: Murad Gasanov.
 */

(function ($) {
    $(function () {

        var USERS_URL = "users/";

        function get_height() {
            return 500;
            var h = $(window).height()-50-40-20-4;
            if (h > 500) {
                return h;
            } else {
                return 500;
            }
        }

        var users = $("#users").kendoGrid({
            dataSource: {
                type: "json",
                transport: {
                    read: {
                        url: USERS_URL + "read/",
                        dataType: "json",
                        type: "POST"
                    },
                    destroy: {
                        url: USERS_URL + "destroy/",
                        dataType: "json",
                        type: "POST"
                    },
                    parameterMap: function (options, operation) {
                        if (operation !== "read" && options) {
                            return {
                                item: kendo.stringify(options)
                            };
                        } else if (operation == "read" && options) {
                            return kendo.stringify(options);
                        }
                    }
                },
                schema: {
                    model: {
                        id: "id",
                        fields: {
                            username: { type: "string" },
                            first_name: { type: "string" },
                            email: { type: "string" },
                            is_superuser: { type: "boolean" }
                        }
                    }
                },
                requestEnd: function (e) {
                }
            },
            toolbar: [
                { template: kendo.template($("#users_header_template").html()) }
            ],
            height: get_height(),
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
                            user_model.set("o", {
                                is_user_edit: true,
                                id: dataItem.id,
                                username: dataItem.username,
                                password: "",
                                first_name: dataItem.first_name,
                                email: dataItem.email,
                                is_superuser: dataItem.is_superuser
                            });
                            $change_users_window.modal("show");
                        },
                        template: "<a class='k-button k-grid-custom-edit'><span class='k-icon k-edit '></span></a>"
                    }
                ], title: " ", width: 46 },
                { field: "username", title: "Логин", width: 250},
                { field: "first_name", title: "Имя", width: 250},
                { field: "email", title: "Почта" },
                { field: "is_superuser", title: "Администратор",
                    template: "# if(is_superuser) { # Да # }else{ # Нет # } #",
                    attributes: { style: "text-align: center;"} },
                { command: [
                    {
                        name: "destroy",
                        template: "<a class='k-button k-grid-delete'><span class='k-icon k-delete'></span></a>"
                    }
                ], title: " ", width: 46
                }
            ]
        }).data("kendoGrid");

        var user_model = kendo.observable({
            o: {
                id: 0,
                username: "",
                is_user_edit: false,
                password: "",
                first_name: "",
                email: "",
                is_superuser: false
            }
        });
        var $change_users = $("#change_users"),
            $change_users_window = $("#change_users_window");
        kendo.bind($change_users, user_model);
        var user_validator = $change_users.kendoValidator({
            rules: {
                required: function (input) {
                    if (input.is("[required]")) {
                        input.val($.trim(input.val())); //удалить обертывающие пробелы
                        if (input.is("[name='password']") && user_model.get("o.is_user_edit")) { //не чекать пасс при редактировании
                            return true;
                        }
                        return input.val() !== "";
                    } else return true;
                },
                unique_username: function (input) {
                    input.val($.trim(input.val()));
                    var val = input.val();
                    if (input.is("[name='username']")) {
                        var data = users.dataSource.data();
                        var is_unique = $.grep(data, function (o) {
                            return o.username == val;
                        });
                        return is_unique.length == 0;
                    } else return true;
                }
            },
            messages: {
                required: "Поле не может быть пустым",
                unique_username: "Такой пользователь уже существует"
            }
        }).data("kendoValidator");

        $(".add_user").click(function (e) {
            $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
            user_model.set("o", {
                is_user_edit: false,
                id: 0,
                username: "",
                password: "",
                first_name: "",
                email: "",
                is_superuser: ""
            });
            $change_users_window.modal("show");
        });

        function check_users_subdivision(d) {
            var data = users.dataSource;
            var item = data.get(d.id);
            if (item) {
                item.username = d.username;
                item.first_name = d.first_name;
                item.email = d.email;
                item.is_superuser = d.is_superuser;
            } else {
                item = {
                    id: d.id,
                    username: d.username,
                    first_name: d.first_name,
                    email: d.email,
                    is_superuser: d.is_superuser
                };
                data.add(item);
            }
            users.refresh();
            $change_users_window.modal("hide");
        }

        $("#user_save").click(function (e) {
            if (!user_validator.validate()) return false;
            var o = user_model.get("o");
            var send = {
                id: o.id,
                username: o.username,
                password: o.password,
                first_name: o.first_name,
                email: o.email,
                is_superuser: o.is_superuser
            };
            if (o.is_user_edit) {
                $.post(USERS_URL + "update/",
                    {item: JSON.stringify(send) }, check_users_subdivision, "json");
            } else {
                $.post(USERS_URL + "create/",
                    {item: JSON.stringify(send) }, check_users_subdivision, "json");
            }
            return false;
        });

        var $reload_users = $(".reload_users");
        $reload_users.click(function () {
            users.dataSource.read();
            users.refresh();
            return false;
        });
    })
})(jQuery);
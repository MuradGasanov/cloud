/**
 * Author: Murad Gasanov.
 */

(function($) {
    $(function() {

        var MESSAGE = {
            error: "Ошибка: ",
            wait: "Загрузка..."
        };

        $("#logout").click(function () {
            document.location.href='/logout/';
        });

        var change_password_window = $("#change_password_window"),
            new_password_input = change_password_window.find("[name=new_password]");

        var change_password_model = kendo.observable({
            current_password: "",
            new_password: "",
            show_password: function (e) {
                var type = new_password_input.attr("type");
                if (type === "text") {
                    new_password_input.attr("type", "password");
                } else {
                    new_password_input.attr("type", "text");
                }
            }
        });
        kendo.bind("#change_password", change_password_model);

        var password_validator = $("#change_password").kendoValidator({
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
            }).data("kendoValidator");

        $("#change_password_button").click(function () {
            new_password_input.attr("type", "password");
            change_password_model.set("current_password", "");
            change_password_model.set("new_password", "");
            change_password_window.modal("show");
        });

        $("#password_save").click(function () {
            if (!password_validator.validate()) return false;
            var send = {
                current_password: change_password_model.get("current_password"),
                new_password: change_password_model.get("new_password")
            };
            noti({message: MESSAGE.wait}, "wait");
            $.post("/change_password/", {item: JSON.stringify(send)}, function (data) {
                if (data.status === "ok") {
                    noti();
                    change_password_window.modal("hide");
                } else {
                    noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                }
            }, "json").fail(function (data) {
                noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
            });
            return false;
        });
    })
})(jQuery);
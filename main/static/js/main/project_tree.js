/**
 * Author: Murad Gasanov.
 */
var Project_tree = (function () {
    return {
        run: function () {
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
                dataSource = new kendo.data.HierarchicalDataSource({
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: PROJECT_TREE_BASE_URL + "read/",
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
                    },
                    schema: {
                        model: {
                            id: "id",
                            hasChildren: "has_items",
                            children: "items"
                        }
                    }
                });


            var node = null;

            var $project_tree = $("#project_tree");
            var project_tree = $project_tree.kendoTreeView({
                dataSource: dataSource,
                dataTextField: "name",
                template: kendo.template($("#project_tree_template").html())
            }).data("kendoTreeView");

            var direction_model = kendo.observable({
                is_edit: false,
                id: 0,
                name: ""
            });
            var $change_direction = $("#change_direction");
            kendo.bind($change_direction, direction_model);
            var direction_validator = $change_direction.kendoValidator(validator_option).data("kendoValidator");
            var $change_direction_window = $("#change_direction_window");

            $project_tree.on("click", ".add_direction", function (e) {
                $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                direction_model.set("is_edit", false);
                direction_model.set("id", 0);
                direction_model.set("name", "");
                $change_direction_window.modal("show");
            });

            $project_tree.on("click", ".edit_direction", function (e) {
                $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                var $this = $(this);
                node = $this.closest(".k-item");
                var uid = node.data("uid"),
                    dataItem = project_tree.dataSource.getByUid(uid);
                direction_model.set("is_edit", true);
                direction_model.set("id", dataItem.id);
                direction_model.set("name", dataItem.name);
                $change_direction_window.modal("show");
            });

            $project_tree.on("click", ".delete_direction", function (e) {
                if (!confirm("Вы уверены, что хотите удалить запись?")) return false;
                var $this = $(this);
                node = $this.closest(".k-item");
                var uid = node.data("uid"),
                    dataItem = project_tree.dataSource.getByUid(uid);
                var send = {
                    id: dataItem.id
                };
                noti({message: MESSAGE.wait}, "wait");
                $.post(PROJECT_TREE_BASE_URL + "direction/destroy/",
                    { item: JSON.stringify(send) },function (data) {
                        noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                        project_tree.remove(node);
                    }, "json").fail(function (data) {
                        noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                    });
                return true;
            });

            $("#direction_save").click(function () {
                if (!direction_validator.validate()) return false;
                var send = {
                    id: direction_model.get("id"),
                    name: direction_model.get("name")
                };
                noti({message: MESSAGE.wait}, "wait");
                if (direction_model.get("is_edit")) {
                    $.post(PROJECT_TREE_BASE_URL + "direction/update/",
                        {item: JSON.stringify(send) },function (data) {
                            noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                            project_tree.text(node, data.name);
                            $change_direction_window.modal("hide");
                        }, "json").fail(function (data) {
                            noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                            $change_direction_window.modal("hide");
                        });
                } else {
                    $.post(PROJECT_TREE_BASE_URL + "direction/create/",
                        {item: JSON.stringify(send) },function (data) {
                            noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                            project_tree.append(
                                {
                                    "id": data.id,
                                    "name": data.name,
                                    "type": "direction",
                                    "has_items": true,
                                    "items": [
                                        {
                                            "id": data.id,
                                            "name": "Добавить проект",
                                            "type": "add_project",
                                            "has_items": false,
                                            "items": []
                                        }
                                    ]
                                }
                            );
                            $change_direction_window.modal("hide");
                        }, "json").fail(function (data) {
                            noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                            $change_direction_window.modal("hide");
                        });
                }
                return false;
            });

            var project_model = kendo.observable({
                is_edit: false,
                id: 0,
                name: "",
                description: "",
                direction: ""
            });
            var $change_project = $("#change_project");
            kendo.bind($change_project, project_model);
            var project_validator = $change_project.kendoValidator(validator_option).data("kendoValidator");
            var $change_project_window = $("#change_project_window");

            $project_tree.on("click", ".add_project", function (e) {
                $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                var $this = $(this);
                node = $this.closest(".k-item");
                var uid = project_tree.parent(node).data("uid"),
                    dataItem = project_tree.dataSource.getByUid(uid);
                project_model.set("is_edit", false);
                project_model.set("id", 0);
                project_model.set("name", "");
                project_model.set("description", "");
                project_model.set("direction", dataItem.id);
                $change_project_window.modal("show");
            });

            $project_tree.on("click", ".edit_project", function (e) {
                $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                var $this = $(this);
                node = $this.closest(".k-item");
                var uid = node.data("uid"),
                    dataItem = project_tree.dataSource.getByUid(uid);
                project_model.set("is_edit", true);
                project_model.set("id", dataItem.id);
                project_model.set("name", dataItem.name);
                var send = {
                    id: dataItem.id
                };
                noti({message: MESSAGE.wait}, "wait");
                $.post(PROJECT_TREE_BASE_URL + "project/get_description/",
                    {item: JSON.stringify(send) },function (data) {
                        noti();
                        project_model.set("direction", data.direction);
                        project_model.set("description", data.description);
                        $change_project_window.modal("show");
                    }, "json").fail(function (data) {
                        noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                    });
            });

            $project_tree.on("click", ".delete_project", function (e) {
                if (!confirm("Вы уверены, что хотите удалить запись?")) return false;
                var $this = $(this);
                node = $this.closest(".k-item");
                var uid = node.data("uid"),
                    dataItem = project_tree.dataSource.getByUid(uid);
                var send = {
                    id: dataItem.id
                };
                noti({message: MESSAGE.wait}, "wait");
                $.post(PROJECT_TREE_BASE_URL + "project/destroy/",
                    { item: JSON.stringify(send) },function (data) {
                        noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                        project_tree.remove(node);
                    }, "json").fail(function (data) {
                        noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                    });
                return true;
            });

            $("#project_save").click(function () {
                if (!project_validator.validate()) return false;
                var send = {
                    id: project_model.get("id"),
                    name: project_model.get("name"),
                    description: project_model.get("description"),
                    direction: project_model.get("direction")
                };
                noti({message: MESSAGE.wait}, "wait");
                if (project_model.get("is_edit")) {
                    $.post(PROJECT_TREE_BASE_URL + "project/update/",
                        {item: JSON.stringify(send) },function (data) {
                            noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                            project_tree.text(node, data.name);
                            $change_project_window.modal("hide");
                        }, "json").fail(function (data) {
                            noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                            $change_project_window.modal("hide");
                        });
                } else {
                    $.post(PROJECT_TREE_BASE_URL + "project/create/",
                        {item: JSON.stringify(send) },function (data) {
                            noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                            project_tree.append(
                                {
                                    "id": data.id,
                                    "name": data.name,
                                    "type": "project",
                                    "has_items": true,
                                    "items": [
                                        {
                                            "id": data.id,
                                            "name": "Добавить НИИ",
                                            "type": "add_nii",
                                            "has_items": false,
                                            "items": []
                                        }
                                    ]
                                }, project_tree.parent(node)
                            );
                            $change_project_window.modal("hide");
                        }, "json").fail(function (data) {
                            noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                            $change_project_window.modal("hide");
                        });
                }
                return false;
            });

            var add_nii_model = kendo.observable({
                is_edit: false,
                nii_list: [],
                selected_nii: null,
                onChange: function () {
                    var val = this.get("selected_nii");
                    if (typeof val !== "number") {
                        this.set("selected_nii", null);
                    }
                    console.log(val);
                }
            });
            var $add_nii = $("#add_nii");
            kendo.bind($add_nii, add_nii_model);
            var add_nii_validator = $add_nii.kendoValidator(validator_option).data("kendoValidator");
            var $add_nii_window = $("#add_nii_window");

            function nii_list_update(data) {
                if (node) {
                    data = typeof data == "undefined" ? null : data;
                    if (data) {
                        $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                        var dataSource = add_nii_model.get("nii_list");
                        dataSource.push(data);
                        add_nii_model.set("nii_list", dataSource);
                        add_nii_model.set("is_edit", false);
                        add_nii_model.set("selected_nii", data.id);
                        $("#add_nii_save").click();
                        return false;
                    }
                    var uid = project_tree.parent(node).data("uid"),
                        dataItem = project_tree.dataSource.getByUid(uid);
                    var send = {
                        id: dataItem.id,
                        project_id: project_tree.dataSource.getByUid(
                            project_tree.parent(node).data("uid")
                        ).id
                    };
                    $.ajax({
                        url: "nii/read/",
                        dataType: "json",
                        type: "POST",
                        data: { item: JSON.stringify(send) },
                        success: function (result) {
                            add_nii_model.set("nii_list", result.nii_list);
                            add_nii_model.set("is_edit", false);
                            add_nii_model.set("selected_nii", null);
                            $add_nii_window.modal("show");
                        },
                        error: function (result) {
                            noti({title: MESSAGE.error + result.status, message: result.statusText}, "error");
                        }
                    });
                }
                return false;
            }

            $project_tree.on("click", ".add_nii", function (e) {
                $(".k-widget.k-tooltip.k-tooltip-validation.k-invalid-msg").hide();
                var $this = $(this);
                node = $this.closest(".k-item");
                nii_list_update();
            });

            $(window).on("nii_update_complete", function (e, data) {
                nii_list_update(data);
            });

            $project_tree.on("click", ".delete_nii", function (e) {
                if (!confirm("Вы уверены, что хотите удалить запись?")) return false;
                var $this = $(this);
                node = $this.closest(".k-item");
                var uid = node.data("uid"),
                    dataItem = project_tree.dataSource.getByUid(uid);
                var send = {
                    id: dataItem.id,
                    project_id: project_tree.dataSource.getByUid(
                        project_tree.parent(node).data("uid")
                    ).id
                };
                noti({message: MESSAGE.wait}, "wait");
                $.post("nii/remove_project/",
                    { item: JSON.stringify(send) },function (data) {
                        noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                        project_tree.remove(node);
                    }, "json").fail(function (data) {
                        noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                    });
                return true;
            });

            $("#add_nii_save").click(function () {
                if (!add_nii_validator.validate()) return false;
                var send = {
                    id: add_nii_model.get("selected_nii"),
                    project_id: project_tree.dataSource.getByUid((node).data("uid")).id
                };
                noti({message: MESSAGE.wait}, "wait");
                if (!add_nii_model.get("is_edit")) {
                    $.post("nii/add_project/",
                        {item: JSON.stringify(send) },function (data) {
                            noti({message: MESSAGE.done}, "done", DONE_TIME_OUT);
                            project_tree.append(
                                {
                                    "id": data.id,
                                    "name": data.name,
                                    "type": "nii",
                                    "has_items": false,
                                    "items": []
                                }, project_tree.parent(node)
                            );
                            $add_nii_window.modal("hide");
                        }, "json").fail(function (data) {
                            noti({title: MESSAGE.error + data.status, message: data.statusText}, "error");
                            $add_nii_window.modal("hide");
                        });
                }
                return false;
            });

            $project_tree.on("click", ".more_nii", function (e) {
                var $this = $(this);
                var id = $this.data("id");
                $(window).trigger('show_nii', id);
            });
        }
    }
})();
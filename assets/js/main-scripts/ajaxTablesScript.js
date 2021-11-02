$(function () {

    var fixHelper = function (e, ui) {
        ui.children().each(function () {
            $(this).width($(this).width());
        });
        return ui;
    };

    var tableToSort = $('.table-sorter');


    // sorting handle
    tableToSort.sortable({
        helper: fixHelper,
        items: '.sortable-item',
        axis: 'y',
        handle: '.table-sort-handle',
        revert: true,
        update: function (event, ui) {
            tableToSort.find(".sortProgress").show();
            tableToSort.find(".sortDone").hide();
            tableToSort.find(".table-sort-handle").removeClass("enabled");
            tableToSort.sortable("disable");
            $.ajax({
                url: tableToSort.data("update"),
                method: 'PUT',
                beforeSend: function (request) {
                    request.setRequestHeader("X-CSRF-Token", tableToSort.data("csfr"));
                },

                contentType: 'application/json',
                processData: false,

                data: JSON.stringify({
                    sortData: tableToSort.sortable("toArray")
                }),

                success: function (msg) {
                    if (msg.err) {
                        alert(msg.response);
                    }
                },
                error: function (xhr, status, text) {
                    alert(text);
                },
                complete: function (msg) {
                    if (msg.err) {
                        alert(msg.response);
                    }
                    tableToSort.find(".sortProgress").hide();
                    tableToSort.find(".sortDone").show();
                    tableToSort.find(".table-sort-handle").addClass("enabled");
                    tableToSort.sortable("enable");
                }
            });
        }
    }).disableSelection();


    //destroy handle
    $(".deleteObj").click(function (e) {
        e.preventDefault();

        var btn = $(this);

        $(document).avgrund({
            showClose: true,
            showCloseText: '&times;',
            openOnEvent: false,
            onBlurContainer: '.body',
            enableStackAnimation: true,
            template: $(".modal-destroy").html(),
            onLoad: function (elem) {
                document.avgrundAnswer = false;
            },
            onUnload: function (elem) {
                if (document.avgrundAnswer) {
                    // prevent additional clicking ...
                    btn.addClass("disabled");

                    $.ajax({
                        url: btn.data("delete"),
                        method: 'POST',
                        beforeSend: function (request) {
                            request.setRequestHeader("X-CSRF-Token", tableToSort.data("csfr"));
                        },

                        contentType: 'application/json',
                        processData: false,

                        success: function (msg) {
                            if (msg.err) {
                                alert(msg.msg);
                            } else {
                                btn.closest("tr").fadeOut("fast", function () {
                                    $(this).remove();
                                });
                            }
                        },
                        error: function (xhr, status, text) {
                            alert(text);
                        }
                    });
                }
            }
        });
    });


    //clone handle
    $(".cloneObj").click(function (e) {
        e.preventDefault();

        var btn = $(this);

        $(document).avgrund({
            showClose: true,
            showCloseText: '&times;',
            openOnEvent: false,
            onBlurContainer: '.body',
            enableStackAnimation: true,
            template: $(".modal-clone").html(),
            onLoad: function (elem) {
                document.avgrundAnswer = false;
            },
            onUnload: function (elem) {
                if (document.avgrundAnswer) {
                    // Save old icon, put cogs... then when ajax ends put old icon back
                    var oldClass = btn.find("i").attr("class");
                    btn.find("i").attr("class", "fa fa-cog fa-spin");
                    btn.addClass("disabled");

                    $.ajax({
                        url: btn.data("clone"),
                        method: 'POST',
                        data: {cloneToLanguage: document.avgrundAnswer},
                        beforeSend: function (request) {
                            request.setRequestHeader("X-CSRF-Token", tableToSort.data("csfr"));
                        },

                        success: function (msg) {
                            if (msg.err) {
                                alert(msg.response);
                            } else {
                                if (msg.update) {
                                    window.location.reload();
                                }
                            }
                        },
                        complete: function () {
                            btn.removeClass("disabled").find("i").attr("class", oldClass);
                        },
                        error: function (xhr, status, text) {
                            alert(text);
                        }
                    });
                }
            }
        });
    });

    //set active handle

    var switchers = $(".switcherOnOff");
    var settingSwitch = false;

    switchers.on("change", function (e) {
        if (!settingSwitch) {
            var btn = $(this);
            settingSwitch = true;
            switchers.bootstrapToggle('disable');

            $.ajax({
                url: btn.data("setactive"),
                method: 'POST',
                data: {update: btn.prop("checked") ? "update" : ""}, // if was unchecked, this will be true cause everyone need to update... if false only one will be not active
                beforeSend: function (request) {
                    request.setRequestHeader("X-CSRF-Token", tableToSort.data("csfr"));
                },

                success: function (msg) {
                    if (msg.err) {
                        alert(msg.response);
                        btn.bootstrapToggle("off");
                    } else {
                        switchers.bootstrapToggle('enable');
                        switchers.not(btn).bootstrapToggle('off');
                    }
                },
                error: function (xhr, status, text) {
                    btn.prop("checked", false);
                    alert(text);
                },
                complete: function (msg) {
                    switchers.bootstrapToggle('enable');
                    settingSwitch = false;
                    if (msg.err) {
                        alert(msg.response);
                    }
                }
            });

        }
    });

});



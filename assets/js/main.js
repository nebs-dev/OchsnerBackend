$(function () {

    // handy little class to stop propagation, mainly used for bootstrap accordions inside forms
    $(".preventDefault").click(function (e) {
        e.preventDefault();
    });


    $(".charCountTextArea").each(function () {
        var obj = $(this),
            max = obj.attr("maxlength"),
            charCount = obj.parent().find("span.charCount");


        charCount.text(obj.val().length + " / " + max);

        obj.on("keyup", function () {
            charCount.text(obj.val().length + " / " + max);
        });
    });


    // init bootstrap editior to each textarea using it
    $('.bootstrapEditor').each(function () {
        var obj = $(this);
        obj.wysihtml5({
            locale: 'en-US',
            image: false,
            color: false,
            blockquoute: false,
            html: true,
            events: {
                blur: function () {
                    // handle errors because bootstrap validator doesn't support textareas
                    var objForm = $(obj).closest(".form-group");
                    if ($(obj).val() !== "") {
                        objForm.find(".textReady").val("true");
                        objForm.removeClass("has-textarea-error");
                    } else {
                        objForm.find(".textReady").val("");
                        objForm.addClass("has-textarea-error");
                    }
                },
                focus: function () {
                    // just remove red borders when selected...
                    $(obj).closest(".form-group").removeClass("has-textarea-error");
                },
                'change:composer': function () {
                    // if there is text preview, update it on blur...
                    if (obj.hasClass("text-preview-description")) {
                        $(".preview-description").html($(obj).val());
                    }
                }
            }
        });

        // init text to preview if needed
        if (obj.hasClass("text-preview-description") && obj.val().trim() !== "") {
            $(".preview-description").html($(obj).val());
        }

        if (obj.hasClass("disabled")) {
            // disable text area if needed...

            setTimeout(function () {
                // some crazy bug with wysihtml...
                obj.data('wysihtml5').editor.composer.disable();
                obj.data('wysihtml5').toolbar.find("a").addClass("disabled");
            }, 1);
        }
    });

    // add special event for submit button with textareaCheck class to handle textarea errors
    $(".textareaCheck").click(function (e) {
        $(".textReady").each(function () {
            var obj = $(this).closest(".form-group");
            if (!$(this).val()) {
                obj.addClass("has-textarea-error");
            } else {
                obj.removeClass("has-textarea-error");
            }
        });
    });


    // add special event for submit button with dateRangeCheck class to handle dateRange field erors
    $(".dateRangeCheck").click(function (e) {
        $(".dateAndRangePicker[required]").each(function () {
            var obj = $(this).closest(".form-group");
            if (!$(this).val() || $(this).val() === "") {
                obj.addClass("has-textarea-error");
            } else {
                obj.removeClass("has-textarea-error");
            }
        });
    });


    //init select2
    $('.select2').select2();
    $(".selectAll").change(function () {
        var select2 = $(this).parent().parent().find(".select2");

        if ($(this).is(':checked')) {
            select2.children("option").prop("selected", "selected");
            select2.trigger("change");
        } else {
            select2.children("option").removeAttr("selected");
            select2.trigger("change");
        }
    });


    // init date and range pickers
    var dateRangePickers = $('.dateAndRangePicker');
    if (dateRangePickers.length) {
        dateRangePickers.each(function () {

            if ($(this).data("start")) {
                $(this).val(moment($(this).data("start")).format("DD.MM.YYYY. H:mm") + " - " + moment($(this).data("end")).format("DD.MM.YYYY. H:mm"));
            }


            $(this).daterangepicker({
                timePicker: true,
                timePicker12Hour: false,
                timePickerIncrement: 5,
                format: 'DD.MM.YYYY. H:mm'
            }, function (start, end) {
                // fill inputs for database
                this.element.parent().find(".startDate").val(start.toISOString());
                this.element.parent().find(".endDate").val(end.toISOString());
                this.element.parent().closest(".form-group").removeClass("has-textarea-error");
            });
        });
    }


    // init validator on all forms using it
    $(".validateForm").validator();

    // init input mask on all fields using it
    $(".data-mask").inputmask();

    // edit button control
    $(".editButton").click(function (e) {
        e.preventDefault();

        // enable everything disabled
        $(".bootstrapToggle").not(".forceDisable").bootstrapToggle("enable");
        $("textarea").not(".forceDisable").prop("disabled", false);
        $("input:disabled").not(".forceDisable").prop("disabled", false);
        $("select:disabled").not(".forceDisable").prop("disabled", false);
        $(".disabled").not(".forceDisable").removeClass("disabled");

        // enable all croppers
        $(".cropperImage").not(".forceDisable").cropper("enable");
        $(".cropperImage").not(".forceDisable").removeClass("notActive")

        // enable all editors
        var bootstrapTextEditors = $('.bootstrapEditor').not(".forceDisable");
        if (bootstrapTextEditors.length) {
            bootstrapTextEditors.data('wysihtml5').editor.composer.enable();
            bootstrapTextEditors.data('wysihtml5').toolbar.find("a").removeClass("disabled");
        }


        // enable all hidden stuff
        $(".updateDisable").not(".forceDisable").removeClass("hideIt");

        // hide show buttons
        $(this).addClass("hide");
        $(".saveButton").removeClass("hide");
    });


    $(".radio-group-switch").each(function () {
        var grupa = $(this);
        // parent because we have styled radio switches...
        $(this).find(".radio-switch").parent().find("ins").click(function () {
            if (!grupa.hasClass("updateDisable")) {
                grupa.find(".radio-switched").prop("required", false);
                var radioSwitched = $(this).parent().parent().parent().find(".radio-switched");
                radioSwitched.prop("required", true);
            }
        });
    });


    var csvBuffer = "";
    $("#csv-upload").change(function () {
        csvBuffer = "";

        // put csv values to processing
        $("#csv-values").val("processing");

        $(".csvUploadTxt").hide();
        $(".csvProcessingTxt").show();

        // start filereader and load browsed file
        var fileReader = new FileReader();
        var file = this.files[0];
        fileReader.readAsText(file);

        fileReader.onload = function () {
            // completed... put everything to normal
            $(".csvUploadTxt").show();
            $(".csvProcessingTxt").hide();

            // we dont need file value
            $("#csv-upload").val("");

            // get cards from entire file...
            var cardsArray = this.result.match(/^\d{15}$/gm);

            // join everythin as string
            csvBuffer = cardsArray.join(",");

            // show to user how many cards we parsed
            $("#csvStatus").fadeIn().find(".filterCardNo").text(cardsArray.length);

            // put value of to update... so we know that insert to db is needed
            $("#csv-values").val("update");
        }

    });


    $(".csvCheck").click(function (e) {
        if ($("#csv-values").val() == "processing") {
            e.preventDefault();
            alert("CSV parsing is processing!");
        } else {
            if ($("#csv-values").val() != "true") {
                $("#csv-values").val(csvBuffer);
            }
        }
    });

});
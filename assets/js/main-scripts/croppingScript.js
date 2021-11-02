$(function () {
    // if cropping area exists run cropping scripts...
    if ($(".cropingArea").length) {
        // init cropper for every cropper image

        //simple counter which adds randomness to classes
        var counter = 0;

        // placeholder for largest image base64
        var largestImage;

        $(".cropperImage").not(".notActigve").each(function (i, img) {
            $(img).addClass("cropperInstance-" + counter);
            var $img = $(".cropperInstance-" + counter);
            var $form = $img.closest(".cropingArea");

            $img.cropper({
                aspectRatio: ($img.data("devicewidth") || 16) / ($img.data("deviceheight") || 9),
                preview: $img.data("preview") || "",
                zoomable: false,
                // needed if there is going to be more than 1 cropper
                multiple: true,
                // set initial crop to 100% width
                autoCropArea: 1,
                // when someone changes cropper, save value
                dragend: function (e) {
                    $form.find(".devicePic").val($img.data("device") + ":" + $img.cropper("getDataURL", {
                        width: $img.data("devicewidth"),
                        height: $img.data("deviceheight")
                    }, "image/jpeg", 1));
                },
                // when cropper is initialized, save value
                built: function (e) {
                    // if its update or view, set height so cropper dont break
                    if ($img.hasClass("notActive") || $img.hasClass("updateActive")) {
                        $img.parent().attr("style", "height: " + $img[0].naturalHeight + "px !important");

                        // cropper is not active on SHOW view
                        if ($img.hasClass("notActive")) {
                            $img.cropper("disable");
                        }
                        // remove helper class
                        $img.removeClass("updateActive");

                        // if iphone6plus image is set... prepare largest image so we can clone to other devices
                        if ($img.data("device") === "iPhone6plus") {
                            largestImage = $img.cropper("getDataURL", {
                                width: $img.data("devicewidth"),
                                height: $img.data("deviceheight")
                            }, "image/jpeg", 1);
                            $(".reuseLargestPicture").prop("disabled", false);
                        }


                    } else {
                        // its not update so please set value of inputs
                        $form.find(".devicePic").val($img.data("device") + ":" + $img.cropper("getDataURL", {
                            width: $img.data("devicewidth"),
                            height: $img.data("deviceheight")
                        }, "image/jpeg", 1));
                    }
                }
            });

            counter++;
        });


        $(".cropBrowseImage").change(function () {
            var $form = $(this).closest(".cropingArea");
            var $img = $form.find(".cropContainer .cropperImage");
            var $this = $(this);

            //enable largest reuse if this is largest device
            var largest = $this.hasClass("device-iPhone6plus");


            var fileReader = new FileReader(),
                files = this.files,
                file;

            if (!files.length) {
                return;
            }

            file = files[0];

            // check if image is image
            if (/^image\/\w+$/.test(file.type)) {
                fileReader.readAsDataURL(file);

                fileReader.onload = function () {
                    // we must create an image from result of file reader to get some properties like width and height
                    var image = new Image();
                    image.src = this.result;

                    // reset file input, we don't need value... and set hidden imageReady field just to have faster validation
                    $this.val("");

                    image.onload = function (img) {

                        var imageWidth = image.width;
                        var imageHeight = image.height;

                        // check if image is smaller then device width
                        if (imageWidth < $img.data("devicewidth") || imageHeight < $img.data("deviceheight")) {
                            $(".avgrund-data").text($img.data("devicewidth") + "x" + $img.data("deviceheight"));

                            $(document).avgrund({
                                showClose: true,
                                showCloseText: '&times;',
                                openOnEvent: false,
                                onBlurContainer: '.body',
                                enableStackAnimation: true,
                                template: $(".modal-smallImage").html(),
                                onLoad: function (elem) {
                                    document.avgrundAnswer = false;
                                },
                                onUnload: function (elem) {
                                    // user decided to force image upload
                                    if (document.avgrundAnswer) {
                                        loadCroppperImage($form, $img, fileReader.result, file.size, imageWidth, imageHeight, true);
                                        if (largest) {
                                            largestImage = fileReader.result;
                                            $(".reuseLargestPicture").prop("disabled", false);
                                        }
                                    }
                                }
                            });
                        } else {
                            // everything went fine, just load the image inside cropper
                            loadCroppperImage($form, $img, fileReader.result, file.size, imageWidth, imageHeight);
                            if (largest) {
                                largestImage = fileReader.result;
                                $(".reuseLargestPicture").prop("disabled", false);
                            }
                        }
                    };

                };
            } else {
                alert("Please choose an image file.");
            }
        });


        // button for reusing largest picture
        $(".reuseLargestPicture").click(function (e) {
            e.preventDefault();

            var $form = $(this).closest(".cropingArea");
            var $img = $form.find(".cropContainer .cropperImage");
            var overwriteFileInfo = $(".cropperImageInfo.device-iPhone6plus").text() || " ";

            loadCroppperImage($form, $img, largestImage, false, false, false, false, overwriteFileInfo);


        });


        function loadCroppperImage($form, $img, base64, fileSize, imageWidth, imageHeight, forced, overwriteFileInfo) {
            // remove init image (placeholder image)
            $form.find(".cropperInitImage").remove();

            // replace cropper image
            $img.cropper("reset", true).cropper("reset").cropper("replace", base64);

            // set hidden field to ready for validation purposes
            $form.find(".imageReady").val("ready");

            // reset style
            $img.parent().attr("style", "");

            // set status
            if (forced) {
                $form.find(".cropperStatus .cropperSmallImage").show().siblings().hide();
            } else {
                $form.find(".cropperStatus .cropperSet").show().siblings().hide();
            }


            // set inline css to prevent cropper from breaking after container is slided up or down
            $img.parent().attr("style", "height: " + $img.parent().height() + "px !important");


            // set image info field under loaded image
            if (!overwriteFileInfo) {
                $form.find(".cropperImageInfo").text('Image proportions: ' + imageWidth + ' x ' + imageHeight + ' px | Image size: ' + (fileSize / 1024).toFixed(2) + ' kb');
            } else {
                $form.find(".cropperImageInfo").text(overwriteFileInfo);
            }

        }


        // add cropper validation on submit...
        $(".cropperCheck").click(function (e) {
            $(".imageReady").each(function () {
                if (!$(this).val()) {
                    $(this).closest(".cropingArea").find(".cropperError").show().siblings().hide();
                }
            });
        });


        // if input that is previewed exists update text on blur...
        // * on blur update for wysiwyg editor preview is controlled on init of editors...
        var textPreviewInput = $(".text-preview-title");
        if (textPreviewInput.length) {
            textPreviewInput.on("blur", function () {
                $(".preview-title").text($(this).val());
            });
        }

        // for textareas that are not wysiwyg
        var descPreviewInput = $(".updatePreviewDesc");
        $(".preview-populate").text(descPreviewInput.val());
        descPreviewInput.on("keyup", function () {
            $(".preview-description").text($(this).val());
        });


    }
});

// This is the js for the default/index.html view.


var app = function () {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function (a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

     // Enumerates an array.
    var enumerate = function (v) {var k = 0; return v.map(function (e) { e._idx = k++;});};

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.

    };

    self.upload_file = function (event) {
        // Reads the file.
        var input = event.target;
        var file = input.files[0];
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };

    self.add_image = function (get_url) {
        $.post(add_url, {url: encodeURIComponent(get_url)}).done(
            function () {
                
                setTimeout( () => get_images_for(self.vue.login_user_id), 500);
            }
        );
    }

    self.upload_complete = function (get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // var to_add_url = add_url + '&url=' + encodeURIComponent(get_url);
        self.add_image(get_url);
        // console.log(to_add_url);
    };

    self.get_users = function () {
        $.getJSON(init_users_url, function (data) {
            self.vue.users = data;
            console.log(data);
        })
    };

    self.get_current_user = function () {
        $.getJSON(get_current_user,
            function (data) {
                self.vue.login_user_id = data.id;
            }
        )
        console.log("current user is:" + self.vue.login_user_id);
    }

    self.get_user_images = function (event) {
        var name;
        if (event) {
            name = "" + event.target.name;
        }
        get_images_for(name);
    }

    get_images_for = function (name) {
        names = {
            id: name
        }
        $.post(get_user_images, names).done(function (data) {
            self.vue.user_images = data;
            self.vue.user_images.reverse();
        })

        self.get_current_user();
        if (name != self.vue.login_user_id) {
            self.vue.uploadable = false;
        }
        else {
            self.vue.uploadable = true;
        }
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_uploading: false,
            self_page: true, // Leave it to true, so initially you are looking at your own images.
            uploadable: true,
            users: [],
            user_images: [],
            login_user_id: []
        },
        methods: {
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
            upload_file: self.upload_file,
            get_user_images: self.get_user_images
        }

    });

    $("#vue-div").show();


    self.get_current_user();
    self.get_users();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () {
    APP = app();
});

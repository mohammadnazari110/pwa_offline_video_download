$(document).ready(function () {


    /*$('#btnMakeOffline').click(function () {

        jQuery.ajax({
            url: '/v2.mp4',
            cache: false,
            xhr: function () {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'arraybuffer'
                //Upload progress
                xhr.addEventListener('progress', function (e) {
                    if (e.lengthComputable) $('.p > div').css('width', '' + (100 * e.loaded / e.total) + '%');
                });
                return xhr;
            },
            success: function (data) {

                var blob = new Blob([new Uint8Array(data)], {type: 'video/mp4'});
                /!*var url = window.URL || window.webkitURL;
                var blobUrl = url.createObjectURL(blob);
                console.log(blobUrl)
                var v = $('#offlineVideo')
                v.css('display', 'block')
                v.attr('src', blobUrl)*!/


                new PouchDB('sample').destroy().then(function () {


                    var db = new PouchDB('sample');
                    return db.putAttachment('mydoc', 'myfile', blob, 'video/mp4')
                        .then(function () {
                            console.log('Stored file')
                            return db.getAttachment('mydoc', 'myfile');
                        }).then(function (blob) {
                            /!*var url = URL.createObjectURL(blob);
                            document.body.innerHTML += '<div>Filesize: ' + JSON.stringify(Math.floor(blob.size / 1024)) + 'KB, Content-Type: ' + JSON.stringify(blob.type) + "</div>";
                            document.body.innerHTML += '<div>Download link: <a href="' + url + '">' + url + '</div>';*!/

                            /!*var url = window.URL || window.webkitURL;
                            var blobUrl = url.createObjectURL(blob);
                            var v = $('#offlineVideo')
                            v.css('display', 'block')
                            v.attr('src', blobUrl)*!/

                            return db.get('mydoc');
                        }).then(function (doc) {
                            document.body.innerHTML += '<div>PouchDB document looks like this:</div><div><pre>' + JSON.stringify(doc, null, '  ') + '</pre></div>';
                        }).catch(function (err) {
                            console.log(err);
                        });

                });


            },
        });

    });

    $('#btnShowOffline').click(function () {

        var db = new PouchDB('sample');
        db.getAttachment('mydoc', 'myfile').then(function (doc) {

            var url = window.URL || window.webkitURL;
            var blobUrl = url.createObjectURL(doc);
            var v = $('#offlineVideo')
            v.css('display', 'block')
            v.attr('src', blobUrl)


        });

    })*/

    app.init();

})

var videoList = [
    {
        id: 1,
        title: "video 1",
        src: "video/v2.mp4"
    },
    {
        id: 2,
        title: "video 2",
        src: "video/v2.mp4"
    }
]

var app = {
    async init() {
        var self = this;
        await db.init();
        await this.loadVideoList()
        $('#ntbDownloadList').css('display', 'block')
        $('#ntbDownloadList').click(function () {
            self.loadOffline()
        })
        $('#btnBack').click(function () {
            self.backToLsit()
        })

        //this.loadOffline()
    },
    loadVideoList() {
        console.log('load list')
        var videoListUl = $('#videoList');
        videoListUl.empty()

        for (var i = 0; i < videoList.length; i++) {
            var item = '<li>' +
                '<h2>' + videoList[i].title + '</h2>' +
                '<video controls src="' + videoList[i].src + '"></video>' +
                this.getDownloadTool(videoList[i].id) +
                '</li>'
            videoListUl.append(item)
        }

    },
    downloadVideo(id) {

        var video = null;
        for (var i = 0; i < videoList.length; i++)
            if (videoList[i].id == id)
                video = videoList[i]
        if (!video) {
            alert('video invalid')
            return false;
        }

        $.ajax({
            url: video.src,
            cache: false,
            xhr: function () {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'arraybuffer'
                //Upload progress
                xhr.addEventListener('progress', function (e) {
                    if (e.lengthComputable) {
                        console.log((100 * e.loaded / e.total))
                        $('#pb_' + video.id + ' > div').css('width', '' + (100 * e.loaded / e.total) + '%');
                    }
                });
                return xhr;
            },
            success: function (data) {

                //console.log(new Blob([new Uint8Array(data)], {type: 'video/mp4'}))
                // var url = window.URL || window.webkitURL;
                // var blobUrl = url.createObjectURL(new Blob([new Uint8Array(data)], {type: 'video/mp4'}));
                // console.log(blobUrl)

                var videoRow = {
                    "_id": 'video_' + video.id,
                    "title": video.title,
                    "_attachments": {
                        "video.mp4": {
                            "content_type": "video/mp4",
                            "data": new Blob([new Uint8Array(data)], {type: 'video/mp4'})
                        }
                    }
                };
                db.db.put(videoRow).then(function (result) {
                    alert('video success download , can watch in download list')
                }).catch(function (err) {
                    console.log(err);
                });


            },
        });
    },
    getDownloadTool(id) {
        for (var i = 0; i < db.allDocs.length; i++) {
            if (db.allDocs[i].id == 'video_' + id)
                return '<div class="video-control">video there is offline</div>'
        }

        return '<div class="video-control">' +
            '<button class="btn-download" onclick="app.downloadVideo(' + id + ')"><img src="assets/media/icon-download.png"></button>' +
            '<div class="progress-bar" id="pb_' + id + '"><div></div></div>' +
            '</div>';
    },
    async loadOffline() {
        $('.download-manager').css('left','0');
        $('#ntbDownloadList').css('display', 'none')
        $('#btnBack').css('display', 'block')

        console.log('load offline list')
        var videoListUl = $('#videoOfflineList');
        videoListUl.empty()
        for (var i = 0; i < db.allDocs.length; i++) {

            var doc = await db.db.getAttachment(db.allDocs[i].id, 'video.mp4')
            var url = window.URL || window.webkitURL;
            var blobUrl = url.createObjectURL(doc);
            var item = '<li>' +
                '<h2>' + db.allDocs[i].doc.title + '</h2>' +
                '<video controls src="' + blobUrl + '"></video>' +
                '</li>'
            videoListUl.append(item)
        }
    },
    backToLsit(){
        $('.download-manager').css('left','-120vw');
        $('#btnBack').css('display', 'none')
        $('#ntbDownloadList').css('display', 'block')
        this.loadVideoList()
    }
}

var db = {
    db: null,
    allDocs: [],
    init() {
        var self = this;
        return new Promise((resolve, reject) => {
            this.db = new PouchDB('video');
            this.db.allDocs({include_docs: true, descending: true}, function (err, doc) {
                self.allDocs = doc.rows;
                resolve()
            });
        })
    },
}

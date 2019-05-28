$(document).ready(function () {
    app.init();
})

var videoList = [
    {
        id: 1,
        title: "step one",
        src: "video/v2.mp4"
    },
    {
        id: 2,
        title: "step two",
        src: "video/v2.mp4"
    },
    {
        id: 3,
        title: "step three",
        src: "video/v2.mp4"
    },
    {
        id: 4,
        title: "step four",
        src: "video/v2.mp4"
    },
    {
        id: 5,
        title: "step five",
        src: "video/v2.mp4"
    }
]

var app = {
    async init() {
        var self = this;
        await db.init();
        await this.loadVideoList()
    },
    loadVideoList() {
        console.log('load list')
        var videoListUl = $('#videoList');
        videoListUl.empty()
        for (var i = 0; i < videoList.length; i++) {
            var item = '<li id="li_' + videoList[i].id + '"></li>'
            videoListUl.append(item)
            this.getDownloadTool(videoList[i])
        }

    },
    async getDownloadTool(item) {
        await db.init();

        for (var i = 0; i < db.allDocs.length; i++) {
            if (db.allDocs[i].id == 'video_' + item.id) {
                var res = '<button class="downloaded" onclick="app.playVideo('+item.id+')">' +
                    '<img src="assets/media/icon-play.png">' +
                    '<span> See Video ' + item.title + '</span>' +
                    '</button>' +
                    '<div class="progress-bar" id="pb_' + item.id + '"><div></div></div>';
                $('#li_' + item.id).html('')
                $('#li_' + item.id).append(res)
                return;
            }
        }

        var res = '<button onclick="app.downloadVideo(' + item.id + ')">' +
            '<img src="assets/media/icon-download.png">' +
            '<span> Download Video ' + item.title + '</span>' +
            '</button>' +
            '<div class="progress-bar" id="pb_' + item.id + '"><div></div></div>';
        $('#li_' + item.id).html('')
        $('#li_' + item.id).append(res)
    },
    downloadVideo(id) {
        var self = this;

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
                    //alert('video success download , can watch in download list')
                    self.getDownloadTool(video)
                }).catch(function (err) {
                    console.log(err);
                });


            },
        });
    },
    async playVideo(id){
        var doc = await db.db.getAttachment('video_'+id, 'video.mp4')
        var url = window.URL || window.webkitURL;
        var blobUrl = url.createObjectURL(doc);
        $('#preview_video').attr('src',blobUrl)
        $('.modal_view').css('display','flex')
        console.log(blobUrl)
    },
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

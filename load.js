window.App = {};

(function(exports){

  function FileSystem(sizeInBytes) {
    var size = sizeInBytes || 5*1024*1024;
    var myFS = null;
    myQueue = [];
    var self = this;

    var errorHandler = function (e) {
      var msg = '';

      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error';
          break;
      }

      console.log('Error: ' + msg);
      return msg;
    };

    var releaseQueue = function() {
      while (myQueue.length) {
        self.loadFile.apply(self, myQueue.shift());
      }
    };

    var onInitFs = function (fs) {
      myFS = fs;
      console.log("Persistent Storage granted.");
      releaseQueue();
    };

    var loadFromURL = function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function() {
        callback(xhr.response);
      };
      xhr.open('GET', url, true);
      xhr.send();
    };

    var downloadFile = function(fileURL, fileLocal, cb, cbErr) {
      loadFromURL(fileURL, function(response) {
        myFS.root.getFile(fileLocal, {create: true}, function(fileEntry) {
          
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function(e) {
              console.log('Write completed.');
              cb(fileEntry);
            };

            fileWriter.onerror = function(e) {
              console.log('Write failed: ' + e.toString());
              cbErr(e);
            };

            fileWriter.write(response);
          }, cbErr);

        }, cbErr);
      });
    };

    self.loadFile = function (fileURL, fileLocal, cb) {
      if (myFS === null) {
        myQueue.push(arguments);
        return;
      }

      // Check the local filesystem first
      myFS.root.getFile(fileLocal, {}, function(fileEntry) {
        console.log("Found file already present in filesystem.");
        cb({success: true, result: fileEntry.toURL()});

      // Not found? Load from URL
      }, function () {
        downloadFile(fileURL, fileLocal, function(fileEntry) {
          console.log("Downloaded and stored file in filesystem.");
          cb({success: true, result: fileEntry.toURL()});         
        }, function(err) {
          cb({success: false, result: errorHandler(err)});
        });
      });
    };


    navigator.webkitPersistentStorage.requestQuota(size, function(grantedBytes) {
      window.requestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler);
    }, function(e) {
      console.log('Error requesting Persistent Storage', e);
    });
  }

  exports.FileSystem = FileSystem;

})(window.App);


window.addEventListener('DOMContentLoaded', function() {
  // var fileURL = "http://fc07.deviantart.net/fs71/f/2013/264/6/a/6ab436b4f571638a8d06667477a635da-d6na2cu.jpg";
  // var fileLocal = "testFile.jpg";

  // var fileURL = "http://fc07.deviantart.net/fs70/i/2013/268/c/f/aquila_d_argento_by_tomedwardsconcepts-d6nsp3j.jpg";
  // var fileLocal = "testFileB.jpg";

  var fileURL = "http://th03.deviantart.net/fs71/PRE/i/2013/269/d/c/secrets_of_morocco_by_inviv0-d6ny63r.jpg";
  var fileLocal = "testFileC.jpg";
  
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

  var img = document.querySelector('img');

  var fs = new App.FileSystem(20*1024*1024);

  fs.loadFile(fileURL, fileLocal, function(response) {
    if (!response.success) {
      console.error("Loading file from " + fileURL + " failed. ", response.result);
    }
    img.src = response.result;
  });
});
This is a **Packaged App for Chrome** that simply downloads an external image file and stores it locally with the **HTML5 FileSystem API**. This file can then be accessed locally when the app is offline, even after a system reboot.

I put this up on GitHub because at this moment I feel there aren't enough Chrome Packaged App examples, and much of the documentation I needed was sparse or outdated.

The image file is retrieved with an XMLHttpRequest where the response type is specified as **blob**. This request will not be stopped by the Chrome Security Policy (CSP) as long as you specify the permission `<all_urls>` in your manifest. The image file is then received as a [Blob object](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

The image file is then stored inside a 20 MB **sandboxed FileSystem**, provided by the **HTML5 FileSystem API**. You can request for any size, but any size over 5 MB requires that you add *unlimitedStorage* in the permissions of the manifest file.

You can pass the Blob object directly into the fileWriter.write() method, to save it as a file in your filesystem with any name of your choosing.

In this example, I created an object named App.FileSystem that has a single public method, *loadFile()*.

```
App.FileSystem.loadFile(fileURL, fileLocal, callback)
```

* **fileURL**: The external URL of the file that you wish to load.
* **fileLocal**: The filename that this file should have in your sandboxed filesystem.
* **callback**: A function to run once you have loaded the file. It gets a single argument, *response*, which has two properties: *success*, a boolean indicating whether the operation was successful (duh!) and *result*, which has the [filesystem URL](http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-filesystemurls) of the file.

This method does the following:

1. Check if this file is already present in the sandboxed filesystem.
2. If not, download the file and then store it in the sandboxed filesystem with the filename indicated.
3. Return the filesystem URL for the file.
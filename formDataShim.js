/**
 * formdata 兼容
 * */
var needsFormDataShim = (function() {
    var bCheck
    = ~navigator.userAgent.indexOf('Android')
    && !~navigator.userAgent.indexOf('Chrome');
    return (
    bCheck && navigator.userAgent.match(/AppleWebKit\/(\d+)/).pop() <= 534
    );
})(),
blobConstruct = !!(function() {
    try {
        return new Blob();
    } catch (e) {}
})(),
XBlob = blobConstruct
    ? window.Blob
    : function(parts, opts) {
        var bb = new (window.BlobBuilder
              || window.WebKitBlobBuilder
              || window.MSBlobBuilder)();
        parts.forEach(function(p) {
            bb.append(p);
        });
        return bb.getBlob(opts ? opts.type : undefined);
    };
function FormDataShim() {
var o = this,
    parts = [], // Data to be sent
    boundary
        = Array(5).join('-')
        + (+new Date() * (1e16 * Math.random())).toString(32),
    oldSend = XMLHttpRequest.prototype.send;
this.append = function(name, value, filename) {
    parts.push(
        '--'
            + boundary
            + '\r\nContent-Disposition: form-data; name="'
            + name
            + '"'
    );
    if (value instanceof Blob) {
        parts.push(
            '; filename="'
                + (filename || 'blob')
                + '"\r\nContent-Type: '
                + value.type
                + '\r\n\r\n'
        );
        parts.push(value);
    } else {
        parts.push('\r\n\r\n' + value);
    }
    parts.push('\r\n');
};
// Override XHR send()
XMLHttpRequest.prototype.send = function(val) {
    var fr,
        data,
        oXHR = this;
    if (val === o) {
        // 注意不能漏最后的\r\n ,否则有可能服务器解析不到参数.
        parts.push('--' + boundary + '--\r\n');
        data = new XBlob(parts);
        fr = new FileReader();
        fr.onload = function() {
            oldSend.call(oXHR, fr.result);
        };
        fr.onerror = function(err) {
            throw err;
        };
        fr.readAsArrayBuffer(data);
        this.setRequestHeader(
            'Content-Type',
            'multipart/form-data; boundary=' + boundary
        );
        XMLHttpRequest.prototype.send = oldSend;
    } else {
        oldSend.call(this, val);
    }
};
}
function newBlob(data, datatype) {
var out;
try {
    out = new Blob([data], { type: datatype });
} catch (e) {
    window.BlobBuilder = window.BlobBuilder
        || window.WebKitBlobBuilder
        || window.MozBlobBuilder
        || window.MSBlobBuilder;
    if (e.name == 'TypeError' && window.BlobBuilder) {
        var bb = new BlobBuilder();
        bb.append(data.buffer);
        out = bb.getBlob(datatype);
    } else if (e.name == 'InvalidStateError') {
        out = new Blob([data], { type: datatype });
    } else {
    }
}
return out;
}
function dataURLtoBlob(data) {
var tmp = data.split(',');
tmp[1] = tmp[1].replace(/\s/g, '');
var binary = atob(tmp[1]);
var array = [];
for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
}
return new newBlob(new Uint8Array(array), 'image/png');
}
export { needsFormDataShim, FormDataShim, dataURLtoBlob };
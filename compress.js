
/*

    图片压缩器
 * ImageResizer:
 * getImgFromDataSource: 统一处理数据源格式转换
 * getResizeSizeFromImg: 获取图片需要的尺寸
 * drawToCanvas:绘制图片到canvas 进行格式转换
 */
export default {
    ImageResizer: function(opts) {
        var settings = {
            resizeMode: 'auto',
            dataSource: '',
            dataSourceType: 'image',
            maxWidth: 800,
            maxHeight: 800,
            onTmpImgGenerate: function(img) {}
        };
        var appData = {};
        $.extend(settings, opts);
        var innerTools = {
            getResizeSizeFromImg: function(img) {
                var _img_info = {
                    w: $(img)[0].naturalWidth,
                    h: $(img)[0].naturalHeight
                };
                var _resize_info = {
                    w: 0,
                    h: 0
                };
                if (
                    _img_info.w <= settings.maxWidth
                    && _img_info.h <= settings.maxHeight
                ) {
                    return _img_info;
                }
                if (settings.resizeMode == 'auto') {
                    var _percent_scale = parseFloat(_img_info.w / _img_info.h);
                    var _size1 = {
                        w: 0,
                        h: 0
                    };
                    var _size_by_mw = {
                        w: settings.maxWidth,
                        h: parseInt(settings.maxWidth / _percent_scale)
                    };
                    var _size_by_mh = {
                        w: parseInt(settings.maxHeight * _percent_scale),
                        h: settings.maxHeight
                    };
                    if (_size_by_mw.h <= settings.maxHeight) {
                        return _size_by_mw;
                    }
                    if (_size_by_mh.w <= settings.maxWidth) {
                        return _size_by_mh;
                    }
                    return {
                        w: settings.maxWidth,
                        h: settings.maxHeight
                    };
                }
                if (settings.resizeMode == 'width') {
                    if (_img_info.w <= settings.maxWidth) {
                        return _img_info;
                    }
                    var _size_by_mw = {
                        w: settings.maxWidth,
                        h: parseInt(settings.maxWidth / _percent_scale)
                    };
                    return _size_by_mw;
                }
                if (settings.resizeMode == 'height') {
                    if (_img_info.h <= settings.maxHeight) {
                        return _img_info;
                    }
                    var _size_by_mh = {
                        w: parseInt(settings.maxHeight * _percent_scale),
                        h: settings.maxHeight
                    };
                    return _size_by_mh;
                }
            },
            drawToCanvas: function(img, theW, theH, realW, realH, callback) {
                var canvas = document.createElement('canvas');
                // 图片尺寸
                canvas.width = theW;
                canvas.height = theH;
                // 图片质量
                var quality = 0.3;
                var ctx = canvas.getContext('2d');
                // theW theH 是原图片宽高 按比例拉伸
                ctx.drawImage(img, 0, 0, realW, realH, 0, 0, theW, theH);
                var base64str = canvas.toDataURL('image/png', quality);
                if (callback) {
                    callback(base64str, canvas);
                }
            }
        };
        var promise = new Promise(function(resolve, reject) {
            var img1 = new Image();
            img1.src = settings.dataSource;
            img1.onload = function() {
                const _tmp_img = this;
                var __tmpImg = _tmp_img;
                settings.onTmpImgGenerate(_tmp_img);
                var _limitSizeInfo = innerTools.getResizeSizeFromImg(__tmpImg);
                var _img_info = {
                    w: $(__tmpImg)[0].naturalWidth,
                    h: $(__tmpImg)[0].naturalHeight
                };
                innerTools.drawToCanvas(
                    __tmpImg,
                    _limitSizeInfo.w,
                    _limitSizeInfo.h,
                    _img_info.w,
                    _img_info.h,
                    function(base64str, canvas) {
                        // 图片处理完成
                        resolve(base64str);
                    }
                );
            };
        });
        return promise;
    }
};

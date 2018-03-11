<template>
    <input type="file" :accept="accept"   :id="componentId" @change="onFileChange" multiple  style="width: 1px;height: 1px; position: fixed; top: -50px">
</template>
<script type="text/ecmascript-6">
    /**
     * @file image-uploader
     *
     */
     
    import imageCompressor from './imageCompressor.js';
    import { needsFormDataShim, FormDataShim, dataURLtoBlob } from './formDataShim.js';
    /**
     * image-uploader xxxxxxx
     * @module image-uploader
     *
     * @property {array} title - 标题
     *
     * @example
     *
     */
    export default {
        props: {
            src: {
                type: String,
                default: ''
            },
            imagesSize: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                componentId: 'fileId'+ (+new Date()),
                images:[],
                dialog:{show:false,content:'hello'},
                accept:'image/jpeg,image/png,image/bmp'
            };
        },
        methods: {
             
            addPic(e){
                let vm = this;
                if(e) {
                    e.preventDefault();
                }
                $('#'+vm.componentId).trigger('click');
            },
            onFileChange(e) {
                let vm = this;
                var files = e.target.files || e.dataTransfer.files;
                if(vm.imagesSize+ files.length>8){
                    alert('最多可传8张图片');
                    $('input[type=file]').val('');
                    e.preventDefault();
                    return;
                }
                if (!files.length) return;
                this.createImage(files);
                // 清除选择历史缓存
                $('#'+vm.componentId).val('');
            },
            createImage(files) {
                let vm = this;
                if (typeof FileReader === 'undefined') {
                    alert('暂不支持该浏览器！');
                    return false;
                }
                let image = new Image();
                let leng=files.length;
                for (var i=0;i<leng;i++) {
                    let imageFile = files[i];
                    if (imageFile.size > 5000000) {
                        alert('请上传小于5MB的图片！');
                    } else {
                        let reader = new FileReader();
                        reader.readAsDataURL(files[i]);
                        reader.onload = function(e){
                            // FormData兼容
                            var formData = needsFormDataShim ? new  FormDataShim : new FormData();
                            var base64Img= needsFormDataShim ? e.target.result.replace('data:base64','data:image/png;base64'):e.target.result;
                            // 压缩图片
                            let imageDup = imageCompressor.ImageResizer({dataSource:base64Img,dataSourceType:"base64"});
                            imageDup.then(function(imgBase64){
                                // 压缩后图片必须小于原始图片
                                if(base64Img.length<=imgBase64.length){
                                    imgBase64 =base64Img;
                                }
                                try { var blob = dataURLtoBlob(imgBase64);
                                    formData.append("filekey",blob, imageFile['name']);
                                }catch(e2) {  }
                                // var blob =  imageCompressor.dataURLtoBlob2(imgBase64);
                                //  formData.append("filekey",blob, imageFile['name']);
                                if(needsFormDataShim){
                                    var prog = function(e){
                                    }
                                    var load = function(e){
                                    }
                                    var error = function(e){
                                    }
                                    var abort = function(e){
                                    }
                                    var xhr = new XMLHttpRequest();
                                    xhr.upload.addEventListener('progress',prog,false);
                                    xhr.addEventListener('load',load,false);
                                    xhr.addEventListener('error',error,false);
                                    xhr.addEventListener('abort',abort,false);
                                    xhr.onreadystatechange = function(e){
                                        if(e.target.readyState==4 && e.target.status==200){
                                            var res =JSON.parse(e.target.response);
                                            if(!res.errno){
                                                //base64图片信息 e.target.result
                                                let image = {id:parseInt(Math.random()*1000),fileName:res.data.url,src:imgBase64};
                                                // 更新图片数据对象
                                                vm.$emit('addimage',image) ;
                                            }else{
                                                alert(res.errmsg);
                                            }
                                        }
                                    }
                                    xhr.open('POST','topic/uploadfile',true);
                                    xhr.send(formData);
                                }
                                else {
                                    var imageId = parseInt(Math.random()*100000);
                                    // fileName 为空时 展示加载效果
                                    let image = {id:imageId,fileName:'',src:imgBase64};
                                    // 更新图片数据对象
                                    vm.$emit('addimage',image) ;
                                    $.ajax({
                                        type: 'post',
                                        url: "/sns/topic/uploadfile",
                                        data: formData,
                                        dataType: "json",
                                        processData: false,
                                        contentType: false,
                                        success: function(res) {
                                            if(!res.errno){
                                                console.log("b:"+imageId);
                                                //base64图片信息 e.target.result
                                                let image = {id:imageId,fileName:res.data.url,src:imgBase64};
                                                // 更新图片数据对象,如果id已经存在,则更新图片展示
                                                vm.$emit('addimage',image) ;
                                            }else{
                                                alert(res.errmsg);
                                            }
                                        },
                                        error:function(){
                                            alert('上传失败');
                                        }
                                    });
                                }
                            },function(){
                                console.log('失败');
                            });
                        };
                    }
                }
            }
        },
        components: {
            uiDialog
        },
        created(){
            this.$on('addPic', function(e){
                this.addPic(e);
            });
            this.loadImage();
        },
        ready(){
            let vm = this;
            if(~navigator.userAgent.indexOf('Android') && ~navigator.userAgent.indexOf('MicroMessenger') &&
                    navigator.userAgent.match(/AppleWebKit\/(\d+)/).pop() <= 540){
                vm.accept='image/*';
            }
        }
    }
</script>
<style lang="less" scoped rel="stylesheet/less">
</style>

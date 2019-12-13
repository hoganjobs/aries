<template>
    <div class="login-box dpflex">
        <div class="qr-box" ref="qrCodeUrl"></div>
        <div class="qr-tips1">使用手机扫描登录</div>
        <div class="qr-tips2">网页分身登录需要配合手机使用</div>
    </div>
</template>

<script>
    import * as API from '../api/api';
    import * as UTILS from '../api/utils';
    import Watermark from '../api/watermark'
    import QRCode from 'qrcodejs2'
    import {getStore} from "../api/utils";

    export default {
        name: "Login",
        methods: {
            getLoginQrcode() {
                var _ = this;
                var params = {
                    twin_type: 'web'
                }
                var last_user_info = getStore('last_user_info');
                if(last_user_info) {
                    params.last_twin_name = last_user_info.twin_name;
                    params.last_twin_id = last_user_info.twin_id;
                    params.last_username = last_user_info.user_name;
                }
                API.getLoginQrcode(params).then(function (res) {
                    if (res.data.result) {
                        window.console.log(res)
                        _.getLogin(res.data.data.login_uuid)
                        _.creatQrCode(res.data.data.qrcode_url)
                    }
                }).catch(function () {

                })
            },
            getLogin(uuid) {
                var _ = this;
                window.console.log(uuid)
                var params = new URLSearchParams();
                params.append('twin_type', 'web');
                params.append('login_uuid', uuid);

                var has_user_info = this.$store.state.userInfo || null
                var timer;
                clearTimeout(timer);
                API.getLogin(params).then(function (res) {
                    if (res.data.login) {
                        clearTimeout(timer);
                        var twin = res.data.twin
                        _.$store.commit('setUserInfo',twin)
                        UTILS.setStore('userInfo',twin);
                        var userInfo = twin
                        _.$store.commit('setUserInfo', userInfo)
                        Watermark.set(twin.user_name)
                        UTILS.heartbeat();
                        if(userInfo.bind_account && JSON.stringify(userInfo.bind_account) != '{}') {
                            var keys =  Object.keys(userInfo.bind_account)[0]
                            var plat =  userInfo.bind_account[keys]
                            if(JSON.stringify(plat) != '{}') {
                                var currPlat = _.$store.state.currentPlatform;
                                currPlat.user_name = plat.name;
                                currPlat.user_avatar = plat.avatar;
                                currPlat.user_id = plat.user_id;
                                currPlat.is_relation = true;
                                currPlat.platform = keys;
                                UTILS.setStore('currPlat',currPlat)
                                _.$store.commit('changePlatform', currPlat)
                                userInfo.bind_account[keys] = currPlat
                                _.$store.commit('setUserInfo', userInfo)
                                UTILS.setStore('userInfo',userInfo);



                                _.$router.push({
                                    path: '/unfinished',
                                    query: {
                                        id: keys
                                    }
                                })
                            }else {
                                var currentPlatform = _.$store.state.currentPlatform;
                                _.$store.commit('changePlatform', currentPlatform)

                                _.$router.push({
                                    path: '/welcome',
                                    query: {
                                        id: 'autohome'
                                    }
                                })
                            }

                        }else {
                            _.$router.push({
                                path: '/welcome',
                                query: {
                                    id: 'autohome'
                                }
                            })
                        }


                    } else {
                        if(!has_user_info) {
                            timer = setTimeout(function () {
                                _.getLogin(uuid)
                            }, 2000)
                        }
                    }

                }).catch(function () {
                    _.$Message.info(_.GLOBAL.sysErrMsg)
                    if(!has_user_info) {
                        timer = setTimeout(function () {
                            _.getLogin(uuid)
                        }, 2000)
                    }

                })

            },
            getLoginTimer() {

            },
            creatQrCode(url) {
                const qrcode = new QRCode(this.$refs.qrCodeUrl, {
                    text: url,
                    width: 240,
                    height: 240,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
            },
        },
        mounted() {

        },
        created() {
            var userInfo = UTILS.getStore('userInfo')
            if(!userInfo) {
                this.getLoginQrcode()
            }else {

            }
        }
    }
</script>

<style scoped>
    .login-box {
        width: 380px;
        height: 540px;
        background: #FFFFFF;
        border: 1px solid #D8D8D8;
        box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.50);
        border-radius: 4px;
        flex-direction: column;
        align-items: center;
        padding-top: 60px;
    }

    .qr-box {
        width: 240px;
        height: 240px;
        background: #f9f9f9;
        margin-bottom: 30px;
    }

    .qr-tips1 {
        font-family: PingFang-SC-Regular;
        font-size: 22px;
        color: #333333;
        letter-spacing: 0;
        margin-bottom: 24px;

    }

    .qr-tips2 {
        font-family: PingFang-SC-Regular;
        font-size: 14px;
        color: #333333;
        letter-spacing: 0;
    }
</style>

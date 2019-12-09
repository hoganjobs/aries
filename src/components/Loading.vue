<template>
    <div>

        <div class="wrapp">
            <div class="k-ball-holder3">
                <div class="k-ball7a"></div>
                <div class="k-ball7b"></div>
                <div class="k-ball7c"></div>
                <div class="k-ball7d"></div>
            </div>

        </div>
    </div>


</template>

<script>
    export default {
        name: "Loading"
    }
</script>

<style scoped>
    .wrapp {
        width: 140px;
        height: 98px;
        margin: 0 auto 10px;
        padding: 20px 20px 20px;
        border-radius: 5px;
        text-align: center;

        position: relative;
    }
    .k-ball-holder3 {
        margin-left: 22%;
    }

    .k-ball7a {
        border: 0;
        margin: 0;
        width: 16px;
        height: 16px;
        position: absolute;
        border-radius: 50%;
        animation: k-loadingO 2s ease infinite;
        background: #67C23A;
        animation-delay: -1.5s
    }

    .k-ball7b {
        border: 0;
        margin: 0;
        width: 16px;
        height: 16px;
        position: absolute;
        border-radius: 50%;
        animation: k-loadingO 2s ease infinite;
        background: #F56C6C;
        animation-delay: -1s
    }

    .k-ball7c {
        border: 0;
        margin: 0;
        width: 16px;
        height: 16px;
        position: absolute;
        border-radius: 50%;
        animation: k-loadingO 2s ease infinite;
        background: #F19552;
        animation-delay: -0.5s
    }

    .k-ball7d {
        border: 0;
        margin: 0;
        width: 16px;
        height: 16px;
        position: absolute;
        border-radius: 50%;
        animation: k-loadingO 2s ease infinite;
        background: #1989FA
    }

    @keyframes k-loadingO {
        0%, 100% {
            transform: translate(0)
        }
        25% {
            transform: translate(260%)
        }
        50% {
            transform: translate(260%, 260%)
        }
        75% {
            transform: translate(0, 260%)
        }
    }
</style>
